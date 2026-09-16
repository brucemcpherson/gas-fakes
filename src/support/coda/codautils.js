import is from "@sindresorhus/is";

/**
 * Creates a doc or folder item and optionally initializes it with canvas content.
 *
 * @param {Object} params - Helper creation options.
 * @param {string} params.name - Title or display name of the item.
 * @param {string} [params.media] - Text/Markdown payload to insert into the initial page.
 * @param {string} [params.folderId] - Target folder ID destination.
 * @param {Object} params.thisResource - Target resource instance (DocsResource or FoldersResource).
 * @param {string} [params.workspaceId] - Target Coda Workspace ID.
 * @returns {Promise<Object>} Created doc or folder resource object.
 */
export const createItem = async ({
  name: title,
  media,
  folderId,
  thisResource,
  workspaceId,
}) => {
  const docPayload = { title, name: title, workspaceId, folderId };
  const params = {};

  // Create the Doc or Folder
  const doc = await thisResource.create(docPayload, params);

  // Add text content if provided and this is a doc
  if (is.nonEmptyString(media)) {
    let firstPage = null;
    let attempts = 0;

    // Poll until Coda backend finishes creating the default initial page shell
    while (!firstPage && attempts < 10) {
      try {
        const pages = await thisResource.client.pages.list(doc.id, {
          limit: 1,
        });
        firstPage = pages.items?.[0];
      } catch (e) {
        // Page shell is still initializing on Coda backend
      }
      if (!firstPage) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    if (firstPage) {
      await thisResource.client.pages.update(doc.id, firstPage.id, {
        content: media,
      });

      // Pause briefly to allow Coda canvas indexer to commit content
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      throw new Error(
        `Failed to find first page to add text content for: ${title}`
      );
    }
  }

  return doc;
};

/**
 * Validates and extracts required params for folder listing.
 *
 * @param {Object} queryParams - Input query parameters.
 * @returns {{ folderId?: string, workspaceId?: string, params: Object }} Standardized list params.
 */
export const checkListParams = (queryParams) => {
  let { folderId, workspaceId, ...params } = queryParams;
  if (!workspaceId && !folderId) {
    throw new Error(
      "expected either a workspace id or parentfolderId for a list query"
    );
  }
  if (folderId) workspaceId = undefined;
  return {
    folderId,
    workspaceId,
    params,
  };
};