import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { getFormItemFactory } from './formitemregistry.js';
import { ItemType } from '../enums/formsenums.js';

export const newFakeFormItem = (...args) => {
  const item = new FakeFormItem(...args);
  // try to cast to a more specific type
  try {
    const specificItem = item.__cast();
    return Proxies.guard(specificItem);
  } catch (e) {
    // if it fails (e.g., type not implemented), just return the base item
    return Proxies.guard(item);
  }
};

/**
 * @class FakeFormItem
 * A fake for the Item class in Apps Script. This is a base class.
 * @see https://developers.google.com/apps-script/reference/forms/item
 */
export class FakeFormItem {
  /**
   * @param {import('./fakeform.js').FakeForm} form The parent form.
   * @param {string} itemId The ID of the item.
   */
  constructor(form, itemId) {
    this.__form = form;
    this.__itemId = itemId;
  }

  __cast(asType = null) {
    const type = this.getType();
    asType = asType || type;

    if (type !== asType) {
      throw new Error(`${type} can't be cast as ${asType}`);
    }

    try {
      const factory = getFormItemFactory(asType);
      return factory(this.__form, this.__itemId);
    } catch (e) {
      // This allows for unimplemented types to not crash the whole thing
      if (asType !== type) { // only throw if it was an explicit as...() call
        throw new Error(`${asType} is not yet implemented.`);
      }
      // if it was a generic cast from newFakeFormItem, just return the base item
      return this;
    }
  }

  asCheckboxGridItem() { return this.__cast(ItemType.CHECKBOX_GRID); }
  asCheckboxItem() { return this.__cast(ItemType.CHECKBOX); }
  asDateItem() { return this.__cast(ItemType.DATE); }
  asDateTimeItem() { return this.__cast(ItemType.DATETIME); }
  asDurationItem() { return this.__cast(ItemType.DURATION); }
  asGridItem() { return this.__cast(ItemType.GRID); }
  asImageItem() { return this.__cast(ItemType.IMAGE); }
  asListItem() { return this.__cast(ItemType.LIST); }
  asMultipleChoiceItem() { return this.__cast(ItemType.MULTIPLE_CHOICE, true); }
  asPageBreakItem() { return this.__cast(ItemType.PAGE_BREAK); }
  asParagraphTextItem() { return this.__cast(ItemType.PARAGRAPH_TEXT); }
  asScaleItem() { return this.__cast(ItemType.SCALE); }
  asSectionHeaderItem() { return this.__cast(ItemType.SECTION_HEADER); }
  asTextItem() { return this.__cast(ItemType.TEXT); }
  asTimeItem() { return this.__cast(ItemType.TIME); }
  asVideoItem() { return this.__cast(ItemType.VIDEO); }

  duplicate() {
    const newResource = JSON.parse(JSON.stringify(this.__resource));
    delete newResource.itemId;

    const createRequest = Forms.newRequest().setCreateItem({
      item: newResource, // This resource is a copy for a new item.
      location: {
        index: this._getCurrentIndex() + 1, // insert after current item
      },
    });

    const batchRequest = Forms.newBatchUpdateFormRequest()
      .setIncludeFormInResponse(true)
      .setRequests([createRequest]);

    const response = Forms.Form.batchUpdate(batchRequest, this.__form.getId());

    const createdItemReply = response.replies.find(r => r.createItem);
    if (createdItemReply && createdItemReply.createItem.itemId) {
      const newItemId = createdItemReply.createItem.itemId;
      // Return a new FakeFormItem instance for the duplicated item
      return newFakeFormItem(this.__form, newItemId);
    }

    throw new Error('Could not find duplicated item in batchUpdate response.');
  }

  get __resource() {
    // Fetch the latest form resource from the parent form
    const formResource = this.__form.__resource;
    // Find this specific item within the latest form resource
    const item = formResource.items.find(it => it.itemId === this.__itemId);
    if (!item) {
      // This could happen if the item was deleted
      throw new Error(`Item with ID ${this.__itemId} not found in form (might have been deleted).`);
    }
    return item;
  }

  getHelpText() {
    return this.__resource.description || ''; // Access via dynamic __resource
  }

  getId() {
    const resource = this.__resource;
    const hexId = resource.questionItem?.question?.questionId || this.__itemId;
    return Utils.fromHex(hexId);
  }

  getIndex() {
    // Dynamically calculate the index to ensure it's always current
    return this._getCurrentIndex();
  }

  getTitle() {
    return this.__resource.title || ''; // Access via dynamic __resource
  }

  // Dynamically get the current index for API calls
  _getCurrentIndex() {
    return this.__form.__resource.items.findIndex(item => item.itemId === this.__itemId);
  }

  getType() {
    const item = this.__resource;
    if (item.questionItem) {
      const question = item.questionItem.question;
      if (question.choiceQuestion) {
        switch (question.choiceQuestion.type) {
          case 'RADIO': return ItemType.MULTIPLE_CHOICE;
          case 'CHECKBOX': return ItemType.CHECKBOX;
          case 'DROP_DOWN': return ItemType.LIST;
        }
      }
      if (question.dateQuestion) return question.dateQuestion.includeTime ? ItemType.DATETIME : ItemType.DATE;
      if (question.timeQuestion) return question.timeQuestion.duration ? ItemType.DURATION : ItemType.TIME;
      if (question.textQuestion) return question.textQuestion.paragraph ? ItemType.PARAGRAPH_TEXT : ItemType.TEXT;
      if (question.scaleQuestion) return ItemType.SCALE;
      if (question.rowQuestion) return ItemType.GRID;
    } else if (item.questionGroupItem) {
      // For GRID and CHECKBOX_GRID, columns is an object, not an array.
      const gridType = item.questionGroupItem.grid.columns.type;
      return gridType === 'RADIO' ? ItemType.GRID : ItemType.CHECKBOX_GRID;
    } else if (item.pageBreakItem) {
      return ItemType.PAGE_BREAK;
    } else if (item.textItem) {
      return ItemType.SECTION_HEADER;
    } else if (item.imageItem) {
      return ItemType.IMAGE;
    } else if (item.videoItem) {
      return ItemType.VIDEO;
    }
    throw new Error(`Unknown item type for resource: ${JSON.stringify(item)}`);
  }
  __update(updateRequest) {
    const response = this.__form.__update(updateRequest);
    // The local resource is now stale, so we need to update it.
    // The response from batchUpdate contains the updated form resource.
    return this;
  }

  setHelpText(text) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Item.setHelpText');
    if (nargs !== 1 || !is.string(text)) matchThrow('Invalid arguments');

    // The Forms API requires the full item resource in an update request to
    // avoid ambiguity about item type changes. We fetch the current resource,
    // update its description, and send the whole object back with an updateMask.
    const updatedResource = JSON.parse(JSON.stringify(this.__resource));
    updatedResource.description = text;

    const updateRequest = Forms.newRequest().setUpdateItem({
      // Use the full, updated resource object.
      item: updatedResource,
      location: {
        index: this.getIndex(),
      },
      // Crucially, only ask the API to update the description field.
      updateMask: 'description',
    });
    return this.__update (updateRequest)
  }

  setTitle(title) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Item.setTitle');
    if (nargs !== 1 || !is.string(title)) matchThrow('Invalid arguments');

    // The Forms API requires the full item resource in an update request to
    // avoid ambiguity about item type changes. We fetch the current resource,
    // update its title, and send the whole object back with an updateMask.
    const updatedResource = JSON.parse(JSON.stringify(this.__resource));
    updatedResource.title = title;

    const updateRequest = Forms.newRequest().setUpdateItem({
      // Use the full, updated resource object.
      item: updatedResource,
      location: {
        index: this.getIndex(),
      },
      // Crucially, only ask the API to update the title field.
      updateMask: 'title',
    });

    return this.__update (updateRequest)

  }

  /**
   * Determines whether the respondent must answer the question.
   * @returns {boolean} whether the respondent must answer the question
   */
  isRequired() {
    if (this.__resource.questionItem) {
      return this.__resource.questionItem.question.required || false;
    } else if (this.__resource.questionGroupItem) {
      return this.__resource.questionGroupItem.questions?.some(q => q.required) || false;
    }
    return false;
  }

  /**
   * Sets whether the respondent must answer the question.
   * @param {boolean} enabled
   * @returns {FakeFormItem} the current item (for chaining)
   */
  setRequired(enabled) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Item.setRequired');
    if (nargs !== 1 || !is.boolean(enabled)) matchThrow('Invalid arguments');

    let updateMask;
    const updatedResource = JSON.parse(JSON.stringify(this.__resource));

    if (updatedResource.questionItem) {
      updatedResource.questionItem.question.required = enabled;
      updateMask = 'questionItem.question.required';
    } else if (updatedResource.questionGroupItem) {
      if (updatedResource.questionGroupItem.questions) {
        updatedResource.questionGroupItem.questions.forEach(q => {
          q.required = enabled;
        });
      }
      updateMask = 'questionGroupItem.questions';
    } else {
      throw new Error('This item type does not support setRequired.');
    }

    const updateRequest = Forms.newRequest().setUpdateItem({
      item: updatedResource,
      location: { index: this.getIndex() },
      updateMask: updateMask,
    });

    return this.__update (updateRequest)
  }

  toString() {
    return 'Item';
  }
}
