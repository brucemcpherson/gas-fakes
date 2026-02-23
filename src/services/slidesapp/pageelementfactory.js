import { newFakeShape } from './fakeshape.js';
import { newFakeLine } from './fakeline.js';
import { newFakeTable } from './faketable.js';

/**
 * Converts a base PageElement to a more specific subclass (Shape, Line, etc.)
 * @param {FakePageElement} pageElement The base page element.
 * @returns {FakePageElement|FakeShape|FakeLine} The specific subclass.
 */
export const asSpecificPageElement = (pageElement) => {
  const resource = pageElement.__resource;
  if (resource.shape) {
    return newFakeShape(resource, pageElement.__page);
  }
  if (resource.line) {
    return newFakeLine(resource, pageElement.__page);
  }
  if (resource.table) {
    return newFakeTable(resource, pageElement.__page);
  }
  // Add other types as they are implemented
  return pageElement;
};
