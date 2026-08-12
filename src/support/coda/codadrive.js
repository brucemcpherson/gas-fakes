import { newCodaAPI } from "./codaapi.js";
import { CodaConstants } from './constants.js'
import { googleMimeTypes } from '../../services/mimetype/googlemimetypes.js'
import { isFolderOnly, filterOut } from '../helpers.js'


const folderType = googleMimeTypes.FOLDER

export const handleCodaDrive = async (
  Auth,
  { prop, method, params, media, resource, options },
) => {
  // ... (existing helper definitions)

  const token = await Auth.getAccessToken();
  const coda = newCodaAPI(token, options);
  const fResource = isFolderOnly(params) ? "folders" : "docs";

  switch (prop) {
    case "files":
      switch (method) {
        case "get": {
          const file = await coda[fResource].get(params.fileId);
          return {
            data: translateFile(file),
            response: { status: 200 },
          };
        }

        case "list": {
          let result = await coda[fResource].list(params);
          const files = filterOut(params, result?.items || []);
          return {
            data: { files: files ? files.map(translateFile) : files },
            response: { status: 200 },
          };
        }

        // --- Handle File Creation (e.g. DriveApp.createFile or files.create) ---
        case "create": {
          const name = resource?.name || params?.name || "Untitled";
          const parents = resource?.parents || params?.parents || [];
          const folderId = parents[0] !== "root" ? parents[0] : undefined;

          // Extract plain text from media body if present
          let textContent = "";
          if (media?.body) {
            textContent = typeof media.body === "string" 
              ? media.body 
              : media.body.toString("utf-8");
          }

          const createdDoc = await coda.docs.createWithContent(name, textContent, folderId);

          return {
            data: translateFile(createdDoc),
            response: { status: 200 },
          };
        }

        // --- Handle File/Content Update ---
        case "update": {
          const fileId = params?.fileId;
          if (!fileId) throw new Error("fileId is required for files.update");

          // 1. If metadata/name needs updating
          if (resource?.name) {
            await coda.docs.update(fileId, { title: resource.name });
          }

          // 2. If content needs updating
          if (media?.body) {
            const textContent = typeof media.body === "string"
              ? media.body
              : media.body.toString("utf-8");

            const pages = await coda.pages.list(fileId, { limit: 1 });
            const primaryPage = pages.items?.[0];

            if (primaryPage) {
              await coda.pages.setContent(fileId, primaryPage.id, textContent);
            }
          }

          const updatedDoc = await coda.docs.get(fileId);
          return {
            data: translateFile(updatedDoc),
            response: { status: 200 },
          };
        }

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
