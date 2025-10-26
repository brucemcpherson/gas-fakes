import { Proxies } from '../../support/proxies.js';

export const lazyLoaderApp = (app, name, maker) => {

    if (typeof globalThis[name] === typeof undefined) {

        const getApp = () => {
   
            // if it hasne been intialized yet then do that
            if (!app) {
                app = maker()
            }
            // this is the actual driveApp we'll return from the proxy
            return app
        }
        Proxies.registerProxy(name, getApp)

    }
    return app
}
