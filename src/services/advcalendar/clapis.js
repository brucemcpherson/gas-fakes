import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog } from '../../support/workersync/synclogger.js'

let __client = null;
let __authClient = null;
syncLog('...importing Calendar API');
export const getCalendarApiClient = () => {
  const auth = Auth.getAuthClient();
  if (!__client || auth !== __authClient) {
    syncLog('Creating new Calendar API client');
    __client = google.calendar({ version: 'v3', auth });
    __authClient = auth;
  }
  return __client;
}
