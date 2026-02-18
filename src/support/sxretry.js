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
    maxRetries = 9,
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

    const redoCodes = [429, 500, 503, 408, 401];
    const networkErrorCodes = [
      'ETIMEDOUT',
      'ECONNRESET',
      'ENETDOWN',
      'ENETUNREACH',
      'ECONNREFUSED',
      'EPIPE',
      'EAI_AGAIN',
      'EHOSTUNREACH'
    ];
    const status = response?.status || response?.statusCode;

    let retryReason = redoCodes.includes(error?.code) ? error.code :
      redoCodes.includes(status) ? status :
        networkErrorCodes.includes(error?.code) ? error.code :
          networkErrorCodes.includes(error?.cause?.code) ? error.cause.code :
            networkErrorCodes.find(code => error?.message?.includes(code));

    if (!retryReason && status === 403 && (
      error?.message?.toLowerCase().includes('usage limit') ||
      error?.message?.toLowerCase().includes('rate limit') ||
      error?.errors?.some(e => ['rateLimitExceeded', 'userRateLimitExceeded', 'calendarUsageLimitsExceeded'].includes(e.reason))
    )) {
      retryReason = 'Rate Limit';
    }

    if (!retryReason && error?.message?.toLowerCase().includes('no refresh token')) {
      retryReason = 'No Refresh Token';
    }

    const isRetryable = !!retryReason || extraRetryCheck(error, response);
    if (isRetryable && !retryReason) retryReason = 'Extra Check';

    if (isRetryable && i < maxRetries - 1) {
      const isAuthError = error?.code === 401 || status === 401 || retryReason === 'No Refresh Token';
      if (isAuthError) {
        // Only retry auth error once
        if (i > 0) break;
        Auth.invalidateToken();
        syncWarn(`Authentication error (${status || retryReason}) on ${tag}. Invalidated token and retrying immediately...`);
      } else {
        const jitter = Math.floor(Math.random() * 1000);
        const totalDelay = delay + jitter;
        syncWarn(`Retryable error on ${tag} (status: ${status || error?.code}, reason: ${retryReason}). Retrying in ${totalDelay}ms...`);
        await sleep(totalDelay);
        delay *= 2;
      }
      continue;
    }

    if (error) {
      if (isRetryable && i === maxRetries - 1) {
        // We've exhausted retries. Mark the error message to indicate this.
        const msg = `Max retries reached (${maxRetries}) for reason ${retryReason}: ${error.message}`;
        if (!response) {
          response = {
            status: 504,
            statusText: msg,
            data: { error: { message: msg } }
          };
        } else {
          response.data = response.data || {};
          response.data.error = response.data.error || { message: error.message };
          response.data.error.message = `Max retries reached (${maxRetries}) for reason ${retryReason}: ${response.data.error.message}`;
        }
      }

      if (!skipLog(error, response)) {
        syncError(`Failed in ${tag}`, error);
      }
      return { data: error.data || null, response: responseSyncify(response) };
    }

    return { data: response.data, response: responseSyncify(response) };
  }
};
