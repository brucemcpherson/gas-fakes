/**
 * DOCS
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */
import { sxRetry } from './sxretry.js';
import { getDocsApiClient } from '../services/advdocs/docapis.js';

/**
 * sync a call to docs api
 * @param {object} Auth the auth object
 * @param {object} p pargs
 * @param {string} p.prop the prop of docs eg 'documents' for docs.documents
 * @param {string} p.method the method of docs eg 'get' for docs.documents.get
 * @param {object} p.params the params to add to the request
 * @param {object} p.options gaxios options
 * @return {import('./sxdrive.js').SxResult} from the Docs api
 */
export const sxDocs = async (Auth, { prop, method, params, options = {} }) => {

  const apiClient = getDocsApiClient();
  const tag = `sxDocs for ${prop}.${method}`;

  return sxRetry(Auth, tag, async () => {
    return apiClient[prop][method](params, options);
  });
};