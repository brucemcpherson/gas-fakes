import { Proxies } from '../../support/proxies.js';
import { newFakeConnectionSite } from './fakeconnectionsite.js';
import { newFakeLink } from './fakelink.js';
import { newFakeAffineTransform } from './fakeaffinetransform.js';

export const newFakePageElement = (...args) => {
  return Proxies.guard(new FakePageElement(...args));
};

export class FakePageElement {
  constructor(resource, page) {
    this.__id = resource.objectId;
    this.__page = page;
  }

  __normalize(val) {
    if (!val) return 0;
    if (typeof val === 'number') {
      // If > 5000 it's likely EMU. 1 PT = 12700 EMU.
      // But search "gas-pro"... sometimes things are exactly EMU.
      return val > 5000 ? val / 12700 : val;
    }
    if (typeof val.magnitude === 'number') {
      const isEMU = val.unit === 'EMU' || val.magnitude > 5000;
      return isEMU ? val.magnitude / 12700 : val.magnitude;
    }
    return val || 0;
  }

  get __resource() {
    const pageResource = this.__page.__resource;
    const element = (pageResource.pageElements || []).find(e => e.objectId === this.__id);
    if (!element) {
      throw new Error(`PageElement with ID ${this.__id} not found on page`);
    }
    return element;
  }

  getObjectId() {
    return this.__id;
  }

  /**
   * Returns the page element as a shape.
   * @returns {FakeShape} The shape.
   */
  asShape() {
    if (this.__resource.shape) {
      const { newFakeShape } = PageElementRegistry;
      return newFakeShape(this.__resource, this.__page);
    }
    throw new Error('PageElement is not a shape.');
  }

  /**
   * Returns the page element as a line.
   * @returns {FakeLine} The line.
   */
  asLine() {
    if (this.__resource.line) {
      const { newFakeLine } = PageElementRegistry;
      return newFakeLine(this.__resource, this.__page);
    }
    throw new Error('PageElement is not a line.');
  }

  /**
   * Returns the page element as a table.
   * @returns {FakeTable} The table.
   */
  asTable() {
    if (this.__resource.table) {
      const { newFakeTable } = PageElementRegistry;
      return newFakeTable(this.__resource, this.__page);
    }
    throw new Error('PageElement is not a table.');
  }

  /**
   * Gets the type of the page element.
   * @returns {SlidesApp.PageElementType} The type.
   */
  getPageElementType() {
    const types = SlidesApp.PageElementType;
    if (this.__resource.shape) {
      return types.SHAPE;
    }
    if (this.__resource.line) {
      return types.LINE;
    }
    if (this.__resource.image) {
      return types.IMAGE;
    }
    if (this.__resource.video) {
      return types.VIDEO;
    }
    if (this.__resource.table) {
      return types.TABLE;
    }
    if (this.__resource.wordArt) {
      return types.WORD_ART;
    }
    if (this.__resource.sheetsChart) {
      return types.SHEETS_CHART;
    }
    if (this.__resource.group) {
      return types.GROUP;
    }
    return types.UNSUPPORTED;
  }

  getLeft() {
    return this.__normalize(this.__resource.transform?.translateX);
  }

  setLeft(left) {
    this.__updateTransform({ translateX: left });
    return this;
  }

  getTop() {
    return this.__normalize(this.__resource.transform?.translateY);
  }

  setTop(top) {
    this.__updateTransform({ translateY: top });
    return this;
  }

  getWidth() {
    const magnitude = this.__normalize(this.__resource.size?.width);
    const scaleX = this.__resource.transform?.scaleX || 1;
    return magnitude * scaleX;
  }

  setWidth(width) {
    this.__updateSize({ width: { magnitude: width, unit: 'PT' } });
    return this;
  }

  getHeight() {
    const magnitude = this.__normalize(this.__resource.size?.height);
    const scaleY = this.__resource.transform?.scaleY || 1;
    return magnitude * scaleY;
  }

  setHeight(height) {
    this.__updateSize({ height: { magnitude: height, unit: 'PT' } });
    return this;
  }

  getRotation() {
    // Rotation can be calculated from scale and shear in affine transform
    // But for fakes, we might just return 0 if not easily available.
    return 0;
  }

  setRotation(angle) {
    // In API, we usually setting rotation via updatePageElementTransform with RELATIVE mode or similar
    return this;
  }

  getTransform() {
    const t = this.__resource.transform || {};
    return newFakeAffineTransform(
      t.scaleX || 1,
      t.shearY || 0,
      t.shearX || 0,
      t.scaleY || 1,
      this.__normalize(t.translateX),
      this.__normalize(t.translateY)
    );
  }

  setTransform(affineTransform) {
    this.__updateTransform({
      scaleX: affineTransform.getScaleX(),
      shearY: affineTransform.getShearY(),
      shearX: affineTransform.getShearX(),
      scaleY: affineTransform.getScaleY(),
      translateX: affineTransform.getTranslateX(),
      translateY: affineTransform.getTranslateY()
    });
    return this;
  }

  preconcatenateTransform(affineTransform) {
    // Simplified multiplication for mock
    return this;
  }

  alignOnPage(alignmentPosition) {
    const presentationId = this.__page.__presentation?.getId() || this.__page.__slide?.__presentation.getId();
    Slides.Presentations.batchUpdate([{
      updatePageElementProperties: {
        objectId: this.getObjectId(),
        pageElementProperties: {}, // API doesn't have direct align?
        fields: '*'
      }
    }], presentationId);
    return this;
  }

  getTitle() {
    return this.__resource.title || '';
  }

  setTitle(title) {
    this.__updateAltText(title, this.getDescription());
    return this;
  }

  getDescription() {
    return this.__resource.description || '';
  }

  setDescription(description) {
    this.__updateAltText(this.getTitle(), description);
    return this;
  }

  getParentPage() {
    return this.__page;
  }

  getParentGroup() {
    // We need to look if this element is inside any group on the page
    // This requires searching all page elements for groups
    return null; // Simplified for now
  }

  remove() {
    const presentationId = this.__page.__presentation.getId();
    Slides.Presentations.batchUpdate([{
      deleteObject: {
        objectId: this.getObjectId()
      }
    }], presentationId);
  }

  bringForward() {
    this.__updateZOrder('BRING_FORWARD');
    return this;
  }

  bringToFront() {
    this.__updateZOrder('BRING_TO_FRONT');
    return this;
  }

  sendBackward() {
    this.__updateZOrder('SEND_BACKWARD');
    return this;
  }

  sendToBack() {
    this.__updateZOrder('SEND_TO_BACK');
    return this;
  }

  getLink() {
    const res = this.__resource;
    const link = res.link ||
      res.shape?.shapeProperties?.link ||
      res.line?.lineProperties?.link ||
      res.image?.imageProperties?.link ||
      res.video?.videoProperties?.link ||
      res.table?.tableProperties?.link;
    if (!link || Object.keys(link).length === 0) return null;
    return newFakeLink(link);
  }

  setLinkUrl(url) {
    this.__updateProperties({ link: { url: url } }, 'link');
    return this.getLink();
  }

  setLinkSlide(slideOrIndexOrPosition) {
    let link = {};
    if (typeof slideOrIndexOrPosition === 'number') {
      // Slide index - we'd need to find the slide ID by index
      // For now, skipping index lookup complexity
      link = { relativeSlide: 'NEXT_SLIDE' }; // placeholder
    } else if (typeof slideOrIndexOrPosition === 'string') {
      // Slide ID maybe? Or relative position string
      link = { slideId: slideOrIndexOrPosition };
    } else if (slideOrIndexOrPosition && slideOrIndexOrPosition.getObjectId) {
      // Slide object
      link = { slideId: slideOrIndexOrPosition.getObjectId() };
    }
    this.__updateProperties({ link: link }, 'link');
    return this.getLink();
  }

  removeLink() {
    this.__updateProperties({}, 'link');
    return this;
  }

  __updateTransform(transform) {
    const t = this.getTransform();
    const presentationId = this.__page.__presentation?.getId() || this.__page.__slide?.__presentation.getId();
    Slides.Presentations.batchUpdate([{
      updatePageElementTransform: {
        objectId: this.getObjectId(),
        transform: {
          scaleX: t.getScaleX(),
          scaleY: t.getScaleY(),
          shearX: t.getShearX(),
          shearY: t.getShearY(),
          translateX: t.getTranslateX(),
          translateY: t.getTranslateY(),
          ...transform,
          unit: 'PT'
        },
        applyMode: 'ABSOLUTE'
      }
    }], presentationId);
  }

  __updateSize(size) {
    const t = this.getTransform();
    const currentWidth = this.getWidth();
    const currentHeight = this.getHeight();

    const scaleX = size.width ? size.width.magnitude / (currentWidth || 1) : 1;
    const scaleY = size.height ? size.height.magnitude / (currentHeight || 1) : 1;

    this.__updateTransform({
      scaleX: t.getScaleX() * scaleX,
      scaleY: t.getScaleY() * scaleY,
      shearX: t.getShearX(),
      shearY: t.getShearY(),
      translateX: t.getTranslateX(),
      translateY: t.getTranslateY()
    });
  }

  __updateAltText(title, description) {
    const presentationId = this.__page.__presentation.getId();
    Slides.Presentations.batchUpdate([{
      updatePageElementAltText: {
        objectId: this.getObjectId(),
        title: title,
        description: description
      }
    }], presentationId);
  }

  __updateProperties(props, fields) {
    const presentationId = this.__page.__presentation?.getId() || this.__page.__slide?.__presentation.getId();
    const type = this.getPageElementType().toString();
    let request = null;

    if (type === 'SHAPE') {
      request = {
        updateShapeProperties: {
          objectId: this.getObjectId(),
          shapeProperties: props,
          fields: fields || Object.keys(props).join(',')
        }
      };
    } else if (type === 'LINE') {
      request = {
        updateLineProperties: {
          objectId: this.getObjectId(),
          lineProperties: props,
          fields: fields || Object.keys(props).join(',')
        }
      };
    }

    if (request) {
      if (request.updateShapeProperties) request.updateShapeProperties.fields = fields || '*';
      if (request.updateLineProperties) request.updateLineProperties.fields = fields || '*';
      Slides.Presentations.batchUpdate([request], presentationId);
    }
  }

  __updateZOrder(operation) {
    const presentationId = this.__page.__presentation.getId();
    Slides.Presentations.batchUpdate([{
      updatePageElementZOrder: {
        pageElementObjectIds: [this.getObjectId()],
        zOrderOperation: operation
      }
    }], presentationId);
  }

  /**
   * Gets the connection sites on the page element.
   * @returns {FakeConnectionSite[]} The connection sites.
   */
  getConnectionSites() {
    // Standard shapes usually have 4 connection sites (top, right, bottom, left).
    // For now, let's return a fixed number as a mock.
    return [0, 1, 2, 3].map(index => newFakeConnectionSite(this, index));
  }
  toString() {
    return 'PageElement';
  }
}

export const PageElementRegistry = {
  newFakeShape: null,
  newFakeLine: null,
  newFakeTable: null
};
