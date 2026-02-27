import { GoogleAuth, JWT, Impersonated, OAuth2Client } from "google-auth-library";
import is from "@sindresorhus/is";
import { createHash } from "node:crypto";
import { syncLog, syncError } from "./workersync/synclogger.js";

// Multi-identity storage
const _identities = new Map();
// Default to the first authorized platform if specified in environment
let _platform = process.env.GF_PLATFORM_AUTH ? process.env.GF_PLATFORM_AUTH.split(',')[0] : 'workspace';
let _manifest = null;
let _clasp = null;
let _settings = null;

// Initialize default workspace identity structure
const createIdentityTemplate = () => ({
  activeUser: null,
  effectiveUser: null,
  accessToken: null,
  tokenExpiresAt: null,
  tokenScopes: null,
  authClient: null,
  sourceClient: null,
  projectId: null,
  auth: null,
  authMethod: null // To track 'adc' or 'dwd'
});

// Helper to get current identity
const _getIdentity = (platform = _platform) => {
  const p = platform === 'workspace' ? 'google' : platform;
  if (!_identities.has(p)) {
    _identities.set(p, createIdentityTemplate());
  }
  return _identities.get(p);
};

const getActiveUser = () => _getIdentity().activeUser;
const getEffectiveUser = () => _getIdentity().effectiveUser;
const setActiveUser = (user, platform = _platform) => (_getIdentity(platform).activeUser = user);
const setEffectiveUser = (user, platform = _platform) => (_getIdentity(platform).effectiveUser = user);

const setManifest = (manifest) => (_manifest = manifest);
const setClasp = (clasp) => (_clasp = clasp);
const getManifest = () => _manifest;
const getClasp = () => _clasp;
const getSettings = () => _settings;
const getScriptId = () => getSettings()?.scriptId;
const getDocumentId = () => getSettings()?.documentId;

const setProjectId = (projectId, platform = _platform) => (_getIdentity(platform).projectId = projectId);
const setAccessToken = (accessToken, platform = _platform) => (_getIdentity(platform).accessToken = accessToken);
const setSettings = (settings) => (_settings = settings);
const getCachePath = () => getSettings()?.cache;
const getPropertiesPath = () => getSettings()?.properties;
const setPlatform = (platform) => {
  _platform = platform;
};
const getPlatform = () => _platform;

const getTimeZone = () => getManifest()?.timeZone;
const getUserId = () => getEffectiveUser()?.id;

const setTokenScopes = (scopes, platform = _platform) => {
  _getIdentity(platform).tokenScopes = Array.isArray(scopes) ? scopes.join(" ") : scopes;
};

const getTokenScopes = () => {
  const id = _getIdentity();
  if (id.tokenScopes) return id.tokenScopes;
  if (_platform === 'ksuite') return ""; // KSuite doesn't use standard OAuth scopes in same way
  
  // Google fallback
  return getAccessTokenInfo().then(info => {
    id.tokenScopes = info.tokenInfo.scope;
    return id.tokenScopes;
  });
};

const getHashedUserId = () =>
  createHash("md5")
    .update((getUserId() || "unknown") + "hud")
    .digest()
    .toString("hex");

const _getTokenInfo = async (client) => {
  const tokenResponse = await client.getAccessToken();
  const token = tokenResponse.token;
  
  let tokenInfo;
  if (typeof client.getTokenInfo === 'function') {
    tokenInfo = await client.getTokenInfo(token);
  } else {
    const response = await client.request({
      url: `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`,
      method: 'GET'
    });
    tokenInfo = response.data;
    
    if (!tokenInfo.email && process.env.GOOGLE_WORKSPACE_SUBJECT) {
      tokenInfo.email = process.env.GOOGLE_WORKSPACE_SUBJECT;
    }
  }
  
  return {
    tokenInfo,
    token
  }
}

const getAccessTokenInfo = async () => {
  const id = _getIdentity();
  if (id.authClient) return _getTokenInfo(id.authClient);
  if (_platform === 'ksuite') {
    return { token: id.accessToken, tokenInfo: { email: id.effectiveUser?.email } };
  }
  throw `auth isnt set yet for platform ${_platform}`;
}

const getSourceAccessTokenInfo = async () => {
  const id = _getIdentity();
  if (id.sourceClient) return _getTokenInfo(id.sourceClient);
  if (_platform === 'ksuite') {
    return { token: id.accessToken, tokenInfo: { email: id.activeUser?.email } };
  }
  throw `source auth isnt set yet for platform ${_platform}`;
}

const getAccessToken = async () => {
  const id = _getIdentity();
  if (_platform === 'ksuite') return id.accessToken;
  if (!id.authClient) throw `auth isnt set yet for platform ${_platform}`;
  return (await getAccessTokenInfo()).token;
}

const isTokenExpired = () => {
  const id = _getIdentity();
  return !id.accessToken || !id.tokenExpiresAt || Date.now() >= id.tokenExpiresAt;
}

const getAuthClient = () => _getIdentity().authClient;
const getSourceClient = () => _getIdentity().sourceClient;
const getAuthMethod = (platform = _platform) => _getIdentity(platform).authMethod;

const setAuth = async (scopes = [], mcpLoading = false) => {
  const mayLog = mcpLoading ? () => null : syncLog;
  const id = _getIdentity('google'); 

  try {
    id.auth = new GoogleAuth()
    id.projectId = await id.auth.getProjectId()

    const saName = process.env.GOOGLE_SERVICE_ACCOUNT_NAME
    const authType = process.env.AUTH_TYPE?.toLowerCase()
    const useDwd = authType === 'dwd' || (authType !== 'adc' && saName)

    if (!useDwd) {
      id.authMethod = 'adc'
      id.authClient = await id.auth.getClient({ scopes })
      id.sourceClient = id.authClient
    } else {
      if (!saName) throw new Error("DWD requested but GOOGLE_SERVICE_ACCOUNT_NAME is not set.");
      
      id.authMethod = 'dwd'
      const targetPrincipal = `${saName}@${id.projectId}.iam.gserviceaccount.com`
      
      const sourceScopes = scopes.filter(s => s === 'openid' || s === 'https://www.googleapis.com/auth/userinfo.email')
      id.sourceClient = await id.auth.getClient(sourceScopes.length > 0 ? { scopes: sourceScopes } : {})

      const { tokenInfo: userInfo } = await _getTokenInfo(id.sourceClient);
      const userEmail = process.env.GOOGLE_WORKSPACE_SUBJECT || userInfo.email
      
      const dwdClient = new OAuth2Client()
      dwdClient._token = null
      dwdClient._expiresAt = 0

      dwdClient.getAccessToken = async function () {
        if (this._token && Date.now() < this._expiresAt - 60000) return { token: this._token }
        
        const iat = Math.floor(Date.now() / 1000)
        const payload = {
          iss: targetPrincipal,
          sub: userEmail,
          aud: "https://oauth2.googleapis.com/token",
          iat, exp: iat + 3600,
          scope: scopes.join(' ')
        }

        const signResponse = await id.sourceClient.request({
          url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${targetPrincipal}:signJwt`,
          method: 'POST',
          data: { payload: JSON.stringify(payload) }
        })

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: signResponse.data.signedJwt
          })
        })

        if (!tokenResponse.ok) throw new Error(`Failed to exchange JWT: ${await tokenResponse.text()}`)

        const tokenData = await tokenResponse.json()
        this._token = tokenData.access_token
        this._expiresAt = Date.now() + (tokenData.expires_in * 1000)
        
        if (!this.credentials) this.credentials = {};
        this.credentials.access_token = this._token; 
        
        return { token: this._token }
      }

      // Satisfy the 'No access token' check in google-auth-library
      dwdClient.credentials = { access_token: 'dummy' };
      dwdClient.refreshHandler = async () => {
        const { token } = await dwdClient.getAccessToken();
        return { access_token: token };
      };

      id.authClient = dwdClient
    }
  } catch (error) {
    throw error
  }
  return id.authClient;
}

const invalidateToken = () => {
  const client = getAuthClient();
  if (client) {
    if (client.invalidateToken) client.invalidateToken();
    else client.credentials = null;
  }
}

const googify = (options = {}) => {
  const { headers } = options;
  if (!headers || _platform !== 'workspace' && _platform !== 'google') return options;
  if (!headers.Authorization) return options;

  return {
    ...options,
    headers: {
      "x-goog-user-project": getProjectId(),
      ...headers,
    },
  };
};

const getProjectId = () => {
  const pid = _getIdentity().projectId;
  if (is.null(pid) || is.undefined(pid)) {
    if (_platform === 'ksuite') return null;
    throw new Error("Project id not set - this means that the fxInit wasnt run");
  }
  return pid;
};

const hasAuth = (platform = _platform) => {
  const id = _getIdentity(platform);
  // On main thread, we don't have authClient, but we have activeUser after successful fxInit
  return Boolean(id.authClient || id.accessToken || id.activeUser);
}

const getAuth = () => {
  if (!hasAuth()) throw new Error(`auth hasnt been intialized for platform ${_platform}`);
  return getAuthClient();
};

export const responseSyncify = (result) => {
  if (!result) return {
    status: 503, statusCode: 503,
    statusText: "Worker Error: No response object",
    error: { message: "No response object" },
  };
  return {
    status: result.status || result.statusCode,
    statusCode: result.status || result.statusCode,
    statusText: result.statusText,
    responseUrl: result.request?.responseURL || result.url,
    error: result.data?.error,
    rawHeaders: result.rawHeaders,
    headers: result.headers,
    body: result.body,
    rawBody: result.rawBody
  };
};

// Helper to populate identity from sxInit response
const setIdentity = (platform, data) => {
  const id = _getIdentity(platform);
  Object.assign(id, data);
};

export const Auth = {
  getAuth,
  hasAuth,
  getProjectId,
  setAuth,
  setIdentity,
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
  getAuthMethod,
  getSourceClient,
  getAccessTokenInfo,
  getSourceAccessTokenInfo,
  setActiveUser,
  getActiveUser,
  setEffectiveUser,
  getEffectiveUser,
  invalidateToken,
  setTokenScopes,
  setPlatform,
  getPlatform
};
