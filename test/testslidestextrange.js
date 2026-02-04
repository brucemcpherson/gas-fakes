

import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testSlidesTextRange = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('TextRange class methods', (t) => {
    const presName = `gas-fakes-test-textrange-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    const slide = pres.getSlides()[0];

    // Add a shape with text
    const shape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX);

    // Verify PageElement -> Shape conversion
    const pageElement = slide.getPageElements()[0];
    t.is(pageElement.getPageElementType().toString(), 'SHAPE', 'PageElement type should be SHAPE');

    // asShape()
    const shapeFromElement = pageElement.asShape();
    t.is(shapeFromElement.toString(), 'Shape', 'asShape() should return a Shape');

    // getText()
    const textRange = shapeFromElement.getText();
    t.is(textRange.toString(), 'TextRange', 'getText() should return a TextRange');

    // setText() and asString()
    textRange.setText('Hello World');
    // Live Apps Script includes the implicit newline
    t.is(textRange.asString(), 'Hello World\n', 'asString() should return the set text with implicit newline');

    // Update text
    textRange.setText('Updated Text');
    t.is(textRange.asString(), 'Updated Text\n', 'asString() should return updated text with implicit newline');

    // clear() and isEmpty()
    t.false(textRange.isEmpty(), 'isEmpty() should be false when text exists');
    textRange.clear();
    const clearedText = textRange.asString();
    t.true(clearedText === '' || clearedText === '\n', 'clear() should remove text (leaving at most a newline)');
    // isEmpty() should be consistent with whether content string is empty (length 0)
    // On Live Apps Script, it leaves '\n' so isEmpty is false. Locally it might be '' so isEmpty is true.
    t.is(textRange.isEmpty(), clearedText.length === 0, 'isEmpty() behavior matches string content');

  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesTextRange);
