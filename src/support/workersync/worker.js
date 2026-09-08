import fsSync from 'node:fs';
const dbg = (msg) => fsSync.appendFileSync('/tmp/worker-debug.log', `${new Date().toISOString()} ${msg}\n`);

// Register these FIRST, before any other imports, so nothing during
// module loading can fail silently.
process.on('uncaughtException', (err) => {
  dbg(`[worker.js] EARLY uncaughtException: ${err?.stack || err}`);
});
process.on('unhandledRejection', (reason) => {
  dbg(`[worker.js] EARLY unhandledRejection: ${reason?.stack || reason}`);
});

dbg('[worker.js] START');
const { parentPort } = await import('worker_threads');
dbg('[worker.js] parentPort loaded');
const { Auth } = await import('../auth.js');
dbg('[worker.js] Auth loaded');
const { default: allSxFunctions } = await import('./sxfunctions.js');
dbg('[worker.js] sxfunctions loaded');
const fs = await import('node:fs/promises');
const os = await import('node:os');
const path = await import('node:path');
dbg('[worker.js] fs/os/path loaded');
const { syncLog, syncError } = await import('./synclogger.js');
dbg('[worker.js] synclogger loaded');

let control;
let dataView;
const textEncoder = new TextEncoder();

// Define indices for the control buffer to match synchronizer.js
const CONTROL_INDICES = {
  STATUS: 0,      // 0: free, 1: busy, 2: worker_init
  DATA_SIZE: 1,   // Size of the result data in bytes
  IS_ERROR: 2,    // 0: success, 1: error
  RESULT_TYPE: 3, // 0: buffer, 1: file
};

/**
 * Writes a result to the shared buffer and sets control flags.
 * @param {*} result The successful result to write.
 */
async function writeResult(result) {
  const resultString = JSON.stringify(result === undefined ? null : result);
  const encodedResult = textEncoder.encode(resultString);

  if (encodedResult.length > dataView.buffer.byteLength) {
    syncLog(`..result is very long ${encodedResult.length} - writing to file to return result`)
    // Result is too large for the buffer, write to a temporary file instead.
    const tempFile = path.join(os.tmpdir(), `gas-fakes-worker-result-${Date.now()}.tmp`);
    await fs.writeFile(tempFile, encodedResult);
    const pathBytes = textEncoder.encode(tempFile);

    // Write the path to the shared buffer
    dataView.set(pathBytes);
    Atomics.store(control, CONTROL_INDICES.DATA_SIZE, pathBytes.length); // data size (of the path)
    Atomics.store(control, CONTROL_INDICES.IS_ERROR, 0); // success flag
    Atomics.store(control, CONTROL_INDICES.RESULT_TYPE, 1); // result type: file
  } else {
    // Result fits in the buffer, write it directly.

    dataView.set(encodedResult);
    Atomics.store(control, CONTROL_INDICES.DATA_SIZE, encodedResult.length); // data size
    Atomics.store(control, CONTROL_INDICES.IS_ERROR, 0); // success flag
    Atomics.store(control, CONTROL_INDICES.RESULT_TYPE, 0); // result type: buffer

  }
}

/**
 * Serializes an error and writes it to the shared buffer.
 * @param {Error} error The error to write.
 */
function writeError(error) {
  let errorObject = {
    message: error.message,
    stack: error.stack,
    name: error.name,
  };

  // If the message is a JSON string (common for API errors that have been caught and re-thrown),
  // try to parse it and merge the properties for better re-hydration on the main thread.
  if (error.message && error.message.startsWith('{') && error.message.endsWith('}')) {
    try {
      const parsedMessage = JSON.parse(error.message);
      errorObject = { ...errorObject, ...parsedMessage };
    } catch (e) {
      // Not valid JSON, keep as is
    }
  }

  const errorString = JSON.stringify(errorObject);
  const encodedError = textEncoder.encode(errorString);

  dataView.set(encodedError);
  Atomics.store(control, CONTROL_INDICES.DATA_SIZE, encodedError.length); // data size
  Atomics.store(control, CONTROL_INDICES.IS_ERROR, 1); // error flag
  Atomics.store(control, CONTROL_INDICES.RESULT_TYPE, 0); // result type: buffer (errors are always small enough)
}

// 1. Receive the shared buffers from the main thread on startup.
parentPort.once('message', (msg) => {
  control = new Int32Array(msg.controlBuf);
  dataView = new Uint8Array(msg.dataBuf);

  // Signal that the worker is ready.
  Atomics.store(control, CONTROL_INDICES.STATUS, 0);
  Atomics.notify(control, 0);
});

/**
 * Catches any error that happens outside the main task processing loop,
 * especially during worker initialization/module loading.
 * @param {Error} error The uncaught error.
 */
const handleUncaughtError = (error) => {
  if (control) {
    syncError('A fatal, unhandled error occurred in the worker.', error);

    // 1. Write the error into the buffer
    writeError(error);

    // 2. Clear status to 0 ("free") so Atomics.wait in main thread unblocks
    Atomics.store(control, CONTROL_INDICES.STATUS, 0);

    // 3. Notify the main thread
    Atomics.notify(control, 0);
  } else {
    console.error('Fatal worker error before control buffer initialization:', error);
  }

  // 4. Terminate worker process
  process.exit(1);
};

process.on('uncaughtException', handleUncaughtError);
process.on('unhandledRejection', handleUnhandledRejection);

// 2. Listen for tasks from the main thread.
parentPort.on('message', async (task) => {
  // Ignore the initial setup message which has no 'method' property.
  if (!task.method) return;

  // Apply any identities passed from the main thread to keep worker in sync
  if (task.identitiesData) {
    for (const [p, data] of Object.entries(task.identitiesData)) {
      Auth.setIdentity(p, data);
    }
  }

  // Sync settings (e.g., documentId)
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

      // sxInit is special: it creates the auth state and returns serializable info.
      result = await asyncFn(...task.args);

    } else {
      // All other sx* functions receive the worker's Auth object as their first argument.

      // CRITICAL: Set platform BEFORE checking auth, as hasAuth() depends on the current platform context.
      if (task.platform) {
        Auth.setPlatform(task.platform);
      }

      // Use hasAuth() instead of getProjectId() to support platforms without project IDs (like KSuite)
      if (!Auth.hasAuth()) {
        throw new Error(`[Worker] Not initialized for platform '${Auth.getPlatform()}'. fxInit must be called first.`);
      }

      result = await asyncFn(Auth, ...task.args);

    }

    await writeResult(result);

  } catch (error) {
    writeError(error);
  } finally {
    // 3. Signal completion and wake up the main thread.
    Atomics.store(control, CONTROL_INDICES.STATUS, 0);
    Atomics.notify(control, 0);
  }
});

function handleUnhandledRejection(reason, promise) {
  handleUncaughtError(reason instanceof Error ? reason : new Error(String(reason)));
}