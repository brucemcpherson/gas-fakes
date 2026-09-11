import { FakeDriveFolder, newFakeDriveFolder } from "./fakedrivefolder.js";
import { newFakeDriveFile } from "./fakedrivefile.js";
import { newFakeFolderApp } from "./fakefolderapp.js";
import { isFolder, folderType } from "../../support/helpers.js";
import { Proxies } from "../../support/proxies.js";
import { Utils } from "../../support/utils.js";
import { Access, Permission } from "../enums/driveenums.js";
import { getFilesIterator } from "./driveiterators.js";
import { Syncit } from "../../support/syncit.js";
const { is } = Utils;

/**
 * basic fake DriveApp
 * @class FakeDriveApp
 * @returns {FakeDriveApp}
 */
export class FakeDriveApp {
  constructor() {
    this.__rootFolder = null;
    this.folderApp = newFakeFolderApp();

    this.__enforceSingleParent = true;
  }

  // decide whether its a file or a folder
  // this would be called after a query /list request
  // so we need to enhance the file with platform and whether its a root (it never will be unless already set)
  __settleClass = (file) => {
    file = { __rootRequested: false, platform: ScriptApp.__platform, ...file };
    return isFolder(file) ? newFakeDriveFolder(file) : newFakeDriveFile(file);
  };

  toString() {
    return "Drive";
  }

  /**
   * get folder by Id
   * folders can get files
   * @returns {FakeDriveFolder}
   */

  getRootFolder() {
    if (!this.__rootFolder) {
      const rf = Drive.Files.get("root", {}, { allow404: true });
      if (!rf.platform) {
        throw new Error("platform missing from Drive file 'root'");
      }

      // Flag metadata so FakeDriveFolder constructor triggers addRoot()
      rf.__rootRequested = true;

      // Ensure virtual root is typed as a folder for Coda
      if (rf.platform === "coda") {
        if (rf.id === "root") {
          rf.mimeType = folderType;
        }

        // If the backend mapped "root" to a real Coda Master Doc ID (e.g. xmSMQ-Q7ks),
        // register that actual doc ID as a root in the sandbox behavior engine
        const masterDocId = rf.id !== "root" ? rf.id : rf.__platformCustom?.masterDocId;
        if (masterDocId && ScriptApp.__behavior?.registerRoot) {
          ScriptApp.__behavior.registerRoot(masterDocId);
        }
      }

      this.__rootFolder = newFakeDriveFolder(rf);

      if (rf.platform === "ksuite") {
        if (!rf.parents || !rf.parents.length) {
          throw new Error("...failed to get id of super folder on ksuite");
        }
        this.__superFolder = newFakeDriveFolder({
          ...rf,
          id: rf.parents[0],
          capabilities: { canEdit: false, canRename: false, parents: null },
        });
      }
    }
    return this.__rootFolder;
  }
  __reset() {
    this.__rootFolder = null;
  }

  /**
   * get file by Id
   * folders can get files
   * @param {string} id
   * @returns {newFakeDriveFile|null}
   */
  getFileById(id) {
    if (!is.nonEmptyString(id)) {
      throw new Error(
        `API call to DriveApp.getFileById failed with error: Invalid argument: id`,
      );
    }
    const file = Drive.Files.get(id, {}, { allow404: true });
    return file ? newFakeDriveFile(file) : null;
  }
  // src/services/driveapp/fakedriveapp.js
  getFolderById(id) {
    if (!is.nonEmptyString(id)) {
      throw new Error(
        `API call to DriveApp.getFolderById failed with error: Invalid argument: id`,
      );
    }
    const file = Drive.Files.get(id, {}, { allow404: true });
    return file ? newFakeDriveFolder(file) : null;
  }

  /**
   * get files in this folder
   * @return {FakeDriveFileIterator}
   */
  getFiles() {
    return this.folderApp.getFiles({ folderTypes: false });
  }

  /**
   * get folders in this folder
   * @return {FakeDriveFileIterator}
   */
  getFolders() {
    return this.folderApp.getFiles({ folderTypes: true });
  }

  /**
   * get folders by name
   * @param {string} name
   * @return {FakeDriveFileIterator}
   */
  getFoldersByName(name) {
    return this.folderApp.getFilesByName({ folderTypes: true, name });
  }

  /**
   * get files by name
   * @param {string} name
   * @return {FakeDriveFileIterator}
   */
  getFilesByName(name) {
    return this.folderApp.getFilesByName({ folderTypes: false, name });
  }

  searchFiles(params) {
    return this.folderApp.searchFiles({ params });
  }

  searchFolders(params) {
    return this.folderApp.searchFolders({ params });
  }

  /**
   * get files by name
   * @param {string} name
   * @return {FakeDriveFileIterator}
   */
  getFilesByType(type) {
    return this.folderApp.getFilesByType({ folderTypes: false, type });
  }

  /**
   * create a file in this folder
   */
  createFile(name, content, mimeType) {
    return this.getRootFolder().createFile(name, content, mimeType);
  }

  /**
   * create a folder in this folder
   */
  createFolder(name) {
    return this.getRootFolder().createFolder(name);
  }

  createShortcut(targetId, resourceKey) {
    return this.getRootFolder().createShortcut(targetId, resourceKey);
  }

  createShortcutForTargetIdAndResourceKey(targetId, resourceKey) {
    return this.getRootFolder().createShortcutForTargetIdAndResourceKey(
      targetId,
      resourceKey,
    );
  }

  getFolderByIdAndResourceKey(id, resourceKey) {
    return this.getFolderById(id);
  }

  getFileByIdAndResourceKey(id, resourceKey) {
    return this.getFileById(id);
  }

  continueFileIterator(token) {
    return getFilesIterator({ token });
  }

  continueFolderIterator(token) {
    return getFilesIterator({ token });
  }

  getTrashedFiles() {
    return getFilesIterator({
      folderTypes: false,
      fileTypes: true,
      qob: ["trashed = true"],
    });
  }

  getTrashedFolders() {
    return getFilesIterator({
      folderTypes: true,
      fileTypes: false,
      qob: ["trashed = true"],
    });
  }

  getStorageLimit() {
    const { data } = Syncit.fxDrive({
      prop: "about",
      method: "get",
      params: { fields: "storageQuota" },
    });
    return parseInt(data.storageQuota.limit, 10);
  }

  getStorageUsed() {
    const { data } = Syncit.fxDrive({
      prop: "about",
      method: "get",
      params: { fields: "storageQuota" },
    });
    return parseInt(data.storageQuota.usage, 10);
  }

  enforceSingleParent(enabled) {
    this.__enforceSingleParent = enabled;
  }

  get Access() {
    return Access;
  }
  get Permission() {
    return Permission;
  }
}

/**
 * create a new driveapp instance
 * @param  {...any} args
 * @returns {FakeDriveApp}
 */
export const newFakeDriveApp = (...args) => {
  return Proxies.guard(new FakeDriveApp(...args));
};
