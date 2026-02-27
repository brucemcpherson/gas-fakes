import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog } from '../../support/workersync/synclogger.js'
let __client = null;
let __authClient = null;

export const getDriveApiClient = () => {
  const auth = Auth.getAuth(); // Now returns the patched AuthClient instance
  
  if (!__client || auth !== __authClient) {
    // syncLog('Creating new Drive API client');
    // The Drive SDK sees a standard AuthClient and uses its (hijacked) getAccessToken
    __client = google.drive({ version: 'v3', auth });
    __authClient = auth;
  }
  return __client;
}