/**
 * Fake Document class for XmlService
 */
export class FakeDocument {
  constructor(rootElement) {
    this._rootElement = rootElement;
  }

  /**
   * Returns the root element of the document.
   * @return {FakeElement} The root element.
   */
  getRootElement() {
    return this._rootElement;
  }

  toString() {
    return `[Document:  No DOCTYPE declaration, Root is [Element: <${this._rootElement.getName()}/>]]`;
  }
}
