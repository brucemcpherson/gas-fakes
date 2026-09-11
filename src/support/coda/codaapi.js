import { Proxies } from "../proxies.js";
import { CodaConstants } from "./constants.js";
import is from "@sindresorhus/is";
import { slogger } from "../slogger.js";

export class CodaAPIError extends Error {
  constructor(message, status, data) {
    const issues = data?.codaDetail?.issues;
    if (issues) message += issues.map(JSON.stringify).join("\n");
    super(message);
    this.name = "CodaAPIError";
    this.status = status;
  }
}

/**
 * Creates a doc and initializes it with text content - shared between folder an file resource
 * @param {string} title - File/doc title
 * @param {string} media - content
 * @param {string} [folderId] - Optional destination folder ID
 */
const createItem = async ({
  name: title,
  media,
  folderId,
  thisResource,
  workspaceId,
}) => {
  const docPayload = { title, name: title, workspaceId, folderId };
  const params = {};

  // Create the Doc or Folder
  const doc = await thisResource.create(docPayload, params);

  // Add text content if provided and this is a doc
  if (is.nonEmptyString(media)) {
    let firstPage = null;
    let attempts = 0;

    // Poll until Coda backend finishes creating the default initial page shell
    while (!firstPage && attempts < 10) {
      try {
        const pages = await thisResource.client.pages.list(doc.id, {
          limit: 1,
        });
        firstPage = pages.items?.[0];
      } catch (e) {
        // Page shell is still initializing on Coda backend
      }
      if (!firstPage) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    if (firstPage) {
      await thisResource.client.pages.update(doc.id, firstPage.id, {
        content: media,
      });

      // Pause briefly to allow Coda canvas indexer to commit content
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      throw new Error(
        `Failed to find first page to add text content for: ${title}`,
      );
    }
  }

  return doc;
};
export class CodaAPI {
  constructor(key, options = {}) {
    if (!key) throw new Error("Coda API token is required.");
    this.key = key;
    this.baseUrl = (options.baseUrl || CodaConstants?.END_POINT).replace(
      /\/+$/,
      "",
    );
    this.maxRetries = options.maxRetries ?? 7;

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
   * Generic request handler handling auth, query params, optional initial delay, JSON parsing, and retry backoff.
   * @param {string} method
   * @param {string} path
   * @param {object} [options]
   * @param {number} [options.initialDelay=0] - Optional delay (in ms) before dispatching the HTTP request
   */
  async request(
    method,
    path,
    { params, body, headers = {}, retryCount = 0, initialDelay = 0 } = {},
  ) {
    // Apply initial delay if specified (useful right after doc creation to avoid 409 locks)
    if (initialDelay > 0 && retryCount === 0) {
      await new Promise((resolve) => setTimeout(resolve, initialDelay));
    }

    const cleanPath = path.replace(/^\/+/, "");
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
      Accept: "application/json",
      ...headers,
    };

    const fetchOptions = {
      method: method.toUpperCase(),
      headers: reqHeaders,
    };

    if (body !== undefined && body !== null) {
      reqHeaders["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(body);
    }

    const res = await fetch(url.toString(), fetchOptions);

    // Rate-limiting backoff (429) and transient errors (500/503/409)
    if (
      !res.ok &&
      (res.status === 429 || res.status >= 500 || res.status === 409) &&
      retryCount < this.maxRetries
    ) {
      const retryAfter =
        Number(res.headers.get("Retry-After")) || Math.pow(2, retryCount) * 2;
      const reason =
        res.status === 409
          ? "Coda item initializing/locked"
          : res.status === 429
            ? "Rate limit reached"
            : "Server error";

      slogger.log(
        `...waiting ${retryAfter}s to retry ${method} ${path} (${reason} - HTTP ${res.status}, attempt ${retryCount + 1}/${this.maxRetries})`,
      );
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));

      // Pass initialDelay: 0 on retries so initial delay isn't re-executed inside the retry loop
      return this.request(method, path, {
        params,
        body,
        headers,
        retryCount: retryCount + 1,
        initialDelay: 0,
      });
    }

    // Handle 204 No Content
    if (res.status === 204) return null;

    let data;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const message =
        `${data?.message}` + `HTTP error ${res.status}: ${res.statusText}`;
      throw new CodaAPIError(message, res.status, data);
    }

    return data;
  }

  // Base HTTP helper verbs - pass options straight through
  get(path, params, options = {}) {
    return this.request("GET", path, { params, ...options });
  }
  post(path, body, params, options = {}) {
    return this.request("POST", path, { body, params, ...options });
  }
  put(path, body, params, options = {}) {
    return this.request("PUT", path, { body, params, ...options });
  }
  patch(path, body, params, options = {}) {
    return this.request("PATCH", path, { body, params, ...options });
  }
  delete(path, body, params, options = {}) {
    return this.request("DELETE", path, { body, params, ...options });
  }
}

class DocsResource {
  constructor(client) {
    this.client = client;
    this.resourceType = "docs";
  }

  /**
   * List docs - unlike folders, docs does support folderId and workspaceId parameters
   * @param {object} [params] - Query parameters (e.g. { folderId, workspaceId, query, limit })
   */
  async list(params = {}) {
    const data = await this.client.get("docs", params);
    // if we just had a workspace filder, it'll return files both inthe workspace and also in folders
    // however, to emulate Drive we need to return only those that are not in folders
    if (data?.items && params.workspaceId && !params.folderId) {
      data.items = data.items.filter((f) => !f.folder);
    }
    return data;
  }

  /**
   * Create a doc
   * @param {object} body - { title, name, sourceDoc, ... }
   * @param {object} [params] - { folderId }
   */
  create(body, params) {
    return this.client.post("docs", body, params);
  }

  get(docId) {
    return this.client.get(`docs/${docId}`);
  }

  delete(docId) {
    return this.client.delete(`docs/${docId}`);
  }

  update(docId, body) {
    return this.client.patch(`docs/${docId}`, body);
  }

  publish(docId, body) {
    return this.client.put(`docs/${docId}/publish`, body);
  }

  unpublish(docId) {
    return this.client.delete(`docs/${docId}/publish`);
  }

  /**
   * Creates a doc and initializes it with text/media content
   * @param {object} options
   * @param {string} options.name - File/doc title
   * @param {string} [options.media] - Text/Markdown content
   * @param {string} [options.folderId] - Optional destination folder ID (or 'root')
   * @param {string} [options.workspaceId] - Optional workspace ID
   */
  async createItem({ name, media, folderId, workspaceId }) {
    return createItem({
      name,
      media,
      folderId,
      workspaceId,
      thisResource: this,
    });
  }
}

class PagesResource {
  constructor(client) {
    this.client = client;
  }

  list(docId, params, options) {
    return this.client.get(`docs/${docId}/pages`, params, options);
  }

  get(docId, pageIdOrName, options) {
    return this.client.get(
      `docs/${docId}/pages/${pageIdOrName}`,
      null,
      options,
    );
  }

  create(docId, body, options) {
    return this.client.post(`docs/${docId}/pages`, body, null, options);
  }

  async update(docId, pageId, payload = {}, options = {}) {
    return this._retryOperation(async () => {
      let pageObj = {};

      // 1. Rename page if title/name provided
      if (payload.title || payload.name) {
        pageObj = await this.client.put(
          `docs/${docId}/pages/${pageId}`,
          { name: payload.title || payload.name },
          null,
          options,
        );
      } else {
        pageObj = await this.get(docId, pageId, options);
      }

      // 2. Set markdown canvas content using Coda REST API spec
      if (payload.content !== undefined) {
        await this.client.put(
          `docs/${docId}/pages/${pageId}`,
          {
            contentUpdate: {
              insertionMode: "replace",
              canvasContent: {
                format: "markdown",
                content: payload.content,
              },
            },
          },
          null,
          options,
        );
      }

      return pageObj;
    });
  }

  delete(docId, pageIdOrName, options) {
    return this.client.delete(
      `docs/${docId}/pages/${pageIdOrName}`,
      null,
      options,
    );
  }

  async _retryOperation(fn, maxAttempts = 7, initialDelay = 2000) {
    let attempt = 0;
    let delay = initialDelay;

    while (attempt < maxAttempts) {
      try {
        return await fn();
      } catch (error) {
        attempt++;

        const isInitializing = error.status === 409 || error.statusCode === 409;
        const isParentNotFoundYet =
          (error.status === 404 || error.statusCode === 404) &&
          error.message?.includes("Could not find a page");

        if ((isInitializing || isParentNotFoundYet) && attempt < maxAttempts) {
          slogger.log(
            `...waiting ${delay / 1000}s to retry page operation (Coda item initializing/indexing - HTTP ${
              error.status || error.statusCode
            }, attempt ${attempt}/${maxAttempts})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }

        throw error;
      }
    }
  }

  async createWithContent(
    docId,
    { name, parentPageId, content },
    options = {},
  ) {
    const page = await this.client.post(
      `docs/${docId}/pages`,
      { name, parentPageId },
      null,
      options,
    );

    if (content) {
      await this.setContent(docId, page.id, content, options);
    }

    return page;
  }

  async setContent(docId, pageId, content, options = {}) {
    return this.update(docId, pageId, { content }, options);
  }

  async getContent(docId, pageId, options = {}) {
    const maxAttempts = 6;
    let delay = 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Begin export job for markdown content
        const exportReq = await this.client.post(
          `docs/${docId}/pages/${pageId}/export`,
          { outputFormat: "markdown" },
          null,
          options,
        );

        // Poll export status against official enum values
        let exportStatus = exportReq;
        let statusAttempts = 0;

        while (exportStatus.status === "inProgress" && statusAttempts < 10) {
          statusAttempts++;
          await new Promise((r) => setTimeout(r, 1000));
          
          exportStatus = await this.client.get(
            `docs/${docId}/pages/${pageId}/export/${exportReq.id}`,
            null,
            options,
          );
        }

        if (exportStatus.status === "complete" && exportStatus.downloadLink) {
          const response = await fetch(exportStatus.downloadLink);
          const text = await response.text();
          if (text || attempt === maxAttempts) {
            return text;
          }
        }

        if (exportStatus.status === "failed" || exportStatus.status === "canceled") {
          slogger.log(`[CODA EXPORT] Page export ${exportStatus.status} for page ${pageId}`);
        }
      } catch (e) {
        // Fallback to standard GET metadata if export endpoint errors out
        try {
          const page = await this.get(docId, pageId, options);
          const metadataContent =
            page?.canvasContent?.content ||
            page?.subtitle ||
            "";
          if (metadataContent) return metadataContent;
        } catch (_) {}
      }

      await new Promise((r) => setTimeout(r, delay));
      delay *= 1.5;
    }

    return "";
  }
}

class TablesResource {
  constructor(client) {
    this.client = client;
  }

  list(docId, params) {
    return this.client.get(`docs/${docId}/tables`, params);
  }

  get(docId, tableIdOrName) {
    return this.client.get(`docs/${docId}/tables/${tableIdOrName}`);
  }

  listColumns(docId, tableIdOrName, params) {
    return this.client.get(
      `docs/${docId}/tables/${tableIdOrName}/columns`,
      params,
    );
  }

  /**
   * Delete a table/grid from a doc if supported by endpoint/extension
   */
  delete(docId, tableIdOrName) {
    return this.client.delete(`docs/${docId}/tables/${tableIdOrName}`);
  }
}

class RowsResource {
  constructor(client) {
    this.client = client;
  }

  list(docId, tableIdOrName, params) {
    return this.client.get(
      `docs/${docId}/tables/${tableIdOrName}/rows`,
      params,
    );
  }
  get(docId, tableIdOrName, rowIdOrName, params) {
    return this.client.get(
      `docs/${docId}/tables/${tableIdOrName}/rows/${rowIdOrName}`,
      params,
    );
  }
  /**
   * Insert or Upsert rows
   * @param {string} docId
   * @param {string} tableIdOrName
   * @param {Array<{ cells: Array<{ column: string, value: any }> }>} rows
   * @param {object} [params] - e.g. { disableParsing: boolean, keyColumns: string[] }
   */
  insertOrUpsert(docId, tableIdOrName, rows, params) {
    return this.client.post(
      `docs/${docId}/tables/${tableIdOrName}/rows`,
      { rows },
      params,
    );
  }
  update(docId, tableIdOrName, rowIdOrName, row, params) {
    return this.client.put(
      `docs/${docId}/tables/${tableIdOrName}/rows/${rowIdOrName}`,
      { row },
      params,
    );
  }
  delete(docId, tableIdOrName, rowIdOrName) {
    return this.client.delete(
      `docs/${docId}/tables/${tableIdOrName}/rows/${rowIdOrName}`,
    );
  }
  deleteMultiple(docId, tableIdOrName, rowIds) {
    return this.client.delete(`docs/${docId}/tables/${tableIdOrName}/rows`, {
      rowIds,
    });
  }
  pushButton(docId, tableIdOrName, rowIdOrName, columnIdOrName) {
    return this.client.post(
      `docs/${docId}/tables/${tableIdOrName}/rows/${rowIdOrName}/buttons/${columnIdOrName}`,
    );
  }
}

class FormulasResource {
  constructor(client) {
    this.client = client;
  }
  list(docId, params) {
    return this.client.get(`docs/${docId}/formulas`, params);
  }
  get(docId, formulaIdOrName) {
    return this.client.get(`docs/${docId}/formulas/${formulaIdOrName}`);
  }
}

class ControlsResource {
  constructor(client) {
    this.client = client;
  }
  list(docId, params) {
    return this.client.get(`docs/${docId}/controls`, params);
  }
  get(docId, controlIdOrName) {
    return this.client.get(`docs/${docId}/controls/${controlIdOrName}`);
  }
}

class AccountResource {
  constructor(client) {
    this.client = client;
  }

  whoami() {
    return this.client.get("whoami");
  }

  /**
   * Helper to fetch the primary active workspace ID for the API token
   */
  async getDefaultWorkspace() {
    const userInfo = await this.whoami();

    // Coda whoami places workspace details directly in userInfo.workspace
    const primaryWs = userInfo.workspace;

    if (!primaryWs?.id) {
      throw new Error(
        "Unable to resolve a valid workspace from current Coda token.",
      );
    }
    return primaryWs;
  }
}
/**
 * create a new drive file instance
 * @param  {...any} args
 * @returns {CodaAPI}
 */
export const newCodaAPI = (...args) => {
  return Proxies.guard(new CodaAPI(...args));
};

// this is because for folders, coda doesnt support folder or workspace params
const checkListParams = (queryParams) => {
  /// we know that workspace and parentfolder filtering don't work server side for folders, so drop them
  let { folderId, workspaceId, ...params } = queryParams;
  if (!workspaceId && !folderId) {
    throw new Error(
      "expected either a workspace id or parentfolderId for a list query",
    );
  }
  // if we have a folderId, we never need a workspaceId
  if (folderId) workspaceId = undefined;
  return {
    folderId,
    workspaceId,
    params,
  };
};

class FoldersResource {
  constructor(client) {
    this.client = client;
    this.resourceType = "folders";
  }

  create(body) {
    return this.client.post("folders", body);
  }

  async list(queryParams = {}) {
    // now we need to do a filter on the returned list
    const { folderId, workspaceId, params } = checkListParams(queryParams);
    let data = await this.client.get("folders", params);

    if (data?.items) {
      // its possible we dont have a folder so it being missing is ok.
      if (folderId)
        data.items = data.items.filter((f) => f.folder?.id === folderId);
      // we only need to check the workspace if there was no folder filter as the folder will already have done that
      // it should always have a workspace, but if it has a folder ID, we have to reject it too because the workspace is not its parent
      else if (workspaceId)
        data.items = data.items.filter((f) => {
          const id = f?.workspace?.id;
          if (!id)
            throw new Error(
              `could not establish workspace id in ${JSON.stringify(f)}`,
            );
          return id === workspaceId && !f.folder;
        });
    }
    return data;
  }

  async get(folderId) {
    if (folderId === "root") {
      // Retrieve workspace info via account endpoint instead of workspaces.list
      const primaryWs = await this.client.account.getDefaultWorkspace();

      return {
        id: folderId,
        name: primaryWs.name || "Coda Workspace Root",
        type: "workspace_root",
        workspaceId: primaryWs.id,
      };
    }
    return this.client.get(`folders/${folderId}`);
  }

  /**
   * Creates a folder or subfolder.
   * Auto-resolves workspaceId from parent folder or default workspace if omitted.
   *
   * @param {object} params
   * @param {string} params.name - Folder name
   * @param {string} [params.folderId] - Parent folder ID (for subfolders)
   * @param {string} [params.workspaceId] - Explicit workspace ID
   */
  async createItem({ name, folderId, workspaceId }) {
    return createItem({ name, folderId, thisResource: this, workspaceId });
  }

  /**
   * Update folder attributes (rename, re-parent, etc.)
   * @param {string} folderId - ID of the folder to update
   * @param {object} body - Payload with properties to update (e.g. { name, parentFolderId })
   * @returns {Promise<object>} Updated folder object
   */
  update(folderId, body) {
    return this.client.patch(`folders/${folderId}`, body);
  }

  /**
   * Moves a folder into a target parent folder (or to top-level root)
   * @param {string} folderId - Folder ID to move
   * @param {string|null} targetParentFolderId - Target parent folder ID, or null/'root' for top-level
   * @returns {Promise<object>}
   */
  move(folderId, targetParentFolderId) {
    const parentFolderId =
      !targetParentFolderId || targetParentFolderId === "root"
        ? null
        : targetParentFolderId;

    return this.update(folderId, { parentFolderId });
  }

  /**
   * Delete a folder
   * @param {string} folderId
   * @returns {Promise<null>}
   */
  delete(folderId) {
    return this.client.delete(`folders/${folderId}`);
  }

  /**
   * Helper to retrieve only root/top-level folders (no parent)
   * @param {object} [params] - Optional filters like { workspaceId, limit }
   * @returns {Promise<Array<object>>}
   */
  async listRootFolders(params = {}) {
    const rootFolders = [];

    // Auto-paginates in case there are many folders
    for await (const folder of this.client.paginate("folders", params)) {
      if (!folder.parentFolder?.id && !folder.parentFolderId) {
        rootFolders.push(folder);
      }
    }

    return rootFolders;
  }
}

class WorkspacesResource {
  constructor(client) {
    this.client = client;
  }

  /**
   * List workspaces the user has access to
   */
  list(params) {
    return this.client.get("workspaces", params);
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
