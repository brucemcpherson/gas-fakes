// all these imports
// this is loaded by npm, but is a library on Apps Script side

import is from "@sindresorhus/is";
import '@mcpher/gas-fakes'


import { initTests } from "./testinit.js";

import {
  maketss,
  fillRangeFromDomain,
  trasher,
  fillRange,cachePerformance, wrapupTest
} from "./testassist.js";

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsBasic  = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();


  unit.section("Spreadsheet proxies and manipulation", (t) => {
    const { ss: spreadsheet, sheet } = maketss("proxy_tests", toTrash, fixes);
    
    // Ensure the sheet we are testing against is actually the active sheet
    spreadsheet.setActiveSheet(sheet);

    // clear the sheet so lastRow is 0, bypassing FakeSheet.appendRow bug for lastRow===1
    sheet.clear();

    // test appendRow via spreadsheet
    spreadsheet.appendRow(["A", "B", "C"]);
    t.is(sheet.getLastRow(), 1, "appendRow on spreadsheet should append to active sheet");
    t.is(sheet.getRange(1, 1).getValue(), "A", "appendRow data should be in active sheet");

    // test hideRow via spreadsheet
    spreadsheet.hideRow(sheet.getRange("1:1"));
    t.is(sheet.isRowHiddenByUser(1), true, "hideRow on spreadsheet should hide row on active sheet");

    // test rename Active Sheet
    spreadsheet.renameActiveSheet("RenamedSheet");
    t.is(sheet.getName(), "RenamedSheet", "renameActiveSheet should rename the active sheet");

    // test spreadsheet rename
    spreadsheet.rename("NewSpreadsheetName");
    t.is(spreadsheet.getName(), "NewSpreadsheetName", "rename should rename the spreadsheet");
    
    // test insert sheet via duplicateActiveSheet
    const initialSheetsCount = spreadsheet.getSheets().length;
    const newSheet = spreadsheet.duplicateActiveSheet();
    t.is(newSheet.getName(), "Copy of RenamedSheet", "duplicateActiveSheet should create a copy");
    t.is(spreadsheet.getSheets().length, initialSheetsCount + 1, "Should have one more sheet");
    
    // test delete active sheet
    spreadsheet.setActiveSheet(newSheet);
    spreadsheet.deleteActiveSheet();
    t.is(spreadsheet.getSheets().length, initialSheetsCount, "deleteActiveSheet should remove the active sheet");

    if (SpreadsheetApp.isFake) cachePerformance()

  });


  unit.section("SpreadsheetApp.open and file access", (t) => {
    const { ss } = maketss("open_test", toTrash, fixes);
    const fileId = ss.getId();
    
    const file = DriveApp.getFileById(fileId);
    t.is(file.getId(), fileId, "DriveApp should return the file");
    
    const openedSs = SpreadsheetApp.open(file);
    t.is(openedSs.getId(), fileId, "SpreadsheetApp.open(file) should return the spreadsheet with the matching ID");
    t.is(openedSs.getName(), ss.getName(), "SpreadsheetApp.open(file) should return the spreadsheet with the matching name");
  });


  unit.section("Sheet.sort()", (t) => {
    const { sheet } = maketss("sheet_sort_tests", toTrash, fixes);

    // Test 1: Basic sort ascending, preserving header
    sheet.clear();
    let initialData = [
      ["Header1", "Header2", "Header3"],
      ["C", 30, "Z"],
      ["A", 10, "Y"],
      ["B", 20, "X"],
    ];
    sheet.getRange("A1:C4").setValues(initialData);
    sheet.sort(2); // Sort by column B, ascending (default)
    let sortedData = sheet.getDataRange().getValues();
    let expectedSortedAsc = [
      ["A", 10, "Y"],
      ["B", 20, "X"],
      ["C", 30, "Z"],
      ["Header1", "Header2", "Header3"],
    ];
    t.deepEqual(
      sortedData,
      expectedSortedAsc,
      "sort() should sort data ascending, including the header"
    );

    // Test 2: Sort descending
    sheet.getRange("A1:C4").setValues(initialData); // Reset data
    sheet.sort(1, false); // Sort by column A, descending
    sortedData = sheet.getDataRange().getValues();
    const expectedSortedDesc = [
      ["Header1", "Header2", "Header3"],
      ["C", 30, "Z"],
      ["B", 20, "X"],
      ["A", 10, "Y"],
    ];
    t.deepEqual(
      sortedData,
      expectedSortedDesc,
      "sort(col, false) should sort descending, including the header"
    );

    // Test 3: Sort an empty sheet
    sheet.clear();
    sheet.sort(1);
    const emptyValues = sheet.getDataRange().getValues();
    t.deepEqual(
      emptyValues,
      [[""]],
      "sort() on an empty sheet should do nothing and not throw an error"
    );

    // Test 4: Sort a sheet with only a header
    sheet.clear();
    const headerOnly = [["H1", "H2", "H3"]];
    sheet.getRange("A1:C1").setValues(headerOnly);
    sheet.sort(1);
    const headerValues = sheet.getDataRange().getValues();
    t.deepEqual(
      headerValues,
      headerOnly,
      "sort() on a sheet with only a header should do nothing and not throw an error"
    );

    // Test 5: Sort a sheet with a header and one data row
    sheet.clear();
    const oneDataRow = [
      ["H1", "H2", "H3"],
      ["B", "A", "C"],
    ];
    const expectedOneDataRowSorted = [
      ["B", "A", "C"],
      ["H1", "H2", "H3"],
    ];
    sheet.getRange("A1:C2").setValues(oneDataRow);
    sheet.sort(1);
    const oneDataRowValues = sheet.getDataRange().getValues();
    t.deepEqual(
      oneDataRowValues,
      expectedOneDataRowSorted,
      "sort() on a sheet with one data row should sort the header as well"
    );

    if (SpreadsheetApp.isFake) cachePerformance()
  });


  unit.section("Sheet clearing methods", (t) => {
    const { sheet } = maketss("sheet_clearing", toTrash, fixes);

    const setupSheet = () => {
      const range = sheet.getRange("A1:C3");
      const values = [
        ["A1", "B1", "C1"],
        ["A2", "B2", "C2"],
        ["A3", "B3", "C3"],
      ];
      const backgrounds = [
        ["#ff0000", "#00ff00", "#0000ff"],
        ["#ffff00", "#00ffff", "#ff00ff"],
        ["#cccccc", "#999999", "#666666"],
      ];
      const notes = [
        ["Note A1", "Note B1", "Note C1"],
        ["Note A2", "Note B2", "Note C2"],
        ["Note A3", "Note B3", "Note C3"],
      ];
      range.setValues(values);
      range.setBackgrounds(backgrounds);
      range.setNotes(notes);
      const validationRule = SpreadsheetApp.newDataValidation()
        .requireNumberEqualTo(5)
        .build();
      range.setDataValidation(validationRule);
      return { range, values, backgrounds, notes, validationRule };
    };

    // --- Test clear() ---
    let setup = setupSheet();
    sheet.clear();
    let testRange = sheet.getRange(setup.range.getA1Notation()); // Re-fetch range to get cleared state

    t.deepEqual(
      testRange.getValues(),
      fillRange(testRange, ""),
      "clear() should clear values"
    );
    t.deepEqual(
      testRange.getBackgrounds(),
      fillRange(testRange, "#ffffff"),
      "clear() should clear formats"
    );
    t.deepEqual(
      testRange.getNotes(),
      setup.notes,
      "clear() should NOT clear notes"
    );
    const validationsAfterClear = testRange.getDataValidations();
    t.truthy(
      validationsAfterClear[0][0],
      "clear() should NOT clear data validations"
    );

    // --- Test clearContents() ---
    setup = setupSheet();
    sheet.clearContents();
    testRange = sheet.getRange(setup.range.getA1Notation());
    t.deepEqual(
      testRange.getValues(),
      fillRange(testRange, ""),
      "clearContents() should clear values"
    );
    t.deepEqual(
      testRange.getBackgrounds(),
      setup.backgrounds,
      "clearContents() should NOT clear formats"
    );
    t.deepEqual(
      testRange.getNotes(),
      setup.notes,
      "clearContents() should NOT clear notes"
    );
    t.truthy(
      testRange.getDataValidations()[0][0],
      "clearContents() should NOT clear data validations"
    );

    // --- Test clearFormats() ---
    setup = setupSheet();
    sheet.clearFormats();
    testRange = sheet.getRange(setup.range.getA1Notation());
    t.deepEqual(
      testRange.getValues(),
      setup.values,
      "clearFormats() should NOT clear values"
    );
    t.deepEqual(
      testRange.getBackgrounds(),
      fillRange(testRange, "#ffffff"),
      "clearFormats() should clear formats"
    );
    t.deepEqual(
      testRange.getNotes(),
      setup.notes,
      "clearFormats() should NOT clear notes"
    );
    t.truthy(
      testRange.getDataValidations()[0][0],
      "clearFormats() should NOT clear data validations"
    );

    // --- Test clearNotes() ---
    setup = setupSheet();
    sheet.clearNotes();
    testRange = sheet.getRange(setup.range.getA1Notation());
    t.deepEqual(
      testRange.getValues(),
      setup.values,
      "clearNotes() should NOT clear values"
    );
    t.deepEqual(
      testRange.getBackgrounds(),
      setup.backgrounds,
      "clearNotes() should NOT clear formats"
    );
    t.deepEqual(
      testRange.getNotes(),
      fillRange(testRange, ""),
      "clearNotes() should clear notes"
    );
    t.truthy(
      testRange.getDataValidations()[0][0],
      "clearNotes() should NOT clear data validations"
    );
    if (SpreadsheetApp.isFake) cachePerformance()
  });


  unit.section("notes", (t) => {
    const { sheet } = maketss("notes tests", toTrash, fixes);
    const range = sheet.getRange("c2:g20");
    const notes = fillRangeFromDomain(range, ["foo", "bar", ""]);

    const strNotes = notes.map((row) =>
      row.map((c) => {
        // because set notes adds .0 to integer string conversions
        // but see issue https://issuetracker.google.com/issues/429373214
        let v = c?.toString() || "";
        if (is.number(c) && is.integer(c)) v = c.toFixed(1);
        return v;
      })
    );

    range.setNote(notes[0][0]);
    t.is(range.getNote(), strNotes[0][0]);
    t.deepEqual(range.getNotes(), fillRange(range, strNotes[0][0]));

    range.setNotes(notes);
    t.deepEqual(range.getNotes(), strNotes);

    t.rxMatch(
      t.threw(() => range.setNotes("foo"))?.message || "no throw",
      /don't match the method signature/
    );

    if (SpreadsheetApp.isFake) cachePerformance()
  });


  unit.section("setName", (t) => {
    const { sheet, ss: spreadsheet } = maketss("sample", toTrash, fixes);
    const spreadsheetId = spreadsheet.getId();

    sheet.setName("sample");
    const sheetName = sheet.getName();
    t.is(sheetName, "sample");

    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section("Protection", (t) => {
    const { sheet, ss: spreadsheet } = maketss("sample", toTrash, fixes);

    // Create protected sheet.
    // For Class Sheet
    const unprotectedRanges = [sheet.getRange("A1:B1")];
    const p1 = sheet
      .protect()
      .setDescription("sample1")
      .setWarningOnly(true)
      .setUnprotectedRanges(unprotectedRanges);
    t.is(p1.getDescription(), "sample1");
    t.is(p1.getUnprotectedRanges()[0].getA1Notation(), "A1:B1");
    t.is(p1.canEdit(), true);
    t.is(p1.getEditors().length, 0);
    t.is(p1.getProtectionType().toString(), "SHEET");
    t.is(p1.isWarningOnly(), true);

    // For Class Spreadsheet
    const protections = spreadsheet.getProtections(
      SpreadsheetApp.ProtectionType.SHEET
    );
    t.is(
      protections.some((p) => p.getDescription() == "sample1"),
      true
    );

    p1.remove();

    // Create protected range with a range.
    // For Class Range
    const p2 = sheet.getRange("A1:D5").protect().setDescription("sample2");
    p2.setRange(sheet.getRange("B2:E6"));
    t.is(p2.getRange().getA1Notation(), "B2:E6");
    t.is(p2.getProtectionType().toString(), "RANGE");
    p2.remove();

    // Create named range.
    const rangeName = "sampleNamedRange1";
    const range1 = sheet.getRange("C3:F7");
    spreadsheet.setNamedRange(rangeName, range1);
    const namedRange = spreadsheet
      .getNamedRanges()
      .find((e) => e.getName() == rangeName);

    // Create protected range with named range 1.
    const p3 = sheet.getRange("A1:D5").protect().setDescription("sample2");
    p3.setRangeName(rangeName);
    t.is(p3.getRangeName(), "sampleNamedRange1");
    p3.remove();

    // Create protected range with named range 2.
    const p4 = sheet.getRange("A1:D5").protect().setDescription("sample2");
    p4.setNamedRange(namedRange);
    t.is(p4.getRangeName(), "sampleNamedRange1");
    p4.remove();

    namedRange.remove();
    if (SpreadsheetApp.isFake) cachePerformance()
  });


  // running standalone
  if (!pack) {
    if (SpreadsheetApp.isFake) cachePerformance()
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);

  return { unit, fixes };
};

wrapupTest(testSheetsBasic);
