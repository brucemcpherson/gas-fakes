/**
 * Fake Element class for XmlService
 */
export class FakeElement {
  constructor(name, data = {}, parent = null) {
    const parts = name.split(':');
    this._localName = parts.pop();
    this._prefix = parts.length > 0 ? parts[0] : "";
    this._qualifiedName = name;
    this._data = data; // This holds children and attributes
    this._parent = parent;
  }

  /**
   * Returns the local name of the element.
   * @return {string} The local name of the element.
   */
  getName() {
    return this._localName;
  }

  /**
   * Returns the full qualified name of the element.
   * (Not part of GAS public API, but useful internally)
   */
  getQualifiedName() {
    return this._qualifiedName;
  }

  /**
   * Returns the text content of the element.
   * @return {string} The text content of the element.
   */
  getText() {
    if (typeof this._data === 'string') return this._data;
    if (this._data && typeof this._data === 'object') {
      // fast-xml-parser with alwaysCreateTextNode: true puts text in #text
      return this._data['#text'] || '';
    }
    return '';
  }

  /**
   * Returns the value of the element.
   * @return {string} The value of the element.
   */
  getValue() {
    return this.getText();
  }

  /**
   * Returns the first child element with the given name.
   * @param {string} name The name of the child element.
   * @param {FakeNamespace} namespace Optional namespace.
   * @return {FakeElement} The child element, or null if not found.
   */
  getChild(name, namespace) {
    const children = this.getChildren(name, namespace);
    return children.length > 0 ? children[0] : null;
  }

  /**
   * Returns all child elements.
   * @param {string} name Optional name of the child elements.
   * @param {FakeNamespace} namespace Optional namespace.
   * @return {FakeElement[]} The child elements.
   */
  getChildren(name, namespace) {
    if (!this._data || typeof this._data !== 'object') return [];

    // Determine the target key to look for
    let targetKey = name;
    if (name && namespace) {
      const prefix = namespace.getPrefix();
      targetKey = prefix ? `${prefix}:${name}` : name;
    } else if (name && name.includes(':')) {
      // If user passed "ns:child", it might work in our fake even if not in GAS
      targetKey = name;
    }

    if (targetKey) {
      const childData = this._data[targetKey];
      if (!childData) return [];
      if (Array.isArray(childData)) {
        return childData.map(d => new FakeElement(targetKey, d, this));
      }
      return [new FakeElement(targetKey, childData, this)];
    }

    // Return all children (non-attribute keys and not #text)
    return Object.keys(this._data)
      .filter(key => !key.startsWith('@_') && key !== '#text')
      .flatMap(key => {
        const d = this._data[key];
        if (Array.isArray(d)) {
          return d.map(item => new FakeElement(key, item, this));
        }
        return new FakeElement(key, d, this);
      });
  }

  /**
   * Returns the attribute with the given name.
   * @param {string} name The name of the attribute.
   * @return {object} An object with a getValue() method.
   */
  getAttribute(name) {
    if (!this._data || typeof this._data !== 'object') return null;
    const attrValue = this._data[`@_${name}`];
    if (attrValue === undefined) return null;
    return {
      getName: () => name,
      getValue: () => String(attrValue)
    };
  }

  /**
   * Returns the text content of the first child element with the given name.
   * @param {string} name The name of the child element.
   * @param {FakeNamespace} namespace Optional namespace.
   * @return {string} The text content, or empty string if not found.
   */
  getChildText(name, namespace) {
    const child = this.getChild(name, namespace);
    return child ? child.getText() : '';
  }

  toString() {
    return "[Element: <" + this.getName() + "/>]";
  }
}
