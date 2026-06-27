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
      //   <?  code ?>        — execute, no output
      //   <?= expr ?>        — HTML-escaped output
      //   <?!= expr ?>       — raw/unescaped output
      result = templateString.replace(/<\?(!=?|=)?\s*([\s\S]+?)\s*\?>/g, (match, sigil, expression) => {
        const isOutput = sigil === '=' || sigil === '!=';
        const isRaw    = sigil === '!=';
        try {
          if (!isOutput) {
            // Code-only block: execute for side-effects, return nothing
            new Function(...scopeKeys, expression)(...scopeVals);
            return '';
          }
          const func = new Function(...scopeKeys, `return (${expression})`);
          const exprResult = func(...scopeVals);
          const str = (exprResult && typeof exprResult.getContent === 'function')
            ? exprResult.getContent()
            : (typeof exprResult !== 'undefined' ? String(exprResult) : '');
          return isRaw ? str : htmlEscape(str);
        } catch (e) {
          console.error(`gas-fakes template evaluation error for scriptlet '${expression}':`, e.message);
          return match;
        }
      });
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
