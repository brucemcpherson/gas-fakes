import { Proxies } from '../../support/proxies.js'

/**
 * create a new FakeBorder instance
 * @param  {...any} args 
 * @returns {FakeBorder}
 */
export const newFakeTextStyle = (...args) => {
  return Proxies.guard(new FakeTextStyle(...args))
}
// https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/other#TextFormat
class FakeTextStyle {

  /**
   * @param {FakeTextStyleBuilder} the builder
   * @returns {FakeTextStyle} a fake text style
   */

  constructor(builder) {
    this.__builder = builder
  }
  isBold() {
    return this.__builder.__bold
  }
  isItalic() {
    return this.__builder.__italic
  }
  isUnderline() {
    return this.__builder.__underline
  }
  isStrikethrough() {
    return this.__builder.__strikethrough
  }
  getFontSize() {
    return this.__builder.__fontSize
  }
  getFontFamily() {
    return this.__builder.__fontFamily
  }
  getForegroundColor() {
    return this.__builder.__foregroundColor
  }
  getForegroundColorObject() {
    return this.__builder.__foregroundColorObject
  }
  getLinkUrl() {
    return this.__builder.__link?.uri || null
  }
  // make a new version of this builder with the same settings
  copy() {

    const newBuilder = this.__builder.__newBuilder()
    newBuilder.setItalic(this.isItalic())
    newBuilder.setBold(this.isBold())
    newBuilder.setUnderline(this.isUnderline()) 
    newBuilder.setStrikethrough(this.isStrikethrough()) 
    newBuilder.setFontSize(this.getFontSize())  
    newBuilder.setFontFamily(this.getFontFamily())  
    newBuilder.setForegroundColor(this.getForegroundColor())    
    newBuilder.setForegroundColorObject(this.getForegroundColorObject())
    if (this.getLinkUrl()) newBuilder.__link = { uri: this.getLinkUrl() }
 
    return newBuilder

  }
  toString() {
    return 'TextStyle'
  }
}