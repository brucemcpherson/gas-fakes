import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog } from '../../support/workersync/synclogger.js'
let __client = null;
let __authClient = null;

export const getGmailApiClient = () => {
  const auth = Auth.getAuth(); 
  
  if (!__client || auth !== __authClient) {
    // syncLog('Creating new Gmail API client');
    __client = google.gmail({ version: 'v1', auth });
    __authClient = auth;
  }
  return __client;
}