/**
 * the idea here is to create a global entry for the singleton
 * before we actually have everything we need to create it.
 * We do this by using a proxy, intercepting calls to the
 * initial singleton and diverting them to a completed one
 */
import { newFakeFormApp } from './fakeformapp.js';
import { Proxies } from '../../support/proxies.js';

let _app = null;

const name = 'FormApp';
const serviceName = 'FormApp';

if (typeof globalThis[name] === typeof undefined) {
  const getApp = () => {
    if (!_app) {
      const realApp = newFakeFormApp();

      _app = new Proxy(realApp, {
        get(target, prop, receiver) {
          if (prop === 'toString') {
            return () => name;
          }

          const serviceBehavior = ScriptApp.__behavior.sandboxService[serviceName];

          if (!serviceBehavior.enabled) {
            throw new Error(`${name} service is disabled by sandbox settings.`);
          }

          const allowedMethods = serviceBehavior.methods;
          if (allowedMethods && typeof target[prop] === 'function' && !allowedMethods.includes(prop)) {
            throw new Error(`Method ${name}.${prop} is not allowed by sandbox settings.`);
          }

          return Reflect.get(target, prop, receiver);
        },
      });
    }
    return _app;
  };
  Proxies.registerProxy(name, getApp);
}