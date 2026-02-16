import { Proxies } from '../../support/proxies.js';
import { newFakeItemResponse } from './fakeitemresponse.js';
import { Utils } from '../../support/utils.js';
import { formsCacher } from '../../support/formscacher.js';

export const newFakeFormResponse = (...args) => {
  return Proxies.guard(new FakeFormResponse(...args));
};

/**
 * @class FakeFormResponse
 * @see https://developers.google.com/apps-script/reference/forms/form-response
 */
export class FakeFormResponse {
  /**
   *
   * @param {import('./fakeform.js').FakeForm} form the parent form
   * @param {object} resource the response resource from the Forms API
   */
  constructor(form, resource) {
    this.__form = form;
    this.__resource = resource;
  }
  toString() {
    return 'FormResponse';
  }
  /**
   * Gets the email address of the respondent.
   * @returns {string} the respondent's email
   */
  getRespondentEmail() {
    return this.__resource.respondentEmail || '';
  }

  /**
   * Gets the unique ID for this form response.
   * @returns {number} the unique hex ID converted to a decimal number
   */
  getId() {
    return Utils.fromHex(this.__resource.responseId);
  }

  /**
   * Gets the date and time the response was submitted.
   * @returns {Date} the submission timestamp
   */
  getTimestamp() {
    return new Date(this.__resource.lastSubmittedTime);
  }

  /**
   * Gets all item responses contained in the form response.
   * @returns {import('./fakeitemresponse.js').FakeItemResponse[]} an array of item responses
   */
  getItemResponses() {
    if (!this.__resource.answers) {
      return [];
    }

    // Create a map to group answers by their parent form item. This is crucial for grid items,
    // where each row is a separate answer in the API response but should be consolidated
    // into a single ItemResponse in Apps Script.
    const groupedAnswers = new Map();

    for (const [questionId, answer] of Object.entries(this.__resource.answers)) {
      const item = this.__form.getItemById(Utils.fromHex(questionId));

      if (item) {
        const itemId = item.getId(); // Use the unique item ID as the key.
        if (!groupedAnswers.has(itemId)) {
          // Store the item itself along with an array for its answers.
          groupedAnswers.set(itemId, { item, answers: [] });
        }
        // Add the raw answer object from the API response to the item's answer list.
        // This correctly groups all row answers for a grid under the same parent item.
        // We also attach the questionId to the answer object so we can identify the row later.
        groupedAnswers.get(itemId).answers.push({ ...answer, questionId });
      }
    }

    // Now, create one FakeItemResponse for each grouped item.
    const itemResponses = Array.from(groupedAnswers.values()).map(({ item, answers }) => {
      return newFakeItemResponse(item, answers);
    });

    // Finally, sort the responses based on the item's index in the form.
    return itemResponses.sort((a, b) => a.getItem().getIndex() - b.getItem().getIndex());
  }

  /**
   * Adds an item response to this form response.
   * @param {import('./fakeitemresponse.js').FakeItemResponse} itemResponse The item response to add.
   * @returns {FakeFormResponse} This form response, for chaining.
   */
  withItemResponse(itemResponse) {
    if (!this.__resource.answers) {
      this.__resource.answers = {};
    }

    // itemResponse.__answers is the internal array of answers.
    // In the resource, answers are keyed by questionId.
    itemResponse.__answers.forEach(answer => {
      this.__resource.answers[answer.questionId] = answer;
    });

    return this;
  }

  /**
   * Submits the response.
   * @returns {FakeFormResponse} This form response, for chaining.
   */
  submit() {
    const formId = this.__form.getId();
    const responderUri = this.__form.__getResponderUri();
    const url = responderUri.replace('/viewform', '/formResponse');
    const payload = {};

    this.getItemResponses().forEach(itemResponse => {
      const item = itemResponse.getItem();
      const response = itemResponse.getResponse();
      const itemType = item.getType().toString();

      if ((itemType === 'CHECKBOX_GRID' || itemType === 'GRID') && Array.isArray(response)) {
        const gridRows = item.__resource.questionGroupItem?.questions || [];
        
        response.forEach((rowResponse, rowIndex) => {
          if (rowResponse && (Array.isArray(rowResponse) ? rowResponse.length > 0 : true)) {
            const rowQuestionIdHex = gridRows[rowIndex]?.questionId;
            if (rowQuestionIdHex) {
              const rowQuestionIdDecimal = Utils.fromHex(rowQuestionIdHex);
              payload[`entry.${rowQuestionIdDecimal}`] = rowResponse;
            }
          }
        });
      } else {
        const questionIdHex = item.__resource.questionItem?.question?.questionId;
        if (questionIdHex) {
           const questionIdDecimal = Utils.fromHex(questionIdHex);
           payload[`entry.${questionIdDecimal}`] = response;
        }
      }
    });

    if (Object.keys(payload).length > 0) {
      // Dynamic page history based on actual form structure
      const pageCount = this.__form.getItems(FormApp.ItemType.PAGE_BREAK).length + 1;
      payload.pageHistory = Array.from({length: pageCount}, (_, i) => i).join(',');
      payload.fvv = '1';

      // Use cached metadata if available
      const metadata = this.__form.__getScrapedMetadata();
      if (metadata?.fbzx) payload.fbzx = metadata.fbzx;

      // Build the payload string manually to handle multiple values for the same key (checkboxes)
      const payloadParts = [];
      Object.keys(payload).forEach(key => {
        const value = payload[key];
        if (Array.isArray(value)) {
          value.forEach(v => payloadParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
        } else {
          payloadParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      });
      const payloadString = payloadParts.join('&');

      // we need to do many things here to allowe access to the form as there are no formapp methods to add reponses.
      // first save the current file permissions
      const formFile = this.__form.__file;

      // 1. Capture the original state
      const originalAccess = formFile.getSharingAccess();
      const originalPermission = formFile.getSharingPermission();
      // temporarily make the form public so we can submit a response
      // 2. Open access: Anyone with the link can view (needed for submission)
      formFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      try {

        // --- SUBMISSION LOGIC ---
        const response = UrlFetchApp.fetch(url, {
          method: 'post',
          payload: payloadString,
          contentType: 'application/x-www-form-urlencoded',
          muteHttpExceptions: true
        });

        if (response?.getResponseCode() !== 200) {
          throw new Error(`Failed to submit form response: ${response.getResponseCode()}`);
        }

        // Successful submission, clear the scraped metadata cache to get a fresh fbzx next time
        this.__form.__clearScrapedMetadata();

      } finally {
        // 3. Reset to exactly how it was before
        formFile.setSharing(originalAccess, originalPermission);
      }
    }

    // Invalidate the form cache because a new response has been submitted
    formsCacher.clear(formId);


    return this;
  }
}
