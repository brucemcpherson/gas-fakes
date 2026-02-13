import { FakeDriveFolder, newFakeDriveFolder } from './fakedrivefolder.js'
import { newFakeDriveFile } from './fakedrivefile.js'
import { newFakeFolderApp } from './fakefolderapp.js'
import { notYetImplemented, isFolder } from '../../support/helpers.js'
import { Proxies } from '../../support/proxies.js'
import { Utils } from '../../support/utils.js'
import { Access, Permission } from '../enums/driveenums.js'
const { is } = Utils


/**
 * basic fake DriveApp
 * @class FakeDriveApp
 * @returns {FakeDriveApp}
 */
export class FakeDriveApp {

  constructor() {
    const rf = Drive.Files.get('root', {}, { allow404: true })
    this.__rootFolder = newFakeDriveFolder(rf)
    this.folderApp = newFakeFolderApp()
    this.__settleClass = (file) => isFolder(file) ? newFakeDriveFolder(file) : newFakeDriveFile(file)
  }



  toString() {
    return 'Drive'
  }

  /**
   * get folder by Id
   * folders can get files
   * @returns {FakeDriveFolder}
   */
  getRootFolder() {
    return this.__rootFolder
  }


  /**
   * get file by Id
   * folders can get files
   * @param {string} id 
   * @returns {newFakeDriveFile|null}
   */
  getFileById(id) {
    if (!is.nonEmptyString(id)) {
      throw new Error(`API call to DriveApp.getFileById failed with error: Invalid argument: id`)
    }
    const file = Drive.Files.get(id, {}, { allow404: true })
    return file ? newFakeDriveFile(file) : null
  }

  getFolderById(id) {
    if (!is.nonEmptyString(id)) {
      throw new Error(`API call to DriveApp.getFolderById failed with error: Invalid argument: id`)
    }
    const file = Drive.Files.get(id, {}, { allow404: true })
    return file ? newFakeDriveFolder(file) : null
  }

  /**
  * get files in this folder
  * @return {FakeDriveFileIterator}
  */
  getFiles() {
    return this.folderApp.getFiles({ folderTypes: false })
  }

  /**
   * get folders in this folder
   * @return {FakeDriveFileIterator}
   */
  getFolders() {
    return this.folderApp.getFiles({ folderTypes: true })
  }

  /**
   * get folders by name
   * @param {string} name 
   * @return {FakeDriveFileIterator}
  */
  getFoldersByName(name) {
    return this.folderApp.getFilesByName({ folderTypes: true, name })
  }

  /**
   * get files by name
   * @param {string} name 
   * @return {FakeDriveFileIterator}
   */
  getFilesByName(name) {
    return this.folderApp.getFilesByName({ folderTypes: false, name })
  }

  searchFiles(params) {
    return this.folderApp.searchFiles({ params })
  }

  searchFolders(params) {
    return this.folderApp.searchFolders({ params })
  }

  /**
   * get files by name
   * @param {string} name 
   * @return {FakeDriveFileIterator}
   */
  getFilesByType(type) {
    return this.folderApp.getFilesByType({ folderTypes: false, type })
  }


  /**
   * create a file in this folder
   */
  createFile(name, content, mimeType) {
    return this.getRootFolder().createFile(name, content, mimeType)
  }

  /**
   * create a folder in this folder
   */
  createFolder(name) {
    return this.getRootFolder().createFolder(name)
  }

  //-- TODO ---

  getFolderByIdAndResourceKey() {
    return notYetImplemented('getFolderByIdAndResourceKey')
  }
  getFileByIdAndResourceKey() {
    return notYetImplemented('getFileByIdAndResourceKey')
  }

  continueFileIterator() {
    return notYetImplemented('continueFileIterator')
  }
  continueFolderIterator() {
    return notYetImplemented('continueFolderIterator')
  }
  getTrashedFiles() {
    return notYetImplemented('getTrashedFiles')
  }
  getTrashedFolders() {
    return notYetImplemented('getTrashedFolders')
  }

  getStorageLimit() {
    return notYetImplemented('getStorageLimit')
  }
  getStorageUsed() {
    return notYetImplemented('getStorageUsed')
  }
  enforceSingleParent() {
    return notYetImplemented('enforceSingleParent')
  }
  get Access() {
    return Access
  }
  get Permission() {
    return Permission
  }

}

/**
 * create a new driveapp  instance
 * @param  {...any} args 
 * @returns {FakeDriveApp}
 */
export const newFakeDriveApp = (...args) => {
  return Proxies.guard(new FakeDriveApp(...args))
}