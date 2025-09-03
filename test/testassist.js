import is from '@sindresorhus/is';
let __mss = null
let __mdoc = null
let __mfolder = null

export let getDrivePerformance
export let getSheetsPerformance
export let getDocsPerformance
export let getSlidesPerformance
export let getFormsPerformance

if (ScriptApp.isFake) {
  getDrivePerformance = Drive.__getDrivePerformance;
  getSheetsPerformance = Sheets.__getSheetsPerformance;
  getDocsPerformance = Docs.__getDocsPerformance;
  getSlidesPerformance = Slides.__getSlidesPerformance;
  getFormsPerformance = Forms.__getFormsPerformance;
}
export const cachePerformance = () => {
  if (ScriptApp.isFake) {
    console.log('...cumulative drive cache performance', getDrivePerformance());
    console.log('...cumulative docs cache performance', getDocsPerformance());
    console.log('...cumulative sheets cache performance', getSheetsPerformance());
    console.log('...cumulative slides cache performance', getSlidesPerformance());
    console.log('...cumulative forms cache performance', getFormsPerformance());
  }
}
export const wrapupTest = (func) => {
  if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
    func()
    cachePerformance()
    // actually most of these should already have been trashed

    ScriptApp.__behavior.trash();
    console.log('...its a wrap')
  }


}

export const trasher = (toTrash) => {
  toTrash.forEach(f => {
    console.log('trashing temp file', f.getId())
    f.setTrashed(true)
  })
}

export const moveToTestFolder = (id) => {
  const file = DriveApp.getFileById(id)
  file.moveTo(getTestFolder())
  return file
}

export const getTestFolder = (fixes) => {
  if (!__mfolder) {
    const folderName = fixes.PREFIX + "gassy-mcfakeface"
    const folders = DriveApp.getFoldersByName(folderName)
    if (folders.hasNext()) {
      __mfolder = folders.next()
    } else {
      __mfolder = DriveApp.createFolder(folderName)
    }
    console.log("...created folder", __mfolder.getName(), __mfolder.getId())
  }
  console.log("...test files will be in", __mfolder.getName(), __mfolder.getId())
  return __mfolder
}
export const maketdoc = (toTrash, fixes, { clear = true, forceNew = false } = {}) => {
  const docName = fixes.PREFIX + "tss-docs"
  const folder = getTestFolder(fixes)
  let reuse = false
  // because some test may have renamed it and drive/document service on Apps Script 
  // might not actually be in sync - doesnt actually happen on Node but we'll leave for consistency.
  if (forceNew || !__mdoc || __mdoc.getName() !== docName) {
    __mdoc = DocumentApp.create(docName)
    console.log('...created doc', __mdoc.getName(), __mdoc.getId())
    moveToTestFolder(__mdoc.getId())

    // no need to do this as sandbox mode will take care of it

    if (!ScriptApp.isFake && fixes.CLEAN && !toTrash.find(f => f.getId() == __mdoc.getId())) {
      console.log('...will be deleting it later')
      toTrash.push(DriveApp.getFileById(__mdoc.getId()))
    }

  } else {
    // in case there had been a save and close some point
    __mdoc = DocumentApp.openById(__mdoc.getId())
    console.log('...re-opened doc', __mdoc.getName(), __mdoc.getId(),)
    reuse === true
  }

  if (clear) {
    // In the live environment, doc.clear() only clears the body.
    // For tests, we often need a completely clean slate.
    // So, we explicitly remove headers/footers first.
    const header = __mdoc.getHeader();
    if (header) header.removeFromParent();

    const footer = __mdoc.getFooter();
    if (footer) footer.removeFromParent();

    // Now clear the body using the emulated doc.clear(), which only affects the body.
    // The appendParagraph is a workaround for a live bug where clearing a doc with certain trailing elements fails.
    __mdoc.getBody().appendParagraph('');
    __mdoc.clear();
  }
  return {
    doc: __mdoc,
    docName,
    folder
  }

}

// to minimize the number of test sheets created we'll share this across all tests
export const maketss = (sheetName, toTrash, fixes, { clearContents = true, clearFormats = true } = {}) => {
  const folder = getTestFolder(fixes)
  const aname = fixes.PREFIX + "tss-sheet"
  if (!__mss || __mss.getName() !== aname) {
    __mss = SpreadsheetApp.create(aname)
    moveToTestFolder(__mss.getId())
    console.log('...created ss', __mss.getName(), __mss.getId())
  }
  // no need to do this as sandbox mode will take care of it
  if (!ScriptApp.isFake && fixes.CLEAN && !toTrash.find(f => f.getId() == __mss.getId())) {
    console.log('...will be deleting it later')
    toTrash.push(DriveApp.getFileById(__mss.getId()))
  }


  let sheet = null
  if (sheetName) {
    sheet = __mss.getSheetByName(sheetName)
  }

  if (!sheet) {
    sheet = __mss.insertSheet(sheetName)
    console.log('...created sheet', sheet.getName(), sheet.getSheetId())
  } else {
    if (clearContents || clearFormats) {
      sheet.clear({ contentsOnly: !clearFormats, formatsOnly: !clearContents })
    }
  }

  return {
    ss: __mss,
    sheet,
    sheets: __mss.getSheets(),
    folder
  }
}

export const toHex = (c) => {
  if (!c) return '00';
  const val = Math.round(c * 255);
  const hex = val.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

export const rgbToHex = ({ red: r, green: g, blue: b }) => {

  const red = toHex(r);
  const green = toHex(g);
  const blue = toHex(b);
  return `#${red}${green}${blue}`;
}
export const getRandomRgb = () => ({ red: Math.random(), green: Math.random(), blue: Math.random() })
export const getRandomHex = () => rgbToHex(getRandomRgb())
export const getStuff = (range, funStuff = () => Utilities.getUuid()) =>
  Array.from({ length: range.getNumRows() }, _ => Array.from({ length: range.getNumColumns() }, funStuff))

export const getRandomBetween = (max, min = 0) => Math.floor(Math.random() * (max - min + 1)) + min;
export const getRandomFromDomain = (domain) => domain[getRandomBetween(domain.length - 1)]
export const fillRangeFromDomain = (range, domain) => getStuff(range, () => getRandomFromDomain(domain))
export const isACheckbox = (cell) => is.nonEmptyObject(cell) && cell.getCriteriaType().toString() === "CHECKBOX"
export const BLACK = '#000000'
export const RED = '#ff0000'

export const isRange = (a) => is.object(a) && !is.null(a) && is.function(a.toString) && a.toString() === "Range"
export const isEnum = (a) => is.object(a) && Reflect.has(a, "compareTo") && is.function(a.compareTo)
export const bothEnums = (a, b) => isEnum(a) && isEnum(b)
export const rangeFix = (a) => isRange(a) ? `=${a.getSheet().getName()}!${a.getA1Notation()}` : a
export const valuesFix = (a) => is.array(a) ? a.map(stringer) : stringer(a)
export const stringer = (a) => (is.null(a) || is.undefined(a)) ? a : (isRange(a) ? rangeFix(a) : (is.function(a.toString) ? a.toString() : a))
export const eString = (a) => isEnum(a) ? a.toString() : a

export const compareValue = (t, a, b, prop) => {
  if (bothEnums(a, b)) {
    t.is(a.compareTo(b), 0, prop)
    t.is(a.toString(), b.toString(), prop)
  } else {
    t.deepEqual(valuesFix(a), valuesFix(b), prop)
  }
}

export const addDays = (date, daysToAdd = 1) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + daysToAdd);
  return newDate;
}


export const zeroizeTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // Month is 0-indexed
  const day = date.getDate();
  return new Date(year, month, day, 0, 0, 0, 0);
}

// how many dimensions the values array has
export const getDimensions = (v) => {
  let dims = 0
  while (is.array(v)) {
    dims++
    v = v[0]
  }
  return dims
}



// Make a gridrange from a range
export const makeGridRange = (range) => {
  return {
    sheetId: range.getSheet().getSheetId(),
    startRowIndex: range.getRowIndex() - 1,
    startColumnIndex: range.getColumnIndex() - 1,
    endRowIndex: range.getRowIndex() + range.getNumRows() - 1,
    endColumnIndex: range.getColumnIndex() + range.getNumColumns() - 1
  }
}

export const makeExtendedValue = (value) => {

  const ev = Sheets.newExtendedValue()
  if (is.string(value)) {
    if (value.substring(0, 1) === '=') return ev.setFormulaValue(value)
    return ev.setStringValue(value)
  } else if (is.boolean(value)) {
    return ev.setBoolValue(value)
  } else if (is.number(value)) {
    return ev.setNumberValue(value)
  } else if (!is.nullOrUndefined(value) && is.object(value) && Reflect.has(value, "type")) {
    /// TODO
    const errorValue = Sheets.newErrorValue().setType('REF').setMessage('Invalid cell reference!');
    extendedValue.setErrorValue(errorValue);
    //
    throw new Error("not implemented yet - setErrorValue")
  } else if (is.date(value)) {
    return ev.setNumberValue(dateToSerial(value))
    // TODO we could consider setting a numberformat to type data as well
  } else {
    throw new Error(`Invalid type ${is(value)}`)
  }
}

export const dateToSerial = (date) => {
  if (!is.date(date)) {
    throw new Error(`dateToSerial is expecting a date but got ${is(date)}`)
  }
  // these are held in a serial number like in Excel, rather than JavaScript epoch
  // so the epoch is actually Dec 30 1899 rather than Jan 1 1970
  const epochCorrection = 2209161600000
  const msPerDay = 24 * 60 * 60 * 1000
  const adjustedMs = date.getTime() + epochCorrection
  return adjustedMs / msPerDay
}

export const makeSheetsGridRange = (range) => {
  const gr = Sheets.newGridRange()
  const mr = makeGridRange(range)
  return gr.setSheetId(mr.sheetId)
    .setStartRowIndex(mr.startRowIndex)
    .setStartColumnIndex(mr.startColumnIndex)
    .setEndRowIndex(mr.endRowIndex)
    .setEndColumnIndex(mr.endColumnIndex)
}

export const fillRange = (range, value) => {
  if (is.function(value)) {
    return fillRangeFunc(range, value)
  }
  return Array.from({ length: range.getNumRows() }).fill(Array.from({ length: range.getNumColumns() }).fill(value))
}

export const fillRangeFunc = (range, value) => {
  return Array.from({ length: range.getNumRows() }, _ => Array.from({ length: range.getNumColumns() }, () => value()))
}

export const arrMatchesRange = (range, arr, itemType) => {
  if (!is.array(arr)) return false
  if (arr.length !== range.getNumRows()) return false
  if (arr.some(r => !is.array(r))) return false
  if (arr.some(r => r.length !== range.getNumColumns())) return false
  if (itemType && !arr.flat().every(f => isitemType)) return false
  return true
}


/**
 * Corrected custom comparison function for sorting different data types,
 * precisely mimicking Google Sheets' range.sort() behavior.
 * Defines the order of precedence (from "smallest" to "largest" for ascending).
 * This order is based on observed behavior, which may differ from official documentation.
 * 1. Numbers
 * 2. Booleans (false < true)
 * 3. Strings
 * 4. Dates (if actual Date objects are present)
 * 5. Error Values (e.g., #N/A, #DIV/0!) - treated as larger than Booleans if present
 * 6. Empty Cells (always last)
 * 7. Other types (converted to strings for comparison)
 *
 * @param {*} a The first value to compare.
 * @param {*} b The second value to compare.
 * @returns {number} -1 if a < b, 0 if a == b, 1 if a > b.
 */
function compareMixedValues(a, b) {
  // --- Phase 1: Handle Empty Cells (Always Last) ---
  // Check for null, undefined, or empty string for both values
  const isBlankA = (a === null || a === undefined || a === "");
  const isBlankB = (b === null || b === undefined || b === "");

  if (isBlankA && !isBlankB) return 1;  // A is blank, B is not: A comes AFTER B
  if (!isBlankA && isBlankB) return -1; // B is blank, A is not: B comes AFTER A
  if (isBlankA && isBlankB) return 0;   // Both are blank: consider them equal for ordering

  // --- Phase 2: Compare Non-Blank Values Based on Spreadsheet Hierarchy ---

  // 1. Numbers
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (typeof a === 'number') return -1; // A is number, B is not (and not blank): A is "smaller"
  if (typeof b === 'number') return 1;  // B is number, A is not (and not blank): B is "smaller"

  // 2. Dates (NEW ADDITION)
  // Checks if both are Date objects, then compares their timestamps
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime(); // Compare by timestamp
  }
  // If one is a Date object and the other is not (and not handled by numbers or blanks)
  if (a instanceof Date) return -1; // A is Date, B is not: A is "smaller"
  if (b instanceof Date) return 1;  // B is Date, A is not: B is "smaller"

  // 3. Strings
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b, undefined, { sensitivity: 'base' }); // Case/accent-insensitive string compare
  }
  if (typeof a === 'string') return -1; // A is string, B is not (and not blank/number/date): A is "smaller"
  if (typeof b === 'string') return 1;  // B is string, A is not (and not blank/number/date): B is "smaller"

  // 4. Booleans
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return (a === b) ? 0 : (a ? 1 : -1); // false < true
  }
  // If 'a' is boolean and 'b' is not (and not handled by earlier types), 'a' is "smaller"
  if (typeof a === 'boolean') return -1;
  // If 'b' is boolean and 'a' is not (and not handled by earlier types), 'b' is "smaller"
  if (typeof b === 'boolean') return 1;

  // 5. Fallback for other unhandled types (e.g., objects, arrays, functions, Errors).
  // These typically convert to strings and sort lexicographically.
  return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
}


export const sort2d = (spec, arr) => [...arr].sort((a, b) => {
  for (const s of spec) {
    const index = is.object(s) ? s.column - 1 : s - 1
    let c = compareMixedValues(a[index], b[index])
    if (is.object(s) ? s.ascending === false : false) c *= -1
    if (c) {
      return c
    }
  }
  // rows were equal

  return 0
})

/**
* Prepares a 2D array by repeating a source array's values to fit within a target range's dimensions.
* This mimics the repeating behavior of SpreadsheetApp.Range.copyValuesToRange when the target is larger than the source,
* and ensures the result is at least the size of the source if the target is smaller.
*
* @param {any[][]} sourceValues - The source 2D array of values.
* @param {FakeSheetRange} targetRange - The target Apps Script Range.
* @returns {any[][]} A 2D array with the repeated values.
*/
export const prepareTarget = (sourceValues, targetRange) => {

  if (!isRange(targetRange)) {
    throw new Error(`target must be a range - it's a ${is(targetRange)}`)
  }
  if (!sourceValues || sourceValues.length === 0 || !sourceValues[0] || sourceValues[0].length === 0) {
    return [];
  }
  const sourceRows = sourceValues.length;
  const sourceCols = sourceValues[0].length;

  const targetRows = targetRange.getNumRows();
  const targetCols = targetRange.getNumColumns();

  // Calculate how many full times the source can be repeated within the target.
  const rowMultiplier = Math.floor(targetRows / sourceRows);
  const colMultiplier = Math.floor(targetCols / sourceCols);

  // The final dimensions should be at least the source dimensions (multiplier of at least 1).
  const finalRows = Math.max(1, rowMultiplier) * sourceRows;
  const finalCols = Math.max(1, colMultiplier) * sourceCols;

  return Array.from({ length: finalRows }, (_, rIndex) =>
    Array.from({ length: finalCols }, (_, cIndex) => sourceValues[rIndex % sourceRows][cIndex % sourceCols])
  );
}

export const transpose2DArray = (arr) => {
  if (!arr || arr.length === 0 || arr[0].length === 0) return [];
  const rows = arr.length;
  const cols = arr[0].length;
  const transposed = Array.from({ length: cols }, () => Array(rows).fill(undefined));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      transposed[c][r] = arr[r][c];
    }
  }
  return transposed;
};

export const whichType = (element) => {
  const ts = ["paragraph", "pageBreak", "textRun"]
  const [t] = ts.filter(f => Reflect.has(element, f))
  if (!t) console.log('skipping element', element)
  return t
}
export const docReport = (id, what = '\ndoc report') => {
  const doc = Docs.Documents.get(id)
  const content = doc.body.content
  // drop the section break
  const children = content.slice(1)
  what += ` -children:${children.length}`
  console.log(what)
  let text = '  '
  const typer = (child, text) => {
    const type = whichType(child)
    if (type) {
      text += ` -type:${type} ${child.startIndex}:${child.endIndex}`
      if (type === 'textRun') {
        text += ` -text:${JSON.stringify(child[type].content)}`
      }
      if (Reflect.has(child[type], "elements")) {
        text += ` (`
        child[type].elements.forEach(f => text = typer(f, text))
        text += ')'
      }
    }
    return text
  }
  return children.map(f => typer(f, text)).join("\n")
}
// The custom replacer function
const getCircularReplacer = () => {
  const seen = new WeakSet(); // Use WeakSet to avoid memory leaks
  return (key, value) => {
    // If the value is an object and not null
    if (typeof value === "object" && value !== null) {
      // If we have already seen this object, it's a circular reference
      if (seen.has(value)) {
        return "[Circular]"; // Replace it with a placeholder
      }
      // If it's a new object, add it to our cache
      seen.add(value);
    }
    // Return the value to be serialized
    return value;
  };
};

export const stringCircular = (ob) => JSON.stringify(ob, getCircularReplacer());

export const getChildren = (body) => {
  const children = [];
  for (let i = 0; i < body.getNumChildren(); i++) {
    children.push(body.getChild(i));
  }
  return children;
}