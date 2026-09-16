import { CodaConstants } from "./constants.js";
import { sanitizeId, extractDocIdFromUrl } from "./codaid.js";

/**
 * Constructs a synthetic file metadata object representing a page's Markdown canvas content.
 *
 * @param {string} docId - Parent Coda Document ID.
 * @param {string} pageId - Parent Coda Page ID.
 * @param {string} pageName - Display name of the parent page.
 * @param {string} parentId - Compound parent container ID.
 * @returns {Object} Synthetic Drive file metadata object.
 */
export const createSyntheticCanvasFile = (docId, pageId, pageName, parentId) => {
  const syntheticId = `${docId}/${pageId}/_canvas`;
  return {
    id: syntheticId,
    name: `${pageName || "Canvas"}`,
    mimeType: "text/markdown",
    kind: "drive#file",
    parents: [parentId],
    trashed: false,
    webViewLink: `https://coda.io/d/_d${docId}/_su${pageId}`,
    platform: "coda",
    __platformCustom: {
      docId,
      pageId,
      isDoc: false,
      isPage: false,
      isFolder: false,
      isSynthetic: true,
      syntheticType: "canvas",
      contentType: "canvas",
    },
  };
};

/**
 * Creates and appends synthetic canvas file entries for an array of Coda page objects.
 *
 * @param {Array<Object>} pages - List of raw Coda page objects.
 * @param {string} docId - Parent Coda Document ID.
 * @param {Array<Object>} targetList - Target array to receive constructed synthetic files.
 * @returns {void}
 */
export const appendSyntheticCanvasFiles = (pages, docId, targetList) => {
  pages.forEach((page) => {
    const rawPageId = sanitizeId(page.id).split("/").pop();
    const pageName = page.name || page.title || "Canvas";
    targetList.push(
      createSyntheticCanvasFile(
        docId,
        rawPageId,
        pageName,
        `${docId}/${rawPageId}`
      )
    );
  });
};

/**
 * Translates a raw Coda API resource item into a unified Drive API resource representation.
 *
 * @param {Object} item - The raw Coda resource item from the API.
 * @param {string} parentId - The parent folder ID for this item.
 * @param {string|null} overrideMimeType - Optional MIME type to force on the resulting resource.
 * @param {string|null} forcedDocId - Optional Document ID to force on the resource, overriding any ID found in the item.
 * @returns {Object|null} The translated resource in Drive API format.
 */
export const translateCodaResource = (
  item,
  parentId = "root",
  overrideMimeType = null,
  forcedDocId = null
) => {
  if (!item) return null;

  if (item.id === "root" || item.isRoot) {
    return {
      id: "root",
      name: "My Drive",
      mimeType: CodaConstants.TYPES.folder,
      kind: "drive#file",
      parents: [],
      trashed: false,
      platform: "coda",
      __platformCustom: {
        isDoc: false,
        isPage: false,
        isFolder: true,
        type: "folder",
        docId: null,
        item,
      },
    };
  }

  const rawItemIdStr = sanitizeId(item.id);
  const leafItemId = rawItemIdStr.includes("/")
    ? rawItemIdStr.split("/").pop()
    : rawItemIdStr;

  const name = item.name || item.title || "Untitled";

  const actualDocId =
    forcedDocId ||
    item.docId ||
    extractDocIdFromUrl(item.href) ||
    extractDocIdFromUrl(item.browserLink || item.webViewLink) ||
    (item.type === "doc" ? leafItemId : null);

  const isCodaTable =
    item.type === "table" ||
    item.type === "grid" ||
    item.type === "view" ||
    item.tableType === "table" ||
    item.tableType === "grid" ||
    leafItemId.startsWith("grid-") ||
    leafItemId.startsWith("table-");

  const isCodaDoc = item.type === "doc" || (!item.parent && !actualDocId);

  const isCodaPage =
    !isCodaTable &&
    (item.type === "page" ||
      Boolean(item.children) ||
      Boolean(item.parent) ||
      Boolean(actualDocId && leafItemId !== actualDocId));

  const isExplicitFolder = item.isFolder === true || item.type === "folder";

  const isLeafContent =
    item.isLeaf === true ||
    isCodaTable ||
    item.type === "canvas" ||
    item.type === "control" ||
    item.type === "formula";

  const isFolder =
    !isLeafContent && (isExplicitFolder || isCodaDoc || isCodaPage);

  const finalId =
    isCodaDoc || !actualDocId ? leafItemId : `${actualDocId}/${leafItemId}`;

  let calculatedParentId = parentId || "root";
  if (item.parent && item.parent.id) {
    const parentPageRaw = sanitizeId(item.parent.id).split("/").pop();
    calculatedParentId = actualDocId
      ? `${actualDocId}/${parentPageRaw}`
      : parentPageRaw;
  }

  let mimeType = overrideMimeType || null;
  if (!mimeType) {
    if (isFolder) {
      mimeType = CodaConstants.TYPES.folder;
    } else if (isCodaTable) {
      mimeType = CodaConstants.TYPES.table;
    } else {
      mimeType = CodaConstants.TYPES.doc;
    }
  }

  return {
    id: finalId,
    name,
    mimeType,
    kind: "drive#file",
    parents: [calculatedParentId],
    trashed: Boolean(item.trashed),
    webViewLink:
      item.browserLink ||
      item.webViewLink ||
      `https://coda.io/d/_d${actualDocId || leafItemId}`,
    platform: "coda",
    __platformCustom: {
      docId: actualDocId,
      pageId: isCodaDoc
        ? null
        : isCodaPage
          ? leafItemId
          : item.parent?.id || null,
      isDoc: isCodaDoc,
      isPage: isCodaPage,
      isFolder,
      contentType: isFolder ? "folder" : item.type || "doc",
      item,
    },
  };
};