// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '@mcpher/gas-fakes'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { maketss, wrapupTest, getDrivePerformance, getSheetsPerformance, trasher } from './testassist.js';
import is from '@sindresorhus/is';


// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsExotics = (pack) => {

  const toTrash = [];
  const { unit, fixes } = pack || initTests()

  unit.section("SpreadsheetApp active spreadsheet", (t) => {
    const { ss, sheet } = maketss(t.options.description, toTrash, fixes);

    // getActiveSpreadsheet should return the container-bound spreadsheet by default
    // note that it will be null if running on live apps script as a standalone script
    const activeSs = SpreadsheetApp.getActiveSpreadsheet();
    if (activeSs) {
      t.not(activeSs, null, "should get an active spreadsheet");
      t.is(
        activeSs.getId(),
        fixes.TEST_AIRPORTS_ID,
        "should get the container-bound spreadsheet"
      );
    } else {
      console.log('...skipping active spreadsheet check (not a container-bound script)')
    }

    // test setActiveSpreadsheet
    SpreadsheetApp.setActiveSpreadsheet(ss);
    const newActiveSs = SpreadsheetApp.getActiveSpreadsheet();
    t.is(
      newActiveSs.getId(),
      ss.getId(),
      "should get the newly set active spreadsheet"
    );
  });

  unit.section("RangeList exotic methods", t => {

    const { sheet } = maketss(t.options.description, toTrash, fixes);

    sheet.clear();

    const testRanges = ["A1:B2", "D4:E5"];
    const singleCellRanges = ["A1", "E5"];

    const clearTests = () => {
      const rangeList = sheet.getRangeList(testRanges);
      rangeList
        .getRanges()
        .forEach((r) => r.setValue("some content").setBackground("red"));
      rangeList.clear({ contentsOnly: true });
      rangeList.getRanges().forEach((r) => {
        t.is(r.isBlank(), true, `range ${r.getA1Notation()} should be blank after clear`);
        t.is(
          r.getBackground(),
          "#ff0000",
          `range ${r.getA1Notation()} background should still be red`
        );
      });
      rangeList.clear();
      rangeList.getRanges().forEach((r) => {
        t.is(
          r.getBackground(),
          "#ffffff",
          `range ${r.getA1Notation()} background should be white after full clear`
        );
      });
    }

    const settersTests = () => {
      const rangeList = sheet.getRangeList(singleCellRanges);
      rangeList
        .setValue("hello")
        .setBackground("blue")
        .setFontColor("yellow")
        .setFontWeight("bold")
        .setFontStyle("italic")
        .setFontSize(14)
        .setFontFamily("Arial")
        .setFontLine("underline")
        .setHorizontalAlignment("center")
        .setVerticalAlignment("middle")
        .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
        .setTextRotation(45)
        .setNote("a note");

      rangeList.getRanges().forEach((r) => {
        t.is(r.getValue(), "hello", "value should be set");
        t.is(r.getBackground(), "#0000ff", "background should be blue");
        t.is(r.getFontColor(), "#ffff00", "font color should be yellow");
        t.is(r.getFontWeight(), "bold", "font weight should be bold");
        t.is(r.getFontStyle(), "italic", "font style should be italic");
        t.is(r.getFontSize(), 14, "font size should be 14");
        t.is(r.getFontFamily(), "Arial", "font family should be Arial");
        t.is(r.getFontLine(), "underline", "font line should be underline");
        t.is(r.getHorizontalAlignment(), "center", "horizontal alignment should be center");
        t.is(r.getVerticalAlignment(), "middle", "vertical alignment should be middle");
        t.is(r.getWrapStrategy(), SpreadsheetApp.WrapStrategy.WRAP, "wrap strategy should be WRAP");
        // see https://issuetracker.google.com/issues/425390984 and readme oddities - textRotation.
        // The fake returns 0 because the API doesn't return the angle.
        const expectedDegrees = SpreadsheetApp.isFake ? 0 : 45;
        t.is(r.getTextRotation().getDegrees(), expectedDegrees, "text rotation should be 45");
        t.is(r.getTextRotation().isVertical(), false, "text rotation should not be vertical");
        t.is(r.getNote(), "a note", "note should be set");
      });

      rangeList.setFormula("=SUM(1,2)");
      rangeList.getRanges().forEach((r) => {
        t.is(r.getFormula(), "=SUM(1,2)", "formula should be set");
        t.is(r.getValue(), 3, "value from formula should be 3");
      });
    }

    const checkboxTests = () => {
      const rangeList = sheet.getRangeList(singleCellRanges);
      rangeList.insertCheckboxes();
      rangeList.getRanges().forEach((r) => {
        const dv = r.getDataValidation();
        t.not(dv, null, "should have data validation");
        t.is(dv.getCriteriaType(), SpreadsheetApp.DataValidationCriteria.CHECKBOX, "criteria should be checkbox");
      });
      rangeList.check();
      rangeList.getRanges().forEach((r) => {
        t.is(r.isChecked(), true, "should be checked");
      });
      rangeList.uncheck();
      rangeList.getRanges().forEach((r) => {
        t.is(r.isChecked(), false, "should be unchecked");
      });
      rangeList.removeCheckboxes();
      rangeList.getRanges().forEach((r) => {
        t.is(r.getDataValidation(), null, "should not have data validation");
      });
    }

    const trimTests = () => {
      const rangeList = sheet.getRangeList(singleCellRanges);
      rangeList.setValue("  whitespace  ");
      rangeList.trimWhitespace();
      rangeList.getRanges().forEach((r) => {
        t.is(r.getValue(), "whitespace", "whitespace should be trimmed");
      });
    }

    const borderTests = () => {
      const rangeList = sheet.getRangeList(testRanges);
      rangeList.setBorder(true, true, true, true, true, true, "red", SpreadsheetApp.BorderStyle.DOTTED);
      rangeList.getRanges().forEach((r) => {
        const borders = r.getBorder();
        t.is(borders.getTop().getColor().asRgbColor().asHexString(), "#ff0000", "top border color");
        t.is(borders.getTop().getBorderStyle(), SpreadsheetApp.BorderStyle.DOTTED, "top border style");
      });
    };

    const clearVariantsTests = () => {
      const rangeList = sheet.getRangeList(testRanges);
      rangeList.getRanges().forEach(r => r.setValue('a').setNote('b').setDataValidation(SpreadsheetApp.newDataValidation().requireNumberEqualTo(1).build()));

      rangeList.clearNote();
      rangeList.getRanges().forEach(r => {
        t.is(r.getNote(), '', 'note should be cleared');
        t.not(r.getValue(), '', 'value should not be cleared');
      });

      rangeList.clearDataValidations();
      rangeList.getRanges().forEach(r => {
        t.is(r.getDataValidation(), null, 'data validation should be cleared');
      });
    };

    const activateTests = () => {
      const rangeList = sheet.getRangeList(testRanges);
      rangeList.activate();
      const activeList = sheet.getParent().getActiveRangeList();
      t.is(activeList.getRanges().length, rangeList.getRanges().length, 'activated range list should have same number of ranges');
      t.is(activeList.getRanges()[0].getA1Notation(), rangeList.getRanges()[0].getA1Notation(), 'first range of activated list should match');
    };

    const breakApartTests = () => {
      const rangeList = sheet.getRangeList(["A10:B11", "D10:E11"]);
      rangeList.getRanges().forEach(r => r.merge());
      rangeList.getRanges().forEach(r => t.is(r.isPartOfMerge(), true, 'range should be merged'));

      rangeList.breakApart();
      rangeList.getRanges().forEach(r => t.is(r.isPartOfMerge(), false, 'range should be broken apart'));
    };

    const moreSettersTests = () => {
      const rangeList = sheet.getRangeList(singleCellRanges);
      rangeList.setFormulaR1C1("=R[1]C[1]");
      rangeList.getRanges().forEach(r => {
        t.is(r.getFormulaR1C1(), "=R[1]C[1]", "R1C1 formula should be set");
      });

      rangeList.setWrap(true);
      rangeList.getRanges().forEach(r => {
        t.is(r.getWrap(), true, "wrap should be set to true");
      });

      rangeList.setTextDirection(SpreadsheetApp.TextDirection.RIGHT_TO_LEFT);
      rangeList.getRanges().forEach(r => {
        t.is(r.getTextDirection().toString(), SpreadsheetApp.TextDirection.RIGHT_TO_LEFT.toString(), "text direction should be set");
      });

      rangeList.setNumberFormat("0.00");
      rangeList.getRanges().forEach(r => {
        t.is(r.getNumberFormat(), "0.00", "number format should be set");
      });
    };

    clearTests()
    settersTests()
    checkboxTests()
    trimTests()
    borderTests()
    clearVariantsTests();
    // activateTests(); // this needs getActiveRangeList on spreadsheet to be implemented
    breakApartTests();
    moreSettersTests();
  });


  unit.section('Range.setShowHyperlink', (t) => {
    const { ss, sheet } = maketss(t.options.description, toTrash, fixes);
    const range = sheet.getRange('A1');
    range.setFormula('=HYPERLINK("http://www.google.com","Google")');

    const spreadsheetId = ss.getId();
    const sheetName = sheet.getName();
    const fields = 'sheets.data.rowData.values.userEnteredFormat.hyperlinkDisplayType';

    const getDisplayType = (a1Notation) => {
      const result = Sheets.Spreadsheets.get(spreadsheetId, {
        ranges: [`'${sheetName}'!${a1Notation}`],
        fields: fields
      });
      return result.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values?.[0]?.userEnteredFormat?.hyperlinkDisplayType;
    };

    // Default behavior is LINKED. In the API, this is often represented by the property being absent.
    let displayType = getDisplayType('A1');
    t.true(displayType === 'LINKED' || is.undefined(displayType), 'Hyperlink should be shown by default (LINKED or undefined)');


    range.setShowHyperlink(false);
    SpreadsheetApp.flush();
    t.is(getDisplayType('A1'), 'PLAIN_TEXT', 'Hyperlink should be hidden and display as plain text');

    range.setShowHyperlink(true);
    SpreadsheetApp.flush();
    t.is(getDisplayType('A1'), 'LINKED', 'Hyperlink should be shown again');

    t.rxMatch(t.threw(() => range.setShowHyperlink(null))?.message || "no error thrown",
      /The parameters \(null\) don't match the method signature/,
      "The live environment throws an error for setShowHyperlink(null), so this test sould throw."
    )


    // Test RangeList
    const rangeList = sheet.getRangeList(['C1', 'D1']);
    sheet.getRange('C1').setFormula('=HYPERLINK("http://www.example.com","Example")');
    sheet.getRange('D1').setFormula('=HYPERLINK("http://www.bing.com","Bing")');
    SpreadsheetApp.flush();

    rangeList.setShowHyperlink(false);
    SpreadsheetApp.flush();
    t.is(getDisplayType('C1'), 'PLAIN_TEXT', 'RangeList: C1 hyperlink should be hidden');
    t.is(getDisplayType('D1'), 'PLAIN_TEXT', 'RangeList: D1 hyperlink should be hidden');

    rangeList.setShowHyperlink(true);
    SpreadsheetApp.flush();
    t.is(getDisplayType('C1'), 'LINKED', 'RangeList: C1 hyperlink should be shown');
    t.is(getDisplayType('D1'), 'LINKED', 'RangeList: D1 hyperlink should be shown');

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance());


  });

  unit.section("Range Grouping Methods", t => {
    const { sheet, ss } = maketss('grouping_tests', toTrash, fixes);

    // Helper function to get groups from the sheet
    const getGroups = (sheetId) => {
      const meta = Sheets.Spreadsheets.get(ss.getId(), { fields: 'sheets(properties.sheetId,rowGroups(range,depth,collapsed),columnGroups(range,depth,collapsed))' });
      const sheetMeta = meta.sheets.find(s => s.properties.sheetId === sheetId);
      return {
        rowGroups: sheetMeta.rowGroups || [],
        columnGroups: sheetMeta.columnGroups || []
      };
    };

    let rowGroups, columnGroups;

    // 1. Test creating row groups
    const rowRange = sheet.getRange("A2:A5"); // 4 rows
    rowRange.shiftRowGroupDepth(1); // Create one level of grouping
    ({ rowGroups, columnGroups } = getGroups(sheet.getSheetId()));

    t.is(rowGroups.length, 1, "Should create one row group");
    t.is(columnGroups.length, 0, "Should be no column groups yet");
    t.is(rowGroups[0].range.startIndex, 1, "Row group start index should be 1 (for row 2)");
    t.is(rowGroups[0].range.endIndex, 5, "Row group end index should be 5 (for row 5)");
    t.is(rowGroups[0].depth, 1, "Row group depth should be 1");
    // The API omits the 'collapsed' property when it's false. A falsy check handles this.
    t.falsey(rowGroups[0].collapsed, "Row group should not be collapsed by default");

    // 2. Test creating a nested row group
    const nestedRowRange = sheet.getRange("A3:A4");
    nestedRowRange.shiftRowGroupDepth(1);
    ({ rowGroups, columnGroups } = getGroups(sheet.getSheetId()));


    t.is(rowGroups.length, 2, "Should now have two row groups");
    const outerGroup = rowGroups.find(g => g.depth === 1);
    const innerGroup = rowGroups.find(g => g.depth === 2);
    t.truthy(outerGroup, "Outer group should exist");
    t.truthy(innerGroup, "Inner group should exist");
    t.is(innerGroup.range.startIndex, 2, "Inner row group start index");
    t.is(innerGroup.range.endIndex, 4, "Inner row group end index");

    // 3. Test collapsing groups
    sheet.getRange("A1:A10").collapseGroups(); // Collapse all groups in this range
    ({ rowGroups, columnGroups } = getGroups(sheet.getSheetId()));
    const outerGroupAfterCollapse = rowGroups.find(g => g.depth === 1);
    const innerGroupAfterCollapse = rowGroups.find(g => g.depth === 2);
    t.true(outerGroupAfterCollapse.collapsed, "Outermost group should be collapsed");
    t.falsey(innerGroupAfterCollapse.collapsed, "Inner group should not be collapsed by a non-recursive call");

    // 4. Test expanding groups
    sheet.getRange("A3:A4").expandGroups(); // Expand only the inner group
    ({ rowGroups, columnGroups } = getGroups(sheet.getSheetId()));
    const outerGroupAfterExpand = rowGroups.find(g => g.depth === 1);
    const innerGroupAfterExpand = rowGroups.find(g => g.depth === 2);
    t.falsey(outerGroupAfterExpand.collapsed, "Outer group should also be expanded");
    t.falsey(innerGroupAfterExpand.collapsed, "Inner group should be expanded");

    // 5. Test creating column groups
    const colRange = sheet.getRange("C1:E1");
    colRange.shiftColumnGroupDepth(2); // Create two levels of grouping at once
    ({ rowGroups, columnGroups } = getGroups(sheet.getSheetId()));
    t.is(columnGroups.length, 2, "Should create two column groups");
    t.is(columnGroups[0].depth, 1, "First column group depth");
    t.is(columnGroups[1].depth, 2, "Second column group depth");
    t.is(columnGroups[0].range.startIndex, 2, "Column group start index (for col C)");
    t.is(columnGroups[0].range.endIndex, 5, "Column group end index (for col E)");

    // 6. Test removing a group level
    rowRange.shiftRowGroupDepth(-1); // Remove one level from the outer group
    ({ rowGroups, columnGroups } = getGroups(sheet.getSheetId()));
    t.is(rowGroups.length, 1, "Should have one row group left after removing one level");
    t.is(rowGroups[0].depth, 1, "Remaining row group should now have depth 1");

    // 7. Test removing all groups
    sheet.getRange("A1:Z100").shiftRowGroupDepth(-10).shiftColumnGroupDepth(-10); // Remove all possible groups
    ({ rowGroups, columnGroups } = getGroups(sheet.getSheetId()));
    t.is(rowGroups.length, 0, "All row groups should be removed");
    t.is(columnGroups.length, 0, "All column groups should be removed");

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance());
  });
  // running standalone
  if (!pack) {
    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    unit.report()

  }
  if (fixes.CLEAN) trasher(toTrash);

  return { unit, fixes }
}


wrapupTest(testSheetsExotics);