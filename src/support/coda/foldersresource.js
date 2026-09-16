import { createItem, checkListParams } from "./codautils.js";

/**
 * Handles operations related to Coda Folders.
 */
export class FoldersResource {
  /**
   * @param {Object} client - Main CodaAPI client instance.
   */
  constructor(client) {
    this.client = client;
    this.resourceType = "folders";
  }

  /**
   * Creates a folder.
   *
   * @param {Object} body - Folder options payload.
   * @returns {Promise<Object>} Created folder details.
   */
  create = (body) => this.client.post("folders", body);

  /**
   * Lists folders matching query filters.
   *
   * @param {Object} [queryParams] - Filter options.
   * @returns {Promise<Object>} Folder list response.
   */
  list = async (queryParams = {}) => {
    const { folderId, workspaceId, params } = checkListParams(queryParams);
    let data = await this.client.get("folders", params);

    if (data?.items) {
      if (folderId) {
        data.items = data.items.filter((f) => f.folder?.id === folderId);
      } else if (workspaceId) {
        data.items = data.items.filter((f) => {
          const id = f?.workspace?.id;
          if (!id) {
            throw new Error(
              `could not establish workspace id in ${JSON.stringify(f)}`
            );
          }
          return id === workspaceId && !f.folder;
        });
      }
    }
    return data;
  };

  /**
   * Gets specific folder information or synthetic root representation.
   *
   * @param {string} folderId - Target Folder ID or "root".
   * @returns {Promise<Object>} Folder data object.
   */
  get = async (folderId) => {
    if (folderId === "root") {
      const primaryWs = await this.client.account.getDefaultWorkspace();

      return {
        id: folderId,
        name: primaryWs.name || "Coda Workspace Root",
        type: "workspace_root",
        workspaceId: primaryWs.id,
      };
    }
    return this.client.get(`folders/${folderId}`);
  };

  /**
   * Creates a folder item.
   *
   * @param {Object} params - Creation metadata.
   * @param {string} params.name - Folder name.
   * @param {string} [params.folderId] - Target parent folder ID.
   * @param {string} [params.workspaceId] - Target workspace ID.
   * @returns {Promise<Object>} Folder object response.
   */
  createItem = async ({ name, folderId, workspaceId }) => {
    return createItem({ name, folderId, thisResource: this, workspaceId });
  };

  /**
   * Updates folder metadata.
   *
   * @param {string} folderId - Target Folder ID.
   * @param {Object} body - Update payload.
   * @returns {Promise<Object>} Updated folder object.
   */
  update = (folderId, body) => this.client.patch(`folders/${folderId}`, body);

  /**
   * Moves a folder to a target parent folder or root.
   *
   * @param {string} folderId - Target Folder ID to move.
   * @param {string|null} targetParentFolderId - Destination parent folder ID.
   * @returns {Promise<Object>} Updated folder payload.
   */
  move = (folderId, targetParentFolderId) => {
    const parentFolderId =
      !targetParentFolderId || targetParentFolderId === "root"
        ? null
        : targetParentFolderId;

    return this.update(folderId, { parentFolderId });
  };

  /**
   * Deletes a folder.
   *
   * @param {string} folderId - Target Folder ID.
   * @returns {Promise<Object|null>} Response status.
   */
  delete = (folderId) => this.client.delete(`folders/${folderId}`);

  /**
   * Lists root folders using an async paginated loop.
   *
   * @param {Object} [params] - Query options.
   * @returns {Promise<Array<Object>>} Array of top-level root folders.
   */
  listRootFolders = async (params = {}) => {
    const rootFolders = [];

    for await (const folder of this.client.paginate("folders", params)) {
      if (!folder.parentFolder?.id && !folder.parentFolderId) {
        rootFolders.push(folder);
      }
    }

    return rootFolders;
  };
}