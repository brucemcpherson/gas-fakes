import { newFakeUser } from '../common/fakeuser.js'
import { Proxies } from '../../support/proxies.js'
import { Syncit } from '../../support/syncit.js'
import { Auth } from '../../support/auth.js'
class FakeSession {
  constructor() {
    // Active user is the impersonated user (the one we're acting as)
    this._activeUser = newFakeUser(Syncit.fxGetAccessTokenInfo().tokenInfo)
    // Effective user is also the impersonated user in this context
    this._effectiveUser = newFakeUser(Syncit.fxGetAccessTokenInfo().tokenInfo)
  }
  getActiveUser() {
    return this._activeUser
  }
  /**
   * there's no difference between active/effective on node
   * @returns {string}
   */
  getEffectiveUser() {
    return this._effectiveUser
  }
  /**
   * @returns {string}
   */
  getActiveUserLocale() {
    const lang =
      process.env.LANG ||
      process.env.LANGUAGE ||
      process.env.LC_ALL ||
      process.env.LC_MESSAGES ||
      (function () {
        try {
          return Intl.DateTimeFormat().resolvedOptions().locale
        } catch (e) {
          return 'en'
        }
      })() ||
      'en'
    // it'll be a format like en_US.UTF-8 so we need to drop the encoding to be like apps script
    return lang.split(/[._-]/)[0]
  }
  /**
   * this'll come from the manifest on Node (on Apps Script it'll be where the user is running from)
   * it's the same as the timezone
   * @returns {string}
   */
  getScriptTimeZone() {
    return Auth.getTimeZone()
  }
  /**
   * this'll be an encrypted user ID - same as the one used for property/cache stores identification
   * it's the same as the timezone
   * @returns {string}
   */
  getTemporaryActiveUserKey() {
    return Auth.getHashedUserId()
  }
}

export const newFakeSession = (...args) => Proxies.guard(new FakeSession(...args))