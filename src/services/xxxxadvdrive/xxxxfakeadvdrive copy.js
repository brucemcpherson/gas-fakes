/**
 * Advanced drive service
 */
import { Proxies } from '../../support/proxies.js'
import { notYetImplemented } from '../../support/constants.js'
import { getAuthedClient } from '../drive/drapis.js'
import { Syncit } from '../../support/syncit.js'
import is from '@sindresorhus/is'


class FakeAdvDrive {
  constructor() {
    this.client = Proxies.guard(getAuthedClient())
  }
  toString() {
    return `AdvancedServiceIdentifier{name=drive, version=v3}`
  }
  getVersion() {
    return 'v3'
  }
  get Files() {
    return newFakeAdvDriveFiles(this)
  }
  get About() {
    return newFakeAdvDriveAbout(this)
  }
  get Accessproposals() {
    return notYetImplemented
  }
  get Apps() {
    return notYetImplemented
  }
  get Changes() {
    return notYetImplemented
  }
  get Channels() {
    return notYetImplemented
  }
  get Comments() {
    return notYetImplemented
  }
  get Drives() {
    return notYetImplemented
  }
  get Operations() {
    return notYetImplemented
  }
  get Permissions() {
    return notYetImplemented
  }
  get Replies() {
    return notYetImplemented
  }
  get Revisions() {
    return notYetImplemented
  }
  get Teamdrives() {
    return notYetImplemented
  }

}

class FakeAdvDriveAbout {
  constructor(drive) {
    this.toString = drive.toString
  }

  // this is a schema and needs the fields parameter
  get() {
    return notYetImplemented
  }
}



class FakeAdvDriveFiles {
  constructor(drive) {
    this.drive = drive
    const name = 'Drive.Files'
    const apiProp = 'files'
    // there's an adjustment needed between adv service args, and node for some props
    const fixArgs = (prop, args) => {
      switch (prop) {
        case 'get':
          return {
            fileId: args[0]
          }
        default:
          return args
      }
    }
    // actually we want a proxy to handle this because we need a syncit
    const self = this

    return new Proxy(self, {
      get(target, prop) {
        console.log('going for', name, prop, typeof prop)
        // this will let the caller know we're not really running in Apps Script 
        if (prop === 'isFake') return true

        // tostring generates one of these
        if (typeof prop === 'symbol') return Reflect.get(target, prop)

        // if this is a known prop, then we don't need to convert yto sync, or it doesnt exist in Drive.file
        if (Reflect.has(target, prop)) return Reflect.get(target, prop)

        // so now we just need to flip to the api
        console.log('going to proxy for', prop)

        // we'll need an apply proxy if its a function
        const ob = Reflect.get(drive.client.files, prop)

        if (is.function(ob)) {
          return new Proxy(ob, {
            apply(target, _, args) {
              console.log('applying prop', args)
              return Syncit.fxDrive({ prop: apiProp, method: prop, params: fixArgs(prop, args) })
            }
          })
        } else {
          return ob
        }
      },

      set(_, prop, value) {
        // private props are indicated with a leading __ so are allowed
        if (prop.substring(0, 2) === '__') return Reflect.set(getApp(), prop, value)
        throw new Error(`setting values directly in ${name}.${prop} is not allowed`)
      }

    })
  }

  toString() {
    return this.drive.toString()
  }

  listLabels() {
    return notYetImplemented
  }

  emptyTrash() {
    return notYetImplemented
  }

  update() {
    return notYetImplemented
  }

  list() {
    return notYetImplemented
  }
  remove() {
    return notYetImplemented
  }

  download() {
    return notYetImplemented
  }

  modifyLabels() {
    return notYetImplemented
  }

  watch() {
    return notYetImplemented
  }

  /**
   * get file by Id
   * @param {string} id 
   * @returns {Drive.File}
   */
  //get(id) {
  //  const file = getFileById({ id, baseFields: minFieldsAdv })
  //  return file
  //}

  create() {
    return notYetImplemented
  }

  generateIds() {
    return notYetImplemented
  }

  copy() {
    return notYetImplemented
  }

  export() {
    return notYetImplemented
  }

}

const newFakeAdvDriveFiles = (...args) => Proxies.guard(new FakeAdvDriveFiles(...args))
const newFakeAdvDriveAbout = (...args) => Proxies.guard(new FakeAdvDriveAbout(...args))
export const xxxnewFakeAdvDrive = (...args) => Proxies.guard(new FakeAdvDrive)



/* methods to implement
toString: [Function],
  getVersion: [Function],
  newTeamDriveRestrictions: [Function],
  newTeamDrive: [Function],
  newLabelFieldModification: [Function],
  newFileImageMediaMetadataLocation: [Function],
  newRevision: [Function],
  newComment: [Function],
  newFile: [Function],
  newContentRestriction: [Function],
  newDrive: [Function],
  newDriveCapabilities: [Function],
  newFileVideoMediaMetadata: [Function],
  newDriveBackgroundImageFile: [Function],
  newResolveAccessProposalRequest: [Function],
  newFileLabelInfo: [Function],
  newTeamDriveBackgroundImageFile: [Function],
  newFileContentHints: [Function],
  newPermission: [Function],
  newFileLinkShareMetadata: [Function],
  newFileImageMediaMetadata: [Function],
  newFileCapabilities: [Function],
  newCommentQuotedFileContent: [Function],
  newReply: [Function],
  newFileContentHintsThumbnail: [Function],
  newModifyLabelsRequest: [Function],
  newUser: [Function],
  newLabel: [Function],
  newDownloadRestriction: [Function],
  newLabelModification: [Function],
  newPermissionPermissionDetails: [Function],
  newDriveRestrictions: [Function],
  newPermissionTeamDrivePermissionDetails: [Function],
  newFileShortcutDetails: [Function],
  newChannel: [Function],
  newTeamDriveCapabilities: [Function],
  About: { toString: [Function], get: [Function] },




  Accessproposals: 
   { toString: [Function],
     resolve: [Function],
     get: [Function],
     list: [Function] },
  Apps: { toString: [Function], get: [Function], list: [Function] },
  Changes: 
   { toString: [Function],
     getStartPageToken: [Function],
     watch: [Function],
     list: [Function] },
  Channels: { toString: [Function], stop: [Function] },
  Comments: 
   { toString: [Function],
     get: [Function],
     create: [Function],
     update: [Function],
     list: [Function],
     remove: [Function] },
  Drives: 
   { toString: [Function],
     hide: [Function],
     get: [Function],
     create: [Function],
     update: [Function],
     list: [Function],
     remove: [Function],
     unhide: [Function] },
  Files: 
   { toString: [Function],
     listLabels: [Function],
     emptyTrash: [Function],
     update: [Function],
     list: [Function],
     remove: [Function],
     download: [Function],
     modifyLabels: [Function],
     watch: [Function],
     get: [Function],
     create: [Function],
     generateIds: [Function],
     copy: [Function],
     export: [Function] },
  Operations: 
   { toString: [Function],
     cancel: [Function],
     get: [Function],
     list: [Function],
     remove: [Function] },
  Permissions: 
   { toString: [Function],
     get: [Function],
     create: [Function],
     update: [Function],
     list: [Function],
     remove: [Function] },
  Replies: 
   { toString: [Function],
     get: [Function],
     create: [Function],
     update: [Function],
     list: [Function],
     remove: [Function] },
  Revisions: 
   { toString: [Function],
     get: [Function],
     update: [Function],
     list: [Function],
     remove: [Function] },
  Teamdrives: 
   { toString: [Function],
     get: [Function],
     create: [Function],
     update: [Function],
     list: [Function],
     remove: [Function] } }
*/
