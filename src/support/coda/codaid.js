/**
 * Trims whitespace and ensures the identifier is formatted as a valid string.
 *
 * @param {string|number|null|undefined} id - The raw ID to sanitize.
 * @returns {string} The cleaned, trimmed string representation of the ID.
 */
export const sanitizeId = (id) => {
  if (!id) return "";
  return String(id).trim();
};

/**
 * Parses raw compound or simple IDs, including synthetic child identifiers & native IDs:
 * - "docId/pageId/_canvas" => { docId, pageId, childId: "_canvas", isSyntheticCanvas: true, isTable: false }
 * - "docId/grid-123"      => { docId, pageId: null, childId: "grid-123", isSyntheticCanvas: false, isTable: true }
 * - "docId/pageId"        => { docId, pageId, childId: null, isSyntheticCanvas: false, isTable: false }
 * - "docId"               => { docId, pageId: null, childId: null, isSyntheticCanvas: false, isTable: false }
 * - "root"                => { docId: null, pageId: null, isRoot: true }
 *
 * @param {string|null|undefined} rawId - The raw identifier string.
 * @returns {Object} Parsed identifier details.
 */
export const parseCodaId = (rawId) => {
  if (!rawId || rawId === "root") {
    return {
      docId: null,
      pageId: null,
      isRoot: true,
      isSyntheticCanvas: false,
      isTable: false,
      childId: null,
    };
  }

  const str = String(rawId).trim();
  if (str.includes("/")) {
    const parts = str
      .split("/")
      .map((p) => p.trim())
      .filter(Boolean);

    const docId = parts[0];
    const secondPart = parts.length > 1 ? parts[1] : null;
    const thirdPart = parts.length > 2 ? parts[2] : null;

    const isSyntheticCanvas = thirdPart === "_canvas";
    const isTable =
      (secondPart &&
        (secondPart.startsWith("grid-") || secondPart.startsWith("table-"))) ||
      (thirdPart &&
        (thirdPart.startsWith("grid-") || thirdPart.startsWith("table-")));

    let pageId = null;
    let childId = null;

    if (isSyntheticCanvas) {
      pageId = secondPart;
      childId = "_canvas";
    } else if (isTable) {
      childId = thirdPart || secondPart;
      pageId = thirdPart ? secondPart : null;
    } else {
      pageId = secondPart !== docId ? secondPart : null;
      childId = thirdPart;
    }

    return {
      docId,
      pageId,
      isRoot: false,
      isSyntheticCanvas,
      isTable,
      childId,
    };
  }

  const isTableDirect = str.startsWith("grid-") || str.startsWith("table-");

  return {
    docId: isTableDirect ? null : str,
    pageId: null,
    isRoot: false,
    isSyntheticCanvas: false,
    isTable: isTableDirect,
    childId: isTableDirect ? str : null,
  };
};

/**
 * Checks whether a given Coda resource file object belongs to a specified parent directory.
 *
 * @param {Object} file - The translated Drive file object to test.
 * @param {Array<string>} [file.parents] - List of parent IDs associated with the file.
 * @param {string|null|undefined} rawFolderId - The target folder or document ID container.
 * @returns {boolean} True if the file matches the target parent container.
 */
export const matchesParent = (file, rawFolderId) => {
  if (!rawFolderId) return true;

  const bareFolderId = rawFolderId.includes("/")
    ? rawFolderId.split("/")[1]
    : rawFolderId;
  const bareDocId = rawFolderId.includes("/")
    ? rawFolderId.split("/")[0]
    : rawFolderId;

  return (file.parents || []).some((p) => {
    const bareP = p.includes("/") ? p.split("/")[1] : p;
    return (
      p === rawFolderId ||
      p === bareFolderId ||
      p === bareDocId ||
      bareP === bareFolderId
    );
  });
};

/**
 * Extracts a Coda document ID from API endpoints or web browser URLs.
 *
 * @param {string|null|undefined} url - The URL string to inspect.
 * @returns {string|null} The extracted Coda Document ID, or null if no pattern matches.
 */
export const extractDocIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  const apiMatch = url.match(/\/docs\/([a-zA-Z0-9_-]+)/);
  if (apiMatch && apiMatch[1]) return apiMatch[1];

  const browserMatch = url.match(/\/d\/(?:_d)?([a-zA-Z0-9_-]+)/);
  if (browserMatch && browserMatch[1]) return browserMatch[1];

  return null;
};