import { newCodaAPI } from "./codaapi.js";
import { CodaConstants } from './constants.js'
import { googleMimeTypes } from '../../services/mimetype/googlemimetypes.js'
const folderType = googleMimeTypes.FOLDER

export const handleCodaDrive = async (
  Auth,
  { prop, method, params, options },
) => {
  const isRoot = (params) => params?.fileId === "root";
  const isFolderOnly = (params) =>
    isRoot(params) ||
    (typeof params?.q === "string" &&
      params.q.includes(`mimeType = '${folderType}'`));
  const isFileOnly = (params) =>
    !isRoot(params) &&
    typeof params?.q === "string" &&
    params.q.includes(`mimeType != '${folderType}'`);
  const filterOut = (params, files) => {
    if (params.q) {
      if (isFolderOnly(params)) {
        files = files.filter((f) => f.mimeType === folderType);
      } else if (isFileOnly(params)) {
        files = files.filter((f) => f.mimeType !== folderType);
      }
    }
    return files;
  };

  const token = await Auth.getAccessToken();
  const coda = newCodaAPI(token, options);
  const fResource = isFolderOnly(params) ? "folders" : "docs";

  switch (prop) {
    case "files":
      switch (method) {
        case "get":
          const file = await coda[fResource].get(params.fileId);
          return {
            data: translateFile(file),
            response: { status: 200 },
          };
        case "list":
          let files = await coda[fResource].list(params);
          files = filterOut(params, files);
          return {
            data: { files: files ? files.map(translateFile) : files },
            response: { status: 200 },
          };
        default:
          throw new Error(`Coda Drive ${prop}.${method} not implemented`);
      }
    default:
      throw new Error(`Coda Drive ${prop} not implemented`);
  }
};

const translateFile = (codaItem) => {
  if (!codaItem) return null;

  const id = codaItem.id ? String(codaItem.id) : undefined;
  const isFolder = codaItem.type === "folder" || codaItem.type === "workspace";

  // Determine parent ID: Coda uses parentFolder.id, parentFolderId, or workspace.id
  const parentId =
    codaItem.parentFolder?.id ||
    codaItem.parentFolderId ||
    codaItem.folder?.id ||
    codaItem.workspace?.id ||
    null;

  // Map to Google Drive MIME types
  let mimeType = CodaConstants.TYPES[codaItem.type] 

  // Handle ISO date strings (Coda uses ISO-8601 strings, e.g. "2026-08-11T14:30:00.000Z")
  const createdTime = codaItem.createdAt
    ? new Date(codaItem.createdAt).toISOString()
    : null;
  const modifiedTime =
    codaItem.updatedAt || codaItem.lastModifiedAt
      ? new Date(codaItem.updatedAt || codaItem.lastModifiedAt).toISOString()
      : createdTime;

  return {
    id,
    name: codaItem.name || (id === "root" ? "Coda Root" : "Untitled"),
    mimeType,
    kind: "drive#file",
    createdTime,
    modifiedTime,
    size: "0", // Coda API doesn't expose byte sizes for docs/folders
    parents: parentId ? [String(parentId)] : [],
    trashed: Boolean(codaItem.isTrashed || codaItem.trashed),
    description: codaItem.description || "",
    webViewLink: codaItem.browserLink || codaItem.href || "",
    capabilities: {
      canEdit: !codaItem.isReadOnly,
      canRename: !codaItem.isReadOnly,
      canDelete: !codaItem.isReadOnly,
      canAddChildren: isFolder,
    },
  };
};
