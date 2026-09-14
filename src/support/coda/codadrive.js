import { newCodaAPI } from "./codaapi.js";
import { CodaConstants } from "./constants.js";
import { isTextMimeType } from "../googlemimetypes.js";
import { convertDriveQueryToCoda } from "./codaquery.js";
import { newFakeBlob } from "../../services/utilities/fakeblob.js";
import { spreadsheetType } from "../helpers.js";

const sanitizeId = (id) => {
  if (!id) return "";
  return String(id).trim();
};

function matchesParent(file, rawFolderId) {
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
}

export function createPageBlob(codaApi, docId, pageId) {
  return {
    getDataAsString: async () => {
      return await fetchPageContentWithRetry(codaApi, docId, pageId);
    },
    getBytes: async () => {
      const str = await fetchPageContentWithRetry(codaApi, docId, pageId);
      return Buffer.from(str, "utf-8");
    },
    getMimeType: () => "text/markdown",
  };
}

/**
 * Parses raw compound or simple IDs, including synthetic child identifiers & native IDs:
 * - "docId/pageId/_canvas" => { docId, pageId, childId: "_canvas", isSyntheticCanvas: true, isTable: false }
 * - "docId/grid-123"      => { docId, pageId: null, childId: "grid-123", isSyntheticCanvas: false, isTable: true }
 * - "docId/pageId"        => { docId, pageId, childId: null, isSyntheticCanvas: false, isTable: false }
 * - "docId"               => { docId, pageId: null, childId: null, isSyntheticCanvas: false, isTable: false }
 * - "root"                => { docId: null, pageId: null, isRoot: true }
 */
function parseCodaId(rawId) {
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
      (secondPart && (secondPart.startsWith("grid-") || secondPart.startsWith("table-"))) ||
      (thirdPart && (thirdPart.startsWith("grid-") || thirdPart.startsWith("table-")));

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
}

function extractDocIdFromUrl(url) {
  if (!url || typeof url !== "string") return null;

  const apiMatch = url.match(/\/docs\/([a-zA-Z0-9_-]+)/);
  if (apiMatch && apiMatch[1]) return apiMatch[1];

  const browserMatch = url.match(/\/d\/(?:_d)?([a-zA-Z0-9_-]+)/);
  if (browserMatch && browserMatch[1]) return browserMatch[1];

  return null;
}

function safeDecodeBytes(input) {
  if (!input) return "";
  if (typeof input === "string") return input;
  if (Buffer.isBuffer(input)) return input.toString("utf-8");
  if (Array.isArray(input) || ArrayBuffer.isView(input)) {
    return Buffer.from(input).toString("utf-8");
  }
  return String(input);
}

const prepareMediaBlob = ({ mimeType, bytes, name }) => {
  const decodedText = safeDecodeBytes(bytes);
  const isTableMime =
    mimeType === spreadsheetType ||
    mimeType === "text/csv" ||
    mimeType === "application/json";

  if (isTextMimeType(mimeType) || isTableMime) {
    return newFakeBlob(decodedText, mimeType, name);
  } else {
    return newFakeBlob(decodedText || "", mimeType, name);
  }
};

const translateCodaResource = (
  item,
  parentId = "root",
  overrideMimeType = null,
  forcedDocId = null,
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

  const isCodaDoc = item.type === "doc" || (!item.parent && !actualDocId);
  const isCodaTable = item.type === "table" || item.type === "view" || leafItemId.startsWith("grid-") || leafItemId.startsWith("table-");
  const isCodaPage =
    !isCodaTable &&
    (item.type === "page" ||
      Boolean(item.children) ||
      Boolean(item.parent) ||
      Boolean(actualDocId && leafItemId !== actualDocId));
  const isExplicitFolder = item.isFolder === true || item.type === "folder";

  const isLeafContent =
    item.isLeaf === true || isCodaTable || item.type === "canvas" || item.type === "control" || item.type === "formula";
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

  let mimeType = overrideMimeType;
  if (!mimeType) {
    if (isFolder) {
      mimeType = CodaConstants.TYPES.folder;
    } else if (isCodaTable) {
      mimeType = CodaConstants.TYPES.spreadsheet;
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
      pageId: isCodaDoc ? null : (isCodaPage ? leafItemId : item.parent?.id || null),
      isDoc: isCodaDoc,
      isPage: isCodaPage,
      isFolder,
      contentType: isFolder ? "folder" : item.type || "doc",
      item,
    },
  };
};

/**
 * Constructs a synthetic file representation for a page's markdown canvas content.
 */
function createSyntheticCanvasFile(docId, pageId, pageName, parentId) {
  const syntheticId = `${docId}/${pageId}/_canvas`;
  return {
    id: syntheticId,
    name: `${pageName || "Canvas"}.md`,
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
}

/**
 * Fetches table rows and formats them into a CSV string.
 */
async function fetchTableContentAsCSV(coda, docId, tableId) {
  if (!docId || !tableId) return "";
  try {
    let rowsRes;
    if (typeof coda.tables?.listRows === "function") {
      rowsRes = await coda.tables.listRows(docId, tableId, { useColumnNames: true });
    } else if (coda.client && typeof coda.client.get === "function") {
      rowsRes = await coda.client.get(`docs/${docId}/tables/${tableId}/rows`, {
        params: { useColumnNames: true },
      });
    }

    const rows = Array.isArray(rowsRes) ? rowsRes : rowsRes?.items || rowsRes?.data || [];
    if (!rows.length) return "";

    const headers = new Set();
    rows.forEach((r) => {
      const vals = r.values || {};
      Object.keys(vals).forEach((k) => headers.add(k));
    });

    const headerArray = Array.from(headers);
    const csvLines = [headerArray.map((h) => `"${h.replace(/"/g, '""')}"`).join(",")];

    rows.forEach((r) => {
      const vals = r.values || {};
      const rowLine = headerArray.map((h) => {
        const val = vals[h] !== undefined && vals[h] !== null ? String(vals[h]) : "";
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvLines.push(rowLine.join(","));
    });

    return csvLines.join("\n");
  } catch (err) {
    console.error(`[CODA ERROR] Failed to fetch table CSV rows for ${tableId}:`, err);
    return "";
  }
}

/**
 * Triggers Coda's asynchronous page export process to convert page content into Markdown.
 */
async function fetchPageContentWithRetry(coda, docId, pageId, maxRetries = 10) {
  if (!docId || !pageId) return "";

  if (coda.client && typeof coda.client.post === "function") {
    try {
      const exportReq = await coda.client.post(
        `docs/${docId}/pages/${pageId}/export`,
        { outputFormat: "markdown" },
      );

      let exportStatus = exportReq;
      let attempts = 0;

      while (exportStatus?.status !== "completed" && attempts < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        exportStatus = await coda.client.get(
          `docs/${docId}/pages/${pageId}/export/${exportReq.id}`,
        );
        attempts++;
      }

      if (exportStatus?.downloadUrl) {
        const downloadRes = await fetch(exportStatus.downloadUrl);
        const text = await downloadRes.text();
        if (text && text.trim()) return text;
      }
    } catch (_) {}
  }

  if (typeof coda.pages?.getContent === "function") {
    try {
      const res = await coda.pages.getContent(docId, pageId);
      const text =
        typeof res === "string" ? res : res?.content || res?.text || "";
      if (text && text.trim()) return text;
    } catch (_) {}
  }

  try {
    const pageData = await coda.pages.get(docId, pageId);
    const metadataContent =
      pageData?.canvasContent?.content ||
      pageData?.canvasContent ||
      pageData?.content ||
      pageData?.subtitle ||
      "";
    if (metadataContent && metadataContent.trim()) return metadataContent;
  } catch (_) {}

  return "";
}

/**
 * Updates a Coda page title and/or canvas content.
 */
async function writeCodaPageContent(coda, docId, pageId, { title, content }) {
  const payload = {};
  if (title) payload.title = title;

  if (content !== null && content !== undefined) {
    payload.contentUpdate = {
      insertionMode: "replace",
      canvasContent: {
        format: "markdown",
        content: String(content),
      },
    };
  }

  if (typeof coda.pages?.update === "function") {
    return await coda.pages.update(docId, pageId, payload);
  } else if (coda.client && typeof coda.client.put === "function") {
    return await coda.client.put(`docs/${docId}/pages/${pageId}`, payload);
  } else {
    return await coda.api.request(`docs/${docId}/pages/${pageId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }
}

/**
 * Helper to safely fetch child Coda resources (tables)
 */
async function fetchCodaChildResources(coda, docId, resourceType) {
  try {
    if (coda[resourceType] && typeof coda[resourceType].list === "function") {
      const res = await coda[resourceType].list(docId);
      return Array.isArray(res) ? res : res?.items || res?.data || [];
    } else if (coda.client && typeof coda.client.get === "function") {
      const res = await coda.client.get(`docs/${docId}/${resourceType}`);
      return Array.isArray(res) ? res : res?.items || res?.data || [];
    }
  } catch (_) {}
  return [];
}

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
  },
) => {
  const token = await Auth.getAccessToken();
  const coda = newCodaAPI(token, options);

  let { fields, ...params } = googleParams || {};
  const targetId = fileId || params.fileId || resource?.id;
  const parsedTarget = parseCodaId(targetId);

  // ------------------------------------------------------------------
  // MEDIA / CONTENTDOWNLOAD REQUEST
  // Handles getBlob(), alt=media, or method=download
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
        content = await fetchTableContentAsCSV(coda, parsedTarget.docId, tableId);
        contentType = "text/csv; charset=utf-8";
      } else if (parsedTarget.pageId) {
        content = await fetchPageContentWithRetry(
          coda,
          parsedTarget.docId,
          parsedTarget.pageId,
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
        err,
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

          // Case A: Synthetic Canvas File requested directly
          if (parsedTarget.isSyntheticCanvas) {
            try {
              const page = await coda.pages.get(
                parsedTarget.docId,
                parsedTarget.pageId,
              );
              const parentFolderId = `${parsedTarget.docId}/${parsedTarget.pageId}`;
              const syntheticFile = createSyntheticCanvasFile(
                parsedTarget.docId,
                parsedTarget.pageId,
                page?.name || page?.title || "Canvas",
                parentFolderId,
              );

              const pageContent = await fetchPageContentWithRetry(
                coda,
                parsedTarget.docId,
                parsedTarget.pageId,
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

          // Case B: Table/View Requested Directly
          if (parsedTarget.isTable) {
            try {
              const tableId = parsedTarget.childId || parsedTarget.pageId;
              let tableObj;
              if (typeof coda.tables?.get === "function") {
                tableObj = await coda.tables.get(parsedTarget.docId, tableId);
              } else if (coda.client && typeof coda.client.get === "function") {
                tableObj = await coda.client.get(`docs/${parsedTarget.docId}/tables/${tableId}`);
              }

              const parentFolderId = tableObj?.parent?.id
                ? `${parsedTarget.docId}/${tableObj.parent.id}`
                : parsedTarget.docId;

              const translated = translateCodaResource(
                { ...tableObj, type: "table" },
                parentFolderId,
                CodaConstants.TYPES.spreadsheet,
                parsedTarget.docId,
              );

              return { data: translated, response: { status: 200 } };
            } catch (e) {
              return {
                data: null,
                response: { status: 404, statusText: "Not Found" },
              };
            }
          }

          // Case C: Target is a Coda Doc (Folder/Container)
          if (parsedTarget.docId && !parsedTarget.pageId) {
            try {
              const docObj = await coda.docs.get(parsedTarget.docId);
              const translated = translateCodaResource(
                docObj,
                "root",
                null,
                parsedTarget.docId,
              );

              return { data: translated, response: { status: 200 } };
            } catch (e) {
              return {
                data: null,
                response: { status: 404, statusText: "Not Found" },
              };
            }
          }

          // Case D: Target is a Coda Page (Folder Container)
          if (parsedTarget.docId && parsedTarget.pageId) {
            try {
              const page = await coda.pages.get(
                parsedTarget.docId,
                parsedTarget.pageId,
              );

              const translated = translateCodaResource(
                page,
                parsedTarget.docId,
                null,
                parsedTarget.docId,
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

          if (q) {
            const parsed = convertDriveQueryToCoda(q);
            if (parsed.folderId) rawFolderId = parsed.folderId;
            if (parsed.isRoot) rawFolderId = "root";
          }

          const parsedFolder = parseCodaId(rawFolderId);

          // Listing Root -> Return list of Docs
          if (parsedFolder.isRoot) {
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

            const items = rawDocs.map((doc) =>
              translateCodaResource(doc, "root"),
            );

            let filteredItems = items;
            if (q && q.includes("mimeType !=")) {
              filteredItems = items.filter(
                (item) => item.mimeType !== CodaConstants.TYPES.folder,
              );
            } else if (q && q.includes("mimeType =")) {
              filteredItems = items.filter(
                (item) => item.mimeType === CodaConstants.TYPES.folder,
              );
            }

            return {
              data: { files: filteredItems },
              response: { status: 200 },
            };
          }

          // Fetch all Coda pages within doc
          let pagesRes;
          try {
            if (typeof coda.pages?.list === "function") {
              pagesRes = await coda.pages.list(
                parsedFolder.docId,
                codaApiParams,
              );
            } else if (coda.client && typeof coda.client.get === "function") {
              pagesRes = await coda.client.get(
                `docs/${parsedFolder.docId}/pages`,
                { params: codaApiParams },
              );
            }
          } catch (err) {
            console.error(
              `[CODA ERROR] Error listing pages for doc ${parsedFolder.docId}:`,
              err,
            );
            pagesRes = [];
          }

          const rawPages = Array.isArray(pagesRes)
            ? pagesRes
            : pagesRes?.items || pagesRes?.data || [];

          // Translate page folder containers
          const folderItems = rawPages.map((page) => {
            const actualParentId = page.parent?.id
              ? `${parsedFolder.docId}/${page.parent.id}`
              : parsedFolder.docId;

            return translateCodaResource(
              page,
              actualParentId,
              null,
              parsedFolder.docId,
            );
          });

          // Fetch Tables and Views only (exclude controls/formulas)
          const rawTables = await fetchCodaChildResources(coda, parsedFolder.docId, "tables");

          const nonFolderFiles = [];

          // Translate Tables/Views (Spreadsheets)
          rawTables.forEach((tbl) => {
            const parentPageId = tbl.parent?.id
              ? `${parsedFolder.docId}/${tbl.parent.id}`
              : parsedFolder.docId;
            nonFolderFiles.push(
              translateCodaResource(
                { ...tbl, type: "table" },
                parentPageId,
                CodaConstants.TYPES.spreadsheet,
                parsedFolder.docId,
              ),
            );
          });

          // If listing inside a specific subpage folder container, add synthetic canvas file
          if (parsedFolder.docId && parsedFolder.pageId) {
            const matchingPageObj = rawPages.find((p) => {
              const cleanP = sanitizeId(p.id).split("/").pop();
              return cleanP === parsedFolder.pageId;
            });

            const pageName =
              matchingPageObj?.name || matchingPageObj?.title || "Canvas";
            const currentFolderId = `${parsedFolder.docId}/${parsedFolder.pageId}`;

            nonFolderFiles.push(
              createSyntheticCanvasFile(
                parsedFolder.docId,
                parsedFolder.pageId,
                pageName,
                currentFolderId,
              ),
            );
          }

          // Combine folder pages and non-folder child files
          let combinedItems = [...folderItems, ...nonFolderFiles];

          // Filter results matching the target folder scope
          combinedItems = combinedItems.filter((item) =>
            matchesParent(item, rawFolderId),
          );

          // Apply MIME type query filtering
          if (q && q.includes("mimeType !=")) {
            combinedItems = combinedItems.filter(
              (item) => item.mimeType !== CodaConstants.TYPES.folder,
            );
          } else if (q && q.includes("mimeType =")) {
            combinedItems = combinedItems.filter(
              (item) => item.mimeType === CodaConstants.TYPES.folder,
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
              newDoc.id,
            );
            return { data: translated, response: { status: 200 } };
          }

          const docId = parsedParent.docId;
          const parentPageId = parsedParent.pageId;

          if (!docId) {
            throw new Error(
              `Unable to resolve parent Coda Doc ID from parent "${rawParentId}"`,
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
            docId,
          );

          if (contentStr !== null && translated) {
            translated.content = contentStr;
          }

          return { data: translated, response: { status: 200 } };
        }

        case "update": {
          if (parsedTarget.isRoot) {
            throw new Error("Cannot update root container");
          }

          const isTrashedExplicit =
            resource?.trashed === true || params?.trashed === true;
          const name = resource?.name || params?.name;
          const reqMime =
            resource?.mimeType || params?.mimeType || requestMimeType;

          if (isTrashedExplicit) {
            if (parsedTarget.docId && !parsedTarget.pageId && !parsedTarget.isTable) {
              await coda.docs.delete(parsedTarget.docId);
            } else if (parsedTarget.docId && (parsedTarget.pageId || parsedTarget.isTable)) {
              if (parsedTarget.isTable) {
                const tableId = parsedTarget.childId || parsedTarget.pageId;
                if (typeof coda.tables?.delete === "function") {
                  await coda.tables.delete(parsedTarget.docId, tableId);
                }
              } else {
                await coda.pages.delete(parsedTarget.docId, parsedTarget.pageId);
              }
            }
            const trashedResource = translateCodaResource(
              { id: targetId, trashed: true },
              "root",
              reqMime,
              parsedTarget.docId,
            );
            if (trashedResource) trashedResource.trashed = true;
            return { data: trashedResource, response: { status: 200 } };
          }

          if (parsedTarget.docId && !parsedTarget.pageId && !parsedTarget.isTable) {
            let updatedDoc = {};
            if (name && typeof coda.docs?.update === "function") {
              updatedDoc = await coda.docs.update(parsedTarget.docId, {
                title: name,
              });
            } else {
              updatedDoc = await coda.docs.get(parsedTarget.docId);
            }

            const translated = translateCodaResource(
              { ...updatedDoc, ...(name ? { title: name, name } : {}) },
              "root",
              reqMime || CodaConstants.TYPES.folder,
              parsedTarget.docId,
            );
            return { data: translated, response: { status: 200 } };
          }

          if (parsedTarget.docId && parsedTarget.pageId) {
            let contentStr = null;

            if (bytes !== undefined && bytes !== null) {
              const blob = prepareMediaBlob({
                mimeType: reqMime || CodaConstants.TYPES.doc,
                bytes,
                name,
              });
              contentStr = blob.getDataAsString();
            } else if (resource?.content) {
              contentStr = resource.content;
            }

            const updatedPage = await writeCodaPageContent(
              coda,
              parsedTarget.docId,
              parsedTarget.pageId,
              { title: name, content: contentStr },
            );

            if (parsedTarget.isSyntheticCanvas) {
              const parentFolderId = `${parsedTarget.docId}/${parsedTarget.pageId}`;
              const syntheticFile = createSyntheticCanvasFile(
                parsedTarget.docId,
                parsedTarget.pageId,
                name || "Canvas",
                parentFolderId,
              );
              if (contentStr !== null) syntheticFile.content = contentStr;
              return { data: syntheticFile, response: { status: 200 } };
            }

            const translated = translateCodaResource(
              { ...updatedPage, ...(name ? { title: name, name } : {}) },
              parsedTarget.docId,
              reqMime || CodaConstants.TYPES.doc,
              parsedTarget.docId,
            );

            if (contentStr !== null && translated) {
              translated.content = contentStr;
            }

            return { data: translated, response: { status: 200 } };
          }

          return {
            data: null,
            response: { status: 404, statusText: "Not Found" },
          };
        }

        case "delete": {
          if (parsedTarget.isRoot) {
            throw new Error("Cannot delete root container");
          }

          if (parsedTarget.isTable) {
            const tableId = parsedTarget.childId || parsedTarget.pageId;
            if (typeof coda.tables?.delete === "function") {
              await coda.tables.delete(parsedTarget.docId, tableId);
            } else if (coda.client && typeof coda.client.delete === "function") {
              await coda.client.delete(`docs/${parsedTarget.docId}/tables/${tableId}`);
            }
            return { data: {}, response: { status: 200 } };
          }

          if (parsedTarget.docId && !parsedTarget.pageId) {
            await coda.docs.delete(parsedTarget.docId);
            return { data: {}, response: { status: 200 } };
          }

          if (parsedTarget.docId && parsedTarget.pageId) {
            if (parsedTarget.isSyntheticCanvas) {
              await writeCodaPageContent(
                coda,
                parsedTarget.docId,
                parsedTarget.pageId,
                { content: "" },
              );
              return { data: {}, response: { status: 200 } };
            }

            await coda.pages.delete(parsedTarget.docId, parsedTarget.pageId);
            return { data: {}, response: { status: 200 } };
          }

          return {
            data: null,
            response: { status: 404, statusText: "Not Found" },
          };
        }

        default:
          throw new Error(`Coda Drive ${prop}.${method} not implemented`);
      }

    default:
      throw new Error(`Coda Drive property ${prop} not implemented`);
  }
};