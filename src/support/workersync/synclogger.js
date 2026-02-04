import fs from 'node:fs';
import { isQuiet } from '../slogger.js';

const isCloudRun = !!process.env.K_SERVICE;
const getTimestamp = () => new Date().toISOString();

const writeSyncLog = (stream, severity, message) => {
  if (isCloudRun) {
    const entry = {
      severity: severity,
      message: message,
      timestamp: getTimestamp()
    };
    fs.writeSync(stream, JSON.stringify(entry) + '\n');
  } else {
    fs.writeSync(stream, `${getTimestamp()} ${message}\n`);
  }
};

export const syncLog = (message) => {
  if (!isQuiet) writeSyncLog(1, 'DEFAULT', `[Worker] ${message}`);
};

export const syncWarn = (message) => {
  writeSyncLog(1, 'WARNING', `[Worker Warn] ${message}`);
};

export const syncInfo = (message) => {
  if (!isQuiet) writeSyncLog(1, 'INFO', `[Worker Info] ${message}`);
};

export const syncError = (message, error) => {
  const errorMessage = error ? `: ${error?.stack || error}` : '';
  writeSyncLog(2, 'ERROR', `[Worker Error] ${message}${errorMessage}`);
};