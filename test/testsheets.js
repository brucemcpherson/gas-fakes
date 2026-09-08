// all these imports
// this is loaded by npm, but is a library on Apps Script side

import '@mcpher/gas-fakes'

import { initTests } from "./testinit.js";

import {
  prepareTarget,
  maketss,
  fillRangeFromDomain,
  transpose2DArray,
  trasher,cachePerformance, wrapupTest
} from "./testassist.js";

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheets = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();


  unit.section("R1C1 Formula Notation", (t) => {
    const { sheet } = maketss("r1c1_formulas", toTrash, fixes);
    sheet.clear();

    // Test 1: Single cell, relative references
    const cellA1 = sheet.getRange("A1");
    cellA1.setFormulaR1C1("=R[1]C[1]"); // Should be =B2
    t.is(
      cellA1.getFormula(),
      "=B2",
      "A1: setFormulaR1C1 with relative refs should produce correct A1 formula"
    );
    t.is(
      cellA1.getFormulaR1C1(),
      "=R[1]C[1]",
      "A1: getFormulaR1C1 should return the same relative formula"
    );

    // Test 2: Single cell, absolute references
    const cellC3 = sheet.getRange("C3");
    cellC3.setFormulaR1C1("=R1C1"); // Should be =$A$1
    t.is(
      cellC3.getFormula(),
      "=$A$1",
      "C3: setFormulaR1C1 with absolute refs should produce correct A1 formula"
    );
    t.is(
      cellC3.getFormulaR1C1(),
      "=R1C1",
      "C3: getFormulaR1C1 for absolute ref should be correct"
    );

    // Test 3: Single cell, mixed references
    const cellD4 = sheet.getRange("D4");
    cellD4.setFormulaR1C1("=R[1]C1"); // Relative row, absolute col. From D4, this is row 5, col A. => =$A5
    t.is(
      cellD4.getFormula(),
      "=$A5",
      "D4: setFormulaR1C1 with mixed refs (R[1]C1) should be correct"
    );
    t.is(
      cellD4.getFormulaR1C1(),
      "=R[1]C1",
      "D4: getFormulaR1C1 for mixed refs (R[1]C1) should be correct"
    );

    cellD4.setFormulaR1C1("=R1C[1]"); // Absolute row, relative col. From D4, this is row 1, col E. => =E$1
    t.is(
      cellD4.getFormula(),
      "=E$1",
      "D4: setFormulaR1C1 with mixed refs (R1C[1]) should be correct"
    );
    t.is(
      cellD4.getFormulaR1C1(),
      "=R1C[1]",
      "D4: getFormulaR1C1 for mixed refs (R1C[1]) should be correct"
    );

    // Test 4: Single cell, negative relative references
    const cellE5 = sheet.getRange("E5");
    cellE5.setFormulaR1C1("=R[-2]C[-1]"); // From E5, this is D3. => =D3
    t.is(
      cellE5.getFormula(),
      "=D3",
      "E5: setFormulaR1C1 with negative relative refs should be correct"
    );
    t.is(
      cellE5.getFormulaR1C1(),
      "=R[-2]C[-1]",
      "E5: getFormulaR1C1 for negative relative refs should be correct"
    );

    // Test 5: Getting R1C1 from an A1 formula
    const cellF6 = sheet.getRange("F6");
    cellF6.setFormula("=G10"); // Relative
    t.is(
      cellF6.getFormulaR1C1(),
      "=R[4]C[1]",
      "F6: getFormulaR1C1 from relative A1 formula"
    );

    cellF6.setFormula("=$H$12"); // Absolute
    t.is(
      cellF6.getFormulaR1C1(),
      "=R12C8",
      "F6: getFormulaR1C1 from absolute A1 formula"
    );

    // Test 6: Multiple references in one formula
    const cellG7 = sheet.getRange("G7");
    cellG7.setFormulaR1C1("=R[-1]C[-1]+R1C1*R[1]C[1]"); // =F6+$A$1*H8
    t.is(
      cellG7.getFormula(),
      "=F6+$A$1*H8",
      "G7: setFormulaR1C1 with multiple refs"
    );
    t.is(
      cellG7.getFormulaR1C1(),
      "=R[-1]C[-1]+R1C1*R[1]C[1]",
      "G7: getFormulaR1C1 with multiple refs"
    );

    // Test 7: setFormulasR1C1 and getFormulasR1C1
    const rangeB10_C11 = sheet.getRange("B10:C11");
    const r1c1Formulas = [
      ["=R[1]C", "=R1C1"],
      ["=R[-1]C[-1]", "Value"],
    ];
    rangeB10_C11.setFormulasR1C1(r1c1Formulas);

    const expectedA1 = [
      ["=B11", "=$A$1"],
      ["=A10", "=Value"],
    ];
    t.deepEqual(
      rangeB10_C11.getFormulas(),
      expectedA1,
      "setFormulasR1C1 should produce correct A1 formulas"
    );
    const expectedR1C1 = [
      ["=R[1]C[0]", "=R1C1"],
      ["=R[-1]C[-1]", "=Value"],
    ];
    t.deepEqual(
      rangeB10_C11.getFormulasR1C1(),
      expectedR1C1,
      "getFormulasR1C1 should return correct canonical R1C1 formulas"
    );

    // Test 8: Formulas with text and references (to test quote handling)
    const cellH15 = sheet.getRange("H15");
    cellH15.setFormulaR1C1('=R[-1]C & " some text R1C1 not a ref"'); // =H14 & "..."
    t.is(
      cellH15.getFormula(),
      '=H14 & " some text R1C1 not a ref"',
      "R1C1 formula with quotes should convert correctly to A1"
    );
    t.is(
      cellH15.getFormulaR1C1(),
      '=R[-1]C[0] & " some text R1C1 not a ref"',
      "getFormulaR1C1 should handle quotes correctly"
    );

    // Test 9: Edge case - reference to self
    const cellJ20 = sheet.getRange("J20");
    cellJ20.setFormulaR1C1("=R[0]C[0]"); // =J20
    t.is(cellJ20.getFormula(), "=J20", "R1C1 self-reference to A1");
    t.is(cellJ20.getFormulaR1C1(), "=R[0]C[0]", "A1 self-reference to R1C1");

    // Test 10: Range references
    const cellA2 = sheet.getRange("A2");
    cellA2.setFormulaR1C1("=SUM(R[-1]C:R[-1]C[2])"); // From A2, this is SUM(A1:C1)
    t.is(cellA2.getFormula(), "=SUM(A1:C1)", "R1C1 relative range to A1");
    t.is(
      cellA2.getFormulaR1C1(),
      "=SUM(R[-1]C[0]:R[-1]C[2])",
      "A1 relative range to R1C1 canonical"
    );

    const cellB3 = sheet.getRange("B3");
    cellB3.setFormula("=SUM($A$1:B$2)"); // Mixed absolute/relative range
    t.is(
      cellB3.getFormulaR1C1(),
      "=SUM(R1C1:R2C[0])",
      "A1 mixed range to R1C1"
    );
    cellB3.setFormulaR1C1("=SUM(R1C1:R2C[0])");
    t.is(cellB3.getFormula(), "=SUM($A$1:B$2)", "R1C1 mixed range to A1");

    if (SpreadsheetApp.isFake) cachePerformance()

  });

  unit.section("getRange with R1C1 notation", (t) => {
    const { sheet } = maketss("getrange_r1c1", toTrash, fixes);

    // Test 1: Single cell R1C1
    const range1 = sheet.getRange("R5C3");
    t.is(range1.getA1Notation(), "C5", "getRange with R1C1 single cell");
    t.is(range1.getRow(), 5, "R1C1 single cell row");
    t.is(range1.getColumn(), 3, "R1C1 single cell column");

    // Test 2: Range R1C1
    const range2 = sheet.getRange("R2C2:R4C5");
    t.is(range2.getA1Notation(), "B2:E4", "getRange with R1C1 range");
    t.is(range2.getNumRows(), 3, "R1C1 range num rows");
    t.is(range2.getNumColumns(), 4, "R1C1 range num columns");

    // Test 3: Inverted Range R1C1
    const range3 = sheet.getRange("R10C5:R1C2");
    t.is(range3.getA1Notation(), "B1:E10", "getRange with inverted R1C1 range");

    // Test 4: Fallback to A1 for invalid R1C1
    const range4 = sheet.getRange("RC1"); // Invalid R1C1
    t.is(
      range4.getA1Notation(),
      "RC1",
      "Should fallback to A1 for invalid R1C1"
    );

    // Test 5: Lowercase R1C1
    const range5 = sheet.getRange("r1c1:r2c2");
    t.is(range5.getA1Notation(), "A1:B2", "getRange with lowercase r1c1 range");


    if (SpreadsheetApp.isFake) cachePerformance()
  });


  unit.section("Range Merging Methods", (t) => {
    const { sheet } = maketss("merging_tests", toTrash, fixes);

    // Setup: put some values in cells
    sheet.getRange("A1:F10").setValues(
      Array(10)
        .fill(0)
        .map((_, r) =>
          Array(6)
            .fill(0)
            .map((_, c) => `R${r + 1}C${c + 1}`)
        )
    );

    // Test 1: merge() and isPartOfMerge()
    const mergeRange = sheet.getRange("A1:B2");
    mergeRange.merge();
    t.true(
      sheet.getRange("A1").isPartOfMerge(),
      "A1 should be part of a merge"
    );
    t.true(
      sheet.getRange("B2").isPartOfMerge(),
      "B2 should be part of a merge"
    );
    t.true(
      mergeRange.isPartOfMerge(),
      "The whole merged range should be part of a merge"
    );
    t.false(
      sheet.getRange("C3").isPartOfMerge(),
      "C3 should not be part of a merge"
    );
    t.is(
      mergeRange.getDisplayValue(),
      "R1C1",
      "Display value of merged range should be top-left cell's value"
    );

    // Test 2: getMergedRanges()
    let mergedRanges = sheet.getRange("A1:C3").getMergedRanges();
    t.is(
      mergedRanges.length,
      1,
      "getMergedRanges should find one intersecting merge"
    );
    t.is(
      mergedRanges[0].getA1Notation(),
      "A1:B2",
      "The found merged range should be A1:B2"
    );

    // Test 3: breakApart()
    mergeRange.breakApart();
    t.false(
      sheet.getRange("A1").isPartOfMerge(),
      "A1 should no longer be part of a merge after breakApart"
    );
    mergedRanges = sheet.getDataRange().getMergedRanges();
    t.is(
      mergedRanges.length,
      0,
      "There should be no merged ranges on the sheet after breakApart"
    );

    // Test 4: mergeAcross()
    const acrossRange = sheet.getRange("D1:F2");
    acrossRange.mergeAcross();
    mergedRanges = sheet.getDataRange().getMergedRanges();
    t.is(
      mergedRanges.length,
      2,
      "mergeAcross on a 2-row range should create 2 merged ranges"
    );
    const notations = mergedRanges.map((r) => r.getA1Notation()).sort();
    t.deepEqual(
      notations,
      ["D1:F1", "D2:F2"],
      "mergeAcross should create correct horizontal merges"
    );
    t.is(
      sheet.getRange("D1").getDisplayValue(),
      "R1C4",
      "Display value of first across-merge"
    );
    t.is(
      sheet.getRange("D2").getDisplayValue(),
      "R2C4",
      "Display value of second across-merge"
    );
    acrossRange.breakApart();

    // Test 5: mergeVertically()
    const verticalRange = sheet.getRange("A5:B7");
    verticalRange.mergeVertically();
    mergedRanges = sheet.getDataRange().getMergedRanges();
    t.is(
      mergedRanges.length,
      2,
      "mergeVertically on a 2-column range should create 2 merged ranges"
    );
    const vertNotations = mergedRanges.map((r) => r.getA1Notation()).sort();
    t.deepEqual(
      vertNotations,
      ["A5:A7", "B5:B7"],
      "mergeVertically should create correct vertical merges"
    );
    t.is(
      sheet.getRange("A5").getDisplayValue(),
      "R5C1",
      "Display value of first vertical-merge"
    );
    t.is(
      sheet.getRange("B5").getDisplayValue(),
      "R5C2",
      "Display value of second vertical-merge"
    );
    verticalRange.breakApart();


    if (SpreadsheetApp.isFake) cachePerformance()
  });


  unit.section("Range.moveTo", (t) => {
    const { sheet } = maketss("moveTo_tests", toTrash, fixes);

    const setupData = () => {
      sheet.clear();
      const sourceRange = sheet.getRange("A1:B2");
      sourceRange.setValues([
        ["A1", "B1"],
        ["A2", "B2"],
      ]);
      sourceRange.setBackground("#ff0000"); // Red
      sourceRange.setFontWeight("bold");
      return sourceRange;
    };

    // Test 1: Simple non-overlapping move
    let source = setupData();
    let target = sheet.getRange("D1");
    source.moveTo(target);

    const newRange = sheet.getRange("D1:E2");
    t.deepEqual(
      newRange.getValues(),
      [
        ["A1", "B1"],
        ["A2", "B2"],
      ],
      "Values should be moved"
    );
    t.is(newRange.getBackground(), "#ff0000", "Background should be moved");
    t.is(newRange.getFontWeight(), "bold", "Font weight should be moved");

    const clearedSource = sheet.getRange("A1:B2");
    t.deepEqual(
      clearedSource.getValues(),
      [
        ["", ""],
        ["", ""],
      ],
      "Original source values should be cleared"
    );
    t.is(
      clearedSource.getBackground(),
      "#ffffff",
      "Original source background should be cleared to default"
    );
    t.is(
      clearedSource.getFontWeight(),
      "normal",
      "Original source font weight should be cleared to default"
    );

    // Test 2: Overlapping move
    source = setupData();
    target = sheet.getRange("B1"); // Overlaps with the source
    source.moveTo(target);

    const expectedOverlapValues = [
      ["", "A1", "B1"],
      ["", "A2", "B2"],
    ];
    const overlapResultRange = sheet.getRange("A1:C2");
    t.deepEqual(
      overlapResultRange.getValues(),
      expectedOverlapValues,
      "Values should be moved correctly when overlapping"
    );
    t.is(
      sheet.getRange("B1:C2").getBackground(),
      "#ff0000",
      "Overlapping move should move format"
    );
    t.is(
      sheet.getRange("A1").getBackground(),
      "#ffffff",
      "Cleared part of overlap should have default format"
    );

    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section("Range.autoFill and autoFillToNeighbor", (t) => {
    const { sheet } = maketss("autofill_tests", toTrash, fixes);
    const AutoFillSeries = SpreadsheetApp.AutoFillSeries;

    // --- Test autoFill ---
    sheet.clear();
    sheet.getRange("A1:A4").setValues([[1], [2], [3], [4]]);
    const sourceRange = sheet.getRange("A1:A4");
    const destinationRange = sheet.getRange("A1:A10");
    sourceRange.autoFill(destinationRange, AutoFillSeries.DEFAULT_SERIES);

    const expectedValues = [[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]];
    t.deepEqual(
      destinationRange.getValues(),
      expectedValues,
      "autoFill should fill down with a number series"
    );

    // Test extending left
    sheet.clear();
    sheet.getRange("E1:H1").setValues([[10, 8, 6, 4]]);
    const sourceRight = sheet.getRange("E1:H1");
    const destLeft = sheet.getRange("B1:H1");
    sourceRight.autoFill(destLeft, AutoFillSeries.DEFAULT_SERIES);
    const expectedLeft = [[16, 14, 12, 10, 8, 6, 4]];
    t.deepEqual(
      destLeft.getValues(),
      expectedLeft,
      "autoFill should fill left with a decreasing number series"
    );

    // --- Test autoFillToNeighbor ---
    sheet.clear();
    const neighborData = Array.from({ length: 20 }, (_, i) => [i + 1]);
    sheet.getRange("A1:A20").setValues(neighborData);
    sheet.getRange("B1:B2").setValues([["Jan"], ["Feb"]]);

    const neighborSource = sheet.getRange("B1:B2");
    neighborSource.autoFillToNeighbor(AutoFillSeries.DEFAULT_SERIES);

    const neighborResult = sheet.getRange("B1:B20").getValues().flat();
    t.is(
      neighborResult[2],
      "Mar",
      "autoFillToNeighbor should fill month series (Mar)"
    );
    t.is(
      neighborResult.length,
      20,
      "autoFillToNeighbor should fill down to the neighbor's extent"
    );

    // Test error conditions for autoFill
    const invalidDest1 = sheet.getRange("C1:C5"); // Does not contain source
    t.rxMatch(
      t.threw(() =>
        sourceRange.autoFill(invalidDest1, AutoFillSeries.DEFAULT_SERIES)
      )?.message || "",
      /destination range must contain the source range/
    );

    const invalidDest2 = sheet.getRange("A1:B10"); // Extends in two directions
    t.rxMatch(
      t.threw(() =>
        sourceRange.autoFill(invalidDest2, AutoFillSeries.DEFAULT_SERIES)
      )?.message || "",
      /AutoFill destination range must extend the source range in only one direction./
    );

    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section("Range.deleteCells and Range.insertCells", (t) => {
    const { sheet } = maketss("cell_shifting_tests", toTrash, fixes);
    const Dimension = SpreadsheetApp.Dimension;

    const initialData = [
      ["A1", "B1", "C1", "D1"],
      ["A2", "B2", "C2", "D2"],
      ["A3", "B3", "C3", "D3"],
      ["A4", "B4", "C4", "D4"],
    ];

    // --- Test deleteCells(Dimension.COLUMNS) ---
    sheet.getRange("A1:D4").setValues(initialData);
    sheet.getRange("B2:C3").deleteCells(Dimension.COLUMNS);
    const expectedAfterColDelete = [
      ["A1", "B1", "C1", "D1"],
      ["A2", "D2", "", ""],
      ["A3", "D3", "", ""],
      ["A4", "B4", "C4", "D4"],
    ];
    t.deepEqual(
      sheet.getRange("A1:D4").getValues(),
      expectedAfterColDelete,
      "deleteCells(COLUMNS) should shift cells left"
    );

    // --- Test deleteCells(Dimension.ROWS) ---
    sheet.getRange("A1:D4").setValues(initialData);
    sheet.getRange("B2:C3").deleteCells(Dimension.ROWS);
    const expectedAfterRowDelete = [
      ["A1", "B1", "C1", "D1"],
      ["A2", "B4", "C4", "D2"],
      ["A3", "", "", "D3"],
      ["A4", "", "", "D4"],
    ];
    t.deepEqual(
      sheet.getRange("A1:D4").getValues(),
      expectedAfterRowDelete,
      "deleteCells(ROWS) should shift cells up"
    );

    // --- Test insertCells(Dimension.COLUMNS) ---
    sheet.getRange("A1:D4").setValues(initialData);
    sheet.getRange("B2:C2").insertCells(Dimension.COLUMNS);
    t.deepEqual(
      sheet.getRange("A1:D4").getValues(),
      [
        ["A1", "B1", "C1", "D1"],
        ["A2", "", "", "B2"],
        ["A3", "B3", "C3", "D3"],
        ["A4", "B4", "C4", "D4"],
      ],
      "insertCells(COLUMNS) should shift cells right"
    );

    // --- Test insertCells(Dimension.ROWS) ---
    sheet.getRange("A1:D4").setValues(initialData);
    sheet.getRange("B2:B3").insertCells(Dimension.ROWS);
    t.deepEqual(
      sheet.getRange("A1:D4").getValues(),
      [
        ["A1", "B1", "C1", "D1"],
        ["A2", "", "C2", "D2"],
        ["A3", "", "C3", "D3"],
        ["A4", "B2", "C4", "D4"],
      ],
      "insertCells(ROWS) should shift cells down"
    );


    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section("Range.getNextDataCell", (t) => {
    const { sheet } = maketss("getNextDataCell_tests", toTrash, fixes);
    const Direction = SpreadsheetApp.Direction;

    // --- Setup for DOWN/UP tests ---
    sheet.clear();
    sheet.getRange("B2").setValue("B2-val");
    sheet.getRange("B5").setValue("B5-val");
    sheet.getRange("D2:D4").setValues([["D2-val"], ["D3-val"], ["D4-val"]]);
    const maxRows = sheet.getMaxRows();
    sheet.getRange(`F${maxRows}`).setValue("F-last-val");

    // --- Test DOWN ---
    t.is(
      sheet.getRange("B1").getNextDataCell(Direction.DOWN).getA1Notation(),
      "B2",
      "DOWN: From empty to next data"
    );
    t.is(
      sheet.getRange("B2").getNextDataCell(Direction.DOWN).getA1Notation(),
      "B5",
      "DOWN: From data, over empty, to next data"
    );
    t.is(
      sheet.getRange("D2").getNextDataCell(Direction.DOWN).getA1Notation(),
      "D4",
      "DOWN: From data to end of contiguous block"
    );
    t.is(
      sheet.getRange("B5").getNextDataCell(Direction.DOWN).getA1Notation(),
      `B${maxRows}`,
      "DOWN: From data to end of sheet when no more data"
    );
    t.is(
      sheet.getRange("A1").getNextDataCell(Direction.DOWN).getA1Notation(),
      `A${maxRows}`,
      "DOWN: From empty with no data below to end of sheet"
    );
    t.is(
      sheet
        .getRange(`F${maxRows}`)
        .getNextDataCell(Direction.DOWN)
        .getA1Notation(),
      `F${maxRows}`,
      "DOWN: From last cell stays at last cell"
    );
    t.is(
      sheet.getRange("F1").getNextDataCell(Direction.DOWN).getA1Notation(),
      `F${maxRows}`,
      "DOWN: From empty cell to last cell with data"
    );

    // --- Test UP ---
    t.is(
      sheet.getRange("B4").getNextDataCell(Direction.UP).getA1Notation(),
      "B2",
      "UP: From empty to next data"
    );
    t.is(
      sheet.getRange("B5").getNextDataCell(Direction.UP).getA1Notation(),
      "B2",
      "UP: From data, over empty, to next data"
    );
    t.is(
      sheet.getRange("D4").getNextDataCell(Direction.UP).getA1Notation(),
      "D2",
      "UP: From data to start of contiguous block"
    );
    t.is(
      sheet.getRange("B2").getNextDataCell(Direction.UP).getA1Notation(),
      "B1",
      "UP: From first data to top of sheet"
    );
    t.is(
      sheet.getRange("A6").getNextDataCell(Direction.UP).getA1Notation(),
      "A1",
      "UP: From empty with no data above to top of sheet"
    );
    t.is(
      sheet.getRange("A1").getNextDataCell(Direction.UP).getA1Notation(),
      "A1",
      "UP: From first cell stays at first cell"
    );

    // --- Setup for NEXT/PREVIOUS tests ---
    sheet.clear();
    sheet.getRange("B2").setValue("B2-val");
    sheet.getRange("E2").setValue("E2-val");
    sheet.getRange("B4:D4").setValues([["B4-val", "C4-val", "D4-val"]]);
    const maxCols = sheet.getMaxColumns();
    const maxColsLetter = sheet
      .getRange(1, maxCols)
      .getA1Notation()
      .replace(/\d/g, "");
    sheet.getRange(`${maxColsLetter}6`).setValue("Last-col-val");

    // --- Test NEXT (RIGHT) ---
    t.is(
      sheet.getRange("A2").getNextDataCell(Direction.NEXT).getA1Notation(),
      "B2",
      "NEXT: From empty to next data"
    );
    t.is(
      sheet.getRange("B2").getNextDataCell(Direction.NEXT).getA1Notation(),
      "E2",
      "NEXT: From data, over empty, to next data"
    );
    t.is(
      sheet.getRange("B4").getNextDataCell(Direction.NEXT).getA1Notation(),
      "D4",
      "NEXT: From data to end of contiguous block"
    );
    t.is(
      sheet.getRange("E2").getNextDataCell(Direction.NEXT).getA1Notation(),
      `${maxColsLetter}2`,
      "NEXT: From data to end of sheet when no more data"
    );
    t.is(
      sheet.getRange("A1").getNextDataCell(Direction.NEXT).getA1Notation(),
      `${maxColsLetter}1`,
      "NEXT: From empty with no data to the right to end of sheet"
    );
    t.is(
      sheet
        .getRange(`${maxColsLetter}1`)
        .getNextDataCell(Direction.NEXT)
        .getA1Notation(),
      `${maxColsLetter}1`,
      "NEXT: From last cell stays at last cell"
    );
    t.is(
      sheet.getRange("A6").getNextDataCell(Direction.NEXT).getA1Notation(),
      `${maxColsLetter}6`,
      "NEXT: From empty cell to last cell with data"
    );

    // --- Test PREVIOUS (LEFT) ---
    t.is(
      sheet.getRange("E4").getNextDataCell(Direction.PREVIOUS).getA1Notation(),
      "D4",
      "PREVIOUS: From empty to next data"
    );
    t.is(
      sheet.getRange("E2").getNextDataCell(Direction.PREVIOUS).getA1Notation(),
      "B2",
      "PREVIOUS: From data, over empty, to next data"
    );
    t.is(
      sheet.getRange("D4").getNextDataCell(Direction.PREVIOUS).getA1Notation(),
      "B4",
      "PREVIOUS: From data to start of contiguous block"
    );
    t.is(
      sheet.getRange("B2").getNextDataCell(Direction.PREVIOUS).getA1Notation(),
      "A2",
      "PREVIOUS: From first data to start of sheet"
    );
    t.is(
      sheet.getRange("G1").getNextDataCell(Direction.PREVIOUS).getA1Notation(),
      "A1",
      "PREVIOUS: From empty with no data to the left to start of sheet"
    );
    t.is(
      sheet.getRange("A1").getNextDataCell(Direction.PREVIOUS).getA1Notation(),
      "A1",
      "PREVIOUS: From first cell stays at first cell"
    );


    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section("Range.copyTo", (t) => {
    const { sheet } = maketss("copyToTests", toTrash, fixes);

    // Source range setup
    const sourceRange = sheet.getRange("A1:B2");
    const sourceValues = [
      ["V1", "V2"],
      ["V3", "V4"],
    ];
    const sourceBgColor = "#ff0000"; // Red
    const sourceFontColor = "#0000ff"; // Blue
    const sourceFontSize = 14;
    const sourceFontWeight = "bold";

    sourceRange.setValues(sourceValues);
    sourceRange.setBackground(sourceBgColor);
    sourceRange.setFontColor(sourceFontColor);
    sourceRange.setFontSize(sourceFontSize);
    sourceRange.setFontWeight("bold");
    let targetRange;
    // Helper to verify formats
    const verifyFormats = (
      range,
      expectedBg,
      expectedFontColor,
      expectedFontSize,
      expectedFontWeight,
      description
    ) => {
      t.is(range.getBackground(), expectedBg, `${description} - Background`);
      t.is(
        range.getFontColor(),
        expectedFontColor,
        `${description} - Font Color`
      );
      t.is(range.getFontSize(), expectedFontSize, `${description} - Font Size`);
      t.is(
        range.getFontWeight(),
        expectedFontWeight,
        `${description} - Font Weight`
      );
    };

    // Helper to verify values
    const verifyValues = (range, expectedValues, description) => {
      t.deepEqual(range.getValues(), expectedValues, `${description} - Values`);
    };

    targetRange = sheet.getRange("A1:B2");
    t.rxMatch(
      t.threw(() => sourceRange.copyTo()).toString(),
      /don't match the method signature/
    );
    t.rxMatch(
      t.threw(() => sourceRange.copyTo()).toString(),
      /don't match the method signature/
    );
    t.rxMatch(
      t.threw(() => sourceRange.copyTo("not a range")).toString(),
      /don't match the method signature/
    );
    // skip this if on GAS since this incorrectly does not throw error - https://issuetracker.google.com/issues/427192537
    if (SpreadsheetApp.isFake) {
      t.rxMatch(
        (() => {
          const v = t.threw(() =>
            sourceRange.copyTo(targetRange, "INVALID_TYPE")
          );
          return v ? v.toString() : "t.threw - no error was thrown";
        })(),
        /don't match the method signature/
      );

      t.rxMatch(
        t
          .threw(() =>
            sourceRange.copyTo(targetRange, {
              contentsOnly: true,
              formatOnly: true,
            })
          )
          .toString(),
        /don't match the method signature/,
        "Should throw error for conflicting options"
      );

      t.rxMatch(
        t
          .threw(() =>
            sourceRange.copyTo(targetRange, { someOtherOption: true })
          )
          .toString(),
        /don't match the method signature/,
        "Should throw error for unknown options"
      );
    }
    t.rxMatch(
      t
        .threw(() =>
          sourceRange.copyTo(
            targetRange,
            SpreadsheetApp.CopyPasteType.PASTE_NORMAL,
            "not a boolean"
          )
        )
        .toString(),
      /don't match the method signature/,
      "Should throw error for invalid transposed type"
    );
    // --- Test Case 1: copyTo(destination) - PASTE_NORMAL ---

    // Target same size as source
    targetRange = sheet.getRange("D1:E2");
    sourceRange.copyTo(targetRange);
    verifyValues(targetRange, sourceValues, "PASTE_NORMAL: Same size - Values");
    verifyFormats(
      targetRange,
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_NORMAL: Same size - Formats"
    );

    // Target smaller than source (Apps Script copies full source)
    targetRange = sheet.getRange("G1:G1"); // 1x1 target
    sourceRange.copyTo(targetRange);
    // Expected: G1:H2 should have source values/formats
    verifyValues(
      sheet.getRange("G1:H2"),
      sourceValues,
      "PASTE_NORMAL: Smaller target - Values"
    );
    verifyFormats(
      sheet.getRange("G1:H2"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_NORMAL: Smaller target - Formats"
    );

    // Target larger than source (Apps Script repeats source)
    targetRange = sheet.getRange("J1:L4"); // 4x3 target, source 2x2
    sourceRange.copyTo(targetRange);
    let expectedValuesLarger = prepareTarget(sourceValues, targetRange); // prepareTarget handles value repetition
    verifyValues(
      sheet.getRange("J1:K4"),
      expectedValuesLarger,
      "PASTE_NORMAL: Larger target - Values"
    ); // Only check the repeated part
    verifyFormats(
      sheet.getRange("J1:K2"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_NORMAL: Larger target - Formats (top-left repeat)"
    );
    verifyFormats(
      sheet.getRange("J3:K4"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_NORMAL: Larger target - Formats (bottom-left repeat)"
    );
    t.is(
      sheet.getRange("L1").getBackground(),
      "#ffffff",
      "PASTE_NORMAL: Larger target - Unfilled column should be default background"
    );

    // --- Test Case 2: copyTo(destination, {contentsOnly: true}) ---

    // Clear target area first
    sheet.getRange("D5:F8").clear();
    sheet.getRange("G5:H6").clear();
    sheet.getRange("J5:L8").clear();

    // Set some initial format on target to ensure it's not overwritten
    sheet.getRange("D5:E6").setBackground("#cccccc"); // Grey background

    // Target same size
    targetRange = sheet.getRange("D5:E6");
    sourceRange.copyTo(targetRange, { contentsOnly: true });
    verifyValues(targetRange, sourceValues, "PASTE_VALUES: Same size - Values");
    t.is(
      targetRange.getBackground(),
      "#cccccc",
      "PASTE_VALUES: Same size - Background should remain"
    ); // Format should not change

    // Target smaller
    targetRange = sheet.getRange("G5:G5");
    sheet.getRange("G5:H6").setBackground("#cccccc");
    sourceRange.copyTo(targetRange, { contentsOnly: true });
    verifyValues(
      sheet.getRange("G5:H6"),
      sourceValues,
      "PASTE_VALUES: Smaller target - Values"
    );
    t.is(
      sheet.getRange("G5").getBackground(),
      "#cccccc",
      "PASTE_VALUES: Smaller target - Background should remain"
    );

    // Target larger
    targetRange = sheet.getRange("J5:L8");
    sheet.getRange("J5:L8").setBackground("#cccccc");
    sourceRange.copyTo(targetRange, { contentsOnly: true });
    expectedValuesLarger = prepareTarget(sourceValues, targetRange);
    verifyValues(
      sheet.getRange("J5:K8"),
      expectedValuesLarger,
      "PASTE_VALUES: Larger target - Values"
    );
    t.is(
      sheet.getRange("J5").getBackground(),
      "#cccccc",
      "PASTE_VALUES: Larger target - Background should remain"
    );
    t.is(
      sheet.getRange("L5").getBackground(),
      "#cccccc",
      "PASTE_VALUES: Larger target - Unfilled column background should remain"
    );

    // --- Test Case 3: copyTo(destination, {formatOnly: true}) ---

    // Clear target area first
    sheet.getRange("D9:F12").clear();
    sheet.getRange("G9:H10").clear();
    sheet.getRange("J9:L12").clear();

    // Set some initial values on target to ensure they're not overwritten
    sheet.getRange("D9:E10").setValues([
      ["X1", "X2"],
      ["X3", "X4"],
    ]);

    // Target same size
    targetRange = sheet.getRange("D9:E10");
    sourceRange.copyTo(targetRange, { formatOnly: true });
    verifyValues(
      targetRange,
      [
        ["X1", "X2"],
        ["X3", "X4"],
      ],
      "PASTE_FORMAT: Same size - Values should remain"
    ); // Values should not change
    verifyFormats(
      targetRange,
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_FORMAT: Same size - Formats"
    );

    // Target smaller
    targetRange = sheet.getRange("G9:G9");
    sheet.getRange("G9:H10").setValues([
      ["Y1", "Y2"],
      ["Y3", "Y4"],
    ]);
    sourceRange.copyTo(targetRange, { formatOnly: true });
    verifyValues(
      sheet.getRange("G9:H10"),
      [
        ["Y1", "Y2"],
        ["Y3", "Y4"],
      ],
      "PASTE_FORMAT: Smaller target - Values should remain"
    );
    verifyFormats(
      sheet.getRange("G9:H10"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_FORMAT: Smaller target - Formats"
    );

    // Target larger
    targetRange = sheet.getRange("J9:L12");
    sheet.getRange("J9:L12").setValues([
      ["Z1", "Z2", "Z3"],
      ["Z4", "Z5", "Z6"],
      ["Z7", "Z8", "Z9"],
      ["Z10", "Z11", "Z12"],
    ]);
    sourceRange.copyTo(targetRange, { formatOnly: true });
    verifyValues(
      sheet.getRange("J9:L12"),
      [
        ["Z1", "Z2", "Z3"],
        ["Z4", "Z5", "Z6"],
        ["Z7", "Z8", "Z9"],
        ["Z10", "Z11", "Z12"],
      ],
      "PASTE_FORMAT: Larger target - Values should remain"
    );
    verifyFormats(
      sheet.getRange("J9:K10"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_FORMAT: Larger target - Formats (top-left repeat)"
    );
    verifyFormats(
      sheet.getRange("J11:K12"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "PASTE_FORMAT: Larger target - Formats (bottom-left repeat)"
    );
    t.is(
      sheet.getRange("L9").getBackground(),
      "#ffffff",
      "PASTE_FORMAT: Larger target - Unfilled column should be default background"
    );

    // --- Test Case 4: copyTo(destination, SpreadsheetApp.CopyPasteType.PASTE_VALUES) ---

    // Clear target area first
    sheet.getRange("D13:F16").clear();
    sheet.getRange("G13:H14").clear();
    sheet.getRange("J13:L16").clear();

    // Set some initial format on target to ensure it's not overwritten
    sheet.getRange("D13:E14").setBackground("#cccccc");

    // Target same size
    targetRange = sheet.getRange("D13:E14");
    sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_VALUES);
    verifyValues(
      targetRange,
      sourceValues,
      "PASTE_VALUES enum: Same size - Values"
    );
    // buggy in GAS so skip - see https://issuetracker.google.com/issues/427192537
    if (SpreadsheetApp.isFake) {
      t.is(
        targetRange.getBackground(),
        "#cccccc",
        "PASTE_VALUES enum: Same size - Background should remain"
      );
    }
    // Target smaller
    targetRange = sheet.getRange("G13:G13");
    sheet.getRange("G13:H14").setBackground("#cccccc");
    sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_VALUES);
    verifyValues(
      sheet.getRange("G13:H14"),
      sourceValues,
      "PASTE_VALUES enum: Smaller target - Values"
    );
    // buggy in GAS so skip - see https://issuetracker.google.com/issues/427192537
    if (SpreadsheetApp.isFake) {
      t.is(
        sheet.getRange("G13").getBackground(),
        "#cccccc",
        "PASTE_VALUES enum: Smaller target - Background should remain"
      );
    }

    // Target larger
    targetRange = sheet.getRange("J13:L16");
    sheet.getRange("J13:L16").setBackground("#cccccc");
    sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_VALUES);
    expectedValuesLarger = prepareTarget(sourceValues, targetRange);
    verifyValues(
      sheet.getRange("J13:K16"),
      expectedValuesLarger,
      "PASTE_VALUES enum: Larger target - Values"
    );
    // buggy in GAS so skip - see https://issuetracker.google.com/issues/427192537
    if (SpreadsheetApp.isFake) {
      t.is(
        sheet.getRange("J13").getBackground(),
        "#cccccc",
        "PASTE_VALUES enum: Larger target - Background should remain"
      );
    }
    t.is(
      sheet.getRange("L13").getBackground(),
      "#cccccc",
      "PASTE_VALUES enum: Larger target - Unfilled column background should remain"
    );

    // --- Test Case 5: copyTo(destination, SpreadsheetApp.CopyPasteType.PASTE_NORMAL, true) - Transposed ---

    // Clear target area first
    sheet.getRange("D17:F20").clear();
    sheet.getRange("G17:H18").clear();
    sheet.getRange("J17:L20").clear();

    // Target same size (transposed)
    targetRange = sheet.getRange("D17:E18"); // Source 2x2, target 2x2
    const transposedSourceValues = transpose2DArray(sourceValues); // [[V1, V3], [V2, V4]]
    sourceRange.copyTo(
      targetRange,
      SpreadsheetApp.CopyPasteType.PASTE_NORMAL,
      true
    );
    verifyValues(
      targetRange,
      transposedSourceValues,
      "Transposed PASTE_NORMAL: Same size - Values"
    );
    // Formats also transpose
    verifyFormats(
      sheet.getRange("D17"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "Transposed PASTE_NORMAL: Same size - Formats (D17)"
    );
    verifyFormats(
      sheet.getRange("E17"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "Transposed PASTE_NORMAL: Same size - Formats (E17)"
    );
    verifyFormats(
      sheet.getRange("D18"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "Transposed PASTE_NORMAL: Same size - Formats (D18)"
    );
    verifyFormats(
      sheet.getRange("E18"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "Transposed PASTE_NORMAL: Same size - Formats (E18)"
    );

    // Target smaller (transposed)
    targetRange = sheet.getRange("G17:G17"); // 1x1 target
    sourceRange.copyTo(
      targetRange,
      SpreadsheetApp.CopyPasteType.PASTE_NORMAL,
      true
    );
    // Expected: G17:H18 should have transposed source values/formats
    verifyValues(
      sheet.getRange("G17:H18"),
      transposedSourceValues,
      "Transposed PASTE_NORMAL: Smaller target - Values"
    );
    verifyFormats(
      sheet.getRange("G17:H18"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "Transposed PASTE_NORMAL: Smaller target - Formats"
    );

    // Target larger (transposed)
    targetRange = sheet.getRange("J17:L20"); // 4x3 target, source 2x2
    sourceRange.copyTo(
      targetRange,
      SpreadsheetApp.CopyPasteType.PASTE_NORMAL,
      true
    );
    // Use prepareTarget with the transposed source values
    const expectedTransposedRepeatedValues = prepareTarget(
      transposedSourceValues,
      targetRange
    );
    // The target is J17:L20 (4 rows, 3 cols). Transposed source is 2x2.
    // It will repeat 2 times vertically (4/2) and 1 time horizontally (3/2 = 1.5 -> 1 full repeat)
    // So the effective copied area is 4x2.
    verifyValues(
      sheet.getRange("J17:K20"),
      expectedTransposedRepeatedValues,
      "Transposed PASTE_NORMAL: Larger target - Values"
    );
    verifyFormats(
      sheet.getRange("J17:K18"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "Transposed PASTE_NORMAL: Larger target - Formats (top-left repeat)"
    );
    verifyFormats(
      sheet.getRange("J19:K20"),
      sourceBgColor,
      sourceFontColor,
      sourceFontSize,
      sourceFontWeight,
      "Transposed PASTE_NORMAL: Larger target - Formats (bottom-left repeat)"
    );
    t.is(
      sheet.getRange("L17").getBackground(),
      "#ffffff",
      "Transposed PASTE_NORMAL: Larger target - Unfilled column should be default background"
    );

    // --- Test Case 6: Empty Source Range ---

    const emptySourceRange = sheet.getRange("A100:B101"); // An empty range
    targetRange = sheet.getRange("D100:E101");
    targetRange.setValues([
      ["X", "Y"],
      ["Z", "W"],
    ]); // Put some values in target
    targetRange.setBackground("#00ff00"); // Green background

    emptySourceRange.copyTo(targetRange);
    // Expect target to be cleared (values and formats)
    verifyValues(
      targetRange,
      [
        ["", ""],
        ["", ""],
      ],
      "Empty source: Values should be cleared"
    );
    t.is(
      targetRange.getBackground(),
      "#ffffff",
      "Empty source: Background should be cleared to default"
    );

    // --- Test Case 7: Invalid arguments ---


    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section("copy values and formats to range", (t) => {
    const { sheet } = maketss("prepareTarget", toTrash, fixes);

    const gargs = (target) => {
      return [
        target.getSheet(),
        target.getColumn(),
        target.getNumColumns() + target.getColumn() - 1,
        target.getRow(),
        target.getRow() + target.getNumRows() - 1,
      ];
    };

    const copyToRangeTest = (domain, method, getMethod, setMethod) => {
      const s22 = sheet.getRange(1, 1, 2, 2);
      const v22 = fillRangeFromDomain(s22, domain);

      // Case 1: Target is smaller than source (e.g., 1x1)
      let t11 = sheet.getRange(101, 11, 1, 1);
      let p11 = prepareTarget(v22, t11);
      t.deepEqual(
        v22,
        p11,
        "Target smaller than source should return full source"
      );

      // lets try writing and reading
      s22[setMethod](p11);
      s22[method](...gargs(t11));
      t.deepEqual(
        t11.offset(0, 0, s22.getNumRows(), s22.getNumColumns())[getMethod](),
        p11
      );

      // Case 2: Target is same size as source (2x2)
      const t22 = sheet.getRange(105, 11, 2, 2);
      const p22 = prepareTarget(v22, t22);
      t.deepEqual(p22, v22, "Target same size as source should return source");
      s22[method](...gargs(t22));
      t.deepEqual(t22[getMethod](), p22);

      // Case 3: Target is an exact multiple of source (e.g., 4x6)
      const t46 = sheet.getRange(110, 1, 4, 6);
      const p46 = prepareTarget(v22, t46);
      s22[method](...gargs(t46));
      t.deepEqual(t46[getMethod](), p46);

      // Case 4: Target is larger but not an exact multiple (e.g., 5x5)
      const t55 = sheet.getRange(116, 1, 5, 5);
      const p55 = prepareTarget(v22, t55);
      s22[method](...gargs(t55));
      t.deepEqual(
        t55.offset(0, 0, p55.length, p55[0].length)[getMethod](),
        p55
      );

      // Case 5: Target has one dimension smaller, one larger (e.g., 1x3)
      const t13 = sheet.getRange(122, 1, 1, 3);
      const p13 = prepareTarget(v22, t13);
      s22[method](...gargs(t13));
      t.deepEqual(
        t13.offset(0, 0, p13.length, p13[0].length)[getMethod](),
        p13
      );

      // Case 6: Target has one dimension as exact multiple, one not (e.g., 4x3)
      const t43 = sheet.getRange(128, 1, 4, 3);
      const p43 = prepareTarget(v22, t43);
      s22[method](...gargs(t43));
      t.deepEqual(
        t43.offset(0, 0, t43.getNumRows(), s22.getNumColumns())[getMethod](),
        p43
      );

      // Case 7: Non-square source (e.g., 3x2) and non-square target (e.g., 7x5)
      const s32 = sheet.getRange(11, 1, 3, 2);
      const v32 = fillRangeFromDomain(s32, domain);
      const t75 = sheet.getRange(132, 1, 7, 5);
      const p75 = prepareTarget(v32, t75);
      s32[setMethod](v32);
      s32[method](...gargs(t75));
      t.deepEqual(
        t75.offset(0, 0, p75.length, p75[0].length)[getMethod](),
        p75
      );
    };

    copyToRangeTest(
      ["bar", "foo", 1, 0, true],
      "copyValuesToRange",
      "getValues",
      "setValues"
    );
    copyToRangeTest(
      ["Comic Sans MS", "Helvetica", "Verdana,Sans Serif"],
      "copyFormatToRange",
      "getFontFamilies",
      "setFontFamilies"
    );
    copyToRangeTest(
      [10, 20, 12, 32],
      "copyFormatToRange",
      "getFontSizes",
      "setFontSizes"
    );


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

wrapupTest(testSheets);
