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

  // 1. Extract Parent ID: 'folder_id' in parents
  const parentMatch = driveQuery.match(/['"]([^'"]+)['"]\s+in\s+parents/i);
  if (parentMatch) {
    const rawTarget = parentMatch[1];
    
    if (rawTarget === "root") {
      codaOptions.isRoot = true;
    } else if (rawTarget.includes('/')) {
      // Handles subpage traversal: "docId/pageId"
      const [docId, pageId] = rawTarget.split('/');
      codaOptions.docId = docId;
      codaOptions.pageId = pageId;
      codaOptions.folderId = rawTarget; // Preserved for DriveApp compatibility
    } else {
      // Handles top-level doc traversal: "docId"
      codaOptions.docId = rawTarget;
      codaOptions.folderId = rawTarget;
    }
  }

  // 2. Extract Text Search Query
  const queryMatch = driveQuery.match(/(?:name|fullText)\s+contains\s+['"]([^'"]+)['"]/i);
  if (queryMatch) {
    codaOptions.query = queryMatch[1];
  }

  // 3. Extract mimeType filter (to distinguish folder vs file requests)
  const mimeMatch = driveQuery.match(/mimeType\s*=\s*['"]([^'"]+)['"]/i);
  if (mimeMatch) {
    codaOptions.mimeType = mimeMatch[1];
    codaOptions.isFolderQuery = mimeMatch[1] === 'application/vnd.google-apps.folder';
  }

  return codaOptions;
};