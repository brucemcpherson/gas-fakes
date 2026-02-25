// fake Apps Script XmlService
import { XMLParser } from 'fast-xml-parser';
import { Proxies } from '../../support/proxies.js';
import { FakeDocument } from './fakedocument.js';
import { FakeElement } from './fakeelement.js';
import { FakeNamespace } from './fakenamespace.js';

/**
 * Parses the given XML string and returns a Document object.
 * @param {string} xml The XML string to parse.
 * @return {FakeDocument} The parsed document.
 */
const parse = (xml) => {
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    alwaysCreateTextNode: true,
    removeNSPrefix: false // We need prefixes to map them in FakeElement
  };
  const parser = new XMLParser(options);
  const jsonObj = parser.parse(xml);

  // The jsonObj will have the root element name as a key
  const rootName = Object.keys(jsonObj).find(key => !key.startsWith('?')); // Ignore processing instructions
  if (!rootName) {
    throw new Error("XmlService: No root element found in XML.");
  }

  const rootData = jsonObj[rootName];
  const rootElement = new FakeElement(rootName, rootData);
  return new FakeDocument(rootElement);
};

/**
 * Returns a Namespace object with the given prefix and URI.
 * @param {string} prefix The prefix.
 * @param {string} uri The URI.
 * @return {FakeNamespace} The namespace.
 */
const getNamespace = (prefix, uri) => {
  return new FakeNamespace(prefix, uri);
};

// Singleton app object
let _app = null;

const name = "XmlService";
if (typeof globalThis[name] === typeof undefined) {
  const getApp = () => {
    if (!_app) {
      _app = {
        parse,
        getNamespace,
        toString: () => name
      };
    }
    return _app;
  };

  Proxies.registerProxy(name, getApp);
}
