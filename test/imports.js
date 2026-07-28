/**
 * for my app script test alias any libraries required
 * to emulate node imports
 */
const unitExports = bmUnitTester.Exports
const {is} = bmIs.Exports
const Fiddler = bmFiddler.Fiddler
const newCacheDropin = bmGasFlexCache.newCacheDropin
var getUserIdFromToken = (accessToken) => {
  const tokenInfo = getTokenInfo(accessToken)
  if (typeof tokenInfo.sub !== 'string' || !tokenInfo.sub) {
    throw new Error('failed to get user id from token')
  }
  return tokenInfo.sub
}
const getProjectIdFromToken = () => {
  const tokenInfo = getTokenInfo (ScriptApp.getOAuthToken())
  const clientClientId = tokenInfo.azp || tokenInfo.aud;
  return clientClientId.split('-')[0];
}

const getTokenInfo = (accessToken) => {
  if (typeof accessToken !== 'string' || !accessToken) {
    throw new Error('token is required to getUserIdFromToken')
  }
  const response = UrlFetchApp.fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`)
  if (response.getResponseCode() !== 200) {
    throw new Error('failed to get token info from token:' + response.getResponseCode() + ':' + response.getContentText())
  }
  return JSON.parse(response.getContentText())
}