
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import '@mcpher/gas-fakes'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { maketss, wrapupTest, trasher, cachePerformance } from './testassist.js';

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsData = (pack) => {

  const toTrash = [];
  const { unit, fixes } = pack || initTests()


  const data = [
    ['Region', 'Product', 'Sales', 'Date'],
    ['East', 'Pen', 100, new Date('2023-01-15')],
    ['West', 'Pencil', 150, new Date('2023-01-20')],
    ['East', 'Pencil', 200, new Date('2023-02-10')],
    ['West', 'Pen', 120, new Date('2023-02-15')],
    ['East', 'Pen', 130, new Date('2023-03-05')],
    ['South', 'Marker', 50, null], // Added for blank test
    ['West', 'Pencil', 75, new Date('2023-01-20')], // Added for duplicate data test
  ];

  const createTestPivotTable = (sheet) => {
    // Clear previous pivot tables if any
    const existingPivotTables = sheet.getPivotTables();
    if (existingPivotTables.length > 0) {
      const anchor = existingPivotTables[0].getAnchorCell();
      anchor.clear();
    }
    const dataRange = sheet.getRange(1, 1, data.length, data[0].length);
    dataRange.setValues(data);

    const pivotTableRange = sheet.getRange('F1');
    const pivotTable = pivotTableRange.createPivotTable(dataRange);

    // Region - column 1
    const rowGroup = pivotTable.addRowGroup(1);
    rowGroup.sortAscending();
    rowGroup.showTotals(true);

    // Product - column 2
    const colGroup = pivotTable.addColumnGroup(2);
    colGroup.sortAscending();
    colGroup.showTotals(true);

    // Sales - column 3
    pivotTable.addPivotValue(3, SpreadsheetApp.PivotTableSummarizeFunction.SUM);

    // Date filter - column 4
    const filterCriteria = SpreadsheetApp.newFilterCriteria()
      .setVisibleValues([String(data[2][3]), String(data[3][3]), String(data[5][3])])
      .build();
    pivotTable.addFilter(4, filterCriteria);

    // re-fetch the pivot table to get the latest state after all modifications
    return sheet.getPivotTables()[0];
  };
  unit.section('PivotFilter methods', (t) => {
    const { sheet } = maketss(t.options.description, toTrash, fixes);

    const pivotTable = createTestPivotTable(sheet);
    const filter = pivotTable.getFilters()[0];

    t.is(filter.getPivotTable().getAnchorCell().getA1Notation(), 'F1', 'should get parent pivot table from filter');
    t.is(filter.getSourceDataColumn(), 4, 'should get correct source data column index from filter');

    const criteria = filter.getFilterCriteria();
    t.is(criteria.toString(), 'FilterCriteria', 'should get filter criteria');
    t.is(criteria.getVisibleValues().length, 3, 'should get correct visible values');

    // Per documentation, pivot table filters only support criteria with visible values.
    const visibleValues = [String(data[1][3]), String(data[4][3])];
    const newCriteria = SpreadsheetApp.newFilterCriteria().setVisibleValues(visibleValues).build();
    filter.setFilterCriteria(newCriteria);
    const updatedCriteria = filter.getFilterCriteria();
    t.is(updatedCriteria.getVisibleValues().length, 2, 'should set filter criteria with visible values');

    // Test clearing the criteria
    const emptyCriteria = SpreadsheetApp.newFilterCriteria().build();
    filter.setFilterCriteria(emptyCriteria);
    const clearedCriteria = filter.getFilterCriteria();
    t.is(clearedCriteria.toString(), 'FilterCriteria', 'should get a criteria object even when cleared');
    t.is(clearedCriteria.getCriteriaType(), null, 'cleared criteria should have null type');
    t.deepEqual(clearedCriteria.getCriteriaValues(), [], 'cleared criteria should have empty values');

    // Verify that getVisibleValues returns an empty array for a cleared filter.
    t.deepEqual(clearedCriteria.getVisibleValues(), [], "cleared criteria should have no visible values");

    filter.remove();
    // After a mutation via a child object, the original pivotTable variable is stale.
    // We re-fetch it from the sheet to get the current state.
    const updatedPivotTable = sheet.getPivotTables()[0];
    // A removed pivot table will result in undefined.
    const filters = updatedPivotTable ? updatedPivotTable.getFilters() : [];
    t.is(filters.length, 0, 'should remove filter');

    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section('CalculatedPivotValue methods', (t) => {
    const { sheet } = maketss(t.options.description, toTrash, fixes);

    const pivotTable = createTestPivotTable(sheet);
    const cpv = pivotTable.addCalculatedPivotValue('Test Formula', '=SUM(Sales)');

    t.is(cpv.getFormula(), '=SUM(Sales)', 'should get formula');
    cpv.setFormula('=AVERAGE(Sales)');
    t.is(cpv.getFormula(), '=AVERAGE(Sales)', 'should set formula');

    t.is(cpv.getPivotTable().getAnchorCell().getA1Notation(), 'F1', 'should get parent pivot table from calculated value');

    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section('PivotTable methods', t => {

    const { sheet } = maketss(t.options.description, toTrash, fixes);

    const pivotTable = createTestPivotTable(sheet);
    t.is(pivotTable.getAnchorCell().getA1Notation(), 'F1', 'should get correct anchor cell');
    t.is(pivotTable.getSourceDataRange().getA1Notation(), 'A1:D8', 'should get correct data source');
    t.is(pivotTable.getValuesDisplayOrientation(), SpreadsheetApp.Dimension.COLUMNS, 'should get default display orientation');
    pivotTable.setValuesDisplayOrientation(SpreadsheetApp.Dimension.ROWS);
    t.is(pivotTable.getValuesDisplayOrientation(), SpreadsheetApp.Dimension.ROWS, 'should set display orientation');
    t.is(pivotTable.getRowGroups().length, 1, 'should get row groups');
    t.is(pivotTable.getColumnGroups().length, 1, 'should get column groups');
    t.is(pivotTable.getPivotValues().length, 1, 'should get pivot values');
    t.is(pivotTable.getFilters().length, 1, 'should get filters');

    const cpv = pivotTable.addCalculatedPivotValue('Avg Sales', '=AVERAGE(Sales)');
    t.is(cpv.toString(), 'PivotValue', 'addCalculatedPivotValue should return a PivotValue object');

    // The official API does not have getCalculatedPivotValues(). We filter all pivot values.
    let cpvs = pivotTable.getPivotValues().filter(v => v.getFormula());
    t.is(cpvs.length, 1, 'should get calculated pivot values');
    t.is(cpvs[0].getFormula(), '=AVERAGE(Sales)', 'calculated pivot value should have correct formula');

    // The official API removes values via the value object itself.
    cpvs[0].remove();
    const updatedPivotTable = sheet.getPivotTables()[0];
    const updatedCpvs = updatedPivotTable.getPivotValues().filter(v => v.getFormula());
    t.is(updatedCpvs.length, 0, 'should remove calculated pivot value');

    // Test removing the entire pivot table
    updatedPivotTable.remove();
    const finalPivotTables = sheet.getPivotTables();
    t.is(finalPivotTables.length, 0, "should remove the pivot table itself");

    if (SpreadsheetApp.isFake) cachePerformance()
  })

  unit.section('PivotGroup methods', (t) => {
    const { sheet } = maketss(t.options.description, toTrash, fixes);

    const pivotTable = createTestPivotTable(sheet);
    const rowGroup = pivotTable.getRowGroups()[0];
    const colGroup = pivotTable.getColumnGroups()[0];

    t.true(rowGroup.totalsAreShown(), 'row group should show totals by default');
    rowGroup.showTotals(false);
    t.false(rowGroup.totalsAreShown(), 'should hide row group totals');
    rowGroup.showTotals(true);
    t.true(rowGroup.totalsAreShown(), 'should show row group totals');

    t.is(rowGroup.getDimension(), SpreadsheetApp.Dimension.ROWS, 'should get correct row dimension');
    t.is(colGroup.getDimension(), SpreadsheetApp.Dimension.COLUMNS, 'should get correct column dimension');

    t.is(rowGroup.getPivotTable().getAnchorCell().getA1Notation(), 'F1', 'should get parent pivot table');

    t.is(rowGroup.getSourceDataColumn(), 1, 'should get correct source data column for row group');
    t.is(colGroup.getSourceDataColumn(), 2, 'should get correct source data column for column group');

    t.true(rowGroup.isSortAscending(), 'should get default sort order as ascending');
    rowGroup.sortDescending();
    t.false(rowGroup.isSortAscending(), 'should set sort order to descending');

    // setDisplayName doesn't have a corresponding getter in the official API.
    // We'll test that the method call succeeds without throwing an error.
    // The live API returns a new object, so we check the type to confirm chainability.
    t.is(rowGroup.setDisplayName('Region Total').toString(), 'PivotGroup', 'setDisplayName should be chainable');
    // There's no getter, so we just test that resetDisplayName is chainable.
    t.is(rowGroup.resetDisplayName().toString(), 'PivotGroup', 'resetDisplayName should be chainable');

    t.false(rowGroup.areLabelsRepeated(), 'should not repeat headings by default');
    rowGroup.showRepeatedLabels();
    t.true(rowGroup.areLabelsRepeated(), 'should set repeat headings');

    rowGroup.remove();
    const updatedPivotTable = sheet.getPivotTables()[0];
    // A removed pivot table will result in undefined.
    const rowGroups = updatedPivotTable ? updatedPivotTable.getRowGroups() : [];
    t.is(rowGroups.length, 0, 'should remove pivot group');

    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section('PivotValue methods', (t) => {
    const { sheet } = maketss(t.options.description, toTrash, fixes);

    let pivotTable = createTestPivotTable(sheet);
    let pivotValue = pivotTable.getPivotValues()[0];

    t.is(pivotValue.getDisplayType(), SpreadsheetApp.PivotValueDisplayType.DEFAULT, 'should get default display type');
    pivotValue.showAs(SpreadsheetApp.PivotValueDisplayType.PERCENT_OF_GRAND_TOTAL);
    t.is(pivotValue.getDisplayType(), SpreadsheetApp.PivotValueDisplayType.PERCENT_OF_GRAND_TOTAL, 'should set display type with showAs');

    t.is(pivotValue.getPivotTable().getAnchorCell().getA1Notation(), 'F1', 'should get parent pivot table from value');

    t.is(pivotValue.getSummarizedBy(), SpreadsheetApp.PivotTableSummarizeFunction.SUM, 'should get summarized by function');
    pivotValue.summarizeBy(SpreadsheetApp.PivotTableSummarizeFunction.AVERAGE);
    t.is(pivotValue.getSummarizedBy(), SpreadsheetApp.PivotTableSummarizeFunction.AVERAGE, 'should set summarize by function');

    t.is(pivotValue.getSourceDataColumn(), 3, 'should get correct source data column index');

    // Test setDisplayName (no getter for it)
    t.is(pivotValue.setDisplayName('Custom Sales').toString(), 'PivotValue', 'setDisplayName should be chainable');

    // Test getFormula on a non-calculated value
    t.is(pivotValue.getFormula(), null, 'should return null for formula on non-calculated value');

    // Test remove
    pivotValue.remove();
    const updatedPivotTable = sheet.getPivotTables()[0];
    t.is(updatedPivotTable.getPivotValues().length, 0, 'should remove pivot value');

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

wrapupTest(testSheetsData);