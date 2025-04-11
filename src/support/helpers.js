import {Utils} from './utils.js'


/**
 * @constant
 * @type {string}
 * @default
 */
export const gooType = "application/vnd.google-apps"
/**
 * mimetype of a folder
 * @constant
 * @type {string}
 * @default
 */
export const folderType = `${gooType}.folder`
export const spreadsheetType = `${gooType}.spreadsheet`

export const isGoogleType = (mimeType) => 
  mimeType && mimeType.substring(0,gooType.length) === gooType

export const gzipType = 'application/x-gzip'
export const zipType = 'application/zip'

export const notYetImplemented = (item ='That') => {
  const mess = `${item} is not yet implemented - watch https://github.com/brucemcpherson/gas-fakes for progress`
  return mess
}

export const wontBeImplemented = (item="That") => {
  const mess = `${item} will not be implemented - raise issue on https://github.com/brucemcpherson/gas-fakes if you think it should`
  return mess
}
// added parents to the minfield length as its often needed
const minFieldsList = ["name","id","mimeType","kind","parents"]
/**
 * minimum fields  these are the filds I'll take back from  the API to enable basic DriveApp - these are the defaults returned by the api
 * any other will be picked up on demand
 * these are stored in cache - when other firlds arerequied for example, size it'll do another fetch and enhance cache
 * @constant
 * @type {object}
 * @default
 */
export const minFields = minFieldsList.join(",")
export const minPermissionFields = "kind,id,role,type"

export const minSheetFields = "sheets.properties,spreadsheetId"
/**
 * is an object a folder
 * @param {FakeDriveMeta} file 
 * @returns {Boolean}
 */
export const isFakeFolder = (file) => getFakeType (file) && isFolder(file.meta) 


/**
 * file mimetype is a folder
 * @param {File} file 
 * @returns {Boolean}
 */
export const isFolder = (file) => file?.mimeType === folderType 

/**
 * fake service
 * @param {object} item 
 * @returns {string}
 */
export const getFakeService = (item) =>  item?.__gas_fake_service || null


/**
 * fake type 
 * @param {object} item 
 * @returns {string}
 */
export const getFakeType = (item) => getFakeService(item) && item.__getFakeType ()

/**
 * check if a drive reponse good 
 * @param {SyncApiResponse} response 
 * @returns {Boolean}
 */
export const isGood = (response) => Math.floor(response.status / 100) === 2


/**
 * check if a SyncApiResponse is a not found
 * @param {SyncApiResponse} response 
 * @returns {Boolean}
 */
export const is404 = (response) => response.status === 404


/**
 * general throw when a reponse is bad
 * @param {SyncApiResponse} response the response from a fake fetch
 */
export const throwResponse = (response) => {
  throw new Error(`status: ${response.status} : ${response.statusText}`)
}

/**
 * get the type of items enhanced by fake types
 * @param {*} item 
 * @returns {string}
 */
const getWhat = (item) => getFakeType(item) || Utils.is(item)

/**
 * report that args given dont match the type expected in the style of apps script arg checking
 * @param {*[]} items 
 * @param {string} mess additional method
 */
export const argsMatchThrow = ( items, mess = "") => {
  // limit the error message 
  const passedTypes = items.map(getWhat).map(Utils.capital).join(",")
  throw new Error(`The parameters (${passedTypes}) don't match the method ${mess}`)
}