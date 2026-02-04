import { responseSyncify } from './auth.js';
import { syncWarn, syncError } from './workersync/synclogger.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Shared retry logic for worker-based API calls
 * @param {object} Auth the Auth object
 * @param {string} tag for logging
 * @param {function} func the function to execute
 * @param {object} [options] options
 * @param {number} [options.maxRetries=7] max retries
 * @param {number} [options.initialDelay=1777] initial delay
 * @param {function} [options.extraRetryCheck] extra check for retryability
 * @param {function} [options.skipLog] check to skip syncError logging
 * @returns {object} { data, response }
 */
export const sxRetry = async (Auth, tag, func, options = {}) => {
  const {
    maxRetries = 7,
    initialDelay = 1777,
    extraRetryCheck = () => false,
    skipLog = () => false
  } = options;

  let delay = initialDelay;

  for (let i = 0; i < maxRetries; i++) {
    let response;
    let error;

    try {
      response = await func();
    } catch (err) {
      error = err;
      response = err.response;
    }

    const redoCodes = [429, 500, 503, 408, 401]
    const isRetryable = redoCodes.includes(error?.code) ||
      redoCodes.includes(response?.status) ||
      error?.code === 'ETIMEDOUT' ||
      error?.code === 'ECONNRESET' ||
      error?.cause?.code === 'ETIMEDOUT' ||
      error?.cause?.code === 'ECONNRESET' ||
      error?.message?.includes('ETIMEDOUT') ||
      error?.message?.includes('ECONNRESET') ||
      (response?.status === 403 && (
        error?.message?.toLowerCase().includes('usage limit') ||
        error?.message?.toLowerCase().includes('rate limit') ||
        error?.errors?.some(e => ['rateLimitExceeded', 'userRateLimitExceeded', 'calendarUsageLimitsExceeded'].includes(e.reason))
      )) ||
      extraRetryCheck(error, response);

    if (isRetryable && i < maxRetries - 1) {
      const isAuthError = error?.code === 401 || response?.status === 401;
      if (isAuthError) {
        Auth.invalidateToken();
        syncWarn(`Authentication error (401) on ${tag}. Invalidated token and retrying immediately...`);
      } else {
        const jitter = Math.floor(Math.random() * 1000);
        const totalDelay = delay + jitter;
        syncWarn(`Retryable error on ${tag} (status: ${response?.status || error?.code}). Retrying in ${totalDelay}ms...`);
        await sleep(totalDelay);
        delay *= 2;
      }
      continue;
    }

    if (error) {
      if (!skipLog(error, response)) {
        syncError(`Failed in ${tag}`, error);
      }
      return { data: null, response: responseSyncify(response) };
    }

    return { data: response.data, response: responseSyncify(response) };
  }
};
