/**
 * Advanced Forms service
 */
import { Proxies } from '../../support/proxies.js';
import { advClassMaker } from '../../support/helpers.js';
import { formsCacher } from '../../support/formscacher.js';
import { newFakeAdvFormsForm } from './fakeadvformsform.js';

class FakeAdvForms {
  constructor() {
    this.__fakeObjectType = "Forms"


    const propLists = {
      // Top-level batch update request
      "newBatchUpdateFormRequest": [
        "includeFormInResponse",
        "requests",
        "writeControl"
      ],
      // Individual request types that can be part of a batch update
      "newCreateItemRequest": [
        "item",
        "location"
      ],
      "newDeleteItemRequest": [
        "location"
      ],
      "newMoveItemRequest": [
        "newLocation",
        "originalLocation"
      ],
      "newUpdateFormInfoRequest": [
        "info",
        "updateMask"
      ],
      "newUpdateItemRequest": [
        "item",
        "location",
        "updateMask"
      ],
      "newFormInfo": [
        "title",
        "documentTitle",
        "description"
      ],
      "newUpdateSettingsRequest": [
        "settings",
        "updateMask"
      ],
      "newFormSettings": [
        "emailCollectionType",
        "quizSettings"
      ],
      "newQuizSettings" : [
        "isQuiz"
      ],
      "newItem": [
        "description",
        "imageItem",
        "item",
        "itemId",
        "pageBreakItem",
        "questionGroupItem",
        "questionItem",
        "textItem",
        "title",
        "videoItem"
      ],
      "newQuestionItem": [
        "question",
        "image"
      ],
      "newQuestion": [
        "choiceQuestion",
        "dateQuestion",
        "fileUploadQuestion",
        "grading",
        "questionId",
        "ratingQuestion",
        "required",
        "rowQuestion",
        "scaleQuestion",
        "textQuestion",
        "timeQuestion"
      ],
      "newLocation": [
        "index"
      ],
      "newWriteControl": [
        "requiredRevisionId",
        "targetRevisionId"
      ],
      // The 'Request' schema itself, which is a oneOf type for batch updates
      "newRequest": [
        "createItem",
        "deleteItem",
        "moveItem",
        "updateFormInfo",
        "updateItem",
        "updateSettings"
      ],
      // Further nested items that are builders
      "newImageItem": [
        "image"
      ],
      "newPageBreakItem": [], // No direct properties to set
      "newQuestionGroupItem": [
        "grid",
        "image",
        "questions"
      ],
      "newTextItem": [], // No direct properties to set
      "newVideoItem": [
        "caption",
        "video"
      ],
      "newImage": [
        "altText",
        "contentUri",
        "properties",
        "sourceUri"
      ],
      "newMediaProperties": [
        "alignment",
        "width"
      ],
      "newGrid": [
        "columns",
        "shuffleQuestions"
      ],
      "newChoiceQuestion": [
        "options",
        "shuffle",
        "type"
      ],
      "newDateQuestion": [
        "includeTime",
        "includeYear"
      ],
      "newFileUploadQuestion": [
        "folderId",
        "maxFiles",
        "maxFileSize",
        "types"
      ],
      "newGrading": [
        "correctAnswers",
        "generalFeedback",
        "pointValue",
        "whenRight",
        "whenWrong"
      ],
      "newRatingQuestion": [
        "iconType",
        "ratingScaleLevel"
      ],
      "newRowQuestion": [
        "title"
      ],
      "newScaleQuestion": [
        "high",
        "highLabel",
        "low",
        "lowLabel"
      ],
      "newTextQuestion": [
        "paragraph"
      ],
      "newTimeQuestion": [
        "duration"
      ],
      "newCorrectAnswers": [
        "answers"
      ],
      "newCorrectAnswer": [
        "value"
      ],
      "newOption": [
        "goToAction",
        "goToSectionId",
        "image",
        "isOther",
        "value"
      ],
      "newVideo": [
        "properties",
        "youtubeUri"
      ],
        
    }

    Reflect.ownKeys(propLists).forEach(p => {
      this[p] = () => advClassMaker(propLists[p])
    })

  }
  toString() {
    return 'AdvancedServiceIdentifier{name=forms, version=v1}'
  }

  getVersion() {
    return 'v1'
  }

  get Form() {
    return newFakeAdvFormsForm(this)
  }
  __addAllowed(id) {
    if (ScriptApp.__behavior.sandBoxMode) {
      ScriptApp.__behavior.addFile(id);
    }
    return id
  }

  __getFormsPerformance() {
    return formsCacher.getPerformance()
  }
}

export const newFakeAdvForms = (...args) => Proxies.guard(new FakeAdvForms(...args))
