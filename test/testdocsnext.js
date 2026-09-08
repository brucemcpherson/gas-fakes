import "@mcpher/gas-fakes";

import { initTests } from "./testinit.js";
import {
  wrapupTest,
  cachePerformance,
  maketdoc,
  docReport,
  getChildren,
  trasher,
  unpackedDoc,
  createTrashCollector,
} from "./testassist.js";
export const testDocsNext = (pack) => {
  const toTrash = createTrashCollector();
  const { unit, fixes } = pack || initTests();

  unit.section("Body.getText() with mixed elements", (t) => {
    let { doc } = maketdoc(toTrash, fixes);
    let body = doc.getBody();

    // 1. Append a variety of elements
    body.appendParagraph("First paragraph.");
    body.appendTable([
      ["R1C1", "R1C2"],
      ["R2C1", "R2C2"],
    ]);
    body.appendListItem("A list item.");
    body.appendParagraph("Final paragraph.");

    // 2. Define the expected text output
    const expected =
      "\n" + // From the initial empty paragraph
      "First paragraph.\n" +
      "R1C1\nR1C2\nR2C1\nR2C2\n\n" + // Table text, with cells and rows joined by newlines, followed by an extra newline from Body.getText() joining
      "A list item.\n" +
      "Final paragraph.";

    t.is(
      body.getText(),
      expected,
      "Body.getText() should correctly concatenate text from mixed elements",
    );

    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("Table.getText()", (t) => {
    let { doc } = maketdoc(toTrash, fixes);
    let body = doc.getBody();

    const cellsData = [
      ["R1C1", "R1C2"],
      ["R2C1", "R2C2"],
    ];
    const table = body.appendTable(cellsData);

    // The live behavior is that cells in a row are joined by \n, and rows are joined by \n.
    const expectedText = "R1C1\nR1C2\nR2C1\nR2C2";
    t.is(
      table.getText(),
      expectedText,
      "getText() should return concatenated text of all cells, separated by newlines",
    );
    const row = table.getRow(0); // This is a TableRow object
    t.is(
      row.getText(),
      "R1C1\nR1C2",
      "TableRow.getText() should join cell text with newlines",
    );
    const cell = row.getCell(1);
    t.is(
      cell.getText(),
      "R1C2",
      "TableCell.getText() should return the cell's text",
    );

    // Test with an empty table
    const emptyTable = body.appendTable();
    t.is(
      emptyTable.getText(),
      "",
      "getText() on an empty table should return an empty string",
    );
    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("Body.appendTable and Body.insertTable", (t) => {
    let { doc } = maketdoc(toTrash, fixes);
    let body = doc.getBody();

    // we have something here we cant acchieve in the api
    // apps script can write an empty table stub
    // the api cant https://github.com/brucemcpherson/gas-fakes/issues/42
    const table0 = body.appendTable();
    if (DocumentApp.isFake) {
      t.is(table0.getNumRows(), 1, "Default appended fake table has 1 row");
      t.is(
        table0.getRow(0).getNumCells(),
        1,
        "Default appended table has 1 cell",
      );
      t.is(
        table0.getRow(0).getCell(0).getText(),
        "",
        "Default appended table cell is empty",
      );
    } else {
      t.is(table0.getNumRows(), 0, "apps script can create an empty");
    }

    // 1. Append a table with content
    const cellsData = [
      ["R1C1", "R1C2"],
      ["R2C1", "R2C2"],
    ];
    const table1 = body.appendTable(cellsData);

    t.is(
      table1.getType(),
      DocumentApp.ElementType.TABLE,
      "appendTable should return a Table element",
    );
    t.truthy(table1.getParent(), "Appended table should have a parent");
    t.is(
      table1.getParent().getType(),
      DocumentApp.ElementType.BODY_SECTION,
      "Table's parent should be the body",
    );

    // Verify structure and content
    t.is(table1.getNumRows(), 2, "Table should have 2 rows");
    const row1 = table1.getRow(0);
    t.is(row1.getNumCells(), 2, "Row 0 should have 2 cells");
    t.is(
      row1.getCell(0).getText(),
      cellsData[0][0],
      "Cell (0,0) should have correct text",
    );
    const row2 = table1.getRow(1);
    t.is(
      row2.getCell(1).getText(),
      cellsData[1][1],
      "Cell (1,1) should have correct text",
    );

    // 2. insert a table with data
    const cellsData2 = [
      ["00", "01", "02"],
      ["10", "11", "12"],
      ["20", "21", "22"],
    ];
    const table2 = body.insertTable(1, cellsData2);

    const checkTableContent = (table, data, tag = "") => {
      t.is(
        table.getType(),
        DocumentApp.ElementType.TABLE,
        `${tag}check should be table`,
      );
      t.is(
        table.getNumRows(),
        data.length,
        `${tag}Table should have the correct number of rows`,
      );
      const d2 = data.map((_, r) => {
        const rx = table.getRow(r);
        return Array.from({ length: rx.getNumCells() }).map((_, c) => {
          return rx.getCell(c).getText();
        });
      });
      t.deepEqual(d2, data, `${tag}Table cells retrieved successfully`);
    };
    checkTableContent(table2, cellsData2, "table2:");
    const c2 = body.getChild(1);
    checkTableContent(c2, cellsData2, "child2:");

    // 3. Insert a copied table
    const table3_copy = table1.copy(); // create a detached copy of the first table with data
    checkTableContent(table3_copy, cellsData, "table3_copy:");
    body.insertTable(1, table3_copy);

    const children3 = getChildren(body);
    const c3 = children3[1];
    checkTableContent(c3, cellsData, "child3:");

    // 4. Error conditions
    const attemptAttachedInsert = () => body.insertTable(1, table1);
    t.rxMatch(
      t.threw(attemptAttachedInsert)?.message || "no error thrown",
      /Element must be detached./,
      "Inserting an already attached table should throw an error",
    );

    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("Body.appendPageBreak and Body.insertPageBreak", (t) => {
    let { doc } = maketdoc(toTrash, fixes);
    let body = doc.getBody();

    // 1. Append
    body.appendParagraph("p1");
    const pb1 = body.appendPageBreak();

    body.appendParagraph("p2");

    t.is(
      pb1.getType(),
      DocumentApp.ElementType.PAGE_BREAK,
      "appendPageBreak should return a PageBreak element",
    );
    t.truthy(pb1.getParent(), "Appended page break should have a parent");
    // In the live environment, the parent of a PageBreak is the Paragraph that contains it.
    const pb1Parent = pb1.getParent();
    t.is(
      pb1Parent.getType(),
      DocumentApp.ElementType.PARAGRAPH,
      "Page break parent should be a Paragraph",
    );
    t.is(
      pb1Parent.getParent().getType(),
      DocumentApp.ElementType.BODY_SECTION,
      "Page break's grandparent should be the body",
    );

    const children = getChildren(body);
    t.is(
      children.length,
      4,
      "Body should have 4 children (empty para, p1, page break, p2)",
    );
    const pageBreakPara = children[2];
    // The element that is a direct child of the body is a Paragraph.
    t.is(
      pageBreakPara.getType(),
      DocumentApp.ElementType.PARAGRAPH,
      "The element in the body is a Paragraph",
    );
    t.is(
      pageBreakPara.getText(),
      "",
      "Paragraph containing a page break has empty text",
    );
    t.is(
      pageBreakPara.getNumChildren(),
      1,
      "The paragraph should contain one child element",
    );
    t.is(
      pageBreakPara.getChild(0).getType(),
      DocumentApp.ElementType.PAGE_BREAK,
      "The paragraph's child should be a PageBreak",
    );

    // 2. Insert
    const pb2 = body.appendPageBreak().copy(); // create a detached page break
    // The test fails on live GAS here because you can't remove the last paragraph.
    // We'll leave the temporary paragraph and adjust the test expectations.
    body.insertPageBreak(1, pb2); // insert after the initial empty paragraph
    const children2 = getChildren(body);
    t.is(children2.length, 6, "Body should have 6 children after insert");
    t.is(
      children2[1].getType(),
      DocumentApp.ElementType.PARAGRAPH,
      "Second child should be the inserted page break's paragraph",
    );

    // Each paragraph, including empty ones and those containing only a page break,
    // contributes a newline when calling body.getText().
    t.is(
      body.getText(),
      "\n\np1\n\np2\n",
      "Text content should reflect inserted page break",
    );

    // 3. Error conditions
    const attemptAttachedInsert = () => body.insertPageBreak(1, pb1);
    t.rxMatch(
      t.threw(attemptAttachedInsert)?.message || "no error thrown",
      /Element must be detached./,
      "Inserting an already attached page break should throw an error",
    );
    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("Body.insertParagraph method", (t) => {
    // Test 1: Insert in the middle
    let { doc } = maketdoc(toTrash, fixes);
    let body = doc.getBody();
    body.appendParagraph("p1");
    body.appendParagraph("p3");
    const p2 = body.appendParagraph("p2").copy(); // Creates a detached copy of a "p2" paragraph
    // The body has 3 children: [empty, p1, p3]. Index 2 is before p3.
    body.insertParagraph(2, p2); // body is now [empty, p1, p2(copy), p3, p2]

    t.is(body.getText(), "\np1\np2\np3\np2", "Insert in the middle");

    // Test 2: Insert at the beginning
    doc.clear();
    body = doc.getBody();
    body.appendParagraph("p1");
    const p0 = body.appendParagraph("p0").copy();
    // The body has 3 children: [empty, p1, p0]. Index 1 is before p1.

    body.insertParagraph(1, p0);
    t.is(body.getText(), "\np0\np1\np0", "Insert at the beginning");

    // Test 3: Insert at the end (should behave like append)
    doc.clear();
    body = doc.getBody();
    body.appendParagraph("p1");
    const p2_end = body.appendParagraph("p2").copy();
    body.insertParagraph(body.getNumChildren(), p2_end);
    t.is(body.getText(), "\np1\np2\np2", "Insert at the end");

    // Test 4: Error conditions
    doc.clear();
    body = doc.getBody();
    const p_attached = body.appendParagraph("attached");
    const p_detached = p_attached.copy();

    const attemptInvalidIndex = () => body.insertParagraph(99, p_detached);
    t.rxMatch(
      t.threw(attemptInvalidIndex)?.message || "no error thrown",
      /must be less than or equal to the number of child elements/,
      "Inserting at an out-of-bounds index should throw an error",
    );

    const attemptInvalidType = () => body.insertParagraph(1, doc.getBody()); // Not a paragraph
    t.rxMatch(
      t.threw(attemptInvalidType)?.message || "no error thrown",
      /The parameters .* don't match the method signature/,
      "Inserting a non-paragraph element should throw an error",
    );
    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("Complex paragraph insertion with styles", (t) => {
    let { doc } = maketdoc(toTrash, fixes);
    let body = doc.getBody();

    // 1. Create and style a paragraph to be copied.
    body.appendParagraph("Bold and Italic");

    // On live GAS, changes made via DocumentApp might not be immediately visible to the Docs API.
    // We need to save and close the document to ensure the advanced service can see the new paragraph.
    const docId = doc.getId();
    doc.saveAndClose();

    // Now, get the document structure using the advanced service to find the paragraph we just added.
    const docResource = unpackedDoc(docId);
    const content = docResource.body.content;
    const sourceParaItem = [...content]
      .reverse()
      .find(
        (se) =>
          se.paragraph &&
          se.paragraph.elements.some(
            (e) => e.textRun && e.textRun.content.includes("Bold and Italic"),
          ),
      );
    t.truthy(
      sourceParaItem,
      "Should find the newly appended paragraph via advanced service",
    );

    // Use advanced service to style it
    const requests = [
      {
        updateTextStyle: {
          range: {
            startIndex: sourceParaItem.startIndex,
            endIndex: sourceParaItem.endIndex - 1, // -1 to exclude the trailing newline
          },
          textStyle: {
            bold: true,
            italic: true,
            foregroundColor: {
              color: {
                rgbColor: { red: 1, green: 0, blue: 0 }, // Red
              },
            },
          },
          fields: "bold,italic,foregroundColor",
        },
      },
      {
        updateParagraphStyle: {
          range: {
            startIndex: sourceParaItem.startIndex,
            endIndex: sourceParaItem.endIndex,
          },
          paragraphStyle: {
            alignment: "CENTER",
          },
          fields: "alignment",
        },
      },
    ];
    Docs.Documents.batchUpdate({ requests }, docId);

    // 2. Get a fresh reference to the styled paragraph and copy it.
    // On live GAS, changes made via the advanced service might not be immediately visible to DocumentApp.
    // Re-opening the document is the safest way to get the latest state.

    body = DocumentApp.openById(docId).getBody(); // Re-fetch to get latest state
    const styledPara = body.getChild(1); // The styled paragraph is now the second child
    const detachedPara = styledPara.copy();

    // 3. Insert the detached copy at the beginning of the body (after the initial empty para).
    body.insertParagraph(1, detachedPara);

    // 4. Verification of text content
    const expectedText = "\nBold and Italic\nBold and Italic";
    t.is(
      body.getText(),
      expectedText,
      "Text content should include original and inserted complex paragraph",
    );

    // 5. Advanced verification of styles
    const finalDocResource = unpackedDoc(doc.getId());
    const finalContent = finalDocResource.body.content;

    // The inserted paragraph should be at index 1 (after the initial empty one)
    // Its start index will be 2, because the first empty para is \n (startIndex: 1, endIndex: 2)
    const insertedParaElement = finalContent.find(
      (c) => c.paragraph && c.startIndex === 2,
    );
    t.truthy(
      insertedParaElement,
      "Inserted paragraph element should be found in the document structure",
    );

    if (insertedParaElement) {
      // Check paragraph style
      const paraStyle = insertedParaElement.paragraph.paragraphStyle;
      t.is(
        paraStyle.alignment,
        "CENTER",
        "Inserted paragraph should have CENTER alignment",
      );

      // Check text style
      const textRun = insertedParaElement.paragraph.elements.find(
        (e) => e.textRun && e.textRun.content.startsWith("Bold"),
      );
      t.truthy(textRun, "Inserted paragraph should have a textRun");
      if (textRun) {
        const style = textRun.textRun.textStyle;
        t.is(style.bold, true, "Inserted paragraph text should be bold");
        t.is(style.italic, true, "Inserted paragraph text should be italic");
        t.is(
          style.foregroundColor.color.rgbColor.red,
          1,
          "Inserted paragraph text should be red",
        );
      }
    }
    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("Element.copy() and detached elements", (t) => {
    const { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();

    // 1. Append an initial paragraph
    const p1Text = "This is the first paragraph.";
    const p1 = body.appendParagraph(p1Text);
    t.is(body.getText(), "\n" + p1Text, "Body should have the first paragraph");

    // 2. Create a detached copy
    const p1Copy = p1.copy();
    t.is(
      p1Copy.toString(),
      "Paragraph",
      "The copy should be a Paragraph object",
    );
    t.is(
      p1Copy.getText(),
      p1Text,
      "The copy should have the same text content",
    );
    t.is(
      p1Copy.getParent(),
      null,
      "A copied element should be detached (no parent)",
    );

    // 3. Append the detached copy
    body.appendParagraph(p1Copy);
    const expectedText = "\n" + p1Text + "\n" + p1Text;
    t.is(
      body.getText(),
      expectedText,
      "Body should contain both original and copied paragraph text",
    );

    // 4. Verify the original element is unchanged and still attached
    t.truthy(
      p1.getParent(),
      "The original element should still be attached to the document",
    );
    t.is(
      p1.getText(),
      p1Text,
      "The original element's text should be unchanged",
    );
    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("Body.appendParagraph method", (t) => {
    const { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();

    // On a new doc, the body is empty.
    t.is(body.getText(), "", "New document body should be empty.");

    // Test 1: Appending a string.
    const p1Text = "p1";
    const p2Text = "p2";
    const p3Text = "p3";
    const texts = [p1Text, p2Text, p3Text];
    const p1 = body.appendParagraph(p1Text);
    const p2 = body.appendParagraph(p2Text);
    const p3 = body.appendParagraph(p3Text);

    // a concatanated body will prepend each paragraph with a \n
    const expectedText1 = "\n" + texts.join("\n");

    t.is(
      body.getType(),
      DocumentApp.ElementType.BODY_SECTION,
      "body should be a body",
    );
    t.is(body.getText(), expectedText1, "Body text after all appends");
    t.is(
      p1.getText(),
      p1Text,
      "Returned paragraph object should have correct text",
    );
    t.is(
      p1.toString(),
      "Paragraph",
      "appendParagraph(string) should return a Paragraph object",
    );

    // Test 3: Ensure that attempting to append an already attached paragraph throws an error
    const attemptAttachedAppend = () => {
      body.appendParagraph(p1);
    };

    t.rxMatch(
      t.threw(attemptAttachedAppend)?.message || "no error thrown",
      /Element must be detached./,
      'Appending an already attached paragraph should throw an "Element must be detached" error',
    );

    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("newRange and builders", (t) => {
    const { doc } = maketdoc(toTrash, fixes);
    const rangeBuilder = doc.newRange();
    t.is(
      rangeBuilder.toString(),
      "RangeBuilder",
      "newRange should return a RangeBuilder",
    );

    // Test with no elements
    const emptyRange = rangeBuilder.build();
    t.is(
      emptyRange.toString(),
      "Range",
      "build() on empty builder returns a Range",
    );
    t.is(
      emptyRange.getRangeElements().length,
      0,
      "empty range has 0 range elements",
    );

    // Create some elements to add to the range using the public API
    const body = doc.getBody();
    const el1 = body.appendParagraph("p1");
    const el2 = body.appendParagraph("p2");
    const el3 = body.appendParagraph("p3");

    // Test addElement, chaining, and build
    rangeBuilder.addElement(el1).addElement(el2);
    const builtRange = rangeBuilder.build();
    t.is(
      builtRange.getRangeElements().length,
      2,
      "built range should have 2 range elements",
    );
    t.deepEqual(
      builtRange.getRangeElements().map((re) => re.getElement().getText()),
      ["p1", "p2"],
      "getText() should return correct text for elements in order",
    );

    // Test addRange
    const anotherRange = doc.newRange().addElement(el3).build();
    rangeBuilder.addRange(anotherRange);
    const finalRange = rangeBuilder.build();
    t.is(
      finalRange.getRangeElements().length,
      3,
      "addRange should add elements from another range",
    );
    t.deepEqual(
      finalRange.getRangeElements().map((re) => re.getElement().getText()),
      ["p1", "p2", "p3"],
      "final range should contain all elements",
    );
    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("Document empty document validation", (t) => {
    let { doc, docName } = maketdoc(toTrash, fixes);

    // an empty doc - re-fetch body after modifications
    Utilities.sleep(1000); // wait for the document to be fully initialized
    let body = doc.getBody();
    t.is(doc.getName(), docName, "Document should have the correct name");

    // even though it actually has 2, See issue https://issuetracker.google.com/issues/432432968
    t.is(body.getNumChildren(), 1, "an empty docs should have 1 child");

    // at this point any changes made by documentapp wont be visible by adv service, so
    doc.saveAndClose();
    doc = DocumentApp.openById(doc.getId());
    body = doc.getBody();

    const adoc = unpackedDoc(doc.getId());
    t.is(
      adoc.body.content.length,
      2,
      "in reality - an empty doc has 2 children",
    );

    // document app will skip the section break
    const children = getChildren(body);
    t.is(children.length, 1, "an empty docs should have 1 child");

    // only a paragraph in a blank document
    const paragraph = children[0];
    t.is(
      paragraph.getType(),
      DocumentApp.ElementType.PARAGRAPH,
      "paragraph should be a paragraph",
    );
    t.is(paragraph.getText(), "", "paragraph should be empty");

    // append a paragraph
    const pt = "p1";
    const p1 = body.appendParagraph(pt);

    // After the first append, the body contains 2 paragraphs
    // in other words it doesn't replace the 1stempty  paragraph as we'd expect
    body = doc.getBody(); // Re-fetch body to ensure we have the latest state.
    const c2 = getChildren(body);
    t.is(
      c2.length,
      2,
      "After appending to the initial empty paragraph, there should be 2 children.",
    );

    const p1c = c2[0];
    t.is(p1c.getText(), "");
    const p2c = c2[1];
    t.is(p2c.getText(), p1.getText());
    t.is(p1.getText(), pt);
    if (DocumentApp.isFake) cachePerformance();
  });

  unit.section("Document initial namedStyles validation", (t) => {
    let { doc } = maketdoc(toTrash, fixes);

    // Re-fetch the document using the advanced Docs service to get the full document structure
    const docResource = unpackedDoc(doc.getId());

    const styles = docResource.namedStyles.styles;

    t.truthy(styles, "Document should have a namedStyles.styles property");
    t.is(styles.length, 9, "There should be 9 default named styles");

    // Helper to find a style by its type
    const findStyle = (type) => styles.find((s) => s.namedStyleType === type);

    // Validate NORMAL_TEXT
    const normalText = findStyle("NORMAL_TEXT");
    t.truthy(normalText, "Should find NORMAL_TEXT style");
    t.is(
      normalText.textStyle.fontSize.magnitude,
      11,
      "NORMAL_TEXT font size should be 11",
    );
    t.is(
      normalText.textStyle.weightedFontFamily.fontFamily,
      "Arial",
      "NORMAL_TEXT font family should be Arial",
    );
    t.is(
      normalText.paragraphStyle.lineSpacing,
      115,
      "NORMAL_TEXT line spacing should be 115",
    );

    // Validate HEADING_1
    const heading1 = findStyle("HEADING_1");
    t.truthy(heading1, "Should find HEADING_1 style");
    t.is(
      heading1.textStyle.fontSize.magnitude,
      20,
      "HEADING_1 font size should be 20",
    );
    t.is(
      heading1.paragraphStyle.spaceAbove.magnitude,
      20,
      "HEADING_1 spaceAbove should be 20 PT",
    );

    // Validate HEADING_3
    const heading3 = findStyle("HEADING_3");
    t.truthy(heading3, "Should find HEADING_3 style");
    const h3Color = heading3.textStyle.foregroundColor.color.rgbColor;
    // Use t.is with a tolerance for floating point comparisons
    t.is(
      h3Color.red.toPrecision(7),
      "0.2627451",
      "HEADING_3 red color should be correct",
    );

    // Validate HEADING_6
    const heading6 = findStyle("HEADING_6");
    t.truthy(heading6, "Should find HEADING_6 style");
    t.true(heading6.textStyle.italic, "HEADING_6 should be italic");

    // Validate TITLE
    const titleStyle = findStyle("TITLE");
    t.truthy(titleStyle, "Should find TITLE style");
    t.is(
      titleStyle.textStyle.fontSize.magnitude,
      26,
      "TITLE font size should be 26",
    );

    if (DocumentApp.isFake) cachePerformance();
  });

  // Helper to extract text from a raw Docs API document resource, mimicking Document.getBody().getText()
  const getTextFromDocResource = (docResource) => {
    return docResource?.body?.content
      ?.map(
        (structuralElement) =>
          structuralElement.paragraph?.elements
            ?.map((element) => element.textRun?.content || "")
            .join("") || "",
      )
      .join("")
      .replace(/\n$/, "");
  };

  unit.section("Document.clear method", (t) => {
    const { doc, docName } = maketdoc(toTrash, fixes);

    // Use the advanced service to insert text, making the test independent of appendParagraph implementation.
    const text = "Hello World.\nThis is the second line.";
    const requests = [
      {
        insertText: {
          location: { index: 1 }, // Insert at the beginning of the body
          text,
        },
      },
    ];
    Docs.Documents.batchUpdate({ requests }, doc.getId());

    // this is required on live apps script, because we've already opened this document with DocumentApp
    // and it is unaware of things that happen via advanced services
    doc.saveAndClose();

    // Re-fetch the document using the advanced Docs service to ensure the changes are applied.
    const fetchedDoc = unpackedDoc(doc.getId());
    t.is(
      getTextFromDocResource(fetchedDoc),
      text,
      "checking that adv applied the change",
    );

    // Re-fetch the DocumentApp object to ensure its internal __doc is updated.
    const updatedDoc = DocumentApp.openById(doc.getId());
    t.is(
      updatedDoc.getBody().getText(),
      text,
      "Content should be present before clearing.",
    );

    // Test the clear() method
    updatedDoc.clear();
    t.is(
      updatedDoc.getBody().getText(),
      "",
      "Content should be empty after calling clear().",
    );

    // Test that appendParagraph works after clearing
    const text2 = "A new paragraph.";
    updatedDoc.getBody().appendParagraph(text2);

    // After clearing and appending, the text should just be the new text.
    t.is(
      updatedDoc.getBody().getText(),
      "\n" + text2,
      "Appending a paragraph after clearing should work.",
    );

    // Re-fetch the document to ensure its internal __doc is updated.
    const updatedDoc2 = DocumentApp.openById(updatedDoc.getId());
    t.is(
      updatedDoc2.getBody().getText(),
      "\n" + text2,
      "Content should be present after appending.",
    );

    // Test that appendParagraph works after clearing
    updatedDoc.getBody().appendParagraph("A new paragraph2.");
    updatedDoc.clear();
    t.is(
      updatedDoc.getBody().getText(),
      "",
      "Clearing after appending should work.",
    );

    // Test clearing an already-cleared document
    updatedDoc.clear(); // Should not throw an error
    t.is(
      updatedDoc.getBody().getText(),
      "",
      "Content should remain empty after clearing again.",
    );

    if (DocumentApp.isFake) cachePerformance();
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testDocsNext);
