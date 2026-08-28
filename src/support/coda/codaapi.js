import { Proxies } from "../proxies.js";
import { CodaConstants } from "./constants.js";
import is from "@sindresorhus/is";

export class CodaAPIError extends Error {
  constructor(message, status, data) {
    const issues = data?.codaDetail?.issues;
    if (issues) message += issues.map(JSON.stringify).join("\n");
    super(message);
    this.name = "CodaAPIError";
    this.status = status;
  }
}

const getTargetWorkspace = async ({ folderId, workspaceId, thisResource }) => {
  let targetWorkspaceId = workspaceId;

  if (targetWorkspaceId) {
    return targetWorkspaceId;
  }

  // If folderId is provided and not root, resolve workspace from the parent folder
  if (folderId && folderId !== "root") {
    const parentFolder = await thisResource.get(folderId);
    targetWorkspaceId = parentFolder?.workspace?.id;
  }

  // Fallback: Fetch the workspace from the whoami account profile
  if (!targetWorkspaceId) {
    const defaultWs = await thisResource.client.account.getDefaultWorkspace();
    targetWorkspaceId = defaultWs.id;
  }

  if (!targetWorkspaceId) {
    throw new Error(
      "workspaceId is required by Coda to create a folder, and no default workspace could be found.",
    );
  }

  return targetWorkspaceId;
};

/**
 * Creates a doc and initializes it with text content - shared between folder an file resource
 * @param {string} title - File/doc title
 * @param {string} media - content
 * @param {string} [folderId] - Optional destination folder ID
 */
// In codaapi.js
const createItem = async ({
  name: title,
  media,
  folderId,
  thisResource,
  workspaceId,
}) => {
  const docPayload = { title, name: title };
  const params = {};

  if (media && thisResource.resourceType !== "docs") {
    throw new Error("Media content can only be added to docs.");
  }

  const isRoot = !folderId || folderId === "root";

  // For Docs: folderId in params links it to a workspace folder
  if (!isRoot && thisResource.resourceType === "docs") {
    params.folderId = folderId;
  }

  // For Folders: parentFolderId sets subfolder nesting
  if (!isRoot && thisResource.resourceType === "folders") {
    docPayload.parentFolderId = folderId;
  }

  // If creating a top-level folder OR a root doc, we must resolve the workspaceId
  if (thisResource.resourceType === "folders" || isRoot) {
    workspaceId = await getTargetWorkspace({
      folderId: isRoot ? null : folderId,
      workspaceId,
      thisResource,
    });
    docPayload.workspaceId = workspaceId;
  }

  // Create the Doc or Folder
  const doc = await thisResource.create(docPayload, params);

  // Add text content if provided and this is a doc
  if (is.nonEmptyString(media)) {
    const pages = await thisResource.client.pages.list(doc.id, { limit: 1 });
    const firstPage = pages.items?.[0];

    if (firstPage) {
      await thisResource.client.pages.update(doc.id, firstPage.id, {
        contentUpdate: {
          insertionMode: "replace",
          canvasContent: {
            format: "markdown",
            content: media,
          },
        },
      });
    } else {
      throw new Error(
        `Failed to find first page to add text content for: ${title}`,
      );
    }
  }

  return doc;
};
export class CodaAPI {
  /**
   * @param {string} key - Coda API Bearer Token
   * @param {object} [options]
   * @param {string} [options.baseUrl] - API Base URL (defaults to CodaConstants.END_POINT or v1 endpoint)
   * @param {number} [options.maxRetries=3] - Automatic retries on 429 / 5xx
   */
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
   * Generic request handler handling auth, query params, JSON parsing, and retry backoff.
   */
  async request(
    method,
    path,
    { params, body, headers = {}, retryCount = 0 } = {},
  ) {
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
    // url can look like this ../docs?workspaceId=ws-... for root level listings - also https://coda.io/apis/v1/folders/fl-Vn2t1pUvlj for listing folders
    const res = await fetch(url.toString(), fetchOptions);

    // Rate-limiting backoff (429) and transient errors (500/503) or 409 - not settled yet
    if (
      !res.ok &&
      (res.status === 429 || res.status >= 500 || res.status === 409) &&
      retryCount < this.maxRetries
    ) {
      const retryAfter =
        Number(res.headers.get("Retry-After")) || Math.pow(2, retryCount);
      console.log(
        `...retry attempt ${retryCount + 1} due to error ${res.status} : ${method} ${path} in ${retryAfter} seconds`,
      );
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return this.request(method, path, {
        params,
        body,
        headers,
        retryCount: retryCount + 1,
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
      // Extract detail/message array if present in Coda API error schemas
      const message =
        `${data?.message}` + `HTTP error ${res.status}: ${res.statusText}`;
      throw new CodaAPIError(message, res.status, data);
    }
    
    // another hitch is that inFolder=false doesnt actually filter out user folders. so we have to do a further filter to emulate DriveApp behavior
    // note exact false (as it could just be missing)
    if (params?.inFolder === false && data?.items?.length) {
      // not sure of the circumstances where a folderId versus a folder object is provided, so we'll just check for
      data.items = data.items.filter((i) => !i.folderId && !i.folder);
    }
    return data;
  }

  // Base HTTP helper verbs
  get(path, params) {
    return this.request("GET", path, { params });
  }
  post(path, body, params) {
    return this.request("POST", path, { body, params });
  }
  put(path, body, params) {
    return this.request("PUT", path, { body, params });
  }
  patch(path, body, params) {
    return this.request("PATCH", path, { body, params });
  }
  delete(path, body, params) {
    return this.request("DELETE", path, { body, params });
  }

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
  constructor(client) {
    this.client = client;
    this.resourceType = "docs";
  }

  /**
   * List docs with special handling for the "root" virtual folder
   * @param {object} [params] - Query parameters (e.g. { folderId, workspaceId, query, limit })
   */
  async list(params = {}) {
    const queryParams = { ...params };
    return this.client.get("docs", queryParams);
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

  list(docId, params) {
    return this.client.get(`docs/${docId}/pages`, params);
  }
  get(docId, pageIdOrName) {
    return this.client.get(`docs/${docId}/pages/${pageIdOrName}`);
  }
  create(docId, body) {
    return this.client.post(`docs/${docId}/pages`, body);
  }
  update(docId, pageIdOrName, body) {
    return this.client.put(`docs/${docId}/pages/${pageIdOrName}`, body);
  }
  delete(docId, pageIdOrName) {
    return this.client.delete(`docs/${docId}/pages/${pageIdOrName}`);
  }

  /**
   * Sets canvas content for an existing page
   * @param {string} docId
   * @param {string} pageId
   * @param {string} content - Markdown or plain text
   */
  async setContent(docId, pageId, content) {
    return this.update(docId, pageId, {
      canvasContent: {
        format: "markdown",
        content,
      },
    });
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

class FoldersResource {
  constructor(client) {
    this.client = client;
    this.resourceType = "folders";
  }

  create(body) {
    return this.client.post("folders", body);
  }

  async list(params = {}) {
    const queryParams = { ...params };

    // If querying root folders, fetch workspace folders with no parent
    if (
      queryParams.folderId === "root" ||
      queryParams.parentFolderId === "root"
    ) {
      delete queryParams.folderId;
      delete queryParams.parentFolderId;

      if (!queryParams.workspaceId) {
        const defaultWs = await this.client.account.getDefaultWorkspace();
        queryParams.workspaceId = defaultWs.id;
      }

      const result = await this.client.get("folders", queryParams);
      if (result?.items) {
        // Filter for folders that have no parent folder ID
        result.items = result.items.filter(
          (folder) => !folder.parentFolder?.id && !folder.parentFolderId,
        );
      }
      return result;
    }

    return this.client.get("folders", queryParams);
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
