
import { FakeHtmlOutput } from './htmloutput.js';
import { ServerWorkerContext } from './serverworker.js';

export class FakeHtmlTemplate {
  constructor(content = '') {
    this._content = content;
    
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        return target[prop];
      },
      set: (target, prop, value, receiver) => {
        return Reflect.set(target, prop, value, receiver);
      }
    });
  }

  evaluate() {
    // Collect all non-private, non-function template properties (e.g. tmpl.content = html)
    const templateProps = {};
    for (const key of Object.keys(this)) {
      if (!key.startsWith('_') && typeof this[key] !== 'function') {
        templateProps[key] = this[key];
      }
    }

    let evaluatedContent = this._content;
    try {
      const ctx = new ServerWorkerContext();
      const workerResult = ctx.evaluateTemplate(this._content, templateProps);
      if (workerResult) evaluatedContent = workerResult;
    } catch (e) {
      console.error(e);
      throw e;
    }

    return new FakeHtmlOutput(evaluatedContent);
  }

  getRawContent() {
    return this._content;
  }

  getCode() {
    return `// Compiled template\n(function() { let output = ""; ${this._content.split('\n').map(line => `output += ${JSON.stringify(line)} + "\\n";`).join('\n')} return output; })()`;
  }

  getCodeWithComments() {
    return `// Compiled template with comments\n(function() { let output = ""; ${this._content.split('\n').map(line => `// ${line}\noutput += ${JSON.stringify(line)} + "\\n";`).join('\n')} return output; })()`;
  }
}


