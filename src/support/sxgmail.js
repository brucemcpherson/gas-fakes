/**
 * GMAIL
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */

import { sxRetry } from './sxretry.js';
import { getGmailApiClient } from '../services/advgmail/gmailapis.js';

export const sxGmail = async (Auth, { subProp, prop, method, params, options }) => {

  const apiClient = getGmailApiClient();
  const methodName = subProp ? `${prop}.${subProp}.${method}` : `${prop}.${method}`;
  const tag = `sxGmail for ${methodName}`;

  return sxRetry(Auth, tag, async () => {
    const callish = subProp ? apiClient[prop][subProp] : apiClient[prop];
    return callish[method](params, options);
  }, {
    skipLog: (error, response) => {
      // Don't log 404, 409, or 400 as an error. 
      // 400 (Invalid delete request) happens when we try to delete an ID as a label but it's not a label.
      return response?.status === 404 || response?.status === 409 || response?.status === 400;
    }
  });
};