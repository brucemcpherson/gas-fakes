import { Utils } from './utils.js';

const serviceRegistry = new Set();
const loadedRegistry = new Set();

/**
 * diverts the property get to another object returned by the getApp function
 * @param {function} a function to get the proxy object to substitutes
 * @returns {function} a handler for a proxy
 */
const getAppHandler = (getApp, name) => {
  return {

    get(_, prop, receiver) {

      // this will let the caller know we're not really running in Apps Script
      // every service can return this
      if (prop === 'isFake') return true;

      // this returns all services already registered - may be useful
      if (prop === '__registeredServices') return Array.from(serviceRegistry)

     // this returns all services already loaded - may be useful
      if (prop === '__loadedServices') return Array.from(loadedRegistry)

      // this will get the app and lazy load it if its not already loaded
      const app = getApp();

      // now we have a loaded service
      loadedRegistry.add(name)

      // are we being asked to run a method?
      const member = Reflect.get(app, prop, receiver);

      // Check method whitelist if it's a function call on a service
      if (Utils.is.function(member) && name && globalThis.ScriptApp?.__behavior) {
        globalThis.ScriptApp.__behavior.checkMethod(name, prop);
      }

      return member;
    },

    set(_, prop, value) {
      // private props are indicated with a leading __ so are allowed
      if (prop.substring(0,2) === '__') return Reflect.set (getApp(), prop, value)
      throw new Error(`setting values directly in ${name}.${prop} is not allowed`)
    },
ownKeys(_) {
    const app = getApp();
    const keys = new Set();
    let currentObj = app;

    // Traverse the prototype chain of the underlying object (the class/function)
    while (currentObj && currentObj !== Object.prototype) {
        // Collect all own string and symbol properties
        Object.getOwnPropertyNames(currentObj).forEach(key => keys.add(key));
        Object.getOwnPropertySymbols(currentObj).forEach(symbol => keys.add(symbol));

        // Move up the prototype chain
        currentObj = Object.getPrototypeOf(currentObj);
    }
    
    // Convert to Array, as required by the ownKeys trap
    return Array.from(keys);
},
    //ownKeys(_) {
    //  return Reflect.ownKeys(getApp())
    //}
  }
}

// keep a note of which services have been registered
const registerProxy = (name, getApp) => {
  serviceRegistry.add(name);
  const value = new Proxy({}, getAppHandler(getApp, name))
  // add it to the global space to mimic what apps script does

  Object.defineProperty(globalThis, name, {
    value,
    enumerable: true,
    configurable: false,
    writable: false,
  });
}

// this proxy returns a stanard function to any attempt to access any properties
const blanketProxy = (blanketFunc) => {
  return new Proxy ({}, {
    get () {
      return blanketFunc
    }
  })
}



/**
 * for validating attempts to access non existent properties
 */
const validateProperties = () => {
  return {
    get(target, prop, receiver) {
      if (
        // skip any inserted symbos
        typeof prop !== 'symbol' &&
        // sometimes typeof & console.log looks for ths
        prop !== 'inspect' &&
        // this is a mysterious property that APPS script sometimes checks for
        prop !== '__GS_INTERNAL_isProxy' &&
        // check the object has this property
        !Reflect.has(target, prop)
      )
        throw new Error(`attempt to get non-existent property ${prop}: may not be implemented yet`)

      return Reflect.get(target, prop, receiver);
    },

    set(target, prop, value, receiver) {
      if (!Reflect.has(target, prop))
        throw `guard attempt to set non-existent property ${prop}`;
      return Reflect.set(target, prop, value, receiver);
    },
  };
}

 // used to trap access to unknown properties
 const guard = (target) => {
  return new Proxy(target, validateProperties);
 }

export const Proxies = {
  getAppHandler,
  registerProxy,
  guard,
  blanketProxy,
  getRegisteredServices: () => Array.from(serviceRegistry),
}