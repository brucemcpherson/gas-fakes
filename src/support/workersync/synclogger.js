import fs from 'node:fs';

const syncOut = (message, level ='', handle = 1) => {
  if (!isQuiet ) fs.writeSync(handle, `[Worker${level}] ${message}\n`);
}
export const syncLog = (message) => {
  syncOut(message + '\n');
};

export const syncInfo = (message) => {
  syncOut (message, ' Info')
};

export const syncWarn = (message) => {
  syncOut (message, ' Warn')
};

export const syncError = (message, error) => {
  // Providing the error object is optional
  const errorMessage = error ? `: ${error?.stack || error}` : '';
  syncOut (message + errorMessage, ' Error', 2)
};

const isQuiet = () => Boolean(process.env.QUIET) || process.env.QUIET === "true"