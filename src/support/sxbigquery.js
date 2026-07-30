/**
 * BIGQUERY
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */

import { sxRetry } from './sxretry.js';
import { getBigQueryApiClient } from '../services/advbigquery/bqapis.js';

/**
 * sync a call to BigQuery api
 * @param {object} Auth the auth object
 * @param {object} p pargs
 * @param {string} p.prop the prop of bigquery eg 'datasets' or 'jobs'
 * @param {string} p.method the method of bigquery eg 'list', 'get', 'insert', etc.
 * @param {object} p.params the params to add to the request
 * @param {object} p.options gaxios options
 * @return {import('./sxdrive.js').SxResult} from the BigQuery api
 */
export const sxBigQuery = async (Auth, { prop, method, params, options = {} }) => {

  const apiClient = getBigQueryApiClient();
  const tag = `sxBigQuery for ${prop}.${method}`;

  const { noLog404, ...validParams } = params || {};

  return sxRetry(Auth, tag, async () => {
    return apiClient[prop][method](validParams, options);
  }, {
    skipLog: (error, response) => {
      if (noLog404 && (response?.status === 404 || error?.code === 404 || response?.status === 400 || error?.code === 400)) {
        return true;
      }
      return false;
    }
  });
};
