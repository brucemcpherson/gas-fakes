import { Proxies } from '../../support/proxies.js'
import { Utils } from '../../support/utils.js'

const { is } = Utils
const checkArgs = (actual, expect = "boolean") => {
  if (!is[expect](actual)) {
    throw new Error(`${this.name} expected ${expect} but got ${actual}`)
  }
  return actual
}

const serviceModel = {
  enabled: null,
  sandboxStrict: null,
  sandboxMode: null,
  methodWhitelist: null
}
const idWhitelistModel = {
  id: null,
  read: true,
  write: false,
  trash: false
}

class FakeIdWhitelistItem {
  constructor(id) {
    this.__model = { ...idWhitelistModel, id }
  }
  toString() {
    return 'IdWhitelistItem'
  }
  get id() {
    return this.__model.id
  }
  setId(value) {
    this.__model.id = checkArgs(value, "nonEmptyString")
    return this
  }
  get read() {
    return this.__model.read
  }
  setRead(value) {
    this.__model.read = checkArgs(value)
    return this
  }
  get write() {
    return this.__model.write
  }
  setWrite(value) {
    this.__model.write = checkArgs(value)
    return this
  }
  get trash() {
    return this.__model.trash
  }
  setTrash(value) {
    this.__model.trash = checkArgs(value)
    return this
  } 
}
/**
 * create a new behavior instance
 * @param  {...any} args 
 * @returns {Behavior}
 */
export const newFakeBehavior = (...args) => {
  return Proxies.guard(new FakeBehavior(...args))
}
const newFakeSandboxService = (...args) => {
  return Proxies.guard(new FakeSandboxService(...args))
}
const newFakeIdWhitelistItem = (...args) => {
  return Proxies.guard(new FakeIdWhitelistItem(...args))
}
/**
 * this can modify sandbox behaior for each individual service
 */
class FakeSandboxService {
  constructor(behavior, name) {
    this.__name = name
    this.__state = { ...serviceModel }
    this.__behavior = behavior
  }

  clear() {
    // restore to default
    this.__state = { ...serviceModel }
  }
  get name() {
    return this.__name
  }
  set sandboxStrict(value) {
    this.__state.sandboxStrict = checkArgs(value)
  }
  set sandboxMode(value) {
    this.__state.sandboxMode = checkArgs(value)
  }

  setMethodWhitelist(value) {
    if (!is.null(value)) {
      checkArgs(value, "array")
      value.forEach(f => {
        if (!is.nonEmptyString(f)) throw new Error(`expected an array of nonEmptyStrings for methodWhitelist`)
      })
    }
    this.__state.methodWhitelist = value
    return this
  }

  addMethodWhitelist(methodName) {
    if (!is.nonEmptyString(methodName)) throw new Error(`expected a nonEmptyString for methodName`)
    if (!this.__state.methodWhitelist) {
      this.__state.methodWhitelist = []
    }
    if (!this.__state.methodWhitelist.includes(methodName)) {
      this.__state.methodWhitelist.push(methodName)
    }
    return this
  }

  removeMethodWhitelist(methodName) {
    if (this.__state.methodWhitelist) {
      this.__state.methodWhitelist = this.__state.methodWhitelist.filter(m => m !== methodName)
      if (this.__state.methodWhitelist.length === 0) {
        this.__state.methodWhitelist = null
      }
    }
    return this
  }

  clearMethodWhitelist() {
    this.__state.methodWhitelist = null
    return this
  }

  set enabled(value) {
    this.__state.enabled = checkArgs(value)
  }
  get methodWhitelist() {
    return is.nullOrUndefined(this.__state.methodWhitelist) ? null : this.__state.methodWhitelist
  }
  get enabled() {
    return is.nullOrUndefined(this.__state.enabled) ? true : this.__state.enabled
  }
  get sandboxStrict() {
    return is.nullOrUndefined(this.__state.sandboxStrict) ? this.__behavior.strictSandbox : this.__state.sandboxStrict
  }
  get sandboxMode() {
    return is.nullOrUndefined(this.__state.sandboxMode) ? this.__behavior.sandboxMode : this.__state.sandboxMode
  }

}

class FakeBehavior {
  constructor() {
    // this is a set of all the files this instance of gas-fakes has created
    // the idea is that we can use this to clean up after tests or to emulate drive.file scope
    // key is the file id
    this.__createdIds = new Set();
    // in sandbox mode we only allow access to files created in this instance
    // this is to emulate the behavior of a drive.file scope
    this.__sandboxMode = false;
    // if you want the created files to be cleaned up on wrapup 
    this.__cleanup = true;
    // to strictly enforce sandbox mode
    this.__strictSandbox = true;
    this.__idWhitelist = null

    // individually settable services
    const services = ['DocumentApp', 'DriveApp', 'SpreadsheetApp', 'SlidesApp', 'Docs', 'Sheets', 'Drive', 'Slides', 'FormApp', 'Forms']
    this.__sandboxService = {}
    services.forEach(f => this.__sandboxService[f] = newFakeSandboxService(this, f))

  }
  newIdWhitelistItem(id) {
    return newFakeIdWhitelistItem(id)
  }
  get idWhitelist() {
    return this.__idWhitelist
  }

  setIdWhitelist(value) {
    if (!is.null(value)) {
      checkArgs(value, "array")
      value.forEach(f => {
        if (!f || f.toString() !== "IdWhitelistItem") throw new Error(`expected an IdWhitelistItem`)
      })
    }
    this.__idWhitelist = value
    return this
  }

  addIdWhitelist(item) {
    if (!item || item.toString() !== "IdWhitelistItem") throw new Error(`expected an IdWhitelistItem`)
    if (!this.__idWhitelist) {
      this.__idWhitelist = []
    }
    // avoid duplicates by id
    if (!this.__idWhitelist.find(i => i.id === item.id)) {
      this.__idWhitelist.push(item)
    }
    return this
  }

  removeIdWhitelist(id) {
    if (this.__idWhitelist) {
      this.__idWhitelist = this.__idWhitelist.filter(item => item.id !== id)
      if (this.__idWhitelist.length === 0) {
        this.__idWhitelist = null
      }
    }
    return this
  }

  clearIdWhitelist() {
    this.__idWhitelist = null
    return this
  }
  get sandboxService() {
    return this.__sandboxService
  }
  set strictSandbox(value) {
    this.__strictSandbox = value;
  }
  get strictSandbox() {
    return this.__strictSandbox;
  }
  set cleanup(value) {
    this.__cleanup = value;
  }
  get cleanup() {
    return this.__cleanup;
  }
  set sandboxMode(value) {
    this.__sandboxMode = value;
  }
  get sandboxMode() {
    return this.__sandboxMode;
  }
  // synonyms because i originally published with miscased sandBox
  set sandBoxMode(value) {
    this.__sandboxMode = value;
  }
  get sandBoxMode() {
    return this.__sandboxMode;
  }
  addFile(id) {
    if (this.sandboxMode) {
      if (!is.nonEmptyString(id)) {
        throw new Error(`Invalid sandbox id parameter (${id}) - must be a non-empty string`);
      }
      if (!this.isKnown(id)) {
        console.log(`...adding file ${id} to sandbox allowed list`);
        this.__createdIds.add(id);
      }
    }
    return id
  }
  isAccessible(id, serviceName, accessType = 'read') {
    if (!is.nonEmptyString(id)) {
      throw new Error(`Invalid sandbox id parameter (${id}) - must be a non-empty string`);
    }

    // Advanced services should inherit sandbox rules from their App counterparts.
    const serviceMapping = {
      Drive: "DriveApp",
      Sheets: "SpreadsheetApp",
      Docs: "DocumentApp",
      Slides: "SlidesApp",
      Forms: "FormApp",
    };
    const effectiveServiceName = serviceMapping[serviceName] || serviceName;
    const serviceBehavior = this.sandboxService[effectiveServiceName];

    // 1. Check if service is enabled
    if (serviceBehavior && !serviceBehavior.enabled) {
      throw new Error(`${effectiveServiceName} service is disabled by sandbox settings`);
    }

    // Determine effective sandbox mode and strictness
    const sandboxMode = serviceBehavior ? serviceBehavior.sandboxMode : this.sandboxMode;
    const strictSandbox = serviceBehavior ? serviceBehavior.sandboxStrict : this.strictSandbox;

    // If not in sandbox mode, access is allowed.
    if (!sandboxMode) {
      return true;
    }

    // In sandbox mode, read access to the root folder is always allowed for DriveApp initialization.
    if (id === 'root' && accessType === 'read') {
      return true;
    }

    // The whitelist is the highest authority. If an ID is on it, its rules are final.
    if (this.idWhitelist) {
      const whitelistItem = this.idWhitelist.find(item => item.id === id);
      if (whitelistItem) {
        if (whitelistItem[accessType]) {
          return true;
        } else {
          throw new Error(`${accessType.charAt(0).toUpperCase() + accessType.slice(1)} access to file ${id} is denied by sandbox whitelist rules`);
        }
      }
    }

    // If not on the whitelist, check if it's a session-created file.
    // Session files are granted full access by default (unless overridden by a more restrictive whitelist entry).
    if (this.isKnown(id)) {
      return true;
    }

    // It's an external file not on the whitelist. Check strictness.
    if (strictSandbox) {
      throw new Error(`Access to file ${id} is denied by sandbox rules`);
    }

    // 6. Not strict, so access is allowed.
    return true;
  }
  checkMethod(serviceName, methodName) {
    const serviceBehavior = this.sandboxService[serviceName];
    if (serviceBehavior && !serviceBehavior.enabled) {
      throw new Error(`${serviceName} service is disabled by sandbox settings`);
    }

    // internal methods are always allowed
    if (methodName.startsWith('__')) {
      return true;
    }

    // some methods are essential for other services to work, so they are always allowed
    if (serviceName === 'DriveApp') {
      const essentialMethods = new Set(['getRootFolder', 'getFileById', 'getFolderById', 'setTrashed']);
      if (essentialMethods.has(methodName)) {
        return true;
      }
    }

    if (serviceBehavior && serviceBehavior.methodWhitelist && !serviceBehavior.methodWhitelist.includes(methodName)) {
      throw new Error(`Method ${serviceName}.${methodName} is not allowed by sandbox settings`);
    }
    return true;
  }
  trash() {
    // this is where we would trash all the created files
    if (!this.__cleanup) {
      console.log('...skipping cleaning up sandbox files')
      return [];
    }

    const trashed = Array.from(this.__createdIds).reduce((acc, id) => {
      let d = null
      try {
        d = DriveApp.getFileById(id)
      } catch (e) {
        d = DriveApp.getFolderById(id)
      }
      if (d) {
        d.setTrashed(true);
        console.log(`...trashed file ${d.getName()} (${id})`);
        acc.push(id);
      }
      return acc;
    }, []);

    this.__createdIds.clear();
    console.log(`...trashed ${trashed.length} sandboxed files`);
    return trashed;
  }
  isKnown(id) {
    return this.__createdIds.has(id);
  }
}
