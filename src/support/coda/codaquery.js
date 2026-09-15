/**
 * Converts a Google Drive search query string (`q`) into Coda API parameters.
 * 
 * @param {string} driveQuery - Google Drive 'q' string (e.g. "'fl-Vn2t1pUvlj/canvas-1F8C4n-Br7' in parents")
 * @param {Object} [extraOptions={}] - Optional pagination/limit options
 * @returns {Object} Coda options object for API calls
 */
export const convertDriveQueryToCoda = (driveQuery, extraOptions = {}) => {
  const codaOptions = { ...extraOptions };

  if (!driveQuery || typeof driveQuery !== 'string') {
    return codaOptions;
  }

  // 1. Parent traversal
  const parentMatch = driveQuery.match(/['"]([^'"]+)['"]\s+in\s+parents/i);
  if (parentMatch) {
    const rawTarget = parentMatch[1];
    if (rawTarget === "root") {
      codaOptions.isRoot = true;
    } else if (rawTarget.includes('/')) {
      const [docId, pageId] = rawTarget.split('/');
      codaOptions.docId = docId;
      codaOptions.pageId = pageId;
      codaOptions.folderId = rawTarget;
    } else {
      codaOptions.docId = rawTarget;
      codaOptions.folderId = rawTarget;
    }
  }

  // 2. Extract Name Match
  const nameMatch = driveQuery.match(/(?:name|title)\s*(?:=|\bcontains\b)\s*['"]([^'"]+)['"]/i);
  if (nameMatch) {
    codaOptions.name = nameMatch[1];
  }

  // 3. Extract mimeType Filter (handles both = and !=)
  const mimeMatch = driveQuery.match(/mimeType\s*(=|!=)\s*['"]([^'"]+)['"]/i);
  if (mimeMatch) {
    const operator = mimeMatch[1];
    const mimeType = mimeMatch[2];
    
    codaOptions.mimeType = mimeType;
    if (operator === '=') {
      codaOptions.isFolderQuery = mimeType === 'application/vnd.google-apps.folder';
    } else if (operator === '!=') {
      codaOptions.isFileOnlyQuery = mimeType === 'application/vnd.google-apps.folder';
    }
  }

  return codaOptions;
};