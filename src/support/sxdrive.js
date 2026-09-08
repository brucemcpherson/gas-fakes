/**
 * DRIVE
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */

import { responseSyncify } from "./auth.js";
import { sxRetry } from "./sxretry.js";
import intoStream from "into-stream";
import { getStreamAsBuffer } from "get-stream";
import { syncWarn, syncError, syncLog } from "./workersync/synclogger.js";
import { getDriveApiClient } from "../services/advdrive/drapis.js";
import { translateFieldsToV2 } from "./utils.js";
import {
  handleKSuiteDrive,
  handleKSuiteStream,
} from "./ksuite/handleksuite.js";

import { handleCodaDrive } from "./coda/codadrive.js";
import { sxOneDriveStreamUpMedia, sxOneDriveMedia, handleOneDrive } from "./msgraph/sxonedrive.js";


export const sxDrive = async (Auth, { prop, method, params, options }) => {
  if (Auth.getPlatform() === "ksuite") {
    return handleKSuiteDrive(Auth, { prop, method, params, options });
  }

  if (Auth.getPlatform() === "msgraph") {
    return handleOneDrive(Auth, { prop, method, params, options });
  }

  if (Auth.getPlatform() === "coda") {
    return handleCodaDrive(Auth, { prop, method, params, options });
  }

  const apiClient = getDriveApiClient();
  const tag = `sxDrive for ${prop}.${method}`;

  return sxRetry(
    Auth,
    tag,
    async () => {
      return apiClient[prop][method](params, options);
    },
    {
      extraRetryCheck: (error, response) => {
        // handle invalid field selection - sometimes old files dont support createdTime or modifiedTime
        // we'll try to fallback to createdDate and modifiedDate
        const isInvalidField =
          error?.message?.includes("Invalid field selection") &&
          (params?.fields?.includes("createdTime") ||
            params?.fields?.includes("modifiedTime"));

        if (isInvalidField) {
          const fileId = params?.fileId ? ` for file ${params.fileId}` : "";
          syncWarn(
            `Invalid field selection error on Drive API call ${prop}.${method}${fileId}. Retrying with v2 field names...`,
          );
          params.fields = translateFieldsToV2(params.fields);
          return true;
        }
        return false;
      },
    },
  );
};

/**
 * Drive api to stream a download
 * @param {object} p pargs
 * @param {string} p.method - update or create
 * @param {string} [p.resource] the file meta data
 * @param {blob} [p.bytes] the content
 * @param {string} [p.fields] the fields to return
 * @param {string} [p.mimeType] the mimeType to assign
 * @param {string} [p.fileId] the fileId - required of patching
 * @param {string} [p.drapisPath] the resolved path to the api code
 * @param {object} [p.params] any extra params
 * @return {DriveResponse} from the drive api
 */

export const sxStreamUpMedia = async (
  Auth,
  { resource, bytes, fields, method, mimeType, fileId, params },
) => {
  const platform = Auth.getPlatform();

  if (platform === "coda") {
    //we dont need to specify the prop here, as the handler will decide whether its a file or folder resource based on the mimeType
    return handleCodaDrive(Auth, {
      method,
      params,
      bytes,
      resource,
      mimeType,
      fileId,
    });
  }
  if (platform === "msgraph") {
    return sxOneDriveStreamUpMedia(Auth, {
      resource,
      bytes,
      method,
      mimeType,
      fileId,
      params,
    });
  }

  if (platform === "ksuite") {
    return handleKSuiteStream(Auth, {
      resource,
      bytes,
      fields,
      method,
      mimeType,
      fileId,
      params,
    });
  }

  // this is the node drive service
  const drive = getDriveApiClient();

  // set up the media
  // if there is no media, it will create an empty version of the file
  let media = null;
  if (bytes) {
    const buffer = Buffer.from(bytes);
    const body = intoStream(buffer);
    media = {
      mimeType,
      body,
    };
  }

  try {
    const pack = {
      resource,
      fields,
      fileId,
      media,
      ...params,
    };

    const created = await drive.files[method](pack);
    return {
      data: created.data,
      response: responseSyncify(created),
    };
  } catch (err) {
    syncError("failed in syncit fxStreamUpMedia", err);
    const response = err?.response;
    return {
      data: null,
      response: responseSyncify(response),
    };
  }
};
const sxStreamer = async ({ params, options = {}, method = "get" }) => {
  try {
    // this is the node drive service
    const drive = getDriveApiClient();
    const streamed = await drive.files[method](params, {
      responseType: "stream",
      ...options,
    });
    const response = responseSyncify(streamed);
    if (response.status === 200) {
      const buf = await getStreamAsBuffer(streamed.data);
      const data = Array.from(buf);

      return {
        data,
        response,
      };
    } else {
      return {
        data: null,
        response,
      };
    }
  } catch (err) {
    // We don't want to crash the worker if the API call fails
    // (e.g. exporting a non-exportable file)
    const response = responseSyncify(
      err?.response || { status: err?.code || 500, statusText: err?.message },
    );
    return {
      data: null,
      response,
      error: err?.response?.data || err?.message || err,
    };
  }
};
/**
 * sync a call to export data from drive
 * @param {object} p pargs
 * @param {string} p.id file id
 * @return {SxResult} from the api
 */
export const sxDriveExport = async (Auth, { id: fileId, mimeType }) => {
  if (Auth.getPlatform() === "ksuite") {
    throw new Error("sxDriveExport not implemented for KSuite in POC");
  }

  if (Auth.getPlatform() === "msgraph") {
    throw new Error("sxDriveExport not implemented for MS Graph in POC");
  }

  return sxStreamer({
    params: {
      fileId,
      mimeType,
    },
    method: "export",
  });
};
/**
 * sync a call to download data from drive
 * @param {object} p pargs
 * @param {string} p.id file id
 * @return {SxResult} from the api
 */
export const sxDriveMedia = async (Auth, { id: fileId }) => {
  
  if (Auth.getPlatform() === "msgraph") {
    return await sxOneDriveMedia(Auth, fileId);
  }

  if (Auth.getPlatform() === "ksuite") {
    return handleKSuiteStream(Auth, { fileId, method: "download" });
  }

  if (Auth.getPlatform() === "coda") {
  }

  return sxStreamer({
    params: {
      fileId,
      alt: "media",
    },
    method: "get",
  });
};

export const sxDriveGet = (Auth, { id, params, options }) => {
  return sxDrive(Auth, {
    prop: "files",
    method: "get",
    params: { ...params, fileId: id },
    options,
  });
};
