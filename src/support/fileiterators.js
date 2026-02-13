import { Utils } from './utils.js'
import { newPeeker } from './peeker.js'

const { assert } = Utils

// we can get all the permissions - need iterate in case theres more than a page (unlikely)
export const getPermissionIterator = ({
  id

}) => {

  assert.string(id)

  /**
 * this generator will get chunks of matching permissions for a given file
 * and yield them 1 by 1 and handle paging if required
 */
  function* permissionsInk() {
    // the result tank
    let tank = []
    // the next page token
    let pageToken = null

    do {
      // if nothing in the tank, fill it upFdrive
      if (!tank.length) {
        const data = Drive.Permissions.list(id, { fields: "nextPageToken,permissions(id,role,type,emailAddress,photoLink,domain,displayName,allowFileDiscovery)" })
        const { permissions, nextPageToken } = data

        // the presence of a nextPageToken is the signal that there's more to come
        pageToken = nextPageToken

        // format the results into the folder or file object
        tank = permissions
      }

      // if we've got anything in the tank send back the oldest one
      if (tank.length) {
        yield tank.splice(0, 1)[0]
      }

      // if there's still anything left in the tank, 
      // or there's a page token to get more continue
    } while (pageToken || tank.length)
  }
  // create the iterator
  const fileit = permissionsInk()

  // a regular iterator doesnt support the same methods 
  // as Apps Script so we'll fake that too
  return newPeeker(fileit)
}
