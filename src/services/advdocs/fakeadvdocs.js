/**
 * Advanced sheets service
 */
import { Proxies } from '../../support/proxies.js'
import { advClassMaker, notYetImplemented } from '../../support/helpers.js'
import { getAuthedClient } from './docapis.js'
import { newFakeAdvDocuments } from './fakeadvdocuments.js'
import { docsCacher } from '../../support/docscacher.js';

class FakeAdvDocs {
  constructor() {
    this.client = Proxies.guard(getAuthedClient())
    this.__fakeObjectType = "Docs"

    const propLists = {
      "newNamedStyles": [
        "styles"
      ],
      "newHorizontalRule": [
        "suggestedDeletionIds",
        "suggestedInsertionIds",
        "suggestedTextStyleChanges",
        "textStyle"
      ],
      "newUpdateTextStyleRequest": [
        "fields",
        "range",
        "textStyle"
      ],
      "newCreateHeaderRequest": [
        "sectionBreakLocation",
        "type"
      ],
      "newDeleteHeaderRequest": [
        "headerId",
        "tabId"
      ],
      "newSectionColumnProperties": [
        "paddingEnd",
        "width"
      ],
      "newTableCell": [
        "content",
        "endIndex",
        "startIndex",
        "suggestedDeletionIds",
        "suggestedInsertionIds",
        "suggestedTableCellStyleChanges",
        "tableCellStyle"
      ],
      "newBatchUpdateDocumentRequest": [
        "requests",
        "writeControl"
      ],
      "newReplaceAllTextRequest": [
        "containsText",
        "replaceText",
        "tabsCriteria"
      ],
      "newDeleteContentRangeRequest": [
        "range"
      ],
      "newTabsCriteria": [
        "tabIds"
      ],
      "newUpdateTableColumnPropertiesRequest": [
        "columnIndices",
        "fields",
        "tableColumnProperties",
        "tableStartLocation"
      ],
      "newRequest": [
        "createFooter",
        "createFootnote",
        "createHeader",
        "createNamedRange",
        "createParagraphBullets",
        "deleteContentRange",
        "deleteFooter",
        "deleteHeader",
        "deleteNamedRange",
        "deleteParagraphBullets",
        "deletePositionedObject",
        "deleteTableColumn",
        "deleteTableRow",
        "insertInlineImage",
        "insertPageBreak",
        "insertSectionBreak",
        "insertTable",
        "insertTableColumn",
        "insertTableRow",
        "insertText",
        "mergeTableCells",
        "pinTableHeaderRows",
        "replaceAllText",
        "replaceImage",
        "replaceNamedRangeContent",
        "unmergeTableCells",
        "updateDocumentStyle",
        "updateParagraphStyle",
        "updateSectionStyle",
        "updateTableCellStyle",
        "updateTableColumnProperties",
        "updateTableRowStyle",
        "updateTextStyle"
      ],
      "newUpdateDocumentStyleRequest": [
        "documentStyle",
        "fields",
        "tabId"
      ],
      "newCreateParagraphBulletsRequest": [
        "bulletPreset",
        "range"
      ],
      "newBody": [
        "content"
      ],
      "newParagraphBorder": [
        "color",
        "dashStyle",
        "padding",
        "width"
      ],
      "newDocumentTab": [
        "body",
        "documentStyle",
        "footers",
        "footnotes",
        "headers",
        "inlineObjects",
        "lists",
        "namedRanges",
        "namedStyles",
        "positionedObjects",
        "suggestedDocumentStyleChanges",
        "suggestedNamedStylesChanges"
      ],
      "newSectionStyle": [
        "columnProperties",
        "columnSeparatorStyle",
        "contentDirection",
        "defaultFooterId",
        "defaultHeaderId",
        "evenPageFooterId",
        "evenPageHeaderId",
        "firstPageFooterId",
        "firstPageHeaderId",
        "flipPageOrientation",
        "marginBottom",
        "marginFooter",
        "marginHeader",
        "marginLeft",
        "marginRight",
        "marginTop",
        "pageNumberStart",
        "sectionType",
        "useFirstPageHeaderFooter"
      ],
      "newUpdateParagraphStyleRequest": [
        "fields",
        "paragraphStyle",
        "range"
      ],
      "newAutoText": [
        "suggestedDeletionIds",
        "suggestedInsertionIds",
        "suggestedTextStyleChanges",
        "textStyle",
        "type"
      ],
      "newPerson": [
        "personId",
        "personProperties",
        "suggestedDeletionIds",
        "suggestedInsertionIds",
        "suggestedTextStyleChanges",
        "textStyle"
      ],
      "newNamedStyle": [
        "namedStyleType",
        "paragraphStyle",
        "textStyle"
      ],
      "newInsertInlineImageRequest": [
        "endOfSegmentLocation",
        "location",
        "objectSize",
        "uri"
      ],
      "newDocument": [
        "body",
        "documentId",
        "documentStyle",
        "footers",
        "footnotes",
        "headers",
        "inlineObjects",
        "lists",
        "namedRanges",
        "namedStyles",
        "positionedObjects",
        "revisionId",
        "suggestedDocumentStyleChanges",
        "suggestedNamedStylesChanges",
        "suggestionsViewMode",
        "tabs",
        "title"
      ],
      "newInsertTableRequest": [
        "columns",
        "endOfSegmentLocation",
        "location",
        "rows"
      ],
      "newEquation": [
        "suggestedDeletionIds",
        "suggestedInsertionIds"
      ],
      "newInsertSectionBreakRequest": [
        "endOfSegmentLocation",
        "location",
        "sectionType"
      ],
      "newStructuralElement": [
        "endIndex",
        "paragraph",
        "sectionBreak",
        "startIndex",
        "table",
        "tableOfContents"
      ],
      "newDeleteNamedRangeRequest": [
        "name",
        "namedRangeId",
        "tabsCriteria"
      ],
      "newInsertPageBreakRequest": [
        "endOfSegmentLocation",
        "location"
      ],
      "newRange": [
        "endIndex",
        "segmentId",
        "startIndex",
        "tabId"
      ],
      "newUpdateTableCellStyleRequest": [
        "fields",
        "tableCellStyle",
        "tableRange",
        "tableStartLocation"
      ],
      "newPinTableHeaderRowsRequest": [
        "pinnedHeaderRowsCount",
        "tableStartLocation"
      ],
      "newColor": [
        "rgbColor"
      ],
      "newInsertTextRequest": [
        "endOfSegmentLocation",
        "location",
        "text"
      ],
      "newColumnBreak": [
        "suggestedDeletionIds",
        "suggestedInsertionIds",
        "suggestedTextStyleChanges",
        "textStyle"
      ],
      "newFootnoteReference": [
        "footnoteId",
        "footnoteNumber",
        "suggestedDeletionIds",
        "suggestedInsertionIds",
        "suggestedTextStyleChanges",
        "textStyle"
      ],
      "newTableColumnProperties": [
        "width",
        "widthType"
      ],
      "newEndOfSegmentLocation": [
        "segmentId",
        "tabId"
      ],
      "newReplaceImageRequest": [
        "imageObjectId",
        "imageReplaceMethod",
        "tabId",
        "uri"
      ],
      "newInsertTableRowRequest": [
        "insertBelow",
        "tableCellLocation"
      ],
      "newUpdateSectionStyleRequest": [
        "fields",
        "range",
        "sectionStyle"
      ],
      "newTab": [
        "childTabs",
        "documentTab",
        "tabProperties"
      ],
      "newTextRun": [
        "content",
        "suggestedDeletionIds",
        "suggestedInsertionIds",
        "suggestedTextStyleChanges",
        "textStyle"
      ],
      "newInlineObjectElement": [
        "inlineObjectId",
        "suggestedDeletionIds",
        "suggestedInsertionIds",
        "suggestedTextStyleChanges",
        "textStyle"
      ],
      "newTabStop": [
        "alignment",
        "offset"
      ],
      "newParagraphStyle": [
        "alignment",
        "avoidWidowAndOrphan",
        "borderBetween",
        "borderBottom",
        "borderLeft",
        "borderRight",
        "borderTop",
        "direction",
        "headingId",
        "indentEnd",
        "indentFirstLine",
        "indentStart",
        "keepLinesTogether",
        "keepWithNext",
        "lineSpacing",
        "namedStyleType",
        "pageBreakBefore",
        "shading",
        "spaceAbove",
        "spaceBelow",
        "spacingMode",
        "tabStops"
      ],
      "newSubstringMatchCriteria": [
        "matchCase",
        "searchByRegex",
        "text"
      ],
      "newDeleteTableColumnRequest": [
        "tableCellLocation"
      ],
      "newShading": [
        "backgroundColor"
      ],
      "newTabProperties": [
        "index",
        "nestingLevel",
        "parentTabId",
        "tabId",
        "title"
      ],
      "newRgbColor": [
        "blue",
        "green",
        "red"
      ],
      "newSize": [
        "height",
        "width"
      ],
      "newOptionalColor": [
        "color"
      ],
      "newDeleteTableRowRequest": [
        "tableCellLocation"
      ],
      "newPersonProperties": [
        "email",
        "name"
      ],
      "newBullet": [
        "listId",
        "nestingLevel",
        "textStyle"
      ],
      "newDimension": [
        "magnitude",
        "unit"
      ],
      "newCreateFootnoteRequest": [
        "endOfSegmentLocation",
        "location"
      ],
      "newPageBreak": [
        "suggestedDeletionIds",
        "suggestedInsertionIds",
        "suggestedTextStyleChanges",
        "textStyle"
      ],
      "newCreateNamedRangeRequest": [
        "name",
        "range"
      ],
      "newLink": [
        "bookmark",
        "bookmarkId",
        "heading",
        "headingId",
        "tabId",
        "url"
      ],
      "newLocation": [
        "index",
        "segmentId",
        "tabId"
      ],
      "newUpdateTableRowStyleRequest": [
        "fields",
        "rowIndices",
        "tableRowStyle",
        "tableStartLocation"
      ],
      "newRichLinkProperties": [
        "mimeType",
        "title",
        "uri"
      ],
      "newDeleteParagraphBulletsRequest": [
        "range"
      ],
      "newBookmarkLink": [
        "id",
        "tabId"
      ],
      "newTableRange": [
        "columnSpan",
        "rowSpan",
        "tableCellLocation"
      ],
      "newDocumentStyle": [
        "background",
        "defaultFooterId",
        "defaultHeaderId",
        "evenPageFooterId",
        "evenPageHeaderId",
        "firstPageFooterId",
        "firstPageHeaderId",
        "flipPageOrientation",
        "marginBottom",
        "marginFooter",
        "marginHeader",
        "marginLeft",
        "marginRight",
        "marginTop",
        "pageNumberStart",
        "pageSize",
        "useCustomHeaderFooterMargins",
        "useEvenPageHeaderFooter",
        "useFirstPageHeaderFooter"
      ],
      "newRichLink": [
        "richLinkId",
        "richLinkProperties",
        "suggestedDeletionIds",
        "suggestedInsertionIds",
        "suggestedTextStyleChanges",
        "textStyle"
      ],
      "newTableRowStyle": [
        "minRowHeight",
        "preventOverflow",
        "tableHeader"
      ],
      "newDeleteFooterRequest": [
        "footerId",
        "tabId"
      ],
      "newTableCellStyle": [
        "backgroundColor",
        "borderBottom",
        "borderLeft",
        "borderRight",
        "borderTop",
        "columnSpan",
        "contentAlignment",
        "paddingBottom",
        "paddingLeft",
        "paddingRight",
        "paddingTop",
        "rowSpan"
      ],
      "newTextStyle": [
        "backgroundColor",
        "baselineOffset",
        "bold",
        "fontSize",
        "foregroundColor",
        "italic",
        "link",
        "smallCaps",
        "strikethrough",
        "underline",
        "weightedFontFamily"
      ],
      "newInsertTableColumnRequest": [
        "insertRight",
        "tableCellLocation"
      ],
      "newMergeTableCellsRequest": [
        "tableRange"
      ],
      "newTableRow": [
        "endIndex",
        "startIndex",
        "suggestedDeletionIds",
        "suggestedInsertionIds",
        "suggestedTableRowStyleChanges",
        "tableCells",
        "tableRowStyle"
      ],
      "newHeadingLink": [
        "id",
        "tabId"
      ],
      "newParagraphElement": [
        "autoText",
        "columnBreak",
        "endIndex",
        "equation",
        "footnoteReference",
        "horizontalRule",
        "inlineObjectElement",
        "pageBreak",
        "person",
        "richLink",
        "startIndex",
        "textRun"
      ],
      "newTableOfContents": [
        "content",
        "suggestedDeletionIds",
        "suggestedInsertionIds"
      ],
      "newTableStyle": [
        "tableColumnProperties"
      ],
      "newWriteControl": [
        "requiredRevisionId",
        "targetRevisionId"
      ],
      "newBackground": [
        "color"
      ],
      "newTableCellBorder": [
        "color",
        "dashStyle",
        "width"
      ],
      "newTableCellLocation": [
        "columnIndex",
        "rowIndex",
        "tableStartLocation"
      ],
      "newWeightedFontFamily": [
        "fontFamily",
        "weight"
      ],
      "newReplaceNamedRangeContentRequest": [
        "namedRangeId",
        "namedRangeName",
        "tabsCriteria",
        "text"
      ],
      "newTable": [
        "columns",
        "rows",
        "suggestedDeletionIds",
        "suggestedInsertionIds",
        "tableRows",
        "tableStyle"
      ],
      "newParagraph": [
        "bullet",
        "elements",
        "paragraphStyle",
        "positionedObjectIds",
        "suggestedBulletChanges",
        "suggestedParagraphStyleChanges",
        "suggestedPositionedObjectIds"
      ],
      "newUnmergeTableCellsRequest": [
        "tableRange"
      ],
      "newSectionBreak": [
        "sectionStyle",
        "suggestedDeletionIds",
        "suggestedInsertionIds"
      ],
      "newDeletePositionedObjectRequest": [
        "objectId",
        "tabId"
      ],
      "newCreateFooterRequest": [
        "sectionBreakLocation",
        "type"
      ]
    }

    Reflect.ownKeys(propLists).forEach(p => {
      this[p] = () => advClassMaker(propLists[p])
    })

  }
  toString() {
    return 'AdvancedServiceIdentifier{name=docs, version=v1}'
  }
  getVersion() {
    return 'v1'
  }

  get Documents() {
    return newFakeAdvDocuments(this)
  }
  __getDocsPerformance() {
    return docsCacher.getPerformance()
  }
}

export const newFakeAdvDocs = (...args) => Proxies.guard(new FakeAdvDocs(...args))

