import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog } from '../../support/workersync/synclogger.js'
let __client = null;
let __authClient = null;

export const getDocsApiClient = () => {
  const auth = Auth.getAuth(); 
  
  if (!__client || auth !== __authClient) {
    // syncLog('Creating new Docs API client');
    __client = google.docs({ version: 'v1', auth });
    __authClient = auth;
  }
  return __client;
}