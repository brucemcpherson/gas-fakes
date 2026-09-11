import path from "path";
import { Auth } from "./auth.js";
import { randomUUID } from "node:crypto";
import mime from "mime";
import { minFields } from "./helpers.js";
import { mergeParamStrings } from "./utils.js";
import {
  improveFileCache,
  checkResponse,
  getFromFileCache,
} from "./filecache.js";
import { checkResponseCacher } from "./fetchcacher.js";
import { docsCacher } from "./docscacher.js";
import { gmailCacher } from "./gmailcacher.js";
import { formsCacher } from "./formscacher.js";
import { slidesCacher } from "./slidescacher.js";
import { sheetsCacher } from "./sheetscacher.js";
import { calendarCacher } from "./calendarcacher.js";
import { bigqueryCacher } from "./bigquerycacher.js";
import is from "@sindresorhus/is";
import { callSync } from "./workersync/synchronizer.js";

const debugLog = (...args) => {
  console.log(`[DEBUG-MAIN-SYNC] ${new Date().toISOString()}`, ...args);
};

const manifestDefaultPath = "./appsscript.json";
const claspDefaultPath = "./.clasp.json";
const propertiesDefaultPath = "/tmp/gas-fakes/properties";
const cacheDefaultPath = "/tmp/gas-fakes/cache";

// Helper to ensure init has happened before any worker call
const safeCallSync = (method, ...args) => {
  debugLog(`safeCallSync invoking worker task: ${method}`);
  if (method !== "sxInit" && !Auth.hasAuth()) {
    debugLog(`safeCallSync triggering lazy fxInit for method: ${method}`);
    fxInit();
  }
  const result = callSync(method, ...args);
  debugLog(`safeCallSync task completed: ${method}`);
  return result;
};

// note that functions like Sheets.newGridRange() etc create objects that contain get and set functions
// the makesynchronous functions need data that can be serialized. so we need to string/parse to normlaize them
const normalizeSerialization = (ob) =>
  is.nullOrUndefined(ob) || !is.object(ob)
    ? ob
    : JSON.parse(JSON.stringify(ob));

/**
 * check and register a result in cache
 * @param {import('./sxdrive.js').SxResult} result the result of a sync api call
 * @param {boolean} [allow404=false] whether to allow 404 errors
 * @param {string} [fields] the fields to register
 * @return {import('./sxdrive.js').SxResult}
 */
const registerSx = (result, allow404 = false, fields) => {
  const { data, response } = result;
  debugLog("registerSx check:", {
    hasData: Boolean(data),
    isPlainObject: is.plainObject(data),
    id: data?.id,
    responseStatus: response?.status,
  });

  // If data is a file metadata object (has an id), register it in the cache.
  // If it's media content (array) or doesn't have an ID, skip registration.
  if (is.plainObject(data) && is.nonEmptyString(data.id)) {
    checkResponse(data.id, response, allow404);
    const cachedData = improveFileCache(data.id, data, fields);
    debugLog(`registerSx cached file metadata for ID: ${data.id}`);
    return {
      ...result,
      data: cachedData,
    };
  }

  // For other cases (like alt=media content), just return the result as is.
  debugLog("registerSx skipped caching (not a plain object metadata or lacks id)");
  return result;
};

const register = (id, cacher, result, allow404 = false, params) => {
  const { data, response } = result;
  debugLog(`register checking cacher for ID: "${id}"`);

  if (checkResponseCacher(id, response, allow404, cacher)) {
    cacher.setEntry(id, params, normalizeSerialization(data));
    debugLog(`register updated cacher entry for ID: "${id}"`);
    return result;
  } else {
    debugLog(`register checkResponseCacher rejected caching for ID: "${id}"`);
    return result;
  }
};

/**
 * sync a call to Drive api to stream a download
 * @param {object} p pargs
 * @param {string} p.method - update or create
 * @param {string} [p.file] the file meta data
 * @param {blob} [p.blob] the content
 * @param {string} [p.fields] the fields to return
 * @param {string} [p.mimeType] the mimeType to assign
 * @param {string} [p.fileId] the fileId - required of patching
 * @param {object} [p.params] any extra params
 * @return {import('./sxdrive.js').SxResult} from the drive api
 */
const fxStreamUpMedia = ({
  file = {},
  blob,
  fields = "",
  method = "create",
  fileId,
  params = {},
}) => {
  debugLog(`fxStreamUpMedia method: "${method}", fileId: "${fileId}"`, { file, params });
  // merge the required fields with the minimum
  fields = mergeParamStrings(minFields, fields);
  
  const bytes = blob ? blob.getBytes() : null;
  debugLog("fxStreamUpMedia byte info:", {
    hasBlob: Boolean(blob),
    byteCount: bytes?.length,
    mimeType: blob?.getContentType() || file.mimeType,
  });

  const result = safeCallSync("sxStreamUpMedia", {
    resource: file,
    bytes,
    fields,
    method,
    mimeType: blob?.getContentType() || file.mimeType,
    fileId,
    params,
  });

  debugLog("fxStreamUpMedia sxStreamUpMedia result:", JSON.stringify(result));

  if (method === "create" && result.data?.id) {
    if (ScriptApp.__behavior.sandBoxMode) {
      debugLog(`fxStreamUpMedia registering created file ${result.data.id} in sandbox`);
      ScriptApp.__behavior.addFile(result.data?.id);
    }
  }

  // check result and register in cache
  return registerSx(result, false, fields);
};

/**
 * sync a call to Drive api
 * @param {object} p pargs
 * @param {string} p.prop the prop of drive eg 'files' for drive.files
 * @param {string} p.method the method of drive eg 'list' for drive.files.list
 * @param {object} p.params the params to add to the request
 * @return {DriveResponse} from the drive api
 */
const fxDrive = ({ prop, method, params, options }) => {
  debugLog(`fxDrive call: ${prop}.${method}`, { params, options });
  const result = safeCallSync("sxDrive", {
    prop,
    method,
    params: normalizeSerialization(params),
    options: normalizeSerialization(options),
  });
  debugLog(`fxDrive result for ${prop}.${method}:`, JSON.stringify(result));
  return result;
};

const fxGeneric = ({
  serviceName,
  prop,
  subProp,
  method,
  params,
  options,
  cacher,
  idField,
}) => {
  const { [idField]: resourceId, ...otherParams } = params || {};
  debugLog(`fxGeneric service: ${serviceName}, prop: ${prop}, method: ${method}, resourceId: "${resourceId}"`);

  if (method === "get") {
    const data = cacher.getEntry(resourceId, otherParams);
    if (data) {
      debugLog(`fxGeneric cache HIT for ${serviceName} ID: "${resourceId}"`);
      return {
        data: normalizeSerialization(data),
        response: {
          status: 200,
          fromCache: true,
        },
      };
    }
    debugLog(`fxGeneric cache MISS for ${serviceName} ID: "${resourceId}"`);
  }

  const result = safeCallSync(`sx${serviceName}`, {
    subProp,
    prop,
    method,
    params: normalizeSerialization(params),
    options: normalizeSerialization(options),
  });

  debugLog(`fxGeneric sx${serviceName} result:`, JSON.stringify(result));

  if (method === "get") {
    return register(resourceId, cacher, result, false, otherParams);
  } else if (resourceId) {
    debugLog(`fxGeneric clearing cache for ${serviceName} ID: "${resourceId}" due to non-get method`);
    cacher.clear(resourceId);
  }
  return result;
};

/**
 * sync a call to Drive api get
 * @param {object} p pargs
 * @param {string} p.id the file id
 * @param {boolean} [p.allowCache=true] whether to allow the result to come from cache
 * @param {boolean} [p.allow404=false] whether to allow 404 errors
 * @param {object} p.params the params to add to the request
 * @return {DriveResponse} from the drive api
 */
const fxDriveGet = ({
  id,
  params = {},
  allow404 = false,
  allowCache = true,
  options,
}) => {
  debugLog(`fxDriveGet ID: "${id}", allowCache: ${allowCache}`, { params, options });

  params.fields = mergeParamStrings(minFields, params.fields || "");
  params.fileId = id;

  const isMedia =
    params.alt === "media" || (params.params && params.params.alt === "media");

  if (allowCache && !isMedia) {
    const { cachedFile, good } = getFromFileCache(id, params.fields);
    if (good) {
      debugLog(`fxDriveGet cache HIT for fileId: "${id}"`);
      return {
        data: normalizeSerialization(cachedFile),
        response: {
          status: 200,
          fromCache: true,
        },
      };
    }
    debugLog(`fxDriveGet cache MISS for fileId: "${id}"`);
  } else {
    debugLog(`fxDriveGet bypassing cache (allowCache: ${allowCache}, isMedia: ${isMedia})`);
  }

  const result = safeCallSync("sxDriveGet", {
    id,
    params: normalizeSerialization(params),
    options: normalizeSerialization(options),
  });

  debugLog(`fxDriveGet sxDriveGet result for ID "${id}":`, JSON.stringify(result));

  return registerSx(result, allow404, params.fields);
};

/**
 * zipper
 * @param {object} p
 * @param {FakeBlob} p.blobs an array of blobs to be zipped
 * @returns {FakeBlob} a combined zip file
 */
const fxZipper = ({ blobs }) => {
  debugLog("fxZipper processing blobs count:", blobs?.length);
  const dupCheck = new Set();
  const blobsContent = blobs.map((f, i) => {
    const ext = mime.getExtension(f.getContentType());
    const name = f.getName() || `Untitled${i + 1}${ext ? "." + ext : ""}`;
    if (dupCheck.has(name)) {
      throw new Error(`Duplicate filename ${name} not allowed in zip`);
    }
    dupCheck.add(name);
    return {
      name,
      bytes: f.getBytes(),
    };
  });

  return safeCallSync("sxZipper", {
    blobsContent,
  });
};

/**
 * Unzipper
 * @param {object} p
 * @param {FakeBlob} p.blob the blob containing the zipped files
 * @returns {FakeBlob[]} each of the files unzipped
 */
const fxUnzipper = ({ blob }) => {
  debugLog("fxUnzipper processing blob name:", blob?.getName());
  const blobContent = {
    name: blob.getName(),
    bytes: blob.getBytes(),
  };

  return safeCallSync("sxUnzipper", {
    blobContent,
  });
};

/**
 * initialize all the stuff at the beginning such as manifest content and settings
 * and register them all in Auth object for future reference
 * @param {object} p pargs
 * @param {string} p.manifestPath where to find the manifest by default
 * @param {string} p.claspPath where to find the clasp file by default
 * @param {string} p.cachePath the cache files
 * @param {string} p.propertiesPath the properties file location
 * @param {string[]} [p.platformAuth] list of platforms to authenticate
 * @return {object} the finalized versions of all the above
 */
export const fxInit = ({
  manifestPath = manifestDefaultPath,
  claspPath = claspDefaultPath,
  cachePath = cacheDefaultPath,
  propertiesPath = propertiesDefaultPath,
  platformAuth,
} = {}) => {
  debugLog("fxInit starting with paths:", {
    manifestPath,
    claspPath,
    cachePath,
    propertiesPath,
    platformAuth,
  });

  const cwd = process.cwd();
  const resolve = (p) => (path.isAbsolute(p) ? p : path.resolve(cwd, p));

  const synced = callSync("sxInit", {
    claspPath: resolve(claspPath),
    manifestPath: resolve(manifestPath),
    cwd,
    cachePath,
    propertiesPath,
    fakeId: randomUUID(),
    platformAuth: ScriptApp.__platformAuth,
  });

  const { identities, settings, manifest, clasp } = synced;

  Auth.setSettings(settings);
  Auth.setClasp(clasp);
  Auth.setManifest(manifest);

  debugLog(`fxInit identities received keys: ${Object.keys(identities || {}).join(",")}`);

  if (identities) {
    Object.keys(identities).forEach((p) => {
      Auth.setIdentity(p, identities[p]);
    });
  }

  const currentPlatform = Auth.getPlatform();
  if (currentPlatform === "google" || !currentPlatform) {
    const initialPlatforms = platformAuth ||
      ScriptApp.__platformAuth || ["google"];
    const defaultPlatform = initialPlatforms.includes("google")
      ? "google"
      : initialPlatforms[0];
    Auth.setPlatform(defaultPlatform);
    debugLog(`fxInit platform set to: "${defaultPlatform}"`);
  }

  return synced;
};

const fxStore = (storeArgs, method = "get", ...kvArgs) => {
  debugLog(`fxStore method: "${method}"`, { storeArgs, kvArgs });
  return safeCallSync("sxStore", {
    method,
    kvArgs,
    storeArgs,
  });
};

const fxRefreshToken = () => {
  debugLog("fxRefreshToken triggered");
  return safeCallSync("sxRefreshToken");
};

const fxDriveMedia = ({ id, params = {}, options = {} }) => {
  // Enforce alt=media parameter so fxDriveGet/worker knows this is a media request
  const mediaParams = {
    ...params,
    alt: "media",
  };

  return fxDriveGet({
    id,
    params: mediaParams,
    allowCache: false, // Force cache bypass for binary/text payload retrieval
    options,
  });
};

const fxDriveExport = ({ id, mimeType, options = { alt: "media" } }) => {
  debugLog(`fxDriveExport ID: "${id}", mimeType: "${mimeType}"`, { options });
  return safeCallSync("sxDriveExport", {
    id,
    mimeType,
    options,
  });
};

const fxFetch = (url, options, responseFields) => {
  debugLog(`fxFetch URL: "${url}"`, { options, responseFields });
  return safeCallSync("sxFetch", url, options, responseFields);
};

const fxFetchAll = (requests, responseFields) => {
  debugLog("fxFetchAll requests count:", requests?.length);
  return safeCallSync("sxFetchAll", requests, responseFields);
};

const fxGetAccessToken = () => {
  debugLog("fxGetAccessToken requested");
  return safeCallSync("sxGetAccessToken");
};

const fxGetAccessTokenInfo = () => {
  debugLog("fxGetAccessTokenInfo requested");
  return safeCallSync("sxGetAccessTokenInfo");
};

const fxGetSourceAccessTokenInfo = () => {
  debugLog("fxGetSourceAccessTokenInfo requested");
  return safeCallSync("sxGetSourceAccessTokenInfo");
};

const fxTestRetry = (errorMessage) => {
  debugLog("fxTestRetry requested with message:", errorMessage);
  return safeCallSync("sxTestRetry", { errorMessage });
};

const fxJdbcConnect = (url, user, password) => {
  debugLog(`fxJdbcConnect URL: "${url}"`);
  const args = { url };
  if (typeof user === "object" && user !== null) {
    args.user = user.user || user.userName;
    args.password = user.password;
  } else {
    if (user !== null && typeof user !== "undefined") args.user = user;
    if (password !== null && typeof password !== "undefined")
      args.password = password;
  }
  return safeCallSync("sxJdbcConnect", args);
};

const fxJdbcQuery = (connectionId, sql) => {
  debugLog(`fxJdbcQuery connectionId: "${connectionId}" SQL: "${sql}"`);
  return safeCallSync("sxJdbcQuery", { connectionId, sql });
};

const fxJdbcExecutePrepared = (connectionId, sql, values) => {
  debugLog(`fxJdbcExecutePrepared connectionId: "${connectionId}" SQL: "${sql}"`);
  return safeCallSync("sxJdbcExecutePrepared", { connectionId, sql, values });
};

const fxJdbcCommit = (connectionId) => {
  debugLog(`fxJdbcCommit connectionId: "${connectionId}"`);
  return safeCallSync("sxJdbcCommit", { connectionId });
};

const fxJdbcRollback = (connectionId) => {
  debugLog(`fxJdbcRollback connectionId: "${connectionId}"`);
  return safeCallSync("sxJdbcRollback", { connectionId });
};

const fxJdbcSetAutoCommit = (connectionId, autoCommit) => {
  debugLog(`fxJdbcSetAutoCommit connectionId: "${connectionId}", autoCommit: ${autoCommit}`);
  return safeCallSync("sxJdbcSetAutoCommit", { connectionId, autoCommit });
};

const fxJdbcClose = (connectionId) => {
  debugLog(`fxJdbcClose connectionId: "${connectionId}"`);
  return safeCallSync("sxJdbcClose", { connectionId });
};

const fxSheets = (args) => {
  debugLog("fxSheets executing with args:", args);
  const result = fxGeneric({
    ...args,
    serviceName: "Sheets",
    cacher: sheetsCacher,
    idField: "spreadsheetId",
  });

  if (
    (args.method === "create" || args.method === "copy") &&
    result?.data?.spreadsheetId
  ) {
    if (ScriptApp.__behavior?.sandBoxMode) {
      debugLog(`fxSheets registering created spreadsheet ${result.data.spreadsheetId} in sandbox`);
      ScriptApp.__behavior.addFile(result.data.spreadsheetId);
    }
  }

  return result;
};

const fxSlides = (args) =>
  fxGeneric({
    ...args,
    serviceName: "Slides",
    cacher: slidesCacher,
    idField: "presentationId",
  });

const fxDocs = (args) =>
  fxGeneric({
    ...args,
    serviceName: "Docs",
    cacher: docsCacher,
    idField: "documentId",
  });

const fxForms = (args) =>
  fxGeneric({
    ...args,
    serviceName: "Forms",
    cacher: formsCacher,
    idField: "formId",
  });

const fxGmail = (args) =>
  fxGeneric({
    ...args,
    serviceName: "Gmail",
    cacher: gmailCacher,
    idField: "id",
  });

const fxCalendar = (args) =>
  fxGeneric({
    ...args,
    serviceName: "Calendar",
    cacher: calendarCacher,
    idField: "calendarId",
  });

const fxBigQuery = (args) =>
  fxGeneric({
    ...args,
    serviceName: "BigQuery",
    cacher: bigqueryCacher,
    idField: "projectId",
  });

export const Syncit = {
  fxFetch,
  fxFetchAll,
  fxDrive,
  fxDriveMedia,
  fxDriveGet,
  fxInit,
  fxStore,
  fxZipper,
  fxUnzipper,
  fxStreamUpMedia,
  fxSheets,
  fxSlides,
  fxRefreshToken,
  fxDocs,
  fxForms,
  fxGmail,
  fxCalendar,
  fxBigQuery,
  fxDriveExport,
  fxGetAccessToken,
  fxGetAccessTokenInfo,
  fxGetSourceAccessTokenInfo,
  fxTestRetry,
  fxJdbcConnect,
  fxJdbcQuery,
  fxJdbcExecutePrepared,
  fxJdbcCommit,
  fxJdbcRollback,
  fxJdbcSetAutoCommit,
  fxJdbcClose,
};