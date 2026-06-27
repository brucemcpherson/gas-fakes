import fs from 'fs';
import path from 'path';
import { workerData } from 'worker_threads';

const { mainScriptPath, funcName, args, isTemplate, templateString, templateProps, env } = workerData;
const control = new Int32Array(workerData.controlBuf);
const dataView = new Uint8Array(workerData.dataBuf);
const textEncoder = new TextEncoder();

// Initialize the Apps Script environment
if (env) {
    Object.assign(process.env, env);
}
globalThis.__gasFakesMainScriptPath = mainScriptPath;
await import('../../../main.js');

// Bootstrap Auth completely via standard initialization
import { Syncit } from '../../support/syncit.js';

// Trigger a fresh authentication flow to ensure Auth.getUserId() and others are populated.
// We specify the platforms from environment or default to google.
const platforms = process.env.GF_PLATFORM_AUTH ? process.env.GF_PLATFORM_AUTH.split(',') : ['google'];
Syncit.fxInit({ platformAuth: platforms });

const CONTROL_INDICES = {
  STATUS: 0,
  DATA_SIZE: 1,
  IS_ERROR: 2
};

async function run() {
  try {


    // Dynamically load the user's module
    const userModule = await import(mainScriptPath);
    
    // Expose all exports to globalThis for legacy patterns
    Object.keys(userModule).forEach(key => {
        globalThis[key] = userModule[key];
    });

    let result;

    if (isTemplate) {
      // Merge userModule exports + template instance properties (e.g. tmpl.content) into eval scope.
      // Template properties take precedence so that e.g. <?!= content ?> resolves correctly.
      // Filter out JS reserved words and invalid identifiers — ES module namespaces may expose
      // keys like 'default' which cannot be used as Function parameter names.
      const JS_RESERVED = new Set(['default','class','return','function','var','let','const',
        'if','else','for','while','do','break','continue','switch','case','new','delete',
        'typeof','instanceof','void','throw','try','catch','finally','import','export',
        'async','await','yield','super','this','debugger','with','in','of','static']);
      const evalScope = { ...userModule, ...(templateProps || {}) };
      const validEntries = Object.entries(evalScope).filter(
        ([k]) => !JS_RESERVED.has(k) && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k)
      );
      const scopeKeys = validEntries.map(([k]) => k);
      const scopeVals = validEntries.map(([, v]) => v);

      const htmlEscape = (s) => String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

      // GAS scriptlet types:
      //   <?  code ?>        — execute, no output (supports control flow: if/else/for/})
      //   <?= expr ?>        — HTML-escaped output
      //   <?!= expr ?>       — raw/unescaped output
      //
      // Compile the entire template into ONE function so that control-flow scriptlets
      // like <? if (x) { ?> ... <? } ?> share a single execution context.
      {
        const SCRIPTLET_RE = /<\?(!=?|=)?\s*([\s\S]+?)\s*\?>/g;
        let code = 'let _out = "";\n';
        let lastIndex = 0;
        let m;
        SCRIPTLET_RE.lastIndex = 0;
        while ((m = SCRIPTLET_RE.exec(templateString)) !== null) {
          const before = templateString.slice(lastIndex, m.index);
          if (before) code += `_out += ${JSON.stringify(before)};\n`;
          const sigil = m[1], expr = m[2];
          if (!sigil) {
            code += `${expr}\n`;
          } else if (sigil === '=') {
            code += `_out += _he(${expr});\n`;
          } else {
            code += `{ let _rv=(${expr}); _out += (_rv&&typeof _rv.getContent==='function')?_rv.getContent():(typeof _rv!=='undefined'?String(_rv):''); }\n`;
          }
          lastIndex = m.index + m[0].length;
        }
        const tail = templateString.slice(lastIndex);
        if (tail) code += `_out += ${JSON.stringify(tail)};\n`;
        code += 'return _out;';
        try {
          result = new Function('_he', ...scopeKeys, code)(htmlEscape, ...scopeVals);
        } catch (e) {
          console.error('gas-fakes template compilation error:', e.message);
          result = templateString;
        }
      }
    } else {
      // Run function
      const func = userModule[funcName] || globalThis[funcName];
      if (typeof func !== 'function') {
        throw new Error(`google.script.run: function "${funcName}" is not defined.`);
      }

      // Re-hydrate doPost event object
      if (funcName === 'doPost' && args && args[0] && args[0].postData) {
         args[0].postData.getDataAsString = function() { return this.contents; };
      }

      const rawResult = await func(...(args || []));
      
      // Serialize output if it's a FakeHtmlOutput or FakeTextOutput
      if (rawResult && typeof rawResult.getContent === 'function') {
        result = {
          __isHtmlOutput: !!rawResult.__isHtmlOutput,
          __isTextOutput: !!rawResult.__isTextOutput,
          __framingType: rawResult.__framingType || null,
          content: rawResult.getContent(),
          title: typeof rawResult.getTitle === 'function' ? rawResult.getTitle() : '',
          width: typeof rawResult.getWidth === 'function' ? rawResult.getWidth() : null,
          height: typeof rawResult.getHeight === 'function' ? rawResult.getHeight() : null,
          mimeType: typeof rawResult.getMimeType === 'function' ? rawResult.getMimeType() : null
        };
      } else {
        result = typeof rawResult === 'undefined' ? undefined : JSON.parse(JSON.stringify(rawResult));
      }
    }

    writeResult(result);
  } catch (error) {
    console.error('[gas-fakes worker error]', error);
    writeError(error);
  } finally {
    Atomics.store(control, CONTROL_INDICES.STATUS, 0);
    Atomics.notify(control, 0);
  }
}

function writeResult(result) {
  const resultString = JSON.stringify(result === undefined ? null : result);
  const encodedResult = textEncoder.encode(resultString);

  if (encodedResult.length > dataView.buffer.byteLength) {
    throw new Error('Result exceeds shared buffer size');
  }

  dataView.set(encodedResult);
  Atomics.store(control, CONTROL_INDICES.DATA_SIZE, encodedResult.length);
  Atomics.store(control, CONTROL_INDICES.IS_ERROR, 0);
}

function writeError(error) {
  const message = error?.message || (typeof error === 'string' ? error : JSON.stringify(error) || 'Unknown error');
  const stack = error?.stack || new Error().stack;
  console.error('[gas-fakes worker error details]:', message, stack);
  const errorString = JSON.stringify({ message, stack });
  const encodedError = textEncoder.encode(errorString);
  
  dataView.set(encodedError);
  Atomics.store(control, CONTROL_INDICES.DATA_SIZE, encodedError.length);
  Atomics.store(control, CONTROL_INDICES.IS_ERROR, 1);
}

run();
