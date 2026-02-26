/**
 * Auth and Init
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */
import got from 'got';
import { Auth } from './auth.js';
import { syncError, syncLog, syncWarn } from './workersync/synclogger.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { KSuiteDrive } from './ksuite/kdrive.js';


/**
 * initialize ke stuff at the beginning such as manifest content and settings
 * @param {object} p pargs
 * @param {string} p.manifestPath where to finfd the manifest by default
 * @param {string} p.authPath import the auth code 
 * @param {string} p.claspPath where to find the clasp file by default
 * @param {string} p.settingsPath where to find the settings file
 * @param {string} p.cachePath the cache files
 * @param {string} p.propertiesPath the properties file location
 * @param {string} p.fakeId a fake script id to use if one isnt in the settings
 * @param {string[]} [p.platformAuth] list of platforms to authenticate
 * @return {object} the finalized vesions of all the above 
 */
export const sxInit = async ({ manifestPath, claspPath, settingsPath, cachePath, propertiesPath, fakeId, platformAuth }) => {

  // Default to google if nothing specified
  const platforms = platformAuth || (process.env.GF_PLATFORM_AUTH ? process.env.GF_PLATFORM_AUTH.split(',') : ['google']);
  syncLog(`...sxInit initializing for platforms: ${platforms.join(', ')}`);

  // get a file and parse if it exists
  const getIfExists = async (file) => {
    try {
      const content = await readFile(file, { encoding: 'utf8' })
      syncLog(`...using ${file}`);
      return JSON.parse(content)
    } catch (err) {
      syncLog(`...didnt find ${file} ... skipping`);
      return {}
    }
  }

  const settingsDir = path.dirname(settingsPath)
  const _settings = await getIfExists(settingsPath)
  const settings = { ..._settings }

  settings.manifest = settings.manifest || manifestPath
  settings.clasp = settings.clasp || claspPath
  const [manifest, clasp] = await Promise.all([
    getIfExists(path.resolve(settingsDir, settings.manifest)),
    getIfExists(path.resolve(settingsDir, settings.clasp))
  ])

  settings.scriptId = settings.scriptId || clasp.scriptId || fakeId
  settings.documentId = settings.documentId || null
  settings.cache = settings.cache || cachePath
  settings.properties = settings.properties || propertiesPath

  syncLog(`...cache will be in ${settings.cache}`);
  syncLog(`...properties will be in ${settings.properties}`);

  const strSet = JSON.stringify(settings, null, 2)
  if (JSON.stringify(_settings, null, 2) !== strSet) {
    try {
      await mkdir(settingsDir, { recursive: true })
      syncLog(`...writing to ${settingsPath}`);
      await writeFile(settingsPath, strSet, { flag: 'w' })
    } catch (err) {
      syncWarn(`...unable to write settings file: ${err}`)
    }
  }

  const identities = {};

  // --- Google Auth Block ---
  if (platforms.includes('google') || platforms.includes('workspace')) {
    try {
      const scopes = manifest.oauthScopes || []
      const mandatoryScopes = [
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/cloud-platform"
      ]
      const scopeSet = new Set(scopes)
      mandatoryScopes.forEach(scope => scopeSet.add(scope))
      const finalScopes = Array.from(scopeSet)

      await Auth.setAuth(finalScopes);
      
      const [activeInfo, effectiveInfo] = await Promise.all([
        Auth.getSourceAccessTokenInfo(),
        Auth.getAccessTokenInfo()
      ]);

      const activeUser = {
        id: activeInfo.tokenInfo.sub || activeInfo.tokenInfo.email || activeInfo.tokenInfo.user_id || 'unknown-active-user',
        email: activeInfo.tokenInfo.email,
        token: activeInfo.token
      }
      const effectiveUser = {
        id: effectiveInfo.tokenInfo.sub || effectiveInfo.tokenInfo.email || effectiveInfo.tokenInfo.user_id || 'unknown-effective-user',
        email: effectiveInfo.tokenInfo.email,
        token: effectiveInfo.token
      }

      identities.google = {
        activeUser,
        effectiveUser,
        projectId: Auth.getProjectId(),
        tokenScopes: effectiveInfo.tokenInfo.scopes
      };

      // Set current worker identity to google for remainder of init if needed
      Auth.setIdentity('google', identities.google);
      
    } catch (err) {
      syncWarn(`Google authentication failed: ${err.message}`);
      if (!platforms.includes('ksuite')) throw err; // Fail if only google was requested
    }
  }

  // --- KSuite Auth Block ---
  if (platforms.includes('ksuite')) {
    const kToken = process.env.KSUITE_TOKEN;
    if (!kToken) {
      syncWarn("ksuite requested in platformAuth but KSUITE_TOKEN is missing from environment.");
    } else {
      try {
        syncLog("...initializing ksuite auth");
        const kDrive = new KSuiteDrive(kToken);
        const accountId = await kDrive.getAccountId();
        
        if (!accountId) throw new Error("Could not retrieve Infomaniak account info.");

        const kUser = {
          id: String(accountId),
          email: process.env.KSUITE_EMAIL || 'ksuite-user@infomaniak.com',
          token: kToken
        };

        identities.ksuite = {
          activeUser: kUser,
          effectiveUser: kUser,
          accessToken: kToken,
          projectId: null
        };
        
        Auth.setIdentity('ksuite', identities.ksuite);
        syncLog(`...ksuite user verified: ${kUser.email}`);
      } catch (err) {
        syncWarn(`KSuite authentication failed: ${err.message}`);
        if (!platforms.includes('google')) throw err;
      }
    }
  }

  return {
    identities,
    settings,
    manifest,
    clasp,
  }
}
