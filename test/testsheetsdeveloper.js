// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '@mcpher/gas-fakes'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { maketss, wrapupTest, trasher , cachePerformance} from './testassist.js';


// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsDeveloper = (pack) => {

  const toTrash = [];
  const { unit, fixes } = pack || initTests()


  unit.section("A1 Notation Range Parsing", t => {
    const { sheet } = maketss('a1_notation_tests', toTrash, fixes);
    const maxRows = sheet.getMaxRows();
    const maxCols = sheet.getMaxColumns();

    // Test case 1: Full cell range
    let range = sheet.getRange("B2:D5");
    t.is(range.getRow(), 2, "Full range: start row");
    t.is(range.getColumn(), 2, "Full range: start column");
    t.is(range.getNumRows(), 4, "Full range: num rows");
    t.is(range.getNumColumns(), 3, "Full range: num columns");
    t.is(range.getA1Notation(), "B2:D5", "Full range: A1 notation");

    // Test case 2: Single cell with $
    range = sheet.getRange("$C$3");
    t.is(range.getA1Notation(), "C3", "Single cell with $: A1 notation");

    // Test case 3: Row-only range
    range = sheet.getRange("5:7");
    t.is(range.getNumRows(), 3, "Row-only: num rows");
    t.is(range.getNumColumns(), maxCols, "Row-only: num columns");
    t.is(range.getA1Notation(), "5:7", "Row-only: A1 notation");

    // Test case 4: Column-only range
    range = sheet.getRange("D:F");
    t.is(range.getNumRows(), maxRows, "Column-only: num rows");
    t.is(range.getNumColumns(), 3, "Column-only: num columns");
    t.is(range.getA1Notation(), "D:F", "Column-only: A1 notation");

    // Test case 5: Sheet name included
    range = sheet.getRange(`${sheet.getName()}!E10:F12`);
    t.is(range.getA1Notation(), "E10:F12", "With sheet name: A1 notation");

    // Test case 6: Inverted ranges are auto-corrected
    range = sheet.getRange("C5:B2");
    t.is(range.getA1Notation(), "B2:C5", "Inverted cell range should be corrected");
    range = sheet.getRange("5:2");
    t.is(range.getA1Notation(), "2:5", "Inverted row-only range should be corrected");
    range = sheet.getRange("D:B");
    t.is(range.getA1Notation(), "B:D", "Inverted column-only range should be corrected");
    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section("Range Bounded Methods", t => {
    const { sheet } = maketss('range_bounded_tests', toTrash, fixes);

    // 1. Test a fully bounded range
    const boundedRange = sheet.getRange("A5:C10");
    t.is(boundedRange.isStartRowBounded(), true, "Bounded range should have start row bound");
    t.is(boundedRange.isEndRowBounded(), true, "Bounded range should have end row bound");
    t.is(boundedRange.isStartColumnBounded(), true, "Bounded range should have start column bound");
    t.is(boundedRange.isEndColumnBounded(), true, "Bounded range should have end column bound");

    // 2. Test a row-only range
    const rowRange = sheet.getRange("3:5");
    t.is(rowRange.isStartRowBounded(), true, "Row-only range should have start row bound");
    t.is(rowRange.isEndRowBounded(), true, "Row-only range should have end row bound");
    t.is(rowRange.isStartColumnBounded(), false, "Row-only range should not have start column bound");
    t.is(rowRange.isEndColumnBounded(), false, "Row-only range should not have end column bound");

    // 3. Test a column-only range
    const colRange = sheet.getRange("B:D");
    t.is(colRange.isStartRowBounded(), false, "Column-only range should not have start row bound");
    t.is(colRange.isEndRowBounded(), false, "Column-only range should not have end row bound");
    t.is(colRange.isStartColumnBounded(), true, "Column-only range should have start column bound");
    t.is(colRange.isEndColumnBounded(), true, "Column-only range should have end column bound");

    // 4. Test a single unbounded row
    const singleRowRange = sheet.getRange("7:7");
    t.is(singleRowRange.isStartRowBounded(), true, "Single row range should have start row bound");
    t.is(singleRowRange.isEndRowBounded(), true, "Single row range should have end row bound");

    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section("Developer Metadata", t => {
    const { ss, sheet } = maketss('dev_metadata_tests', toTrash, fixes);

    let colMeta, entireRowMeta, sheetMeta;

    // Define ranges for testing
    const multiDimRange = sheet.getRange("B2:D4");      // Arbitrary multi-row, multi-column
    const partialRowRange = sheet.getRange("B6:D6");    // Arbitrary single-row, multi-column
    const partialColumnRange = sheet.getRange("F2:F5"); // Arbitrary single-column, multi-row
    const singleCellRange = sheet.getRange("A1"); // Valid single-cell
    const entireRowRange = sheet.getRange("8:8");      // Valid entire row
    const entireColumnRange = sheet.getRange("G:G");   // Valid entire column

    // Test adding to a multi-column, multi-row range (should fail)
    const expectedError = /Adding developer metadata to arbitrary ranges is not currently supported. Developer metadata may only be added to the top-level spreadsheet, an individual sheet, or an entire row or column./;
    t.rxMatch((t.threw(() => multiDimRange.addDeveloperMetadata("multiKey", "multiValue")))?.message || "no error thrown", expectedError, "Should throw error for multi-dimension arbitrary range");

    // Test adding to a partial row range (should fail)
    t.rxMatch((t.threw(() => partialRowRange.addDeveloperMetadata("partialRowKey", "partialRowValue")))?.message || "no error thrown", expectedError, "Should throw error for partial row arbitrary range");

    // Test adding to a partial column range (should fail)
    t.rxMatch((t.threw(() => partialColumnRange.addDeveloperMetadata("partialColKey", "partialColValue")))?.message || "no error thrown", expectedError, "Should throw error for partial column arbitrary range");

    // Test adding to a single cell range (should fail as it's not an entire row/column)
    t.rxMatch((t.threw(() => singleCellRange.addDeveloperMetadata("cellKey", "cellValue")))?.message || "no error thrown", expectedError, "Should throw error for single cell range");

    // Test adding to an entire column range (should succeed)
    const returnedColRange = entireColumnRange.addDeveloperMetadata("colKey", "colValue", SpreadsheetApp.DeveloperMetadataVisibility.PROJECT);
    t.is(returnedColRange.getA1Notation(), entireColumnRange.getA1Notation(), "addDeveloperMetadata on Range should return the same range");
    const colMetas = entireColumnRange.getDeveloperMetadata();
    t.is(colMetas.length, 1, "Should find one metadata on entire column range");
    colMeta = colMetas[0];
    t.is(colMeta.getKey(), "colKey", "Column metadata key");
    t.is(colMeta.getValue(), "colValue", "Column metadata value");
    t.is(colMeta.getVisibility().toString(), "PROJECT", "Column metadata visibility");
    t.is(colMeta.getLocation().getLocationType().toString(), "COLUMN", "Column metadata location type");
    const foundColMeta = sheet.getRange("G3").getDeveloperMetadata();
    t.is(foundColMeta.length, 0, "Should NOT find column metadata on an intersecting single cell");

    // Test adding to an entire row range (should succeed)
    const returnedRowRange = entireRowRange.addDeveloperMetadata("entireRowKey", "entireRowValue");
    t.is(returnedRowRange.getA1Notation(), entireRowRange.getA1Notation(), "addDeveloperMetadata on Range should return the same range");
    const entireRowMetas = entireRowRange.getDeveloperMetadata();
    t.is(entireRowMetas.length, 1, "Should find one metadata on entire row range");
    entireRowMeta = entireRowMetas[0];
    t.is(entireRowMeta.getKey(), "entireRowKey", "Entire row metadata key");
    t.is(entireRowMeta.getLocation().getLocationType().toString(), "ROW", "Entire row metadata location type");
    const foundEntireRowMeta = sheet.getRange("C8").getDeveloperMetadata();
    t.is(foundEntireRowMeta.length, 0, "Should NOT find row metadata on an intersecting single cell");

    // Test Sheet metadata
    const returnedSheet = sheet.addDeveloperMetadata("sheetKey", "sheetValue");
    t.is(returnedSheet.getSheetId(), sheet.getSheetId(), "addDeveloperMetadata on Sheet should return the same sheet");
    const foundSheetMeta = sheet.getDeveloperMetadata();
    t.is(foundSheetMeta.length, 1, "Should find one metadata entry on sheet");
    sheetMeta = foundSheetMeta[0];
    t.is(sheetMeta.getKey(), "sheetKey", "Sheet metadata key");
    t.is(sheetMeta.getValue(), "sheetValue", "Sheet metadata value");
    t.is(sheetMeta.getVisibility().toString(), "DOCUMENT", "Sheet metadata default visibility");
    t.is(sheetMeta.getLocation().getLocationType().toString(), "SHEET", "Sheet metadata location type");
    t.is(foundSheetMeta.length, 1, "Should find one metadata entry on sheet");
    t.is(foundSheetMeta[0].getKey(), "sheetKey", "Found sheet metadata key should match");

    // Test Finder from Spreadsheet
    const finder = ss.createDeveloperMetadataFinder();
    finder.withKey("colKey");
    const results = finder.find();
    t.is(results.length, 1, "Finder should find metadata by key");
    t.is(results[0].getValue(), "colValue", "Finder result value should be correct");

    // Test finder with multiple criteria
    const finder2 = ss.createDeveloperMetadataFinder().withKey("sheetKey").withValue("sheetValue");
    const results2 = finder2.find();
    t.is(results2.length, 1, "Finder with multiple criteria should find metadata");
    t.is(results2[0].getId(), sheetMeta.getId(), "Finder with multiple criteria should find correct metadata");

    // Test update
    sheetMeta.setValue("updatedValue").setKey("updatedKey");
    const updatedMeta = sheet.getDeveloperMetadata()[0];
    t.is(updatedMeta.getValue(), "updatedValue", "Metadata value should be updated");
    t.is(updatedMeta.getKey(), "updatedKey", "Metadata key should be updated");

    // Test Move Methods
    const moveRange1 = sheet.getRange("9:9");
    const moveRange2 = sheet.getRange("J:J");
    const metaToMove = entireRowRange.getDeveloperMetadata()[0];
    
    // Move to Column
    metaToMove.moveToColumn(moveRange2);
    t.is(metaToMove.getLocation().getLocationType().toString(), "COLUMN", "Location type should be COLUMN after moveToColumn");
    t.is(metaToMove.getLocation().getColumn().getA1Notation(), "J:J", "Column should match after moveToColumn");
    
    // Move to Row
    metaToMove.moveToRow(moveRange1);
    t.is(metaToMove.getLocation().getLocationType().toString(), "ROW", "Location type should be ROW after moveToRow");
    t.is(metaToMove.getLocation().getRow().getA1Notation(), "9:9", "Row should match after moveToRow");
    
    // Move to Sheet
    const sheet2 = ss.insertSheet('MetaSheet2');
    toTrash.push(sheet2);
    metaToMove.moveToSheet(sheet2);
    t.is(metaToMove.getLocation().getLocationType().toString(), "SHEET", "Location type should be SHEET after moveToSheet");
    t.is(metaToMove.getLocation().getSheet().getSheetId(), sheet2.getSheetId(), "Sheet should match after moveToSheet");

    // Move to Spreadsheet
    metaToMove.moveToSpreadsheet();
    t.is(metaToMove.getLocation().getLocationType().toString(), "SPREADSHEET", "Location type should be SPREADSHEET after moveToSpreadsheet");
    t.is(metaToMove.getLocation().getSpreadsheet().getId(), ss.getId(), "Spreadsheet ID should match after moveToSpreadsheet");

    // Test remove
    colMeta.remove();
    t.is(entireColumnRange.getDeveloperMetadata().length, 0, "Column metadata should be removed from range");

    if (SpreadsheetApp.isFake) cachePerformance()
  });

  // running standalone
  if (!pack) {
    if (SpreadsheetApp.isFake) cachePerformance()
    unit.report()

  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes }
}


wrapupTest(testSheetsDeveloper);