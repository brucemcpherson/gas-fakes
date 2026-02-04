/**
 * Auth and Init
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */
import got from 'got';
import { Auth } from './auth.js';
import { syncError, syncLog } from './workersync/synclogger.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path'


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
 * @return {object} the finalized vesions of all the above 
 */
export const sxInit = async ({ manifestPath, claspPath, settingsPath, cachePath, propertiesPath, fakeId }) => {



  // get the settings and manifest


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

  // files are relative to this main path
  const settingsDir = path.dirname(settingsPath)

  // syncLog (JSON.stringify({settingsPath,settingsDir,settingsPath}))
  // get the setting file if it exists
  const _settings = await getIfExists(settingsPath)
  const settings = { ..._settings }

  // the content of the settings file take precedence over whatever is passed as the default
  // get the manifest and clasp file
  settings.manifest = settings.manifest || manifestPath
  settings.clasp = settings.clasp || claspPath
  const [manifest, clasp] = await Promise.all([
    getIfExists(path.resolve(settingsDir, settings.manifest)),
    getIfExists(path.resolve(settingsDir, settings.clasp))
  ])

  /// if we dont have a scriptId we need to check in clasp or make a fakeone
  settings.scriptId = settings.scriptId || clasp.scriptId || fakeId

  // if we don't have a documentID, then see if this is a bound one
  settings.documentId = settings.documentId || null

  // cache & props cache can also be set in settings
  settings.cache = settings.cache || cachePath
  settings.properties = settings.properties || propertiesPath

  syncLog(`...cache will be in ${settings.cache}`);
  syncLog(`...properties will be in ${settings.properties}`);

  // now update all that if anything has changed
  const strSet = JSON.stringify(settings, null, 2)
  if (JSON.stringify(_settings, null, 2) !== strSet) {
    await mkdir(settingsDir, { recursive: true })
    syncLog(`...writing to ${settingsPath}`);
    writeFile(settingsPath, strSet, { flag: 'w' })
  }

  // get the required scopes and set them
  const scopes = manifest.oauthScopes || []

  // Initialize auth. 
  const auth = await Auth.setAuth(scopes);

  // static things we need to get into the main thread we can do now
  const projectId = Auth.getProjectId();

  // the active user is the person we are (ADC) or pretending to be (Workload identity)
  const [activeInfo, effectiveInfo] = await Promise.all([
    Auth.getSourceAccessTokenInfo(),
    Auth.getAccessTokenInfo()])

  /// these all jst exist in this sub process so we need to send them back to parent process
  /// we'll send back the token, but it should be refreshed dynamically to handle expiry
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

  //syncLog(`[Auth] Active User TokenInfo: ${JSON.stringify(activeInfo.tokenInfo)}`)
  //syncLog(`[Auth] Effective User TokenInfo: ${JSON.stringify(effectiveInfo.tokenInfo)}`)
  // check that mandatory scopes have been allowed
  const effectiveScopes = effectiveInfo.tokenInfo.scopes
  // we strictly need the effective user ID (the one we are impersonating)
  // but the active user (the SA) might not have a 'sub' on Cloud Run
  if (!effectiveUser.id) {
    const isOpenid = effectiveScopes.includes('openid')
    throw new Error(`...unable to figure out effective user id - openid scope was ${isOpenid ? '' : 'not'} granted`)
  }
  if (!activeUser.email || !effectiveUser.email) {
    const isEmail = effectiveScopes.includes('https://www.googleapis.com/auth/userinfo.email')
    throw new Error(`...unable to figure out user email - userinfo.email scope was ${isEmail ? '' : 'not'} granted`)
  }
  const allowedScopes = new Set(effectiveScopes)
  const missingScopes = scopes.filter(scope => !allowedScopes.has(scope))
  if (missingScopes.length > 0) {
    syncError(`...these scopes were asked for but not granted: ${missingScopes.join(', ')}`)
  }
  return {
    // these will be the scopes we're allowed to get
    scopes: effectiveScopes,
    activeUser,
    effectiveUser,
    projectId,
    settings,
    manifest,
    clasp,
  }
}

