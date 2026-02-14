
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '@mcpher/gas-fakes'
import { getUserIdFromToken } from '@mcpher/gas-flex-cache'
import { wrapupTest } from './testassist.js'
import { initTests } from './testinit.js'

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testStores = (pack) => {
  const { unit, fixes } = pack || initTests()

  unit.section("properties store", t => {
    const ps = {}
    const testKey = 't'

    t.is(typeof PropertiesService.getUserProperties, 'function')
    ps.up = PropertiesService.getUserProperties()

    t.is(typeof PropertiesService.getScriptProperties, 'function')
    ps.sp = PropertiesService.getScriptProperties()

    t.is(typeof PropertiesService.getDocumentProperties, 'function')
    ps.dp = PropertiesService.getDocumentProperties()

    if (ScriptApp.isFake) {
      const st = (process.env.STORE_TYPE || 'file').toUpperCase()
      t.is(PropertiesService.type, st, 'store should match store type in env')
    }

    const p = ['dp', 'sp', 'up']
    p.forEach(f => {
      const testValue = f + 'p'
      if (ps[f]) {
        ps[f].setProperty(testKey, testValue);
        t.is(ps[f].getProperty(testKey), testValue);
        // in apps script deleteProperty returns the object for chaining, but not always in the fake
        ps[f].deleteProperty(testKey);
        t.is(ps[f].getProperty(testKey), null);
        // check that we got the right thing from process if runing on node

      }
    })


  })


  unit.section("cache store", t => {
    const cs = {}
    const testKey = 't'

    t.is(typeof CacheService.getUserCache, 'function')
    cs.up = CacheService.getUserCache()

    t.is(typeof CacheService.getScriptCache, 'function')
    cs.sp = CacheService.getScriptCache()

    t.is(typeof CacheService.getDocumentCache, 'function')
    cs.dp = CacheService.getDocumentCache()


    if (ScriptApp.isFake) {
      const st = (process.env.STORE_TYPE || 'file').toUpperCase()
      t.is(CacheService.type, st, 'store should match store type in env')
    }

    const exValue = 'ex'
    const p = ['up', 'dp', 'sp'].slice(0, 1)
    p.forEach(f => {
      const testValue = f + 'c'
      if (cs[f]) {
        t.is(cs[f].put(testKey, testValue), null)
        t.is(cs[f].get(testKey), testValue)
        t.is(cs[f].remove(testKey), null)
        t.is(cs[f].put(testKey, exValue, 2), null)
      } else {
        t.is(cs[f], null)
      }
    })

    p.forEach(f => {
      if (cs[f]) {
        t.is(cs[f].get(testKey), exValue)
      }
    })
    Utilities.sleep(2000)
    p.forEach(f => {
      if (cs[f]) {
        t.is(cs[f].get(testKey), null)
      }
    })
  })

  /**
   * A generalized function to test cross-environment data sharing.
   * It writes data using gas-fakes (with Upstash backend) and reads it in the live Apps Script environment.
   * @param {object} t - The test assertion object from the unit tester.
   * @param {string} storeType - The type of store to test ('script' or 'user').
   */
  const doCrossStoreTest = (t, storeType) => {
    const inFake = PropertiesService.isFake;
    const isUserStore = storeType === 'user';

    // Define unique keys for each store type to avoid collisions
    const propsKey = `cross-props-${storeType}`;
    const cacheKey = `cross-cache-${storeType}`;
    const value = `value-for-${storeType}`;

    // --- FAKE ENVIRONMENT: Write data to Upstash ---
    if (inFake) {
      const props = isUserStore ? PropertiesService.getUserProperties() : PropertiesService.getScriptProperties();
      const cache = isUserStore ? CacheService.getUserCache() : CacheService.getScriptCache();

      // Check for Upstash configuration
      const isUpstash = PropertiesService.type === "UPSTASH";
      const scriptId = ScriptApp.getScriptId();
      const userId = isUserStore ? getUserIdFromToken(ScriptApp.getOAuthToken()) : null;

      if (isUpstash) {
        // Write properties and cache entries
        props.setProperty(propsKey, value);
        cache.put(cacheKey, value, 300); // 5-minute expiry

        t.is(props.getProperty(propsKey), value, `[fake] should write to ${storeType} properties`);
        t.is(cache.get(cacheKey), value, `[fake] should write to ${storeType} cache`);
      } else {
        console.log(`...[fake] skipping cross-store test for ${storeType} as STORE_TYPE is not UPSTASH (current: ${PropertiesService.type})`);
        t.skipFromHere = true
      }
    }
    // --- LIVE ENVIRONMENT: Read data from Upstash ---
    else { // !inFake
      const scriptProps = PropertiesService.getScriptProperties();
      const dope = scriptProps.getProperty("dropin_upstash_credentials");
      const crob = dope && JSON.parse(dope);

      if (crob) {
        const scriptId = ScriptApp.getScriptId();
        const userId = isUserStore ? getUserIdFromToken(ScriptApp.getOAuthToken()) : null;

        const creds = { ...crob, scriptId };
        if (isUserStore) {
          creds.userId = userId;
        }

        const props = newCacheDropin({ creds: { ...creds, kind: "property" } });
        const cache = newCacheDropin({ creds: { ...creds, kind: "cache" } });

        // Read and verify data written by the fake environment
        t.is(props.getProperty(propsKey), value, `[live] should read from ${storeType} properties written by fake`);
        t.is(cache.get(cacheKey), value, `[live] should read from ${storeType} cache written by fake`);

        // cleanup after live test
        props.deleteProperty(propsKey);
        cache.remove(cacheKey);
        t.is(props.getProperty(propsKey), null, `[live] property for ${storeType} should be deleted`);
        t.is(cache.get(cacheKey), null, `[live] cache for ${storeType} should be removed`);
      } else {
        t.fail('Upstash credentials not found in live Script Properties');
      }
    }
  };

  unit.section("cross-environment (script stores)", t => {
    doCrossStoreTest(t, 'script');
  });

  unit.section("cross-environment (user stores)", t => {
    doCrossStoreTest(t, 'user');
  })

  if (!pack) {
    unit.report()
  }

  return { unit, fixes }
}


wrapupTest(testStores)