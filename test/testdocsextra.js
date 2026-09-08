import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import {
  wrapupTest,maketdoc, trasher, createTrashCollector
} from './testassist.js';

export const testDocsExtra = (pack) => {
  const toTrash = createTrashCollector();
  const { unit, fixes } = pack || initTests();

  // --- FakeElement Tests ---
  unit.section("Element sibling navigation", t => {
    const { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();
    
    // Note: The body usually starts with an implicit empty element (the initial paragraph).
    const p1 = body.appendParagraph("Para 1");
    const p2 = body.appendParagraph("Para 2");
    const p3 = body.appendParagraph("Para 3");

    // Test getNextSibling
    t.is(p1.getNextSibling().getText(), "Para 2", "p1.getNextSibling should be p2");
    t.is(p2.getNextSibling().getText(), "Para 3", "p2.getNextSibling should be p3");
    t.is(p3.getNextSibling(), null, "p3.getNextSibling should be null");

    // Test getPreviousSibling
    t.is(p3.getPreviousSibling().getText(), "Para 2", "p3.getPreviousSibling should be p2");
    t.is(p2.getPreviousSibling().getText(), "Para 1", "p2.getPreviousSibling should be p1");
    // p1.getPreviousSibling should be the initial empty paragraph
    t.is(p1.getPreviousSibling().getText(), "", "p1.getPreviousSibling should be the initial empty para");
  });

  unit.section("Element removal and position", t => {
    const { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();
    const p1 = body.appendParagraph("Para 1");
    const p2 = body.appendParagraph("Para 2");

    // Test isAtDocumentEnd
    t.true(p2.isAtDocumentEnd(), "p2 should be at document end");
    t.false(p1.isAtDocumentEnd(), "p1 should not be at document end");

    // Test removeFromParent
    p1.removeFromParent();
    // The body should now contain the initial empty element + p2
    t.is(body.getNumChildren(), 2, "Body should have 2 children after p1 removal (empty para + p2)");
    t.is(body.getChild(1).getText(), "Para 2", "Second child should be p2");
    t.true(body.getChild(1).isAtDocumentEnd(), "p2 should still be at document end");
  });

  unit.section("Element attributes", t => {
    const { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();
    const p1 = body.appendParagraph("Para 1");

    // Test getAttributes
    const attrs = p1.getAttributes();
    t.true(is.object(attrs), "getAttributes should return an object");
    // Default bold is null for inherited NORMAL_TEXT in GAS
    t.is(attrs[DocumentApp.Attribute.BOLD], null, "Default bold attribute should be null (inherited)");

    // Test setAttributes
    p1.setAttributes({ 
      [DocumentApp.Attribute.HORIZONTAL_ALIGNMENT]: DocumentApp.HorizontalAlignment.CENTER,
      [DocumentApp.Attribute.BOLD]: true
    });
    t.is(p1.getAttributes()[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], DocumentApp.HorizontalAlignment.CENTER, "setAttributes should update alignment attribute");
    t.is(p1.getAttributes()[DocumentApp.Attribute.BOLD], true, "setAttributes should update bold attribute");
  });

  // --- FakeContainerElement Tests ---
  unit.section("ContainerElement search and manipulation", t => {
    const { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();
    
    // Setup content
    body.appendParagraph("Search for me");
    body.appendTable([["Cell 1"]]);
    body.appendParagraph("Another paragraph");

    // Test getText
    // Body.getText() includes a leading newline from the initial paragraph
    // and appendTable adds an extra newline after it.
    t.is(body.getText(), "\nSearch for me\nCell 1\n\nAnother paragraph", "getText should return concatenated text of all children");

    // Test findElement
    const foundTable = body.findElement(DocumentApp.ElementType.TABLE);
    t.truthy(foundTable, "findElement should find the table");
    t.is(foundTable.getElement().getType(), DocumentApp.ElementType.TABLE, "found element should be a table");

    // Test findText
    const foundText = body.findText("Search for me");
    t.truthy(foundText, "findText should find the text");
    t.is(foundText.getElement().getText(), "Search for me", "found text element should have correct text");

    // Test clear
    body.clear();
    t.is(body.getNumChildren(), 1, "Body should only contain the initial empty element after clear");
    t.is(body.getText(), "", "getText should be empty after clearing content");
  });

  // --- FakeBookmark Tests ---
  unit.section("Bookmark methods", t => {
    const { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();
    const p1 = body.appendParagraph("Para 1");
    
    // Create bookmark at the start of p1
    const pos = doc.newPosition(p1, 0);
    const bookmark = doc.addBookmark(pos);

    // Test getPosition
    const bPos = bookmark.getPosition();
    t.is(bPos.getElement().getText(), "Para 1", "Bookmark position element should be correct");
    t.is(bPos.getOffset(), 0, "Bookmark position offset should be correct");

    // Test remove
    const id = bookmark.getId();
    bookmark.remove();
    // Verify removal - getBookmark(id) should return null
    t.is(doc.getBookmark(id), null, "Bookmark should be removed");
  });

  let asyncTests = Promise.resolve()
  if (ScriptApp.isFake) {
   asyncTests = unit.section("Detached Equation elements", async t => {
      // We dynamically import the fakes here so that the live GAS transpiler doesn't
      // trip over internal module resolutions, and it's guarded by isFake.
      const { newFakeEquation } = await import('../src/services/documentapp/fakeequation.js');
      const { newFakeEquationFunction } = await import('../src/services/documentapp/fakeequationfunction.js');
      const { newFakeEquationSymbol } = await import('../src/services/documentapp/fakeequationsymbol.js');
      const { newFakeEquationFunctionArgumentSeparator } = await import('../src/services/documentapp/fakeequationfunctionargumentseparator.js');

      const eq = newFakeEquation(null, { __type: 'EQUATION' });
      t.is(eq.getType().toString(), 'EQUATION', 'Equation type matches');

      const eqFunc = newFakeEquationFunction(null, { equationFunctionStyle: { code: 'sum' }, __type: 'EQUATION_FUNCTION' });
      t.is(eqFunc.getType().toString(), 'EQUATION_FUNCTION', 'Function type matches');
      t.is(eqFunc.getCode(), 'sum', 'Function code matches');

      const eqSym = newFakeEquationSymbol(null, { equationSymbolStyle: { code: '\\alpha' }, __type: 'EQUATION_SYMBOL' });
      t.is(eqSym.getType().toString(), 'EQUATION_SYMBOL', 'Symbol type matches');
      t.is(eqSym.getCode(), '\\alpha', 'Symbol code matches');

      const eqSep = newFakeEquationFunctionArgumentSeparator(null, { __type: 'EQUATION_FUNCTION_ARGUMENT_SEPARATOR' });
      t.is(eqSep.getType().toString(), 'EQUATION_FUNCTION_ARGUMENT_SEPARATOR', 'Separator type matches');
      return Promise.resolve()
    });

  }

  asyncTests.then ( () => {
    if (!pack) {
      unit.report();
    }
    if (fixes.CLEAN) trasher(toTrash);
    return { unit, fixes };
  });

};

wrapupTest(testDocsExtra);
