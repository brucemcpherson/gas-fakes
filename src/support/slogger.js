/**
 * @fileoverview a logger that can be silenced by an env variable
 * used for all internal gas-fakes logging
 */

import fs from 'node:fs';

const q = process.env.QUIET || false
export const isQuiet =  q.toString().toLowerCase()=== "true";
const isCloudRun = !!process.env.K_SERVICE;

const getTimestamp = () => new Date().toISOString();

const formatRawMessage = (args) => {
  return args.map(arg => {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg);
      } catch (e) {
        return '[Complex Object]';
      }
    }
    return String(arg);
  }).join(' ');
};

const writeLog = (stream, severity, prefix, args) => {
  const message = formatRawMessage(args);
  if (isCloudRun) {
    // Structured logging for Cloud Run
    const entry = {
      severity: severity,
      message: `${prefix}${message}`,
      timestamp: getTimestamp()
    };
    fs.writeSync(stream, JSON.stringify(entry) + '\n');
  } else {
    // Human-readable logging for local use
    fs.writeSync(stream, `${getTimestamp()} ${prefix}${message}\n`);
  }
};

// Monkey-patch console to ensure all logs (including from libraries) are timestamped and synchronized
globalThis.console.log = (...args) => writeLog(1, 'DEFAULT', '', args);
globalThis.console.error = (...args) => writeLog(2, 'ERROR', '[Error] ', args);
globalThis.console.warn = (...args) => writeLog(1, 'WARNING', '[Warn] ', args);
globalThis.console.info = (...args) => writeLog(1, 'INFO', '[Info] ', args);

export const slogger = {
  log: isQuiet ? () => {} : console.log,
  error: console.error,
  warn: console.warn,
  info: isQuiet ? () => {} : console.info
};