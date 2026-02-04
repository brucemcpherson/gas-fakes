/**
 * SHEETS
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */

import { sxRetry } from './sxretry.js';
import { getSheetsApiClient } from '../services/advsheets/shapis.js';

export const sxSheets = async (Auth, { subProp, prop, method, params, options }) => {

  const apiClient = getSheetsApiClient();
  const tag = `sxSheets for ${prop}.${method}`;

  return sxRetry(Auth, tag, async () => {
    const callish = subProp ? apiClient[prop][subProp] : apiClient[prop];
    return callish[method](params, options);
  });
};