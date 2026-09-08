// fake script app to get oauth token from application default credentials on Apps Script
// first set up and test ADC with required scopes - see https://ramblings.mcpher.com/application-default-credentials-with-google-cloud-and-workspace-apis
// Note that all async type functions have been converted to synch to make it Apps Script like

import { Syncit } from '../../support/syncit.js'
import { Auth } from '../../support/auth.js'
import { Proxies } from '../../support/proxies.js'
import { newFakeBehavior } from './behavior.js'
import { newFakeAuthorizationInfo } from './fakeauthorizationinfo.js'
import {
  AuthMode,
  AuthorizationStatus,
  TriggerSource,
  EventType,
  InstallationSource
} from '../enums/scriptenums.js'
import { newCacheDropin } from '@mcpher/gas-flex-cache'
import { slogger } from "../../support/slogger.js";
import fs from 'fs';
import path from 'path';

// This will eventually hold a proxy for ScriptApp
let _app = null
let _initialized = false
// Load default from environment if available
let _platformAuth = process.env.GF_PLATFORM_AUTH ? process.env.GF_PLATFORM_AUTH.split(',') : ['google']

const ensureInit = () => {
  // If already initialized OR if another service already triggered Auth, skip
  if (!_initialized && !Auth.hasAuth()) {
    _initialized = true
    Syncit.fxInit({ platformAuth: _platformAuth })
  }
  _initialized = true; // Mark as initialized even if Auth was already present
}

/**
 * fake ScriptApp.getOAuthToken 
 * @return {string} token
 */
const getOAuthToken = () => {
  ensureInit()
  return Syncit.fxGetAccessToken(Auth)
}

/**
 * gets the token of the person running the script
 * @return {string} token
 */
const getSourceOAuthToken = () => {
  ensureInit()
  return Syncit.fxGetSourceAccessTokenInfo(Auth).token
}


const limitMode = (mode) => {
  if (mode !== ScriptApp.AuthMode.FULL.toString()) {
    throw new Error(`only ${ScriptApp.AuthMode.FULL.toString()} is supported as mode for now`)
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
  ensureInit()
  return checkScopesMatch(Array.from(Auth.getAuthedScopes()))
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
  ensureInit()
  return checkScopesMatch(required)
}


/**
 * check that all scopes requested have been asked for
 * @param {string[]} required 
 * @returns null
 */
const checkScopesMatch = (required) => {
  ensureInit()
  const scopes = Auth.getTokenScopes()

  // console.log('...DEBUG: scopes type:', typeof scopes, 'content:', scopes);

  // now we're syncronous all the way
  // normalize tokened scopes by removing trailing slashes. 
  // Handle both space and comma separation.
  let scopeList = [];
  if (Array.isArray(scopes)) {
    scopeList = scopes;
  } else if (typeof scopes === 'string') {
    scopeList = scopes.split(/[ ,]/);
  } else if (scopes && typeof scopes === 'object') {
    // If it's a non-null object, maybe it's serializable but has a toString?
    scopeList = String(scopes).split(/[ ,]/);
  }

  const tokened = new Set(scopeList.map(s => s.trim().replace(/\/$/, "")).filter(s => s))

  // see which ones are missing
  const missing = required.filter(s => {
    // normalized required scope
    const ns = s.trim().replace(/\/$/, "")

    // setting this scope causes gcloud to block
    // seem to manage without them anyway
    const ignores = [
      "https://www.googleapis.com/auth/script.external_request",
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/presentations",
      "https://www.googleapis.com/auth/forms",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets"
    ]
    const hasIgnore = ignores.some(i => i.replace(/\/$/, "") === ns)
    if (hasIgnore) {
      slogger.warn('...ignoring requested scope for adc as google blocks it outside apps script' + s)
    }

    // a scope is satisfied if:
    // 1. It is explicitly in the tokened set
    // 2. It is a .readonly scope AND the base scope is in the tokened set (e.g. drive satisfy drive.readonly)

    const baseNs = ns.replace(/\.readonly$/, "")
    const isSatisfied = tokened.has(ns) || (ns.endsWith(".readonly") && tokened.has(baseNs))

    return !(hasIgnore || isSatisfied)
  })

  if (missing.length) {
    throw new Error(`These scopes are required but have not been authorized ${missing.join(",")}`)
  }
  return null

}

/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "ScriptApp"

if (typeof globalThis[name] === typeof undefined) {

  const getApp = (prop) => {

    // if it hasn't been intialized yet then do that
    if (!_app) {

      _app = {
        getOAuthToken,
        __getSourceOAuthToken: getSourceOAuthToken,
        getResource: (filename) => {
          let mainScriptPath = process.argv[1];
          if (globalThis.__gasFakesMainScriptPath) {
              mainScriptPath = globalThis.__gasFakesMainScriptPath;
          }
          if (!mainScriptPath || mainScriptPath.endsWith('node')) {
              throw new Error("Could not determine project root for getResource. Ensure process.argv[1] is set or __gasFakesMainScriptPath is defined.");
          }
          
          const projectDir = path.dirname(mainScriptPath);
          let fullPath = path.resolve(projectDir, filename);

          if (!fs.existsSync(fullPath)) {
            // Apps Script allows omitting the extension. Try common ones.
            const exts = ['.js', '.gs', '.html'];
            let found = false;
            for (const ext of exts) {
                if (fs.existsSync(fullPath + ext)) {
                    fullPath += ext;
                    found = true;
                    break;
                }
            }
            if (!found) {
               throw new Error(`File not found: ${fullPath}`);
            }
          }
          const content = fs.readFileSync(fullPath, 'utf8');
          // We can't import Utilities easily here without circular deps or breaking the proxy
          // But we can just use the global Utilities object assuming it's loaded.
          if (!globalThis.Utilities) {
             throw new Error("Utilities service not loaded, cannot create Blob for getResource.");
          }
          return globalThis.Utilities.newBlob(content, "text/plain", filename);
        },
        requireAllScopes,
        requireScopes,
        getScriptId: () => {
          ensureInit()
          return Auth.getScriptId()
        },
        get __platform() {
          return Auth.getPlatform() || 'google'
        },
        set __platform(value) {
          Auth.setPlatform(value)
          // When platform changes, we should ideally clear caches of all services.
          if (globalThis.DriveApp && typeof globalThis.DriveApp.__reset === 'function') {
            globalThis.DriveApp.__reset()
          }
        },
        get __platformAuth() {
          return _platformAuth
        },
        set __platformAuth(value) {
          const newVal = Array.isArray(value) ? value : [value];

          if (_initialized || Auth.hasAuth()) {
            // Check if all requested platforms are already authorized
            const missing = newVal.filter(p => !Auth.hasAuth(p));
            if (missing.length > 0) {
              // Trigger re-init for missing platforms
              Syncit.fxInit({ platformAuth: newVal });
            }
          }
          _platformAuth = newVal;
        },
        get __projectId() {
          ensureInit()
          return Auth.getProjectId()
        },
        get __userId() {
          ensureInit()
          return Auth.getActiveUser()?.id
        },
        AuthMode,
        AuthorizationStatus,
        TriggerSource,
        EventType,
        InstallationSource,
        getAuthorizationInfo: (authMode) => {
          ensureInit();
          return newFakeAuthorizationInfo(authMode);
        },
        // __behavior added below to break recursion
        __newCacheDropin: newCacheDropin,
        __proxies: Proxies,
        get __registeredServices() {
          return Proxies.getRegisteredServices()
        },
        get __loadedServices() {
          return Proxies.getLoadedServices()
        },
        __isPlatformAuthed: (platform) => {
          ensureInit();
          return Auth.hasAuth(platform);
        },
        get __platforms() {
          ensureInit();
          // Backends initialized in this session
          return _platformAuth.filter(p => Auth.hasAuth(p));
        }
      }

      // Initialize behavior after _app is set to break recursion
      _app.__behavior = newFakeBehavior()
    }

    // Now check if backend initialization is needed
    // Explicitly trigger init ONLY for properties that require authorized backend data
    const triggerProps = ['getOAuthToken', '__getSourceOAuthToken', 'requireAllScopes', 'requireScopes', '__projectId', '__userId', 'getScriptId'];

    if (triggerProps.includes(prop)) {
      ensureInit();
    }

    return _app
  }

  // Define a custom handler to pass the property name to getApp
  const handler = {
    get(_, prop, receiver) {
      if (prop === 'isFake') return true;

      // BRIDGE: Inform LoadedRegistry about ScriptApp being loaded
      if (prop !== '__behavior' && prop !== '__proxies') {
        Proxies.__addLoaded(name);
      }

      const app = getApp(prop);
      return Reflect.get(app, prop, receiver);
    },
    set(_, prop, value, receiver) {
      const app = getApp(prop);
      return Reflect.set(app, prop, value, receiver);
    }
  };

  Object.defineProperty(globalThis, name, {
    value: new Proxy({}, handler),
    enumerable: true,
    configurable: false,
    writable: false,
  });

  // Manually add ScriptApp to service registry
  Proxies.__addService(name);
}