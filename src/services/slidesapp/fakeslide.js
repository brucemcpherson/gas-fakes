import { Proxies } from '../../support/proxies.js';
import { newFakeNotesPage } from './fakenotespage.js';
import { newFakeLayout } from './fakelayout.js';
import { newFakeMaster } from './fakemaster.js';
import { newFakePageElement } from './fakepageelement.js';
import { newFakePageBackground } from './fakepagebackground.js';
import { asSpecificPageElement } from './pageelementfactory.js';

export const newFakeSlide = (...args) => {
  return Proxies.guard(new FakeSlide(...args));
};

/**
 * @class FakeSlide
 * A fake for the Slide class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/slides/slide
 */
export class FakeSlide {
  /**
   * @param {object} resource the slide resource from Slides API
   * @param {FakePresentation} presentation the parent presentation
   */
  constructor(resource, presentation) {
    this.__id = resource.objectId;
    this.__presentation = presentation;
  }

  get __resource() {
    const presentationResource = this.__presentation.__resource;
    const slide = (presentationResource.slides || []).find(s => s.objectId === this.__id);

    if (!slide) {
      throw new Error(`Slide with ID ${this.__id} not found`);
    }
    return slide;
  }

  /**
   * Gets the unique ID for the slide.
   * @returns {string} The slide ID.
   */
  getObjectId() {
    return this.__id;
  }

  /**
   * Gets the notes page of the slide.
   * @returns {FakeNotesPage} The notes page.
   */
  getNotesPage() {
    const notesPage = this.__resource.slideProperties?.notesPage;
    return notesPage ? newFakeNotesPage(this) : null;
  }

  /**
   * Gets the layout the slide is based on.
   * @returns {FakeLayout} The layout.
   */
  getLayout() {
    const layoutId = this.__resource.slideProperties?.layoutObjectId;
    if (!layoutId) return null;

    // We need to find the layout in the presentation
    const presentationId = this.__presentation.getId();
    const presentation = Slides.Presentations.get(presentationId);
    const layout = presentation.layouts.find(l => l.objectId === layoutId);
    return layout ? newFakeLayout(layout, this.__presentation) : null;
  }



  /**
   * Gets the list of page elements on the slide.
   * @returns {FakePageElement[]} The page elements.
   */
  getPageElements() {
    return (this.__resource.pageElements || []).map(pe => asSpecificPageElement(newFakePageElement(pe, this)));
  }

  /**
   * Gets the background of the slide.
   * @returns {FakePageBackground} The background.
   */
  getBackground() {
    const background = this.__resource.pageBackgroundFill;
    return background ? newFakePageBackground(this) : null;
  }

  /**
   * Gets the list of tables on the slide.
   * @returns {FakeTable[]} The tables.
   */
  getTables() {
    return this.getPageElements()
      .filter(pe => pe.toString() === 'Table')
      .map(pe => pe.asTable());
  }

  /**
   * Gets the list of shapes on the slide.
   * @returns {FakeShape[]} The shapes.
   */
  getShapes() {
    return this.getPageElements()
      .filter(pe => pe.toString() === 'Shape')
      .map(pe => pe.asShape());
  }

  /**
   * Deletes the slide.
   */
  remove() {
    const presentationId = this.__presentation.getId();
    try {
      Slides.Presentations.batchUpdate([{
        deleteObject: {
          objectId: this.getObjectId()
        }
      }], presentationId);
    } catch (err) {
      // If not found, it's already deleted (perhaps on a previous timeouted attempt)
      if (!err?.message?.includes('not found')) throw err;
    }
  }

  /**
   * Inserts a shape.
   * @param {SlidesApp.ShapeType} shapeType The shape type.
   * @param {number} [left] The left position.
   * @param {number} [top] The top position.
   * @param {number} [width] The width.
   * @param {number} [height] The height.
   * @returns {FakeShape} The new shape.
   */
  insertShape(shapeType, left = 0, top = 0, width = 300, height = 300) {
    // Default size and position if not provided
    // shapeType should be string e.g. TEXT_BOX
    const presentationId = this.__presentation.getId();
    const objectId = `shape_${Math.random().toString(36).substring(2, 11)}`;
    const requests = [{
      createShape: {
        objectId,
        shapeType: shapeType,
        elementProperties: {
          pageObjectId: this.getObjectId(),
          size: {
            width: { magnitude: width, unit: 'PT' },
            height: { magnitude: height, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: left,
            translateY: top,
            unit: 'PT'
          }
        }
      }
    }];

    try {
      Slides.Presentations.batchUpdate(requests, presentationId);
    } catch (err) {
      if (!err?.message?.includes('already exists')) throw err;
    }

    // We assume the shape is added to the slide and we can retrieve it
    // Wait, we need to return a FakeShape.
    // We can fetch the updated slide and find it.
    // Or just create a FakeShape with the partial resource if we trust it?
    // Better to fetch fresh.

    // We can use getPageElements() to find it by ID.
    // But getPageElements returns FakePageElements.
    // We want FakeShape. FakePageElement has asShape().

    // Need to import newFakeShape if we want to return it directly, OR use getPageElements().
    // Let's use getPageElements since we already import newFakePageElement?
    // No, fakeslide.js imports newFakePageElement.

    // We need to invalidate cache? FakePresentation.batchUpdate logic handles cache clearing.
    // So subsequent access should be fresh.

    const elements = this.getPageElements();
    const newElement = elements.find(e => e.getObjectId() === objectId);
    if (!newElement) throw new Error('New shape not found');
    return newElement.asShape();
  }

  /**
   * Inserts a text box.
   * @param {string} text The text to insert.
   * @param {number} left The left position.
   * @param {number} top The top position.
   * @param {number} width The width.
   * @param {number} height The height.
   * @returns {FakeShape} The new text box.
   */
  insertTextBox(text, left, top, width, height) {
    const shape = this.insertShape('TEXT_BOX', left, top, width, height);
    if (text) {
      shape.getText().setText(text);
    }
    return shape;
  }

  /**
   * Inserts a line.
   * @param {SlidesApp.LineCategory} lineCategory The line category.
   * @param {number} [left]
   * @param {number} [top]
   * @param {number} [width]
   * @param {number} [height]
   * @returns {FakeLine} The new line.
   */
  insertLine(lineCategory, left = 0, top = 0, width = 100, height = 100) {
    const presentationId = this.__presentation.getId();
    const objectId = `line_${Math.random().toString(36).substring(2, 11)}`;
    const requests = [{
      createLine: {
        objectId,
        lineCategory: lineCategory,
        elementProperties: {
          pageObjectId: this.getObjectId(),
          size: {
            width: { magnitude: width, unit: 'PT' },
            height: { magnitude: height, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: left,
            translateY: top,
            unit: 'PT'
          }
        }
      }
    }];

    try {
      Slides.Presentations.batchUpdate(requests, presentationId);
    } catch (err) {
      if (!err?.message?.includes('already exists')) throw err;
    }

    const elements = this.getPageElements();
    const newElement = elements.find(e => e.getObjectId() === objectId);
    if (!newElement) throw new Error('New line not found');
    return newElement.asLine();
  }

  /**
   * Inserts a table.
   * @param {number|FakeTable} rowsOrTable The number of rows or a table to copy.
   * @param {number} [columns] The number of columns (if rowsOrTable is a number).
   * @param {number} [left]
   * @param {number} [top]
   * @param {number} [width]
   * @param {number} [height]
   * @returns {FakeTable} The new table.
   */
  insertTable(rowsOrTable, columns, left = 0, top = 0, width = 300, height = 300) {
    const presentationId = this.__presentation.getId();
    const objectId = `table_${Math.random().toString(36).substring(2, 11)}`;
    let request = null;

    if (typeof rowsOrTable === 'number') {
      request = {
        createTable: {
          objectId,
          rows: rowsOrTable,
          columns: columns,
          elementProperties: {
            pageObjectId: this.getObjectId(),
            size: {
              width: { magnitude: width, unit: 'PT' },
              height: { magnitude: height, unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: left,
              translateY: top,
              unit: 'PT'
            }
          }
        }
      };
    } else {
      // Copy table logic - use duplicateObject if it's the same presentation?
      // Or manually create new table with same rows/cols.
      // Slide.insertTable(Table) usually means copy.
      const table = rowsOrTable;
      request = {
        createTable: {
          objectId,
          rows: table.getNumRows(),
          columns: table.getNumColumns(),
          elementProperties: {
            pageObjectId: this.getObjectId(),
            size: {
              width: { magnitude: table.getWidth(), unit: 'PT' },
              height: { magnitude: table.getHeight(), unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: table.getLeft(),
              translateY: table.getTop(),
              unit: 'PT'
            }
          }
        }
      };
    }

    try {
      Slides.Presentations.batchUpdate([request], presentationId);
    } catch (err) {
      if (!err?.message?.includes('already exists')) throw err;
    }

    const elements = this.getPageElements();
    const newElement = elements.find(e => e.getObjectId() === objectId);
    if (!newElement) throw new Error('New table not found');

    const newTable = newElement.asTable();

    // If copying, we should probably copy cell contents too.
    if (typeof rowsOrTable !== 'number') {
      const sourceTable = rowsOrTable;
      const targetTable = newTable;
      const rows = sourceTable.getRows();
      const targetRows = targetTable.getRows();

      for (let r = 0; r < rows.length; r++) {
        const cells = rows[r].getCells();
        const targetCells = targetRows[r].getCells();
        for (let c = 0; c < cells.length; c++) {
          const text = cells[c].getText().asString();
          if (text) {
            targetCells[c].getText().setText(text);
          }
        }
      }
    }

    return newTable;
  }

  duplicate() {
    const presentationId = this.__presentation.getId();
    const objectId = `slide_${Math.random().toString(36).substring(2, 11)}`;
    const requests = [{
      duplicateObject: {
        objectId: this.getObjectId(),
        objectIds: {
          [this.getObjectId()]: objectId
        }
      }
    }];

    try {
      Slides.Presentations.batchUpdate(requests, presentationId);
    } catch (err) {
      if (!err?.message?.includes('already exists')) throw err;
    }

    // We need to get the updated presentation to find the new slide resource
    const updatedPresentation = Slides.Presentations.get(presentationId);
    const newSlideResource = updatedPresentation.slides.find(s => s.objectId === objectId);
    return newFakeSlide(newSlideResource, this.__presentation);
  }

  /**
   * Moves the slide to a new position.
   * @param {number} index The new index.
   */
  move(index) {
    const presentationId = this.__presentation.getId();

    Slides.Presentations.batchUpdate([{
      updateSlidesPosition: {
        slideObjectIds: [this.getObjectId()],
        insertionIndex: index
      }
    }], presentationId);
  }

  /**
   * Replaces all instances of text matching a find string with a replace string.
   * @param {string} findText The text to find.
   * @param {string} replaceText The text to replace with.
   * @param {boolean} matchCase Whether to match case.
   * @returns {number} The number of occurrences replaced.
   */
  replaceAllText(findText, replaceText, matchCase) {
    const presentationId = this.__presentation.getId();
    const requests = [{
      replaceAllText: {
        replaceText: replaceText,
        containsText: {
          text: findText,
          matchCase: matchCase
        },
        pageObjectIds: [this.getObjectId()]
      }
    }];

    const response = Slides.Presentations.batchUpdate(requests, presentationId);
    return response.replies[0].replaceAllText.occurrencesChanged || 0;
  }

  toString() {
    return 'Slide';
  }
}
