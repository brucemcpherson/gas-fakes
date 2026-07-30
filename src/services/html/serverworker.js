import { Auth } from '../../support/auth.js';
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workerPath = path.join(__dirname, 'consumerworker.js');

const CONTROL_INDICES = {
  STATUS: 0,
  DATA_SIZE: 1,
  IS_ERROR: 2
};

export class ServerWorkerContext {
  constructor(scriptPath = null) {
    this._mainScriptPath = scriptPath || globalThis.__gasFakesMainScriptPath || process.argv[1];
    
    // Fallback for test runners or dynamic imports where process.argv[1] is node itself or undefined
    if (!this._mainScriptPath || this._mainScriptPath.endsWith('node') || this._mainScriptPath.endsWith('gas-fakes.js') || this._mainScriptPath.endsWith('gas-fakes')) {
       const stack = new Error().stack;
       const match = stack.match(/at file:\/\/(.*\.js)/);
       if (match && match[1]) {
           // We want to find the entry point, not this file itself
           const lines = stack.split('\n');
           for (let i = lines.length - 1; i >= 0; i--) {
               const m = lines[i].match(/at (?:async )?file:\/\/(.*\.js)/);
               if (m && m[1] && !m[1].includes('serverworker.js')) {
                   this._mainScriptPath = m[1];
                   break;
               }
           }
       }
    }

    
    // Create shared buffers for synchronous communication
    // 3 control Int32s
    this._controlBuf = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 3);
    this._control = new Int32Array(this._controlBuf);
    
    // 1MB data buffer (should be enough for template substitutions and function returns)
    this._dataBuf = new SharedArrayBuffer(1024 * 1024);
    this._dataView = new Uint8Array(this._dataBuf);
    this._textDecoder = new TextDecoder();
  }

  _executeSyncWorker(workerDataPayload) {
    if (!this._mainScriptPath) {
      throw new Error("Could not determine main script path. Ensure process.argv[1] is set.");
    }

    // Set lock to busy (1)
    Atomics.store(this._control, CONTROL_INDICES.STATUS, 1);

    const worker = new Worker(workerPath, {
      workerData: {
        ...workerDataPayload,
        mainScriptPath: globalThis.__gasFakesMainScriptPath || this._mainScriptPath,
        controlBuf: this._controlBuf,
        dataBuf: this._dataBuf,
        env: { ...process.env, GAS_FAKES_WORKER: 'true' } // Pass current environment and mark as worker
      },
      stdout: true,
      stderr: true
    });

    worker.stdout.pipe(process.stdout);
    worker.stderr.pipe(process.stderr);

    // Handle unexpected worker crashes
    worker.on('error', (err) => {
      console.error("Consumer worker crashed:", err);
      Atomics.store(this._control, CONTROL_INDICES.STATUS, 0);
      Atomics.notify(this._control, 0);
    });
    
    worker.on('exit', (code) => {
      if (code !== 0) {
        Atomics.store(this._control, CONTROL_INDICES.STATUS, 0);
        Atomics.notify(this._control, 0);
      }
    });

    // Block main thread until worker finishes (sets status to 0)
    Atomics.wait(this._control, CONTROL_INDICES.STATUS, 1);

    // Read result
    const hasError = Atomics.load(this._control, CONTROL_INDICES.IS_ERROR) === 1;
    const resultSize = Atomics.load(this._control, CONTROL_INDICES.DATA_SIZE);
    
    const resultBytes = this._dataView.slice(0, resultSize);
    const resultString = this._textDecoder.decode(resultBytes);
    
    const resultData = JSON.parse(resultString);

    if (hasError) {
      // If the error was thrown as a string, its stack will be artificial (generated in writeError)
      // and won't contain the actual message. Let's make sure the message is always visible.
      const errorMsg = resultData.message || 'Unknown error in worker';
      const errorStack = resultData.stack || '';
      
      const err = new Error(errorMsg);
      // Only replace the stack if it contains useful information, otherwise use the standard one
      if (errorStack && !errorStack.startsWith('Error\n    at writeError')) {
        err.stack = errorStack;
      }
      throw err;
    }

    return resultData;
  }

  /**
   * Synchronously evaluates a template string in a fresh consumer instance.
   */
  evaluateTemplate(templateString, templateProps = {}) {
    return this._executeSyncWorker({
      isTemplate: true,
      templateString,
      templateProps
    });
  }

  /**
   * Synchronously executes a function in a fresh consumer instance.
   */
  runFunction(funcName, args) {
    return this._executeSyncWorker({
      isTemplate: false,
      funcName,
      args
    });
  }
}
