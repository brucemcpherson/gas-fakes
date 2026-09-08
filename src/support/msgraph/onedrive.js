import got from 'got';
import { syncLog, syncWarn } from '../workersync/synclogger.js';
import { Auth } from '../auth.js';
import { MsExcel } from './msexcel.js';

export class OneDrive {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://graph.microsoft.com/v1.0';

    // Determine the root path: /me for delegated, /users/{id} for application
    const method = Auth.getAuthMethod('msgraph');
    const identity = Auth.getEffectiveUser();

    if (method === 'secret' && identity?.email) {
      this.userPath = `/users/${identity.email}`;
    } else {
      this.userPath = '/me';
    }
  }

  /**
   * Centralized request handler
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
      let msg = `MS Graph API Error [${method} ${path}]: ${err.message}`;
      if (err.response?.body) {
        const body = typeof err.response.body === 'object' ? JSON.stringify(err.response.body) : String(err.response.body);
        msg += ` - Response: ${body}`;
      }
      const error = new Error(msg);
      error.statusCode = err.response?.statusCode;
      throw error;
    }
  }

  async getMe() {
    if (this.userPath.startsWith('/users')) {
      const response = await this._request('GET', this.userPath);
      return response.body;
    }
    const response = await this._request('GET', '/me');
    return response.body;
  }

  async getDrive() {
    const response = await this._request('GET', `${this.userPath}/drive`);
    return response.body;
  }

  async getFile(fileId) {
    try {
      // Heuristic: If it looks like a Google ID (long, no bang), and we're on MS backend,
      // it's likely a platform leak in a multi-backend loop.
      if (fileId && !fileId.includes('!') && fileId.length > 30) {
        return null;
      }
      const isRoot = fileId === 'root';
      const path = isRoot ? `${this.userPath}/drive/root` : `${this.userPath}/drive/items/${fileId}`;
      const response = await this._request('GET', path);
      return this.translateFile(response.body, isRoot);
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 400) return null;
      throw err;
    }
  }

  async listFiles(parentId, params = {}) {
    let path = (parentId === 'root' || !parentId) ? `${this.userPath}/drive/root/children` : `${this.userPath}/drive/items/${parentId}/children`;

    // MS Graph pagination uses a full URL in @odata.nextLink
    // If pageToken is already a full URL, use it directly
    if (params.pageToken && params.pageToken.startsWith('http')) {
      path = params.pageToken;
    }

    // MS Graph uses $top instead of maxResults
    const searchParams = {};
    if (!path.startsWith('http')) {
      if (params.maxResults) searchParams['$top'] = params.maxResults;
      if (params.pageToken) searchParams['$skipToken'] = params.pageToken;
    }

    const response = await this._request('GET', path, { searchParams });
    const data = response.body;

    let files = (data.value || []).map(f => this.translateFile(f));

    let nameFilter = null;
    if (params.q) {
      // Improved regex to handle various query styles
      const nameMatch = params.q.match(/name\s*=\s*'([^']*)'/i);
      if (nameMatch) {
        nameFilter = nameMatch[1];
      }
    }

    // On Personal OneDrive, $filter on children is often unsupported.
    // On Personal OneDrive, we bypass $filter and do it manually for 100% reliability
    if (nameFilter) {
      const lowerFilter = nameFilter.toLowerCase().trim();
      files = files.filter(f => f.name && f.name.toLowerCase().trim() === lowerFilter);
    }

    return {
      files,
      nextLink: data['@odata.nextLink'] || null
    };
  }

  async createDirectory(parentId, name) {
    const path = (parentId === 'root' || !parentId) ? `${this.userPath}/drive/root/children` : `${this.userPath}/drive/items/${parentId}/children`;

    const response = await this._request('POST', path, {
      json: {
        name,
        folder: {},
        "@microsoft.graph.conflictBehavior": "rename"
      }
    });
    return this.translateFile(response.body);
  }

  async uploadFile(parentId, name, content, mimeType, fileId = null) {
    const buffer = Buffer.from(content || '');
    let path;

    if (fileId) {
      path = `${this.userPath}/drive/items/${fileId}/content`;
    } else {
      const parentPath = (parentId === 'root' || !parentId) ? `${this.userPath}/drive/root` : `${this.userPath}/drive/items/${parentId}`;
      path = `${parentPath}:/${encodeURIComponent(name)}:/content`;
    }

    const response = await this._request('PUT', path, {
      headers: { 'Content-Type': mimeType || 'application/octet-stream' },
      body: buffer
    });

    return this.translateFile(response.body);
  }

  async deleteFile(fileId) {
    // Before deleting, try to close any active Excel sessions to avoid "Locked" error
    const msExcel = new MsExcel(this.token);
    await msExcel.closeSession(fileId);

    let retries = 5;
    let delay = 500;

    while (retries > 0) {
      try {
        await this._request("DELETE", `${this.userPath}/drive/items/${fileId}`);
        return true;
      } catch (err) {
        // If it's locked, wait and retry
        if (err.statusCode === 423 && retries > 1) {
          syncLog(`File ${fileId} is locked, retrying deletion in ${delay}ms... (${retries} retries left)`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          retries--;
          delay *= 2; // Exponential backoff
          continue;
        }
        if (err.statusCode === 404) return true;
        throw err;
      }
    }
  }

  async downloadFile(fileId) {
    const response = await this._request('GET', `${this.userPath}/drive/items/${fileId}/content`, {
      responseType: 'buffer'
    });
    return response.body;
  }

  async renameFile(fileId, name) {
    const response = await this._request('PATCH', `${this.userPath}/drive/items/${fileId}`, {
      json: { name }
    });
    return this.translateFile(response.body);
  }

  async moveFile(fileId, destinationParentId) {
    const destId = (destinationParentId === 'root' || !destinationParentId)
      ? (await this.getFile('root')).id
      : destinationParentId;

    const response = await this._request('PATCH', `${this.userPath}/drive/items/${fileId}`, {
      json: {
        parentReference: { id: destId },
        "@microsoft.graph.conflictBehavior": "replace"
      }
    });
    return this.translateFile(response.body);
  }

  async copyFile(fileId, destinationParentId, name) {
    const destId = (destinationParentId === 'root' || !destinationParentId)
      ? (await this.getFile('root')).id
      : destinationParentId;

    const payload = {
      parentReference: { id: destId }
    };
    if (name) payload.name = name;

    const response = await this._request('POST', `${this.userPath}/drive/items/${fileId}/copy`, {
      json: payload
    });

    const monitorUrl = response.headers.location;
    syncLog(`Copy initiated, monitor URL: ${monitorUrl}`);

    return await this.getFile(fileId);
  }

  translateFile(msFile, rootRequested = false) {
    if (!msFile) return null;

    const isFolder = !!msFile.folder;
    const parentId = msFile.parentReference?.id;

    return {
      id: msFile.id,
      name: msFile.name,
      mimeType: isFolder ? 'application/vnd.google-apps.folder' : (msFile.file?.mimeType || 'application/octet-stream'),
      kind: 'drive#file',
      createdTime: msFile.createdDateTime,
      modifiedTime: msFile.lastModifiedDateTime,
      size: String(msFile.size || 0),
      parents: parentId ? [parentId] : [],
      trashed: !!msFile.deleted,
      capabilities: {
        canEdit: true,
        canRename: true,
        canAddChildren: isFolder,
        canMoveItem: true
      },
      webViewLink: msFile.webUrl,
      iconLink: null,
      __rootRequested: rootRequested,
      platform: 'msgraph'
    };
  }
}
