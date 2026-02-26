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
    this._driveId = cachedDriveId;
    this._accountId = cachedAccountId;
  }

  async getAccountId() {
    if (this._accountId) return this._accountId;
    
    const attempts = [
      { name: '/1/account', url: `${this.baseUrl}/1/account` },
      { name: '/profile', url: `${this.baseUrl}/profile` },
      { name: '/2/user/info', url: `${this.baseUrl}/2/user/info` },
      { name: '/1/user', url: `${this.baseUrl}/1/user` }
    ];

    for (const attempt of attempts) {
      try {
        const response = await got(attempt.url, {
          headers: { Authorization: `Bearer ${this.token}` },
          responseType: 'json'
        });
        const data = response.body.data;
        const account_id = Array.isArray(data) ? (data[0]?.account_id || data[0]?.id) : (data?.account_id || data?.id);
        
        if (account_id) {
          this._accountId = String(account_id);
          cachedAccountId = this._accountId;
          //syncLog(`Discovered Account ID: ${this._accountId}`);
          return this._accountId;
        }
      } catch (err) {
        // probe failed
      }
    }
    return null;
  }

  async getDriveId() {
    if (this._driveId) return this._driveId;
    
    try {
      const response = await got(`${this.baseUrl}/2/drive/preferences`, {
        headers: { Authorization: `Bearer ${this.token}` },
        responseType: 'json'
      });
      const prefs = response.body.data;
      if (prefs && prefs.default_drive) {
        this._driveId = String(prefs.default_drive);
        cachedDriveId = this._driveId;
        //syncLog(`Discovered Drive ID: ${this._driveId} (via preferences)`);
        return this._driveId;
      }
    } catch (err) {}

    const accountId = await this.getAccountId();
    try {
      const response = await got(`${this.baseUrl}/2/drive`, {
        headers: { Authorization: `Bearer ${this.token}` },
        searchParams: accountId ? { account_id: accountId } : {},
        responseType: 'json'
      });
      const drives = response.body.data;
      if (drives && drives.length > 0) {
        this._driveId = String(drives[0].id);
        cachedDriveId = this._driveId;
        //syncLog(`Discovered Drive ID: ${this._driveId} (${drives[0].name})`);
        return this._driveId;
      }
    } catch (err) {}
    
    throw new Error('KSUITE_DRIVE_ID is missing and discovery failed.');
  }

  /**
   * Dynamically find the ID of the 'Private' folder by exploring the super-root (ID 1)
   */
  async getPrivateRootId() {
    if (cachedPrivateRootId) return cachedPrivateRootId;

    const driveId = await this.getDriveId();
    const url = `${this.baseUrl}/3/drive/${driveId}/files/1/files`;
    
    try {
      const response = await got(url, {
        headers: { Authorization: `Bearer ${this.token}` },
        responseType: 'json'
      });
      
      const files = response.body.data || [];
      // Look for 'Private' folder. Fallback to ID 1 if not found.
      const privateFolder = files.find(f => f.name === 'Private' || f.type === 'private');
      
      cachedPrivateRootId = privateFolder ? String(privateFolder.id) : '1';
      //syncLog(`Resolved Private Root ID: ${cachedPrivateRootId} (${privateFolder ? 'Private' : 'Super Root fallback'})`);
      return cachedPrivateRootId;
    } catch (err) {
      syncWarn(`Root discovery failed, falling back to Super Root (1): ${err.message}`);
      return '1';
    }
  }

  async getFile(fileId) {
    const driveId = await this.getDriveId();
    const actualFileId = fileId === 'root' ? await this.getPrivateRootId() : fileId;
    
    const url = `${this.baseUrl}/3/drive/${driveId}/files/${actualFileId}`;
    
    try {
      const response = await got(url, {
        headers: { Authorization: `Bearer ${this.token}` },
        responseType: 'json'
      });
      return this.translateFile(response.body.data);
    } catch (err) {
      // If 404, try the trash endpoint
      if (err.response?.statusCode === 404) {
        try {
          const trashUrl = `${this.baseUrl}/3/drive/${driveId}/trash/${actualFileId}`;
          const response = await got(trashUrl, {
            headers: { Authorization: `Bearer ${this.token}` },
            responseType: 'json'
          });
          return this.translateFile(response.body.data);
        } catch (trashErr) {
          // If trash also fails, rethrow original error
        }
      }
      syncWarn(`KSuite API error: ${err.message}`);
      throw err;
    }
  }

  async listFiles(parentId, params = {}) {
     const driveId = await this.getDriveId();
     const actualFileId = (parentId === 'root' || !parentId) ? await this.getPrivateRootId() : parentId;
     const realUrl = `${this.baseUrl}/3/drive/${driveId}/files/${actualFileId}/files`;
     //syncLog(`KSuite API call: GET ${realUrl}`);
     
     try {
       const response = await got(realUrl, {
         headers: { Authorization: `Bearer ${this.token}` },
         responseType: 'json',
         searchParams: params
       });
       return {
          files: response.body.data.map(f => this.translateFile(f)),
          nextPageToken: response.body.pagination?.next ? String(response.body.pagination.page + 1) : null
       };
     } catch (err) {
       syncWarn(`KSuite API error: ${err.message}`);
       throw err;
     }
  }

  async createDirectory(parentId, name) {
    const driveId = await this.getDriveId();
    const actualParentId = (parentId === 'root' || !parentId) ? await this.getPrivateRootId() : parentId;
    const url = `${this.baseUrl}/3/drive/${driveId}/files/${actualParentId}/directory`;
    //syncLog(`KSuite API call: POST ${url} (name: ${name})`);

    try {
      const response = await got.post(url, {
        headers: { Authorization: `Bearer ${this.token}` },
        json: { name },
        responseType: 'json'
      });
      return this.translateFile(response.body.data);
    } catch (err) {
      let msg = err.message;
      if (err.response?.body) {
        const bodyStr = typeof err.response.body === 'object' ? JSON.stringify(err.response.body) : String(err.response.body);
        msg += ` (Response: ${bodyStr})`;
      }
      syncWarn(`KSuite API error: ${msg}`);
      throw new Error(msg);
    }
  }

  async uploadFile(parentId, name, content, mimeType) {
    const driveId = await this.getDriveId();
    const actualParentId = (parentId === 'root' || !parentId) ? await this.getPrivateRootId() : parentId;
    const url = `${this.baseUrl}/3/drive/${driveId}/upload`;
    const buffer = Buffer.from(content || '');
    
    //syncLog(`KSuite API call: POST ${url} (name: ${name}, parent: ${actualParentId}, size: ${buffer.length})`);

    try {
      const response = await got.post(url, {
        headers: { 
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/octet-stream'
        },
        searchParams: {
          directory_id: actualParentId,
          file_name: name,
          total_size: buffer.length,
          conflict: 'rename'
        },
        body: buffer,
        responseType: 'json'
      });
      const data = response.body.data;
      return this.translateFile(Array.isArray(data) ? data[0] : data);
    } catch (err) {
      let msg = err.message;
      if (err.response?.body) {
        const bodyStr = typeof err.response.body === 'object' ? JSON.stringify(err.response.body) : String(err.response.body);
        msg += ` (Response: ${bodyStr})`;
      }
      syncWarn(`KSuite API error: ${msg}`);
      throw new Error(msg);
    }
  }

  async deleteFile(fileId) {
    const driveId = await this.getDriveId();
    const url = `${this.baseUrl}/2/drive/${driveId}/files/${fileId}`;
    //syncLog(`KSuite API call: DELETE ${url}`);

    try {
      await got.delete(url, {
        headers: { Authorization: `Bearer ${this.token}` },
        responseType: 'json'
      });
      return true;
    } catch (err) {
      syncWarn(`KSuite API error: ${err.message}`);
      throw err;
    }
  }

  async downloadFile(fileId) {
    const driveId = await this.getDriveId();
    const url = `${this.baseUrl}/2/drive/${driveId}/files/${fileId}/download`;
    //syncLog(`KSuite API call: GET ${url}`);

    try {
      const response = await got(url, {
        headers: { Authorization: `Bearer ${this.token}` },
        responseType: 'buffer'
      });
      return response.body;
    } catch (err) {
      syncWarn(`KSuite API error: ${err.message}`);
      throw err;
    }
  }

  async restoreFile(fileId) {
    const driveId = await this.getDriveId();
    const url = `${this.baseUrl}/2/drive/${driveId}/trash/${fileId}/restore`;
    //syncLog(`KSuite API call: POST ${url}`);

    try {
      const response = await got.post(url, {
        headers: { Authorization: `Bearer ${this.token}` },
        responseType: 'json'
      });
      return this.translateFile(response.body.data);
    } catch (err) {
      syncWarn(`KSuite API error: ${err.message}`);
      throw err;
    }
  }

  async renameFile(fileId, name) {
    const driveId = await this.getDriveId();
    const url = `${this.baseUrl}/2/drive/${driveId}/files/${fileId}/rename`;
    //(`KSuite API call: POST ${url} (name: ${name})`);

    try {
      await got.post(url, {
        headers: { Authorization: `Bearer ${this.token}` },
        json: { name },
        responseType: 'json'
      });
      // After rename, fetch the full object to ensure we have all metadata (like mimeType)
      return await this.getFile(fileId);
    } catch (err) {
      syncWarn(`KSuite API error: ${err.message}`);
      throw err;
    }
  }

  async copyFile(fileId, destinationParentId, name) {
    const driveId = await this.getDriveId();
    const actualDestinationId = (destinationParentId === 'root' || !destinationParentId) ? await this.getPrivateRootId() : destinationParentId;
    const url = `${this.baseUrl}/3/drive/${driveId}/files/${fileId}/copy/${actualDestinationId}`;
    
    try {
      const response = await got.post(url, {
        headers: { Authorization: `Bearer ${this.token}` },
        json: name ? { name } : {},
        responseType: 'json'
      });
      return this.translateFile(response.body.data);
    } catch (err) {
      syncWarn(`KSuite API error: ${err.message}`);
      throw err;
    }
  }

  translateFile(kFile) {
    if (!kFile) return null;
    const id = kFile.id ? String(kFile.id) : undefined;
    const isFolder = kFile.type === 'dir' || kFile.type === 'private' || kFile.type === 'common';

    return {
      id,
      name: kFile.name || (id === '1' ? 'kDrive Root' : ''),
      mimeType: isFolder ? 'application/vnd.google-apps.folder' : (kFile.mime_type || 'application/octet-stream'),
      createdTime: kFile.created_at ? new Date(kFile.created_at * 1000).toISOString() : null,
      modifiedTime: kFile.last_modified_at ? new Date(kFile.last_modified_at * 1000).toISOString() : null,
      size: String(kFile.size || 0),
      parents: kFile.parent_id ? [String(kFile.parent_id)] : [],
      trashed: kFile.status === 'trashed' || kFile.status === 'trash_inherited',
      capabilities: { canEdit: true, canRename: true }
    };
  }
}
