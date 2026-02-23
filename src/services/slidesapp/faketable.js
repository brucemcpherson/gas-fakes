import { Proxies } from '../../support/proxies.js';
import { FakePageElement, PageElementRegistry } from './fakepageelement.js';
import { newFakeTableRow } from './faketablerow.js';

export const newFakeTable = (...args) => {
  return Proxies.guard(new FakeTable(...args));
};

PageElementRegistry.newFakeTable = newFakeTable;

export class FakeTable extends FakePageElement {
  constructor(resource, page) {
    super(resource, page);
  }

  get __presentation() {
    return this.__page.__presentation || this.__page.__slide?.__presentation;
  }

  /**
   * Gets the rows in the table.
   * @returns {FakeTableRow[]} The rows.
   */
  getRows() {
    return (this.__resource.table?.tableRows || []).map((_, index) =>
      newFakeTableRow(this, index)
    );
  }

  /**
   * Gets a row by its index.
   * @param {number} index The row index.
   * @returns {FakeTableRow} The row.
   */
  getRow(index) {
    const rows = this.getRows();
    if (index < 0 || index >= rows.length) {
      throw new Error(`Row index ${index} out of bounds`);
    }
    return rows[index];
  }

  /**
   * Gets the number of rows in the table.
   * @returns {number} The number of rows.
   */
  getNumRows() {
    return (this.__resource.table?.tableRows || []).length;
  }

  /**
   * Gets the number of columns in the table.
   * @returns {number} The number of columns.
   */
  getNumColumns() {
    const rows = this.__resource.table?.tableRows || [];
    return rows.length > 0 ? (rows[0].tableCells || []).length : 0;
  }

  toString() {
    return 'Table';
  }
}
