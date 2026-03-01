import { Proxies } from '../../support/proxies.js';
import { Auth } from '../../support/auth.js';
import { Syncit } from '../../support/syncit.js';
import { newFakeLibHandler } from './fakelibhandler.js';

export const newFakeLibHandlerApp = (...args) => {
  return Proxies.guard(new FakeLibHandlerApp(...args));
};

// we ned to be able to handle multiple recursive libraries
// the default source will be the current manifest
// for now we only sipport the HEAD version of libraries
class FakeLibHandlerApp {
  constructor() {
    this.__libMap = new Map()
  }

  get libMap() {
    return this.__libMap
  }


  load(manifest) {
    if (!manifest && !Auth.hasAuth()) {
      Syncit.fxInit();
    }
    manifest = manifest || Auth.getManifest();
    if (!manifest) {
      throw new Error('manifest not found in auth and not provided');
    }
    this.__libMap = new Map()

    const recurseManifests = (manifest) => {
      const libs = newFakeLibHandler(manifest).fetchLibraries();
      if (libs) {
        libs.forEach((lib) => {
          if (!this.libMap.has(lib.libraryId)) {
            this.libMap.set(lib.libraryId, lib);
            console.log(`...loading ${lib.libraryId} - ${lib.userSymbol}`)
            if (lib.libraries) {
              recurseManifests(lib.manifest)
            }
          }
        })
      }
    }
    recurseManifests(manifest)
    
    this.libMap.forEach((lib) => {
      lib.inject()
    })
    return this
  }


  toString() {
    return 'LibHandlerApp';
  }

}