import { Proxies } from '../../support/proxies.js';
import {  getCurrentNr, findOrCreateNamedRangeName, shadowPrefix } from './nrhelpers.js'
import { getElementProp } from './elementhelpers.js';
import { Utils } from '../../support/utils.js';
import { newFakeFootnote } from './fakefootnote.js';
import { defaultDocumentStyleRequests, unpackDocumentTab } from './elementblasters.js';
import { cliLogger } from '../../support/clilogger.js';
const { is } = Utils;

export const newShadowDocument = (...args) => {
  return Proxies.guard(new ShadowDocument(...args));
};

class ShadowDocument {
  constructor(id) {
    this.__id = id
  }

  __fetch() {
    return Docs.Documents.__get(this.__id, { includeTabsContent: true })
  }



  get __endBodyIndex() {
    const content = this.__unpackDocumentTab(this.resource).body.content
    if (!content.length) {
      throw new Error("document has no content")
    }
    const endIndex = content[content.length - 1].endIndex
    if (!endIndex) {
      throw new Error("cant establish end index for document")
    }
    return endIndex
  }


  __unpackDocumentTab (data)  { 
    return unpackDocumentTab (data)
  }

  /**
   * we may need to do this if we're coming from cache
   * although the resource may be in cache, the element map might not be defined
   * why ? because if you create a new Document instance based on the same file as previous document, the document might be in cache,
   * but not its structure - so why not put the structure in cache - 
   * the document cache is managed by calls to the api wherever they come from, including the advanced service which knows nothig about
   * thisdocumentApp emulation.
   * broadening the scope will mean complicating that currently clean and abstracted process.
   * 
   */

  makeElementMap(data) {

    const { body, documentTab, tabs, headers, footers, footnotes } = this.__unpackDocumentTab(data)
    const {content} = body


    // get the currently known named ranges
    const currentNr = getCurrentNr(documentTab)

    if (this.__mapRevisionId !== data.revisionId) {
      this.__mapRevisionId = data.revisionId
      this.__segmentId = body.segmentId
      this.__tabId = tabs?.[0]?.tabProperties?.tabId
    }

    // this will contain all the requests to add new named ranges
    const addRequests = []

    // we'll need to recursively iterate through the document to create a bookmark for every single one
    this.__elementMap = new Map()
    // The body's name is fixed as it's the top-level container for the main content.
    const bodyName = shadowPrefix + "BODY_SECTION_";
    const bodyTree = { name: bodyName, children: [], parent: null }
    const bodyElement = {
      __prop: "BODY_SECTION",
      __type: "BODY_SECTION",
      __name: bodyName,
      __twig: bodyTree
    }
    this.__elementMap.set(bodyName, bodyElement);

    // Add a single FootnoteSection element. It's a virtual container for all footnotes.
    const footnoteSectionName = shadowPrefix + "FOOTNOTE_SECTION_";
    const footnoteSectionTree = { name: footnoteSectionName, children: [], parent: null };
    const footnoteSectionElement = {
      __prop: null,
      __type: "FOOTNOTE_SECTION",
      __name: footnoteSectionName,
      __twig: footnoteSectionTree,
    };
    this.__elementMap.set(footnoteSectionName, footnoteSectionElement);

    // maps all the elements to their named range
    const mapElements = (element, branch, segmentId, knownType = null) => {
      // Tag the element with its segment ID for later lookups.
      element.__segmentId = segmentId;

      // this gets the type and property name to look for for the given element content
      const elementProp = knownType ? { type: knownType, prop: null } : getElementProp(element);
      if (!elementProp) {
        // This will now catch things like sectionBreak
        return;
      }

      // the type is the enum text for te type, the prop is where to find it in the element
      const { type, prop } = elementProp;

      // All child elements are expected to have a range.
      // A list item is a paragraph, so its named range should be of type PARAGRAPH.
      const { endIndex, startIndex } = element;
 
      // The API may omit startIndex for the first paragraph in a new header/footer,
      // and return an endIndex of 1. This represents the initial empty paragraph.
      if (is.integer(endIndex) && !is.integer(startIndex)) {
        // This is likely the first paragraph in a new segment. We infer the startIndex
        // from the endIndex, which differs between segment types.
        // Headers/Footers have endIndex: 1, so their content starts at 0.
        // Body/Footnotes have endIndex: 2, so their content starts at 1.
        if (endIndex === 1) {
          element.startIndex = 0; // For new Headers/Footers
        } else {
          element.startIndex = 1;
        }
      }

      if (!is.integer(element.endIndex) || !is.integer(element.startIndex)) {
        cliLogger.error(element);
        throw new Error(`failed to find endindex/startindex for ${type}`);
      }
      // For an empty document, we use static, non-API names to avoid re-indexing issues.
      // For all other documents, we use real NamedRanges to track elements.
      const nrType = type === 'LIST_ITEM' ? 'PARAGRAPH' : type;
      const { name } = findOrCreateNamedRangeName(element, nrType, currentNr, addRequests, segmentId);

      // embed this stuff in the shadow element
      element.__prop = prop;
      element.__type = type;
      element.__name = name;

      const twig = { name: name, children: [], parent: branch };
      element.__twig = twig;
      this.__elementMap.set(name, element);


      // For most elements, the content is in a sub-property (e.g., element.paragraph).
      // For TableRow and TableCell, the element itself is the content container.
      const ep = is.null(prop) ? element : element[prop];

      // Determine the correct property to iterate over for children
      let childrenArray = [];
      let childType = null;

      if (type === 'TABLE') {
        childrenArray = ep.tableRows || [];
        childType = 'TABLE_ROW';
      } else if (type === 'TABLE_ROW') {
        childrenArray = ep.tableCells || [];
        childType = 'TABLE_CELL';
      } else if (type === 'TABLE_CELL') {
        childrenArray = ep.content || [];
        // childType is null, getElementProp will figure it out
      } else if (ep && Reflect.has(ep, "elements")) { // For Paragraph and others
        childrenArray = ep.elements;
        // childType is null, getElementProp will figure it out
      }

      if (childrenArray.length > 0) {
        // Process ALL sub-elements recursively to ensure they are in the elementMap and have a twig.
        childrenArray.forEach(subElement => mapElements(subElement, twig, segmentId, childType));

        // Now that all sub-elements have been processed and have a __twig, we can
        // filter them to build the user-facing children list for the current twig.
        if (type === 'PARAGRAPH') {
          const hasFootnoteRef = childrenArray.some(e => e.footnoteReference);
          twig.children = childrenArray
            .map(e => e.__twig) // Get the twig for each raw element
            .filter(childTwig => {
              if (!childTwig) return false;
              const childElement = this.__elementMap.get(childTwig.name);
              if (!childElement) return false;

              // If a footnote reference exists in the paragraph, the Apps Script model
              // abstracts away the visual text run for the number. We need to filter it out.
              // The text run for a footnote number has a superscript style.
              if (hasFootnoteRef && childElement.textRun) {
                if (childElement.textRun.textStyle && childElement.textRun.textStyle.baselineOffset === 'SUPERSCRIPT') {
                  // This is likely the footnote number's text run, so we exclude it from the children list.
                  return false;
                }
              }

              // A positioned image is not a "child" in the Apps Script sense (it doesn't affect getNumChildren).
              // It is anchored to the paragraph but lives in a separate collection.
              if (childElement.__type === 'POSITIONED_IMAGE') return false;

              // A paragraph's children are its non-text elements (like PageBreak)
              // and text runs that are not just a newline.
              return childElement.pageBreak ||
                childElement.horizontalRule ||
                childElement.footnoteReference ||
                childElement.inlineObjectElement ||
                (childElement.textRun && childElement.textRun.content && childElement.textRun.content !== '\n');
            });
        } else {
          // For non-paragraph containers, all children are significant.
          twig.children = childrenArray.map(e => e.__twig).filter(Boolean);
        }
      }
      return twig;

    };

    // recurse the entire document
    content.forEach(c => mapElements(c, bodyTree, body.segmentId));
    bodyTree.children = content.map(c => c.__twig).filter(Boolean);

    // Now map headers and footers
    const mapSection = (sectionMap, sectionType) => {
      if (!sectionMap) return;
      Reflect.ownKeys(sectionMap).forEach(sectionId => {
        const section = sectionMap[sectionId];
        // The name in the element map is constructed from the type and ID.
        const sectionName = shadowPrefix + sectionType + '_' + sectionId;
        const sectionTree = { name: sectionName, children: [], parent: null };
        const sectionElement = {
          __prop: null, // a header/footer is a top-level container
          __type: sectionType,
          __name: sectionName,
          __twig: sectionTree,
          // also store the original resource item
          __segmentId: sectionId,
          ...section,
        };
        this.__elementMap.set(sectionName, sectionElement);

        // recurse the content of the section
        (section.content || []).forEach(c => mapElements(c, sectionTree, sectionId));
        sectionTree.children = (section.content || []).map(c => c.__twig).filter(Boolean);
      });
    };

    mapSection(headers, 'HEADER_SECTION');
    mapSection(footers, 'FOOTER_SECTION');

    // Now map footnotes
    const mapFootnotes = (footnoteMap) => {
      const footnoteSectionElement = this.getElement(shadowPrefix + "FOOTNOTE_SECTION_");
      if (!footnoteSectionElement) {
        // This should not happen as we created it above.
        throw new Error('Internal error: FootnoteSection element not found in map.');
      }
      const footnoteSectionTree = footnoteSectionElement.__twig;
      const footnoteTwigs = [];

      if (!footnoteMap) {
        footnoteSectionTree.children = [];
        return;
      }

      Reflect.ownKeys(footnoteMap).forEach(footnoteId => {
        const footnote = footnoteMap[footnoteId];
        // The name in the element map is constructed from the type and ID.
        const footnoteName = shadowPrefix + 'FOOTNOTE_' + footnoteId;
        const footnoteTree = { name: footnoteName, children: [], parent: footnoteSectionTree }; // Parent is the virtual FootnoteSection
        const footnoteElement = {
          __prop: null,
          __type: 'FOOTNOTE',
          __name: footnoteName,
          __twig: footnoteTree,
          __segmentId: footnoteId,
          ...footnote,
        };
        this.__elementMap.set(footnoteName, footnoteElement);

        (footnote.content || []).forEach(c => mapElements(c, footnoteTree, footnoteId));
        footnoteTree.children = (footnote.content || []).map(c => c.__twig).filter(Boolean);
        footnoteTwigs.push(footnoteTree);
      });
      footnoteSectionTree.children = footnoteTwigs;
    };
    mapFootnotes(footnotes);
    // delete the named ranges that weren't used
    // findOrCreate... consumes the currentNr list, so what's left are unused ranges.

    const deleteRequests = currentNr.map(r => ({
      deleteNamedRange: {
        namedRangeId: r.namedRangeId
      }
    }))

    const requests = deleteRequests.concat(addRequests)

    if (requests.length > 0) {
      // If we need to add or delete named ranges, we do the update and then
      // recursively call this function with the refreshed document state.
      // This ensures the final elementMap and nrMap are based on the latest version.
      Docs.Documents.batchUpdate({ requests }, this.__id)
      return this.makeElementMap(this.__fetch().data)
    }
    // If there were no named range changes, the document is stable. We can set the map.
    this.nrMap = new Map(getCurrentNr(data).map(f => [f.name, f]));
    return data;
  }

  /**
   * Gets a footnote by its ID.
   * @param {string} id The footnote ID.
   * @returns {FakeFootnote|null} The footnote, or null if not found.
   */
  getFootnoteById(id) {
    // The name in the element map is prefixed.
    const footnoteName = shadowPrefix + 'FOOTNOTE_' + id;
    const item = this.getElement(footnoteName);
    if (item) {
      return newFakeFootnote(this, footnoteName);
    }
    return null;
  }

  get namedRanges () {
    return this.__unpackDocumentTab(this.resource).documentTab.namedRanges || {}
  }

  getNamedRange (name) {
    const nrs = this.namedRanges
    if (!nrs) return null
    return nrs[name]?.namedRanges?.[0] || null
  }

  /**
   * Gets all footnotes in the document.
   * @returns {FakeFootnote[]} An array of footnotes.
   */
  getFootnotes() {
    const { footnotes } = this.__unpackDocumentTab(this.resource);
    return footnotes ? Object.keys(footnotes).map(id => this.getFootnoteById(id)) : [];
  }
  // this looks expensive, but the document wil always be in case unless its been updated
  // in which case we have to get it anyway this will
  get resource() {
    const { data, response } = this.__fetch()
    const { fromCache } = response
    if (fromCache) {
      if (!this.__elementMap || !this.__mapRevisionId || this.__mapRevisionId !== data.revisionId) {
        // if there are multiple document instances, it could be in cache, but this instance could be lacking an element map, or it could
        // have been updated by something else so we'd need to fiddle with the document map again
        return this.makeElementMap(data)
      }
      return data
    }
    // it wasnt in cache so we'll need a rebuild of the element map
    return this.makeElementMap(data)
  }

  // the file representation is required for some operations
  get file() {
    return DriveApp.getFileById(this.__id)
  }

  get elementMap() {
    return this.__elementMap
  }

  get structure() {
    // will always refresh if it needs to
    const resource = this.refresh()
    const elementMap = this.elementMap
    return {
      elementMap,
      resource,
      shadowDocument: this
    }
  }

  getId() {
    return this.resource.documentId
  }

  getElement(name) {
    // The element map now contains body, headers, footers, AND footnotes.
    return this.structure.elementMap.get(name);
  }
  refresh() {
    // all that's need to refresh everything is to fetch the resource
    return this.resource
  }
  clear() {
    const { body, headers, footers } = this.__unpackDocumentTab(this.resource);
    const content = body.content;
    const requests = [];
    // Clear body content, if it exists
    if (content && content.length > 0) {
      // The last structural element contains the end index of the body's content.
      // A new/empty document has one structural element (a paragraph) with startIndex 1 and endIndex 2.
      // We must not delete this final newline character.
      const lastElement = content[content.length - 1];
      const endIndex = lastElement.endIndex;      

      const hasContentToDelete = endIndex > 2;
      const firstElement = content.find(c => c.startIndex === 1);
      const isFirstElementListItem = firstElement?.paragraph?.bullet;
      
      // Only delete content if there's more than just the initial empty paragraph.
      if (hasContentToDelete) {
        requests.push({
          deleteContentRange: { range: { startIndex: 1, endIndex: endIndex - 1, segmentId: this.__segmentId, tabId: this.__tabId } }
        });
      }
      
      if (hasContentToDelete || isFirstElementListItem) {
        requests.push({ deleteParagraphBullets: { range: { startIndex: 1, endIndex: 1, segmentId: this.__segmentId, tabId: this.__tabId } } });
      }
    }

    // We also need to reset the named paragraph styles back to their initial state.
    // Note that on the live environment, doc.clear() does NOT reset document-level styles (e.g., margins).
    requests.push(...defaultDocumentStyleRequests())

    if (requests.length > 0) {
      Docs.Documents.batchUpdate({ requests }, this.getId());
    }

    // on the next access to the resource, the cache will be dirty and be refreshed, and the elementmap rebuilt

    return this;
  }
}
