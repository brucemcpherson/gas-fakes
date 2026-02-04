import { Auth } from './auth.js'

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