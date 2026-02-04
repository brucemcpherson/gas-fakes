import { Proxies } from '../../support/proxies.js';
import { newFakeSlide } from './fakeslide.js';

export const newFakePresentation = (...args) => {
  return Proxies.guard(new FakePresentation(...args));
};

/**
 * @class FakePresentation
 * A fake for the Presentation class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/slides/presentation
 */
export class FakePresentation {
  /**
   * @param {object} resource the presentation resurce from Slides API
   */
  constructor(resource) {
    this.__id = resource.presentationId;
  }
  get __file() {
    return DriveApp.getFileById(this.__id);
  }
  get __resource() {
    return Slides.Presentations.get(this.__id);
  }
  saveAndClose() {
    // this is a no-op in fake environment since it is stateless
  }
  /**
   * Gets the ID of the presentation.
   * @returns {string} The presentation ID.
   */
  getId() {
    return this.__id;
  }

  /**
   * Gets the name of the presentation.
   * @returns {string} The presentation name.
   */
  getName() {
    return this.__resource.title;
  }

  /**
   * Gets the URL of the presentation.
   * @returns {string} The presentation URL.
   */
  getUrl() {
    return `https://docs.google.com/presentation/d/${this.getId()}/edit`;
  }

  /**
   * Gets the slides in the presentation.
   * @returns {FakeSlide[]} The slides.
   */
  getSlides() {
    return (this.__resource.slides || []).map(s => newFakeSlide(s, this));
  }

  /**
   * Gets a slide by its ID.
   * @param {string} id The slide ID.
   * @returns {FakeSlide | null} The slide, or null if not found.
   */
  getSlideById(id) {
    return this.getSlides().find(s => s.getObjectId() === id) || null;
  }

  /**
   * Appends a new slide to the presentation.
   * @param {string} [layout] The layout to use (optional).
   * @returns {FakeSlide} The new slide.
   */
  appendSlide(layout) {
    const objectId = `slide_${Math.random().toString(36).substring(2, 11)}`;
    const requests = [{
      createSlide: {
        objectId,
        slideLayoutReference: layout ? { predefinedLayout: layout } : { predefinedLayout: 'BLANK' }
      }
    }];
    try {
      Slides.Presentations.batchUpdate(requests, this.getId());
    } catch (err) {
      // If it already exists, it means a previous attempt succeeded but timed out
      if (!err?.message?.includes('already exists')) throw err;
    }
    return this.getSlideById(objectId);
  }

  /**
   * Inserts a new slide at the specified index.
   * @param {number} index The index to insert at.
   * @param {string} [layout] The layout to use (optional).
   * @returns {FakeSlide} The new slide.
   */
  insertSlide(index, layout) {
    const objectId = `slide_${Math.random().toString(36).substring(2, 11)}`;
    const requests = [{
      createSlide: {
        objectId,
        insertionIndex: index,
        slideLayoutReference: layout ? { predefinedLayout: layout } : { predefinedLayout: 'BLANK' }
      }
    }];
    try {
      Slides.Presentations.batchUpdate(requests, this.getId());
    } catch (err) {
      if (!err?.message?.includes('already exists')) throw err;
    }
    return this.getSlideById(objectId);
  }

  toString() {
    return 'Presentation';
  }
}