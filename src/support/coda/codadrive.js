import { newCodaAPI } from "./codaapi.js";
import { CodaConstants } from "./constants.js";
import { convertDriveQueryToCoda } from "./codaquery.js";
import { syncError } from "../workersync/synclogger.js";

import { sanitizeId, parseCodaId, matchesParent } from "./codaid.js";
import {
  translateCodaResource,
  createSyntheticCanvasFile,
  appendSyntheticCanvasFiles,
} from "./codatranslator.js";
import {
  fetchTableContentAsCSV,
  fetchPageContentWithRetry,
  writeCodaPageContent,
  fetchCodaChildResources,
  prepareMediaBlob,
} from "./codacontent.js";

// Re-export core functions for backwards compatibility across imports
export { parseCodaId } from "./codaid.js";
export { translateCodaResource } from "./codatranslator.js";
export { prepareMediaBlob, createPageBlob } from "./codacontent.js";

/**
 * Main Drive bridge router. Maps incoming Google Drive API operations (get, list, create, update, download)
 * to Coda API calls and returns standardized results.
 *
 * @param {Object} Auth - Authentication provider supplying access tokens.
 * @param {Object} requestParams - Execution context and API call arguments.
 * @returns {Promise<{ data: Object|Array|null, response: { status: number, headers?: Object, statusText?: string } }>}
 */
export const handleCodaDrive = async (
  Auth,
  {
    prop = "files",
    method,
    params: googleParams,
    bytes,
    mimeType: requestMimeType,
    resource,
    options = {},
    fileId,
  }
) => {
  const token = await Auth.getAccessToken();
  const coda = newCodaAPI(token, options);

  let { fields, ...params } = googleParams || {};
  const targetId = fileId || params.fileId || resource?.id;
  const parsedTarget = parseCodaId(targetId);

  // ------------------------------------------------------------------
  // MEDIA / CONTENT DOWNLOAD REQUEST
  // ------------------------------------------------------------------
  if (method === "download" || params?.alt === "media") {
    if (!parsedTarget.docId) {
      return { data: [], response: { status: 200 } };
    }

    try {
      let content = "";
      let contentType = "text/markdown; charset=utf-8";

      if (parsedTarget.isTable) {
        const tableId = parsedTarget.childId || parsedTarget.pageId;
        content = await fetchTableContentAsCSV(
          coda,
          parsedTarget.docId,
          tableId
        );
        contentType = "text/csv; charset=utf-8";
      } else if (parsedTarget.pageId) {
        content = await fetchPageContentWithRetry(
          coda,
          parsedTarget.docId,
          parsedTarget.pageId
        );
      }

      const byteArray = Array.from(Buffer.from(content || "", "utf-8"));

      return {
        data: byteArray,
        response: {
          status: 200,
          headers: { "content-type": contentType },
        },
      };
    } catch (err) {
      console.error(
        `[CODA ERROR] Failed to fetch media content for target "${targetId}":`,
        err
      );
      return {
        data: [],
        response: { status: err?.status || 500, statusText: err?.message },
      };
    }
  }

  // ------------------------------------------------------------------
  // METADATA & MANAGEMENT REQUESTS (files.*)
  // ------------------------------------------------------------------
  switch (prop) {
    case "files":
      switch (method) {
        case "get": {
          if (parsedTarget.isRoot) {
            return {
              data: translateCodaResource({ id: "root", isRoot: true }),
              response: { status: 200 },
            };
          }

          if (parsedTarget.isSyntheticCanvas) {
            try {
              const page = await coda.pages.get(
                parsedTarget.docId,
                parsedTarget.pageId
              );
              const parentFolderId = `${parsedTarget.docId}/${parsedTarget.pageId}`;
              const syntheticFile = createSyntheticCanvasFile(
                parsedTarget.docId,
                parsedTarget.pageId,
                page?.name || page?.title || "Canvas",
                parentFolderId
              );

              const pageContent = await fetchPageContentWithRetry(
                coda,
                parsedTarget.docId,
                parsedTarget.pageId
              );
              syntheticFile.content = pageContent;

              return { data: syntheticFile, response: { status: 200 } };
            } catch (e) {
              return {
                data: null,
                response: { status: 404, statusText: "Not Found" },
              };
            }
          }

          if (parsedTarget.isTable) {
            try {
              const tableId = parsedTarget.childId || parsedTarget.pageId;
              let tableObj;
              if (typeof coda.tables?.get === "function") {
                tableObj = await coda.tables.get(parsedTarget.docId, tableId);
              } else if (coda.client && typeof coda.client.get === "function") {
                tableObj = await coda.client.get(
                  `docs/${parsedTarget.docId}/tables/${tableId}`
                );
              }

              const parentFolderId = tableObj?.parent?.id
                ? `${parsedTarget.docId}/${tableObj.parent.id}`
                : parsedTarget.docId;

              const translated = translateCodaResource(
                { ...tableObj, type: "table" },
                parentFolderId,
                CodaConstants.TYPES.spreadsheet,
                parsedTarget.docId
              );

              return { data: translated, response: { status: 200 } };
            } catch (e) {
              return {
                data: null,
                response: { status: 404, statusText: "Not Found" },
              };
            }
          }

          if (parsedTarget.docId && !parsedTarget.pageId) {
            try {
              const docObj = await coda.docs.get(parsedTarget.docId);
              const translated = translateCodaResource(
                docObj,
                "root",
                null,
                parsedTarget.docId
              );

              return { data: translated, response: { status: 200 } };
            } catch (e) {
              return {
                data: null,
                response: { status: 404, statusText: "Not Found" },
              };
            }
          }

          if (parsedTarget.docId && parsedTarget.pageId) {
            try {
              const page = await coda.pages.get(
                parsedTarget.docId,
                parsedTarget.pageId
              );

              const translated = translateCodaResource(
                page,
                parsedTarget.docId,
                null,
                parsedTarget.docId
              );

              return { data: translated, response: { status: 200 } };
            } catch (e) {
              return {
                data: null,
                response: { status: 404, statusText: "Not Found" },
              };
            }
          }

          return {
            data: null,
            response: { status: 404, statusText: "Not Found" },
          };
        }

        case "list": {
          let rawFolderId = params?.folderId;
          const { q, folderId, ...codaApiParams } = params || {};
          let targetName = null;

          if (q) {
            const parsed = convertDriveQueryToCoda(q);
            if (parsed.folderId) rawFolderId = parsed.folderId;
            if (parsed.isRoot) rawFolderId = "root";
            if (parsed.name) targetName = parsed.name;
          }

          const parsedFolder = parseCodaId(rawFolderId);

          const matchesName = (item) => {
            if (!targetName) return true;
            return item.name === targetName || item.title === targetName;
          };

          if (parsedFolder.isRoot && !targetName) {
            let docsRes;
            try {
              docsRes = await coda.docs.list(codaApiParams);
            } catch (err) {
              console.error("[CODA ERROR] Error listing docs:", err);
              docsRes = [];
            }

            const rawDocs = Array.isArray(docsRes)
              ? docsRes
              : docsRes?.items || docsRes?.data || [];

            let items = rawDocs.map((doc) =>
              translateCodaResource(doc, "root")
            );

            if (q && q.includes("mimeType !=")) {
              items = items.filter(
                (item) => item.mimeType !== CodaConstants.TYPES.folder
              );
            } else if (q && q.includes("mimeType =")) {
              items = items.filter(
                (item) => item.mimeType === CodaConstants.TYPES.folder
              );
            }

            return { data: { files: items }, response: { status: 200 } };
          }

          let combinedItems = [];

          if (targetName && !parsedFolder.docId) {
            let docsRes = await coda.docs.list(codaApiParams);
            const docs = Array.isArray(docsRes)
              ? docsRes
              : docsRes?.items || docsRes?.data || [];

            for (const doc of docs) {
              const translatedDoc = translateCodaResource(doc, "root");
              if (matchesName(translatedDoc)) {
                combinedItems.push(translatedDoc);
              }

              let pagesRes = [];
              try {
                pagesRes = await coda.pages.list(doc.id);
              } catch (e) {}
              const pages = Array.isArray(pagesRes)
                ? pagesRes
                : pagesRes?.items || [];

              pages.forEach((page) => {
                const parentId = page.parent?.id
                  ? `${doc.id}/${page.parent.id}`
                  : doc.id;
                const translatedPage = translateCodaResource(
                  page,
                  parentId,
                  null,
                  doc.id
                );
                if (matchesName(translatedPage)) {
                  combinedItems.push(translatedPage);
                }
              });

              const matchingPagesForCanvas = pages.filter((page) => {
                const pName = page.name || page.title;
                return pName === targetName;
              });
              appendSyntheticCanvasFiles(
                matchingPagesForCanvas,
                doc.id,
                combinedItems
              );

              const rawTables = await fetchCodaChildResources(
                coda,
                doc.id,
                "tables"
              );
              rawTables.forEach((tbl) => {
                const parentPageId = tbl.parent?.id
                  ? `${doc.id}/${tbl.parent.id}`
                  : doc.id;
                const translatedTable = translateCodaResource(
                  { ...tbl, type: "table" },
                  parentPageId,
                  CodaConstants.TYPES.spreadsheet,
                  doc.id
                );
                if (matchesName(translatedTable)) {
                  combinedItems.push(translatedTable);
                }
              });
            }
          } else {
            let pagesRes = [];
            try {
              pagesRes = await coda.pages.list(
                parsedFolder.docId,
                codaApiParams
              );
            } catch (err) {
              syncError(
                `...failed to fetch pages for doc ${parsedFolder?.docId}`
              );
              syncError("...coda params: " + JSON.stringify(codaApiParams));
              throw new Error(err);
            }

            const rawPages = Array.isArray(pagesRes)
              ? pagesRes
              : pagesRes?.items || [];

            const folderItems = rawPages.map((page) => {
              const actualParentId = page.parent?.id
                ? `${parsedFolder.docId}/${page.parent.id}`
                : parsedFolder.docId;
              return translateCodaResource(
                page,
                actualParentId,
                null,
                parsedFolder.docId
              );
            });

            const rawTables = await fetchCodaChildResources(
              coda,
              parsedFolder.docId,
              "tables"
            );
            const nonFolderFiles = rawTables.map((tbl) => {
              const parentPageId = tbl.parent?.id
                ? `${parsedFolder.docId}/${tbl.parent.id}`
                : parsedFolder.docId;
              return translateCodaResource(
                { ...tbl, type: "table" },
                parentPageId,
                CodaConstants.TYPES.spreadsheet,
                parsedFolder.docId
              );
            });

            if (parsedFolder.docId) {
              const targetPages = parsedFolder.pageId
                ? rawPages.filter((p) =>
                    sanitizeId(p.id).endsWith(parsedFolder.pageId)
                  )
                : rawPages;

              appendSyntheticCanvasFiles(
                targetPages,
                parsedFolder.docId,
                nonFolderFiles
              );
            }

            combinedItems = [...folderItems, ...nonFolderFiles].filter((item) =>
              matchesParent(item, rawFolderId)
            );
          }

          if (targetName) {
            combinedItems = combinedItems.filter(matchesName);
          }

          if (q && q.includes("mimeType !=")) {
            combinedItems = combinedItems.filter(
              (item) => item.mimeType !== CodaConstants.TYPES.folder
            );
          } else if (q && q.includes("mimeType =")) {
            combinedItems = combinedItems.filter(
              (item) => item.mimeType === CodaConstants.TYPES.folder
            );
          }

          return { data: { files: combinedItems }, response: { status: 200 } };
        }

        case "create": {
          const name = resource?.name || params?.name || "Untitled";
          const parents = resource?.parents || params?.parents || [];
          const rawParentId = parents[0];
          const parsedParent = parseCodaId(rawParentId);
          const reqMime =
            resource?.mimeType || params?.mimeType || requestMimeType;

          if (parsedParent.isRoot) {
            const newDoc = await coda.docs.create({ title: name });
            const translated = translateCodaResource(
              { ...newDoc, title: name, name, type: "doc" },
              "root",
              CodaConstants.TYPES.folder,
              newDoc.id
            );
            return { data: translated, response: { status: 200 } };
          }

          const docId = parsedParent.docId;
          const parentPageId = parsedParent.pageId;

          if (!docId) {
            throw new Error(
              `Unable to resolve parent Coda Doc ID from parent "${rawParentId}"`
            );
          }

          const targetMimeType = reqMime || CodaConstants.TYPES.doc;
          let contentStr = null;

          if (bytes !== undefined && bytes !== null) {
            const blob = prepareMediaBlob({
              mimeType: targetMimeType,
              bytes,
              name,
            });
            contentStr = blob.getDataAsString();
          } else if (resource?.content) {
            contentStr = resource.content;
          }

          const pagePayload = {
            title: name,
            ...(parentPageId ? { parentPageId } : {}),
          };
          const createdPage = await coda.pages.create(docId, pagePayload);
          const cleanPageId = sanitizeId(createdPage.id).split("/").pop();

          if (contentStr !== null) {
            await writeCodaPageContent(coda, docId, cleanPageId, {
              content: contentStr,
            });
          }

          const translated = translateCodaResource(
            {
              ...createdPage,
              id: cleanPageId,
              title: name,
              name,
              parent: parentPageId ? { id: parentPageId } : null,
              type: "page",
            },
            rawParentId,
            targetMimeType,
            docId
          );

          if (contentStr !== null && translated) {
            translated.content = contentStr;
          }

          return { data: translated, response: { status: 200 } };
        }

        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    default:
      throw new Error(`Unsupported prop: ${prop}`);
  }
};