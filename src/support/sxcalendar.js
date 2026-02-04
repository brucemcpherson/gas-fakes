/**
 * CALENDAR
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */

import { sxRetry } from './sxretry.js';
import { getCalendarApiClient } from '../services/advcalendar/clapis.js';

/**
 * sync a call to calendar api
 * @param {object} Auth the auth object
 * @param {object} p pargs
 * @param {string} p.prop the prop of calendar eg 'calendars' for calendar.calendars
 * @param {string} p.method the method of calendar eg 'get' for calendar.calendars.get
 * @param {object} p.params the params to add to the request
 * @param {object} p.options gaxios options
 * @return {import('./sxdrive.js').SxResult} from the Calendar api
 */
export const sxCalendar = async (Auth, { prop, method, params, options = {} }) => {

  const apiClient = getCalendarApiClient();
  const tag = `sxCalendar for ${prop}.${method}`;

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
