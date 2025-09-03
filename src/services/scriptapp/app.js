

// fake script app to get oauth token from application default credentials on Apps Script
// first set up and test ADC with required scopes - see https://ramblings.mcpher.com/application-default-credentials-with-google-cloud-and-workspace-apis
// Note that all async type functions have been converted to synch to make it Apps Script like

import { Syncit } from '../../support/syncit.js'
import { Auth } from '../../support/auth.js'
import { Proxies } from '../../support/proxies.js'
import { newFakeBehavior } from './behavior.js'
/**
 * fake ScriptApp.getOAuthToken 
 * @return {string} token
 */
const getOAuthToken = () => {
  if (Auth.isTokenExpired()) {
    const { accessToken, tokenInfo } = Syncit.fxRefreshToken();
    Auth.setAccessToken(accessToken);
    Auth.setTokenInfo(tokenInfo); // This will also update the expiry time
  }
  return Auth.getAccessToken();
}


const limitMode = (mode) => {
  if (mode !== ScriptApp.AuthMode.FULL) {
    throw new Error(`only ${ScriptApp.AuthMode.FULL} is supported as mode for now`)
  }

  return mode
}

/**
 * these have been converted with a sync version
 * @param {ScriptApp.AuthMode} mode mode to check
 * @returns null
 */
const requireAllScopes = (mode) => {
  limitMode(mode)
  return checkScopesMatch(Array.from(Auth.getAuthedScopes().keys()))
}

/**
 * these have been converted with a sync version
 * see https://developers.google.com/apps-script/reference/script/script-app#requireScopes(AuthMode,String)
 * @param {ScriptApp.AuthMode} mode mode to check
 * @param {string[]} required scopes required 
 * @returns null
 */
const requireScopes = (mode, required) => {
  // only supporting FULL for now
  limitMode(mode)
  return checkScopesMatch(required)
}


/**
 * check that all scopes requested have been asked for
 * @param {string[]} required 
 * @returns null
 */
const checkScopesMatch = (required) => {

  const scopes = Auth.getTokenScopes()

  // now we're syncronous all the way
  const tokened = new Set(scopes.split(" "))

  // see which ones are missing
  const missing = required.filter(s => {
    // setting this scope causes gcloud to block
    // seem to manage without them anyway
    const ignores = [
      "https://www.googleapis.com/auth/script.external_request",
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/presentations",
      "https://www.googleapis.com/auth/forms"
    ]
    const hasIgnore = ignores.includes(s)
    if (hasIgnore) {
      console.log('...ignoring requested scope for adc as google blocks it outside apps script' + s)
    }
    // if drive is authorized and drive.readonly is required that's okay too
    // if drive.readonly is authorized and drive is requested thats not
    return !(hasIgnore || tokened.has(s.replace(/\.readonly$/, "")))
  })

  if (missing.length) {
    throw new Error(`These scopes are required but have not been authorized ${missing.join(",")}`)
  }
  return null

}

// This will eventually hold a proxy for ScriptApp
let _app = null


/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "ScriptApp"

if (typeof globalThis[name] === typeof undefined) {

  // initializing auth etc
  Syncit.fxInit()

  const getApp = () => {

    // if it hasn't been intialized yet then do that
    if (!_app) {
      console.log('...activating proxy for', name)
      _app = {
        getOAuthToken,
        requireAllScopes,
        requireScopes,
        getScriptId: Auth.getScriptId,
        AuthMode: {
          FULL: 'FULL'
        },
        __behavior: newFakeBehavior(),
      }


    }
    // this is the actual driveApp we'll return from the proxy
    return _app
  }


  Proxies.registerProxy(name, getApp)

}