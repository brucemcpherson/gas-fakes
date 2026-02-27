/**
 * DRIVE
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */

import { responseSyncify } from './auth.js';
import { sxRetry } from './sxretry.js';
import intoStream from 'into-stream';
import { getStreamAsBuffer } from 'get-stream';
import { syncWarn, syncError, syncLog } from './workersync/synclogger.js';
import { getDriveApiClient } from '../services/advdrive/drapis.js';
import { translateFieldsToV2 } from './utils.js';
import { KSuiteDrive } from './ksuite/kdrive.js';

const handleKSuiteDrive = async (Auth, { prop, method, params }) => {
  const token = process.env.KSUITE_TOKEN;
  const kDrive = new KSuiteDrive(token);

  if (method === 'getDriveId') {
    const driveId = await kDrive.getDriveId();
    return { data: driveId, response: { status: 200 } };
  }

  if (prop === 'files' && method === 'get') {
    // Be very flexible about where 'alt' might be
    const isMedia = params.alt === 'media' || (params.params && params.params.alt === 'media');
    
    if (isMedia) {
      const data = await kDrive.downloadFile(params.fileId);
      return {
        data: Array.from(data),
        response: { status: 200 }
      };
    }
    const data = await kDrive.getFile(params.fileId);
    return {
      data,
      response: { status: 200 }
    };
  }

  if (prop === 'files' && method === 'list') {
    // extract filters from q
    let parentId = null;
    let mimeTypeFilter = null;
    let mimeTypeExclude = false;
    let nameFilter = null;

    if (params.q) {
      const parentMatch = params.q.match(/'([^']*)' in parents/);
      if (parentMatch) parentId = parentMatch[1];

      const mimeMatch = params.q.match(/mimeType\s*(!?=)\s*'([^']*)'/);
      if (mimeMatch) {
        mimeTypeExclude = mimeMatch[1] === '!=';
        mimeTypeFilter = mimeMatch[2];
      }

      const nameMatch = params.q.match(/name\s*=\s*'([^']*)'/);
      if (nameMatch) nameFilter = nameMatch[1];
    }
    
    // Per user instruction: stay within private root.
    // If parentId is not specified, we do a recursive search from the Private root
    // to emulate GAS DriveApp.getFiles() behavior.
    
    const getAllFilesRecursive = async (dirId, depth = 0) => {
      if (depth > 5) return []; // Limit depth to avoid infinite loops
      
      const result = await kDrive.listFiles(dirId);
      let files = result.files;
      
      const subDirs = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
      for (const dir of subDirs) {
        // Skip root references
        if (dir.id === '1' || dir.name === 'Private' || dir.name === 'Common') continue;
        const subFiles = await getAllFilesRecursive(dir.id, depth + 1);
        files = files.concat(subFiles);
      }
      return files;
    };

    let files;
    if (parentId && parentId !== 'root') {
      const result = await kDrive.listFiles(parentId);
      files = result.files;
    } else {
      // Global search or root search - recurse from Private root
      const rootId = await kDrive.getPrivateRootId();
      files = await getAllFilesRecursive(rootId);
    }

    // Manual filtering
    if (mimeTypeFilter) {
      files = files.filter(f => {
        const isFolder = f.mimeType === 'application/vnd.google-apps.folder';
        const match = f.mimeType === mimeTypeFilter || (mimeTypeFilter === 'application/vnd.google-apps.folder' && isFolder);
        return mimeTypeExclude ? !match : match;
      });
    }

    if (nameFilter) {
      files = files.filter(f => f.name === nameFilter);
    }

    return {
      data: {
        files,
        nextPageToken: null 
      },
      response: { status: 200 }
    };
  }

  if (prop === 'files' && method === 'create') {
    // Check if it's a directory
    const isDir = params.resource?.mimeType === 'application/vnd.google-apps.folder';
    if (isDir) {
      const parentId = params.resource?.parents?.[0];
      const data = await kDrive.createDirectory(parentId, params.resource.name);
      return {
        data,
        response: { status: 200 }
      };
    }
  }

  if (prop === 'files' && method === 'update') {
    if (params.resource && Reflect.has(params.resource, 'trashed')) {
      if (params.resource.trashed) {
        await kDrive.deleteFile(params.fileId);
      } else {
        await kDrive.restoreFile(params.fileId);
      }
      const data = await kDrive.getFile(params.fileId);
      return {
        data,
        response: { status: 200 }
      };
    }

    if (params.resource && params.resource.name) {
      await kDrive.renameFile(params.fileId, params.resource.name);
      const data = await kDrive.getFile(params.fileId);
      return {
        data,
        response: { status: 200 }
      };
    }

    // Handle moveTo (addParents/removeParents)
    if (params.addParents) {
      const data = await kDrive.moveFile(params.fileId, params.addParents);
      return {
        data,
        response: { status: 200 }
      };
    }
  }

  if (prop === 'files' && method === 'copy') {
    const parentId = params.resource?.parents?.[0];
    const data = await kDrive.copyFile(params.fileId, parentId, params.resource?.name);
    return {
      data,
      response: { status: 200 }
    };
  }

  if (prop === 'permissions') {
    if (method === 'list') {
      const shareLink = await kDrive.getShareLink(params.fileId);
      const effUser = Auth.getEffectiveUser();
      const permissions = [
        {
          id: 'owner',
          type: 'user',
          role: 'owner',
          emailAddress: effUser.email,
          displayName: effUser.name || effUser.email
        }
      ];
      if (shareLink) {
        permissions.push({
          id: 'anyoneWithLink',
          type: 'anyone',
          role: shareLink.capabilities?.can_edit ? 'writer' : (shareLink.capabilities?.can_comment ? 'commenter' : 'reader'),
          allowFileDiscovery: false
        });
      }
      return {
        data: { permissions },
        response: { status: 200 }
      };
    }

    if (method === 'create') {
      if (params.resource.type === 'anyone') {
        const settings = {
          can_edit: params.resource.role === 'writer',
          can_comment: params.resource.role === 'commenter',
          right: 'public'
        };
        const data = await kDrive.createShareLink(params.fileId, settings);
        return {
          data: { id: 'anyoneWithLink', ...params.resource },
          response: { status: 200 }
        };
      }
    }

    if (method === 'delete') {
      if (params.permissionId === 'anyoneWithLink') {
        await kDrive.deleteShareLink(params.fileId);
        return {
          data: {},
          response: { status: 204 }
        };
      }
    }

    if (method === 'update') {
      if (params.permissionId === 'anyoneWithLink') {
        const settings = {
          can_edit: params.resource.role === 'writer',
          can_comment: params.resource.role === 'commenter'
        };
        await kDrive.updateShareLink(params.fileId, settings);
        return {
          data: { id: 'anyoneWithLink', ...params.resource },
          response: { status: 200 }
        };
      }
    }
  }

  throw new Error(`KSuite Drive API ${prop}.${method} not implemented in POC`);
};

export const sxDrive = async (Auth, { prop, method, params, options }) => {

  if (Auth.getPlatform() === 'ksuite') {
    return handleKSuiteDrive(Auth, { prop, method, params, options });
  }

  const apiClient = getDriveApiClient();
  const tag = `sxDrive for ${prop}.${method}`;

  return sxRetry(Auth, tag, async () => {
    return apiClient[prop][method](params, options);
  }, {
    extraRetryCheck: (error, response) => {
      // handle invalid field selection - sometimes old files dont support createdTime or modifiedTime
      // we'll try to fallback to createdDate and modifiedDate
      const isInvalidField = error?.message?.includes("Invalid field selection") && (params?.fields?.includes("createdTime") || params?.fields?.includes("modifiedTime"));

      if (isInvalidField) {
        const fileId = params?.fileId ? ` for file ${params.fileId}` : "";
        syncWarn(`Invalid field selection error on Drive API call ${prop}.${method}${fileId}. Retrying with v2 field names...`);
        params.fields = translateFieldsToV2(params.fields);
        return true;
      }
      return false;
    }
  });
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

export const sxStreamUpMedia = async (Auth, { resource, bytes, fields, method, mimeType, fileId, params }) => {

  if (Auth.getPlatform() === 'ksuite') {
    const isDir = (resource?.mimeType || mimeType) === 'application/vnd.google-apps.folder';
    const token = process.env.KSUITE_TOKEN;
    const kDrive = new KSuiteDrive(token);
    const parentId = resource?.parents?.[0];

    if (method === 'update') {
      if (resource?.name) {
        const data = await kDrive.renameFile(fileId, resource.name);
        return {
          data: { ...data, id: fileId, name: resource.name },
          response: { status: 200 }
        };
      }
      
      if (resource && Reflect.has(resource, 'trashed')) {
        if (resource.trashed) {
          await kDrive.deleteFile(fileId);
        } else {
          await kDrive.restoreFile(fileId);
        }
        const data = await kDrive.getFile(fileId);
        return {
          data,
          response: { status: 200 }
        };
      }

      // Handle moveTo (addParents/removeParents)
      if (params && params.addParents) {
        const data = await kDrive.moveFile(fileId, params.addParents);
        return {
          data,
          response: { status: 200 }
        };
      }

      // Handle media update (setContent)
      if (bytes) {
        const data = await kDrive.uploadFile(null, null, bytes, null, fileId);
        return {
          data,
          response: { status: 200 }
        };
      }
      
      // If resource is empty or doesn't have supported fields for update, just return current metadata
      if (!resource || Object.keys(resource).length === 0) {
        const data = await kDrive.getFile(fileId);
        return {
          data,
          response: { status: 200 }
        };
      }

      // other updates not yet implemented
      throw new Error(`sxStreamUpMedia: update method for KSuite not fully implemented (fileId: ${fileId}, resource: ${JSON.stringify(resource)})`);
    }

    if (isDir) {
      const data = await kDrive.createDirectory(parentId, resource?.name);
      return {
        data,
        response: { status: 200 }
      };
    } else {
      const data = await kDrive.uploadFile(parentId, resource?.name || 'Untitled', bytes, resource?.mimeType || mimeType);
      return {
        data,
        response: { status: 200 }
      };
    }
  }

  // this is the node drive service
  const drive = getDriveApiClient()

  // set up the media
  // if there is no media, it will create an empty version of the file
  let media = null
  if (bytes) {
    const buffer = Buffer.from(bytes)
    const body = intoStream(buffer)
    media = {
      mimeType,
      body
    }
  }

  try {
    const pack = {
      resource,
      fields,
      fileId,
      media,
      ...params
    }

    const created = await drive.files[method](pack)
    return {
      data: created.data,
      response: responseSyncify(created)
    }

  } catch (err) {
    syncError('failed in syncit fxStreamUpMedia', err);
    const response = err?.response
    return {
      data: null,
      response: responseSyncify(response)
    }
  }

}
const sxStreamer = async ({
  params,
  options = {},
  method = 'get' }) => {
  // this is the node drive service
  const drive = getDriveApiClient();
  const streamed = await drive.files[method](params, {
    responseType: 'stream',
    ...options
  })
  const response = responseSyncify(streamed)
  if (response.status === 200) {
    const buf = await getStreamAsBuffer(streamed.data)
    const data = Array.from(buf)

    return {
      data,
      response
    }
  } else {
    return {
      data: null,
      response
    }
  }
}
/**
 * sync a call to export data from drive
 * @param {object} p pargs
 * @param {string} p.id file id
 * @return {SxResult} from the api
 */
export const sxDriveExport = async (Auth, { id: fileId, mimeType }) => {

  if (Auth.getPlatform() === 'ksuite') {
     throw new Error('sxDriveExport not implemented for KSuite in POC');
  }

  return sxStreamer({
    params: {
      fileId,
      mimeType
    }, method: 'export'
  })

}
/**
 * sync a call to download data from drive
 * @param {object} p pargs
 * @param {string} p.id file id
 * @return {SxResult} from the api
 */
export const sxDriveMedia = async (Auth, { id: fileId }) => {

  if (Auth.getPlatform() === 'ksuite') {
    const token = process.env.KSUITE_TOKEN;
    const kDrive = new KSuiteDrive(token);
    const data = await kDrive.downloadFile(fileId);
    const meta = await kDrive.getFile(fileId);
    return {
      data: Array.from(data),
      metadata: meta,
      response: { status: 200 }
    };
  }

  return sxStreamer({
    params: {
      fileId,
      alt: 'media'
    }, method: 'get'
  })

}


export const sxDriveGet = (Auth, { id, params, options }) => {
  return sxDrive(Auth, {
    prop: "files",
    method: "get",
    params: { ...params, fileId: id },
    options
  });
};
