// coda doesnt support the same queries as drive, so to keep the driveapp searches intact we'll use this query to convert to coda equivalents where they exist

/**
 * Converts a Google Drive search query string (`q`) into Coda API `listDocs` parameters.
 * 
 * @param {string} driveQuery - Google Drive 'q' string (e.g. "'fl-Vn2t1pUvlj' in parents and 'me' in owners")
 * @param {Object} [extraOptions={}] - Optional pagination/limit options (e.g. { limit: 10, pageToken: 'abc' })
 * @returns {Object} Coda options object for listDocs()
 */
export const convertDriveQueryToCoda = (driveQuery, extraOptions = {})=> {
  const codaOptions = { ...extraOptions };

  if (!driveQuery || typeof driveQuery !== 'string') {
    return codaOptions;
  }

  // 1. Extract Parent Folder ID: 'folder_id' in parents
  const parentMatch = driveQuery.match(/['"]([^'"]+)['"]\s+in\s+parents/i);
  if (parentMatch) {
    codaOptions.folderId = parentMatch[1];
  }
  // if it was root then the folderId is actually a workspace id ws- not a folder id fl-
  
  // 2. Extract Ownership: 'me' in owners
  if (/['"]me['"]\s+in\s+owners/i.test(driveQuery)) {
    codaOptions.isOwner = true;
  }

  // 3. Extract Starred Status: starred = true / false or just starred
  const starredMatch = driveQuery.match(/starred\s*(=|!=)\s*(true|false)/i);
  if (starredMatch) {
    const operator = starredMatch[1];
    const boolValue = starredMatch[2].toLowerCase() === 'true';
    codaOptions.isStarred = operator === '=' ? boolValue : !boolValue;
  } else if (/\bstarred\b/i.test(driveQuery) && !/not\s+starred/i.test(driveQuery)) {
    codaOptions.isStarred = true;
  }

  // 4. Extract Text Search Query: name contains '...' or fullText contains '...'
  const queryMatch = driveQuery.match(/(?:name|fullText)\s+contains\s+['"]([^'"]+)['"]/i);
  if (queryMatch) {
    codaOptions.query = queryMatch[1];
  }

  // 5. Extract Workspace ID if mapped via custom properties (Optional)
  const workspaceMatch = driveQuery.match(/workspaceId\s*=\s*['"]([^'"]+)['"]/i);
  if (workspaceMatch) {
    codaOptions.workspaceId = workspaceMatch[1];
  }

  return codaOptions;
}

// ==========================================
// Usage Examples
// ==========================================
/*
// Example 1: Folder check & standard drive query
const driveQuery1 = "'fl-Vn2t1pUvlj' in parents and mimeType != 'application/vnd.google-apps.folder'";
console.log(convertDriveQueryToCoda(driveQuery1));
// Output: { folderId: 'fl-Vn2t1pUvlj' }

// Example 2: Combined ownership, query, and starred check
const driveQuery2 = "'me' in owners and name contains 'Project Plan' and starred = true";
console.log(convertDriveQueryToCoda(driveQuery2, { limit: 20 }));
// Output: { limit: 20, isOwner: true, isStarred: true, query: 'Project Plan' }
*/