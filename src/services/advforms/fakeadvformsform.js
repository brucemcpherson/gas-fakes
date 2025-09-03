import { FakeAdvResource } from '../common/fakeadvresource.js';
import { Syncit } from '../../support/syncit.js';
import { signatureArgs, ssError, gError } from '../../support/helpers.js';

import { Proxies } from '../../support/proxies.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils

export const newFakeAdvFormsForm = (...args) => Proxies.guard(new FakeAdvFormsForm(...args))

class FakeAdvFormsForm extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, 'forms', Syncit.fxForms);
    this.forms = mainService;
    this.__fakeObjectType = 'Forms.Forms';
  }

  /**
   * Creates a new form.
   * @param {object} resource The form resource.
   * @returns {object} The created form resource.
   */
  create(resource) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Forms.Forms.create');
    if (nargs !== 1) matchThrow('Invalid number of arguments provided. Expected 1 only');
    if (!is.object(resource)) {
      matchThrow('API call to forms.create failed with error: Invalid JSON payload received.');
    }
    const { response, data } = this._call('create', {
      requestBody: resource,
    });

    gError(response, 'forms.forms', 'create');
    if (data) {
      this.forms.__addAllowed(data.formId);
    }
    return data;
  }

  /**
   * Gets a form by ID.
   * @param {string} formId The ID of the form.
   * @returns {object} The form resource.
   */
  get(formId) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Forms.Forms.get');
    if (nargs !== 1) matchThrow('Invalid number of arguments provided. Expected 1 only');
    if (!is.string(formId)) {
      matchThrow('API call to forms.forms.get failed with error: Invalid formId provided.');
    }
    ScriptApp.__behavior.isAccessible(formId, 'Forms', 'read');
    const { response, data } = this._call('get', { formId });
    gError(response, 'forms.forms', 'get');
    return data;
  }

  /**
   * Applies one or more updates to the form.
   * @param {object} resource The batch update request.
   * @param {string} formId The ID of the form.
   * @returns {object} The batch update response.
   */
  batchUpdate(resource, formId) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Forms.Forms.batchUpdate');
    if (nargs !== 2) matchThrow('Invalid number of arguments provided. Expected 2');
    if (!is.object(resource)) {
      matchThrow('API call to forms.forms.batchUpdate failed with error: Invalid JSON payload received.');
    }
    if (!is.string(formId)) {
      matchThrow('API call to forms.forms.batchUpdate failed with error: Invalid formId provided.');
    }
    ScriptApp.__behavior.isAccessible(formId, 'Forms', 'write');
    const { response, data } = this._call('batchUpdate', {
      formId,
      requestBody: resource,
    });
    gError(response, 'forms.forms', 'batchUpdate');
    return data;
  }
}