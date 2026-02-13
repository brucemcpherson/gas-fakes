import { Proxies } from '../../support/proxies.js';
import { newFakeFormItem } from './fakeformitem.js';
import { newFakeFormResponse } from './fakeformresponse.js';
import { newFakeGridItem } from './fakegriditem.js';
import { newFakeCheckboxGridItem } from './fakecheckboxgriditem.js';
import { DestinationType } from '../enums/formsenums.js';
import { newFakeSectionHeaderItem } from './fakesectionheaderitem.js';
import { newFakeScaleItem } from './fakescaleitem.js';
//import './formitems.js'; // Import for side effects (item class registration)
import { newFakeMultipleChoiceItem } from './fakemultiplechoiceitem.js';
import { newFakeCheckboxItem } from './fakecheckboxitem.js';
import { newFakeListItem } from './fakelistitem.js';
import { newFakePageBreakItem } from './fakepagebreakitem.js';
import { newFakeTextItem } from './faketextitem.js';
import { newFakeDateItem } from './fakedateitem.js';
import { newFakeTimeItem } from './faketimeitem.js';
import { newFakeDurationItem } from './fakedurationitem.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils
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
    // Store the resource provided at creation as the single source of truth for this instance.
    this.__id = resource.formId;
    this.__file = DriveApp.getFileById(this.__id);
    this.__destinationId = resource.linkedSheetId || null;
    this.__destinationType = this.__destinationId ? DestinationType.SPREADSHEET : null;
  }

  get __resource() {
    return Forms.Form.get(this.__id);
  }
  get __publishSettings() {
    return this.__resource.publishSettings;
  }
  isAcceptingResponses() {
    return this.__publishSettings.isAcceptingResponses;
  }
  isPublished() {
    return this.__publishSettings.isPublished;
  }
  setPublished(enabled) {
    throw new Error('setPublished is not yet implemented in the fake environment.');
    return this;
  }


  saveAndClose() {
    // this is a no-op in fake environment since it is stateless
  }

  __addItem(itemResource, itemFactory) {
    const createRequest = Forms.newRequest().setCreateItem({
      item: itemResource,
      location: {
        index: this.__resource.items?.length || 0,
      },
    });

    const batchRequest = Forms.newBatchUpdateFormRequest()
      .setIncludeFormInResponse(true)
      .setRequests([createRequest]);

    const response = Forms.Form.batchUpdate(batchRequest, this.getId());

    const createdItemReply = response.replies.find(r => r.createItem);
    if (createdItemReply && createdItemReply.createItem.itemId) {
      const newItemId = createdItemReply.createItem.itemId;
      return itemFactory(this, newItemId);
    }

    throw new Error(`Could not find created item in batchUpdate response.`);
  }

  /**
   * Adds a new checkbox item to the form.
   * @returns {import('./fakecheckboxitem.js').FakeCheckboxItem} The new checkbox item.
   */
  addCheckboxItem() {
    const itemResource = {
      questionItem: {
        question: {
          choiceQuestion: {
            type: 'CHECKBOX',
            // The API requires at least one option on creation.
            options: [{ value: 'Option 1' }],
          },
        },
      },
    };
    return this.__addItem(itemResource, newFakeCheckboxItem);
  }

  /**
   * Appends a new question item, presented as a grid of columns and rows, that allows the
   * respondent to select one choice per row from a sequence of radio buttons.
   * @returns {import('./fakegriditem.js').FakeGridItem} The new grid item.
   */
  addGridItem() {
    const itemResource = {
      questionGroupItem: {
        grid: {
          columns: {
            type: 'RADIO',
            // The API requires at least one column
            options: [{ value: 'Column 1' }],
          },
        },
        // and at least one row
        questions: [
          {
            rowQuestion: {
              title: 'Row 1',
            },
          },
        ],
      },
    };
    return this.__addItem(itemResource, newFakeGridItem);
  }

  /**
   * Appends a new question item, presented as a grid of columns and rows, that allows the
   * respondent to select multiple choices per row from a sequence of checkboxes.
   * @returns {import('./fakecheckboxgriditem.js').FakeCheckboxGridItem} The new checkbox grid item.
   */
  addCheckboxGridItem() {
    const itemResource = {
      questionGroupItem: {
        grid: {
          columns: {
            type: 'CHECKBOX',
            // The API requires at least one column
            options: [{ value: 'Column 1' }],
          },
        },
        // and at least one row
        questions: [
          {
            rowQuestion: {
              title: 'Row 1',
            },
          },
        ],
      },
    };
    // Note: This will require a newFakeCheckboxGridItem factory.
    return this.__addItem(itemResource, newFakeCheckboxGridItem);
  }

  /**
   * Appends a new layout item that marks the beginning of a new page in the form.
   * @returns {import('./fakepagebreakitem.js').FakePageBreakItem} The new page-break item.
   */
  addPageBreakItem() {
    const itemResource = {
      pageBreakItem: {},
    };
    return this.__addItem(itemResource, newFakePageBreakItem);
  }


  /**
   * Appends a new question item that allows the respondent to choose one option
   * from a drop-down list.
   * @returns {import('./fakelistitem.js').FakeListItem} The new list item.
   */
  addListItem() {
    const itemResource = {
      questionItem: {
        question: {
          choiceQuestion: {
            type: 'DROP_DOWN',
            // The API requires at least one option on creation.
            options: [{ value: 'Option 1' }],
          },
        },
      },
    };
    return this.__addItem(itemResource, newFakeListItem);
  }


  /**
   * Appends a new question item that allows the respondent to choose one option
   * from a list of choices.
   * @returns {import('./fakemultiplechoiceitem.js').FakeMultipleChoiceItem} The new multiple choice item.
   */
  addMultipleChoiceItem() {
    const itemResource = {
      questionItem: {
        question: {
          choiceQuestion: {
            type: 'RADIO',
            // The API requires at least one option on creation.
            options: [{ value: 'Option 1' }],
          },
        },
      },
    };
    return this.__addItem(itemResource, newFakeMultipleChoiceItem);
  }

  /**
   * Appends a new layout item that visually indicates the start of a section.
   * @returns {import('./fakesectionheaderitem.js').FakeSectionHeaderItem} The new section header item.
   */
  addSectionHeaderItem() {
    const itemResource = {
      // The API resource for a section header is an item with a title and description.
      // It is identified by the presence of the `textItem` property.
      title: '',
      textItem: {},
    };
    return this.__addItem(itemResource, newFakeSectionHeaderItem);
  }

  /**
   * Appends a new question item that allows the respondent to choose one option
   * from a numbered sequence of radio buttons.
   * @returns {import('./fakescaleitem.js').FakeScaleItem} The new scale item.
   */
  addScaleItem() {
    const itemResource = {
      questionItem: {
        question: {
          scaleQuestion: {
            low: 1,
            high: 5,
          },
        },
      },
    };
    return this.__addItem(itemResource, newFakeScaleItem);
  }

  /**
   * Appends a new question item that allows the respondent to enter a single
   * line of text.
   * @returns {import('./faketextitem.js').FakeTextItem} The new text item.
   */
  addTextItem() {
    const itemResource = {
      questionItem: {
        question: {
          textQuestion: {
            paragraph: false, // false for short-answer
          },
        },
      },
    };
    return this.__addItem(itemResource, newFakeTextItem);
  }

  /**
   * Appends a new question item that allows the respondent to enter a paragraph of text.
   * @returns {import('./faketextitem.js').FakeTextItem} The new paragraph text item.
   */
  addParagraphTextItem() {
    const itemResource = {
      questionItem: {
        question: {
          textQuestion: {
            paragraph: true,
          },
        },
      },
    };
    return this.__addItem(itemResource, newFakeTextItem);
  }

  /**
   * Appends a new question item that allows the respondent to choose a date.
   * @returns {import('./fakedateitem.js').FakeDateItem} The new date item.
   */
  addDateItem() {
    const itemResource = {
      questionItem: {
        question: {
          dateQuestion: {
            includeYear: true,
            includeTime: false,
          },
        },
      },
    };
    return this.__addItem(itemResource, newFakeDateItem);
  }

  /**
   * Appends a new question item that allows the respondent to choose a date and time.
   * @returns {import('./fakedateitem.js').FakeDateItem} The new date-time item.
   */
  addDateTimeItem() {
    const itemResource = {
      questionItem: {
        question: {
          dateQuestion: {
            includeYear: true,
            includeTime: true,
          },
        },
      },
    };
    return this.__addItem(itemResource, newFakeDateItem);
  }

  /**
   * Appends a new question item that allows the respondent to choose a time.
   * @returns {import('./faketimeitem.js').FakeTimeItem} The new time item.
   */
  addTimeItem() {
    const itemResource = {
      questionItem: {
        question: {
          timeQuestion: {
            duration: false,
          },
        },
      },
    };
    return this.__addItem(itemResource, newFakeTimeItem);
  }

  /**
   * Appends a new question item that allows the respondent to choose a duration.
   * @returns {import('./fakedurationitem.js').FakeDurationItem} The new duration item.
   */
  addDurationItem() {
    const itemResource = {
      questionItem: {
        question: {
          timeQuestion: {
            duration: true,
          },
        },
      },
    };
    return this.__addItem(itemResource, newFakeDurationItem);
  }

  /**
   * Gets the ID of the form's response destination.
   * @returns {string | null} The destination ID, or null if no destination is set.
   */
  getDestinationId() {
    return this.__resource.linkedSheetId || null;
  }

  /**
   * Gets the type of the form's response destination.
   * @returns {import('../enums/formsenums.js').DestinationType | null} The destination type, or null if no destination is set.
   */
  getDestinationType() {
    if (this.getDestinationId()) {
      return DestinationType.SPREADSHEET;
    }
    return null;
  }


  /**
   * Gets the ID of the form.
   * @returns {string} The form ID.
   */
  getId() {
    return this.__id;
  }

  /**
   * Gets the form item with the given ID.
   * @param {Integer} id The ID of the item to retrieve.
   * @returns {import('./fakeformitem.js').FakeFormItem | null} The form item, or null if the item does not exist.
   */
  getItemById(id) {
    if (!this.__resource.items) {
      return null;
    }
    const hexId = Utils.toHex(id);
    const isKnownItem = (id, item) => {
      if (item.itemId === id) return true;
      if (item.questionItem?.question?.questionId === id) return true;
      const qgroup = item.questionGroupItem?.questions
      if (!qgroup) return false
      const found = qgroup.some(q => q.questionId === id)
      return found
    }

    const itemResource = this.__resource.items.find((item) => isKnownItem(hexId, item));

    if (!itemResource) {
      return null;
    }
    return newFakeFormItem(this, itemResource.itemId);
  }

  /**
   * Gets all items in the form.
   * @param {import('../enums/formsenums.js').ItemType} [itemType] If provided, only items of this type are returned.
   * @returns {import('./fakeformitem.js').FakeFormItem[]} An array of all items in the form.
   */
  getItems(itemType) {
    const allItems = this.__resource.items?.map((item) => newFakeFormItem(this, item.itemId)) || [];

    if (itemType) {
      // The itemType from the enum will be an object, so we compare its string representation
      // against the string representation of the item's type.
      return allItems.filter(item => item.getType().toString() === itemType.toString());
    }

    return allItems;
  }

  /**
   * Gets the title of the form.
   * @returns {string} The form title.
   */
  getTitle() {
    return this.__resource.info.title;
  }
  /**
   * Gets the title of the form.
   * @returns {string} The form title.
   */
  getDescription() {
    return this.__resource.info.description;
  }
  /**
   * Gets the name of the form file in Google Drive.
   * @returns {string} The file name.
   */
  getName() {
    return this.__file.getName();
  }

  /**
   * Gets all of the form's responses.
   * @returns {import('./fakeformresponse.js').FakeFormResponse[]} An array of form responses.
   */
  getResponses() {
    // The advanced Forms service is needed here, but it's an implementation detail of the fake.
    if (!Forms.Form?.Responses) {
      throw new Error(
        'The faked Advanced Forms Service (Forms.Form.Responses) must be available to use getResponses().'
      );
    }
    const responseList = Forms.Form.Responses.list(this.getId());
    const responses = responseList.responses?.map((r) => newFakeFormResponse(this, r)) || [];

    // The live Apps Script getResponses() method returns responses in chronological order.
    // The API returns them in reverse chronological order, so we must sort them.
    return responses.sort((a, b) => a.getTimestamp() - b.getTimestamp());
  }


  /**
   * Sets the name of the form file in Google Drive.
   * @param {string} name The new file name.
   * @returns {FakeForm} The form, for chaining.
   */
  setName(name) {
    this.__file.setName(name);
    return this;
  }

  /**
   * Deletes the item at the given index.
   * @param {import('./fakeformitem.js').FakeFormItem | Integer} itemOrIndex The item to delete, or its 0-indexed position.
   * @returns {FakeForm} The form, for chaining.
   */
  deleteItem(itemOrIndex) {
    let indexToDelete
    if (typeof itemOrIndex === 'number') {
      indexToDelete = itemOrIndex
    } else if (typeof itemOrIndex === 'object' && typeof itemOrIndex.getIndex === 'function') {
      // It's an Item object, get its index.
      indexToDelete = itemOrIndex.getIndex()
    } else {
      // This handles the case where an invalid object is passed, which can happen during development.
      // The error from the API ("Starting an object on a scalar field") is because the fake was
      // passing the whole object into the batchUpdate request instead of an index.
      // By handling the object case properly, we now get the correct behavior.
      throw new Error(
        `The parameters (${typeof itemOrIndex}) don't match the method signature for FormApp.Form.deleteItem.`
      )
    }
    const deleteRequest = Forms.newRequest().setDeleteItem({
      location: { index: indexToDelete },
    });
    return this.__update(deleteRequest);
  }

  /**
   * Moves the given form item to the specified index.
   * @param {import('./fakeformitem.js').FakeFormItem | Integer} itemOrFrom The item to move, or its 0-indexed position.
   * @param {Integer} toIndex The 0-indexed position to move the item to.
   * @returns {import('./fakeformitem.js').FakeFormItem} The moved item.
   */
  moveItem(itemOrFrom, toIndex) {
    let fromIndex;
    if (typeof itemOrFrom === 'number') {
      fromIndex = itemOrFrom;
    } else if (typeof itemOrFrom === 'object' && typeof itemOrFrom.getIndex === 'function') {
      fromIndex = itemOrFrom.getIndex();
    } else {
      throw new Error(`The parameters (${typeof itemOrFrom},number) don't match the method signature for FormApp.Form.moveItem.`);
    }

    const items = this.getItems();
    if (fromIndex < 0 || fromIndex >= items.length) {
      throw new Error(`The starting position ${fromIndex} is out of bounds.`);
    }

    // The item to return is the one at the original 'from' index.
    const itemToMove = items[fromIndex];
    const moveRequest = Forms.newRequest().setMoveItem({
      originalLocation: { index: fromIndex },
      newLocation: { index: toIndex },
    });
    this.__update(moveRequest);
    return itemToMove;
  }
  /**
   * Unlinks the form from its response destination.
   * @returns {FakeForm} The form, for chaining.
   */
  removeDestination() {
    // This is not supported by the REST API, so we manage it internally for the fake.
    this.__destinationId = null;
    this.__destinationType = null;
    return this;
  }
  /**
   * Sets the destination for form responses.
   * @param {import('../enums/formsenums.js').DestinationType} type The type of destination.
   * @param {string} id The ID of the destination (spreadsheet ID).
   * @returns {FakeForm} The form, for chaining.
   */
  setDestination(type, id) {
    if (type !== DestinationType.SPREADSHEET) {
      throw new Error('Only SPREADSHEET destination type is supported.');
    }
    // This is not supported by the REST API, so we manage it internally for the fake.
    this.__destinationId = id;
    this.__destinationType = DestinationType.SPREADSHEET;
    return this;
  }
  /**
   * Sets whether the form is published responses.
   * @param {boolean} enabled true if the form should accept responses; false otherwise.
   * @returns {FakeForm} The form, for chaining.
   */
  setPublished(enabled) {
    throw new Error('setPublished is not yet implemented in the fake environment.');
  }


  __update(updateRequest) {
    const batchRequest = Forms.newBatchUpdateFormRequest()
      .setRequests([updateRequest])
    Forms.Form.batchUpdate(batchRequest, this.getId());
    return this;
  }

  /**
   * Sets whether the form is accepting responses.
   * @param {boolean} enabled true if the form should accept responses; false otherwise.
   * @returns {FakeForm} The form, for chaining.
   */
  setAcceptingResponses(enabled) {
    // The REST API does not expose a way to set this. The fake will manage it internally.
    throw new Error('setAcceptingResponses is not yet implemented in the fake environment.');
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
    return this.__update(updateRequest)
  }

  /**
   * sets the description of the form.
   * @param {string} description The new title for the form.
   * @returns {FakeForm} The form, for chaining.
   */
  setDescription(description) {
    const updateInfo = Forms.newFormInfo().setDescription(description);
    const updateRequest = Forms.newRequest().setUpdateFormInfo(
      Forms.newUpdateFormInfoRequest()
        .setInfo(updateInfo)
        .setUpdateMask("description")
    );
    return this.__update(updateRequest)
  }

  /**
   * Gets the URL to edit the form.
   * @returns {string} The form URL.
   */
  getEditUrl() {
    return `https://docs.google.com/forms/d/${this.getId()}/edit`;
  }

  /**
   * Gets the URL to respond to the form.
   * @returns {string} The form URL.
   */
  getPublishedUrl() {
    return `https://docs.google.com/forms/d/e/${this.getId()}/viewform`;
  }

  /**
   * Internal method to get the correct responder URI from the API resource.
   * @returns {string} The responder URI.
   */
  __getResponderUri() {
    return this.__resource.responderUri;
  }

  /**
   * Gets the URL to respond to the form
   * https://github.com/brucemcpherson/gas-fakes/issues/111
   * shorten url no longer supported by google
   * @returns {string} The form URL.
   */
  shortenFormUrl(url) {
    // just validate the atgs would work on apps script
    const { nargs, matchThrow } = signatureArgs(arguments, 'shortenFormUrl');
    if (nargs !== 1 || !is.nonEmptyString(url)) {
      matchThrow();
    }
    // apps script expects a url, but we return the published url and just ignore the url anyway
    return this.getPublishedUrl()
  }

  /**
   * Creates a new response to the form.
   * @returns {import('./fakeformresponse.js').FakeFormResponse} The newly created form response.
   */
  createResponse() {
    return newFakeFormResponse(this, { answers: {} });
  }

  toString() {
    return 'Form';
  }
}
