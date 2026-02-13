/**
 * a File type returned from the json api with my default fields applied
 * there could be others if custom fields are returned
 * @typedef File
 * @property {string} id the id
 * @property {string} name the name
 * @property {string} mimeType the mimetype
 * @property {string[]} parents ids of parents
 */

import is from '@sindresorhus/is';
import { isFolder, notYetImplemented, isFakeFolder, signatureArgs } from '../../support/helpers.js'
import { Access, Permission } from '../enums/driveenums.js'
import { getParentsIterator } from './driveiterators.js';
import { getPermissionIterator } from '../../support/fileiterators.js';
import { improveFileCache } from "../../support/filecache.js"
import { getSharers } from '../../support/filesharers.js';
import { slogger } from "../../support/slogger.js";
/**
 * basic fake File meta data
 * these are shared between folders and files
 * @class FakeDriveMeta
 * @returns {FakeDriveMeta}
 */
export class FakeDriveMeta {
  /**
   * 
   * @constructor 
   * @param {File} meta data from json api
   * @returns {FakeDriveMeta}
   */
  constructor(meta) {
    this.meta = meta
    this.__gas_fake_service = "DriveApp"
  }

  __preventRootDamage = (operation) => {
    if (this.__isRoot) {
      slogger.error(`Can't do ${operation} on root folder`)
      throw new Error("Access denied: DriveApp")
    }
  }
  get __isRoot() {
    const parents = this.__getDecorated("parents")
    return is.null(parents)
  }
  /**
   * for enhancing the file with fields not retrieved by default
   * @param {string} fields='' the required fields
   * @return {FakeDriveMeta} self
   */
  __decorateWithFields(fields) {
    // if we already have it nothing needed
    if (!is.nonEmptyString(fields)) {
      throw new Error('decorate fields was not a non empty string')
    }
    const sf = fields.split(",")
    if (sf.every(f => Reflect.has(this.meta, f))) {
      return this
    }

    const newMeta = Drive.Files.get(this.getId(), { fields }, { allow404: false })
    // need to merge this with already known fields
    this.meta = { ...this.meta, ...newMeta }
    improveFileCache(this.getId(), this.meta, fields)
    return this
  }

  /**
   * this will return the type DriveApp.Folder or DriveApp.File
   * return {string}
   */
  __getFakeType() {
    return isFolder(this.meta) ? "DriveApp.Folder" : "DriveApp.File"
  }
  /**
   * the meta data for the following fields are not fetched by default
   */
  __getDecorated(prop) {
    return this.__decorateWithFields(prop).meta[prop]
  }

  /** 
   * __updateMeta - used to set simple felds using update
   * @param {string} prop the meta data to set
   * @param {*} value what to set it to
   * @param {string} type whhat type it should be
   * @param {object} args array like item with what was passed to the original function
   * @returns this self
   */
  __updateMeta(prop, value, type, ...args) {

    // cant update any meta on root folder
    this.__preventRootDamage(`set ${prop}`)
    const { matchThrow } = signatureArgs(arguments, "update")

    if (!is[type](value)) {
      matchThrow()
    }
    const file = {}
    file[prop] = value

    const data = Drive.Files.update(file, this.getId(), null, prop)
    this.meta = { ...this.meta, ...data }
    improveFileCache(this.getId(), data)

    return this
  }

  // shared between folder and file
  toString() {
    return this.getName()
  }

  /**
   * get the file id
   * @returns {string} the file id
   */
  getId() {
    return this.__getDecorated("id")
  }

  /**
   * get the file name
   * @returns {string} the file name
   */
  getName() {
    return this.__getDecorated("name")
  }

  isStarred() {
    return this.__getDecorated("starred")
  }

  isTrashed() {
    return this.__getDecorated("trashed")
  }

  getLastUpdated() {
    return new Date(this.__getDecorated("modifiedTime"))
  }

  getDescription() {
    // the meta can be undefined so return null
    const d = this.__getDecorated("description")
    return is.undefined(d) ? null : d
  }

  getDateCreated() {
    return new Date(this.__getDecorated("createdTime"))
  }
  getSize() {
    // the meta is actually a string so convert
    const d = parseInt(this.__getDecorated("size"), 10)
    // folders dont return a size
    return isNaN(d) ? 0 : d
  }

  /**
   * get the ids of the parents
   * @returns {string[]} the file parents
   */
  getParents() {
    this.__decorateWithFields("parents")
    return getParentsIterator({ file: this.meta })
  }

  /**
   * get the file owner
   * @returns {FakeUser} the file owner
   */
  getOwner() {
    const sharers = getSharers(this.getId(), 'owner')
    if (sharers.length !== 1) throw new Error('couldnt find single owner for ${this.getId()} ${this.getName()}')
    return sharers[0]
  }


  /**
   * get the file viewers
   * @returns {FakeUser} the file viewers
   */
  getViewers() {
    return getSharers(this.getId(), 'reader')
  }

  /**
   * get the file editors
   * @returns {FakeUser} the file editors
   */
  getEditors() {
    return getSharers(this.getId(), 'writer')
  }

  /**
   * get the file url
   * @returns {string} the webviewlink
   */
  getUrl() {
    return this.__getDecorated("webViewLink")
  }

  /**
   * moves a file to a mew destination
   * @param {FakeDriveFolder} destination
   * @returns self for chaining
   */
  moveTo(destination) {
    // prepare for any arg errors
    const { matchThrow } = signatureArgs(arguments, "moveTo", "DriveApp.Folder")

    if (!isFakeFolder(destination)) {
      matchThrow()
    }
    // pick up parents for destination if not already known
    const newParent = destination.getId()
    if (!is.nonEmptyString(newParent)) {
      throw new Error(`expected to find destination id as a string but got ${newParent}`)
    }

    // cant move the root folder
    this.__preventRootDamage("move")

    // we cant just fix the resource parents, we have to add and remove
    // so that's a 2 step
    const params = {
      addParents: newParent,
      removeParents: this.__getDecorated("parents")[0]
    }

    // need to make sure we get the new parents field back to improve cache with
    const data = Drive.Files.update({}, this.getId(), null, "parents", params)

    // merge this with already known fields and improve cache   
    this.meta = { ...this.meta, ...data }

    improveFileCache(this.getId(), this.meta)
    return this

  }

  /**
   * @param {string} value the updated value
   * @returns {FakeDriveFile|FakeDriveFolder} this self
   */
  setDescription(value) {
    return this.__updateMeta("description", value, "string", arguments)
  }

  /**
   * @param {string} value the updated value
   * @returns {FakeDriveFile|FakeDriveFolder} this self
   */
  setName(value) {
    return this.__updateMeta("name", value, "string", arguments)
  }

  /**
   * Sets whether users with edit permissions to the Folder are allowed to share with other users or change the permissions. 
   * @param {boolean} value the updated value
   * @returns {FakeDriveFile|FakeDriveFolder} this self
   */
  setShareableByEditors(value) {
    return this.__updateMeta("writersCanShare", value, "boolean", arguments)
  }

  /**
   * Sets the sharing permission and access for the Folder/File.
   * @param {import('../enums/driveenums.js').Access} access the access level
   * @param {import('../enums/driveenums.js').Permission} permission the permission level
   * @returns {FakeDriveFile|FakeDriveFolder} this self
   */
  setSharing(access, permission) {
    const { nargs, matchThrow } = signatureArgs(arguments, "setSharing");
    if (nargs !== 2) matchThrow();

    // Mapping Appsscript Access/Permission to Drive API role/type
    // This is a simplified version, as setSharing usually affects "anyone" or "domain" permissions.
    // In Drive API v3, it involves managing permissions with types 'anyone' or 'domain'.

    // 1. Determine type based on access
    let type;
    let role;
    let allowFileDiscovery = false;

    if (access === Access.ANYONE || access === Access.ANYONE_WITH_LINK) {
      type = 'anyone';
      allowFileDiscovery = (access === Access.ANYONE);
    } else if (access === Access.DOMAIN || access === Access.DOMAIN_WITH_LINK) {
      type = 'domain';
      allowFileDiscovery = (access === Access.DOMAIN);
    } else if (access === Access.PRIVATE) {
      // For PRIVATE, we typically remove any 'anyone' or 'domain' permissions.
      const { permissions } = Drive.Permissions.list(this.getId());
      permissions.forEach(p => {
        if (p.type === 'anyone' || p.type === 'domain') {
          Drive.Permissions.delete(this.getId(), p.id);
        }
      });
      return this;
    }

    // 2. Determine role based on permission
    if (permission === Permission.VIEW || permission === Permission.READ) {
      role = 'reader';
    } else if (permission === Permission.COMMENT) {
      role = 'commenter';
    } else if (permission === Permission.EDIT) {
      role = 'writer';
    } else {
      throw new Error(`Unsupported permission level for setSharing: ${permission}`);
    }

    // 3. Find existing permission of this type or create new
    const { permissions } = Drive.Permissions.list(this.getId(), {
      fields: "permissions(id,role,type,allowFileDiscovery,domain)"
    });
    const existing = permissions.find(p => p.type === type);

    if (existing) {
      // If the identity fields (type, allowFileDiscovery, domain) have changed, we must delete and recreate
      const domain = type === 'domain' ? Session.getActiveUser().getDomain() : undefined;
      const identityChanged = existing.allowFileDiscovery !== allowFileDiscovery ||
        (type === 'domain' && existing.domain !== domain);

      if (identityChanged) {
        Drive.Permissions.delete(this.getId(), existing.id);
        const resource = { role, type, allowFileDiscovery };
        if (type === 'domain') resource.domain = domain;
        Drive.Permissions.create(resource, this.getId());
      } else {
        // Only role is writable in update
        Drive.Permissions.update({ role }, this.getId(), existing.id);
      }
    } else {
      const resource = { role, type, allowFileDiscovery };
      if (type === 'domain') resource.domain = Session.getActiveUser().getDomain();
      Drive.Permissions.create(resource, this.getId());
    }

    improveFileCache(this.getId(), null);
    return this;
  }

  /**
   * Determines whether users with edit permissions to the Folder/File are allowed to share with other users or change the permissions
   * @returns {Boolean}
   */
  isShareableByEditors() {
    return this.__getDecorated("writersCanShare")
  }

  /**
   * Sets whether the Folder/File is starred in the user's Drive. 
   * @param {boolean} value the updated value
   * @returns {FakeDriveFile|FakeDriveFolder} this self
   */
  setStarred(value) {
    return this.__updateMeta("starred", value, "boolean", arguments)
  }

  /**
   * Whether the file has been trashed, either explicitly or from a trashed parent folder
   * @param {boolean} value the updated value
   * @returns {FakeDriveFile|FakeDriveFolder} this self
   */
  setTrashed(value) {
    this.__preventRootDamage("trash")
    return this.__updateMeta("trashed", value, "boolean", arguments)
  }

  __managePermissions(emails, role, add = true) {
    const emailAddresses = is.array(emails) ? emails : [emails];

    if (add) {
      // In Apps Script, this is not atomic. It just loops.
      emailAddresses.forEach(emailAddress => {
        const resource = { role, type: 'user', emailAddress };
        Drive.Permissions.create(resource, this.getId());
      });
    } else {
      // To remove, we need to find the permission ID for each email.
      const { permissions } = Drive.Permissions.list(this.getId(), {
        fields: 'permissions(id,role,emailAddress)'
      });

      emailAddresses.forEach(emailAddress => {
        const permission = permissions.find(p => p.emailAddress === emailAddress && p.role === role);
        if (permission) {
          Drive.Permissions.delete(this.getId(), permission.id);
        }
        // Apps Script doesn't throw an error if the user isn't found.
      });
    }

    // Invalidate cache for this file since permissions changed.
    improveFileCache(this.getId(), null);
    return this;
  }
  // TODO-----------

  getSharingPermission() {
    const pit = getPermissionIterator({ id: this.getId() });
    let highest = Permission.NONE;

    const rank = (p) => {
      if (p === Permission.OWNER) return 6;
      if (p === Permission.EDIT) return 5;
      if (p === Permission.COMMENT) return 4;
      if (p === Permission.VIEW || p === Permission.READ) return 3;
      return 0;
    }

    while (pit.hasNext()) {
      const p = pit.next();
      let current = Permission.NONE;
      if (p.type === 'anyone' || p.type === 'domain') {
        if (p.role === 'owner') current = Permission.OWNER;
        else if (p.role === 'writer') current = Permission.EDIT;
        else if (p.role === 'commenter') current = Permission.COMMENT;
        else if (p.role === 'reader') current = Permission.VIEW;

        if (rank(current) > rank(highest)) {
          highest = current;
        }
      }
    }
    return highest;
  }

  getSharingAccess() {
    const pit = getPermissionIterator({ id: this.getId() });
    let highest = Access.PRIVATE;

    const rank = (a) => {
      if (a === Access.ANYONE) return 4;
      if (a === Access.ANYONE_WITH_LINK) return 3;
      if (a === Access.DOMAIN) return 2;
      if (a === Access.DOMAIN_WITH_LINK) return 1;
      return 0;
    }

    while (pit.hasNext()) {
      const p = pit.next();
      let current = Access.PRIVATE;
      if (p.type === 'anyone') {
        current = p.allowFileDiscovery ? Access.ANYONE : Access.ANYONE_WITH_LINK;
      } else if (p.type === 'domain') {
        current = p.allowFileDiscovery ? Access.DOMAIN : Access.DOMAIN_WITH_LINK;
      }

      if (rank(current) > rank(highest)) {
        highest = current;
      }
    }
    return highest;
  }


  getResourceKey() {
    return notYetImplemented('getResourceKey')
  }

  getSecurityUpdateEligible() {
    return notYetImplemented('getSecurityUpdateEligible')
  }
  getSecurityUpdateEnabled() {
    return notYetImplemented('getSecurityUpdateEnabled')
  }
  setSecurityUpdateEnabled() {
    return notYetImplemented('setSecurityUpdateEnabled')
  }
  getAccess() {
    return notYetImplemented('getAccess')
  }


  revokePermissions() {
    return notYetImplemented('revokePermissions')
  }


  setOwner() {
    return notYetImplemented('setOwner')
  }

  addViewers() {
    const { nargs, matchThrow } = signatureArgs(arguments, "addViewers");
    const [emailAddresses] = arguments;
    if (nargs !== 1 || !is.array(emailAddresses) || !emailAddresses.every(is.string)) matchThrow();
    return this.__managePermissions(emailAddresses, 'reader', true);
  }

  addViewer() {
    const { nargs, matchThrow } = signatureArgs(arguments, "addViewer");
    const [emailAddress] = arguments;
    if (nargs !== 1 || !is.string(emailAddress)) matchThrow();
    return this.__managePermissions(emailAddress, 'reader', true);
  }

  removeEditor() {
    const { nargs, matchThrow } = signatureArgs(arguments, "removeEditor");
    const [emailAddress] = arguments;
    if (nargs !== 1 || !is.string(emailAddress)) matchThrow();
    return this.__managePermissions(emailAddress, 'writer', false);
  }

  addEditor() {
    const { nargs, matchThrow } = signatureArgs(arguments, "addEditor");
    const [emailAddress] = arguments;
    if (nargs !== 1 || !is.string(emailAddress)) matchThrow();
    return this.__managePermissions(emailAddress, 'writer', true);
  }

  removeViewer() {
    const { nargs, matchThrow } = signatureArgs(arguments, "removeViewer");
    const [emailAddress] = arguments;
    if (nargs !== 1 || !is.string(emailAddress)) matchThrow();
    return this.__managePermissions(emailAddress, 'reader', false);
  }

  addEditors() {
    const { nargs, matchThrow } = signatureArgs(arguments, "addEditors");
    const [emailAddresses] = arguments;
    if (nargs !== 1 || !is.array(emailAddresses) || !emailAddresses.every(is.string)) matchThrow();
    return this.__managePermissions(emailAddresses, 'writer', true);
  }
}
