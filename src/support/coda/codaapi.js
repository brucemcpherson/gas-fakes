import { Proxies } from '../proxies.js';
import { CodaConstants } from './constants.js';

export class CodaAPIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'CodaAPIError';
    this.status = status;
    this.data = data;
  }
}

export class CodaAPI {
  /**
   * @param {string} key - Coda API Bearer Token
   * @param {object} [options]
   * @param {string} [options.baseUrl] - API Base URL (defaults to CodaConstants.END_POINT or v1 endpoint)
   * @param {number} [options.maxRetries=3] - Automatic retries on 429 / 5xx
   */
  constructor(key, options = {}) {
    if (!key) throw new Error('Coda API token is required.');
    this.key = key;
    this.baseUrl = (options.baseUrl || CodaConstants?.END_POINT).replace(/\/+$/, '');
    this.maxRetries = options.maxRetries ?? 3;

    // Attach domain namespaces
    this.docs = new DocsResource(this);
    this.pages = new PagesResource(this);
    this.tables = new TablesResource(this);
    this.rows = new RowsResource(this);
    this.formulas = new FormulasResource(this);
    this.controls = new ControlsResource(this);
    this.account = new AccountResource(this);
    this.folders = new FoldersResource(this);
    this.workspaces = new WorkspacesResource(this);
  }

  /**
   * Generic request handler handling auth, query params, JSON parsing, and retry backoff.
   */
  async request(method, path, { params, body, headers = {}, retryCount = 0 } = {}) {
    const cleanPath = path.replace(/^\/+/, '');
    const url = new URL(`${this.baseUrl}/${cleanPath}`);

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) {
          url.searchParams.append(k, String(v));
        }
      }
    }

    const reqHeaders = {
      Authorization: `Bearer ${this.key}`,
      Accept: 'application/json',
      ...headers,
    };

    const fetchOptions = {
      method: method.toUpperCase(),
      headers: reqHeaders,
    };

    if (body !== undefined && body !== null) {
      reqHeaders['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    }

    const res = await fetch(url.toString(), fetchOptions);

    // Rate-limiting backoff (429) and transient errors (500/503)
    if ((res.status === 429 || res.status >= 500) && retryCount < this.maxRetries) {
      const retryAfter = Number(res.headers.get('Retry-After')) || Math.pow(2, retryCount);
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return this.request(method, path, { params, body, headers, retryCount: retryCount + 1 });
    }

    // Handle 204 No Content
    if (res.status === 204) return null;

    let data;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const message = (data && data.message) || `HTTP error ${res.status}: ${res.statusText}`;
      throw new CodaAPIError(message, res.status, data);
    }

    return data;
  }

  // Base HTTP helper verbs
  get(path, params) { return this.request('GET', path, { params }); }
  post(path, body, params) { return this.request('POST', path, { body, params }); }
  put(path, body, params) { return this.request('PUT', path, { body, params }); }
  patch(path, body, params) { return this.request('PATCH', path, { body, params }); }
  delete(path, body, params) { return this.request('DELETE', path, { body, params }); }

  /**
   * Async generator to auto-paginate through list endpoints that use pageToken
   */
  async *paginate(path, params = {}) {
    let pageToken = params.pageToken;
    do {
      const response = await this.get(path, { ...params, pageToken });
      const items = response.items || [];
      for (const item of items) {
        yield item;
      }
      pageToken = response.nextPageToken;
    } while (pageToken);
  }
}

class DocsResource {
  constructor(client) { this.client = client; }

  list(params) { return this.client.get('docs', params); }
  create(body) { return this.client.post('docs', body); }
  get(docId) { return this.client.get(`docs/${docId}`); }
  delete(docId) { return this.client.delete(`docs/${docId}`); }
  update(docId, body) { return this.client.patch(`docs/${docId}`, body); }
  publish(docId, body) { return this.client.put(`docs/${docId}/publish`, body); }
  unpublish(docId) { return this.client.delete(`docs/${docId}/publish`); }

  /**
   * Creates a doc and initializes it with text content
   * @param {string} title - File/doc title
   * @param {string} text - Plain text or Markdown content
   * @param {string} [folderId] - Optional destination folder ID
   */
  async createWithContent(title, text, folderId) {
    const docPayload = { title };
    if (folderId && folderId !== 'root') {
      docPayload.folderId = folderId;
    }

    // 1. Create the Doc
    const doc = await this.create(docPayload);

    // 2. Add the text content to the root/first page if content was provided
    if (text) {
      const pages = await this.client.pages.list(doc.id, { limit: 1 });
      const firstPage = pages.items?.[0];

      if (firstPage) {
        // Coda Pages API accepts canvasContent formatted as plain text, HTML, or markdown
        await this.client.pages.update(doc.id, firstPage.id, {
          canvasContent: {
            format: 'markdown',
            content: text,
          },
        });
      }
    }

    return doc;
  }
}

class PagesResource {
  constructor(client) { this.client = client; }

  list(docId, params) { return this.client.get(`docs/${docId}/pages`, params); }
  get(docId, pageIdOrName) { return this.client.get(`docs/${docId}/pages/${pageIdOrName}`); }
  create(docId, body) { return this.client.post(`docs/${docId}/pages`, body); }
  update(docId, pageIdOrName, body) { return this.client.put(`docs/${docId}/pages/${pageIdOrName}`, body); }
  delete(docId, pageIdOrName) { return this.client.delete(`docs/${docId}/pages/${pageIdOrName}`); }

  /**
   * Sets canvas content for an existing page
   * @param {string} docId 
   * @param {string} pageId 
   * @param {string} content - Markdown or plain text
   */
  async setContent(docId, pageId, content) {
    return this.update(docId, pageId, {
      canvasContent: {
        format: 'markdown',
        content,
      },
    });
  }
}



class TablesResource {
  constructor(client) { this.client = client; }

  list(docId, params) { return this.client.get(`docs/${docId}/tables`, params); }
  get(docId, tableIdOrName) { return this.client.get(`docs/${docId}/tables/${tableIdOrName}`); }
  listColumns(docId, tableIdOrName, params) { 
    return this.client.get(`docs/${docId}/tables/${tableIdOrName}/columns`, params); 
  }
}

class RowsResource {
  constructor(client) { this.client = client; }

  list(docId, tableIdOrName, params) {
    return this.client.get(`docs/${docId}/tables/${tableIdOrName}/rows`, params);
  }
  get(docId, tableIdOrName, rowIdOrName, params) {
    return this.client.get(`docs/${docId}/tables/${tableIdOrName}/rows/${rowIdOrName}`, params);
  }
  /**
   * Insert or Upsert rows
   * @param {string} docId 
   * @param {string} tableIdOrName 
   * @param {Array<{ cells: Array<{ column: string, value: any }> }>} rows 
   * @param {object} [params] - e.g. { disableParsing: boolean, keyColumns: string[] }
   */
  insertOrUpsert(docId, tableIdOrName, rows, params) {
    return this.client.post(`docs/${docId}/tables/${tableIdOrName}/rows`, { rows }, params);
  }
  update(docId, tableIdOrName, rowIdOrName, row, params) {
    return this.client.put(`docs/${docId}/tables/${tableIdOrName}/rows/${rowIdOrName}`, { row }, params);
  }
  delete(docId, tableIdOrName, rowIdOrName) {
    return this.client.delete(`docs/${docId}/tables/${tableIdOrName}/rows/${rowIdOrName}`);
  }
  deleteMultiple(docId, tableIdOrName, rowIds) {
    return this.client.delete(`docs/${docId}/tables/${tableIdOrName}/rows`, { rowIds });
  }
  pushButton(docId, tableIdOrName, rowIdOrName, columnIdOrName) {
    return this.client.post(`docs/${docId}/tables/${tableIdOrName}/rows/${rowIdOrName}/buttons/${columnIdOrName}`);
  }
}

class FormulasResource {
  constructor(client) { this.client = client; }
  list(docId, params) { return this.client.get(`docs/${docId}/formulas`, params); }
  get(docId, formulaIdOrName) { return this.client.get(`docs/${docId}/formulas/${formulaIdOrName}`); }
}

class ControlsResource {
  constructor(client) { this.client = client; }
  list(docId, params) { return this.client.get(`docs/${docId}/controls`, params); }
  get(docId, controlIdOrName) { return this.client.get(`docs/${docId}/controls/${controlIdOrName}`); }
}

class AccountResource {
  constructor(client) { this.client = client; }
  whoami() { return this.client.get('whoami'); }
}

/**
 * create a new drive file instance
 * @param  {...any} args 
 * @returns {CodaAPI}
 */
export const newCodaAPI = (...args) => {
  return Proxies.guard(new CodaAPI(...args));
};

class FoldersResource {
  constructor(client) { this.client = client; }

  list(params) {
    return this.client.get('folders', params);
  }

  async get(folderId) {
    if (folderId === 'root') {
      const roots = await this.listRootFolders();
      // If the account has no explicit root folders, return a fallback/synthetic root folder representation
      return roots[0] || {
        id: 'root',
        name: 'Root',
        type: 'folder',
        mimeType: 'application/vnd.google-apps.folder',
      };
    }
    return this.client.get(`folders/${folderId}`);
  }

  /**
   * Helper to retrieve only root/top-level folders (no parent)
   * @param {object} [params] - Optional filters like { workspaceId, limit }
   * @returns {Promise<Array<object>>}
   */
  async listRootFolders(params = {}) {
    const rootFolders = [];
    
    // Auto-paginates in case there are many folders
    for await (const folder of this.client.paginate('folders', params)) {
      if (!folder.parentFolder?.id && !folder.parentFolderId) {
        rootFolders.push(folder);
      }
    }

    return rootFolders;
  }
}

class WorkspacesResource {
  constructor(client) { this.client = client; }

  /**
   * List workspaces the user has access to
   */
  list(params) {
    return this.client.get('workspaces', params);
  }

  get(workspaceId) {
    return this.client.get(`workspaces/${workspaceId}`);
  }

  /**
   * List folders specifically inside a workspace
   */
  listFolders(workspaceId, params) {
    return this.client.get(`workspaces/${workspaceId}/folders`, params);
  }
}

/*
const coda = newCodaAPI(process.env.CODA_API_KEY);

// 1. Using resource namespaces
const docs = await coda.docs.list({ query: 'Roadmap', limit: 5 });

// 2. Inserting/Upserting rows
await coda.rows.insertOrUpsert('doc-xyz123', 'table-abc', [
  { cells: [{ column: 'Status', value: 'Done' }, { column: 'Task', value: 'Deploy Client' }] }
]);

// 3. Iterating across multiple pages without manual token handling
for await (const row of coda.paginate('docs/doc-xyz123/tables/table-abc/rows', { limit: 100 })) {
  console.log(row.name, row.values);
}
*/