/**
 * Auth and Init
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */
import got from 'got';
import { Auth } from './auth.js';
import { syncLog } from './workersync/synclogger.js';

/**
 * initialize ke stuff at the beginning such as manifest content and settings
 * @param {object} p pargs
 * @param {string} p.manifestPath where to finfd the manifest by default
 * @param {string} p.authPath import the auth code 
 * @param {string} p.claspPath where to find the clasp file by default
 * @param {string} p.settingsPath where to find the settings file
 * @param {string} p.mainDir the directory the main app is running from
 * @param {string} p.cachePath the cache files
 * @param {string} p.propertiesPath the properties file location
 * @param {string} p.fakeId a fake script id to use if one isnt in the settings
 * @return {object} the finalized vesions of all the above 
 */
export const sxInit = async ({ manifestPath, claspPath, settingsPath, mainDir, cachePath, propertiesPath, fakeId }) => {

  const findAdcPath = async () => {
    const { homedir } = await import('os');
    const { access } = await import('node:fs/promises');
    const path = await import('path');

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }
    const isWindows = process.platform === 'win32';
    const home = homedir();
    let adcPath;
    if (isWindows) {
      const appData = process.env.APPDATA;
      if (appData) {
        adcPath = path.join(appData, 'gcloud', 'application_default_credentials.json');
      }
    } else {
      adcPath = path.join(home, '.config', 'gcloud', 'application_default_credentials.json');
    }

    if (adcPath) {
      try {
        await access(adcPath);
        return adcPath;
      } catch {
        // file doesn't exist or not accessible
      }
    }
    return null;
  };

  // get the settings and manifest
  const path = await import('path')
  const { readFile, writeFile, mkdir } = await import('node:fs/promises')

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
  const settingsFile = path.resolve(mainDir, settingsPath)
  const settingsDir = path.dirname(settingsFile)


  // get the setting file if it exists
  const _settings = await getIfExists(path.resolve(mainDir, settingsFile))
  const settings = { ..._settings }

  // the content of the settings file take precedence over whatever is passed as the default
  // get the manifest and clasp file
  settings.manifest = settings.manifest || manifestPath
  settings.clasp = settings.clasp || claspPath
  const [manifest, clasp] = await Promise.all([
    getIfExists(path.resolve(mainDir, settings.manifest)),
    getIfExists(path.resolve(mainDir, settings.clasp))
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
    syncLog(`...writing to ${settingsFile}`);
    writeFile(settingsFile, strSet, { flag: 'w' })
  }

  // get the required scopes and set them
  const scopes = manifest.oauthScopes || []

  // first set up the projectId which is actually async
  const projectId = await Auth.setProjectIdFromADC(scopes)

  // now we can register the scopes and set up a full auth including it
  const auth = Auth.setAuth(scopes)

  const adcPath = await findAdcPath();
  const accessToken = await auth.getAccessToken()
  const tokenInfo = await got(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`).json()


  /// these all jst exist in this sub process so we need to send them back to parent process
  return {
    scopes,
    projectId,
    tokenInfo,
    adcPath,
    accessToken, // also return the token itself
    settings,
    manifest,
    clasp
  }
}

export const sxRefreshToken = async (Auth) => {
  const auth = Auth.getAuth();
  // force a refresh by clearing the cached credential
  auth.cachedCredential = null;
  const accessToken = await auth.getAccessToken();
  const tokenInfo = await got(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`).json();

  // update the worker's auth state
  Auth.setAccessToken(accessToken);
  Auth.setTokenInfo(tokenInfo);

  return { accessToken, tokenInfo };
};