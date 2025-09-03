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
   * Gets the title of the form.
   * @returns {string} The form title.
   */
  getTitle() {
    return this.__resource.info.title;
  }

  /**
   * Sets the title of the form.
   * @param {string} title The new title for the form.
   * @returns {FakeForm} The form, for chaining.
   */
  setTitle(title) {
    const updateInfo = Forms.newFormInfo().setTitle(title);
    const updateRequest = Forms.newRequest().setUpdateFormInfo(
      Forms.newUpdateFormInfoRequest()
        .setInfo(updateInfo)
        .setUpdateMask("title")
    );
    const batchRequest = Forms.newBatchUpdateFormRequest()
      .setRequests([updateRequest]);

    Forms.Form.batchUpdate(batchRequest, this.getId());

    // Update the local resource to reflect the change immediately
    this.__resource.info.title = title;

    return this;
  }

  /**
   * Gets the URL to edit the form.
   * @returns {string} The form URL.
   */
  getEditUrl() {
    return `https://docs.google.com/forms/d/${this.getId()}/edit`;
  }

  toString() {
    return 'Form';
  }
}