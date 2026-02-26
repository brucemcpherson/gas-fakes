import { Proxies } from '../../support/proxies.js'
import { notYetImplemented, isGood, throwResponse, minFields, isFolder } from '../../support/helpers.js'
import { Syncit } from '../../support/syncit.js'
import {  improveFileCache, checkResponse } from '../../support/filecache.js';
import { Utils, mergeParamStrings } from '../../support/utils.js'

const { is } = Utils

const apiProp = 'files'

/**
 * these apply to Drive.files
 */
class FakeAdvDriveFiles {
  constructor(drive) {
    this.drive = drive
    this.name = 'Drive.Files'
    this.apiProp = apiProp
    this.__fakeObjectType ="Drive.Files"
  }

  toString() {
    return this.drive.toString()
  }

  listLabels() {
    return notYetImplemented()
  }

  emptyTrash() {
    return notYetImplemented()
  }



  list(params = {}) {
    // this is pretty straightforward as the onus is on thecaller to provide a valid queryOb
    // and validation will be done by the api.
    // however to support caching, we'll fiddle with the fields parameter

    params.fields = mergeParamStrings(params.fields || "", `files(${minFields})`)

    // sincify that call
    const { response, data } = Syncit.fxDrive({ prop: this.apiProp, method: 'list', params })

    // maybe we need to throw an error
    if (!isGood(response)) {
      throwResponse(response)
    }

    // lets improve cache with any enhanced data we've found
    /// extract out the fieldslist
    const fields = params.fields.replace(/.*files\(([^)]*)\).*/,"$1")

    /// TODO - filter out any files we wouldn't be allowed to see in sandbox mode
    data.files.forEach(f => {
      improveFileCache(f.id, f,fields)
    })
    return data

  }
  remove() {
    return notYetImplemented()
  }

  /**
   * TODO implement the correct download method
   * this is fairly pointless in apps script as it returns an operation, and Drive.Operations are not supported
   * TODO - look into what actually happens to the operation - it may be possible to do something with it using the operations ap directly
   * for the moment we'll just return a fake operation that looks like adv returns
   * @param {string} fileId 
   * @param {object} params 
   * @returns {object}
   */
  download(fileId, params = {}) {

    // this just gets the meta data which we'll use to enhance cache


    // we'll just do a get to populate cache with any new meta data
    const file = this.get(fileId, params, { allow404: false })

    // the download uri us just constructed from the id - doesnt appear to be in any of the properties of file
    const platform = ScriptApp.__platform;
    const downloadUri = platform === 'ksuite' 
      ? `https://api.infomaniak.com/2/drive/${Syncit.fxDrive({method: 'getDriveId'}).data}/files/${file.id}/download`
      : `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&source=downloadUrl`;

    return {
      metadata: {
        ...file,
        "@type": "type.googleapis.com/google.apps.drive.v3.DownloadFileMetadata"
      },
      // this is an operation name
      name: "operation name not implemented as drive.operations not supported by advanced drive anyway",
      response: {
        // the only thing of interest here for now
        partialDownloadAllowed: true,
        downloadUri,
        "@type": "type.googleapis.com/google.apps.drive.v3.DownloadFileResponse"
      },
      done: true
    }

  }

  modifyLabels() {
    return notYetImplemented()
  }

  watch() {
    return notYetImplemented()
  }


  /**
   * get file by Id
   * @param {string} id 
   * @param {object} params Drive api params
   * @param {object} [fakeparams]
   * @param {boolean} [fakeparams.allow404=true] whether to allow 404 errors
   * @returns {Drive.File}
   */
  get(id, params = {}, { allow404 = true } = {}) {
    ScriptApp.__behavior.isAccessible(id, 'Drive', 'read');
    const result = Syncit.fxDriveGet ({ id, prop: apiProp, method: 'get', params, allow404, allowCache: true });
    const { data } = result
    // if (params.alt === 'media') slogger.log(`FakeAdvDriveFiles.get alt=media result type: ${typeof data}, isArray: ${Array.isArray(data)}`);
    return data
  }

  /**
   * ceate a file and optionally upload some data
   * @param {File} [file] file resource
   * @param {Blob} [blob] the mediadata 
   * @param {string} [fields] (not and advanced drive option but allow me to use this from driveapp and avoid an extra fetch)
   */
  create(file = {}, blob, fields,params) {

    if (!is.undefined(blob) && !Utils.isBlob(blob)) {
      throw new Error("The mediaData parameter only supports Blob types for upload.")
    }

    // must have some kind of name so derive if not given
    const name = file.name || blob?.getName() || (isFolder(file) ? "New Folder" : "Untitled")
    const d = updateOrCreate ({method: "create", file: { ...file, name }, blob, fields, params })
    this.drive.__addAllowed(d.id);
    return d

  }

  generateIds() {
    return notYetImplemented()
  }

  /**
   * patch a file and ioptionally upoad new content
   * @param {Drive.File} file the resource metadata
   * @param {string} fileId the fileid to update
   * @param {FakeBlob} [blob] new media if required
   * @param {string} [fields] (not and advanced drive option but allow me to use this from driveapp and avoid an extra fetch)
   * @param {object} [params] any extra params
   * @returns {Drive.File} updated
   */
  update(file, fileId, blob, fields,params) {
    if (!is.nonEmptyString(fileId)) {
      throw new Error(`API call to drive.files.update failed with error: Required`)
    }
    // sandbox checks
    const isMetadataWrite = file && Object.keys(file).some(k => k !== 'trashed');
    if (blob || isMetadataWrite) {
      ScriptApp.__behavior.isAccessible(fileId, 'Drive', 'write');
    }
    if (file && typeof file.trashed === 'boolean') {
      ScriptApp.__behavior.isAccessible(fileId, 'Drive', 'trash');
    }
    return updateOrCreate ({method: 'update', file,  blob, fileId, fields, params})
  }
  /**
   * ceate a file and optionally upload some data
   * @param {File} [file] file resource to patch
   * @param {string} fileId the file to copy 
   * @param {object} [options] request options
   */
  copy(file, fileId, options={}) {

    if (!is.nonEmptyString(fileId)) {
      throw new Error(`API call to drive.files.copy failed with error: Required`)
    }
    ScriptApp.__behavior.isAccessible(fileId, 'Drive', 'read');
    const fields = mergeParamStrings(options.fields || "",minFields)
    const params = {
      fields,
      fileId,
      resource: file
    }

    const { response, data } = Syncit.fxDrive({ prop: apiProp, method: 'copy', params, options })
    checkResponse(data?.id, response, false)
    improveFileCache(this.drive.__addAllowed(data.id), data,fields)
    return data

  }

  export(fileId, mimeType) {

    if (!is.nonEmptyString(fileId)) {
      throw new Error(`API call to drive.files.export failed with error: Required`)
    }
    ScriptApp.__behavior.isAccessible(fileId, 'Drive', 'read');
    const params = {
      id: fileId,
      mimeType,
    }

    const { response, data } = Syncit.fxDriveExport(params)
    return data
    
  }

}

  /**
   * ceate/patch a file and optionally upload some data
   * update and copy are virtually the same payload
   * @param {string} method the api method
   * @param {File} [file] file resource to patch/create
   * @param {string} fileId the file to update 
   * @param {FakeBlob} [blob] blob if media is provided
   */
  const updateOrCreate = ( {method, file = {}, blob, fileId, fields="" , params}) => {
    
    if (!Utils.isNU(blob) && !Utils.isBlob(blob)) {
      throw new Error("The mediaData parameter only supports Blob types for upload.")
    }
    fields = mergeParamStrings(fields, minFields)
    // streamupmedia takes care of improving the cache
    const result = Syncit.fxStreamUpMedia({ method, fields, blob, file , fileId, params })
    const { data } = result
    return data
  }

export const newFakeAdvDriveFiles = (...args) => Proxies.guard(new FakeAdvDriveFiles(...args))