import '@mcpher/gas-fakes'
import { initTests } from './testinit.js'
import { Syncit } from '../src/support/syncit.js'

export const testDwdRefresh = (pack) => {
  const { unit, fixes } = pack || initTests()

  unit.section('DWD token refresh simulation', t => {
    
    // This test only makes sense in the fake environment
    if (!ScriptApp.isFake) {
      t.true(true, 'Skipping DWD simulation in live Apps Script');
      return;
    }

    // We use fxTestRetry which we added to Syncit.
    // It calls sxTestRetry in the worker, which uses sxRetry.
    // sxTestRetry simulates a failure on the first call with the given error message.
    // TODO - this might not be the actual message that we'd get from the api in this scenario - next time we detect it happend then capture the message and update this and sxretry
    const errorMessage = 'No refresh token is set.';
    const result = Syncit.fxTestRetry(errorMessage);
    
    t.truthy(result.data, 'Result data should exist');
    t.is(result.data.success, true, 'Should have succeeded on retry');
    t.is(result.data.callCount, 2, 'Should have called the mock function twice (one failure, one success)');
    
  });
}

if (ScriptApp.isFake && process.argv.includes('execute')) {
  testDwdRefresh();
}
