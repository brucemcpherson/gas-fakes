import { slogger } from "../slogger.js";

/**
 * Handles operations related to Coda Pages within Documents.
 */
export class PagesResource {
  /**
   * @param {Object} client - Main CodaAPI client instance.
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Lists pages inside a document.
   *
   * @param {string} docId - Target Document ID.
   * @param {Object} [params] - Query parameters.
   * @param {Object} [options] - Request options.
   * @returns {Promise<Object>} List response with pages.
   */
  list = (docId, params, options) =>
    this.client.get(`docs/${docId}/pages`, params, options);

  /**
   * Gets a specific page details.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} pageIdOrName - Target Page ID or title.
   * @param {Object} [options] - Request options.
   * @returns {Promise<Object>} Page metadata.
   */
  get = (docId, pageIdOrName, options) =>
    this.client.get(`docs/${docId}/pages/${pageIdOrName}`, null, options);

  /**
   * Creates a page within a document.
   *
   * @param {string} docId - Target Document ID.
   * @param {Object} body - Creation options.
   * @param {Object} [options] - Request options.
   * @returns {Promise<Object>} Created page metadata.
   */
  create = (docId, body, options) =>
    this.client.post(`docs/${docId}/pages`, body, null, options);

  /**
   * Updates a page title and/or content with retry logic.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} pageId - Target Page ID.
   * @param {Object} [payload] - Update options.
   * @param {string} [payload.title] - New title.
   * @param {string} [payload.name] - Alternative property for title.
   * @param {string} [payload.content] - Replacement Markdown content.
   * @param {Object} [options] - Request options.
   * @returns {Promise<Object>} Updated page object.
   */
  update = async (docId, pageId, payload = {}, options = {}) => {
    return this._retryOperation(async () => {
      let pageObj = {};

      if (payload.title || payload.name) {
        pageObj = await this.client.put(
          `docs/${docId}/pages/${pageId}`,
          { name: payload.title || payload.name },
          null,
          options
        );
      } else {
        pageObj = await this.get(docId, pageId, options);
      }

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
          options
        );
      }

      return pageObj;
    });
  };

  /**
   * Deletes a page from a document.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} pageIdOrName - Target Page ID or Name.
   * @param {Object} [options] - Request options.
   * @returns {Promise<Object|null>} Response object.
   */
  delete = (docId, pageIdOrName, options) =>
    this.client.delete(`docs/${docId}/pages/${pageIdOrName}`, null, options);

  /**
   * Internal helper executing transient retry policies on initializing pages.
   *
   * @private
   * @param {Function} fn - Operation to execute.
   * @param {number} [maxAttempts=7] - Maximum retries.
   * @param {number} [initialDelay=2000] - Initial delay in milliseconds.
   * @returns {Promise<*>} Result from operation callback.
   */
  _retryOperation = async (fn, maxAttempts = 7, initialDelay = 2000) => {
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
            }, attempt ${attempt}/${maxAttempts})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }

        throw error;
      }
    }
  };

  /**
   * Creates a page and writes content to it.
   *
   * @param {string} docId - Target Document ID.
   * @param {Object} params - Page content parameters.
   * @param {string} params.name - Title of the page.
   * @param {string} [params.parentPageId] - Parent Page ID for nesting.
   * @param {string} [params.content] - Markdown canvas content.
   * @param {Object} [options] - Request options.
   * @returns {Promise<Object>} Created page object.
   */
  createWithContent = async (
    docId,
    { name, parentPageId, content },
    options = {}
  ) => {
    const page = await this.client.post(
      `docs/${docId}/pages`,
      { name, parentPageId },
      null,
      options
    );

    if (content) {
      await this.setContent(docId, page.id, content, options);
    }

    return page;
  };

  /**
   * Sets canvas content for a page.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} pageId - Target Page ID.
   * @param {string} content - Markdown payload.
   * @param {Object} [options] - Request options.
   * @returns {Promise<Object>} Updated page object.
   */
  setContent = async (docId, pageId, content, options = {}) =>
    this.update(docId, pageId, { content }, options);

  /**
   * Fetches export Markdown content for a page with polling and fallbacks.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} pageId - Target Page ID.
   * @param {Object} [options] - Request options.
   * @returns {Promise<string>} Markdown text content.
   */
  getContent = async (docId, pageId, options = {}) => {
    const maxAttempts = 6;
    let delay = 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const exportReq = await this.client.post(
          `docs/${docId}/pages/${pageId}/export`,
          { outputFormat: "markdown" },
          null,
          options
        );

        let exportStatus = exportReq;
        let statusAttempts = 0;

        while (exportStatus.status === "inProgress" && statusAttempts < 10) {
          statusAttempts++;
          await new Promise((r) => setTimeout(r, 1000));

          exportStatus = await this.client.get(
            `docs/${docId}/pages/${pageId}/export/${exportReq.id}`,
            null,
            options
          );
        }

        if (exportStatus.status === "complete" && exportStatus.downloadLink) {
          const response = await fetch(exportStatus.downloadLink);
          const text = await response.text();
          if (text || attempt === maxAttempts) {
            return text;
          }
        }

        if (
          exportStatus.status === "failed" ||
          exportStatus.status === "canceled"
        ) {
          slogger.log(
            `[CODA EXPORT] Page export ${exportStatus.status} for page ${pageId}`
          );
        }
      } catch (e) {
        try {
          const page = await this.get(docId, pageId, options);
          const metadataContent =
            page?.canvasContent?.content || page?.subtitle || "";
          if (metadataContent) return metadataContent;
        } catch (_) {}
      }

      await new Promise((r) => setTimeout(r, delay));
      delay *= 1.5;
    }

    return "";
  };
}