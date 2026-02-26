import got from 'got';
import { syncLog, syncWarn } from '../workersync/synclogger.js';

// Cache discovery results across instances in the worker
let cachedAccountId = process.env.KSUITE_ACCOUNT_ID || null;
let cachedDriveId = process.env.KSUITE_DRIVE_ID || null;
let cachedPrivateRootId = null;

export class KSuiteDrive {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://api.infomaniak.com';
  }

  /**
   * Centralized request handler to reduce duplication
   * @private
   */
  async _request(method, path, options = {}) {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const { headers, responseType, ...otherOptions } = options;
    
    const requestOptions = {
      method: method.toUpperCase(),
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...headers
      },
      responseType: responseType || 'json',
      ...otherOptions
    };

    try {
      return await got(url, requestOptions);
    } catch (err) {
      let msg = `KSuite API Error [${method} ${path}]: ${err.message}`;
      if (err.response?.body) {
        const body = typeof err.response.body === 'object' ? JSON.stringify(err.response.body) : String(err.response.body);
        msg += ` - Response: ${body}`;
      }
      // If it's a 404 or 400 we might want to handle it specifically in the caller
      // but we throw a standardized error here.
      const error = new Error(msg);
      error.statusCode = err.response?.statusCode;
      error.code = err.response?.body?.error?.code;
      throw error;
    }
  }

  async getAccountId() {
    if (cachedAccountId) return cachedAccountId;
    
    // Use the most reliable endpoint directly
    try {
      const response = await this._request('GET', '/1/account');
      const data = response.body.data;
      const account_id = Array.isArray(data) ? (data[0]?.account_id || data[0]?.id) : (data?.account_id || data?.id);
      
      if (account_id) {
        cachedAccountId = String(account_id);
        return cachedAccountId;
      }
    } catch (err) {
      syncWarn(`Account discovery failed: ${err.message}`);
    }
    return null;
  }

  async getDriveId() {
    if (cachedDriveId) return cachedDriveId;
    
    // 1. Try preferences first
    try {
      const response = await this._request('GET', '/2/drive/preferences');
      if (response.body.data?.default_drive) {
        cachedDriveId = String(response.body.data.default_drive);
        return cachedDriveId;
      }
    } catch (err) {}

    // 2. Fallback to listing drives
    const accountId = await this.getAccountId();
    try {
      const response = await this._request('GET', '/2/drive', {
        searchParams: accountId ? { account_id: accountId } : {}
      });
      if (response.body.data?.[0]?.id) {
        cachedDriveId = String(response.body.data[0].id);
        return cachedDriveId;
      }
    } catch (err) {}
    
    throw new Error('KSuite Drive ID discovery failed.');
  }

  async getPrivateRootId() {
    if (cachedPrivateRootId) return cachedPrivateRootId;

    const driveId = await this.getDriveId();
    try {
      const response = await this._request('GET', `/3/drive/${driveId}/files/1/files`);
      const files = response.body.data || [];
      const privateFolder = files.find(f => f.name === 'Private' || f.type === 'private');
      
      cachedPrivateRootId = privateFolder ? String(privateFolder.id) : '1';
      return cachedPrivateRootId;
    } catch (err) {
      syncWarn(`Private root discovery failed, falling back to 1: ${err.message}`);
      return '1';
    }
  }

  async getFile(fileId) {
    const driveId = await this.getDriveId();
    const actualId = fileId === 'root' ? await this.getPrivateRootId() : fileId;
    
    try {
      const response = await this._request('GET', `/3/drive/${driveId}/files/${actualId}`);
      return this.translateFile(response.body.data);
    } catch (err) {
      if (err.statusCode === 404) {
        // Check trash
        try {
          const response = await this._request('GET', `/3/drive/${driveId}/trash/${actualId}`);
          return this.translateFile(response.body.data);
        } catch (trashErr) {}
      }
      throw err;
    }
  }

  async listFiles(parentId, params = {}) {
    const driveId = await this.getDriveId();
    const actualParentId = (parentId === 'root' || !parentId) ? await this.getPrivateRootId() : parentId;
    
    const response = await this._request('GET', `/3/drive/${driveId}/files/${actualParentId}/files`, {
      searchParams: params
    });

    return {
      files: (response.body.data || []).map(f => this.translateFile(f)),
      nextPageToken: response.body.pagination?.next ? String(response.body.pagination.page + 1) : null
    };
  }

  async createDirectory(parentId, name) {
    const driveId = await this.getDriveId();
    const actualParentId = (parentId === 'root' || !parentId) ? await this.getPrivateRootId() : parentId;
    
    try {
      const response = await this._request('POST', `/3/drive/${driveId}/files/${actualParentId}/directory`, {
        json: { name }
      });
      return this.translateFile(response.body.data);
    } catch (err) {
      if (err.code === 'destination_already_exists') {
        return this.createDirectory(parentId, `${name} (${Date.now()})`);
      }
      throw err;
    }
  }

  async uploadFile(parentId, name, content, mimeType, fileId = null) {
    const driveId = await this.getDriveId();
    const buffer = Buffer.from(content || '');
    const searchParams = { total_size: buffer.length };

    if (fileId) {
      searchParams.file_id = fileId;
    } else {
      searchParams.directory_id = (parentId === 'root' || !parentId) ? await this.getPrivateRootId() : parentId;
      searchParams.file_name = name;
      searchParams.conflict = 'rename';
    }

    try {
      const response = await this._request('POST', `/3/drive/${driveId}/upload`, {
        headers: { 'Content-Type': 'application/octet-stream' },
        searchParams,
        body: buffer
      });
      const data = response.body.data;
      return this.translateFile(Array.isArray(data) ? data[0] : data);
    } catch (err) {
      if (!fileId && err.code === 'destination_already_exists') {
        return this.uploadFile(parentId, `${name} (${Date.now()})`, content, mimeType);
      }
      throw err;
    }
  }

  async deleteFile(fileId) {
    const driveId = await this.getDriveId();
    try {
      await this._request('DELETE', `/2/drive/${driveId}/files/${fileId}`);
      return true;
    } catch (err) {
      if (err.statusCode === 404) return true;
      throw err;
    }
  }

  async downloadFile(fileId) {
    const driveId = await this.getDriveId();
    const response = await this._request('GET', `/2/drive/${driveId}/files/${fileId}/download`, {
      responseType: 'buffer'
    });
    return response.body;
  }

  async restoreFile(fileId) {
    const driveId = await this.getDriveId();
    const response = await this._request('POST', `/2/drive/${driveId}/trash/${fileId}/restore`);
    return this.translateFile(response.body.data);
  }

  async renameFile(fileId, name) {
    const driveId = await this.getDriveId();
    await this._request('POST', `/2/drive/${driveId}/files/${fileId}/rename`, {
      json: { name }
    });
    return await this.getFile(fileId);
  }

  async moveFile(fileId, destinationParentId) {
    const driveId = await this.getDriveId();
    const destId = (destinationParentId === 'root' || !destinationParentId) ? await this.getPrivateRootId() : destinationParentId;
    
    await this._request('POST', `/3/drive/${driveId}/files/${fileId}/move/${destId}`, {
      json: { conflict: 'rename' }
    });
    const file = await this.getFile(fileId);
    if (file) file.parents = [String(destId)];
    return file;
  }

  async copyFile(fileId, destinationParentId, name) {
    const driveId = await this.getDriveId();
    const destId = (destinationParentId === 'root' || !destinationParentId) ? await this.getPrivateRootId() : destinationParentId;
    
    const response = await this._request('POST', `/3/drive/${driveId}/files/${fileId}/copy/${destId}`, {
      json: name ? { name } : {}
    });
    return this.translateFile(response.body.data);
  }

  async getShareLink(fileId) {
    const driveId = await this.getDriveId();
    try {
      const response = await this._request('GET', `/2/drive/${driveId}/files/${fileId}/link`);
      return response.body.data;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 400) return null;
      throw err;
    }
  }

  async createShareLink(fileId, settings = {}) {
    const driveId = await this.getDriveId();
    const response = await this._request('POST', `/2/drive/${driveId}/files/${fileId}/link`, {
      json: { right: 'public', can_download: true, can_see_info: true, ...settings }
    });
    return response.body.data;
  }

  async updateShareLink(fileId, settings = {}) {
    const driveId = await this.getDriveId();
    const response = await this._request('PUT', `/2/drive/${driveId}/files/${fileId}/link`, {
      json: settings
    });
    return response.body.data;
  }

  async deleteShareLink(fileId) {
    const driveId = await this.getDriveId();
    await this._request('DELETE', `/2/drive/${driveId}/files/${fileId}/link`);
    return true;
  }

  translateFile(kFile) {
    if (!kFile) return null;
    const id = kFile.id ? String(kFile.id) : undefined;
    const isFolder = kFile.type === 'dir' || kFile.type === 'private' || kFile.type === 'common';

    return {
      id,
      name: kFile.name || (id === '1' ? 'kDrive Root' : ''),
      mimeType: isFolder ? 'application/vnd.google-apps.folder' : (kFile.mime_type || 'application/octet-stream'),
      kind: 'drive#file',
      createdTime: kFile.created_at ? new Date(kFile.created_at * 1000).toISOString() : null,
      modifiedTime: kFile.last_modified_at ? new Date(kFile.last_modified_at * 1000).toISOString() : null,
      size: String(kFile.size || 0),
      parents: kFile.parent_id ? [String(kFile.parent_id)] : [],
      trashed: kFile.status === 'trashed' || kFile.status === 'trash_inherited',
      capabilities: { canEdit: true, canRename: true }
    };
  }
}
