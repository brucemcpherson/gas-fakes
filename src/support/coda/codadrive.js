import { newCodaAPI } from "./codaapi.js";
import { CodaConstants } from "./constants.js";
import { isTextMimeType } from "../googlemimetypes.js";
import { isFolderOnly, isFolder } from "../helpers.js";
import { convertDriveQueryToCoda } from "./codaquery.js";
import { newFakeBlob } from "../../services/utilities/fakeblob.js";
import is from "@sindresorhus/is";

// we need this because we couldnt pass a blob via the worker as its non-serializable
// and coda only supports text media uploads for now
const prepareMediaBlob = ({ mimeType, bytes, name }) => {
  if (isTextMimeType(mimeType)) {
    return newFakeBlob(bytes, mimeType, name);
  } else {
    throw new Error("only support text content for coda for now");
  }
};
export const handleCodaDrive = async (
  Auth,
  {
    prop = "files",
    method,
    params: googleParams,
    bytes, //this should be bytes
    mimeType, // the mimeType of the bytes
    resource, // this should contain the requied mimeType
    options,
    fileId,
  },
) => {
  const token = await Auth.getAccessToken();
  const coda = newCodaAPI(token, options);


  // coda has an entirely different approach for queries so we'll need to do a comprehensive translation where equivalents exist
  // and we have to drop the fields query too
  let { fields, ...params } = googleParams;
  if (params.q) {
    params = convertDriveQueryToCoda(params.q);
  }
  // the file id could be in either depenind ont where we're called from
  const codaId = fileId || params.fileId;

  // various ways we could be talking about a folder or a doc
  // the paraneters might contain a mimetype filer, or the resource itself might contain a mimetype filtwe
  const fResource =
    isFolderOnly(googleParams) || isFolder(resource) || codaId?.startsWith ('fl-') ? "folders" : "docs";
  
  // its possible that the folderId is actually a workspaceId, so we need to drop the folder filter
  if (params.folderId?.startsWith("ws-")) {
    params.workspaceId = params.folderId;
    // we also need to add the inFolder= false parameter as we want to only include things at the top level
    params.inFolder = false;
    delete params.folderId;
  }
  
  switch (prop) {
    case "files":
      switch (method) {
        case "get": {
          if (!codaId) {
            throw new Error("no coda fileId found for update method");
          }
          const file = await coda[fResource].get(codaId);
          return {
            data: translateFile(file),
            response: { status: 200 },
          };
        }

        case "list": {
          // listing at workspace level will have a workspaceId 
          // list at folder level will have a folderId     
          let result = await coda[fResource].list(params);
          const files = result?.items || [];
          return {
            data: { files: files ? files.map(translateFile) : files },
            response: { status: 200 },
          };
        }

        case "create": {
          const name = resource?.name || params?.name || "Untitled";
          const parents = resource?.parents || params?.parents || [];

          // Normalize folderId: null/'root'/undefined means top-level workspace
          let folderId = parents[0];
          if (folderId === "root") {
            folderId = undefined; // Top-level workspace creation
          }

          let createdDoc = null;
          if (fResource === "docs") {
            const blob = prepareMediaBlob({ mimeType, bytes, name });
            const media = blob.getDataAsString();
            createdDoc = await coda.docs.createItem({
              name,
              folderId,
              media,
            });
          } else {
            if (bytes) {
              throw new Error(
                "Cannot add binary media content directly to a folder.",
              );
            }
            createdDoc = await coda.folders.createItem({
              name,
              folderId,
            });
          }

          return {
            data: translateFile(createdDoc),
            response: { status: 200 },
          };
        }

        // --- Handle File/Content Update ---
        case "update": {
          if (!codaId) {
            throw new Error("no coda fileId found for update method");
          }
          if (resource && Reflect.has(resource, "trashed")) {
            // in coda we need to issue a delete as opposed to just settings a property
            if (resource.trashed) {
              return await coda[fResource].delete(codaId);
            } else {
              throw new Error("...undelete no implemented in coda");
            }
          }
          throw new Error(`coda drive update not fully implemented yet`);
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

  const id = codaItem.id === 'root' ? String(codaItem.workspaceId) : codaItem.id ;
  if (!codaItem.id) {
    throw new Error (`failed to get coda id for ${JSON.stringify(codaItem)}`)
  }
  // Handle Parent Mapping for Google Drive compatibility
  let parents = null;

  let isRoot = codaItem.type === "workspace_root"
  if (isRoot) {
    parents = []; // Root container has no parent
  } else if (codaItem.folder?.id) {
    parents = [String(codaItem.folder.id)]; // Item lives inside a Coda folder
  } else if (codaItem.parentFolder?.id) {
    parents = [String(codaItem.parentFolder.id)]; // Coda Subfolder parent
  } else {
    // If no parent folder is defined, it lives in the root Workspace
    const { workspace } = codaItem
    if (!workspace?.id) {
      throw new Error (`failed to get coda workspace id for ${JSON.stringify(codaItem)}`)
    }
    parents = [workspace.id];
  }

  // Map MIME types
  let mimeType = CodaConstants.TYPES[codaItem.type];
  if (!mimeType) {
    throw new Error ('unknown coda type', codaItem.type)
  }


  const createdTime = codaItem.createdAt
    ? new Date(codaItem.createdAt).toISOString()
    : null;
  const modifiedTime =
    codaItem.updatedAt || codaItem.lastModifiedAt
      ? new Date(codaItem.updatedAt || codaItem.lastModifiedAt).toISOString()
      : createdTime;

  const __platformCustom = {
    docSize: codaItem.docSize,
    href: codaItem.href,
    type: codaItem.type,
    owner: codaItem.owner,
    ownerName: codaItem.ownerName,
    sourceDoc: codaItem.sourceDoc,
    workspace: codaItem.workspace,
    canEdit: codaItem.canEdit,
    workspaceId: codaItem.workspaceId
  };

  return {
    id,
    name: codaItem.name,
    mimeType,
    kind: "drive#file",
    createdTime,
    modifiedTime,
    size: "0",
    parents,
    trashed: false,
    description: codaItem.description || "",
    webViewLink: codaItem.browserLink,
    __platformCustom,
    __rootRequested: isRoot,
    platform: "coda"
  };
};
