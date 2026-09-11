import { FakeDriveMeta } from "./fakedrivemeta.js";
import { Proxies } from "../../support/proxies.js";
import {
  isFolder,
  isFakeFolder,
  signatureArgs,
} from "../../support/helpers.js";
import { Syncit } from "../../support/syncit.js";
import { FakeDriveFolder } from "./fakedrivefolder.js";
import { Utils } from "../../support/utils.js";
import { settleAsBlob } from "../utilities/fakeblob.js";
import { improveFileCache } from "../../support/filecache.js";

const { is } = Utils;

/**
 * basic fake File
 * mainly shared between folder and file
 * @class FakeDriveFile
 * @extends FakeDriveMeta
 * @returns {FakeDriveFile}
 */
class FakeDriveFile extends FakeDriveMeta {
  /**
   *
   * @constructor
   * @param {File} meta data from json api
   * @returns {FakeDriveFile}
   */
  constructor(meta) {
    super(meta);
    if (isFolder(meta)) {
      throw new Error(`file cant be a folder:` + JSON.stringify(meta));
    }
  }

  /**
   *
   * @returns {FakeBlob}
   */
  getBlob() {
    // spawn child process to syncify getting content as byte array
    const { data } = Syncit.fxDriveMedia({ id: this.getId() });

    // Google Drive files with no body return empty bytes (""), not undefined
    const safeData = data ?? "";

    return Utilities.newBlob(safeData, this.getMimeType(), this.getName());
  }
  /**
   *
   * @returns get a blob for the thumbnail if it exists
   * @returns {FakeBlob|null }
   */
  getThumbnail() {
    this.__decorateWithFields("hasThumbnail,thumbnailLink");
    if (!this.meta.hasThumbnail) return null;

    return UrlFetchApp.fetch(this.meta.thumbnailLink).getBlob();
  }

  /**
   * returns the download url - this is the same as the webcontentlink
   * @return {string}
   */
  getDownloadUrl() {
    return this.__getDecorated("webContentLink");
  }

  /**
   * get as a blob
   * @param {string} contentType
   * @returns {FakeBlob}
   */
  getAs(contentType) {
    if (contentType === this.getMimeType()) {
      return this.getBlob();
    }
    const result = Syncit.fxDriveExport({
      id: this.getId(),
      mimeType: contentType,
    });
    if (result.error) {
      // The error might be a string (from catch in sxStreamer) or an object
      let isNotExportable = false;
      let message = result.error;
      if (typeof result.error === "string" && result.error.startsWith("{")) {
        try {
          const parsed = JSON.parse(result.error);
          isNotExportable =
            parsed.error?.errors?.[0]?.reason === "fileNotExportable" ||
            parsed.error?.reason === "fileNotExportable";
          message = parsed.error?.message || parsed.message || result.error;
        } catch (e) {
          // ignore
        }
      } else if (typeof result.error === "object") {
        isNotExportable =
          result.error.error?.errors?.[0]?.reason === "fileNotExportable" ||
          result.error.errors?.[0]?.reason === "fileNotExportable" ||
          result.error.error?.reason === "fileNotExportable" ||
          result.error.reason === "fileNotExportable";
        message =
          result.error.error?.message ||
          result.error.message ||
          JSON.stringify(result.error);
      }

      // Live GAS automatically handles exporting plain text/images to PDF etc.
      // The REST API doesn't support this directly. We workaround it by
      // temporarily converting the file to a Google Doc, exporting that, and trashing it.
      if (isNotExportable) {
        let targetMimeType = "application/vnd.google-apps.document";
        const currentMime = this.getMimeType();
        if (
          currentMime === "text/csv" ||
          currentMime === "text/tab-separated-values" ||
          currentMime === "application/vnd.ms-excel" ||
          currentMime ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
          targetMimeType = "application/vnd.google-apps.spreadsheet";
        } else if (
          currentMime === "application/vnd.ms-powerpoint" ||
          currentMime ===
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ) {
          targetMimeType = "application/vnd.google-apps.presentation";
        }

        try {
          // 1. Copy to temp Google Doc format
          const copyResult = Syncit.fxDrive({
            prop: "files",
            method: "copy",
            params: {
              fileId: this.getId(),
              resource: {
                mimeType: targetMimeType,
                name: `Temp_gasfakes_conversion_${this.getName()}`,
              },
            },
          });

          if (!copyResult.data || !copyResult.data.id) {
            throw new Error(
              `Failed to copy to intermediate format: ${JSON.stringify(copyResult.response)}`,
            );
          }
          const tempFileId = copyResult.data.id;

          // 2. Export the temp file
          const tempExportResult = Syncit.fxDriveExport({
            id: tempFileId,
            mimeType: contentType,
          });

          // 3. Delete the temp file
          Syncit.fxDrive({
            prop: "files",
            method: "update",
            params: {
              fileId: tempFileId,
              resource: { trashed: true },
            },
          });

          if (tempExportResult.error) {
            throw new Error(
              tempExportResult.error.error?.message ||
                tempExportResult.error.message ||
                JSON.stringify(tempExportResult.error),
            );
          }

          return Utilities.newBlob(
            tempExportResult.data,
            contentType,
            this.getName(),
          );
        } catch (workaroundError) {
          throw new Error(
            `getAs API returned: ${message}. Then, a temporary two-step conversion workaround failed: ${workaroundError.message}`,
          );
        }
      }

      throw new Error(message);
    }
    return Utilities.newBlob(result.data, contentType, this.getName());
  }

  /**
   * set the content to something else
   * @param {string} content apparently this can only be a string and not a blob
   * @return {FakeDriveFile} self
   */
  setContent(content) {
    // for param checking
    const { matchThrow } = signatureArgs(arguments, "setContent");

    // apps script does a toString on the arg rather than failing
    if (!is.function(content?.toString)) {
      matchThrow();
    }

    // this remains its current mimetype even though its now text
    const blob = settleAsBlob(
      content.toString(),
      this.getMimeType(),
      this.getName(),
    );
    const data = Drive.Files.update({}, this.getId(), blob);

    // merge this with already known fields and improve cache
    this.meta = { ...this.meta, ...data };
    improveFileCache(this.getId(), this.meta);
    return this;
  }

  /**
   * make a copy
   * @param {FakeDriveFolder|string|null} [destinationOrName] where to copy it to/chaneg the name if required
   * @param {FakeDriveFolder} [destination] where to copy it to
   */
  makeCopy(destinationOrName, destination) {
    // default is same name as copied file
    let name = this.__getDecorated("name");

    // default is the parent of the file to be copied
    let parents = this.__getDecorated("parents");

    // for param checking
    const { matchThrow } = signatureArgs(
      arguments,
      "makeCopy",
      "DriveApp.Folder",
    );

    // cant move the root folder
    this.__preventRootDamage("copy", this);

    // check args make sense
    if (Utils.isNU(destination) && Utils.isNU(destinationOrName)) {
      // makecopy()
      // no args provided, we use the defaults
    } else if (isFakeFolder(destinationOrName)) {
      // makecopy (afolder)
      // destination is a folder, so no 2nd arg required
      parents = [destinationOrName.__getDecorated("id")];
      if (!Utils.isNU(destination)) matchThrow();
    } else if (!is.nonEmptyString(destinationOrName)) {
      // makecopy (notastring,...)
      // they tried to give a name but its not a string
      matchThrow();
    } else if (isFakeFolder(destination)) {
      // makecopy (a string,a folder)
      name = destinationOrName;
      parents = [destination.__getDecorated("id")];
    } else if (Utils.isNU(destination)) {
      // makecopy (string)
      name = destinationOrName;
    } else {
      // makecopy (string, notafolder)
      matchThrow();
    }

    const data = Drive.Files.copy(
      {
        parents,
        name,
      },
      this.getId(),
    );

    ScriptApp.__behavior.addFile(data.id);
    return newFakeDriveFile(data);
  }

  getTargetId() {
    this.__decorateWithFields("shortcutDetails");
    return this.meta.shortcutDetails?.targetId || null;
  }

  getTargetMimeType() {
    this.__decorateWithFields("shortcutDetails");
    return this.meta.shortcutDetails?.targetMimeType || null;
  }

  getTargetResourceKey() {
    this.__decorateWithFields("shortcutDetails");
    return this.meta.shortcutDetails?.targetResourceKey || null;
  }
}

/**
 * create a new drive file instance
 * @param  {...any} args
 * @returns {FakeDriveFile}
 */
export const newFakeDriveFile = (...args) => {
  return Proxies.guard(new FakeDriveFile(...args));
};
