import { Utils } from '../../support/utils.js'
import { folderType } from '../../support/constants.js'
import is from '@sindresorhus/is';
/**
 * utilities for drive access shared between all fakedrive classes
 */

/**
 * default error handler
 * @param {FakeHttpResponse} response 
 * @returns {Boolean}
 */
export const handleError = (response) => {
  if (is404(response)) {
    return null
  } else {
    throwResponse(response)
  }
}

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
const is404 = (response) => response.status === 404



/**
 * file mimetype is a folder
 * @param {File} file 
 * @returns {Boolean}
 */
export const isFolder = (file) => file.mimeType === folderType

/**
 * general throw when a reponse is bad
 * @param {SyncApiResponse} response the response from a fake fetch
 */
export const throwResponse = (response) => {
  throw new Error(`status: ${response.status} : ${response.statusText}`)
}

const fileFields = ["name", "parents", "id", "mimeType"]
/**
 * minimum fields i'll retrieve
 * @constant
 * @type {object}
 * @default
 */
export const minFields = fileFields
export const minFieldsList = ["nextPageToken", { files: minFields }]

/**
 * in preparation for merginhg field specifications
 * @param {string|object []} spec the fields specs to prepare
 * @param {string|object []} [model] what it should look like
 * @return {Map} this normalized map can be used to remove duplicates when merging
 */
const reduceFields = (spec, model) => {

  const reduced = Utils.arrify(spec).reduce((p, c) => {
    if (is.string(c)) {
      // so this would generate at top level
      p.set(c, new Set())
    } else {
      if (!is.object(c)) {
        throw new Error(`field format should be like ${JSON.stringify(model)}`)
      }
      //we end up with someting like Map{x:Set(null), file: Set(name,id,etc) which will allow merging of multiple of these
      Reflect.ownKeys(c).forEach(k => {
        if (!p.has(k)) p.set(k, new Set())
        Utils.arrify(c[k] || []).forEach(f => p.get(k).add(f))
      })
    }
    return p
  }, new Map())

  return reduced
}

/**
 * make url params for fields
 * @param {object} [extras={}] any extra fields
 * @param {object} [min=minFields] the minum fields we need
 * @return {string} translated to fields=... as url params
 */
export const fieldUrlParams = (extras = {}, min = minFields) => {
  const extrasOb = reduceFields(extras, min)
  const minOb = reduceFields(min, min)

  for (const [k, s] of extrasOb) {
    if (!minOb.has(k)) {
      minOb.set(k, new Set())
    }
    const mink = minOb.has(k) ? Array.from(minOb.get(k).keys()) : []
    const mrg = Array.from(s.keys()).concat(mink)
    minOb.set(k, new Set(mrg))
  }
  const fields = []
  for (const [k, s] of minOb) {
    if (s.size) {
      fields.push(`${k}(${Array.from(s.keys()).join(",")})`)
    } else {
      fields.push(k)
    }
  }

  // now make into a string
  return fields.join(",")
}

/**
 * 
 * @param {object} p the params
 * @param {string} p.url the bare url
 * @param {object|object []} p.min the min fields required
 * @param {object|undefined|object[]} [p.fields] the fields to add to the minimum required   
 * @param {object} p.params and other kinds of params
 * @returns {string} the decorated url
 */
export const decorateUrl = ({ url, fields, params, min  }) => {
  // add the basic fields parameters
  // annoyance:
  // note that for list we need stuff like file(id,name) etc..
  // but for get by id, we just want id,name
  const d = decorateParams({fields, params, min})
  return `${url}?${d}`
}
export const decorateParams = ({ fields, params = {}, min = minFields }) => {
  const fp = fieldUrlParams(fields, min)
  return Utils.makeParamOb({ fields: fp, ...params })
}
