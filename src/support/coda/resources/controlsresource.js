/**
 * Handles operations related to Coda Controls.
 */

import { Proxies } from "../../proxies.js";

export class ControlsResource {
  /**
   * @param {Object} client - Main CodaAPI client instance.
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Lists interactive controls in a document.
   *
   * @param {string} docId - Target Document ID.
   * @param {Object} [params] - Query options.
   * @returns {Promise<Object>} List response with controls.
   */
  list = (docId, params) => this.client.get(`docs/${docId}/controls`, params);

  /**
   * Gets specific control details.
   *
   * @param {string} docId - Target Document ID.
   * @param {string} controlIdOrName - Control ID or display name.
   * @returns {Promise<Object>} Control details payload.
   */
  get = (docId, controlIdOrName) =>
    this.client.get(`docs/${docId}/controls/${controlIdOrName}`);
}
export const newControlsResource = (...args) => {
  return Proxies.guard(new ControlsResource(...args));
};