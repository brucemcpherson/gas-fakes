/**
 * SLIDES
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */

import { sxRetry } from './sxretry.js';
import { getSlidesApiClient } from '../services/advslides/slapis.js';

/**
 * sync a call to slides api
 * @param {object} Auth the auth object
 * @param {object} p pargs
 * @param {string} p.prop the prop of slides eg 'presentations' for slides.presentations
 * @param {string} p.method the method of slides eg 'get' for slides.presentations.get
 * @param {object} p.params the params to add to the request
 * @param {object} p.options gaxios options
 * @return {import('./sxdrive.js').SxResult} from the Slides api
 */
export const sxSlides = async (Auth, { prop, method, params, options = {} }) => {

  const apiClient = getSlidesApiClient();
  const tag = `sxSlides for ${prop}.${method}`;

  return sxRetry(Auth, tag, async () => {
    return apiClient[prop][method](params, options);
  });
};