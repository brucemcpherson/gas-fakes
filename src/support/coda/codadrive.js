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

  // Extract bare canvas/doc IDs to support both "docId/pageId" and standalone "pageId" or "docId"
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
 * Parses raw compound or simple IDs without duplicating prefixes:
 * - "TmgNizuV_9/canvas-zwCx5rIC5p" => { docId: "TmgNizuV_9", pageId: "canvas-zwCx5rIC5p", isRoot: false }
 * - "TmgNizuV_9"                   => { docId: "TmgNizuV_9", pageId: null, isRoot: false }
 * - "root"                         => { docId: null, pageId: null, isRoot: true }
 */
function parseCodaId(rawId) {
  if (!rawId || rawId === "root") {
    return { docId: null, pageId: null, isRoot: true };
  }

  const str = String(rawId).trim();
  if (str.includes("/")) {
    const parts = str
      .split("/")
      .map((p) => p.trim())
      .filter(Boolean);
    const docPart = parts[0];
    const pagePart = parts[parts.length - 1]; // Pick actual leaf page ID if nested

    return {
      docId: docPart,
      pageId: pagePart !== docPart ? pagePart : null,
      isRoot: false,
    };
  }

  return {
    docId: str,
    pageId: null,
    isRoot: false,
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

  // Extract base leaf ID if item.id is compound to avoid constructing duplicate prefixes
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
  const isCodaPage =
    item.type === "page" ||
    Boolean(item.children) ||
    Boolean(item.parent) ||
    Boolean(actualDocId && leafItemId !== actualDocId);
  const isExplicitFolder = item.isFolder === true || item.type === "folder";

  const isLeafContent =
    item.isLeaf === true || item.type === "table" || item.type === "canvas";
  const isFolder =
    !isLeafContent && (isExplicitFolder || isCodaDoc || isCodaPage);

  // Prevent duplicate prefixes: construct `docId/pageId` directly
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
    } else if (item.type === "table") {
      mimeType = CodaConstants.TYPES.spreadsheet;
    } else {
      mimeType = CodaConstants.TYPES.doc;
    }
  }

  const result = {
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
      pageId: isCodaDoc ? null : leafItemId,
      isDoc: isCodaDoc,
      isPage: isCodaPage,
      isFolder,
      contentType: isFolder ? "folder" : item.type || "doc",
      item,
    },
  };

  console.log(
    `[CODA TRANSLATE] Raw Item ID: "${item.id}" | Output ID: "${result.id}" | Parent ID: "${calculatedParentId}"`,
  );
  return result;
};

/**
 * Triggers Coda's asynchronous page export process to convert page content into Markdown
 * and retrieves the raw string body.
 */
async function fetchPageContentWithRetry(coda, docId, pageId, maxRetries = 10) {
  if (!docId || !pageId) return "";

  // 1. Direct API client call for Coda Page Export
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

  // 2. Fallback attempt using SDK helper methods if configured
  if (typeof coda.pages?.getContent === "function") {
    try {
      const res = await coda.pages.getContent(docId, pageId);
      const text =
        typeof res === "string" ? res : res?.content || res?.text || "";
      if (text && text.trim()) return text;
    } catch (_) {}
  }

  // 3. Last fallback: Check page metadata properties
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
 * Updates a Coda page title and/or canvas content using Coda's official payload schema.
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

  console.log(
    `\n[CODA REQ] ${prop}.${method} | Raw Target: "${targetId}" | Parsed Doc: "${parsedTarget.docId}" | Parsed Page: "${parsedTarget.pageId}" | Root: ${parsedTarget.isRoot}`,
  );

  // ------------------------------------------------------------------
  // MEDIA / CONTENT DOWNLOAD REQUEST
  // Handles getBlob(), alt=media, or method=download
  // ------------------------------------------------------------------
  if (method === "download" || params?.alt === "media") {
    if (!parsedTarget.docId || !parsedTarget.pageId) {
      return {
        data: [],
        response: { status: 200 },
      };
    }

    try {
      // Use fetchPageContentWithRetry to execute the full Coda markdown export polling loop
      const textContent = await fetchPageContentWithRetry(
        coda,
        parsedTarget.docId,
        parsedTarget.pageId,
      );

      const byteArray = Array.from(Buffer.from(textContent || "", "utf-8"));

      return {
        data: byteArray,
        response: {
          status: 200,
          headers: { "content-type": "text/markdown; charset=utf-8" },
        },
      };
    } catch (err) {
      console.error(
        `[CODA ERROR] Failed to fetch media content for doc "${parsedTarget.docId}" page "${parsedTarget.pageId}":`,
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

          // Case A: Target is a Coda Doc (Folder/Container)
          if (parsedTarget.docId && !parsedTarget.pageId) {
            try {
              const docObj = await coda.docs.get(parsedTarget.docId);
              let pageContent = "";
              let primaryPageId = null;

              try {
                const pagesList = await coda.pages.list(parsedTarget.docId);
                const firstPage = pagesList?.items?.[0];
                if (firstPage) {
                  primaryPageId = sanitizeId(firstPage.id).split("/").pop();
                  pageContent = await fetchPageContentWithRetry(
                    coda,
                    parsedTarget.docId,
                    firstPage.id,
                  );
                }
              } catch (err) {}

              const translated = translateCodaResource(
                docObj,
                "root",
                null,
                parsedTarget.docId,
              );
              if (translated) {
                translated.content = pageContent;
                if (primaryPageId) {
                  translated.__platformCustom.pageId = primaryPageId;
                }
              }

              return { data: translated, response: { status: 200 } };
            } catch (e) {
              return {
                data: null,
                response: { status: 404, statusText: "Not Found" },
              };
            }
          }

          // Case B: Target is a Coda Page (File)
          if (parsedTarget.docId && parsedTarget.pageId) {
            try {
              const page = await coda.pages.get(
                parsedTarget.docId,
                parsedTarget.pageId,
              );
              const pageContent = await fetchPageContentWithRetry(
                coda,
                parsedTarget.docId,
                parsedTarget.pageId,
              );

              const translated = translateCodaResource(
                page,
                parsedTarget.docId,
                null,
                parsedTarget.docId,
              );
              if (translated) translated.content = pageContent;
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

          // Listing inside a specific Doc -> Return Pages
          let pagesRes;
          try {
            if (typeof coda.pages?.list === "function") {
              pagesRes = await coda.pages.list(
                parsedFolder.docId,
                codaApiParams,
              );
            } else if (typeof coda.pages?.listPages === "function") {
              pagesRes = await coda.pages.listPages(
                parsedFolder.docId,
                codaApiParams,
              );
            } else if (coda.client && typeof coda.client.get === "function") {
              pagesRes = await coda.client.get(
                `docs/${parsedFolder.docId}/pages`,
                { params: codaApiParams },
              );
            } else {
              pagesRes = await coda.api.request(
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

          // 1. Translate pages using the page's actual parent (if present) or defaulting to docId
          const items = rawPages.map((page) => {
            // If page has a parent property in Coda API, map parent ID accordingly
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

          // 2. Apply matchesParent filtering + mimeType filtering
          let filteredItems = items.filter((item) =>
            matchesParent(item, rawFolderId),
          );

          if (q && q.includes("mimeType !=")) {
            filteredItems = filteredItems.filter(
              (item) => item.mimeType !== CodaConstants.TYPES.folder,
            );
          } else if (q && q.includes("mimeType =")) {
            filteredItems = filteredItems.filter(
              (item) => item.mimeType === CodaConstants.TYPES.folder,
            );
          }

          return { data: { files: filteredItems }, response: { status: 200 } };
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
            if (parsedTarget.docId && !parsedTarget.pageId) {
              await coda.docs.delete(parsedTarget.docId);
            } else if (parsedTarget.docId && parsedTarget.pageId) {
              await coda.pages.delete(parsedTarget.docId, parsedTarget.pageId);
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

          if (parsedTarget.docId && !parsedTarget.pageId) {
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

          if (parsedTarget.docId && !parsedTarget.pageId) {
            await coda.docs.delete(parsedTarget.docId);
            return { data: {}, response: { status: 200 } };
          }

          if (parsedTarget.docId && parsedTarget.pageId) {
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
