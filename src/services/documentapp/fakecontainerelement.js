import { Proxies } from '../../support/proxies.js';
import { newFakeElement } from './fakeelement.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils;
import { FakeElement } from './fakeelement.js';

export const newFakeContainerElement = (...args) => {
  return Proxies.guard(new FakeContainerElement(...args));
};

/**
 * Base class for elements that can contain other elements.
 * @see https://developers.google.com/apps-script/reference/document/container-element
 */
export class FakeContainerElement extends FakeElement {
  constructor(structure, nameOrItem) {
    super(structure, nameOrItem)
  }

  get shadowDocument() {
    if (this.__isDetached) return null;
    return this.__structure.shadowDocument
  }

  get __segmentId() {
    if (this.__isDetached) return null;
    return this.__structure.shadowDocument.__segmentId
  }


  get __children() {
    return this.__twig.children
  }


  getChild(childIndex) {
    const children = this.__children
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.getChild');
    if (nargs !== 1 || !is.integer(childIndex) || childIndex < 0 || childIndex >= children.length) {
      matchThrow();
    }
    const se = children[childIndex]
    if (!se) {
      throw new Error(`child with index ${childIndex} not found`);
    }
    return newFakeElement(this.__structure, se.name).__cast()
  }

  /**
   * the children are shadow, but the arguement arriving will be an apps script element
   * @param {FakeElement} child 
   * @returns 
   */
  getChildIndex(child) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement.getChildIndex');
    if (nargs !== 1 || !is.object(child)) {
      matchThrow();
    }
    // we just need to compare the name here
    // dont want to look at the content because if child has been defined prior to an update it would be out of date anyway
    const seIndex = this.__children.findIndex(c => c.name === child.__name)
    if (seIndex === -1) {
      console.log(child)
      throw new Error(`child with name ${child.__name} not found`);
    }
    return seIndex
  }

  getNumChildren() {
    // Must get the latest structure to return an accurate count,
    // as the object's internal state might be stale.
    const item = this.shadowDocument.structure.elementMap.get(this.__name);
    return item.__twig.children.length;
  }


}