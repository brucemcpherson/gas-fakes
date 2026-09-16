/**
 * Handles operations related to Coda Formulas.
 */

import { Proxies } from "../../proxies.js";
export class FormulasResource {
  /**
   * @param {Object} client - Main CodaAPI client instance.
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Lists formulas defined in a document.
   *
   * @param {string} docId - Target Document ID.
   * @param {Object} [params] - Query options.
   * @returns {Promise<Object>} Formula listing response.
   */
  list = (docId, params) => this.client.get(`docs/${docId}/formulas`, params);

  /**
   * Retrieves specific formula details.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} formulaIdOrName - Formula ID or display name.
   * @returns {Promise<Object>} Formula detail payload.
   */
  get = (docId, formulaIdOrName) =>
    this.client.get(`docs/${docId}/formulas/${formulaIdOrName}`);
}
export const newFormulasResource = (...args) => {
  return Proxies.guard(new FormulasResource(...args));
};