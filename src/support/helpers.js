import {Utils} from './utils.js'
const {is, capital} = Utils
import { Proxies } from './proxies.js'

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
  throw new Error(mess)
}

export const wontBeImplemented = (item="That") => {
  const mess = `${item} will not be implemented - raise issue on https://github.com/brucemcpherson/gas-fakes if you think it should`
  throw new Error(mess)
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

export const minSheetFields = "sheets(properties,basicFilter,bandedRanges,merges,data.rowData.values.dataSourceTable),dataSources,spreadsheetId,properties.title,spreadsheetUrl"
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
export const isGood = (response) => response && Math.floor(response.status / 100) === 2


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
  const passedTypes = items.map(getWhat).map(capital).join(",")
  throw new Error(`The parameters (${passedTypes}) don't match the method ${mess}`)
}

export const ssError = (response, method, ss) => {

  if (!isGood(response)) {
    if (ss) {
      throw new Error(`Unexpected error while getting the method or property ${method} on object SpreadsheetApp. API call failed with error: ${response?.error?.message || response?.statusText}`)
    } else {
      // adv drive throws this one
      throw new Error(`GoogleJsonResponseException: API call to sheets.spreadsheets.${method} failed with error: ${response?.error?.message}`  )
    }
  }
  return response
}

export const signatureArgs = (received, method, objectType = 'Object') => {
  const args = Array.from(received)
  const nargs = args.length
  
  // let's update the passedTypes for the error message to match what GAS does - https://github.com/brucemcpherson/gas-fakes/issues/25
  // this throws an error if it inspects an ENUM - this was an error in sindre's is() which is now fixed
  // we'll just catch and ignore
  let passedTypes
  try {
    passedTypes = args.map(f=>is.null(f) ? 'null' : is(f)).map(f=>f==='null'? f :capital(f)).map(f=>f==='Object' ? objectType : f)
  } catch (err) {
    console.log ("...warning failed signature check- probably an unsupported probe. probe of an enum - ignoring", args)
    passedTypes=[]
  }
  const matchThrow = (mess = method) => {
    throw new Error(`The parameters (${passedTypes.join(",")}) don't match the method signature for ${mess}`)
  }
  return {
    nargs,
    passedTypes,
    matchThrow
  }
}

// these are used to construct calls from the sheets advanced api
// the toString() function returns a stringified version

export const advClassMaker = (props) => {

  // it seems that the properties are not defined until they are set, so we can simply start with an empty object
  const ob = {}

  // camel
  const capped = props.map(Utils.capital)
  const done = new Set()

  // create property getters and setters
  capped.map((f, i) => {

    if (done.has(f)) {
      console.log('....WARNING duplicate property  in advClassMaker', f)
    }
    done.add(f)
    ob['get' + f] = () => ob[props[i]]
    ob['set' + f] = (arg) => {
      ob[props[i]] = arg
      return ob
    }
  })

  // tostring is a json stringifier
  ob.toString = () => JSON.stringify(props.reduce((p, c) => {
    p[c] = ob[c]
    return p
  }, {}))

  return Proxies.guard(ob)


}

/**
 * note that functions like Sheets.newGridRange() etc create objects that contain get and set functions
 * the makesynchronous functions need data that can be serialized. so we need to string/parse to normlaize them
 * @param {object} ob the object to normalize
 * @returns {object} a plain object
 */
export const normalizeSerialization = (ob) => is.nullOrUndefined(ob) || !is.object(ob) ? ob : JSON.parse(JSON.stringify(ob))

export const unimplementedProps = (self, props) => {
  props.forEach(f => {
    self[f] = () => {
      return notYetImplemented(f)
    }
  })
}

export const gError = (response, service, method) => {
  if (response && response.error) {
    if (response.error.code !== 404) {
      throw new Error(`GoogleJsonResponseException: API call to ${service}.${method} failed with error: ${response?.error?.message}`);
    }
  }
};