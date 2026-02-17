import { Auth } from './auth.js'
import { sxRetry } from './sxretry.js'

/**
 * fetch effective user access token
 */
export const sxGetAccessToken = async () => {
  return await Auth.getAccessToken()
}

export const sxGetAccessTokenInfo = async () => {
  return await Auth.getAccessTokenInfo()
}
export const sxGetSourceAccessTokenInfo = async () => {
  return await Auth.getSourceAccessTokenInfo()
}

/**
 * For testing sxRetry logic
 */
export const sxTestRetry = async (Auth, { errorMessage }) => {
  let callCount = 0;
  const mockFunc = async () => {
    callCount++;
    if (callCount === 1) {
      throw new Error(errorMessage);
    }
    return {
      status: 200,
      data: { success: true, callCount }
    };
  };

  return await sxRetry(Auth, 'TestRetry', mockFunc);
};