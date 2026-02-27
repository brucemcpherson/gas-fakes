

import is from '@sindresorhus/is';
import { assert } from '@sindresorhus/is'
import { slogger } from './slogger.js'

const isNU = (item) => is.null(item) || is.undefined(item)

const arrify = (item) => is.array(item)
  ? item
  : (isNU(item) ? item : [item])

const fromJson = (text, failOnError = false) => {
  try {
    return JSON.parse(text)
  } catch (err) {
    slogger.warn(text)
    if (failOnError) {
      throw err
    }
    return null
  }
}



const isBlob = (item) => is.object(item) && Reflect.has(item, "copyBlob") && is.function(item.copyBlob)

/**
 * merge a series of url params 
 * @param {object|object[]} pob an object eg [{pa:a,pb:b},{pc:c}] 
 * @returns {string} would return pa=a&pb=pb&pc=c and encoded URI
 */
const makeUrlParams = (pob) => {
  return makeParams(pob).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")
}
/**
 * merge a series of url params 
 * @param {object|object[]} pob an object eg [{pa:a,pb:b},{pc:c}] 
 * @returns {object} merged and dedupped paramaters reduced
 */
const makeParamOb = (pob) => {
  const a = makeParams(pob)
  return a.reduce((p, [k, v]) => {
    p[k] = v
    return p
  }, {})
}
/**
 * merge a series of url params 
 * @param {object|object[]} pob an object eg [{pa:a,pb:b},{pc:c}] 
 * @returns {object[]} merged and dedupped paramaters
 */
const makeParams = (pob = []) => {
  // dups will be removed
  const mapob = arrify(pob).reduce((p, c) => {
    Reflect.ownKeys(c).forEach(k => p.set(k, c[k]))
    return p
  }, new Map())
  return Array.from(mapob.entries())
}


const settleAsString = (data, charset) => {
  if (is.buffer(data)) {
    return bytesToString(Array.from(data), charset)
  } else if (is.array(data)) {
    return bytesToString(data, charset)
  } else {
    assert.string(data)
    return data
  }

}

const settleAsBytes = (data, charset) => {

  if (is.string(data)) {
    return stringToBytes(data, charset)
  } else if (is.buffer(data)) {
    return Array.from(data)
  } else {
    // Handle JSON representation of a Buffer
    if (is.object(data) && data.type === 'Buffer' && is.array(data.data)) {
      return data.data;
    }
    // Workaround for an issue where an array of bytes passed from a worker
    // can be deserialized as a plain object with numeric keys.
    if (is.object(data) && !is.array(data)) {
      const values = Object.values(data);
      // Check if the object's values look like a valid byte array.
      if (isByteArray(values)) return values;
    }
    if (!is.array(data)) slogger.log(`settleAsBytes: data is NOT an array. type: ${typeof data}, keys: ${Object.keys(data)}`);
    assert.array(data);
    return data;
  }

}

const stringToBytes = (string, charset) => Array.from(Buffer.from(string, charset))
const bytesToString = (data, charset) => Buffer.from(data).toString(charset)

const isByteArray = (arr) => {
  return Array.isArray(arr) && arr.every((n) => Number.isInteger(n) && n >= 0 && n <= 255);
}

/**
 * merge something like
 * sa = "a,b,f(x,y),g(a,b),h(h)"
 * sb = "c,b,f(x,z),h(h,i)"
 * into "a,b,f(x,y,z),g(a,b),h(h,i) 
 * @param  {...string} any number of other strings to merge 
 * @returns {string}
 */
export const mergeParamStrings = (...args) => {

  const enhanceMap = (str, itemMap = new Map()) => {
    // extract all the items with subfields
    const rxSubs = /([^,(]*)(?=\()\(([^)]*)\)/g
    /**
     * 	[ [ 'f(x,y)', 'f', 'x,y' ],
    [ 'g(a,b)', 'g', 'a,b' ],
    [ 'h(h)', 'h', 'h' ] ]
     */
    const subs = Array.from(str.matchAll(rxSubs))

    // there should be 3 groups for each member
    // for example fields(a,b) fields a,b  - we want to set up an map that looks like fields, "a,b"

    subs.forEach(match => {
      if (match.length !== 3) {
        throw new Error(`Invalid format for subfield ${JSON.stringify(match)}`)
      }
      const [_, key, items] = match
      if (!itemMap.has(key)) itemMap.set(key, new Set())
      const item = itemMap.get(key)
      assert.set(item)
      items.split(",").forEach(f => itemMap.get(key).add(f))
    })

    // there should be 2 groups for each member
    // for example foo  - we want a map item with key foo and value null
    const rxPlains = /(?<!\([^)]*),?([^,(]+)(?=(?:,|$)(?![^(]*\)))/g;
    const plains = Array.from(str.matchAll(rxPlains))

    plains.forEach(match => {
      if (match.length !== 2) {
        throw new Error(`Invalid format for field ${JSON.stringify(match)}`)
      }
      const [_, key] = match
      const item = itemMap.get(key)
      // because whether it exists or not it should be null otherwise its a conflict a set
      if (itemMap.has(key)) {
        assert.null(item)
      } else {
        itemMap.set(key, null)
      }
    })

    return itemMap
  }

  const itemMap = new Map()
  args.forEach(f => {
    assert.string(f)
    return enhanceMap(f.replace(/\s/g, ""), itemMap)
  })

  // now just convert that into a string
  return Array.from(itemMap.entries()).map(([key, value]) => {

    return is.null(value)
      ? key
      : `${key}(${Array.from(value.keys()).sort().join(",")})`
  }).sort().join(",")
}

/**
 * translated field names from v3 to v2
 * @param {string} fields a comma separated fields string 
 * @returns {string} the modified string
 */
export const translateFieldsToV2 = (fields) => {
  if (!is.string(fields)) return fields
  return fields
    .replace(/\bcreatedTime\b/g, 'createdDate')
    .replace(/\bmodifiedTime\b/g, 'modifiedDate')
}

const capital = (str) => str.substring(0, 1).toUpperCase() + str.substring(1)
const unCapital = (str) => str.substring(0, 1).toLowerCase() + str.substring(1)

const validateHex = (cssString) => {
  const hex = normalizeColorStringToHex(cssString);
  if (!hex) return null;

  const hexValue = hex.substring(1);
  const rgb = hexToRgb(hex);

  return {
    cssString,
    hexValue,
    hex,
    ...rgb,
    r: Math.round(rgb.red * 255), g: Math.round(rgb.green * 255), b: Math.round(rgb.blue * 255),
  };
};

const robToHex = ({ red, green, blue }) => rgbToHex(red, green, blue)


const rgbToHex = (r, g, b) => {
  const toHex = (c) => {
    if (is.nullOrUndefined(c) || Number.isNaN(c)) return '00';
    const val = Math.round(c * 255);
    const hex = val.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  const red = toHex(r);
  const green = toHex(g);
  const blue = toHex(b);
  return `#${red}${green}${blue}`;
}

/**
 * normally we'll have ".x.y.z" and we need to dig in to extract the value for x.y.z of the passed value
 * however we may also have x(y,z) in which case we just need to extract up to x - since the stuff after the brackets was for the benfit of the api
 */
const getPlucker = (props, defaultValue) => {

  // get any bracketed values
  // clean the props
  props = props.trim().replace(/\s/g, "").split(".").filter(f => f).join(".")

  // now extract all the bracketed stuff - this will turn x.y(a,b) 
  // into G1 - x.y G2 a,b
  // and x.y into just x.y
  const regex = /([^(]*)(.*)/
  const match = regex.exec(props);
  if (!match) {
    throw `undeciperable props ${props} for plucker`
  }
  // so this would be a.b(c,d)  main [a,b] sub [c,d]
  // right now only supporting single depth
  const main = match[1] && match[1].split(".")
  const subs = match[2] && match[2].replace(/\(/, "").replace(/\)/, "").split(",")

  const pluckSub = (v) => {
    if (!subs) return v
    return subs.reduce((p, c) => {
      p[c] = v && is.nonEmptyObject(v) && !isNU(v[c]) ? v[c] : defaultValue
      return p
    }, {})
  }

  // now we need a function that will extract fields to match these
  return (v) => {
    // if there are no main then we just return the plucked values from the sub
    if (!main) return pluckSub(v)

    const px = main.reduce((p, c) => {
      const t = p && p[c]
      return isNU(t) ? defaultValue : t
    }, v)
    return pluckSub(px)
  }

}


const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return {
    red: r / 255,
    green: g / 255,
    blue: b / 255,
  };
}

const outside = (n, l, h) => n < l || n > h
const outsideInt = (n, l, h) => outside(n, l, h) || !is.integer(n)

const zeroizeTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // Month is 0-indexed
  const day = date.getDate();
  return new Date(year, month, day, 0, 0, 0, 0);
}

const serialToDate = (serial) => {
  const epochCorrection = 2209161600000; // Milliseconds between 1970-01-01 and 1899-12-30
  const msPerDay = 24 * 60 * 60 * 1000;
  const adjustedMs = serial * msPerDay;
  return new Date(adjustedMs - epochCorrection);
};

const isEnum = (a) => is.object(a) && Reflect.has(a, "compareTo") && is.function(a.compareTo)
const hasFunction = (a, b = toString) => !isNU(a) && a[b] && is.function(a[b])

const stringer = (value) => {
  let func = is.date(value) ? "toISOString" : "toString"
  if (!hasFunction(value, func)) {
    throw new Error(`dont know how to stringify ${value}`)
  }
  const t = value[func]()
  // drop time portion of iso date if that's what it is
  return is.date(value) ? t.slice(0, 10) : t

}
const WHITER = { red: 1, green: 1, blue: 1 }
const BLACKER = { red: 0, green: 0, blue: 0 }
const BLACK = '#000000'
const WHITE = '#ffffff'

const getEnumKeys = (value) => {
  if (!isEnum(value)) {
    throw `Expected value to be an Enum but got ${value}`
  }
  return Object.keys(value)
    .filter(f => f !== "UNSUPPORTED" && !is.function(value[f]))

}

const colorNameToHex = {
  'aliceblue': '#f0f8ff', 'antiquewhite': '#faebd7', 'aqua': '#00ffff', 'aquamarine': '#7fffd4', 'azure': '#f0ffff',
  'beige': '#f5f5dc', 'bisque': '#ffe4c4', 'black': '#000000', 'blanchedalmond': '#ffebcd', 'blue': '#0000ff',
  'blueviolet': '#8a2be2', 'brown': '#a52a2a', 'burlywood': '#deb887', 'cadetblue': '#5f9ea0', 'chartreuse': '#7fff00',
  'chocolate': '#d2691e', 'coral': '#ff7f50', 'cornflowerblue': '#6495ed', 'cornsilk': '#fff8dc', 'crimson': '#dc143c',
  'cyan': '#00ffff', 'darkblue': '#00008b', 'darkcyan': '#008b8b', 'darkgoldenrod': '#b8860b', 'darkgray': '#a9a9a9',
  'darkgreen': '#006400', 'darkgrey': '#a9a9a9', 'darkkhaki': '#bdb76b', 'darkmagenta': '#8b008b', 'darkolivegreen': '#556b2f',
  'darkorange': '#ff8c00', 'darkorchid': '#9932cc', 'darkred': '#8b0000', 'darksalmon': '#e9967a', 'darkseagreen': '#8fbc8f',
  'darkslateblue': '#483d8b', 'darkslategray': '#2f4f4f', 'darkslategrey': '#2f4f4f', 'darkturquoise': '#00ced1',
  'darkviolet': '#9400d3', 'deeppink': '#ff1493', 'deepskyblue': '#00bfff', 'dimgray': '#696969', 'dimgrey': '#696969',
  'dodgerblue': '#1e90ff', 'firebrick': '#b22222', 'floralwhite': '#fffaf0', 'forestgreen': '#228b22', 'fuchsia': '#ff00ff',
  'gainsboro': '#dcdcdc', 'ghostwhite': '#f8f8ff', 'gold': '#ffd700', 'goldenrod': '#daa520', 'gray': '#808080',
  'green': '#008000', 'greenyellow': '#adff2f', 'grey': '#808080', 'honeydew': '#f0fff0', 'hotpink': '#ff69b4',
  'indianred': '#cd5c5c', 'indigo': '#4b0082', 'ivory': '#fffff0', 'khaki': '#f0e68c', 'lavender': '#e6e6fa',
  'lavenderblush': '#fff0f5', 'lawngreen': '#7cfc00', 'lemonchiffon': '#fffacd', 'lightblue': '#add8e6', 'lightcoral': '#f08080',
  'lightcyan': '#e0ffff', 'lightgoldenrodyellow': '#fafad2', 'lightgray': '#d3d3d3', 'lightgreen': '#90ee90',
  'lightgrey': '#d3d3d3', 'lightpink': '#ffb6c1', 'lightsalmon': '#ffa07a', 'lightseagreen': '#20b2aa', 'lightskyblue': '#87cefa',
  'lightslategray': '#778899', 'lightslategrey': '#778899', 'lightsteelblue': '#b0c4de', 'lightyellow': '#ffffe0',
  'lime': '#00ff00', 'limegreen': '#32cd32', 'linen': '#faf0e6', 'magenta': '#ff00ff', 'maroon': '#800000',
  'mediumaquamarine': '#66cdaa', 'mediumblue': '#0000cd', 'mediumorchid': '#ba55d3', 'mediumpurple': '#9370db',
  'mediumseagreen': '#3cb371', 'mediumslateblue': '#7b68ee', 'mediumspringgreen': '#00fa9a', 'mediumturquoise': '#48d1cc',
  'mediumvioletred': '#c71585', 'midnightblue': '#191970', 'mintcream': '#f5fffa', 'mistyrose': '#ffe4e1',
  'moccasin': '#ffe4b5', 'navajowhite': '#ffdead', 'navy': '#000080', 'oldlace': '#fdf5e6', 'olive': '#808000',
  'olivedrab': '#6b8e23', 'orange': '#ffa500', 'orangered': '#ff4500', 'orchid': '#da70d6', 'palegoldenrod': '#eee8aa',
  'palegreen': '#98fb98', 'paleturquoise': '#afeeee', 'palevioletred': '#db7093', 'papayawhip': '#ffefd5',
  'peachpuff': '#ffdab9', 'peru': '#cd853f', 'pink': '#ffc0cb', 'plum': '#dda0dd', 'powderblue': '#b0e0e6',
  'purple': '#800080', 'red': '#ff0000', 'rosybrown': '#bc8f8f', 'royalblue': '#4169e1',
  'saddlebrown': '#8b4513', 'salmon': '#fa8072', 'sandybrown': '#f4a460', 'seagreen': '#2e8b57', 'seashell': '#fff5ee',
  'sienna': '#a0522d', 'silver': '#c0c0c0', 'skyblue': '#87ceeb', 'slateblue': '#6a5acd', 'slategray': '#708090',
  'slategrey': '#708090', 'snow': '#fffafa', 'springgreen': '#00ff7f', 'steelblue': '#4682b4', 'tan': '#d2b48c',
  'teal': '#008080', 'thistle': '#d8bfd8', 'tomato': '#ff6347', 'turquoise': '#40e0d0', 'violet': '#ee82ee',
  'wheat': '#f5deb3', 'white': '#ffffff', 'whitesmoke': '#f5f5f5', 'yellow': '#ffff00', 'yellowgreen': '#9acd32'
};

const normalizeColorStringToHex = (color) => {
  if (!is.string(color)) return null;
  const lowerColor = color.toLowerCase().replace(/\s/g, '');
  if (colorNameToHex[lowerColor]) {
    return colorNameToHex[lowerColor];
  }
  // Check if it's a valid hex string
  if (/^#[0-9a-f]{6}$/i.test(lowerColor)) {
    return lowerColor;
  }
  return null; // Invalid color string
};

const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;

  if (is.nullOrUndefined(obj1) || is.nullOrUndefined(obj2) || !is.object(obj1) || !is.object(obj2)) {
    return obj1 === obj2;
  }

  if (is.date(obj1) && is.date(obj2)) return obj1.getTime() === obj2.getTime();
  if (is.regExp(obj1) && is.regExp(obj2)) return obj1.toString() === obj2.toString();

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}


function stringCircular(obj, space = null) {
  // First pass: remove circular references
  const withoutCircular = removeCircularReferences(obj);

  // Second pass: stabilize key order
  const stabilized = stabilizeKeyOrder(withoutCircular);

  return JSON.stringify(stabilized, null, space);
}

function removeCircularReferences(obj) {
  const seen = new WeakSet();

  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  }));
}

function stabilizeKeyOrder(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(stabilizeKeyOrder);
  }

  const sortedKeys = Object.keys(obj).sort();
  const result = {};

  for (const key of sortedKeys) {
    result[key] = stabilizeKeyOrder(obj[key]);
  }

  return result;
}
const lobify = (ob, mess = '') => {
  let lob = ob
  if (is.object(lob)) lob = stringCircular(lob)
  slogger.log(mess, lob)
  return ob
}
export const Utils = {
  lobify,
  stringCircular,
  hexToRgb,
  stringToBytes,
  bytesToString,
  settleAsBytes,
  settleAsString,
  isByteArray,
  fromJson,
  arrify,
  makeUrlParams,
  makeParams,
  makeParamOb,
  isNU,
  assert,
  isBlob,
  capital,
  is,
  rgbToHex,
  getPlucker,
  validateHex,
  robToHex,
  outside,
  outsideInt,
  unCapital,
  zeroizeTime,
  serialToDate,
  isEnum,
  stringer,
  WHITE,
  BLACK,
  BLACKER,
  WHITER,
  getEnumKeys,
  deepEqual,
  colorNameToHex,
  normalizeColorStringToHex,
  toHex: (n) => is.number(n) ? n.toString(16).padStart(8, '0') : n,
  fromHex: (n) => is.string(n) ? parseInt(n, 16) : n,
}
