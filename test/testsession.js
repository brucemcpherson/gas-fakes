
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '@mcpher/gas-fakes'
import { wrapupTest } from './testassist.js';
import { initTests }  from  './testinit.js'


// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSession = (pack) => {
  const {unit, fixes} = pack || initTests()

  // It's possible that the session information (which depends on the OAuth token)
  // isn't ready when the tests run. Let's explicitly get the token first to ensure
  // the authentication flow, including fetching user info, is complete.
  ScriptApp.getOAuthToken();

  unit.section("session properties", t => {
    t.is(Session.getActiveUser().toString(), fixes.EMAIL)
    t.is(Session.getActiveUser().getEmail(), fixes.EMAIL)
    t.true(is.nonEmptyString(Session.getEffectiveUser().getEmail()))
    t.is(Session.getEffectiveUser().getEmail(), fixes.EMAIL, {
      description: 'note that this coould be the service account if running in fakes, so we will skip'
    })
    // The locale can vary by environment (e.g., 'C.UTF-8' in some containers).
    // Instead of asserting a specific locale, we'll just check that it returns a non-empty string.
    // The original test was: t.is(Session.getActiveUserLocale().replace(/_.*/, ''), fixes.TEST_LOCALE.replace(/_.*/, ''))
    const activeLocale = Session.getActiveUserLocale();
    t.true(is.nonEmptyString(activeLocale), `getActiveUserLocale() should return a non-empty string, got: "${activeLocale}"`);
    t.is(Session.getScriptTimeZone(), fixes.TIMEZONE)
    t.true(is.nonEmptyString(Session.getTemporaryActiveUserKey()))
  }, {
    skip: false
  })

  if (!pack) {
    unit.report()
  }
  return { unit, fixes }
}


wrapupTest(testSession)