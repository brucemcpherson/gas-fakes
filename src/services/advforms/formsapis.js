import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog} from '../../support/workersync/synclogger.js'

let __client = null;

export const getFormsApiClient = () => {
  const auth = Auth.getAuth()
  if (!__client) {
    syncLog('Creating new Forms API client');
    __client = google.forms({ version: 'v1', auth });
  }
  return __client;
}

