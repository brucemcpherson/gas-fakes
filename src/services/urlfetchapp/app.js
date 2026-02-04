// fake Apps Script UrlFetchApp

import { Auth } from '../../support/auth.js'
import { Syncit } from '../../support/syncit.js'
import { Proxies } from '../../support/proxies.js'

// Note that all async type functions have been converted to synch ro make it Apps Script like


/**
 * make got response look like UrlFetchApp response
 * @param {Response} reponse
 * @return {FakeHTTPResponse} UrlFetchApp flavor 
 */
const responsify = (response) => {

  // getAllHeaders()	Object	Returns an attribute/value map of headers for the HTTP response, with headers that have multiple values returned as arrays.
  const getAllHeaders = () => fixHeaders(response)

  // getResponseCode()	Integer	Get the HTTP status code (200 for OK, etc.) of an HTTP response
  const getResponseCode = () => response.statusCode

  // getContentText()	String	Gets the content of an HTTP response encoded as a string.
  const getContentText = () => blobify(response).getDataAsString()

  // getHeaders()	Object	Returns an attribute/value map of headers for the HTTP response.
  const getHeaders = () => fixHeaders(response)

  // getContent() Bytes[] the data as byte array
  const getContent = () => response.rawBody || response.body

  // getBlob () FakeBlob the content as a blob
  const getBlob = () => blobify(response)

  // got returns lower case headers props, so we have to resort to using rawheaders so we match the case of Apps Script
  // TODO - find an example in apps script where getAllHeaders is not equal to getHeaders
  const fixHeaders = (response) => {
    // it's a map with a pair of values
    const headers = (response.rawHeaders || [])
    if (headers % 2) {
      throw `fixHeaders:invalid number of header value pairs - ${headers.length}`
    }
    // split into pairs and return as object
    const mapHeaders = new Map(headers.flatMap((_, i, a) => i % 2 ? [] : [a.slice(i, i + 2)]));
    return Object.fromEntries(mapHeaders)
  }
  const blobify = (response) => {
    const headers = fixHeaders(response)
    if (!headers) return null
    // the name is buried in the Conent-Disposition
    const disp = headers["Content-Disposition"]
    const filename = disp && disp.replace(/.*filename="([^"]*).*/, "$1")
    const name = filename || ""
    const contentType = headers["Content-Type"]?.replace(/([^;]*).*/, "$1").trim()
    const bytes = response.rawBody || response.body || null
    return Utilities.newBlob(bytes, contentType, name)
  }

  /* TODO
  getAs(contentType)	Blob	Return the data inside this object as a blob converted to the specified content type.
  getBlob()	Blob	Return the data inside this object as a blob.
  getContent()	Byte[]	Gets the raw binary content of an HTTP response.
  getContentText(charset)	String	Returns the content of an HTTP response encoded as a string of the given charset.
  */
  return {
    getAllHeaders,
    getResponseCode,
    getContentText,
    getHeaders,
    getBlob,
    getContent
  }
}

// this has been syncified
const fetch = (url, options = {}) => {

  // check options for method and provide default
  options.method = options.method || "get"

  const responseFields = [
    'rawHeaders',
    'statusCode',
    'body',
    'headers',
    'rawBody'
  ]

  const { data } = Syncit.fxFetch(url, options, responseFields)
  return responsify(data)
}

// this has been syncified
const fetchAll = (requests) => {

  const responseFields = [
    'rawHeaders',
    'statusCode',
    'body',
    'headers',
    'rawBody'
  ]

  const responses = Syncit.fxFetchAll(requests, responseFields)
  return responses.map(({ data }) => responsify(data))
}


// This will eventually hold a proxy for DriveApp
let _app = null

/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "UrlFetchApp"
if (typeof globalThis[name] === typeof undefined) {

  const getApp = () => {
    // if it hasne been intialized yet then do that
    if (!_app) {
      _app = {
        fetch,
        fetchAll
      }
    }
    // this is the actual driveApp we'll return from the proxy
    return _app
  }

  Proxies.registerProxy(name, getApp)

}


/** got reponse props
  [ '_events', 'object' ],
  [ '_readableState', 'object' ],
  [ '_writableState', 'object' ],
  [ 'allowHalfOpen', 'boolean' ],
  [ '_destroy', 'function' ],
  [ '_maxListeners', 'undefined' ],
  [ '_eventsCount', 'number' ],
  [ 'socket', 'object' ],
  [ 'httpVersionMajor', 'number' ],
  [ 'httpVersionMinor', 'number' ],
  [ 'httpVersion', 'string' ],
  [ 'complete', 'boolean' ],
  [ 'rawHeaders', 'object' ],
  [ 'rawTrailers', 'object' ],
  [ 'joinDuplicateHeaders', 'undefined' ],
  [ 'aborted', 'boolean' ],
  [ 'upgrade', 'boolean' ],
  [ 'url', 'string' ],
  [ 'method', 'object' ],
  [ 'statusCode', 'number' ],
  [ 'statusMessage', 'string' ],
  [ 'client', 'object' ],
  [ '_consuming', 'boolean' ],
  [ '_dumped', 'boolean' ],
  [ 'req', 'object' ],
  [ 'timings', 'object' ],
  [ 'headers', 'object' ],
  [ 'setTimeout', 'function' ],
  [ 'trailers', 'object' ],
  [ 'requestUrl', 'object' ],
  [ 'redirectUrls', 'object' ],
  [ 'request', 'object' ],
  [ 'isFromCache', 'boolean' ],
  [ 'ip', 'string' ],
  [ 'retryCount', 'number' ],
  [ 'ok', 'boolean' ],
  [ 'rawBody', 'object' ],
  [ 'body', 'string' ]
 */