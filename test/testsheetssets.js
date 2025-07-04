
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { getSheetsPerformance } from '../src/support/sheetscache.js';
import { getPerformance } from '../src/support/filecache.js';
import { maketss, trasher, makeSheetsGridRange, makeExtendedValue, dateToSerial, fillRange, arrMatchesRange, fillRangeFromDomain } from './testassist.js';
import is from '@sindresorhus/is';



// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsSets = (pack) => {

  const { unit, fixes } = pack || initTests()
  const toTrash = []

  unit.section("Splitting text into columns", t => {
    const { sheet: sv } = maketss('splitting', toTrash, fixes)
    const startAt = sv.getRange("a1:d4")

    const getSplit = (delim) => {
      return [
        [`a1${delim}b1${delim}c1`, '', '', ''],
        [`a2`, '', '', ''],
        [`a3${delim}b3${delim}c3${delim}d3`, '', '', ''],
        [`a4${delim}${delim}c4`, '', '', '']
      ]
    }
    const r1 = startAt.offset(0, 0)
    const source1 = r1.offset(0, 0, r1.getNumRows(), 1)
    const split1 = getSplit (",")
    const expect = split1.map(row => {
      const nr = row[0].toString().split(",")
      return nr.concat(Array.from({ length: row.length - nr.length }).fill(''))
    })

    r1.setValues(split1)
    source1.splitTextToColumns()
    const d1 = r1.getValues()
    t.deepEqual(d1, expect)

    // try a custom delimiter
    const r2 = startAt.offset(5, 1)
    const source2 = r2.offset(0, 0, r2.getNumRows(), 1)
    const split2 = getSplit (":")

    r2.setValues(split2)
    source2.splitTextToColumns(":")
    const d2 = r2.getValues()
    t.deepEqual(d2, expect)

    // finally an enum separator
    const r3 = startAt.offset(10, 2)
    const source3 = r3.offset(0, 0, r2.getNumRows(), 1)
    const split3 = getSplit (" ")

    r3.setValues(split3)
    source3.splitTextToColumns(SpreadsheetApp.TextToColumnsDelimiter.SPACE)
    const d3 = r3.getValues()
    t.deepEqual(d3, expect)


    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })
  unit.section("advanced class maker", t => {
    const { sheet: sv, ss } = maketss('adv classes', toTrash, fixes)
    const spreadsheetId = ss.getId()
    const range = sv.getRange("a1:c4")
    const gr = makeSheetsGridRange(range)

    const sheetId = sv.getSheetId()
    t.is(gr.getSheetId(), sheetId)

    const cdVals = [[true, 2, new Date()], ['cheese', false, 'bar'], [1, 2, 'x'], ['a', new Date("2-DEC-1938 12:23:39.123"), false]]
    const cdrRows = cdVals.map(row =>
      Sheets.newRowData().setValues(row.map(cell => Sheets.newCellData().setUserEnteredValue(makeExtendedValue(cell))))
    )
    const cdrFields = "userEnteredValue"

    const ucr = Sheets.newUpdateCellsRequest()
    ucr.setRows(cdrRows)
      .setFields(cdrFields)
      .setRange(gr)

    t.deepEqual(ucr.getRange(), gr)
    t.is(ucr.getFields(), cdrFields)


    const rubr = Sheets.newBatchUpdateSpreadsheetRequest()
    const rubrt = {
      includeSpreadsheetInResponse: false,
      requests: [{
        updateCells: ucr
      }],
      responseIncludeGridData: false
    }

    rubr.setRequests(rubrt.requests)

    const response = Sheets.Spreadsheets.batchUpdate(rubr, spreadsheetId)
    t.is(response.spreadsheetId, spreadsheetId)
    t.true(is.array(response.replies))

    const tr = `${sv.getName()}!${range.getA1Notation()}`
    const data = Sheets.Spreadsheets.Values.get(spreadsheetId, tr)

    // a bit tricky to compare values as the api returns converted strings
    const valueChecker = (original, cell) => {
      if (is.date(original)) {
        // the api loses some precision so match up to whatever we got from the api
        return dateToSerial(original).toFixed(cell.replace(/.*\./, "").length)
      } else if (is.boolean(original)) {
        return original.toString().toUpperCase()
      } else {
        return original.toString()
      }
    }
    data.values.forEach((row, i) => row.forEach((cell, j) => t.is(valueChecker(cdVals[i][j], cell), cell)))
    t.is(data.majorDimension, "ROWS")
    t.is(sv.getRange(data.range).getA1Notation(), range.getA1Notation())

  })

  unit.section("clearing ranges", t => {
    const { sheet: sv } = maketss('clearing', toTrash, fixes)

    // make a couple of fake validations
    const builder = SpreadsheetApp.newDataValidation()
    const values = [[1, 2], true]
    const dv = builder.requireValueInList(...values).build()
    const cr = sv.getRange("!c2:e5")
    cr.setDataValidation(dv)
    const cbs = cr.getDataValidations()
    t.is(cbs.length, cr.getNumRows())
    t.is(cbs[0].length, cr.getNumColumns())

    cr.clearDataValidations()
    const cbs2 = cr.getDataValidations()
    t.deepEqual(cbs2, fillRange(cr, null))
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })

  // running standalone
  if (!pack) {
    if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    unit.report()

  }

  trasher(toTrash)
  return { unit, fixes }
}

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testSheetsSets()
