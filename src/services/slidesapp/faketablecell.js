import { Proxies } from '../../support/proxies.js';
import { newFakeTextRange } from './faketextrange.js';

export const newFakeTableCell = (...args) => {
  return Proxies.guard(new FakeTableCell(...args));
};

export class FakeTableCell {
  constructor(resource, table, rowIndex, colIndex) {
    this.__resource = resource;
    this.__table = table;
    this.__rowIndex = rowIndex;
    this.__colIndex = colIndex;
  }

  /**
   * Gets the text in the cell.
   * @returns {FakeTextRange} The text range.
   */
  getText() {
    // FakeTableCell in Slides API doesn't have a direct shape resource to pass to TextRange?
    // Actually, TableCell has text property in Slides API.
    // Wait, let's check Slides API TableCell resource.
    // It has `text` field of type `TextContent`.
    // FakeTextRange expects a `shape` with `__resource.shape.text`.
    // We might need to adapt FakeTextRange or mock a shape-like object.

    // Let's create a proxy for shape so FakeTextRange can work.
    const mockShape = {
      getObjectId: () => this.__table.getObjectId(),
      __resource: {
        shape: {
          text: this.__resource.text || { textElements: [] }
        }
      },
      __cellLocation: {
        rowIndex: this.__rowIndex,
        columnIndex: this.__colIndex
      },
      __presentation: this.__table.__presentation
    };
    if (!this.__resource.text) {
      this.__resource.text = mockShape.__resource.shape.text;
    }
    return newFakeTextRange(mockShape);
  }

  toString() {
    return 'TableCell';
  }
}
