/**
 * Handles operations related to Coda Table Rows.
 */

import { Proxies } from "../../proxies.js";
export class RowsResource {
  /**
   * @param {Object} client - Main CodaAPI client instance.
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Lists rows for a table.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} tableIdOrName - Target Table ID or Name.
   * @param {Object} [params] - Query parameters.
   * @returns {Promise<Object>} Response object containing items.
   */
  list = (docId, tableIdOrName, params) =>
    this.client.get(`docs/${docId}/tables/${tableIdOrName}/rows`, params);

  /**
   * Retrieves specific row details.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} tableIdOrName - Target Table ID or Name.
   * @param {string} rowIdOrName - Target Row ID or Name.
   * @param {Object} [params] - Query parameters.
   * @returns {Promise<Object>} Row response data.
   */
  get = (docId, tableIdOrName, rowIdOrName, params) =>
    this.client.get(
      `docs/${docId}/tables/${tableIdOrName}/rows/${rowIdOrName}`,
      params
    );

  /**
   * Inserts or upserts table rows.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} tableIdOrName - Target Table ID or Name.
   * @param {Array<Object>} rows - Array of row objects to insert.
   * @param {Object} [params] - Query parameters.
   * @returns {Promise<Object>} API creation response.
   */
  insertOrUpsert = (docId, tableIdOrName, rows, params) =>
    this.client.post(
      `docs/${docId}/tables/${tableIdOrName}/rows`,
      { rows },
      params
    );

  /**
   * Updates an existing row.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} tableIdOrName - Target Table ID or Name.
   * @param {string} rowIdOrName - Target Row ID or Name.
   * @param {Object} row - Object mapping values to update.
   * @param {Object} [params] - Query parameters.
   * @returns {Promise<Object>} Updated row details.
   */
  update = (docId, tableIdOrName, rowIdOrName, row, params) =>
    this.client.put(
      `docs/${docId}/tables/${tableIdOrName}/rows/${rowIdOrName}`,
      { row },
      params
    );

  /**
   * Deletes a single row from a table.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} tableIdOrName - Target Table ID or Name.
   * @param {string} rowIdOrName - Target Row ID or Name.
   * @returns {Promise<Object|null>} Response status payload.
   */
  delete = (docId, tableIdOrName, rowIdOrName) =>
    this.client.delete(
      `docs/${docId}/tables/${tableIdOrName}/rows/${rowIdOrName}`
    );

  /**
   * Deletes multiple rows simultaneously.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} tableIdOrName - Target Table ID or Name.
   * @param {Array<string>} rowIds - List of row IDs to delete.
   * @returns {Promise<Object|null>} Response status payload.
   */
  deleteMultiple = (docId, tableIdOrName, rowIds) =>
    this.client.delete(`docs/${docId}/tables/${tableIdOrName}/rows`, {
      rowIds,
    });

  /**
   * Triggers an action button inside a table row.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} tableIdOrName - Target Table ID or Name.
   * @param {string} rowIdOrName - Target Row ID or Name.
   * @param {string} columnIdOrName - Target Column containing the button.
   * @returns {Promise<Object>} Button trigger response payload.
   */
  pushButton = (docId, tableIdOrName, rowIdOrName, columnIdOrName) =>
    this.client.post(
      `docs/${docId}/tables/${tableIdOrName}/rows/${rowIdOrName}/buttons/${columnIdOrName}`
    );
}

export const newRowsResource = (...args) => {
  return Proxies.guard(new RowsResource(...args));
};
