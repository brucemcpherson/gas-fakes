/**
 * Advanced docs service
 */
import { Proxies } from '../../support/proxies.js'
import { signatureArgs, gError } from '../../support/helpers.js'
import { docsCacher } from '../../support/docscacher.js';
import { Syncit } from '../../support/syncit.js'
import is from '@sindresorhus/is'
import { FakeAdvResource } from '../common/fakeadvresource.js';


/**
 * the advanced docs Apps Script service faked - Documents class
 * @class FakeAdvDocuments
 */
class FakeAdvDocuments extends FakeAdvResource {
  constructor(docs) {
    super(docs, 'documents', Syncit.fxDocs);
    this.__fakeObjectType = "Docs.Documents";
    this.docs = docs;
  }

  create(resource, options) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Docs.Documents.create")
    if (nargs < 1 || nargs > 2) matchThrow('Invalid number of arguments provided. Expected 1-2 only')
    if (!is.object(resource) || (nargs > 1 && !is.object(options))) {
      matchThrow("API call to docs.documents.create failed with error: Invalid JSON payload received.")
    }
    const { response, data } = this._call("create", {
      requestBody: resource
    }, options);

    // maybe we need to throw an error
    gError(response, 'docs.documents', "create")
    this.docs.__addAllowed(data.documentId);
    return data
  }

  batchUpdate(requests, documentId) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Docs.Documents.batchUpdate");
    if (nargs !== 2) matchThrow('Invalid number of arguments provided. Expected 2 only');
    if (!is.object(requests) || !is.string(documentId)) {
      matchThrow("API call to docs.documents.batchUpdate failed with error: Invalid JSON payload received.");
    }

    // any update to a doc is a write
    ScriptApp.__behavior.isAccessible(documentId, 'Docs', 'write');

    // Invalidate the cache for this document since we are updating it.
    docsCacher.clear(documentId);
    const { response, data } = this._call("batchUpdate", {
      documentId,
      requestBody: requests
    });

    gError(response, 'docs.documents', "batchUpdate");

    return data;
  }

  /**
   * this wrapper is provided as most calls only need the data, not the full response
   * if you need the response as well, use __get
   * often the 2nd options args is for standard gapi params
   * however in the case of documentid they are actuallly the 2 query parameters
   * suggestionsViewMode, includeTabsContent
   * https://developers.google.com/workspace/docs/api/reference/rest/v1/documents/get
   * @param {} documentId 
   * @param {*} options 
   * @returns data
   */
  get(documentId, options) {
    return this.__get(documentId, options)?.data
  }


  /**
   * we can check response.cache to see if it comes from cache
   * @param {} documentId 
   * @param {*} options 
   * @returns  {data, response}
   */
  __get(documentId, options) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Docs.Documents.get");
    if (nargs < 1 || nargs > 2) matchThrow('Invalid number of arguments provided. Expected 1-2 only');
    if (!is.string(documentId)) {
      matchThrow("API call to docs.documents.get failed with error: Invalid JSON payload received.");
    }
    const optionsSet = new Set(["suggestionsViewMode", "includeTabsContent"]);

    if (is.nonEmptyObject(options) && !Reflect.ownKeys(options || {}).every(f => optionsSet.has(f))) matchThrow();

    ScriptApp.__behavior.isAccessible(documentId, 'Docs', 'read');
    const params = {documentId, ...(options || {}) };

    const { response, data } = this._call("get", params);
    gError(response, 'docs.documents', 'get');
    return {
      data,
      response
    }
  }
}

export const newFakeAdvDocuments = (...args) => Proxies.guard(new FakeAdvDocuments(...args))
