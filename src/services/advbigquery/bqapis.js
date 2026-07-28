import { google } from "googleapis";
import { Auth } from '../../support/auth.js';

let __client = null;
let __authClient = null;

export const getBigQueryApiClient = () => {
  const auth = Auth.getAuth(); 
  
  if (!__client || auth !== __authClient) {
    __client = google.bigquery({ version: 'v2', auth });
    __authClient = auth;
  }
  return __client;
};
