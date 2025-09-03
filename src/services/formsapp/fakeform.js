import { Proxies } from '../../support/proxies.js';

export const newFakeForm = (...args) => {
  return Proxies.guard(new FakeForm(...args));
};

/**
 * @class FakeForm
 * A fake for the Form class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/forms/form
 */
export class FakeForm {
  /**
   * @param {object} resource the form resource from Forms API
   */
  constructor(resource) {
    this.__resource = resource;
  }
  saveAndClose() {
    // this is a no-op in fake environment since it is stateless
  }
  /**
   * Gets the ID of the form.
   * @returns {string} The form ID.
   */
  getId() {
    return this.__resource.formId;
  }

  /**
   * Gets the name of the form.
   * @returns {string} The form name.
   */
  getName() {
    return this.__resource.info.title;
  }

  /**
   * Gets the URL of the form.
   * @returns {string} The form URL.
   */
  getUrl() {
    return `https://docs.google.com/forms/d/${this.getId()}/edit`;
  }

  toString() {
    return 'Form';
  }
}