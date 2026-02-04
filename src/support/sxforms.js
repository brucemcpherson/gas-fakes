/**
 * FORMS
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */

import { sxRetry } from './sxretry.js';
import { getFormsApiClient } from '../services/advforms/formsapis.js';

export const sxForms = async (Auth, { prop, subProp, method, params, options = {} }) => {

  const apiClient = getFormsApiClient();
  const tag = `sxForms for ${prop}${subProp ? '.' + subProp : ''}.${method}`;

  return sxRetry(Auth, tag, async () => {
    // Access the base property (e.g., 'forms'), then the sub-property if it exists (e.g., 'responses').
    let callish = apiClient[prop];
    if (subProp) {
      callish = callish[subProp];
    }
    return callish[method](params, options);
  });
};