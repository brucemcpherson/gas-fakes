import { Proxies } from "../../support/proxies.js";
import { signatureArgs, notYetImplemented } from "../../support/helpers.js";
import { newFakeSheetRange } from "./fakesheetrange.js";
import { Utils } from "../../support/utils.js";
import { SheetUtils } from "../../support/sheetutils.js";
import { batchUpdate, makeSheetsGridRange } from "./sheetrangehelpers.js";
import { newFakeFilter } from "./fakefilter.js";
import { newFakePivotTable } from "./fakepivottable.js";
import { newFakeBanding } from "./fakebanding.js";
import { newFakeDeveloperMetadataFinder } from "./fakedevelopermetadatafinder.js";
import { newFakeSheetRangeList } from "./fakesheetrangelist.js";
import { FakeTextFinder, newFakeTextFinder } from "./faketextfinder.js";

import { newFakeNamedRange } from "./fakenamedrange.js";
import { newFakeProtection } from "./fakeprotection.js";
import { newFakeOverGridImage } from "./fakeovergridimage.js";

import { XMLParser } from "fast-xml-parser";
import { slogger } from "../../support/slogger.js";
const { is, isEnum } = Utils;

export const newFakeSheet = (properties, parent) => {
  return Proxies.guard(new FakeSheet(properties, parent));
};

export class FakeSheet {
  /**
   * @constructor
   * @param {object} properties The sheet properties object from the Sheets API.
   * @param {import('./fakespreadsheet.js').FakeSpreadsheet} parent The parent FakeSpreadsheet object.
   */
  constructor(properties, parent) {
    this.__properties = properties;
    this.__parent = parent;

    const props = [
      "getCharts",
      "insertChart",
      "removeChart",
      "updateChart",
      // "getImages",
      "insertImage",
      "removeImage",
      // "getNamedRanges",
      // "getRangeByName", // <--- This is a method for Class Spreadsheet.
      // "removeNamedRange", // <--- This is a method for Class Spreadsheet.
      // "setNamedRange", // <--- This is a method for Class Spreadsheet.
      // "getProtections",
      // "protect",
      "getSlicers",
      "insertSlicer",
      // "hideColumn",
      // "hideRow",
      // "unhideColumn",
      // "unhideRow",
      // "isColumnHiddenByUser",
      // "isRowHiddenByUser",
      // "isRowHiddenByFilter",
      // "setFrozenColumns",
      // "setFrozenRows",
      // "moveRows",
      // "moveColumns",
      // "insertColumnAfter",
      // "insertColumnBefore",
      // "insertColumns",
      // "insertColumnsAfter",
      // "insertColumnsBefore",
      // "insertRowAfter",
      // "insertRowBefore",
      // "insertRows",
      // "insertRowsAfter",
      // "insertRowsBefore",
      // "deleteColumn",
      // "deleteColumns",
      // "deleteRow",
      // "deleteRows",
      // "autoResizeColumn",
      // "autoResizeColumns",
      "setSheetProtection",
      "getDataSourceTables",
      "getDataSourceFormulas",
      "getDataSourcePivotTables",
    ];

    props.forEach((f) => {
      this[f] = () => {
        return notYetImplemented(f);
      };
    });
  }

  getParent() {
    return this.__parent;
  }

  getName() {
    return this.__properties.title;
  }

  getSheetId() {
    return this.__properties.sheetId;
  }

  getIndex() {
    return this.__properties.index + 1; // 1-based
  }

  getSheetName() {
    return this.getName();
  }

  getMaxRows() {
    return this.__properties.gridProperties.rowCount;
  }

  getMaxColumns() {
    return this.__properties.gridProperties.columnCount;
  }

  getType() {
    return SpreadsheetApp.SheetType[this.__properties.sheetType];
  }

  isSheetHidden() {
    return !!this.__properties.hidden;
  }

  /**
   * Handles getRange calls with A1 or R1C1 string notation.
   * @private
   * @param {string} a1Notation The range notation string.
   * @returns {import('./fakesheetrange.js').FakeSheetRange}
   */
  __handleA1NotationGetRange(a1Notation) {
    // Check if it looks like R1C1 notation. This is a simple check;
    // fromRange will handle invalid A1 notations that might slip through.
    const isR1C1Like = /^[Rr]\d+[Cc]\d/i.test(a1Notation);

    let notationToParse = a1Notation;
    if (isR1C1Like) {
      // Convert R1C1 to A1. For a simple address, base row/col don't matter
      // as there are no relative parts. Using 1,1 for simplicity.
      // The result will be an absolute A1 reference, e.g., $A$1.
      notationToParse = SheetUtils.r1c1ToA1(a1Notation, 1, 1);
    }

    const partialGridRange = SheetUtils.fromRange(notationToParse);
    return newFakeSheetRange(
      {
        ...partialGridRange,
        sheetId: this.getSheetId(),
      },
      this,
      a1Notation
    ); // Pass original notation for preservation
  }

  /**
   * Handles getRange calls with numeric row/column arguments.
   * @private
   * @param {number} row The starting row.
   * @param {number} column The starting column.
   * @param {number} [numRows] The number of rows.
   * @param {number} [numColumns] The number of columns.
   * @returns {import('./fakesheetrange.js').FakeSheetRange}
   */
  __handleNumericGetRange(row, column, numRows, numColumns) {
    numRows = numRows || 1;
    numColumns = numColumns || 1;

    const gridRange = {
      sheetId: this.getSheetId(),
      startRowIndex: row - 1,
      endRowIndex: row + numRows - 1,
      startColumnIndex: column - 1,
      endColumnIndex: column + numColumns - 1,
    };
    return newFakeSheetRange(gridRange, this);
  }

  getRange(a1NotationOrRow, column, numRows, numColumns) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Sheet.getRange");

    if (nargs === 1 && is.string(a1NotationOrRow)) {
      return this.__handleA1NotationGetRange(a1NotationOrRow);
    }

    if (nargs >= 2 && nargs <= 4) {
      if (!is.integer(a1NotationOrRow) || !is.integer(column)) matchThrow();
      if (nargs >= 3 && !is.undefined(numRows) && !is.integer(numRows))
        matchThrow();
      if (nargs === 4 && !is.undefined(numColumns) && !is.integer(numColumns))
        matchThrow();

      return this.__handleNumericGetRange(
        a1NotationOrRow,
        column,
        numRows,
        numColumns
      );
    }

    matchThrow();
  }

  getDataRange() {
    const { values } =
      Sheets.Spreadsheets.Values.get(
        this.getParent().getId(),
        `'${this.getName()}'`
      ) || {};
    if (!values || values.length === 0) {
      return this.getRange(1, 1, 1, 1);
    }
    const numRows = values.length;
    const numCols = Math.max(0, ...values.map((row) => row.length));
    return this.getRange(1, 1, numRows, numCols);
  }

  getLastRow() {
    return this.getDataRange().getLastRow();
  }

  getLastColumn() {
    return this.getDataRange().getLastColumn();
  }

  getColumnWidth(columnPosition) {
    const { nargs, matchThrow } = signatureArgs(
      arguments,
      "Sheet.getColumnWidth"
    );
    if (nargs !== 1 || !is.integer(columnPosition) || columnPosition < 1)
      matchThrow();

    // we just need 1 column
    const range = this.getRange(1, columnPosition, 1, 1);
    // __getWithSheet() is a "private" method on FakeSheetRange that returns 'SheetName!A1'
    const rangeA1WithSheet = range.__getWithSheet();

    const meta = this.getParent().__getSheetMetaProps(
      [rangeA1WithSheet],
      "sheets.data.columnMetadata"
    );

    const colMeta = meta?.sheets?.[0]?.data?.[0]?.columnMetadata?.[0];

    // The default width is 100 if not specified.
    return colMeta?.pixelSize || 100;
  }

  getRowHeight(rowPosition) {
    const { nargs, matchThrow } = signatureArgs(
      arguments,
      "Sheet.getRowHeight"
    );
    if (nargs !== 1 || !is.integer(rowPosition) || rowPosition < 1)
      matchThrow();

    // we just need 1 row
    const range = this.getRange(rowPosition, 1, 1, 1);
    const rangeA1WithSheet = range.__getWithSheet();

    const meta = this.getParent().__getSheetMetaProps(
      [rangeA1WithSheet],
      "sheets.data.rowMetadata"
    );

    const rowMeta = meta?.sheets?.[0]?.data?.[0]?.rowMetadata?.[0];

    // The default height is 21 if not specified.
    return rowMeta?.pixelSize || 21;
  }

  __setDimensionSize(dimension, start, count, size) {
    const request = {
      updateDimensionProperties: {
        range: {
          sheetId: this.getSheetId(),
          dimension,
          startIndex: start - 1,
          endIndex: start + count - 1,
        },
        properties: { pixelSize: size },
        fields: "pixelSize",
      },
    };

    batchUpdate({ spreadsheet: this.getParent(), requests: [request] });
    return this;
  }

  setRowHeights(startRow, numRows, height) {
    const { nargs, matchThrow } = signatureArgs(
      arguments,
      "Sheet.setRowHeights"
    );
    if (
      nargs !== 3 ||
      !is.integer(startRow) ||
      !is.integer(numRows) ||
      !is.integer(height)
    )
      matchThrow();
    if (startRow < 1 || numRows < 1) {
      throw new Error("Row and number of rows must be positive.");
    }
    return this.__setDimensionSize("ROWS", startRow, numRows, height);
  }

  setRowHeightsForced(startRow, numRows, height) {
    const { nargs, matchThrow } = signatureArgs(
      arguments,
      "Sheet.setRowHeightsForced"
    );
    if (
      nargs !== 3 ||
      !is.integer(startRow) ||
      !is.integer(numRows) ||
      !is.integer(height)
    )
      matchThrow();
    // This method is maintained for backward compatibility and behaves identically to setRowHeights.
    return this.setRowHeights(startRow, numRows, height);
  }

  setColumnWidths(startColumn, numColumns, width) {
    const { nargs, matchThrow } = signatureArgs(
      arguments,
      "Sheet.setColumnWidths"
    );
    if (
      nargs !== 3 ||
      !is.integer(startColumn) ||
      !is.integer(numColumns) ||
      !is.integer(width)
    )
      matchThrow();
    if (startColumn < 1 || numColumns < 1) {
      throw new Error("Column and number of columns must be positive.");
    }
    return this.__setDimensionSize("COLUMNS", startColumn, numColumns, width);
  }

  setColumnWidth(columnPosition, width) {
    const { nargs, matchThrow } = signatureArgs(
      arguments,
      "Sheet.setColumnWidth"
    );
    if (nargs !== 2 || !is.integer(columnPosition) || !is.integer(width))
      matchThrow();
    if (columnPosition < 1) {
      throw new Error("Column position must be positive.");
    }
    return this.setColumnWidths(columnPosition, 1, width);
  }

  setRowHeight(rowPosition, height) {
    const { nargs, matchThrow } = signatureArgs(
      arguments,
      "Sheet.setRowHeight"
    );
    if (nargs !== 2 || !is.integer(rowPosition) || !is.integer(height))
      matchThrow();
    if (rowPosition < 1) {
      throw new Error("Row position must be positive.");
    }
    return this.setRowHeights(rowPosition, 1, height);
  }

  getFilter() {
    const meta = this.getParent().__getMetaProps(
      `sheets(basicFilter,properties.sheetId)`
    );
    const sheetMeta = meta.sheets.find(
      (s) => s.properties.sheetId === this.getSheetId()
    );
    return sheetMeta?.basicFilter
      ? newFakeFilter(sheetMeta.basicFilter, this)
      : null;
  }

  getPivotTables() {
    const meta = this.getParent().__getMetaProps(
      `sheets(data(rowData(values(pivotTable))),properties.sheetId)`
    );
    const sheetMeta = meta.sheets.find(
      (s) => s.properties.sheetId === this.getSheetId()
    );
    const pivotTables = [];
    sheetMeta?.data?.[0]?.rowData?.forEach((row, rIndex) => {
      row.values?.forEach((cell, cIndex) => {
        if (cell.pivotTable) {
          const anchorCell = this.getRange(rIndex + 1, cIndex + 1);
          pivotTables.push(newFakePivotTable(cell.pivotTable, anchorCell));
        }
      });
    });
    return pivotTables;
  }

  getBandings() {
    const meta = this.getParent().__getMetaProps(
      `sheets(bandedRanges,properties.sheetId)`
    );
    const sheetMeta = meta.sheets.find(
      (s) => s.properties.sheetId === this.getSheetId()
    );
    return (sheetMeta?.bandedRanges || []).map((b) => newFakeBanding(b, this));
  }

  getDeveloperMetadata() {
    return this.createDeveloperMetadataFinder().find();
  }

  addDeveloperMetadata(key, value, visibility) {
    const { nargs, matchThrow } = signatureArgs(
      arguments,
      "Sheet.addDeveloperMetadata"
    );
    if (nargs < 1 || nargs > 3) matchThrow();
    if (!is.string(key)) matchThrow();

    let realValue = null;
    let realVisibility = SpreadsheetApp.DeveloperMetadataVisibility.DOCUMENT;

    if (nargs === 2) {
      if (isEnum(value)) {
        realVisibility = value;
      } else {
        realValue = value;
      }
    } else if (nargs === 3) {
      realValue = value;
      realVisibility = visibility;
    }

    const metadata = {
      metadataKey: key,
      metadataValue: realValue,
      visibility: realVisibility.toString(),
      location: {
        sheetId: this.getSheetId(),
      },
    };

    const request = {
      createDeveloperMetadata: {
        developerMetadata: metadata,
      },
    };

    batchUpdate({ spreadsheet: this.getParent(), requests: [request] });
    return this;
  }

  createDeveloperMetadataFinder() {
    const { nargs, matchThrow } = signatureArgs(
      arguments,
      "Sheet.createDeveloperMetadataFinder"
    );
    if (nargs) matchThrow();
    return newFakeDeveloperMetadataFinder(this);
  }

  __clear(fields) {
    const range = makeSheetsGridRange(this.getDataRange());
    const requests = [
      {
        updateCells: Sheets.newUpdateCellsRequest()
          .setFields(fields)
          .setRange(range),
      },
    ];
    batchUpdate({ spreadsheet: this.getParent(), requests });
    return this;
  }

  clear(options) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Sheet.clear");
    if (nargs > 1 || (nargs === 1 && !is.object(options))) matchThrow();

    const fields = [];
    // Based on test case, sheet.clear() with no options clears content and format.
    if (!options || (!options.contentsOnly && !options.formatsOnly)) {
      fields.push("userEnteredValue", "userEnteredFormat");
    } else {
      if (options.contentsOnly) fields.push("userEnteredValue");
      if (options.formatsOnly) fields.push("userEnteredFormat");
    }

    if (fields.length > 0) {
      return this.__clear(fields.join(","));
    }
    return this;
  }

  clearContents() {
    return this.__clear("userEnteredValue");
  }

  clearFormats() {
    return this.__clear("userEnteredFormat");
  }

  clearNotes() {
    return this.__clear("note");
  }

  sort(columnPosition, ascending) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Sheet.sort");
    if (nargs < 1 || nargs > 2) matchThrow();
    if (!is.integer(columnPosition)) matchThrow();
    if (nargs === 2 && !is.undefined(ascending) && !is.boolean(ascending))
      matchThrow();

    const dataRange = this.getDataRange();
    // Per documentation, sorting doesn't affect the header row.
    // If there's only a header or no data, there's nothing to sort.
    if (dataRange.getNumRows() <= 1) {
      return this;
    }

    // The sortSpec object for Range.sort() expects an absolute column position.
    const sortSpec = {
      column: columnPosition,
      ascending: ascending === undefined ? true : ascending,
    };

    // Per live testing, it seems the entire data range is sorted, contrary to documentation.
    return dataRange.sort(sortSpec);
  }

  getRangeList(a1Notations) {
    const { matchThrow } = signatureArgs(
      [a1Notations],
      "Sheet.getRangeList",
      "Sheet"
    );
    if (!is.array(a1Notations) || !a1Notations.every(is.string)) matchThrow();

    return newFakeSheetRangeList(a1Notations.map((a1) => this.getRange(a1)));
  }

  toString() {
    return "Sheet";
  }

  /**
   * createTextFinder(findText) https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#createTextFinder(String)
   * @param {String} text
   * @returns {FakeTextFinder}
   */
  createTextFinder(text) {
    return newFakeTextFinder(this, text);
  }

  /**
   *
   * Added the below methods by tanaike
   */

  appendRow(rowContents) {
    // If Sheets.Spreadsheets.Values.append can be used, the following script can be used.
    // Sheets.Spreadsheets.Values.append(
    //   { values: [rowContents] },
    //   this.getParent().getId(),
    //   this.getSheetName(),
    //   {
    //     valueInputOption: "USER_ENTERED",
    //   }
    // );

    const lastRow = this.getLastRow();
    const maxRow = this.getMaxRows();
    if (lastRow == maxRow) {
      this.insertRowAfter(lastRow);
    }
    const row = lastRow + (lastRow == 1 ? 0 : 1);
    this.getRange(row, 1, 1, rowContents.length).setValues([rowContents]);
    return this;
  }

  showSheet() {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          updateSheetProperties: {
            properties: { sheetId: this.getSheetId(), hidden: false },
            fields: "hidden",
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return this;
  }

  hideSheet() {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          updateSheetProperties: {
            properties: { sheetId: this.getSheetId(), hidden: true },
            fields: "hidden",
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return this;
  }

  autoResizeColumn(columnPosition) {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: this.getSheetId(),
              startIndex: columnPosition - 1,
              endIndex: columnPosition,
              dimension: "COLUMNS",
            },
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return this;
  }

  autoResizeColumns(startColumn, numColumns) {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: this.getSheetId(),
              startIndex: startColumn - 1,
              endIndex: startColumn + numColumns - 1,
              dimension: "COLUMNS",
            },
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return this;
  }

  insertColumnAfter(afterPosition, dimension = "COLUMNS") {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          insertDimension: {
            inheritFromBefore: true,
            range: {
              sheetId: this.getSheetId(),
              startIndex: afterPosition,
              endIndex: afterPosition + 1,
              dimension,
            },
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return this;
  }

  insertColumnBefore(beforePosition, dimension = "COLUMNS") {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          insertDimension: {
            inheritFromBefore: false,
            range: {
              sheetId: this.getSheetId(),
              startIndex: beforePosition - 1,
              endIndex: beforePosition,
              dimension,
            },
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return this;
  }

  insertColumns(columnIndex, numColumns, dimension = "COLUMNS") {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          insertDimension: {
            inheritFromBefore: false,
            range: {
              sheetId: this.getSheetId(),
              startIndex: columnIndex - 1,
              endIndex: columnIndex + numColumns - 1,
              dimension,
            },
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return this;
  }

  insertColumnsAfter(afterPosition, howMany, dimension = "COLUMNS") {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          insertDimension: {
            inheritFromBefore: true,
            range: {
              sheetId: this.getSheetId(),
              startIndex: afterPosition,
              endIndex: afterPosition + howMany,
              dimension,
            },
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return this;
  }

  insertColumnsBefore(beforePosition, howMany, dimension = "COLUMNS") {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          insertDimension: {
            inheritFromBefore: false,
            range: {
              sheetId: this.getSheetId(),
              startIndex: beforePosition - 1,
              endIndex: beforePosition + howMany - 1,
              dimension,
            },
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return this;
  }

  insertRowAfter(afterPosition) {
    return this.insertColumnAfter(afterPosition, "ROWS");
  }

  insertRowBefore(beforePosition) {
    return this.insertColumnBefore(beforePosition, "ROWS");
  }

  insertRows(rowIndex, numRows) {
    return this.insertColumns(rowIndex, numRows, "ROWS");
  }

  insertRowsAfter(afterPosition, howMany) {
    return this.insertColumnsAfter(afterPosition, howMany, "ROWS");
  }

  insertRowsBefore(beforePosition, howMany) {
    return this.insertColumnsBefore(beforePosition, howMany, "ROWS");
  }

  deleteColumn(columnPosition, dimension = "COLUMNS") {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: this.getSheetId(),
              startIndex: columnPosition - 1,
              endIndex: columnPosition,
              dimension,
            },
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return this;
  }

  deleteColumns(columnPosition, howMany, dimension = "COLUMNS") {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: this.getSheetId(),
              startIndex: columnPosition - 1,
              endIndex: columnPosition + howMany - 1,
              dimension,
            },
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return this;
  }

  deleteRow(rowPosition) {
    return this.deleteColumn(rowPosition, "ROWS");
  }

  deleteRows(columnPosition, howMany) {
    return this.deleteColumns(columnPosition, howMany, "ROWS");
  }

  hideColumn(column, hiddenByUser = true, dimension = "COLUMNS") {
    if (column.toString() == "Range") {
      column = column.getColumn();
    }
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          updateDimensionProperties: {
            properties: {
              hiddenByUser,
            },
            range: {
              sheetId: this.getSheetId(),
              startIndex: column - 1,
              endIndex: column,
              dimension,
            },
            fields: "hiddenByUser",
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return this;
  }

  hideColumns(
    columnIndex,
    numColumns,
    hiddenByUser = true,
    dimension = "COLUMNS"
  ) {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          updateDimensionProperties: {
            properties: {
              hiddenByUser,
            },
            range: {
              sheetId: this.getSheetId(),
              startIndex: columnIndex - 1,
              endIndex: columnIndex + numColumns - 1,
              dimension,
            },
            fields: "hiddenByUser",
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return this;
  }

  hideRow(row) {
    return this.hideColumn(row.getRow(), true, "ROWS");
  }

  hideRows(rowIndex, numRows) {
    return this.hideColumns(rowIndex, numRows, true, "ROWS");
  }

  unhideColumn(column) {
    return this.hideColumn(column.getColumn(), false, "COLUMNS");
  }

  unhideRow(row) {
    return this.hideColumn(row.getRow(), false, "ROWS");
  }

  setFrozenColumns(columns, __p = "frozenColumnCount") {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          updateSheetProperties: {
            properties: {
              gridProperties: {
                [__p]: columns,
              },
              sheetId: this.getSheetId(),
            },
            fields: `gridProperties.${__p}`,
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return null;
  }

  setFrozenRows(rows) {
    return this.setFrozenColumns(rows, "frozenRowCount");
  }

  moveColumns(columnSpec, destinationIndex, dimension = "Column") {
    const startIndex = columnSpec[`get${dimension}`]() - 1;
    const endIndex = startIndex + columnSpec[`getNum${dimension}s`]();
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          moveDimension: {
            source: {
              sheetId: this.getSheetId(),
              startIndex,
              endIndex,
              dimension: `${dimension.toUpperCase()}S`,
            },
            destinationIndex: destinationIndex - 1,
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    return null;
  }

  moveRows(rowSpec, destinationIndex) {
    return this.moveColumns(rowSpec, destinationIndex, "Row");
  }

  isColumnHiddenByUser(
    columnPosition,
    dimension = "column",
    kind = "hiddenByUser"
  ) {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      ranges: [this.getSheetName()],
      fields: "sheets(data(rowMetadata,columnMetadata))",
    };
    const res = this.__get(obj);
    const ar = res.sheets[0].data[0][`${dimension}Metadata`];
    if (!ar[columnPosition - 1]) {
      throw new Error(`Those ${dimension}s are out of bounds.`);
    }
    return ar[columnPosition - 1].hasOwnProperty(kind);
  }

  isRowHiddenByUser(rowPosition) {
    return this.isColumnHiddenByUser(rowPosition, "row", "hiddenByUser");
  }

  isRowHiddenByFilter(rowPosition) {
    return this.isColumnHiddenByUser(rowPosition, "row", "hiddenByFilter");
  }

  getNamedRanges() {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      ranges: [this.getSheetName()],
      fields: "namedRanges",
    };
    const res = this.__get(obj).namedRanges;
    if (res && res.length > 0) {
      const checkedSheetId = this.getSheetId();
      const ar = res.filter(
        ({ range: { sheetId } }) => sheetId == checkedSheetId
      );
      const sheet = this;
      return ar.map((e) => newFakeNamedRange(sheet, e));
    }
    return [];
  }

  setName(name) {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId: this.getSheetId(),
              title: name,
            },
            fields: "title",
          },
        },
      ],
    };
    this.__batchUpdate(obj);
    this.__properties.title = name;
    return this;
  }

  protect() {
    const obj = {
      spreadsheetId: this.getParent().getId(),
      requests: [
        {
          addProtectedRange: {
            protectedRange: { range: { sheetId: this.getSheetId() } },
          },
        },
      ],
    };
    const res = this.__batchUpdate(obj);
    const o = res.replies[0]?.addProtectedRange?.protectedRange || {};
    return newFakeProtection(this, o);
  }

  getProtections(type) {
    if (!type) {
      throw new Error("Please set protection type.");
    }
    const obj = {
      spreadsheetId: this.getParent().getId(),
      ranges: [this.getSheetName()],
      fields: "sheets(protectedRanges)",
    };
    const res = this.__get(obj).sheets;
    if (
      res &&
      res.length > 0 &&
      res[0].protectedRanges &&
      res[0].protectedRanges.length > 0
    ) {
      const checkKeys = [
        "startRowIndex",
        "endRowIndex",
        "startColumnIndex",
        "endColumnIndex",
      ];
      const ar = res[0].protectedRanges.filter((r) => {
        if (type == "RANGE") {
          return checkKeys.every((k) => r.range.hasOwnProperty(k));
        } else if (type == "SHEET") {
          return checkKeys.every((k) => !r.range.hasOwnProperty(k));
        }
        return false;
      });
      const sheet = this;
      return ar.map((e) => newFakeProtection(sheet, e));
    }
    return [];
  }

  getImages() {
    const url = `https://docs.google.com/spreadsheets/export?exportFormat=xlsx&id=${this.__parent.__meta.spreadsheetId}`;
    const res = UrlFetchApp.fetch(url, {
      headers: { authorization: "Bearer " + ScriptApp.getOAuthToken() },
    });
    const blob = res.getBlob().setContentType("application/zip");
    const unzipped = Utilities.unzip(blob);
    const xmlObj = unzipped.reduce((o, b) => {
      const filename = b.getName();
      if (filename.endsWith('.xml') || filename.endsWith('.rels')) {
        const parser = new XMLParser({ ignoreAttributes: false });
        try {
          const p = parser.parse(b.getDataAsString());
          o[filename] = p;
        } catch (err) {
          slogger.error(`Error parsing ${filename}: ${err.message}`);
        }
      }
      return o;
    }, {});
    const tempObj = { sheets: {} };
    if (xmlObj["xl/workbook.xml"]) {
      const t = xmlObj[
        "xl/_rels/workbook.xml.rels"
      ].Relationships.Relationship.reduce(
        (o, e) => ((o[e["@_Id"]] = e["@_Target"]), o),
        {}
      );
      xmlObj["xl/workbook.xml"].workbook.sheets.sheet.forEach((e) => {
        const target = `xl/${t[e["@_r:id"]]}`;
        const k = `xl/worksheets/_rels/${target.split("/").pop()}.rels`;
        let drawing;
        if (Array.isArray(xmlObj[k].Relationships.Relationship)) {
          xmlObj[k].Relationships.Relationship.forEach((f) => {
            if (f["@_Type"].split("/").pop() == "drawing") {
              drawing = `xl/drawings/${f["@_Target"].split("/").pop()}`;
            }
          });
        } else {
          drawing = `xl/drawings/${xmlObj[k].Relationships.Relationship[
            "@_Target"
          ]
            .split("/")
            .pop()}`;
        }
        const imgs = [];
        if (
          xmlObj[drawing]["xdr:wsDr"] &&
          xmlObj[drawing]["xdr:wsDr"]["xdr:oneCellAnchor"]
        ) {
          const t = xmlObj[drawing]["xdr:wsDr"]["xdr:oneCellAnchor"];
          if (Array.isArray(t)) {
            t.forEach((f) => {
              imgs.push({
                col: f["xdr:from"]["xdr:col"],
                row: f["xdr:from"]["xdr:row"],
                anchorCellXOffset: f["xdr:from"]["xdr:colOff"] / 9525,
                anchorCellYOffset: f["xdr:from"]["xdr:rowOff"] / 9525,
                width: f["xdr:ext"]["@_cx"] / 9525,
                height: f["xdr:ext"]["@_cy"] / 9525,
                innerCell:
                  f["xdr:from"]["xdr:colOff"] == 0 &&
                  f["xdr:from"]["xdr:rowOff"] == 0,
              });
            });
          } else {
            imgs.push({
              col: t["xdr:from"]["xdr:col"],
              row: t["xdr:from"]["xdr:row"],
              anchorCellXOffset: t["xdr:from"]["xdr:colOff"] / 9525,
              anchorCellYOffset: t["xdr:from"]["xdr:rowOff"] / 9525,
              width: t["xdr:ext"]["@_cx"] / 9525,
              height: t["xdr:ext"]["@_cy"] / 9525,
              innerCell:
                f["xdr:from"]["xdr:colOff"] == 0 &&
                f["xdr:from"]["xdr:rowOff"] == 0,
            });
          }
        }
        tempObj.sheets[e["@_name"]] = {
          ...e,
          name: `xl/${t[e["@_r:id"]]}`,
          drawing,
          imgs: imgs.filter(({ innerCell }) => !innerCell), // Images over cells are retrieved.
        };
      });
    }
    const sheetName = this.getName();
    const o = tempObj.sheets[sheetName];
    if (o.imgs && o.imgs.length > 0) {
      const sheet = this;
      return o.imgs.map((e) => newFakeOverGridImage(sheet, e));
    }
    return [];
  }

  __batchUpdate({ spreadsheetId, requests }) {
    return Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheetId);
  }

  __get({ spreadsheetId, ranges, fields = "*" }) {
    return Sheets.Spreadsheets.get(spreadsheetId, { ranges, fields });
  }
}
