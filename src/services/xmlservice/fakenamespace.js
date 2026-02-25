/**
 * Fake Namespace class for XmlService
 */
export class FakeNamespace {
  constructor(prefix, uri) {
    if (uri === undefined) {
      this._uri = prefix;
      this._prefix = "";
    } else {
      this._prefix = prefix || "";
      this._uri = uri;
    }
  }

  /**
   * Returns the prefix of the namespace.
   * @return {string} The prefix.
   */
  getPrefix() {
    return this._prefix;
  }

  /**
   * Returns the URI of the namespace.
   * @return {string} The URI.
   */
  getURI() {
    return this._uri;
  }

  toString() {
    return "Namespace";
  }
}
