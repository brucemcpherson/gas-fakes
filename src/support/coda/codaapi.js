import { Proxies } from "../proxies.js";
import { CodaConstants } from "./constants.js";
import { slogger } from "../slogger.js";
import { CodaAPIError } from "./codaapierror.js";

import { DocsResource } from "./docsresource.js";
import { PagesResource } from "./pagesresource.js";
import { TablesResource } from "./tablesresource.js";
import { RowsResource } from "./rowsresource.js";
import { FormulasResource } from "./formulasresource.js";
import { ControlsResource } from "./controlsresource.js";
import { AccountResource } from "./accountresource.js";
import { FoldersResource } from "./foldersresource.js";
import { WorkspacesResource } from "./workspacesresource.js";

export { CodaAPIError } from "./codaapierror.js";

/**
 * Primary HTTP API client for interacting with Coda REST API end-points.
 */
export class CodaAPI {
  /**
   * Initializes the CodaAPI client and mounts child resource namespaces.
   *
   * @param {string} key - Bearer authorization token.
   * @param {Object} [options] - Configuration parameters.
   * @param {string} [options.baseUrl] - Base API endpoint override.
   * @param {number} [options.maxRetries=7] - Maximum number of retries on rate limits or transient errors.
   */
  constructor(key, options = {}) {
    if (!key) throw new Error("Coda API token is required.");
    this.key = key;
    this.baseUrl = (options.baseUrl || CodaConstants?.END_POINT).replace(
      /\/+$/,
      ""
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
   *
   * @param {string} method - HTTP method verb (GET, POST, PUT, PATCH, DELETE).
   * @param {string} path - Target API route path.
   * @param {Object} [options] - Execution request configuration options.
   * @param {Object} [options.params] - URL Search Query Key-Value parameters.
   * @param {Object} [options.body] - JSON request body payload.
   * @param {Object} [options.headers] - Custom HTTP Request Headers.
   * @param {number} [options.retryCount=0] - Internal tracking retry depth counter.
   * @param {number} [options.initialDelay=0] - Delay (in ms) dispatched prior to calling fetch.
   * @returns {Promise<*>} Parsed JSON or string data response from server.
   */
  request = async (
    method,
    path,
    { params, body, headers = {}, retryCount = 0, initialDelay = 0 } = {}
  ) => {
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
        `...waiting ${retryAfter}s to retry ${method} ${path} (${reason} - HTTP ${res.status}, attempt ${
          retryCount + 1
        }/${this.maxRetries})`
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
        `${data?.message || ""}` +
        ` HTTP error ${res.status}: ${res.statusText}`;
      throw new CodaAPIError(message, res.status, data);
    }

    return data;
  };

  /**
   * Issues an HTTP GET request.
   *
   * @param {string} path - API endpoint path.
   * @param {Object} [params] - Query parameters.
   * @param {Object} [options] - Additional request options.
   * @returns {Promise<*>} Response data.
   */
  get = (path, params, options = {}) =>
    this.request("GET", path, { params, ...options });

  /**
   * Issues an HTTP POST request.
   *
   * @param {string} path - API endpoint path.
   * @param {Object} [body] - Request body payload.
   * @param {Object} [params] - Query parameters.
   * @param {Object} [options] - Additional request options.
   * @returns {Promise<*>} Response data.
   */
  post = (path, body, params, options = {}) =>
    this.request("POST", path, { body, params, ...options });

  /**
   * Issues an HTTP PUT request.
   *
   * @param {string} path - API endpoint path.
   * @param {Object} [body] - Request body payload.
   * @param {Object} [params] - Query parameters.
   * @param {Object} [options] - Additional request options.
   * @returns {Promise<*>} Response data.
   */
  put = (path, body, params, options = {}) =>
    this.request("PUT", path, { body, params, ...options });

  /**
   * Issues an HTTP PATCH request.
   *
   * @param {string} path - API endpoint path.
   * @param {Object} [body] - Request body payload.
   * @param {Object} [params] - Query parameters.
   * @param {Object} [options] - Additional request options.
   * @returns {Promise<*>} Response data.
   */
  patch = (path, body, params, options = {}) =>
    this.request("PATCH", path, { body, params, ...options });

  /**
   * Issues an HTTP DELETE request.
   *
   * @param {string} path - API endpoint path.
   * @param {Object} [body] - Request body payload.
   * @param {Object} [params] - Query parameters.
   * @param {Object} [options] - Additional request options.
   * @returns {Promise<*>} Response data.
   */
  delete = (path, body, params, options = {}) =>
    this.request("DELETE", path, { body, params, ...options });
}

/**
 * Creates a guarded CodaAPI instance protected by Proxies.
 *
 * @param {...*} args - Arguments passed directly to the CodaAPI constructor.
 * @returns {Object} Proxied CodaAPI instance.
 */
export const newCodaAPI = (...args) => {
  return Proxies.guard(new CodaAPI(...args));
};