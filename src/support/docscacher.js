/**
 * avoid going to api if we already have it
 * anything other than a get should jusr delete the whiole map for the spreadsheet
 */
const USE_CACHE = true
import { newFetchCacher } from "./fetchcacher.js"
export const docsCacher = newFetchCacher(USE_CACHE)

