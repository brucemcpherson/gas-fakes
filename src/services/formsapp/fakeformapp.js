import { Proxies } from '../../support/proxies.js';
import * as Enums from '../enums/formsenums.js';
import { newFakeForm } from './fakeform.js';
import { Auth } from '../../support/auth.js';
import { Url } from '../../support/url.js';

export const newFakeFormApp = (...args) => {
  return Proxies.guard(new FakeFormApp(...args));
};

class FakeFormApp {
  constructor() {
    const enumProps = [
      'Alignment',
      'DestinationType',
      'EmailCollectionType',
      'FeedbackType',
      'FileTypeCategory',
      'ItemType',
      'PageNavigationType',
      'RatingIconType',
    ];

    // import all known enums as props of formapp
    enumProps.forEach((f) => {
      if (Enums[f]) {
        this[f] = Enums[f];
      }
    });
  }

  /**
   * Creates a new form with the given name.
   * @param {string} title The title of the new form.
   * @returns {import('./fakeform.js').FakeForm} The new form.
   */
  create(title) {
    // use the advanced service which handles synchronization
    const form = Forms.Forms.create({
      info: {
        title: title,
      },
    });
    ScriptApp.__behavior.addFile(form.formId);
    return newFakeForm(form);
  }

  /**
   * Gets the currently active form.
   * @returns {import('./fakeform.js').FakeForm | null} The active form, or null if there is none.
   */
  getActiveForm() {
    const id = Auth.getDocumentId();
    if (!id) {
      // This is what Apps Script does
      return null;
    }
    return this.openById(id);
  }

  /**
   * Opens the form with the specified ID.
   * @param {string} id The ID of the form to open.
   * @returns {import('./fakeform.js').FakeForm} The form.
   */
  openById(id) {
    if (!ScriptApp.__behavior.isAccessible(id, 'FormApp')) {
      throw new Error(`Access to form "${id}" is denied by sandbox rules.`);
    }
    // use the advanced service which handles synchronization
    const form = Forms.Forms.get(id);
    return newFakeForm(form);
  }

  /**
   * Opens the form with the specified URL.
   * @param {string} url The URL of the form to open.
   * @returns {import('./fakeform.js').FakeForm} The form.
   */
  openByUrl(url) {
    const id = Url.getIdFromUrl(url);
    if (!id) {
      throw new Error(`Invalid form URL: ${url}`);
    }
    return this.openById(id);
  }

  toString() {
    return 'FormApp';
  }
}
