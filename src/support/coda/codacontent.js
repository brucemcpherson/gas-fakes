import { isTextMimeType } from "../googlemimetypes.js";
import { newFakeBlob } from "../../services/utilities/fakeblob.js";
import { spreadsheetType } from "../helpers.js";

/**
 * Safely decodes byte data into a UTF-8 string, handling various input types.
 *
 * @param {Uint8Array|Buffer|Array<number>|ArrayBuffer|DataView|string|null|undefined} input - The input data to decode.
 * @returns {string} The decoded UTF-8 string representation.
 */
export const safeDecodeBytes = (input) => {
  if (!input) return "";
  if (typeof input === "string") return input;
  if (Buffer.isBuffer(input)) return input.toString("utf-8");
  if (Array.isArray(input) || ArrayBuffer.isView(input)) {
    return Buffer.from(input).toString("utf-8");
  }
  return String(input);
};

/**
 * Prepares a unified fake blob representation for media/file uploads.
 *
 * @param {Object} params - File creation parameters.
 * @param {string} params.mimeType - The target MIME type.
 * @param {string|Buffer|Array} params.bytes - Raw byte payload or text content.
 * @param {string} params.name - File name.
 * @returns {Object} Initialized fake blob payload wrapper.
 */
export const prepareMediaBlob = ({ mimeType, bytes, name }) => {
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

/**
 * Fetches all rows from a Coda table and formats them into a CSV string.
 *
 * @param {Object} coda - Initialized Coda API client.
 * @param {string} docId - Target Coda Document ID.
 * @param {string} tableId - Target Coda Table/Grid ID.
 * @returns {Promise<string>} Formatted CSV string.
 */
export const fetchTableContentAsCSV = async (coda, docId, tableId) => {
  if (!docId || !tableId) return "";
  try {
    let rowsRes;
    if (typeof coda.tables?.listRows === "function") {
      rowsRes = await coda.tables.listRows(docId, tableId, {
        useColumnNames: true,
      });
    } else if (coda.client && typeof coda.client.get === "function") {
      rowsRes = await coda.client.get(`docs/${docId}/tables/${tableId}/rows`, {
        params: { useColumnNames: true },
      });
    }

    const rows = Array.isArray(rowsRes)
      ? rowsRes
      : rowsRes?.items || rowsRes?.data || [];
    if (!rows.length) return "";

    const headers = new Set();
    rows.forEach((r) => {
      const vals = r.values || {};
      Object.keys(vals).forEach((k) => headers.add(k));
    });

    const headerArray = Array.from(headers);
    const csvLines = [
      headerArray.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
    ];

    rows.forEach((r) => {
      const vals = r.values || {};
      const rowLine = headerArray.map((h) => {
        const val =
          vals[h] !== undefined && vals[h] !== null ? String(vals[h]) : "";
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvLines.push(rowLine.join(","));
    });

    return csvLines.join("\n");
  } catch (err) {
    console.error(
      `[CODA ERROR] Failed to fetch table CSV rows for ${tableId}:`,
      err
    );
    return "";
  }
};

/**
 * Initiates an asynchronous page export in Coda and polls until Markdown content is returned.
 *
 * @param {Object} coda - Initialized Coda API client.
 * @param {string} docId - Target Coda Document ID.
 * @param {string} pageId - Target Coda Page ID.
 * @param {number} [maxRetries=10] - Maximum polling attempts before falling back.
 * @returns {Promise<string>} Markdown text content.
 */
export const fetchPageContentWithRetry = async (
  coda,
  docId,
  pageId,
  maxRetries = 10
) => {
  if (!docId || !pageId) return "";
  try {
    const exportReq = await coda.client.post(
      `docs/${docId}/pages/${pageId}/export`,
      { outputFormat: "markdown" }
    );

    let exportStatus = exportReq;
    let attempts = 0;

    while (exportStatus?.status !== "completed" && attempts < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      exportStatus = await coda.client.get(
        `docs/${docId}/pages/${pageId}/export/${exportReq.id}`
      );
      attempts++;
    }

    if (exportStatus?.downloadUrl) {
      const downloadRes = await fetch(exportStatus.downloadUrl);
      const text = await downloadRes.text();
      if (text && text.trim()) return text;
    }
  } catch (_) {}

  try {
    const res = await coda.pages.getContent(docId, pageId);
    const text =
      typeof res === "string" ? res : res?.content || res?.text || "";
    if (text && text.trim()) return text;
  } catch (_) {}

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
};

/**
 * Updates a Coda page's title and/or replaces its canvas Markdown content.
 *
 * @param {Object} coda - Initialized Coda API client.
 * @param {string} docId - Target Coda Document ID.
 * @param {string} pageId - Target Coda Page ID.
 * @param {Object} updatePayload - Content update metadata.
 * @param {string} [updatePayload.title] - New title for the page.
 * @param {string} [updatePayload.content] - Replacement Markdown content.
 * @returns {Promise<Object>} Response object from the Coda API.
 */
export const writeCodaPageContent = async (
  coda,
  docId,
  pageId,
  { title, content }
) => {
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
};

/**
 * Safely fetches child sub-resources (e.g., tables or grids) for a specified Coda Document.
 *
 * @param {Object} coda - Initialized Coda API client.
 * @param {string} docId - Target Coda Document ID.
 * @param {string} resourceType - Resource key to fetch (e.g., "tables").
 * @returns {Promise<Array<Object>>} List of child resource objects.
 */
export const fetchCodaChildResources = async (coda, docId, resourceType) => {
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
};

/**
 * Creates a lazy-evaluating Blob wrapper for a page's Markdown content.
 *
 * @param {Object} codaApi - The initialized Coda API client instance.
 * @param {string} docId - The target Coda Document ID.
 * @param {string} pageId - The target Coda Page ID.
 * @returns {Object} A blob object with methods to retrieve content as a string or byte Buffer.
 */
export const createPageBlob = (codaApi, docId, pageId) => ({
  getDataAsString: async () =>
    await fetchPageContentWithRetry(codaApi, docId, pageId),
  getBytes: async () => {
    const str = await fetchPageContentWithRetry(codaApi, docId, pageId);
    return Buffer.from(str, "utf-8");
  },
  getMimeType: () => "text/markdown",
});