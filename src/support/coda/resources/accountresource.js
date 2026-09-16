/**
 * Handles operations related to Coda Account and authenticated token context.
 */

import { Proxies } from "../../proxies.js";

export class AccountResource {
  /**
   * @param {Object} client - Main CodaAPI client instance.
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Retrieves profile information for the authenticated API token owner.
   *
   * @returns {Promise<Object>} User account profile.
   */
  whoami = () => this.client.get("whoami");

  /**
   * Resolves the primary default workspace for the current authenticated user.
   *
   * @returns {Promise<Object>} Default workspace metadata.
   */
  getDefaultWorkspace = async () => {
    const userInfo = await this.whoami();
    const primaryWs = userInfo.workspace;

    if (!primaryWs?.id) {
      throw new Error(
        "Unable to resolve a valid workspace from current Coda token."
      );
    }
    return primaryWs;
  };
}

export const newAccountResource = (...args) => {
  return Proxies.guard(new AccountResource(...args));
};