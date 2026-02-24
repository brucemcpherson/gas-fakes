import { Proxies } from '../../support/proxies.js';
import { newFakeTableCell } from './faketablecell.js';

export const newFakeTableRow = (...args) => {
  return Proxies.guard(new FakeTableRow(...args));
};

export class FakeTableRow {
  constructor(table, rowIndex) {
    this.__table = table;
    this.__rowIndex = rowIndex;
  }

  get __resource() {
    return this.__table.__resource.table?.tableRows?.[this.__rowIndex];
  }

  /**
   * Gets the cells in the row.
   * @returns {FakeTableCell[]} The cells.
   */
  getCells() {
    return (this.__resource?.tableCells || []).map((_, colIndex) =>
      newFakeTableCell(this.__table, this.__rowIndex, colIndex)
    );
  }

  /**
   * Gets a cell by its index.
   * @param {number} index The cell index.
   * @returns {FakeTableCell} The cell.
   */
  getCell(index) {
    const cells = this.getCells();
    if (index < 0 || index >= cells.length) {
      throw new Error(`Cell index ${index} out of bounds`);
    }
    return cells[index];
  }

  /**
   * Gets the number of cells in the row.
   * @returns {number} The number of cells.
   */
  getNumCells() {
    return (this.__resource?.tableCells || []).length;
  }

  toString() {
    return 'TableRow';
  }
}
