import { Proxies } from '../../support/proxies.js'
import { Syncit } from '../../support/syncit.js'
import { Auth } from '../../support/auth.js'
import { Utils } from '../../support/utils.js'
import { getStoreModels } from './gasflex.js'
import { newCacheDropin } from '@mcpher/gas-flex-cache'
import { notYetImplemented } from '../../support/helpers.js'
const { is } = Utils
import { slogger } from "../../support/slogger.js";
/**
 * what these props mean
 * store_type = currently upstash or file - it defines the back end and maps to env variable
 * service_kind = cache or property 
 * store_domain = script, document, user
 */
/**
 * domains of store supported
 * @enum {string}
 */
const StoreDomain = Object.freeze({
  SCRIPT: 'SCRIPT',
  USER: 'USER',
  DOCUMENT: 'DOCUMENT'
})

/**
 * kinds of store service supported
 * @enum {string}
 */
const ServiceKind = Object.freeze({
  PROPERTIES: 'PROPERTY',
  CACHE: 'CACHE'
})


/**
 * types of store supported 
 */
const StoreType = Object.freeze({
  UPSTASH: 'UPSTASH',
  FILE: 'FILE'
})

/**
 * default expiration of cache in seconds
 * @constant 
 * @type {number}
 */
const DEFAULT_CACHE_EXPIRY = 600
/**
 * maximum expiration time in secs
 * @constant 
 * @type {number}
 */
const MAXIMUM_CACHE_EXPIRY = 21600

/**
 * set expiry time to apps script ranges
 * Apps Script doesnt mind if the value provided is outside these ranges - it just silently applies them
 * @param {number} secs  
 * @returns {number}
 */
const normExpiry = (secs) => {
  if (typeof secs === typeof undefined || secs === null) secs = DEFAULT_CACHE_EXPIRY
  return Math.max(1, Math.min(MAXIMUM_CACHE_EXPIRY * 1000, secs * 1000))
}

/**
 * apps script often returns null instead of undefined
 * @param {*} value 
 * @returns {value|null}
 */
const fixun = (value) => typeof value === typeof undefined ? null : value


const validateProp = (prop, vob, name = '') => {
  // this will return the actual value of the enum, not the property name
  prop = prop.toUpperCase(prop)
  if (!Reflect.has(vob, prop)) {
    throw new Error(`invalid ${name} property ${prop}`)
  }
  return vob[prop]
}



// this checks to see if we want to override a service with gas-flex-cache
const whichCache = () => {
  // this will return the actual value of the enum, not the property name
  const type = validateProp(process.env.STORE_TYPE || "file", StoreType, 'store_type')
  if (type === StoreType.UPSTASH) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    if (!is.nonEmptyString(token)) throw new Error('UPSTASH_REDIS_REST_TOKEN not found or invalid in .env file')
    if (!is.nonEmptyString(url)) throw new Error('UPSTASH_REDIS_REST_URL not found or invalid in .env file')
    return {
      url,
      token,
      type
    }
  }
  return {
    type
  }
}

/**
 * @class FakePropertiesService
 */
class FakePropertiesService {
  constructor(type) {
    this.kind = ServiceKind.PROPERTIES
    this.type = type
  }

  /**
   * get document properties
   * @returns {FakeProperties | null}
   */
  getDocumentProperties() {
    // apps script needs a bound document to use this store
    if (!Auth.getDocumentId()) return null
    return selectCache(StoreDomain.DOCUMENT, this.kind)
  }

  /**
   * get user properties
   * @returns {FakeProperties}
   */
  getUserProperties() {
    return selectCache(StoreDomain.USER, this.kind)
  }

  /**
   * get script properties
   * @returns {FakeProperties}
   */
  getScriptProperties() {
    return selectCache(StoreDomain.SCRIPT, this.kind)
  }
}

/**
 * @class FakeCacheService
 */
class FakeCacheService {
  constructor(type) {
    this.kind = ServiceKind.CACHE
    this.type = type
  }

  /**
   * get document cache
   * @returns {FakeCache | null}
   */
  getDocumentCache() {
    // apps script needs a bound document to use this store
    if (!Auth.getDocumentId()) return null
    return selectCache(StoreDomain.DOCUMENT, this.kind, DEFAULT_CACHE_EXPIRY)
  }

  /**
   * get user cache
   * @returns {FakeCache}
   */
  getUserCache() {
    return selectCache(StoreDomain.USER, this.kind, DEFAULT_CACHE_EXPIRY)
  }

  /**
   * get script cache
   * @returns {FakeCache}
   */
  getScriptCache() {
    return selectCache(StoreDomain.SCRIPT, this.kind, DEFAULT_CACHE_EXPIRY)
  }
}

/**
 * create a new FakeService instance
 * @param {ServiceKind} kind of service
 * @returns {FakePropertiesService | FakeCacheService}
 */
export const newFakeService = (kind) => {
  kind = validateProp(kind, ServiceKind, 'service_kind')
  const w = whichCache()
  slogger.log(`...${kind} store service is using store type ${w.type} as backend`)
  return Proxies.guard(kind === ServiceKind.CACHE ? new FakeCacheService(w.type) : new FakePropertiesService(w.type))
}

const selectCache = (domain, kind, defaultExpirationSeconds) => {
  // actually we might be overriding the type of service
  domain = validateProp(domain, StoreDomain, 'store_domain')
  const which = whichCache()
  if (which.type === "UPSTASH") {
    const models = getStoreModels()
    const model = models[domain]
    if (!model) {
      throw new Error(`invalid store type model for ${domain}`)
    }
    return newCacheDropin({
      creds: {
        ...model,
        ...which,
        type: "upstash",
        kind: kind.toLowerCase(),
        defaultExpirationSeconds
      }
    })
  } else if (which.type === StoreType.FILE) {
    const store = kind === ServiceKind.CACHE ? FakeCache : FakeProperties
    return Proxies.guard(new store(domain))
  } else {
    throw new Error(`invalid store type ${which.type} found in .env file`)
  }
}

/**
 * bas class for property and cache stores
 * @class FakeStore
 */
class FakeStore {
  /**
   * @constructor
   * @param {string} domain 
   */
  constructor(domain) {
    domain = validateProp(domain, StoreDomain, 'store_domain')
    this._domain = domain
  }

  /**
   * @returns {string}
   */
  get domain() {
    return this._domain
  }

  getFileName(kind) {

    const d = this.domain.substring(0, 1).toLowerCase()
    const k = kind.substring(0, 1).toLowerCase()
    const scriptId = Auth.getScriptId()
    const documentId = Auth.getDocumentId()

    let fileName = `${k}${d}-${scriptId}`
    if (this.domain === StoreDomain.USER) {
      fileName += `-${Auth.getHashedUserId()}`
    }
    else if (this.domain === StoreDomain.DOCUMENT && documentId) {
      fileName += `-${documentId}`
    }

    return fileName
  }


}


/**
 * @class FakeProperties
 */
class FakeProperties extends FakeStore {
  /**
   * @constructor
   * @param {string} domain 
   */
  constructor(domain) {
    super(domain)
    this._storeArgs = {
      inMemory: false,
      fileName: this.getFileName(ServiceKind.PROPERTIES).toLowerCase(),
      storeDir: Auth.getPropertiesPath()
    }
  }


  deleteAllProperties() {
    return notYetImplemented('....try using gas-flex-cache store instead')
  }
  /**
   * delete the entry associated with the given key
   * @param {string} key 
   * @returns {FakeProperties} in Apps Script this is returned for chaining
   */
  deleteProperty(key) {
    Syncit.fxStore(this._storeArgs, "delete", key)
    return this
  }
  getKeys() {
    return notYetImplemented('....try using gas-flex-cache store instead')
  }
  getProperties() {
    return notYetImplemented('....try using gas-flex-cache store instead')
  }
  /**
   * get a value from prop store
   * @param {string} key 
   * @returns {string| null}
   */
  getProperty(key) {
    return fixun(Syncit.fxStore(this._storeArgs, "get", key))


  }
  setProperties(properties, deleteAllOthers) {
    return notYetImplemented('....try using gas-flex-cache store instead')
  }
  /**
   * set the entry associated with the given key
   * @param {string} key 
   * @param {string} value 
   * @returns {FakeProperties} in Apps Script this is returned for chaining
   */
  setProperty(key, value) {
    Syncit.fxStore(this._storeArgs, "set", key, value)
    return this
  }

}

class FakeCache extends FakeStore {
  constructor(domain) {
    super(domain)
    this._storeArgs = {
      inMemory: false,
      fileName: this.getFileName(ServiceKind.CACHE).toLowerCase(),
      storeDir: Auth.getCachePath()
    }
  }
  getAll(keys) {
    return notYetImplemented('....try using gas-flex-cache store instead')
  }

  /**
   * set the entry associated with the given key
   * @param {string} key 
   * @param {string} value 
   * @param {number} expirationInSeconds 
   * @returns null
   */
  put(key, value, expirationInSeconds) {
    Syncit.fxStore(this._storeArgs, "set", key, value, normExpiry(expirationInSeconds))
    return null
  }

  putAll(values, expirationInSeconds) {
    return notYetImplemented('....try using gas-flex-cache store instead')
  }

  /**
   * delete the entry associated with the given key
   * @param {string} key 
   * @returns {FakeCache} in Apps Script this is returned for chaining
   */
  remove(key) {
    Syncit.fxStore(this._storeArgs, "delete", key)
    return null
  }

  removeAll(keys) {
    return notYetImplemented('....try using gas-flex-cache store instead')
  }
  get(key) {
    return fixun(Syncit.fxStore(this._storeArgs, "get", key))
  }

}
