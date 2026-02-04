import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog } from '../../support/workersync/synclogger.js'

let __client = null;
let __authClient = null;
syncLog('...importing Slides API');
export const getSlidesApiClient = () => {
  const auth = Auth.getAuthClient()
  if (!__client || auth !== __authClient) {
    syncLog('Creating new Slides API client');
    __client = google.slides({ version: 'v1', auth });
    __authClient = auth;
  }
  return __client;
}