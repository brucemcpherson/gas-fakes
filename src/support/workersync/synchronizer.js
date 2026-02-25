import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'node:fs';
import { slogger} from '../slogger.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Start: Suppress google-auth-library warnings globally ---
// A regex to match either of the Google Auth deprecation warnings.
const googleAuthWarningRegex = /The `from(Stream|JSON)` method is deprecated/;

// Monkey-patch the main process's write methods to filter output.
const patchStream = (stream) => {
  const originalWrite = stream.write;
  stream.write = (chunk, encoding, callback) => {
    const message = typeof chunk === 'string' ? chunk : chunk.toString();
    if (googleAuthWarningRegex.test(message)) {
      // If it's a warning we want to suppress, do nothing.
      return true;
    }
    // Otherwise, call the original write method.
    return originalWrite.apply(stream, [chunk, encoding, callback]);
  };
};

patchStream(process.stdout);
patchStream(process.stderr);
// --- End: Suppress google-auth-library warnings ---

// Define indices for the control buffer to avoid magic numbers.
const CONTROL_INDICES = {
  STATUS: 0,      // 0: free, 1: busy, 2: worker_init
  DATA_SIZE: 1,   // Size of the result data in bytes
  IS_ERROR: 2,    // 0: success, 1: error
  RESULT_TYPE: 3, // 0: buffer, 1: file
};

// Shared buffer for control signals
// [0]: status lock (0: free, 1: busy, 2: worker_init)
// [1]: result data size in bytes
// [2]: error flag (0: success, 1: error)
// [3]: result type (0: buffer, 1: file)
const controlBuf = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * Object.keys(CONTROL_INDICES).length);
const control = new Int32Array(controlBuf);

// Shared buffer for data transfer (e.g., 16MB)
const dataBuf = new SharedArrayBuffer(16 * 1024 * 1024);
const dataView = new Uint8Array(dataBuf);

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// The single, long-lived worker
const worker = new Worker(path.resolve(__dirname, 'worker.js'));

// Pipe worker's output directly. The patch above will handle filtering.
worker.stdout.pipe(process.stdout);
worker.stderr.pipe(process.stderr);

// It's crucial to listen for errors, otherwise a crash on worker startup
// will cause the main thread to hang indefinitely on Atomics.wait().
worker.on('error', (error) => {
  console.error('Worker thread encountered a fatal error:', error);
  // Unblock any pending Atomics.wait() call to prevent a deadlock.
  Atomics.store(control, CONTROL_INDICES.STATUS, 0); // Set status to "free"
  Atomics.notify(control, 0);
  // Exit the main process, as the application is in an unrecoverable state.
  process.exit(1);
});

worker.on('exit', (code) => {
   console.error('Worker exited unexpectedly with code:', code);
  // This handles cases where the worker exits unexpectedly.
  if (code !== 0) {
    console.error(`Worker thread stopped with exit code ${code}`);
    Atomics.store(control, CONTROL_INDICES.STATUS, 0); // Unblock main thread
    Atomics.notify(control, 0);
  }
});

// Send the shared buffers to the worker once and wait for it to confirm initialization
Atomics.store(control, CONTROL_INDICES.STATUS, 2); // Set status to "worker_init"
worker.postMessage({ controlBuf, dataBuf });
Atomics.wait(control, CONTROL_INDICES.STATUS, 2); // Wait for worker to set status to "free" (0)

// Allow the main process to exit even if the worker is still running.
worker.unref();

/**
 * Ensures the worker is terminated when the main process exits,
 * whether normally or via signals like Ctrl+C.
 */
function cleanup() {
  slogger.log('...terminating worker thread');
  worker.terminate();
}

// The 'exit' event is for when the process is already shutting down normally.
process.on('exit', cleanup);
// By not listening for 'SIGINT', we allow Node.js to perform its default action,
// which is to exit the process. The 'exit' event will then be fired to clean up the worker.
process.on('SIGTERM', cleanup); // Catches `kill`

/**
 * Calls an async function in the worker and blocks until it returns.
 * This is the replacement for `make-synchronous`.
 * @param {string} method The name of the sx* function to call in the worker.
 * @param  {...any} args Arguments for the function.
 * @returns {any} The result from the async function.
 */
export function callSync(method, ...args) {


  // 1. Set status to "busy". This acts as a lock.
  Atomics.store(control, CONTROL_INDICES.STATUS, 1);

  // 2. Send the task to the worker.
  const platform = globalThis.ScriptApp?.__platform || 'workspace';
  const payload = { method, args, platform };
  worker.postMessage(payload);

  // 3. Block and wait for the worker to finish.
  // It's "busy" (1) until the worker sets it back to "free" (0).
  // This is a true blocking wait, consuming minimal CPU.
  Atomics.wait(control, CONTROL_INDICES.STATUS, 1);

  // 4. Worker is done, result is in the shared buffer.
  const resultSize = Atomics.load(control, CONTROL_INDICES.DATA_SIZE);
  const hasError = Atomics.load(control, CONTROL_INDICES.IS_ERROR) === 1;
  const resultIsFile = Atomics.load(control, CONTROL_INDICES.RESULT_TYPE) === 1;

  if (resultSize > dataBuf.byteLength) {
    throw new Error(
      `Result size (${resultSize}) exceeds shared buffer size (${dataBuf.byteLength}).`
    );
  }

  let resultString;
  if (resultIsFile) {
    // The buffer contains a path to a temporary file.
    const tempFilePathBytes = dataView.slice(0, resultSize);
    const tempFilePath = textDecoder.decode(tempFilePathBytes);
    try {
      resultString = fs.readFileSync(tempFilePath, 'utf-8');
    } finally {
      // Ensure the temporary file is deleted.
      fs.unlinkSync(tempFilePath);
    }
  } else {
    // The buffer contains the result directly.
    const resultBytes = dataView.slice(0, resultSize);
    resultString = textDecoder.decode(resultBytes);
  }

  // Note: JSON.parse can be a bottleneck for very large objects.
  const resultData = JSON.parse(resultString);

  if (hasError) {
    // Re-hydrate the error object on the main thread.
    const err = new Error(resultData.message);
    err.stack = resultData.stack;
    // Copy other properties if they exist.
    Object.assign(err, resultData);
    throw err;
  }

  return resultData;
}