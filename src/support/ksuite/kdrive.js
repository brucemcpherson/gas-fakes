import got from "got";
import { syncWarn, syncError } from "../workersync/synclogger.js";
import { Proxies } from "../proxies.js";
import { isFolder, folderType } from "../helpers.js";

class KSuiteDrive {
  constructor({ token, effectiveUser }) {
    this.token = token;
    this.__effectiveUser = effectiveUser;
    this.baseUrl = "https://api.infomaniak.com";
    this.__accountId = null;
    this.__driveId = null;
    this.__privateRootId = null;
    this.__files = newKSuiteFiles(this);
    this.__permissions = newKSuitePermissions(this);
  }

  get files() {
    return this.__files;
  }

  get permissions() {
    return this.__permissions;
  }

  /**
   * Centralized HTTP request handler
   * @private
   */
  async _request(method, path, options = {}) {
    const url = path.startsWith("http") ? path : `${this.baseUrl}${path}`;
    const { headers, responseType, suppressSyncError, ...otherOptions } =
      options;

    const requestOptions = {
      method: method.toUpperCase(),
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...headers,
      },
      responseType: responseType || "json",
      ...otherOptions,
    };

    try {
      return await got(url, requestOptions);
    } catch (err) {
      let msg = `KSuite API Error [${method} ${path}]: ${err.message}`;
      if (err.response?.body) {
        const body =
          typeof err.response.body === "object"
            ? JSON.stringify(err.response.body)
            : String(err.response.body);
        msg += ` - Response: ${body}`;
      }

      const error = new Error(msg);
      error.statusCode = err.response?.statusCode || err.statusCode;
      error.code =
        err.response?.body?.error?.code || err.response?.body?.code || err.code;
      error.response = err.response;

      if (!suppressSyncError && typeof syncError === "function") {
        syncError(msg);
      }

      throw error;
    }
  }

  async getAccountId() {
    if (this.__accountId) return this.__accountId;

    try {
      const response = await this._request("GET", "/1/account");
      const data = response.body.data;
      const account_id = Array.isArray(data)
        ? data[0]?.account_id || data[0]?.id
        : data?.account_id || data?.id;

      if (account_id) {
        this.__accountId = String(account_id);
        return this.__accountId;
      }
    } catch (err) {
      syncWarn(`Account discovery failed: ${err.message}`);
    }
    return null;
  }

  async getDriveId() {
    if (this.__driveId) return this.__driveId;

    try {
      const response = await this._request("GET", "/2/drive/preferences");
      if (response.body.data?.default_drive) {
        this.__driveId = String(response.body.data.default_drive);
        return this.__driveId;
      }
    } catch (err) {}

    const accountId = await this.getAccountId();
    try {
      const response = await this._request("GET", "/2/drive", {
        searchParams: accountId ? { account_id: accountId } : {},
      });
      if (response.body.data?.[0]?.id) {
        this.__driveId = String(response.body.data[0].id);
        return this.__driveId;
      }
    } catch (err) {}

    throw new Error("KSuite Drive ID discovery failed.");
  }

  async getPrivateRootId() {
    if (this.__privateRootId) return this.__privateRootId;

    const driveId = await this.getDriveId();
    try {
      const response = await this._request(
        "GET",
        `/3/drive/${driveId}/files/1/files`,
      );
      const files = response.body.data || [];
      const privateFolder = files.find(
        (f) => f.name === "Private" || f.type === "private",
      );

      this.__privateRootId = privateFolder ? String(privateFolder.id) : "1";
      return this.__privateRootId;
    } catch (err) {
      syncWarn(
        `Private root discovery failed, falling back to 1: ${err.message}`,
      );
      return "1";
    }
  }

  translateFile(kFile) {
    if (!kFile) return null;
    const id = kFile.id ? String(kFile.id) : undefined;
    const kFolder =
      kFile.type === "dir" ||
      kFile.type === "private" ||
      kFile.type === "common";

    const __platformCustom = { ...kFile };
    const createdAt = kFile.created_at || kFile.added_at;
    const modifiedAt = kFile.last_modified_at || kFile.updated_at;

    return {
      id,
      downloadUri: kFolder
        ? null
        : `https://api.infomaniak.com/2/drive/${kFile.drive_id}/files/${id}/download`,
      name: kFile.name || (id === "1" ? "kDrive Root" : ""),
      mimeType: kFolder
        ? folderType
        : kFile.mime_type || "application/octet-stream",
      kind: "drive#file",
      createdTime: createdAt ? new Date(createdAt * 1000).toISOString() : null,
      modifiedTime: modifiedAt
        ? new Date(modifiedAt * 1000).toISOString()
        : null,
      size: String(kFile.size || 0),
      parents: kFile.parent_id ? [String(kFile.parent_id)] : [],
      trashed: kFile.status === "trashed" || kFile.status === "trash_inherited",
      capabilities: { canEdit: true, canRename: true },
      platform: "ksuite",
      __platformCustom,
    };
  }
}

class KSuiteFiles {
  constructor(drive) {
    this.drive = drive;
  }

  async getFile(fileId) {
    const driveId = await this.drive.getDriveId();
    const isRoot = fileId === "root";
    const actualId = isRoot ? await this.drive.getPrivateRootId() : fileId;

    try {
      const response = await this.drive._request(
        "GET",
        `/3/drive/${driveId}/files/${actualId}`,
        { suppressSyncError: true },
      );
      return this.drive.translateFile(response.body.data);
    } catch (err) {
      if (err.statusCode === 404) {
        try {
          // Query the trash endpoint if not found in active files
          const trashResponse = await this.drive._request(
            "GET",
            `/3/drive/${driveId}/trash/${actualId}`,
            { suppressSyncError: true },
          );
          const translated = this.drive.translateFile(trashResponse.body.data);
          if (translated) {
            translated.trashed = true;
            return translated;
          }
        } catch (trashErr) {
          // Fall through to rethrow the original 404 error
        }
      }
      throw err;
    }
  }

  async get(params = {}) {
    if (!params?.fileId) {
      throw new Error(
        `fileId required for get operation: ${JSON.stringify(params, null, 2)}`,
      );
    }

    const isMedia =
      params.alt === "media" ||
      (params.params && params.params.alt === "media");

    if (isMedia) {
      const data = await this.downloadFile(params.fileId);
      const resultArray = Array.from(data);

      // Attach platform property to the array object so the validator sees it
      Object.defineProperty(resultArray, "platform", {
        value: "ksuite",
        enumerable: true,
        writable: true,
        configurable: true,
      });

      return {
        data: resultArray,
        response: { status: 200 },
      };
    }

    const data = await this.getFile(params.fileId);
    return {
      data,
      response: { status: 200 },
    };
  }

  async listFiles(parentId, params = {}) {
    const driveId = await this.drive.getDriveId();
    const actualParentId =
      parentId === "root" || !parentId
        ? await this.drive.getPrivateRootId()
        : parentId;

    const response = await this.drive._request(
      "GET",
      `/3/drive/${driveId}/files/${actualParentId}/files`,
      { searchParams: params },
    );

    return {
      files: (response.body.data || []).map((f) => this.drive.translateFile(f)),
      nextPageToken: response.body.pagination?.next
        ? String(response.body.pagination.page + 1)
        : null,
    };
  }

  async list(params = {}) {
    let parentId = null;
    let mimeTypeFilter = null;
    let mimeTypeExclude = false;
    let nameFilter = null;

    if (params.q) {
      const parentMatch = params.q.match(/'([^']*)' in parents/);
      if (parentMatch) parentId = parentMatch[1];

      const mimeMatch = params.q.match(/mimeType\s*(!?=)\s*'([^']*)'/);
      if (mimeMatch) {
        mimeTypeExclude = mimeMatch[1] === "!=";
        mimeTypeFilter = mimeMatch[2];
      }

      const nameMatch = params.q.match(/name\s*=\s*'([^']*)'/);
      if (nameMatch) nameFilter = nameMatch[1];
    }

    const getAllFilesRecursive = async (dirId, depth = 0) => {
      if (depth > 5) return [];

      const result = await this.listFiles(dirId);
      let files = result.files;

      const subDirs = files.filter(isFolder);
      for (const dir of subDirs) {
        if (dir.id === "1" || dir.name === "Private" || dir.name === "Common")
          continue;
        const subFiles = await getAllFilesRecursive(dir.id, depth + 1);
        files = files.concat(subFiles);
      }
      return files;
    };

    let files;
    if (parentId && parentId !== "root") {
      const result = await this.listFiles(parentId);
      files = result.files;
    } else {
      const rootId = await this.drive.getPrivateRootId();
      files = await getAllFilesRecursive(rootId);
    }

    if (mimeTypeFilter) {
      files = files.filter((f) => {
        const match =
          f.mimeType === mimeTypeFilter ||
          (isFolder({ mimeType: mimeTypeFilter }) && isFolder(f));
        return mimeTypeExclude ? !match : match;
      });
    }

    if (nameFilter) {
      files = files.filter((f) => f.name === nameFilter);
    }

    return {
      data: { files, nextPageToken: null },
      response: { status: 200 },
    };
  }

  /**
   * Internal retry-handled creation method for files and directories
   * @private
   */
  async _createWithRetry({
    parentId,
    name,
    isDir,
    isUpload = false,
    content,
    mimeType,
    fileId,
  }) {
    const driveId = await this.drive.getDriveId();
    const actualParentId =
      parentId === "root" || !parentId
        ? await this.drive.getPrivateRootId()
        : parentId;

    if (!isDir && !isUpload && content === undefined) {
      isUpload = true;
      content = "";
    }

    const buffer = isUpload ? Buffer.from(content || "") : null;
    let currentName = name;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        let endpoint;
        let requestOptions = { suppressSyncError: true };

        if (isUpload) {
          endpoint = `/3/drive/${driveId}/upload`;
          const searchParams = { total_size: buffer.length };

          if (mimeType) searchParams.mimetype = mimeType;

          if (fileId) {
            searchParams.file_id = fileId;
          } else {
            searchParams.directory_id = actualParentId;
            searchParams.file_name = currentName;
            searchParams.conflict = "rename";
          }

          requestOptions = {
            ...requestOptions,
            headers: { "Content-Type": "application/octet-stream" },
            searchParams,
            body: buffer,
          };
        } else if (isDir) {
          endpoint = `/3/drive/${driveId}/files/${actualParentId}/directory`;
          requestOptions.json = { name: currentName };
        }

        const response = await this.drive._request(
          "POST",
          endpoint,
          requestOptions,
        );
        const data = response.body.data;

        return this.drive.translateFile(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        const isDuplicate =
          err.statusCode === 400 ||
          err.statusCode === 409 ||
          err.code === "destination_already_exists";

        if (!isDuplicate || fileId) {
          if (typeof syncError === "function") syncError(err.message);
          throw err;
        }

        attempts++;
        const dotIndex = name ? name.lastIndexOf(".") : -1;
        if (!isDir && dotIndex > 0) {
          const base = name.substring(0, dotIndex);
          const ext = name.substring(dotIndex);
          currentName = `${base} (${Date.now()})${ext}`;
        } else {
          currentName = `${name} (${Date.now()})`;
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    const finalMsg = `Failed operation after ${maxAttempts} attempts due to unhandled name collisions.`;
    if (typeof syncError === "function") syncError(finalMsg);
    throw new Error(finalMsg);
  }

  async createDirectory(parentId, name) {
    return this._createWithRetry({ parentId, name, isDir: true });
  }

  async createEmptyFile(parentId, name) {
    return this._createWithRetry({ parentId, name, isDir: false });
  }

  async uploadFile(parentId, name, content, mimeType, fileId = null) {
    return this._createWithRetry({
      parentId,
      name,
      content,
      mimeType,
      fileId,
      isDir: false,
      isUpload: true,
    });
  }

  async create(params = {}) {
    const isDir = isFolder(params.resource);
    const parentId = params.resource?.parents?.[0];
    const name = params.resource?.name;
    const content = params.content;
    const mimeType = params.mimeType || params.resource?.mimeType;

    const data =
      content !== undefined
        ? await this.uploadFile(parentId, name, content, mimeType)
        : await this._createWithRetry({ parentId, name, isDir });

    return {
      data,
      response: { status: 200 },
    };
  }

async deleteFile(fileId) {
  const driveId = await this.drive.getDriveId();
  try {
    // 1. Try deleting / trashing from active files
    await this.drive._request(
      "DELETE",
      `/2/drive/${driveId}/files/${fileId}`,
      { suppressSyncError: true }
    );
    return true;
  } catch (err) {
    if (err.statusCode === 404) {
      // 2. Check if the file actually exists in the Trash
      try {
        await this.drive._request(
          "GET",
          `/3/drive/${driveId}/trash/${fileId}`,
          { suppressSyncError: true }
        );
        // If it exists in the trash, trashing it again is an idempotent success!
        return true;
      } catch (trashErr) {
        // File is NOT in active files AND NOT in trash -> It really does not exist!
      }
    }

    // 3. Re-log and throw genuine non-existent / 404 or server errors back to caller
    if (typeof syncError === "function") {
      syncError(err.message);
    }
    throw err;
  }
}

  async downloadFile(fileId) {
    const driveId = await this.drive.getDriveId();
    const response = await this.drive._request(
      "GET",
      `/2/drive/${driveId}/files/${fileId}/download`,
      { responseType: "buffer" },
    );
    return response.body;
  }

  async restoreFile(fileId) {
    const driveId = await this.drive.getDriveId();
    const response = await this.drive._request(
      "POST",
      `/2/drive/${driveId}/trash/${fileId}/restore`,
    );
    return this.drive.translateFile(response.body.data);
  }

  async renameFile(fileId, name) {
    const driveId = await this.drive.getDriveId();
    await this.drive._request(
      "POST",
      `/2/drive/${driveId}/files/${fileId}/rename`,
      {
        json: { name },
      },
    );
    return await this.getFile(fileId);
  }

  async moveFile(fileId, destinationParentId) {
    const driveId = await this.drive.getDriveId();
    const destId =
      destinationParentId === "root" || !destinationParentId
        ? await this.drive.getPrivateRootId()
        : destinationParentId;

    await this.drive._request(
      "POST",
      `/3/drive/${driveId}/files/${fileId}/move/${destId}`,
      { json: { conflict: "rename" } },
    );
    const file = await this.getFile(fileId);
    if (file) file.parents = [String(destId)];
    return file;
  }

  async copyFile(fileId, destinationParentId, name) {
    const driveId = await this.drive.getDriveId();
    const destId =
      destinationParentId === "root" || !destinationParentId
        ? await this.drive.getPrivateRootId()
        : destinationParentId;

    const response = await this.drive._request(
      "POST",
      `/3/drive/${driveId}/files/${fileId}/copy/${destId}`,
      { json: name ? { name } : {} },
    );
    return this.drive.translateFile(response.body.data);
  }

  async update(params = {}) {
    const { fileId, resource, bytes } = params;
    if (!fileId) {
      throw new Error(
        `No fileId provided for update ${JSON.stringify(params)}`,
      );
    }
    if (resource && Reflect.has(resource, "trashed")) {
      if (resource.trashed) {
        await this.deleteFile(fileId);
      } else {
        await this.restoreFile(fileId);
      }
      const data = await this.getFile(fileId);
      return {
        data,
        response: { status: 200 },
      };
    }

    if (resource?.name) {
      const data = await this.renameFile(fileId, resource.name);
      return {
        data: { ...data, id: fileId, name: resource.name },
        response: { status: 200 },
      };
    }

    if (params.resource && Reflect.has(params.resource, "trashed")) {
      if (params.resource.trashed) {
        await this.deleteFile(fileId);
      } else {
        await this.restoreFile(fileId);
      }
      const data = await this.getFile(fileId);
      return {
        data,
        response: { status: 200 },
      };
    }

    if (params.addParents) {
      const data = await this.moveFile(fileId, params.addParents);
      return {
        data,
        response: { status: 200 },
      };
    }

    if (bytes) {
      const data = await this.uploadFile(null, null, bytes, null, fileId);
      return {
        data,
        response: { status: 200 },
      };
    }

    if (!resource || Object.keys(resource).length === 0) {
      const data = await this.getFile(fileId);
      return {
        data,
        response: { status: 200 },
      };
    }

    throw new Error(
      `sxStreamUpMedia: update method for KSuite not fully implemented (fileId: ${fileId}, resource: ${JSON.stringify(resource)})`,
    );
  }

  async copy(params) {
    const { fileId } = params;
    if (!fileId) {
      throw new Error(`No fileId provided for copy ${JSON.stringify(params)}`);
    }
    const parentId = params.resource?.parents?.[0];
    const data = await this.copyFile(fileId, parentId, params.resource?.name);
    return {
      data,
      response: { status: 200 },
    };
  }
}

class KSuitePermissions {
  constructor(drive) {
    this.drive = drive;
  }

  async getShareLink(fileId) {
    const driveId = await this.drive.getDriveId();
    try {
      const response = await this.drive._request(
        "GET",
        `/2/drive/${driveId}/files/${fileId}/link`,
        { suppressSyncError: true },
      );
      return response.body.data;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 400) return null;
      throw err;
    }
  }

  async createShareLink(fileId, settings = {}) {
    const driveId = await this.drive.getDriveId();
    const response = await this.drive._request(
      "POST",
      `/2/drive/${driveId}/files/${fileId}/link`,
      {
        json: {
          right: "public",
          can_download: true,
          can_see_info: true,
          ...settings,
        },
      },
    );
    return response.body.data;
  }

  async updateShareLink(fileId, settings = {}) {
    const driveId = await this.drive.getDriveId();
    const response = await this.drive._request(
      "PUT",
      `/2/drive/${driveId}/files/${fileId}/link`,
      { json: settings },
    );
    return response.body.data;
  }

  async deleteShareLink(fileId) {
    const driveId = await this.drive.getDriveId();
    await this.drive._request(
      "DELETE",
      `/2/drive/${driveId}/files/${fileId}/link`,
    );
    return true;
  }

  async list(params = {}) {
    const { fileId } = params;
    if (!fileId) {
      throw new Error(`No fileId provided for list ${JSON.stringify(params)}`);
    }

    const shareLink = await this.getShareLink(fileId);
    const effUser = this.drive.__effectiveUser;
    const permissions = [
      {
        id: "owner",
        type: "user",
        role: "owner",
        emailAddress: effUser?.email,
        displayName: effUser?.name || effUser?.email,
      },
    ];

    if (shareLink) {
      permissions.push({
        id: "anyoneWithLink",
        type: "anyone",
        role: shareLink.capabilities?.can_edit
          ? "writer"
          : shareLink.capabilities?.can_comment
            ? "commenter"
            : "reader",
        allowFileDiscovery: false,
      });
    }

    return {
      data: { permissions },
      response: { status: 200 },
    };
  }

  async create(params = {}) {
    const { resource } = params;
    if (!resource) {
      throw new Error(
        `no resource to create permissions in params ${JSON.stringify(params)}`,
      );
    }
    if (resource.type === "anyone") {
      const settings = {
        can_edit: resource.role === "writer",
        can_comment: resource.role === "commenter",
        right: "public",
      };
      await this.createShareLink(params.fileId, settings);
      return {
        data: { id: "anyoneWithLink", ...params.resource },
        response: { status: 200 },
      };
    }
  }

  async delete(params = {}) {
    const { permissionId, fileId } = params;
    if (!permissionId) {
      throw new Error(
        `no permissionId provided for delete ${JSON.stringify(params)}`,
      );
    }
    if (permissionId === "anyoneWithLink") {
      await this.deleteShareLink(fileId);
      return {
        data: {},
        response: { status: 204 },
      };
    }
  }

  async update(params = {}) {
    const { permissionId, fileId, resource } = params;
    if (!fileId) {
      throw new Error(
        `no fileId provided for update ${JSON.stringify(params)}`,
      );
    }
    if (!resource) {
      throw new Error(
        `no resource to update permissions in params ${JSON.stringify(params)}`,
      );
    }
    if (!permissionId) {
      throw new Error(
        `no permissionId provided for update ${JSON.stringify(params)}`,
      );
    }
    if (permissionId === "anyoneWithLink") {
      const settings = {
        can_edit: resource.role === "writer",
        can_comment: resource.role === "commenter",
      };
      await this.updateShareLink(fileId, settings);
      return {
        data: { id: "anyoneWithLink", ...resource },
        response: { status: 200 },
      };
    }
  }
}

export const newKSuiteDrive = (...args) => {
  return Proxies.guard(new KSuiteDrive(...args));
};

const newKSuiteFiles = (...args) => {
  return Proxies.guard(new KSuiteFiles(...args));
};

const newKSuitePermissions = (...args) => {
  return Proxies.guard(new KSuitePermissions(...args));
};
