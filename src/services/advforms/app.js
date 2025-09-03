
/**
 * NOTE - Although Apps Script doesnt yet have a Forms advanced service
 * we're going to funnel everything through here as if there was one.
 * 
 */
import { newFakeAdvForms } from './fakeadvforms.js'
import { Proxies } from '../../support/proxies.js'

// This will eventually hold a proxy for Formsapp
let _app = null

/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "Forms"
if (typeof globalThis[name] === typeof undefined) {

  const getApp = () => {
    // if it hasne been intialized yet then do that
    if (!_app) {
      console.log('...activating proxy for', name)
      _app = newFakeAdvForms()
    }
    // this is the actual formsapp we'll return from the proxy
    return _app
  }

  Proxies.registerProxy(name, getApp)

}
