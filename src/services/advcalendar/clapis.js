import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog } from '../../support/workersync/synclogger.js'

// syncLog('...importing Calendar API');
let __client = null;
let __authClient = null;

export const getCalendarApiClient = () => {
  const auth = Auth.getAuth(); 
  
  if (!__client || auth !== __authClient) {
    // syncLog('Creating new Calendar API client');
    __client = google.calendar({ version: 'v3', auth });
    __authClient = auth;
  }
  return __client;
}