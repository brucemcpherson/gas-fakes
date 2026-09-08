// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '@mcpher/gas-fakes'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { maketss, wrapupTest, trasher , cachePerformance} from './testassist.js';



// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsText = (pack) => {

  const toTrash = [];
  const { unit, fixes } = pack || initTests()

  unit.section("spreadsheet textfinder", t => {
    const searchText = "sample";
    const values = [
      ["sample", "sámplé"],
      ["SampleA", "sámplé"],
      ["=SAMPLE()", "=SámpléB()"],
      ["=sample()", "=sámpléB()"],
      ["=sampleA()", "=sámpléB()"],
    ];

    const { sheet, ss: spreadsheet } = maketss('sample', toTrash, fixes);
    sheet.clear();

    sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
    const range = sheet.getRange("A3:B5");

    const obj = {
      spreadsheetTextFinder: spreadsheet,
      sheetTextFinder: sheet,
      rangeTextFinder: range,
    };
    const ar = Object.entries(obj);

    const res1 = Object.fromEntries(
      [...ar].map(([k, v]) => [
        k,
        v
          .createTextFinder(searchText)
          .findAll()
          .map((r) => r.getA1Notation()),
      ])
    );

    t.deepEqual(res1, {
      spreadsheetTextFinder: ['A1', 'A2'],
      sheetTextFinder: ['A1', 'A2'],
      rangeTextFinder: []
    })


    const res2 = Object.fromEntries(
      [...ar].map(([k, v]) => [
        k,
        v
          .createTextFinder(searchText)
          .ignoreDiacritics(true)
          .matchCase(true)
          .matchEntireCell(true)
          .findAll()
          .map((r) => r.getA1Notation()),
      ])
    );
    t.deepEqual(res2, {
      spreadsheetTextFinder: ['A1', 'B1', 'B2'],
      sheetTextFinder: ['A1', 'B1', 'B2'],
      rangeTextFinder: []
    })

    const res3 = Object.fromEntries(
      [...ar].map(([k, v]) => [
        k,
        v
          .createTextFinder(searchText)
          .matchFormulaText(true)
          .findAll()
          .map((r) => r.getA1Notation()),
      ])
    );
    t.deepEqual(res3, {
      spreadsheetTextFinder: ['A1', 'A2', 'A3', 'A4', 'A5'],
      sheetTextFinder: ['A1', 'A2', 'A3', 'A4', 'A5'],
      rangeTextFinder: ['A3', 'A4', 'A5']
    })

    const res4 = Object.fromEntries(
      [...ar].map(([k, v]) => [
        k,
        v
          .createTextFinder(searchText)
          .matchFormulaText(true)
          .ignoreDiacritics(true)
          .matchCase(true)
          .matchEntireCell(true)
          .findAll()
          .map((r) => r.getA1Notation()),
      ])
    );
    t.deepEqual(res4, {
      spreadsheetTextFinder: ['A1', 'B1', 'B2'],
      sheetTextFinder: ['A1', 'B1', 'B2'],
      rangeTextFinder: []
    })


    const res5 = Object.fromEntries(
      [...ar].map(([k, v]) => {
        sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
        return [k, v.createTextFinder(searchText).replaceAllWith("test")];
      })
    );
    t.deepEqual(res5, { spreadsheetTextFinder: 2, sheetTextFinder: 2, rangeTextFinder: 0 })

    const res6 = Object.fromEntries(
      [...ar].map(([k, v]) => {
        sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
        return [
          k,
          v
            .createTextFinder(searchText)
            .matchFormulaText(true)
            .matchCase(true)
            .matchEntireCell(true)
            .replaceAllWith("test"),
        ];
      })
    );
    t.deepEqual(res6, { spreadsheetTextFinder: 1, sheetTextFinder: 1, rangeTextFinder: 0 })

    if (SpreadsheetApp.isFake) cachePerformance()

  })

  unit.section('insert sheets,rows,columns', t => {
    const { ss: spreadsheet } = maketss('sample', toTrash, fixes);
    const sheet = spreadsheet.insertSheet("temp");

    /**
     * appendRow
     * 
     */
    const data = ["sample1", "sample2", "sample3"]
    sheet.appendRow(data).getSheetId()
    t.is(sheet.getLastRow(), 1)
    t.is(sheet.getLastColumn(), data.length)
    t.deepEqual(sheet.getRange(1, 1, 1, data.length).getValues(), [data])


    /**
     * hideSheet, showSheet
     */
    sheet.hideSheet();
    t.true(sheet.isSheetHidden(), {
      skip: SpreadsheetApp.isFake,
      description: 'skip this test until issheethidden works'
    })
    sheet.showSheet();
    t.false(sheet.isSheetHidden())


    /**
     * autoResizeColumn, autoResizeColumns
     * there's no method to check if this is set to autoresize
     */
    sheet.getRange(1, 1, 1, data.length).setValues([data]);
    sheet.autoResizeColumn(2);
    sheet.autoResizeColumns(1, 3);


    /**
     * insertColumnAfter,insertColumnBefore,insertColumns,insertColumnsAfter,insertColumnsBefore
     */
    let cb = sheet.getLastColumn()
    sheet.insertColumnAfter(2);
    t.is(sheet.getLastColumn(), cb + 1)
    t.is(sheet.getDataRange().offset(0, 2, 1, 1).getValue(), '')
    sheet.insertColumnBefore(2);
    t.is(sheet.getLastColumn(), cb + 2)
    t.is(sheet.getDataRange().offset(0, 1, 1, 1).getValue(), '')
    sheet.insertColumns(2, 2);
    t.is(sheet.getLastColumn(), cb + 4)
    sheet.insertColumnsAfter(2, 2);
    t.is(sheet.getLastColumn(), cb + 6)
    sheet.insertColumnsBefore(2, 2);
    t.is(sheet.getLastColumn(), cb + 8)

    /**
     * insertRowAfter, insertRowBefore, insertRows, insertRowsAfter, insertRowsBefore
     */
    let cr = sheet.getLastRow()
    sheet.insertRowAfter(2);
    // blank row so lastrow doesnt increase
    t.is(sheet.getLastRow(), cr)
    sheet.insertRowBefore(2);
    t.is(sheet.getLastRow(), cr)
    sheet.insertRows(2, 2);
    t.is(sheet.getLastRow(), cr)
    sheet.insertRowsAfter(2, 2);
    t.is(sheet.getLastRow(), cr)
    sheet.insertRowsBefore(2, 2);
    t.is(sheet.getLastRow(), cr)

    /**
     * deleteColumn, deleteColumns, deleteRow, deleteRows
     */
    cb = sheet.getLastColumn()
    cr = sheet.getLastRow()
    sheet.deleteColumn(2);
    t.is(sheet.getLastColumn(), cb - 1)
    sheet.deleteColumns(2, 2);
    t.is(sheet.getLastColumn(), cb - 3)
    sheet.deleteRow(2);
    t.is(sheet.getLastRow(), cr)
    sheet.deleteRows(2, 2);
    t.is(sheet.getLastRow(), cr)

    const v = sheet.getDataRange().getValues()
    t.deepEqual(v.slice(-1), [data.slice(0, 1).concat(['', '', '', ''], data.slice(1, 2), [''], data.slice(-1))])

    /**
     * TODO iscolumn/row hidden by user needs to be implemented 
     * and uncomment these tests
     * hideColumn, hideColumns, hideRow, hideRows, unhideColumn, unhideRow
     */
    const r = sheet.getRange("B2")
    sheet.hideColumn(r);
    if (!SpreadsheetApp.isFake) {
      t.true(sheet.isColumnHiddenByUser(2), {
        skip: SpreadsheetApp.isFake,
        description: 'skip this test until iscolumnhiddenbyuser works'
      });
    }
    sheet.hideColumns(2, 2);
    if (!SpreadsheetApp.isFake) {
      t.true(sheet.isColumnHiddenByUser(2), {
        skip: SpreadsheetApp.isFake,
        description: 'skip this test until iscolumnhiddenbyuser works'
      });
      t.true(sheet.isColumnHiddenByUser(3), {
        skip: SpreadsheetApp.isFake,
        description: 'skip this test until iscolumnhiddenbyuser works'
      });
    }
    sheet.hideRow(r);
    if (!SpreadsheetApp.isFake) {
      t.true(sheet.isRowHiddenByUser(2), {
        skip: SpreadsheetApp.isFake,
        description: 'skip this test until isrowhiddenbyuser works'
      });
    }
    sheet.hideRows(2, 2);
    if (!SpreadsheetApp.isFake) {
      t.true(sheet.isRowHiddenByUser(2), {
        skip: SpreadsheetApp.isFake,
        description: 'skip this test until isrowhiddenbyuser works'
      });
      t.true(sheet.isRowHiddenByUser(3), {
        skip: SpreadsheetApp.isFake,
        description: 'skip this test until isrowhiddenbyuser works'
      });
    }

    sheet.unhideColumn(r);
    if (!SpreadsheetApp.isFake) {
      t.false(sheet.isColumnHiddenByUser(2), {
        skip: SpreadsheetApp.isFake,
        description: 'skip this test until iscolumnhiddenbyuser works'
      });
      sheet.unhideRow(r);
      t.false(sheet.isRowHiddenByUser(2), {
        skip: SpreadsheetApp.isFake,
        description: 'skip this test until isrowhiddenbyuser works'
      });
    }

    if (SpreadsheetApp.isFake) cachePerformance()

  })



  // running standalone
  if (!pack) {
    if (SpreadsheetApp.isFake) cachePerformance()
    unit.report()

  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes }
}

wrapupTest(testSheetsText);