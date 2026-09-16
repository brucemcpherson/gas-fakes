import { createItem } from "../codautils.js";

/**
 * Handles operations related to Coda Documents.
 */

import { Proxies } from "../../proxies.js";
export class DocsResource {
  /**
   * @param {Object} client - Main CodaAPI client instance.
   */
  constructor(client) {
    this.client = client;
    this.resourceType = "docs";
  }

  /**
   * Lists Coda documents.
   *
   * @param {Object} [params] - Query options (e.g., folderId, workspaceId, query, limit).
   * @returns {Promise<Object>} API response listing documents.
   */
  list = async (params = {}) => {
    const data = await this.client.get("docs", params);
    if (data?.items && params.workspaceId && !params.folderId) {
      data.items = data.items.filter((f) => !f.folder);
    }
    return data;
  };

  /**
   * Creates a new document.
   *
   * @param {Object} body - Document configuration payload.
   * @param {Object} [params] - Query parameters.
   * @returns {Promise<Object>} Created doc metadata.
   */
  create = (body, params) => this.client.post("docs", body, params);

  /**
   * Retrieves document details.
   *
   * @param {string} docId - Target Document ID.
   * @returns {Promise<Object>} Document details payload.
   */
  get = (docId) => this.client.get(`docs/${docId}`);

  /**
   * Deletes a document.
   *
   * @param {string} docId - Target Document ID.
   * @returns {Promise<Object|null>} Response object.
   */
  delete = (docId) => this.client.delete(`docs/${docId}`);

  /**
   * Updates document metadata.
   *
   * @param {string} docId - Target Document ID.
   * @param {Object} body - Update payload.
   * @returns {Promise<Object>} Updated document response.
   */
  update = (docId, body) => this.client.patch(`docs/${docId}`, body);

  /**
   * Publishes a document.
   *
   * @param {string} docId - Target Document ID.
   * @param {Object} body - Publishing settings.
   * @returns {Promise<Object>} Response data.
   */
  publish = (docId, body) => this.client.put(`docs/${docId}/publish`, body);

  /**
   * Unpublishes a document.
   *
   * @param {string} docId - Target Document ID.
   * @returns {Promise<Object|null>} Response data.
   */
  unpublish = (docId) => this.client.delete(`docs/${docId}/publish`);

  /**
   * Creates a document item and initializes content.
   *
   * @param {Object} params - Document creation options.
   * @param {string} params.name - Title of the document.
   * @param {string} [params.media] - Markdown/text canvas content.
   * @param {string} [params.folderId] - Target folder ID.
   * @param {string} [params.workspaceId] - Target workspace ID.
   * @returns {Promise<Object>} Created document resource object.
   */
  createItem = async ({ name, media, folderId, workspaceId }) => {
    return createItem({
      name,
      media,
      folderId,
      workspaceId,
      thisResource: this,
    });
  };
}
export const newDocsResource = (...args) => {
  return Proxies.guard(new DocsResource(...args));
};