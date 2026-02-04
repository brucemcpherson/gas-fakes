import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog } from '../../support/workersync/synclogger.js'

let __client = null;
let __authClient = null;
syncLog('...importing Sheets API');
export const getSheetsApiClient = () => {
  const auth = Auth.getAuthClient()
  if (!__client || auth !== __authClient) {
    syncLog('Creating new Sheets API client');
    __client = google.sheets({ version: 'v4', auth });
    __authClient = auth;
  }
  return __client;
}