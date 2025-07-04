import { Proxies } from '../../support/proxies.js'
import { FakeSheet } from './fakesheet.js'
import { SheetUtils } from '../../support/sheetutils.js'
import { Utils } from '../../support/utils.js'
import { setterList, attrGetList, valuesGetList, setterMaker, attrGens, valueGens, makeCellTextFormatData } from './sheetrangemakers.js'
import {
  getGridRange,
  updateCells,
  isRange,
  makeGridRange,
  makeSheetsGridRange,
  batchUpdate,
  fillRange,
  arrMatchesRange,
  isACheckbox,
  makeExtendedValue
} from "./sheetrangehelpers.js"
import { TextToColumnsDelimiter } from '../enums/sheetsenums.js'

const { is, rgbToHex, hexToRgb, stringer, outsideInt, capital, BLACKER, getEnumKeys } = Utils

import { notYetImplemented, signatureArgs } from '../../support/helpers.js'
import { FakeSpreadsheet } from './fakespreadsheet.js'
import { FakeDataValidation } from './fakedatavalidation.js'
import { isEnum } from '../../../test/testassist.js'

//TODO - deal with r1c1 style ranges

// private properties are identified with leading __
// this will signal to the proxy handler that it's okay to set them
/**
 * create a new FakeSheet instance
 * @param  {...any} args 
 * @returns {FakeSheetRange}
 */
export const newFakeSheetRange = (...args) => {
  return Proxies.guard(new FakeSheetRange(...args))
}


const sortOutGridForCopy = (gridIdOrSheet, column, columnEnd, row, rowEnd) => {
  const sheetId = is.object(gridIdOrSheet) ? gridIdOrSheet.getSheetId() : gridIdOrSheet
  const gridRange = {
    sheetId,
    startColumnIndex: column - 1,
    endColumnIndex: columnEnd,
    startRowIndex: row - 1,
    endRowIndex: rowEnd
  }
  return gridRange
}
/**
 * basic fake FakeSheetRange
 * @class FakeSheetRange
 */
export class FakeSheetRange {

  /**
   * @constructor
   * @param {GridRange} gridRange 
   * @param {FakeSheet} sheet the sheet
   * @returns {FakeSheetRange}
   */
  constructor(gridRange, sheet) {

    this.__apiGridRange = gridRange
    this.__sheet = sheet
    this.__hasGrid = Reflect.has(gridRange, "startRowIndex")

    // make the generatable functions
    attrGetList.forEach(target => attrGens(this, target))
    valuesGetList.forEach(target => valueGens(this, target))

    // list of not yet implemented methods
    const props = [

      'getMergedRanges',
      'createDataSourcePivotTable',
      'activate',
      'breakApart',
      'deleteCells',
      'getNextDataCell',
      'getDataRegion',
      'getFormulaR1C1',
      'getFormulasR1C1',
      'getDataSourceFormula',
      'insertCells',

      'setFormulaR1C1',
      'setFormulasR1C1',

      'mergeAcross',
      'mergeVertically',
      'isPartOfMerge',
      'activateAsCurrentCell',
      'setComments',

      'isStartColumnBounded',
      'isStartRowBounded',
      'isEndColumnBounded',
      'isEndRowBounded',
      'autoFill',
      'autoFillToNeighbor',
      'setShowHyperlink',

      'applyColumnBanding',
      'applyRowBanding',

      'createPivotTable',
      'createDataSourceTable',
      'shiftRowGroupDepth',
      'shiftColumnGroupDepth',
      'expandGroups',
      'collapseGroups',
      'getRichTextValue',
      'getRichTextValues',
      'setRichTextValue',
      'setRichTextValues',

      'insertCheckboxes',


      'getComments',
      'clearComment',
      'getBandings',
      'addDeveloperMetadata',
      'getDeveloperMetadata',
      'createTextFinder',
      'moveTo',
      'setNotes',
      'setNote',

      'createFilter',
      'getDataSourceFormulas',
      'getDataSourceTables',

      'getDataSourceUrl',
      'getDataTable',

      'createDeveloperMetadataFinder',
      'getDataSourcePivotTables',

      'merge',

      'getFilter',
      // these are not documented, so will skip for now
      'setComment',
      'getComment'
      //--
    ]
    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented(f)
      }
    })

    setterList.forEach(f => {
      setterMaker({
        self: this,
        ...f,
        single: 'set' + capital(f.single || f.name),
        plural: f.plural || ('set' + capital(f.single || f.name) + 's'),
        fields: f.fields || `userEnteredFormat.textFormat.${f.name}`,
        maker: f.maker || makeCellTextFormatData,
        apiSetter: f.apiSetter || 'set' + capital(f.single || f.name)
      })
    })
  }

  /**
   * canEdit() https://developers.google.com/apps-script/reference/spreadsheet/range#canedit
   * Determines whether the user has permission to edit every cell in the range. The spreadsheet owner is always able to edit protected ranges and sheets.
   * @returns {boolean}
   */
  canEdit() {

    // we'll need to use the Drive API to get the permissions
    const owner = this.__getSpreadsheet().getOwner()
    const user = Session.getEffectiveUser()

    // the owner ? - can do anything
    if (user.getEmail() === owner.getEmail()) return true

    // edit privileges ? if yes then see if the range is protected
    const editors = this.__getSpreadsheet().getEditors()
    if (!editors.find(f => f.getEmail() === user.getEmail())) return null


  }
  __clear(fields) {

    const range = makeSheetsGridRange(this)
    const requests = [{
      updateCells: Sheets.newUpdateCellsRequest().setFields(fields).setRange(range)
    }]

    batchUpdate({
      spreadsheetId: this.__getSpreadsheetId(),
      requests
    })
    return this
  }
  /**
   * clears  (notes) 
   * @returns {FakeSheetRange} self
   */
  clearNote() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.clearNote")
    if (nargs) matchThrow()
    return this.__clear("note")
  }
  /**
   * clears  (values) 
   * @returns {FakeSheetRange} self
   */
  clearContent() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.clearContent")
    if (nargs) matchThrow()
    return this.__clear("userEnteredValue")
  }
  /**
   * clears  (format) 
   * @returns {FakeSheetRange} self
   */
  clearFormat() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.clearFormat")
    if (nargs) matchThrow()
    return this.__clear("userEnteredFormat")
  }

  /**
   * clears evertything (notes,formats,values,datavalidations) (except comments)
   * @returns {FakeSheetRange} self
   */
  clear() {

    const { nargs, matchThrow } = signatureArgs(arguments, "Range.clear")
    if (nargs) matchThrow()
    const range = makeSheetsGridRange(this)
    const requests = [{
      updateCells: Sheets.newUpdateCellsRequest().setFields("userEnteredValue,userEnteredFormat,note").setRange(range)
    }, {
      setDataValidation: Sheets.newSetDataValidationRequest().setRange(range).setRule(null)
    }]

    batchUpdate({
      spreadsheetId: this.__getSpreadsheetId(),
      requests
    })
    return this
  }

  clearDataValidations() {
    this.setDataValidations(null)
    return this
  }

  /**
   * copyTo(destination, copyPasteType, transposed)
   * Copies the data from a range of cells to another range of cells.
   * https://developers.google.com/apps-script/reference/spreadsheet/range#copytodestination,-copypastetype,-transposed
   * @param {FakeSheetRange} destination 	A destination range to copy to; only the top-left cell position is relevant.
   * @param {CopyPasteType||object} [copyPasteTypeOrOptions] enum SpreadsheetApp.enum A type that specifies how the range contents are pasted to the destination or options
   * @param {boolean} [transposed] Whether the range should be pasted in its transposed orientation.
   */
  copyTo(destination, copyPasteTypeOrOptions, transposed) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.copyTo")
    if (nargs < 1 || nargs > 3) matchThrow()
    if (!isRange(destination)) matchThrow()

    // set the defaults
    const copyPaste = Sheets.newCopyPasteRequest()
      .setPasteType("PASTE_NORMAL")
      .setPasteOrientation("NORMAL")

    // the second argument can be with options (modern) or enum + transpose
    if (nargs > 1) {
      // we had an old style variant
      if (isEnum(copyPasteTypeOrOptions)) {
        copyPaste.setPasteType(copyPasteTypeOrOptions.toString())
        if (nargs > 2) {
          if (!is.boolean(transposed)) matchThrow()
          copyPaste.setPasteOrientation(transposed ? "TRANSPOSE" : "NORMAL")
        }
      } else {
        // modern signature with options
        if (nargs !== 2 || !is.object(copyPasteTypeOrOptions)) matchThrow()
        if (Reflect.ownKeys(copyPasteTypeOrOptions).length !== 1) matchThrow()
        if (copyPasteTypeOrOptions.contentsOnly) copyPaste.setPasteType("PASTE_VALUES")
        else if (copyPasteTypeOrOptions.formatOnly) copyPaste.setPasteType("PASTE_FORMAT")
        else matchThrow()

      }
    }

    copyPaste
      .setDestination(
        makeSheetsGridRange(destination)
      )
      .setSource(makeSheetsGridRange(this))


    const requests = [{ copyPaste }];
    batchUpdate({ spreadsheetId: this.__getSpreadsheetId(), requests });

    return this;

  }


  __copyToRange(pasteType, gridIdOrSheet, column, columnEnd, row, rowEnd) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.copytorange")
    if (nargs !== 6) matchThrow()
    const args = Array.from(arguments)
    if (!args.slice(2).every(f => is.integer(f) && is.positiveNumber(f))) matchThrow()
    if (!is.integer(gridIdOrSheet) && !(is.object(gridIdOrSheet) && gridIdOrSheet.toString() === "Sheet")) matchThrow()


    // this is the behavior observed - different than docs
    /*
    So to complete the tests, this time with the Advanced sheets API - we can see it behaves in exactly the same way as he apps script service-
 
    if the target range is less than the source range, it will always copy all of the source range and never truncate.
    if the target range is greater that the source rang eit will duplicate all of the source range as many times as will fit - but never duplicate and truncate - so if the source range is 3 wide and the tharget range is 5 wide it will only copy the 3 columns. If the target is 7 wide, it will duplicate the source twice, making 6 columns. And ignore the 7th column.
    there's no need to do anything special here as the sheets api behave the same way as the apps script ervice
    */
    const targetGrid = sortOutGridForCopy(gridIdOrSheet, column, columnEnd, row, rowEnd)
    const sourceGrid = makeGridRange(this)

    const copyPaste = Sheets.newCopyPasteRequest()
      .setSource(sourceGrid)
      .setPasteType(pasteType)
      .setDestination(targetGrid)
      .setPasteOrientation("NORMAL")

    const requests = [{
      copyPaste
    }]
    Sheets.Spreadsheets.batchUpdate({ requests }, this.__getSpreadsheetId());
    return this
  }

  /**
   * copyValuesToRange(gridId, column, columnEnd, row, rowEnd)  https://developers.google.com/apps-script/reference/spreadsheet/range#copyvaluestorangegridid,-column,-columnend,-row,-rowend
   * Copy the content of the range to the given location. If the destination is larger or smaller than the source range then the source is repeated or truncated accordingly.
   * @param {integer|Sheet} gridIdOrSheet	Integer	The unique ID of the sheet within the spreadsheet, irrespective of position or the sheet it is on
   * @param {integer} column 	The first column of the target range.
   * @param {integer} columnEnd	The end column of the target range.
   * @param {integer} row The start row of the target range.
   * @param {integer} rowEnd The end row of the target range.
   * @return {FakeSheetRange} self
   */
  copyValuesToRange(gridIdOrSheet, column, columnEnd, row, rowEnd) {
    return this.__copyToRange("PASTE_VALUES", gridIdOrSheet, column, columnEnd, row, rowEnd)
  }

  copyFormatToRange(gridIdOrSheet, column, columnEnd, row, rowEnd) {
    return this.__copyToRange("PASTE_FORMAT", gridIdOrSheet, column, columnEnd, row, rowEnd)
  }


  /**
   * protect() https://developers.google.com/apps-script/reference/spreadsheet/sheet#protect
   * Creates an object that can protect the sheet from being edited except by users who have permission.
   * @return {FakeProtection}
   */
  protect() {
    return newFakeProtection(SpreadsheetApp.ProtectionType.RANGE, this)
  }

  getA1Notation() {
    // a range can have just a sheet with no cells
    if (!this.__hasGrid) return ""
    return SheetUtils.toRange(
      this.__gridRange.startRowIndex + 1,
      this.__gridRange.startColumnIndex + 1,
      this.__gridRange.endRowIndex,
      this.__gridRange.endColumnIndex
    )
  }


  /**
   * these 2 dont exist in the documentation any more - assume they have been renamed as getBackground(s)
   */
  getBackgroundColor() {
    return this.getBackground()
  }
  getBackgroundColors() {
    return this.getBackgrounds()
  }

  /**
   * getCell(row, column) Returns a given cell within a range.
   * @param {number} row 1 based cell relative to range
   * @param {number} column 1 based cell relative to range
   * @return {FakeSheetRange}
   */
  getCell(row, column) {
    // let offset check args
    return this.offset(row - 1, column - 1, 1, 1)
  }
  getColumn() {
    return this.__gridRange.startColumnIndex + 1
  }
  getColumnIndex() {
    return this.getColumn()
  }


  getEndColumn() {
    return this.__gridRange.endColumnIndex + 1
  }
  getEndRow() {
    return this.__gridRange.endRowIndex + 1
  }

  /**
   * getGridId() https://developers.google.com/apps-script/reference/spreadsheet/range#getgridid
   * Returns the grid ID of the range's parent sheet. IDs are random non-negative int values.
   * gridid seems to be the same as the sheetid 
   * @returns {number}
   */
  getGridId() {
    return this.getSheet().getSheetId()
  }
  /**
   * getHeight() https://developers.google.com/apps-script/reference/spreadsheet/range#getheight
   * appears to be the same as getNumRows()
   * Returns the height of the range.
   * @returns {number} 
   */
  getHeight() {
    return this.getNumRows()
  }

  getLastColumn() {
    return this.__gridRange.endColumnIndex
  }
  getLastRow() {
    return this.__gridRange.endRowIndex
  }

  getNumColumns() {
    return this.__gridRange.endColumnIndex - this.__gridRange.startColumnIndex
  }
  getNumRows() {
    return this.__gridRange.endRowIndex - this.__gridRange.startRowIndex
  }
  getRow() {
    return this.__gridRange.startRowIndex + 1
  }
  // row and columnindex are probably now deprecated in apps script
  // in any case, in gas they currently return the 1 based value, not the 0 based value as you'd expect
  // so the same as the getrow and getcolumn
  getRowIndex() {
    return this.getRow()
  }
  getSheet() {
    return this.__sheet
  }

  /**
   * getWidth() https://developers.google.com/apps-script/reference/spreadsheet/range#getwidth
   * appears to be the same as getNumColumns()
   * Returns the width of the range in columns.
   * @returns {number} 
   */
  getWidth() {
    return this.getNumColumns()
  }

  /**
   * offset(rowOffset, columnOffset) https://developers.google.com/apps-script/reference/spreadsheet/range#offsetrowoffset,-columnoffset
   * Returns a new range that is offset from this range by the given number of rows and columns (which can be negative). 
   * The new range is the same size as the original range.
   * offsets are zero based
   * @param {number} rowOffset 
   * @param {number} columnOffset 
   * @param {number} numRows 
   * @param {number} numColumns 
   * @returns 
   */
  offset(rowOffset, columnOffset, numRows, numColumns) {
    // get arg types
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.offset")

    // basic signature tests
    if (nargs > 4 || nargs < 2) matchThrow()
    if (!is.integer(rowOffset) || !is.integer(columnOffset)) matchThrow()
    if (nargs > 2 && !is.integer(numRows)) matchThrow()
    if (nargs > 3 && !is.integer(numColumns)) matchThrow()
    const gr = { ...this.__gridRange }

    numColumns = is.undefined(numColumns) ? this.getNumColumns() : numColumns
    numRows = is.undefined(numRows) ? this.getNumRows() : numRows

    if (!numRows) {
      throw new Error('The number of rows in the range must be at least 1')
    }
    if (!numColumns) {
      throw new Error('The number of columns in the range must be at least 1')
    }
    gr.startRowIndex += rowOffset
    gr.startColumnIndex += columnOffset
    gr.endRowIndex = gr.startRowIndex + numRows
    gr.endColumnIndex = gr.startColumnIndex + numColumns

    return newFakeSheetRange(gr, this.getSheet())

  }
  /**
   * removeCheckboxes()
   * Removes all checkboxes from the range. Clears the data validation of each cell, and additionally clears its value if the cell contains either the checked or unchecked value.
   * @returns {FakeSheetRange}
   */
  removeCheckboxes() {
    // theres not an api method for this, we need to get all the data validations in the range, see if they are check boxes and batchupdate a series of things
    const dv = this.getDataValidations()
    if (!dv) return this

    // now get all the checkboxes and where they are
    const work = dv.map((row, rn) => row.map((cell, cn) => isACheckbox(cell) ? { rn, cn } : null)).flat().filter(f => f)
    if (!work.length) return

    const requests = work.map(f => ({
      setDataValidation: Sheets
        .newSetDataValidationRequest()
        .setRange(makeSheetsGridRange(this.offset(f.rn, f.cn, 1, 1)))
        .setRule(null)
    }))
    const clearRequests = work.map(f => ({
      updateCells: Sheets
        .newUpdateCellsRequest()
        .setFields('userEnteredValue')
        .setRange(makeSheetsGridRange(this.offset(f.rn, f.cn, 1, 1)))
    }))

    batchUpdate({
      spreadsheetId: this.__getSpreadsheetId(),
      requests: requests.concat(clearRequests)
    })
    return this
  }

  /**
   * check() https://developers.google.com/apps-script/reference/spreadsheet/range#check
   * Checks the checkbox data validation rule in the range. The range must be composed of cells with a checkbox data validation rule.
   * @returns {FakeSheetRange} self
   */
  check() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.check");
    if (nargs) matchThrow();
    return this.__checkUncheck(true);
  }

  /**
   * uncheck() https://developers.google.com/apps-script/reference/spreadsheet/range#uncheck
   * Unchecks the checkbox data validation rule in the range. The range must be composed of cells with a checkbox data validation rule.
   * @returns {FakeSheetRange} self
   */
  uncheck() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.uncheck");
    if (nargs) matchThrow();
    return this.__checkUncheck(false);
  }

  __checkUncheck(isChecked) {
    const validations = this.getDataValidations();
    if (!validations) return this;

    const requests = [];

    for (let r = 0; r < this.getNumRows(); r++) {
      for (let c = 0; c < this.getNumColumns(); c++) {
        const dv = validations[r][c];
        if (dv && isACheckbox(dv)) {
          const criteriaValues = dv.getCriteriaValues();
          const valueToSet = isChecked
            ? (criteriaValues && criteriaValues.length >= 1) ? criteriaValues[0] : true
            : (criteriaValues && criteriaValues.length === 2) ? criteriaValues[1] : false;

          const cellRange = this.offset(r, c, 1, 1);
          const cellData = Sheets.newCellData().setUserEnteredValue(makeExtendedValue(valueToSet));

          const ucr = Sheets.newUpdateCellsRequest()
            .setRange(makeSheetsGridRange(cellRange))
            .setFields('userEnteredValue')
            .setRows([Sheets.newRowData().setValues([cellData])]);

          requests.push({ updateCells: ucr });
        }
      }
    }

    if (requests.length > 0) {
      batchUpdate({ spreadsheetId: this.__getSpreadsheetId(), requests });
    }

    return this;
  }
  /**
   * randomize() https://developers.google.com/apps-script/reference/spreadsheet/range#randomize
   * Randomizes the order of the rows in the given range.
   */
  randomize() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.randomize")
    if (nargs) matchThrow()
    const request = Sheets.newRandomizeRangeRequest()
      .setRange(makeSheetsGridRange(this))
    batchUpdate({
      spreadsheetId: this.__getSpreadsheetId(),
      requests: [{ randomizeRange: request }]
    })

    return this
  }
  /**
   * removeDuplicates()
   * https://developers.google.com/apps-script/reference/spreadsheet/range#removeduplicates
   * Removes rows within this range that contain values that are duplicates of values in any previous row.
   * @param {Integer[]}	[columnsToCompare]	The columns to analyze for duplicate values. If no columns are provided then all columns are analyzed for duplicates
   * @returns {FakeSheetRange} adjusted range after duplicates are removed
   */
  removeDuplicates(columnsToCompare) {

    const { nargs, matchThrow } = signatureArgs(arguments, "Range.removeDuplicates")

    if (nargs > 1) matchThrow()
    if (nargs) {

      if (!is.array(columnsToCompare)) matchThrow()
      if (!columnsToCompare.every(f => is.integer(f))) {
        matchThrow()
      }
      columnsToCompare.forEach(f => {
        if (f > this.getNumColumns() + this.getColumn() || f < this.getColumn()) {
          throw new Error(`Cell reference ${f} out of range for ${this.getA1Notation()}`)
        }
      })
    }

    const gridIndex = makeSheetsGridRange(this)
    const request = Sheets.newDeleteDuplicatesRequest()
      .setRange(gridIndex)

    if (columnsToCompare && columnsToCompare.length) {
      request.setComparisonColumns(columnsToCompare.map(f => ({
        dimension: "COLUMNS",
        startIndex: f - 1,
        endIndex: f,
        sheetId: this.getSheet().getSheetId()
      })))
    }
    const response = batchUpdate({
      spreadsheetId: this.__getSpreadsheetId(),
      requests: [{ deleteDuplicates: request }]
    })
    const reply = response?.replies && response.replies[0]
    if (reply) {
      const { duplicatesRemovedCount = 0 } = reply.deleteDuplicates
      return duplicatesRemovedCount ? this.offset(0, 0, this.getNumRows() - duplicatesRemovedCount, this.getNumColumns()) : this
    }
    return this
  }
  /**
   * Sets the background color of all cells in the range in CSS notation (such as '#ffffff' or 'white').
   * setBackground(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundcolor
   * @param {string} color A color code in CSS notation (such as '#ffffff' or 'white'); a null value resets the color.
   * @return {FakeSheetRange} self
   */
  setBackground(color) {
    return this.setBackgrounds(fillRange(this, color))
  }

  // these are undocumented, but appear to be aequivalent to setBackground
  setBackgroundColor(color) {
    return this.setBackground(color)
  }
  setBackgroundColors(colors) {
    return this.setBackgrounds(colors)
  }

  /**
   * setBackgroundRGB(red, green, blue) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundrgbred,-green,-blue
   * @returns {FakeSheetRange} self
   */
  setBackgroundRGB(red, green, blue) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setBackgroundRGB")
    if (nargs !== 3) matchThrow()
    if (outsideInt(red, 0, 255) || outsideInt(green, 0, 255) || outsideInt(blue, 0, 255)) matchThrow()
    return this.setBackground(rgbToHex(red / 255, green / 255, blue / 255))

  }
  /**
   * there is no 'setBorders' variant
   * setBorder(top, left, bottom, right, vertical, horizontal, color, style)
   * https://developers.google.com/apps-script/reference/spreadsheet/range#setbordertop,-left,-bottom,-right,-vertical,-horizontal,-color,-style
   * @param {Boolean} top		true for border, false for none, null for no change.
   * @param {Boolean} left		true for border, false for none, null for no change.
   * @param {Boolean} bottom	true for border, false for none, null for no change.
   * @param {Boolean} right	true for border, false for none, null for no change.
   * @param {Boolean} vertical true for internal vertical borders, false for none, null for no change.
   * @param {Boolean} horizontal	Boolean	true for internal horizontal borders, false for none, null for no change.
   * @param {Boolean}	[color] A color in CSS notation (such as '#ffffff' or 'white'), null for default color (black).
   * @param {Boolean} [SpreadsheetApp.BorderStyle]	A style for the borders, null for default style (solid).
   * @return {FakeSheetRange} self
   */
  setBorder(top, left, bottom, right, vertical, horizontal, color = null, style = null) {
    // there are 2 valid variants
    // one with each of the first 6 args
    // and another with all 8
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setDataValidations")

    if (nargs < 6) matchThrow()
    // check first 6 args
    const args = Array.from(arguments).slice(0, 6)
    if (!args.every(f => is.boolean(f) || is.null(f))) matchThrow()

    // if we have some other number of args
    if (nargs > 6) {
      if (nargs !== 8) matchThrow()
      if (!is.string(color) && !is.null(color)) matchThrow()
      if (!is.null(style) && !isEnum(style)) matchThrow()
    }

    // note that null means leave as it is, and a boolean false means get rid of it
    // in the sheets api, null means get rid of it, and a missing value means leave as it is
    // width is not an option on Apps Script, so we can just do inner or outer
    const innerBorder = Sheets.newBorder()
      .setColor(is.null(color) ? BLACKER : hexToRgb(color))
      .setStyle(is.null(style) ? "SOLID" : style.toString())

    // construct the request
    const ubr = Sheets.newUpdateBordersRequest().setRange(makeSheetsGridRange(this))

      // if it's mentioned then we have to turn the border either off or on
      ;['top', 'left', 'bottom', 'right'].forEach((f, i) => {
        if (!is.null(args[i])) {
          ubr['set' + capital(f)](args[i] ? innerBorder : null)
        }
      })

    // finally the vertical and horizontals
    if (!is.null(vertical)) {
      ubr.setInnerVertical(vertical ? innerBorder : null)
    }
    if (!is.null(horizontal)) {
      ubr.setInnerHorizontal(horizontal ? innerBorder : null)
    }

    batchUpdate({
      spreadsheetId: this.__getSpreadsheetId(),
      requests: [{ updateBorders: ubr }]
    })

    return this

  }

  /**
   * setDataValidation(rule) https://developers.google.com/apps-script/reference/spreadsheet/range#setdatavalidationrule
   * @param {FakeDataValidation} rule to apply to all
   * @return {FakeSheetRange} self
   */
  setDataValidation(rule) {
    return this.__setDataValidations(fillRange(this, rule))
  }

  /**
   * setDataValidations(rules)
   * @param {FakeDataValidation[][]} rules 
   * @return {FakeSheetRange} self
   */
  setDataValidations(rules) {
    return this.__setDataValidations(rules)
  }


  __setDataValidations(rules) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setDataValidations")
    const spreadsheetId = this.__getSpreadsheetId()

    // an 'official Sheets objects to do this kind of thing
    // it's actually more long winded than just constructing the requests manually
    // this is a clear
    if (is.null(rules)) {
      const setDataValidation = Sheets
        .newSetDataValidationRequest()
        .setRange(makeSheetsGridRange(this))
        .setRule(null);
      batchUpdate({ spreadsheetId, requests: [{ setDataValidation }] })
      return this
    }

    //---
    // this setting some values
    if (nargs !== 1 || !is.nonEmptyArray(rules)) matchThrow()
    if (!arrMatchesRange(this, rules, "object"))
      if (!rules.flat().every(f => f instanceof FakeDataValidation)) matchThrow()

    // TODO
    // if the rules are all different we need to create a separate request for each member of the range
    // all the same we can use a single fetch

    const requests = []

    for (let offsetRow = 0; offsetRow < this.getNumRows(); offsetRow++) {

      for (let offsetCol = 0; offsetCol < this.getNumColumns(); offsetCol++) {

        const range = this.offset(offsetRow, offsetCol, 1, 1)
        const dv = rules[offsetRow][offsetCol]
        const critter = dv.__getCritter()
        if (!critter) {
          throw new Error('couldnt find sheets api mapping for data validation rule', rule.getCriteriaType())
        }
        const field = critter.apiField || 'userEnteredValue'
        const type = critter.apiEnum || critter.name
        let values = dv.getCriteriaValues()
        let showCustomUi = null
        // but if its one of these - drop the last arg
        if (critter.name === "VALUE_IN_LIST" || critter.name === "VALUE_IN_RANGE") {
          if (values.length !== 2) {
            throw new Error(`Expected 2 args for ${critter.name} but got ${values.length}`)
          } else {
            showCustomUi = values[1]
            values = values.slice(0, -1)
          }
          // convert any ranges to formulas
          if (critter.name === "VALUE_IN_RANGE") {
            if (!isRange(values[0])) {
              throw `expected a range for ${critter.name} but got ${values[0]}`
            }
            values[0] = `=${values[0].__getWithSheet()}`
          }
        }

        // all values need to be converted to string 
        values = values.map(stringer).map(f => ({
          [field]: f
        }))

        const condition = {
          type,
          values
        }

        const rule = Sheets.newDataValidationRule()
          .setCondition(condition)
          .setStrict(!dv.getAllowInvalid())

        if (!is.null(showCustomUi)) rule.setShowCustomUi(showCustomUi)

        const setDataValidation = Sheets
          .newSetDataValidationRequest()
          .setRange(makeSheetsGridRange(range))
          .setRule(rule);

        requests.push({ setDataValidation })
      }
    }
    batchUpdate({ spreadsheetId, requests })
    return this

  }


  /**
   * Sets the background color of all cells in the range in CSS notation (such as '#ffffff' or 'white').
   * setBackgrounds(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundscolor
   * @param {string[][]} colors A two-dimensional array of colors in CSS notation (such as '#ffffff' or 'white'); null values reset the color.
   * @return {FakeSheetRange} self
   */
  setBackgrounds(colors) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setBackgrounds")
    if (nargs !== 1 || !arrMatchesRange(this, colors, "string")) matchThrow()

    const rows = colors.map(row => ({
      values: row.map(c => ({
        userEnteredFormat: {
          backgroundColor: hexToRgb(c)
        }
      }))
    }))
    const fields = 'userEnteredFormat.backgroundColor'
    return updateCells({ range: this, rows, fields, spreadsheetId: this.__getSpreadsheetId() })

  }

  /**
   * setBackgroundObjects(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundobjectscolor
   * Sets a rectangular grid of background colors (must match dimensions of this range).
   * @param {Color[][]} colors A two-dimensional array of colors; null values reset the color.
   * @returns {FakeSheetRange} self
   */
  setBackgroundObjects(colors) {

    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setBackgroundObjects", "Color")
    if (nargs !== 1 || !arrMatchesRange(this, colors, "object")) matchThrow()

    const rows = colors.map(row => ({
      values: row.map(c => this.__getColorItem(c))
    }))

    // see __getColorItem for how this allows mixing of both theme and rgb colors.
    const fields = 'userEnteredFormat.backgroundColorStyle'
    return updateCells({ range: this, rows, fields, spreadsheetId: this.__getSpreadsheetId() })

  }

  /**
  * Sets the font color in CSS notation (such as '#ffffff' or 'white')
  * setBackgroundObject(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setbackgroundobjectcolor
  * @param {Color} color The background color to set; null value resets the background color.
  * @return {FakeSheetRange} self
  */
  setBackgroundObject(color) {
    return this.setBackgroundObjects(fillRange(this, color))
  }

  /**
   * Sets the font color in CSS notation (such as '#ffffff' or 'white')
   * setFontColor(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setfontcolorcolor
   * @param {string} color A color code in CSS notation (such as '#ffffff' or 'white'); a null value resets the color.
   * @return {FakeSheetRange} self
   */
  setFontColor(color) {
    // we can use the set colorObject here
    // TODO - handle null
    return this.setFontColorObject(is.null(color) ? null : SpreadsheetApp.newColor().setRgbColor(color).build())
  }

  /**
   * TODO -- dont support html color names yet
   * Sets a rectangular grid of font colors (must match dimensions of this range). The colors are in CSS notation (such as '#ffffff' or 'white').
   * setFontColors(color) https://developers.google.com/apps-script/reference/spreadsheet/range#setfontcolorscolors
   * @param {string[][]} colors A two-dimensional array of colors in CSS notation (such as '#ffffff' or 'white'); null values reset the color.
   * @return {FakeSheetRange} self
   */
  setFontColors(colors) {
    // we can use the set colorObject here
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.setFontColors")
    if (nargs !== 1 || !arrMatchesRange(this, colors)) matchThrow()
    return this.setFontColorObjects(colors.map(row => row.map(color => {
      return is.null(color) ? null : SpreadsheetApp.newColor().setRgbColor(color).build()
    })))
  }


  /** 
   * setValue(value) https://developers.google.com/apps-script/reference/spreadsheet/range#setvaluesvalues
   * @param {object} A value
   * @return {FakeSheetRange} this
   */
  setValue(value) {
    return this.__setValues({ values: [[value]], single: true })
  }

  /** 
   * setValues(values) https://developers.google.com/apps-script/reference/spreadsheet/range#setvaluesvalues
   * @param {object[][]} A two-dimensional array of values.
   * @return {FakeSheetRange} this
   */
  setValues(values) {
    const rows = this.getNumRows()
    const cols = this.getNumColumns()
    if (rows !== values.length) {
      throw new Error(`
      The number of rows in the data does not match the number of rows in the range. The data has ${values.length} but the range has ${rows}`)
    }
    if (!values.every(row => row.length === cols)) {
      throw new Error(`
        The number of columns in the data does not match the number of columns in the range. The range has ${cols}`)
    }
    return this.__setValues({ values })
  }
  /**
   * splitTextToColumns(delimiter) 
   * https://developers.google.com/apps-script/reference/spreadsheet/range#splittexttocolumnsdelimiter_1
   * Splits a column of text into multiple columns
   * @param {string|| TextToColumnsDelimiter} []
   * @returns {FakeSheetRange} self
   */
  splitTextToColumns(delimiter) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.splitTextToColumns")
    if (nargs > 1) matchThrow()
    if (this.getNumColumns() !== 1) {
      throw new Error(`A range in a single column must be provided`)
    }
    const request = Sheets.newTextToColumnsRequest()
      .setSource(makeSheetsGridRange(this))

    if (nargs == 1) {
      if (isEnum(delimiter)) {
        if (!getEnumKeys(TextToColumnsDelimiter).includes(delimiter.toString())) matchThrow()
        request.setDelimiterType(delimiter.toString())
      } else if (is.string(delimiter)) {
        request.setDelimiter(delimiter).setDelimiterType("CUSTOM")
      } else {
        matchThrow()
      }
    } else {
      // the default
      request.setDelimiterType(TextToColumnsDelimiter.toString())
    }
    // if no delimiter, dont bother mentioning it
    batchUpdate({
      spreadsheetId: this.__getSpreadsheetId(),
      requests: [{ textToColumns: request }]
    })

    return this

  }

  sort(sortObj) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.sort")
    if (nargs !== 1 || is.nullOrUndefined(sortObj)) matchThrow()
    const sortObjs = (is.array(sortObj) ? sortObj : [sortObj]).map(f => {
      let ob = {}
      if (is.nonEmptyObject(f)) {
        ob = { ...f }
      } else if (is.integer(f)) {
        ob.column = f
      } else {
        matchThrow()
      }
      if (!Reflect.has(ob, "ascending")) ob.ascending = true
      if (!is.boolean(ob.ascending)) matchThrow()
      if (!Reflect.has(ob, "column")) matchThrow()
      if (!is.integer(ob.column)) matchThrow()
      if (!is.inRange(ob.column, 1, this.getNumColumns())) matchThrow
      if (Reflect.ownKeys(ob).sort().join(",") !== 'ascending,column') matchThrow()

      return {
        // note - absolute - not relative 
        // and will only sort the range contents, not the entire row
        dimensionIndex: ob.column - 1,
        sortOrder: ob.ascending ? "ASCENDING" : "DESCENDING"
      }
    })

    const request = Sheets.newSortRangeRequest()
      .setRange(makeSheetsGridRange(this))
      .setSortSpecs(sortObjs)

    batchUpdate({
      spreadsheetId: this.__getSpreadsheetId(),
      requests: [{ sortRange: request }]
    })

    return this

  }
  trimWhitespace() {
    const { nargs, matchThrow } = signatureArgs(arguments, "Range.splitTextToColumns")
    if (nargs > 0) matchThrow()
    const request = Sheets.newTrimWhitespaceRequest()
      .setRange(makeSheetsGridRange(this))

    batchUpdate({
      spreadsheetId: this.__getSpreadsheetId(),
      requests: [{ trimWhitespace: request }]
    })

    return this
  }

  toString() {
    return 'Range'
  }

  //-- private helpers


  __getColorItem = (color) => {
    // this can be a little complex since the color objects are allowed to be both rgb color and theme colors mixed
    const isTheme = (ob) => ob.getColorType().toString() === "THEME"
    const isRgb = (ob) => ob.getColorType().toString() === "RGB"
    const getItem = (ob) => {
      if (isTheme(ob)) {
        return themed(ob.asThemeColor().getThemeColorType().toString())
      } else if (isRgb(ob)) {
        return rgb(ob.asRgbColor().asHexString())
      } else {
        throw new Error('unexpected color value', ob)
      }
    }
    const themed = (value) => ({
      userEnteredFormat: {
        backgroundColorStyle: {
          themeColor: value
        }
      }
    })

    // although you'd expect this to be background rather than style, we can use backgroundColorStyle to allow the mixing of both theme and color
    const rgb = (value) => ({
      userEnteredFormat: {
        backgroundColorStyle: {
          rgbColor: hexToRgb(value)
        }
      }
    })
    return getItem(color)
  }

  __getRangeWithSheet(range) {
    return `${range.getSheet().getName()}!${range.getA1Notation()}`
  }


  /**
   * get the spreadsheet hosting this range
   * @return {FakeSpreadsheet}
   */
  __getSpreadsheet() {
    return this.getSheet().getParent()
  }
  /**
   * get the id of the spreadsheet hosting this range
   * returns {string}
   */
  __getSpreadsheetId() {
    return this.__getSpreadsheet().getId()
  }

  /**
   * sometimes a range has no  grid range so we need to fake one
   */
  get __gridRange() {
    return getGridRange(this)
  }

  __toGridRange(range = this) {
    const gr = makeGridRange(range)

    // convert to a sheets style
    return Sheets.newGridRange(gr)
      .setSheetId(gr.sheetId)
      .setStartRowIndex(gr.startRowIndex)
      .setStartColumnIndex(gr.startColumnIndex)
      .setEndRowIndex(gr.endRowIndex)
      .setEndColumnIndex(gr.endColumnIndex)
  }
  __getTopLeft() {
    return this.offset(0, 0, 1, 1)
  }

  __getWithSheet() {
    return this.__getRangeWithSheet(this)
  }



  __setValues({ values, single = false, options = { valueInputOption: "RAW" } }) {

    const range = single ? this.__getRangeWithSheet(this.__getTopLeft()) : this.__getWithSheet()
    const request = {
      ...options,
      data: [{
        majorDimension: "ROWS",
        range,
        values
      }]
    }
    Sheets.Spreadsheets.Values.batchUpdate(request, this.__getSpreadsheetId())
    return this
  }

}