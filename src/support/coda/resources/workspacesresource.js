/**
 * Handles operations related to Coda Workspaces.
 */

import { Proxies } from "../../proxies.js";
export class WorkspacesResource {
  /**
   * @param {Object} client - Main CodaAPI client instance.
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Lists reachable workspaces.
   *
   * @param {Object} [params] - Query options.
   * @returns {Promise<Object>} List response with workspaces.
   */
  list = (params) => this.client.get("workspaces", params);

  /**
   * Gets details for a workspace.
   *
   * @param {string} workspaceId - Target Workspace ID.
   * @returns {Promise<Object>} Workspace details.
   */
  get = (workspaceId) => this.client.get(`workspaces/${workspaceId}`);

  /**
   * Lists folders residing inside a specified workspace.
   *
   * @param {string} workspaceId - Target Workspace ID.
   * @param {Object} [params] - Query options.
   * @returns {Promise<Object>} List response with workspace folders.
   */
  listFolders = (workspaceId, params) =>
    this.client.get(`workspaces/${workspaceId}/folders`, params);
}

export const newWorkspacesResource = (...args) => {
  return Proxies.guard(new WorkspacesResource(...args));
};
