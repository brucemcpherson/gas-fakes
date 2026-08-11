import { parentPort } from 'worker_threads';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { syncLog, syncError } from './synclogger.js';
import { Auth } from '../auth.js';

let control;
let dataView;
let allSxFunctions = {};
const textEncoder = new TextEncoder();

const CONTROL_INDICES = {
  STATUS: 0,      // 0: free, 1: busy, 2: worker_init
  DATA_SIZE: 1,   // Size of the result data in bytes
  IS_ERROR: 2,    // 0: success, 1: error
  RESULT_TYPE: 3, // 0: buffer, 1: file
};

function writeError(error) {
  if (!control || !dataView) {
    console.error('[Worker Fatal Error before buffer init]:', error);
    return;
  }

  let errorObject = {
    message: error?.message || String(error),
    stack: error?.stack || '',
    name: error?.name || 'Error',
  };

  if (error?.message && error.message.startsWith('{') && error.message.endsWith('}')) {
    try {
      const parsedMessage = JSON.parse(error.message);
      errorObject = { ...errorObject, ...parsedMessage };
    } catch (e) {
      // Keep as-is if invalid JSON
    }
  }

  const errorString = JSON.stringify(errorObject);
  const encodedError = textEncoder.encode(errorString);

  dataView.set(encodedError);
  Atomics.store(control, CONTROL_INDICES.DATA_SIZE, encodedError.length);
  Atomics.store(control, CONTROL_INDICES.IS_ERROR, 1);
  Atomics.store(control, CONTROL_INDICES.RESULT_TYPE, 0);
}

async function writeResult(result) {
  const resultString = JSON.stringify(result === undefined ? null : result);
  const encodedResult = textEncoder.encode(resultString);

  if (encodedResult.length > dataView.buffer.byteLength) {
    syncLog(`..result is very long ${encodedResult.length} - writing to file to return result`);
    const tempFile = path.join(os.tmpdir(), `gas-fakes-worker-result-${Date.now()}.tmp`);
    await fs.writeFile(tempFile, encodedResult);
    const pathBytes = textEncoder.encode(tempFile);

    dataView.set(pathBytes);
    Atomics.store(control, CONTROL_INDICES.DATA_SIZE, pathBytes.length);
    Atomics.store(control, CONTROL_INDICES.IS_ERROR, 0);
    Atomics.store(control, CONTROL_INDICES.RESULT_TYPE, 1);
  } else {
    dataView.set(encodedResult);
    Atomics.store(control, CONTROL_INDICES.DATA_SIZE, encodedResult.length);
    Atomics.store(control, CONTROL_INDICES.IS_ERROR, 0);
    Atomics.store(control, CONTROL_INDICES.RESULT_TYPE, 0);
  }
}

const handleFatalError = (error) => {
  const err = error instanceof Error ? error : new Error(String(error));
  syncError('A fatal error occurred in the worker:', err);

  if (control) {
    writeError(err);
    // CRITICAL: Must store 0 into STATUS to release the lock before notifying
    Atomics.store(control, CONTROL_INDICES.STATUS, 0);
    Atomics.notify(control, 0);
  }
};

process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', (reason) => handleFatalError(reason));

// 1. Receive shared buffers and dynamically load functions
parentPort.once('message', async (msg) => {
  if (!msg.controlBuf || !msg.dataBuf) return;

  control = new Int32Array(msg.controlBuf);
  dataView = new Uint8Array(msg.dataBuf);

  try {
    // Dynamic import inside try/catch so any syntax/runtime errors are forwarded to the main thread
    allSxFunctions = await import('./sxfunctions.js');

    // Signal initialization complete
    Atomics.store(control, CONTROL_INDICES.STATUS, 0);
    Atomics.notify(control, 0);
  } catch (err) {
    handleFatalError(err);
  }
});

// 2. Main task execution listener
parentPort.on('message', async (task) => {
  if (!task.method) return;

  if (task.identitiesData) {
    for (const [p, data] of Object.entries(task.identitiesData)) {
      Auth.setIdentity(p, data);
    }
  }

  if (task.settings) {
    Auth.setSettings(task.settings);
  }

  try {
    const asyncFn = allSxFunctions[task.method];
    if (!asyncFn) {
      throw new Error(`[Worker] Unknown method: ${task.method}`);
    }

    let result;
    if (task.method === 'sxInit') {
      result = await asyncFn(...task.args);
    } else {
      if (task.platform) {
        Auth.setPlatform(task.platform);
      }

      if (!Auth.hasAuth()) {
        throw new Error(`[Worker] Not initialized for platform '${Auth.getPlatform()}'. fxInit must be called first.`);
      }

      result = await asyncFn(Auth, ...task.args);
    }

    await writeResult(result);
  } catch (error) {
    writeError(error);
  } finally {
    Atomics.store(control, CONTROL_INDICES.STATUS, 0);
    Atomics.notify(control, 0);
  }
});