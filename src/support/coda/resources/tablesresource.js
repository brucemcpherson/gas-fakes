/**
 * Handles operations related to Coda Tables and Grids.
 */

import { Proxies } from "../../proxies.js";
export class TablesResource {
  /**
   * @param {Object} client - Main CodaAPI client instance.
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Lists tables within a document.
   *
   * @param {string} docId - Target Document ID.
   * @param {Object} [params] - Query options.
   * @returns {Promise<Object>} List response with tables.
   */
  list = (docId, params) => this.client.get(`docs/${docId}/tables`, params);

  /**
   * Gets details for a specific table.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} tableIdOrName - Target Table ID or Name.
   * @returns {Promise<Object>} Table details.
   */
  get = (docId, tableIdOrName) =>
    this.client.get(`docs/${docId}/tables/${tableIdOrName}`);

  /**
   * Lists columns for a table.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} tableIdOrName - Target Table ID or Name.
   * @param {Object} [params] - Query options.
   * @returns {Promise<Object>} List response with columns.
   */
  listColumns = (docId, tableIdOrName, params) =>
    this.client.get(`docs/${docId}/tables/${tableIdOrName}/columns`, params);

  /**
   * Retrieves column details.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} tableIdOrName - Target Table ID or Name.
   * @param {string} columnIdOrName - Target Column ID or Name.
   * @returns {Promise<Object>} Column details.
   */
  getColumn = (docId, tableIdOrName, columnIdOrName) =>
    this.client.get(
      `docs/${docId}/tables/${tableIdOrName}/columns/${columnIdOrName}`
    );

  /**
   * Convenience delegates mapping table rows directly via rows resource.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} tableIdOrName - Target Table ID or Name.
   * @param {Object} [params] - Query options.
   * @returns {Promise<Object>} List response with rows.
   */
  listRows = (docId, tableIdOrName, params) =>
    this.client.rows.list(docId, tableIdOrName, params);

  /**
   * Retrieves row details.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} tableIdOrName - Target Table ID or Name.
   * @param {string} rowIdOrName - Target Row ID or Name.
   * @param {Object} [params] - Query options.
   * @returns {Promise<Object>} Row response.
   */
  getRow = (docId, tableIdOrName, rowIdOrName, params) =>
    this.client.rows.get(docId, tableIdOrName, rowIdOrName, params);

  /**
   * Deletes a table.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} tableIdOrName - Target Table ID or Name.
   * @returns {Promise<Object|null>} Response object.
   */
  delete = (docId, tableIdOrName) =>
    this.client.delete(`docs/${docId}/tables/${tableIdOrName}`);
}

export const newTablesResource = (...args) => {
  return Proxies.guard(new TablesResource(...args));
};  