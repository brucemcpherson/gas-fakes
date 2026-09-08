import { OneDrive } from './onedrive.js';

/**
 * Utility check for directory/folder mime types
 */
const isFolder = (resource) =>
  resource?.mimeType === 'application/vnd.google-apps.folder';

/**
 * Main OneDrive Dispatcher for generic Drive API requests
 */
export const handleOneDrive = async (Auth, { prop, method, params = {} }) => {
  const token = await Auth.getAccessToken();
  const oneDrive = new OneDrive(token);

  if (prop === 'files' && method === 'get') {
    const isMedia =
      params.alt === 'media' ||
      (params.params && params.params.alt === 'media');

    if (isMedia) {
      const data = await oneDrive.downloadFile(params.fileId);
      return {
        data: Array.from(data),
        response: { status: 200 }
      };
    }
    const data = await oneDrive.getFile(params.fileId);
    return {
      data,
      response: { status: 200 }
    };
  }

  if (prop === 'files' && method === 'list') {
    let parentId = null;
    let nameFilter = null;
    let mimeOp = null;
    let mimeType = null;

    if (params.q) {
      const parentMatch = params.q.match(/'([^']*)' in parents/i);
      if (parentMatch) parentId = parentMatch[1];

      const mimeMatch = params.q.match(/mimeType\s*(!?=)\s*'([^']*)'/i);
      if (mimeMatch) {
        mimeOp = mimeMatch[1];
        mimeType = mimeMatch[2];
      }

      const nameMatch = params.q.match(/(?:name|title)\s*=\s*'([^']*)'/i);
      if (nameMatch) nameFilter = nameMatch[1];
    }

    const result = await oneDrive.listFiles(parentId, params);
    let files = result.files;

    if (mimeType) {
      files = files.filter((f) =>
        mimeOp === '!=' ? f.mimeType !== mimeType : f.mimeType === mimeType
      );
    }

    if (nameFilter) {
      const lowerFilter = nameFilter.toLowerCase().trim();
      files = files.filter(
        (f) => f.name && f.name.toLowerCase().trim() === lowerFilter
      );
    }

    return {
      data: {
        files,
        nextPageToken: result.nextLink
      },
      response: { status: 200 }
    };
  }

  if (prop === 'files' && method === 'create') {
    const isDir = isFolder(params.resource);
    if (isDir) {
      const parentId = params.resource?.parents?.[0];
      const data = await oneDrive.createDirectory(
        parentId,
        params.resource.name
      );
      return {
        data,
        response: { status: 200 }
      };
    }
  }

  if (prop === 'files' && method === 'update') {
    if (params.resource && params.resource.name) {
      const data = await oneDrive.renameFile(
        params.fileId,
        params.resource.name
      );
      return { data, response: { status: 200 } };
    }
    if (params.addParents) {
      const data = await oneDrive.moveFile(params.fileId, params.addParents);
      return { data, response: { status: 200 } };
    }
    if (params.resource && typeof params.resource.trashed === 'boolean') {
      if (params.resource.trashed) {
        await oneDrive.deleteFile(params.fileId);
      }
      return {
        data: { id: params.fileId, trashed: params.resource.trashed },
        response: { status: 200 }
      };
    }
  }

  if (prop === 'files' && method === 'copy') {
    const parentId = params.resource?.parents?.[0];
    const data = await oneDrive.copyFile(
      params.fileId,
      parentId,
      params.resource?.name
    );
    return { data, response: { status: 200 } };
  }

  throw new Error(`OneDrive API ${prop}.${method} not implemented`);
};

/**
 * Streaming media / file creation / update handler for OneDrive
 */
export const sxOneDriveStreamUpMedia = async (
  Auth,
  { resource, bytes, method, mimeType, fileId, params }
) => {
  const token = await Auth.getAccessToken();
  const oneDrive = new OneDrive(token);
  const parentId = resource?.parents?.[0];

  if (method === 'update') {
    if (resource?.name) {
      const data = await oneDrive.renameFile(fileId, resource.name);
      return {
        data: { ...data, id: fileId, name: resource.name },
        response: { status: 200 }
      };
    }
    if (params && params.addParents) {
      const data = await oneDrive.moveFile(fileId, params.addParents);
      return { data, response: { status: 200 } };
    }
    if (resource && typeof resource.trashed === 'boolean') {
      if (resource.trashed) {
        await oneDrive.deleteFile(fileId);
      }
      return {
        data: { id: fileId, trashed: resource.trashed },
        response: { status: 200 }
      };
    }
    if (bytes) {
      const data = await oneDrive.uploadFile(null, null, bytes, null, fileId);
      return { data, response: { status: 200 } };
    }
    const data = await oneDrive.getFile(fileId);
    return { data, response: { status: 200 } };
  }

  const isDir = isFolder(resource);
  if (isDir) {
    const data = await oneDrive.createDirectory(parentId, resource?.name);
    return { data, response: { status: 200 } };
  }

  const data = await oneDrive.uploadFile(
    parentId,
    resource?.name || 'Untitled',
    bytes,
    resource?.mimeType || mimeType
  );
  return { data, response: { status: 200 } };
};

/**
 * Downloading file content + metadata for OneDrive
 */
export const sxOneDriveMedia = async (Auth, fileId) => {
  const token = await Auth.getAccessToken();
  const oneDrive = new OneDrive(token);
  const data = await oneDrive.downloadFile(fileId);
  const meta = await oneDrive.getFile(fileId);
  return {
    data: Array.from(data),
    metadata: meta,
    response: { status: 200 }
  };
};