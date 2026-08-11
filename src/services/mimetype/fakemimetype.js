
import { Proxies } from '../../support/proxies.js';
import { googleMimeTypes } from './googlemimetypes.js';
/**
 * @class
 * @implements {GoogleAppsScript.Base.MimeType}
 */
export class FakeMimeType {
    constructor() {
        Reflect.ownKeys(googleMimeTypes).forEach(f => this[f] = googleMimeTypes[f])

    }


    toString() {
        return 'MimeType';
    }
}

/**
 * @returns {FakeLogger}
 */
export const newFakeMimeType = (...args) => Proxies.guard(new FakeMimeType(...args));
