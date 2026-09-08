import { FakeDriveMeta } from "./fakedrivemeta.js";
import { Proxies } from "../../support/proxies.js";
import { isFolder, folderType } from "../../support/helpers.js";
import { newFakeFolderApp } from "./fakefolderapp.js";
import is from "@sindresorhus/is";
/**
 * basic fake Folder
 * TODO add lots more methods
 * @class FakeDriveFolder
 * @extends FakeDriveMeta
 * @returns {FakeDriveFolder}
 */
export class FakeDriveFolder extends FakeDriveMeta {
  /**
   *
   * @constructor
   * @param {File} meta data from json api
   * @returns {FakeDriveFolder}
   */
  constructor(meta) {
    super(meta);
    if (!isFolder(meta)) {
      throw new Error(`file must be a folder:` + JSON.stringify(meta));
    }
    // these are methods shared between driveapp and folder

    this.folderApp = newFakeFolderApp();
    if (ScriptApp.__behavior && meta.__rootRequested)
      ScriptApp.__behavior.addRoot(this);
  }

  searchFiles(params) {
    return this.folderApp.searchFiles({ parentId: this.getId(), params });
  }

  searchFolders(params) {
    return this.folderApp.searchFolders({ parentId: this.getId(), params });
  }

  /**
   * the args are a bit flexible
   * we can have 1 arg which mucst be ablob
   * or (name,content,[mimeType])
   */
  createFile(name, content, mimeType) {
    // TODO  complex error messages based on whether the args are provided in the right type
    return this.folderApp.createFile({
      nargs: Array.from(arguments).filter((f) => !is.undefined(f)).length,
      name,
      content,
      mimeType,
      file: { parents: [this.getId()] },
    });
  }

  /**
   * create a folder in this folder
   */
  createFolder(name) {
    // TODO  complex error messages based on whether the args are provided in the right type
    return this.folderApp.createFile({
      nargs: Array.from(arguments).filter((f) => !is.undefined(f)).length,
      name,
      mimeType: folderType,
      file: { parents: [this.getId()] },
    });
  }

  createShortcut(targetId, resourceKey) {
    return this.folderApp.createShortcut({
      targetId,
      resourceKey,
      file: { parents: [this.getId()] },
    });
  }

  createShortcutForTargetIdAndResourceKey(targetId, resourceKey) {
    return this.folderApp.createShortcutForTargetIdAndResourceKey({
      targetId,
      resourceKey,
      file: { parents: [this.getId()] },
    });
  }

  /**
   * get files in this folder
   * @return {FakeDriveFileIterator}
   */
  getFiles() {
    // on coda root, this.getId() will be the workspace id
    return this.folderApp.getFiles({
      parentId: this.getId(),
      folderTypes: false,
    });
  }

  /**
   * get folders in this folder
   * @return {FakeDriveFileIterator}
   */
  getFolders() {
    return this.folderApp.getFiles({
      parentId: this.getId(),
      folderTypes: true,
    });
  }

  /**
   * get folders by name
   * @param {string} name
   * @return {FakeDriveFileIterator}
   */
  getFoldersByName(name) {
    return this.folderApp.getFilesByName({
      parentId: this.getId(),
      folderTypes: true,
      name,
    });
  }

  /**
   * get files by name
   * @param {string} name
   * @return {FakeDriveFileIterator}
   */
  getFilesByName(name) {
    return this.folderApp.getFilesByName({
      parentId: this.getId(),
      folderTypes: false,
      name,
    });
  }

  /**
   * get files by name
   * @param {string} name
   * @return {FakeDriveFileIterator}
   */
  getFilesByType(type) {
    return this.folderApp.getFilesByType({
      parentId: this.getId(),
      folderTypes: false,
      type,
    });
  }
}
/**
 * create a new drive folder instance
 * @param  {...any} args
 * @returns {FakeDriveFolder}
 */
export const newFakeDriveFolder = (...args) => {
  return Proxies.guard(new FakeDriveFolder(...args));
};
