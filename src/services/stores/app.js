// fake Apps Script Properties and cache services
/**
 * the idea here is to create a global entry for the singleton 
 * before we actually have everything we need to create it. 
 * We do this by using a proxy, intercepting calls to the 
 * initial sigleton and diverting them to a completed one
 */
//import { newFakeService } from './fakestores.js'
//import { Proxies } from '../../support/proxies.js'
import { newFakeService } from './fakestores.js'
import { Proxies } from '../../support/proxies.js'
// ... rest of registerApp ...
// This will eventually hold a proxy for each of the services
let _propertiesApp = null
let _cacheApp = null

/**
 * adds to global space to mimic Apps Script behavior
 */

/**
 * @returns {FakeService}
 */
const registerApp = (name, kind) => {
  let instance = null;
  const getApp = () => {
    // if it hasnt been intialized yet then do that
    if (!instance) {
      instance = newFakeService(kind)
    }
    // this is the actual driveApp we'll return from the proxy
    return instance
  }
  Proxies.registerProxy(name, getApp)
}

registerApp('PropertiesService', 'PROPERTIES')
registerApp('CacheService', 'CACHE')
