/**
 * avoid going to api if we already have it
 * anything other than a get should just delete the whole map for the resource
 */
const USE_CACHE = true;
import { newFetchCacher } from "./fetchcacher.js";
export const bigqueryCacher = newFetchCacher(USE_CACHE);
