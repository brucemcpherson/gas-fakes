import { minFields, isFolder, notYetImplemented } from '../../support/helpers.js'
import { Utils } from '../../support/utils.js'
import { settleAsBlob } from "../utilities/fakeblob.js"
import { Syncit } from "../../support/syncit.js"
import { checkResponse, improveFileCache } from "../../support/filecache.js"
import { getFilesIterator } from './driveiterators.js';
import is from '@sindresorhus/is'

/**
 * methods shared between driveapp and folder
 * @class FakeFolderApp
 * @returns {FakeFolderApp}
 */
class FakeFolderApp {

  // shared between folder and driveapp
  constructor() {

  }
  /**
   * get files in this folder
   * @return {FakeDriveFileIterator}
   */
  getFiles({ parentId, folderTypes }) {
    return getFilesIterator({
      parentId,
      folderTypes,
      fileTypes: !folderTypes
    })
  }

  /**
   * get folders/files by name
   * @param {string} name 
   * @return {FakeDriveFileIterator}
   */
  getFilesByName({ parentId, name, folderTypes }) {
    return getFilesIterator({
      parentId,
      fileTypes: !folderTypes,
      folderTypes,
      qob: [`name='${name}'`]
    })
  }

  /**
   *  get files by type
   * @param {string} type 
   * @return {FakeDriveFileIterator}
   */
  getFilesByType({ parentId, type, folderTypes }) {
    return getFilesIterator({
      parentId,
      fileTypes: !folderTypes,
      folderTypes,
      qob: [`mimeType='${type}'`]
    })

  }



  createShortcut({ targetId, resourceKey, file = {} }) {
    const target = Drive.Files.get(targetId, { fields: 'name' })
    return this.createFile({
      nargs: 2,
      name: target.name,
      content: "",
      file: {
        mimeType: 'application/vnd.google-apps.shortcut',
        shortcutDetails: {
          targetId,
          targetResourceKey: resourceKey
        },
        ...file
      }
    })
  }

  createShortcutForTargetIdAndResourceKey({ targetId, resourceKey, file = {} }) {
    return this.createShortcut({ targetId, resourceKey, file })
  }



  searchFiles ({ parentId, params }) {
    return getFilesIterator({
      parentId,
      fileTypes: true,
      folderTypes: false,
      qob: [params]
    })
  }

  searchFolders ({ parentId, params }) {
    return getFilesIterator({
      parentId,
      fileTypes: false,
      folderTypes: true,
      qob: [params]
    })
  }
  
  removeFolder() {
    return notYetImplemented('removeFolder')
  }
  removeFile() {
    return notYetImplemented('removeFile')
  }

  /**
   * the args are a bit flexible
   * we can have 1 arg which mucst be ablob
   * or (name,content,[mimeType])
   * @param {} p
   * @param {number} nargs how many args were provided
   * @param {string|Blob} blobOrName either a blob or a filename
   * @param {*} content provided instead of a blob
   * @param {string} mimeType 
   * @param {File} file the file resource 
   * @returns 
   */
  createFile({ nargs, name: blobOrName, content, mimeType, file = {} }) {
    let blob = null
    let name = blobOrName
    const blobby = Utils.isBlob(blobOrName)
    const passedTypes = [blobby ? 'blob' : is(blobOrName), is(content), is(mimeType)].slice(0, nargs).map(Utils.capital).join(",")

    const matchThrow = (mess = "") => {
      throw new Error(`The parameters (${passedTypes}) don't match the method ${mess}`)
    }

    if (blobby) {
      if (nargs > 1) matchThrow()

      blob = blobOrName
      mimeType = blob.getContentType()
      content = blob
      name = blob.getName()
      if (!name) {
        throw new Error("Blob object must have non-null name for this operation.")
      }
    } else if (is.undefined(name)) {
      matchThrow()
    }
    
    if (!is.string(name)) {
      throw new Error("Invalid argument: name")
    }

    if (isFolder({ mimeType })) {
      if (nargs !== 1) matchThrow()
      name = name || "New Folder"

    } else if (nargs < 2 && !blobby) {
      matchThrow()
    } else {
      if (Utils.isNU(content)) {
        matchThrow(": content")
      }
      blob = settleAsBlob(content, mimeType, name)
    }


    const result = Syncit.fxStreamUpMedia({ fields: minFields, blob, file: { mimeType, name, ...file } })
    const { data, response } = result
    checkResponse(data?.id, response, false)
    if (!data) {
      throw new Error ('failed to add media to file:' + name)
    }
    ScriptApp.__behavior.addFile(data.id)
    improveFileCache(data.id, data)
    return DriveApp.__settleClass(result.data)

  }
}

export const newFakeFolderApp = (...args) => new FakeFolderApp(...args)