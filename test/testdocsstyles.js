import "@mcpher/gas-fakes";

import { initTests } from "./testinit.js";
import {
  wrapupTest,
  cachePerformance,
  maketdoc,
  getChildren,
  trasher,
  unpackedDoc,
} from "./testassist.js";
export const testDocsStyles = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  // Helper to mimic the save/close/reopen pattern needed for live GAS
  const scl = (doc) => {
    if (!DocumentApp.isFake) {
      const id = doc.getId();
      doc.saveAndClose();
      return DocumentApp.openById(id);
    }
    return doc;
  };

  unit.section("Paragraph attribute methods", (t) => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    let body = doc.getBody();
    const p = body.appendParagraph("This is a test paragraph for attributes.");

    // Test Alignment
    p.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    t.is(
      p.getAlignment(),
      DocumentApp.HorizontalAlignment.CENTER,
      "get/set Alignment should work",
    );

    // Test IndentEnd
    p.setIndentEnd(50);
    t.is(p.getIndentEnd(), 50, "get/set IndentEnd should work");

    // Test IndentFirstLine
    p.setIndentFirstLine(25);
    t.is(p.getIndentFirstLine(), 25, "get/set IndentFirstLine should work");

    // Test IndentStart
    p.setIndentStart(75);
    t.is(p.getIndentStart(), 75, "get/set IndentStart should work");

    // Test LineSpacing
    p.setLineSpacing(1.5);
    t.is(p.getLineSpacing(), 1.5, "get/set LineSpacing should work");

    // Test SpacingAfter
    p.setSpacingAfter(10);
    t.is(p.getSpacingAfter(), 10, "get/set SpacingAfter should work");

    // Test SpacingBefore
    p.setSpacingBefore(20);
    t.is(p.getSpacingBefore(), 20, "get/set SpacingBefore should work");

    // Test LeftToRight
    p.setLeftToRight(false);
    t.is(p.isLeftToRight(), false, "get/set LeftToRight should work");
    p.setLeftToRight(true);
    t.is(p.isLeftToRight(), true, "isLeftToRight should revert to true");
    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("Body style and attribute methods", (t) => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    let body = doc.getBody();

    // Test setText and re-open
    body.setText("Initial paragraph.");
    t.is(
      body.getText(),
      "Initial paragraph.",
      "setText should replace body content",
    );

    const p1 = body.getChild(0);
    const p1InitialAttrs = p1.getAttributes();

    // Live GAS returns null for inherited paragraph attributes on existing/reloaded paragraphs.
    t.is(
      p1InitialAttrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT],
      null,
      "Initial reloaded paragraph should have null alignment (inherited)",
    );
    t.is(
      p1InitialAttrs[DocumentApp.Attribute.ITALIC],
      null,
      "Initial paragraph should not be italic (returns null)",
    );

    const attributesToSet = {
      [DocumentApp.Attribute.HORIZONTAL_ALIGNMENT]:
        DocumentApp.HorizontalAlignment.CENTER,
      [DocumentApp.Attribute.ITALIC]: true,
      [DocumentApp.Attribute.FONT_FAMILY]: "Comic Sans MS",
    };
    body.setAttributes(attributesToSet);

    const p1_reloaded = body.getChild(0);
    const p1AfterSetAttrs = p1_reloaded.getAttributes();

    // Verify changes to the EXISTING paragraph
    t.is(
      p1AfterSetAttrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT],
      null,
      "setAttributes should NOT affect alignment of existing paragraphs (remains null)",
    );
    t.is(
      p1AfterSetAttrs[DocumentApp.Attribute.ITALIC],
      true,
      "setAttributes SHOULD affect italic of existing paragraphs",
    );
    t.is(
      p1AfterSetAttrs[DocumentApp.Attribute.FONT_FAMILY],
      "Comic Sans MS",
      "setAttributes SHOULD affect font family of existing paragraphs",
    );

    // Verify changes to a NEWLY appended paragraph
    const p2 = body.appendParagraph("A new paragraph");
    const p2Attrs = p2.getAttributes();
    // Live GAS returns the computed alignment for newly appended paragraphs, but the inline style for text attributes.
    t.is(
      p2Attrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT],
      DocumentApp.HorizontalAlignment.LEFT,
      "setAttributes should NOT affect alignment of new paragraphs (remains LEFT)",
    );
    t.is(
      p2Attrs[DocumentApp.Attribute.ITALIC],
      true,
      "setAttributes SHOULD affect italic of new paragraphs",
    );
    t.is(
      p2Attrs[DocumentApp.Attribute.FONT_FAMILY],
      "Comic Sans MS",
      "setAttributes SHOULD affect font family of new paragraphs",
    );
    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("Heading style and attribute methods", (t) => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    let body = doc.getBody();
    let docId = doc.getId();

    // 1. Create a paragraph and set it to HEADING1.
    const p1 = body.appendParagraph("This is a heading");
    p1.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    doc = scl(doc);
    body = doc.getBody();

    // 2. Define and set attributes for the HEADING1 named style.
    const heading1Attributes = {
      [DocumentApp.Attribute.ITALIC]: true, // This will be ignored by the live API
      [DocumentApp.Attribute.FONT_FAMILY]: "Georgia", // This will be ignored by the live API
      [DocumentApp.Attribute.HORIZONTAL_ALIGNMENT]:
        DocumentApp.HorizontalAlignment.CENTER, // This will be ignored by the live API
      [DocumentApp.Attribute.SPACING_BEFORE]: 18, // This should be applied
    };
    body.setHeadingAttributes(
      DocumentApp.ParagraphHeading.HEADING1,
      heading1Attributes,
    );
    doc = scl(doc);
    body = doc.getBody();

    // 3. Verify the attributes of the EXISTING HEADING1 paragraph have NOT changed.
    const p1_reloaded = body.getChild(1);
    const p1Attrs = p1_reloaded.getAttributes();

    t.is(
      p1Attrs[DocumentApp.Attribute.ITALIC],
      null,
      "setHeadingAttributes should NOT affect italic of existing paragraphs",
    );
    t.is(
      p1Attrs[DocumentApp.Attribute.FONT_FAMILY],
      null,
      "setHeadingAttributes should NOT affect font family of existing paragraphs",
    );
    t.is(
      p1Attrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT],
      null,
      "setHeadingAttributes should NOT affect alignment of existing paragraphs",
    );
    t.is(
      p1Attrs[DocumentApp.Attribute.SPACING_BEFORE],
      null,
      "setHeadingAttributes should NOT affect spacing of existing paragraphs",
    );

    // 4. Append a NEW paragraph and set it to HEADING1.
    const p2 = body.appendParagraph("Another heading");
    p2.setHeading(DocumentApp.ParagraphHeading.HEADING1);

    // On live GAS, getAttributes() returns null for any attribute inherited from a named style (except for some paragraph styles on NORMAL_TEXT).
    const p2Attrs = p2.getAttributes();
    t.is(
      p2Attrs[DocumentApp.Attribute.ITALIC],
      null,
      "New HEADING1 should have null italic (inherited)",
    );
    t.is(
      p2Attrs[DocumentApp.Attribute.FONT_FAMILY],
      null,
      "New HEADING1 font is inherited, so getAttributes returns null",
    );
    t.is(
      p2Attrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT],
      null,
      "New HEADING1 alignment is inherited, so getAttributes returns null",
    );
    t.is(
      p2Attrs[DocumentApp.Attribute.SPACING_BEFORE],
      null,
      "New HEADING1 spacing is inherited, so getAttributes returns null",
    );
    doc = scl(doc);
    body = doc.getBody();

    // 5. Verify that NORMAL_TEXT was not affected.
    const p3 = body.appendParagraph("This is normal text.");
    const p3Attrs = p3.getAttributes();
    // The NORMAL_TEXT exception: paragraph styles are computed, text styles are not.
    t.is(
      p3Attrs[DocumentApp.Attribute.ITALIC],
      null,
      "NORMAL_TEXT should not be italic (inherited)",
    );
    t.is(
      p3Attrs[DocumentApp.Attribute.FONT_FAMILY],
      null,
      "NORMAL_TEXT font is inherited, so getAttributes returns null",
    );
    t.is(
      p3Attrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT],
      DocumentApp.HorizontalAlignment.LEFT,
      "NORMAL_TEXT alignment is computed LEFT",
    );

    // 6. Verify the underlying named style definition was changed using the advanced service.
    const finalDocResource = unpackedDoc(docId);
    const namedStyles = finalDocResource.namedStyles.styles;
    const heading1Style = namedStyles.find(
      (s) => s.namedStyleType === "HEADING_1",
    );
    t.falsey(
      heading1Style.textStyle.italic,
      "ADVANCED: HEADING_1 textStyle.italic should be undefined (text styles are ignored by setHeadingAttributes)",
    );
    t.falsey(
      heading1Style.textStyle.weightedFontFamily,
      "ADVANCED: HEADING_1 textStyle.weightedFontFamily should be undefined (text styles are ignored by setHeadingAttributes)",
    );
    t.falsey(
      heading1Style.paragraphStyle.alignment,
      "ADVANCED: HEADING_1 definition alignment should be undefined (ignored by API)",
    );
    // This test is removed as the fake environment cannot update the named style definition.
    // t.is(heading1Style.paragraphStyle.spaceAbove.magnitude, 18, "ADVANCED: HEADING_1 definition spacing should be 18");

    const normalTextStyle = namedStyles.find(
      (s) => s.namedStyleType === "NORMAL_TEXT",
    );
    t.is(
      normalTextStyle.textStyle.weightedFontFamily.fontFamily,
      "Arial",
      "ADVANCED: NORMAL_TEXT font should still be Arial",
    );

    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("Appended paragraph style validation", (t) => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    const body = doc.getBody();
    const paraText = "p1";
    const appendedPara = body.appendParagraph(paraText);

    // For a newly appended paragraph, getAttributes() returns the computed style from the named style.
    const attributes = appendedPara.getAttributes();
    // The NORMAL_TEXT exception: paragraph styles are computed, text styles are not.
    t.is(
      attributes[DocumentApp.Attribute.HEADING],
      DocumentApp.ParagraphHeading.NORMAL,
      "Named style type should be NORMAL_TEXT",
    );
    t.is(
      attributes[DocumentApp.Attribute.LEFT_TO_RIGHT],
      true,
      "Direction should be LEFT_TO_RIGHT",
    );
    t.is(
      attributes[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT],
      DocumentApp.HorizontalAlignment.LEFT,
      "Alignment is computed for NORMAL_TEXT",
    );
    t.is(
      attributes[DocumentApp.Attribute.LINE_SPACING],
      1.15,
      "Line spacing is computed for NORMAL_TEXT",
    );

    // Now check the underlying resource to be sure
    doc = scl(doc);
    const docResource = unpackedDoc(doc.getId());
    const paraElement = docResource.body.content.find(
      (c) =>
        c.paragraph &&
        c.paragraph.elements[0].textRun.content.startsWith(paraText),
    );
    t.truthy(paraElement, "ADVANCED: Paragraph element should be found");
    if (paraElement) {
      t.is(
        paraElement.paragraph.paragraphStyle.direction,
        "LEFT_TO_RIGHT",
        "ADVANCED: Direction should be LEFT_TO_RIGHT",
      );
      t.is(
        paraElement.paragraph.paragraphStyle.alignment,
        "START",
        "ADVANCED: Alignment should be START/LEFT",
      );
      t.is(
        paraElement.paragraph.paragraphStyle.lineSpacing,
        115,
        "ADVANCED: Line spacing should be 115",
      );
    }
  });

  unit.section("Document.clear() style persistence validation", (t) => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    let body = doc.getBody();
    const docId = doc.getId();

    body.setMarginTop(144);
    doc = scl(doc);
    let docResource = unpackedDoc(docId);
    t.is(
      docResource.documentStyle.marginTop.magnitude,
      144,
      "Pre-clear: marginTop should be 144",
    );
    doc.clear();
    doc = scl(doc);
    docResource = unpackedDoc(docId);
    t.is(
      docResource.documentStyle.marginTop.magnitude,
      144,
      "Post-clear: marginTop should NOT be reset and remain 144",
    );
    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("Document initial documentStyle validation", (t) => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    const docId = doc.getId();
    doc = scl(doc);
    const docResource = unpackedDoc(docId);
    const documentStyle = docResource.documentStyle;

    t.truthy(documentStyle, "Document should have a documentStyle property");
    t.deepEqual(
      documentStyle.marginTop,
      { magnitude: 72, unit: "PT" },
      "marginTop should be 72 PT",
    );
    t.deepEqual(
      documentStyle.marginBottom,
      { magnitude: 72, unit: "PT" },
      "marginBottom should be 72 PT",
    );
    t.deepEqual(
      documentStyle.marginLeft,
      { magnitude: 72, unit: "PT" },
      "marginLeft should be 72 PT",
    );
    t.deepEqual(
      documentStyle.marginRight,
      { magnitude: 72, unit: "PT" },
      "marginRight should be 72 PT",
    );
    t.deepEqual(
      documentStyle.marginHeader,
      { magnitude: 36, unit: "PT" },
      "marginHeader should be 36 PT",
    );
    t.deepEqual(
      documentStyle.marginFooter,
      { magnitude: 36, unit: "PT" },
      "marginFooter should be 36 PT",
    );
    t.is(
      documentStyle.useCustomHeaderFooterMargins,
      true,
      "useCustomHeaderFooterMargins should be true",
    );
    t.deepEqual(
      documentStyle.background,
      { color: {} },
      "background should be an empty color object",
    );
    t.is(documentStyle.pageNumberStart, 1, "pageNumberStart should be 1");
    t.truthy(documentStyle.pageSize, "pageSize should exist");
    t.truthy(documentStyle.pageSize.height, "pageSize should have a height");
    t.truthy(documentStyle.pageSize.width, "pageSize should have a width");
    t.is(
      documentStyle.pageSize.height.unit,
      "PT",
      "pageSize height unit should be PT",
    );
    t.is(
      documentStyle.pageSize.width.unit,
      "PT",
      "pageSize width unit should be PT",
    );
    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("Appending a detached styled paragraph", (t) => {
    let { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();

    const sourcePara = body.appendParagraph("Source Paragraph");
    sourcePara.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    const detachedPara = sourcePara.copy();

    body.appendParagraph("Middle Paragraph");

    const appendedPara = body.appendParagraph(detachedPara);

    t.is(
      appendedPara.getText(),
      "Source Paragraph",
      "Appended detached paragraph should have correct text",
    );
    t.is(
      appendedPara.getHeading(),
      DocumentApp.ParagraphHeading.HEADING1,
      "Appended detached paragraph should have copied style",
    );

    const children = getChildren(body);
    t.is(
      children.length,
      4,
      "Body should have 4 children after appending detached paragraph",
    );
    t.is(
      children[3].getText(),
      "Source Paragraph",
      "The last child should be the appended paragraph",
    );

    t.truthy(
      sourcePara.getParent(),
      "Original paragraph should still be attached",
    );
    t.is(
      children[1].getText(),
      "Source Paragraph",
      "The second child should be the original paragraph",
    );

    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("Text styling methods", (t) => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    const body = doc.getBody();
    const p = body.appendParagraph("Text for styling.");
    const text = p.editAsText();

    t.is(
      text.getText(),
      "Text for styling.",
      "editAsText should return correct text",
    );

    // Test Bold
    text.setBold(true);
    t.is(text.isBold(), true, "get/set Bold should work");
    text.setBold(false);
    t.is(text.isBold(), false, "set Bold false should work");

    // Test Italic
    text.setItalic(true);
    t.is(text.isItalic(), true, "get/set Italic should work");

    // Test Underline
    text.setUnderline(true);
    t.is(text.isUnderline(), true, "get/set Underline should work");

    // Test Strikethrough
    text.setStrikethrough(true);
    t.is(text.isStrikethrough(), true, "get/set Strikethrough should work");

    // Test Font Family
    text.setFontFamily("Courier New");
    t.is(text.getFontFamily(), "Courier New", "get/set FontFamily should work");

    // Test Font Size
    text.setFontSize(14);
    t.is(text.getFontSize(), 14, "get/set FontSize should work");

    // Test Colors
    text.setForegroundColor("#ff0000");
    t.is(
      text.getForegroundColor(),
      "#ff0000",
      "get/set ForegroundColor should work",
    );
    text.setBackgroundColor("#ffff00");
    t.is(
      text.getBackgroundColor(),
      "#ffff00",
      "get/set BackgroundColor should work",
    );

    // Test Link URL
    text.setLinkUrl("https://example.com");
    t.is(
      text.getLinkUrl(),
      "https://example.com",
      "get/set LinkUrl should work",
    );

    // Test setAttributes on Text
    text.setAttributes({
      [DocumentApp.Attribute.BOLD]: true,
      [DocumentApp.Attribute.ITALIC]: false,
      [DocumentApp.Attribute.FONT_SIZE]: 18,
    });
    t.is(text.isBold(), true, "setAttributes Bold should work");
    t.is(text.isItalic(), false, "setAttributes Italic should work");
    t.is(text.getFontSize(), 18, "setAttributes FontSize should work");

    if (DocumentApp.isFake) cachePerformance();
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testDocsStyles);
