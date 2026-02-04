import { sxRetry } from './sxretry.js';
import got from 'got';


/**
 * fix options as apps script is different
 * @param {object} options 
 * @returns {object} fixed options
 */
const fixOptions = (options) => {
  let fixedOptions = {}
  if (options) {
    fixedOptions = { ...options }
    Object.keys(fixedOptions).forEach(k => {
      if (k.match(/Content-Type/i)) {
        fixedOptions.contentType = fixedOptions[k]
        delete fixedOptions[k]
      }
      if (k.match(/payload/i)) {
        fixedOptions.body = fixedOptions[k]
        delete fixedOptions[k]
      }
      if (k.match(/muteHttpExceptions/i)) {
        fixedOptions.throwHttpErrors = !fixedOptions[k]
        delete fixedOptions[k]
      }
    })
  }
  return fixedOptions
}

/**
 * fetch stomething 
 * @param {string} url  the url to fetch
 * @param {object} options any fetch options
 * @param {string[]} responseFields which fields to extract from the got response
 * @returns {object} an http type response
 */
export const sxFetch = async (Auth, url, options, responseFields) => {

  const tag = `sxFetch for ${url}`;

  return sxRetry(Auth, tag, async () => {
    // we need special headers if we're calling google apis
    // notably, the token might be refreshed on retry, so googify must be inside
    const googOptions = Auth.googify(options)

    // Always fetch as a buffer to prevent corruption of binary data like images.
    // The caller (UrlFetchApp/HttpResponse) will be responsible for decoding to text if needed.
    const fixedOptions = fixOptions(googOptions)

    const response = await got(url, {
      ...fixedOptions,
      responseType: 'buffer'
    })

    // we cant return the response from this as it cant be serialized
    // so we;ll extract oout the fields required
    const result = responseFields.reduce((p, c) => {
      p[c] = response[c]
      return p
    }, {})

    // The rawBody is a Buffer. Convert it to a byte array for proper serialization across the worker boundary.
    if (result.rawBody) {
      result.rawBody = Array.from(result.rawBody);
    }
    // The body will also be a buffer
    if (result.body && Buffer.isBuffer(result.body)) {
      result.body = Array.from(result.body);
    }
    // we return what sxRetry expects: an object with data and response (or just the object if it's the result)
    // Actually sxRetry expects the result of the func to have .data and .response or it will use the result itself.
    // sxFetch returns the result fields directly in the GAS implementation.
    // Let's wrap it for sxRetry
    return { data: result, response };

  });
}

/**
 * fetch multiple things
 * @param {object} Auth 
 * @param {object[]} requests 
 * @param {string[]} responseFields 
 * @returns {object[]}
 */
export const sxFetchAll = async (Auth, requests, responseFields) => {
  return Promise.all(requests.map(r => {
    const isString = typeof r === 'string'
    const url = isString ? r : r.url
    const options = isString ? {} : { ...r }
    if (!isString) delete options.url
    return sxFetch(Auth, url, options, responseFields)
  }))
}