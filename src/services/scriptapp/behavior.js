import { Proxies } from '../../support/proxies.js'
import { Utils } from '../../support/utils.js'
import { slogger } from "../../support/slogger.js";

const { is } = Utils
const checkArgs = (actual, expect = "boolean") => {
  if (!is[expect](actual)) {
    throw new Error(`${this.name} expected ${expect} but got ${actual}`)
  }
  return actual
}

const serviceModel = {
  cleanup: null,
  sandboxStrict: null,
  sandboxMode: null,
  methodWhitelist: null,
  emailWhitelist: null,
  labelWhitelist: null,
  calendarWhitelist: null,
  usageLimit: null,
  usageCount: 0
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
  set cleanup(value) {
    this.__state.cleanup = checkArgs(value)
  }
  get cleanup() {
    return is.nullOrUndefined(this.__state.cleanup) ? this.__behavior.cleanup : this.__state.cleanup
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

  set emailWhitelist(value) {
    if (!is.null(value)) {
      checkArgs(value, "array")
      value.forEach(f => {
        if (!is.nonEmptyString(f)) throw new Error(`expected an array of nonEmptyStrings for emailWhitelist`)
      })
    }
    this.__state.emailWhitelist = value
  }
  get emailWhitelist() {
    return this.__state.emailWhitelist
  }

  set labelWhitelist(value) {
    if (!is.null(value)) {
      checkArgs(value, "array")
      // We expect objects like { label: 'name', read: true, write: false, delete: false }
      // but for simplicity in config validation we'll just check it's an array for now
    }
    this.__state.labelWhitelist = value
  }
  get labelWhitelist() {
    return this.__state.labelWhitelist
  }

  set calendarWhitelist(value) {
    if (!is.null(value)) {
      checkArgs(value, "array")
      // We expect objects like { name: 'calendar-name', read?: boolean, write?: boolean, delete?: boolean }
    }
    this.__state.calendarWhitelist = value
  }
  get calendarWhitelist() {
    return this.__state.calendarWhitelist
  }

  set usageLimit(value) {
    if (!is.null(value)) {
      // expect object with read, write, trash keys optionally
      // if passing number, assume it's "write" limit for backward compat? or throw?
      // User requested granular limits. Let's support object.
      // If we want backward compat, could map number -> {write: number}.
      // But strictly speaking:
      if (typeof value === 'object') {
        ['read', 'write', 'trash', 'send'].forEach(k => {
          if (Reflect.has(value, k) && !is.number(value[k])) throw new Error(`usageLimit.${k} must be a number`);
        });
      } else {
        // If it's a number, it implies a TOTAL limit for all operations (read + write + trash + send).
        if (!is.number(value)) {
          throw new Error(`usageLimit must be an object {read, write, trash, send} or a number (implies total limit)`);
        }
        // value remains a number
      }
    }
    this.__state.usageLimit = value
  }
  get usageLimit() {
    return this.__state.usageLimit
  }

  get usageCount() {
    // ensure it's initialized as object if strict
    if (!this.__state.usageCount || typeof this.__state.usageCount !== 'object') {
      this.__state.usageCount = { read: 0, write: 0, trash: 0, send: 0 };
    }
    return this.__state.usageCount
  }

  incrementUsage(type = 'write') {
    if (!['read', 'write', 'trash', 'send'].includes(type)) throw new Error(`Invalid usage type ${type}`);
    if (!this.__state.usageCount || typeof this.__state.usageCount !== 'object') {
      this.__state.usageCount = { read: 0, write: 0, trash: 0, send: 0 };
    }
    this.__state.usageCount[type] = (this.__state.usageCount[type] || 0) + 1;
    return this.__state.usageCount[type];
  }

  resetUsageCount() {
    this.__state.usageCount = { read: 0, write: 0, trash: 0, send: 0 };
    return this;
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
    this.__createdGmailIds = new Set();
    this.__createdCalendarIds = new Set();
    // Specifically for sandbox mode - files created when sandbox mode is on
    this.__allowedIds = new Set();
    this.__allowedGmailIds = new Set();
    this.__allowedCalendarIds = new Set();
    // in sandbox mode we only allow access to files created in this instance
    // this is to emulate the behavior of a drive.file scope
    this.__sandboxMode = false;
    // if you want the created files to be cleaned up on wrapup 
    this.__cleanup = true;
    // to strictly enforce sandbox mode
    this.__strictSandbox = true;
    this.__idWhitelist = null

    // individually settable services
    const services = ScriptApp.__registeredServices
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
  resetDrive() {
    this.__createdIds.clear();
    this.__allowedIds.clear();
    return this;
  }
  resetGmail() {
    this.__createdGmailIds.clear();
    this.__allowedGmailIds.clear();
    return this;
  }
  resetCalendar() {
    this.__createdCalendarIds.clear();
    this.__allowedCalendarIds.clear();
    return this;
  }
  reset() {
    this.resetDrive();
    this.resetGmail();
    this.resetCalendar();
    return this;
  }
  addFile(id, force = false) {
    if (!is.nonEmptyString(id)) {
      throw new Error(`Invalid sandbox id parameter (${id}) - must be a non-empty string`);
    }
    if (this.sandboxMode || force) {
      this.__createdIds.add(id);
      if (!this.__allowedIds.has(id)) {
        slogger.log(`...adding file ${id} to sandbox allowed list`);
        this.__allowedIds.add(id);
      }
    }
    return id
  }
  addGmailId(id, force = false) {
    if (!is.nonEmptyString(id)) {
      throw new Error(`Invalid sandbox id parameter (${id}) - must be a non-empty string`);
    }
    if (this.sandboxMode || force) {
      this.__createdGmailIds.add(id);
      if (!this.__allowedGmailIds.has(id)) {
        slogger.log(`...adding gmail id ${id} to sandbox allowed list`);
        this.__allowedGmailIds.add(id);
      }
    }
    return id
  }
  addCalendarId(id, force = false) {
    if (!is.nonEmptyString(id)) {
      throw new Error(`Invalid sandbox id parameter (${id}) - must be a non-empty string`);
    }
    if (this.sandboxMode || force) {
      this.__createdCalendarIds.add(id);
      if (!this.__allowedCalendarIds.has(id)) {
        slogger.log(`...adding calendar id ${id} to sandbox allowed list`);
        this.__allowedCalendarIds.add(id);
      }
    }
    return id
  }
  isAccessible(id, serviceName, accessType = 'read') {
    if (!is.nonEmptyString(id)) {
      throw new Error(`API call to ${serviceName} failed with error: Invalid argument: id`);
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
    let trashed = [];
    const wasSandbox = this.sandboxMode;
    this.sandboxMode = false;
    try {
      // Drive cleanup
      if (this.__cleanup) {
        trashed = Array.from(this.__createdIds).reduce((acc, id) => {
          let d = null
          try {
            d = DriveApp.getFileById(id)
          } catch (e) {
            d = DriveApp.getFolderById(id)
          }
          if (d) {
            d.setTrashed(true);
            slogger.log(`...trashed file ${d.getName()} (${id})`);
            acc.push(id);
          }
          return acc;
        }, []);
        this.__createdIds.clear();
        this.__allowedIds.clear();
      } else {
        slogger.log('...skipping cleaning up sandbox files (Drive)');
      }

      // Clean up Gmail artifacts
      let trashedGmail = [];
      const gmailSettings = this.sandboxService.GmailApp;
      const gmailCleanup = gmailSettings && gmailSettings.cleanup; // This will return true/false (inherits or specific)

      if (gmailCleanup) {
        trashedGmail = Array.from(this.__createdGmailIds).reduce((acc, id) => {
          try {
            // Try as label
            Gmail.Users.Labels.remove('me', id);
            slogger.log(`...deleted gmail label ${id}`);
            acc.push(id);
            return acc;
          } catch (e) { /* not a label or failed */ }

          try {
            // Try as thread - move to trash
            Gmail.Users.Threads.trash('me', id);
            slogger.log(`...trashed gmail thread ${id}`);
            acc.push(id);
            return acc;
          } catch (e) { /* not a thread */ }

          try {
            Gmail.Users.Messages.trash('me', id);
            slogger.log(`...trashed gmail message ${id}`);
            acc.push(id);
            return acc;
          } catch (e) { /* not a message */ }

          return acc;
        }, []);
        this.__createdGmailIds.clear();
        this.__allowedGmailIds.clear();
      } else {
        slogger.log('...skipping cleaning up sandbox files (Gmail)');
      }

      // Clean up Calendar artifacts
      let trashedCalendars = [];
      const calendarSettings = this.sandboxService.CalendarApp;
      const calendarCleanup = calendarSettings && calendarSettings.cleanup;

      if (calendarCleanup) {
        trashedCalendars = Array.from(this.__createdCalendarIds).reduce((acc, id) => {
          try {
            // Delete calendar
            Calendar.Calendars.delete(id, { noLog404: true });
            slogger.log(`...deleted calendar ${id}`);
            acc.push(id);
          } catch (e) {
            slogger.log(`...failed to delete calendar ${id}: ${e.message}`);
          }
          return acc;
        }, []);
        this.__createdCalendarIds.clear();
        this.__allowedCalendarIds.clear();
      } else {
        slogger.log('...skipping cleaning up sandbox calendars');
      }

      slogger.log(`...trashed ${trashed.length} sandboxed files, ${trashedGmail.length} gmail items, and ${trashedCalendars.length} calendars`);
    } finally {
      this.sandboxMode = wasSandbox;
    }
    return trashed;
  }
  isKnown(id) {
    return this.__allowedIds.has(id);
  }
  isKnownGmail(id) {
    return this.__allowedGmailIds.has(id);
  }
  isKnownCalendar(id) {
    return this.__allowedCalendarIds.has(id);
  }
}
