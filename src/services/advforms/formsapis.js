import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog } from '../../support/workersync/synclogger.js'

let __client = null;
let __authClient = null;

export const getFormsApiClient = () => {
  const auth = Auth.getAuthClient()
  if (!__client || auth !== __authClient) {
    syncLog('Creating new Forms API client');
    __client = google.forms({ version: 'v1', auth });
    __authClient = auth;
  }
  return __client;
}
