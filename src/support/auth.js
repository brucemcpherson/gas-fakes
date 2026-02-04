import { GoogleAuth, JWT, Impersonated, OAuth2Client } from "google-auth-library";
import is from "@sindresorhus/is";
import { createHash } from "node:crypto";
import { syncLog, syncError } from "./workersync/synclogger.js";
import fs from "node:fs";

const _authScopes = new Set([]);

// all this stuff gets populated by the initial synced fxInit
let _auth = null;
let _projectId = null;
let _accessToken = null;
let _tokenExpiresAt = null;
let _manifest = null;
let _clasp = null;
let _activeUser = null;
let _effectiveUser = null;
let _tokenScopes = null;


let _settings = null;
const getActiveUser = () => _activeUser
const getEffectiveUser = () => _effectiveUser
const setActiveUser = (user) => (_activeUser = user);
const setEffectiveUser = (user) => (_effectiveUser = user)
const setManifest = (manifest) => (_manifest = manifest);
const setClasp = (clasp) => (_clasp = clasp);
const getManifest = () => _manifest;
const getClasp = () => _clasp;
const getSettings = () => _settings;
const getScriptId = () => getSettings().scriptId;
const getDocumentId = () => getSettings().documentId;
const setProjectId = (projectId) => (_projectId = projectId);
const setAccessToken = (accessToken) => (_accessToken = accessToken);
const setSettings = (settings) => (_settings = settings);
const getCachePath = () => getSettings().cache;
const getPropertiesPath = () => getSettings().properties;


const getTimeZone = () => getManifest().timeZone;
const getUserId = () => getEffectiveUser().id;
const setTokenScopes = (scopes) => (_tokenScopes = Array.isArray(scopes) ? scopes.join(" ") : scopes);
const getTokenScopes = () => {
  if (_tokenScopes) return _tokenScopes;
  // If not cached, we have to return the promise (which might break synchronous callers like ScriptApp)
  return getAccessTokenInfo().then(info => {
    _tokenScopes = info.tokenInfo.scope;
    return _tokenScopes;
  });
};
const getHashedUserId = () =>
  createHash("md5")
    .update(getUserId() + "hud")
    .digest()
    .toString("hex");

const _getTokenInfo = async (client) => {
  const tokenResponse = await client.getAccessToken();
  const token = tokenResponse.token;
  const tokenInfo = await client.getTokenInfo(token);
  return {
    tokenInfo,
    token
  }
}
// this is the effective user's token info
// - In DWD: The impersonated user (the one we are acting as)
// - In ADC: The actual signed-in user
const getAccessTokenInfo = async () => {
  if (!hasAuth()) throw `auth isnt set yet`;
  return _getTokenInfo(_authClient);
}

// this is the active identity's token info
// - In DWD: The service account itself
// - In ADC: Same as the effective user
const getSourceAccessTokenInfo = async () => {
  if (!_sourceClient) throw `source auth isnt set yet`;
  return _getTokenInfo(_sourceClient);
}


// this is the access token allowed to do the work - the one for the effective user
// - In DWD: The impersonated user
// - In ADC: The actual signed-in user
const getAccessToken = async () => {
  if (!hasAuth()) throw `auth isnt set yet`;
  return (await getAccessTokenInfo()).token;
}


const isTokenExpired = () =>
  !_accessToken || !_tokenExpiresAt || Date.now() >= _tokenExpiresAt;

// the auth client is the one that has the scopes to do the work 
// under adc, this is the source client
// under service account, this is the impersonated client
let _authClient = null;
let _sourceClient = null;
const getAuthClient = () => _authClient;
const getSourceClient = () => _sourceClient;


// We'll support ADC, or workload identity
// and the service account must be allowed to impersonate the user
const setAuth = async (scopes = [], mcpLoading = false) => {
  const mayLog = mcpLoading ? () => null : syncLog;
  mayLog(`...initializing auth`)

  try {
    _auth = new GoogleAuth()
    _projectId = await _auth.getProjectId()
    mayLog(`...discovered project ID: ${_projectId}`)

    // steering for auth type
    // 1. if AUTH_TYPE is DWD, use DWD
    // 2. if AUTH_TYPE is ADC, use ADC
    // 3. if AUTH_TYPE is not set, use DWD if saName is present, else ADC
    const saName = process.env.GOOGLE_SERVICE_ACCOUNT_NAME
    const authType = process.env.AUTH_TYPE?.toLowerCase() || 'dwd'
    const useDwd = authType === 'dwd' || (authType !== 'adc' && saName)

    if (!useDwd) {
      mayLog(`...using ADC`)
      _authClient = await _auth.getClient({
        scopes
      })
      _sourceClient = _authClient
    } else {
      mayLog(`...using service account: ${saName}`)
      const targetPrincipal = `${saName}@${_projectId}.iam.gserviceaccount.com`
      mayLog(`...attempting to use service account: ${targetPrincipal}`)

      /// _sourceClient is the identity of the person/thing running the code
      // we'll try to get the openid and email scopes for the source client too if they are in the manifest
      const sourceScopes = scopes.filter(s => s === 'openid' || s === 'https://www.googleapis.com/auth/userinfo.email')
      _sourceClient = await _auth.getClient(sourceScopes.length > 0 ? { scopes: sourceScopes } : {})

      // now to get who the real user is
      const { tokenInfo: userInfo } = await getSourceAccessTokenInfo()
      mayLog(`...user verified as: ${userInfo.email}`);

      // DWD Subject priority:
      // 1. GOOGLE_WORKSPACE_SUBJECT
      // 2. Caller identity (from getSourceAccessTokenInfo)
      const saEmail = targetPrincipal
      const userEmail = process.env.GOOGLE_WORKSPACE_SUBJECT || userInfo.email

      const dwdClient = new OAuth2Client()
      dwdClient._token = null
      dwdClient._expiresAt = 0

      dwdClient.getAccessToken = async function () {
        if (this._token && Date.now() < this._expiresAt - 60000) {
          return { token: this._token }
        }

        const iat = Math.floor(Date.now() / 1000)
        const exp = iat + 3600
        const payload = {
          iss: saEmail,
          sub: userEmail,
          aud: "https://oauth2.googleapis.com/token",
          iat,
          exp,
          scope: scopes.join(' ')
        }

        //mayLog(`[Auth] DWD Scopes: ${payload.scope}`)

        // Sign the JWT via IAM API
        // Note: The caller must have 'Service Account Token Creator' role on the target SA
        const signUrl = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${saEmail}:signJwt`
        const signResponse = await _sourceClient.request({
          url: signUrl,
          method: 'POST',
          data: {
            payload: JSON.stringify(payload)
          }
        })

        const { signedJwt } = signResponse.data

        // Exchange JWT for access token
        const tokenUrl = "https://oauth2.googleapis.com/token"
        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: signedJwt
          })
        })

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text()
          throw new Error(`Failed to exchange JWT for token: ${errorText}`)
        }

        const tokenData = await tokenResponse.json()
        this._token = tokenData.access_token
        this._expiresAt = Date.now() + (tokenData.expires_in * 1000)
        this.credentials = { access_token: this._token, expiry_date: this._expiresAt }

        return { token: this._token }
      }

      // override request to ensure we use our token but leverage the existing transporter
      const originalRequest = dwdClient.request.bind(dwdClient)
      dwdClient.request = async function (options) {
        // Ensure token is fresh
        await this.getAccessToken()
        return originalRequest(options)
      }

      _authClient = dwdClient
      _authClient.targetPrincipal = saEmail
      _authClient.invalidateToken = function () {
        this._token = null
        this._expiresAt = 0
        this.credentials = null
      }

      mayLog(`...using Domain-Wide Delegation for user: ${userEmail}`)

      // check we can get an access token - this will trigger the signJwt flow
      const { tokenInfo } = await getAccessTokenInfo()
      mayLog(`...sa (acting as user) verified as: ${tokenInfo.email}`);
    }


  } catch (error) {
    mayLog(`...auth failed - check you are logged in with 'gcloud auth login' and have enabled workload identity: ${error}`)
    throw error
  }
  return getAuth()
}

/**
 * force a token refresh on next request
 */
const invalidateToken = () => {
  if (hasAuth()) {
    const client = getAuthClient();
    if (client.invalidateToken) {
      client.invalidateToken();
    } else {
      client.credentials = null;
    }
  }
}
/**
 * we'll be using adc credentials so no need for any special auth here
 * the idea here is to keep addign scopes to any auth so we have them all
 * @param {string[]} [scopes=[]] the required scopes will be added to existing scopes already asked for
 * @param {string} [keyFile=null]
 * @param {boolean} [mcpLoading=false] When the MCP server is loading, this value is true. By this, the invalid values can be hidden while the MCP server is loading. This is important for using Google Antigravity.
 * @returns {GoogleAuth.auth}
 */


/**
 * if we're doing a fetch on drive API we need a special header
 */
const googify = (options = {}) => {
  const { headers } = options;

  // no auth, therefore no need
  if (!headers || !hasAuth()) return options;

  // if no authorization, we dont need this either
  if (!Reflect.has(headers, "Authorization")) return options;

  // we'll need the projectID for this
  // note - you must add the x-goog-user-project header, otherwise it'll use some nonexistent project
  // see https://cloud.google.com/docs/authentication/rest#set-billing-project
  // this has been syncified
  const projectId = getProjectId();
  return {
    ...options,
    headers: {
      "x-goog-user-project": projectId,
      ...headers,
    },
  };
};

/**
 * this would have been set up when manifest was imported
 * @returns {string} the project id
 */
const getProjectId = () => {
  if (is.null(_projectId) || is.undefined(_projectId)) {
    throw new Error(
      "Project id not set - this means that the fxInit wasnt run"
    );
  }
  return _projectId;
};

/**
 * @returns {Boolean} checks to see if auth has bee initialized yet
 */
const hasAuth = () => Boolean(_authClient);


/**
 * @returns {import("google-auth-library").AuthClient}
 */
const getAuth = () => {
  if (!hasAuth())
    throw new Error(`auth hasnt been intialized with setAuth yet`);

  // Simply return the client we've already prepared/patched
  return getAuthClient();
};



/**
 * why is this here ?
 * because when we syncit, we import auth for each method and it needs this
 * if it was somewhere else we'd need to import that too.
 * we can't serialize a return object
 * so we just select a few props from it
 * @param {SyncApiResponse} result
 * @returns
 */
export const responseSyncify = (result) => {
  if (!result) {
    return {
      status: 503, // Service Unavailable, a good representation for a worker-level failure
      statusText: "Worker Error: No response object received from API call",
      error: {
        message: "Worker Error: No response object received from API call",
      },
    };
  }
  return {
    status: result.status,
    statusText: result.statusText,
    responseUrl: result.request?.responseURL,
    error: result.data?.error,
  };
};

/**
 * these are the ones that have been so far requested
 * @returns {Set}
 */
const getAuthedScopes = () => _authScopes;

export const Auth = {
  getAuth,
  hasAuth,
  getProjectId,
  setAuth,
  getAuthedScopes,
  googify,
  setProjectId,
  getUserId,
  getAccessToken,
  getTokenScopes,
  getScriptId,
  getDocumentId,
  setSettings,
  getCachePath,
  getPropertiesPath,
  getHashedUserId,
  setManifest,
  setClasp,
  getManifest,
  getClasp,
  getTimeZone,
  setAccessToken,
  isTokenExpired,
  getAuthClient,
  getSourceClient,
  getAccessTokenInfo,
  getSourceAccessTokenInfo,
  setActiveUser,
  getActiveUser,
  setEffectiveUser,
  getEffectiveUser,
  invalidateToken,
  setTokenScopes
};
