
import '@mcpher/gas-fakes'

import { initTests } from "./testinit.js";
import { cachePerformance, maketdoc, getChildren, wrapupTest, trasher } from "./testassist.js";


export const testDocsImages = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();


  unit.section("Paragraph.appendInlineImage and Paragraph.insertInlineImage", t => {
    const { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();

    // 1. Create a source image and a paragraph to work with
    const imageUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
    const imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();
    const sourceImage = body.appendImage(imageBlob); // body.appendImage returns an InlineImage
    const para = body.appendParagraph("Some text. ");

    // 2. Test appendInlineImage
    const detachedImage1 = sourceImage.copy();
    const appendedImage = para.appendInlineImage(detachedImage1);

    // Paragraph should now have 2 children: a Text element and an InlineImage element.
    t.is(para.getNumChildren(), 2, "Paragraph should have 2 children after appendImage");
    t.is(para.getChild(0).getType(), DocumentApp.ElementType.TEXT, "First child should be Text");
    t.is(para.getChild(1).getType(), DocumentApp.ElementType.INLINE_IMAGE, "Second child should be an InlineImage");
    t.is(appendedImage.getType(), DocumentApp.ElementType.INLINE_IMAGE, "appendInlineImage should return an InlineImage");
    t.is(para.getText(), "Some text. ", "Text content of paragraph should not include image");

    // 3. Test insertInlineImage
    const detachedImage2 = sourceImage.copy();
    const insertedImage = para.insertInlineImage(0, detachedImage2); // Insert at the beginning

    t.is(para.getNumChildren(), 3, "Paragraph should have 3 children after insertImage");
    t.is(para.getChild(0).getType(), DocumentApp.ElementType.INLINE_IMAGE, "First child should now be the inserted image");
    t.is(para.getChild(1).getType(), DocumentApp.ElementType.TEXT, "Second child should be the original text");
    t.is(para.getChild(2).getType(), DocumentApp.ElementType.INLINE_IMAGE, "Third child should be the appended image");
    t.is(insertedImage.getType(), DocumentApp.ElementType.INLINE_IMAGE, "insertInlineImage should return an InlineImage");

    // 4. Test chaining
    const para2 = body.appendParagraph("Chain test. ");
    const detachedImage3 = sourceImage.copy();
    const returnedImage = para2.appendInlineImage(detachedImage3);
    t.is(returnedImage.toString(), 'InlineImage', "appendInlineImage should return the InlineImage");
    t.is(para2.getChildIndex(returnedImage), 1, "The returned image should be the new child of the paragraph");

    // 5. Error conditions
    const attachedImage = para.getChild(0);
    t.rxMatch(t.threw(() => para.appendInlineImage(attachedImage))?.message || 'no error thrown', /Element must be detached./, "Appending an already attached image should throw an error");
  });

  unit.section("Body.appendImage and Body.insertImage", t => {
    // Using a reused document for this test. The more complex insertImage behavior is tested separately.
    let { doc } = maketdoc(toTrash, fixes);
    let body = doc.getBody();

    // 1. We need an image to copy. Let's append one using the advanced service.
    // This is a known public image URL.
    // Using a static Google image is more reliable for tests than picsum.photos
    const imageUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
    // const imageUrl = "https://picsum.photos/200"
    const requests = [{
      insertInlineImage: {
        location: { index: 1 },
        uri: imageUrl,
        objectSize: {
          height: { magnitude: 50, unit: 'PT' },
          width: { magnitude: 136, unit: 'PT' }
        }
      }
    }];
    Docs.Documents.batchUpdate({ requests }, doc.getId());
    doc.saveAndClose(); // Ensure changes are saved

    // 2. Re-open and get the image to copy it
    doc = DocumentApp.openById(doc.getId());
    body = doc.getBody();
    // The image is in the first paragraph (which was the initial empty one)
    const sourceImagePara = body.getChild(0);
    const sourceImage = sourceImagePara.getChild(0);
    t.is(sourceImage.getType(), DocumentApp.ElementType.INLINE_IMAGE, "Should have an image to copy");

    // The live API may resize the initial image. We'll use its actual dimensions as the baseline for tests.
    const actualInitialWidth = sourceImage.getWidth();
    const actualInitialHeight = sourceImage.getHeight();

    const detachedImage = sourceImage.copy();
    t.is(detachedImage.getParent(), null, "Copied image should be detached");

    t.is(detachedImage.getWidth(), actualInitialWidth, "Detached image should retain its width property from source");
    t.is(detachedImage.getHeight(), actualInitialHeight, "Detached image should retain its height property from source");

    // Test setters on the attached source image
    // Setters are not implemented due to API limitations. See https://issuetracker.google.com/issues/172423234
    // The fake environment throws, but the live one fails silently.
    if (DocumentApp.isFake) {
      t.rxMatch(t.threw(() => sourceImage.setWidth(150))?.message || 'no error thrown', /not yet implemented/, "setWidth should throw not implemented");
    }

    // 3. Append the copied image
    body.appendParagraph("Some text before.");
    const appendedImage = body.appendImage(detachedImage);

    t.is(appendedImage.getType(), DocumentApp.ElementType.INLINE_IMAGE, "appendImage should return an InlineImage");
    t.truthy(appendedImage.getParent(), "Appended image should have a parent paragraph");
    t.is(appendedImage.getParent().getType(), DocumentApp.ElementType.PARAGRAPH, "Appended image's parent should be a paragraph");
    t.is(appendedImage.getParent().getParent().getType(), DocumentApp.ElementType.BODY_SECTION, "Appended image's grandparent should be the body");
    // The appended image is a copy of the *original* source image.
    t.is(appendedImage.getHeight(), actualInitialHeight, "Appended image should have the original height");

    const children = getChildren(body);
    // [source_img_para, text_para, appended_img_para]
    t.is(children.length, 3, "Body should have 3 children after appendImage");
    const appendedImagePara = children[2];
    t.is(appendedImagePara.getNumChildren(), 1, "Paragraph for appended image should have 1 child");
    t.is(appendedImagePara.getChild(0).getType(), DocumentApp.ElementType.INLINE_IMAGE, "Child of paragraph should be the image");

    // 5. Error conditions
    // The fake environment correctly throws errors for these, but the live one fails silently.
    if (DocumentApp.isFake) {
      const attemptAttachedInsert = () => body.insertImage(1, sourceImage);
      t.rxMatch(t.threw(attemptAttachedInsert)?.message || 'no error thrown', /Element must be detached./, "Inserting an already attached image should throw an error");
      t.rxMatch(t.threw(() => detachedImage.setWidth(100))?.message || 'no error thrown', /Cannot modify a detached element./, "Setting width on a detached image should still throw the correct error");
    }

    // 6. Test appending a blob
    const blobUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
    const imageBlob = UrlFetchApp.fetch(blobUrl).getBlob();
    imageBlob.setName('drive_logo.png'); // Blobs need a name for some operations

    const appendedFromBlob = body.appendImage(imageBlob);
    t.is(appendedFromBlob.getType(), DocumentApp.ElementType.INLINE_IMAGE, "appendImage(blob) should return an InlineImage");
    t.truthy(appendedFromBlob.getParent(), "Image from blob should have a parent paragraph");
    
    const childrenAfterBlob = getChildren(body);
    // [source_img_para, text_para, appended_img_para, appended_from_blob_para]
    t.is(childrenAfterBlob.length, 4, "Body should have correct number of children after appendImage(blob)");
    const blobPara = childrenAfterBlob[3];
    t.is(blobPara.getChild(0).getType(), DocumentApp.ElementType.INLINE_IMAGE, "Paragraph for blob image should contain an image");
    t.truthy(blobPara.getChild(0).getWidth() > 0, "Image from blob should have a width");

    // 7. Test blob validation
    const invalidTypeBlob = Utilities.newBlob("not an image", "text/plain", "invalid.txt");
    t.rxMatch(
      t.threw(() => body.appendImage(invalidTypeBlob))?.message || 'no error thrown',
      /(Unsupported image type: text\/plain|Invalid image data.)/,
      "Should throw error for unsupported blob MIME type"
    );

    // Create a large blob ( > 50MB)
    // To avoid memory issues, create a small blob and mock its size for the test.
    const largeBlob = Utilities.newBlob([0], 'image/png', 'large.png');
    if (DocumentApp.isFake) {
      // In the fake environment, we can mock getBytes to simulate a large file without allocating memory.
      largeBlob.getBytes = () => ({ length: 51 * 1024 * 1024 + 1 });
    } else {
      // On live GAS, we can't mock. We'll skip this specific size check.
      // The live environment will throw its own error for oversized blobs anyway, but it's hard to test without memory issues.
      console.log("Skipping oversized blob test on live GAS due to memory constraints.");
      if (DocumentApp.isFake) cachePerformance()
      return; // End this test section for live GAS
    }
    t.rxMatch(
      t.threw(() => body.appendImage(largeBlob))?.message || 'no error thrown',
      /exceeds the 50 MB limit/,
      "Should throw error for oversized blob"
    );

      if (DocumentApp.isFake) cachePerformance()
  });

  unit.section("insertImage behavior on new documents", t => {
    // This test uses a fresh document to isolate the behavior of insertImage,
    // which appears to differ on new vs. reused documents in the live environment.
    const { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    const body = doc.getBody();

    // 1. Create a source image with a known size.
    const imageUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
    const requests = [{
      insertInlineImage: {
        location: { index: 1 },
        uri: imageUrl,
        objectSize: {
          height: { magnitude: 61, unit: 'PT' }, // Use a distinct size
          width: { magnitude: 181, unit: 'PT' }
        }
      }
    }];
    Docs.Documents.batchUpdate({ requests }, doc.getId());
    doc.saveAndClose();

    // 2. Re-open, get the source image, and copy it.
    const reloadedDoc = DocumentApp.openById(doc.getId());
    const reloadedBody = reloadedDoc.getBody();
    const sourceImage = reloadedBody.getChild(0).getChild(0);
    const actualInitialWidth = sourceImage.getWidth();
    const actualInitialHeight = sourceImage.getHeight();
    const detachedImage = sourceImage.copy();

    // 3. Insert the copy into a new paragraph.
    reloadedBody.insertImage(1, detachedImage);

    // 4. Assert the dimensions.
    const insertedImagePara = reloadedBody.getChild(1);
    const insertedImage = insertedImagePara.getChild(0);

    if (DocumentApp.isFake) {
      // The fake environment should correctly respect the dimensions of the copied object.
      t.is(insertedImage.getWidth(), actualInitialWidth, "Fake env: Inserted image width should match copied object");
      t.is(insertedImage.getHeight(), actualInitialHeight, "Fake env: Inserted image height should match copied object");
    } else {
      // The live API has proven to be inconsistent, returning different dimensions on different runs.
      // Instead of asserting a brittle, fixed value, we'll perform a more robust check on the aspect ratio.
      const actualWidth = insertedImage.getWidth();
      const actualHeight = insertedImage.getHeight();
      t.true(actualWidth > 0, "Live env: Inserted image should have a positive width");
      t.true(actualHeight > 0, "Live env: Inserted image should have a positive height");

      const expectedAspectRatio = 544 / 184; // Intrinsic aspect ratio of the google logo
      const actualAspectRatio = actualWidth / actualHeight;
      const tolerance = 0.1; // Allow 10% tolerance for rounding/API differences
      t.true(Math.abs(actualAspectRatio - expectedAspectRatio) < tolerance, `Live env: Aspect ratio (${actualAspectRatio.toFixed(2)}) should be close to expected (~${expectedAspectRatio.toFixed(2)})`);
    }
  });



  unit.section("Positioned Images", t => {
    const { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();
    const para = body.appendParagraph("This paragraph has a positioned image.");

    const imageUrl = 'https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png';
    const imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();

    // Test addPositionedImage
    if (DocumentApp.isFake) {
      // This method is not emulatable in the fake environment because there is no public API.
      const expectedError = /Paragraph.addPositionedImage is not yet implemented/;
      t.rxMatch(t.threw(() => para.addPositionedImage(imageBlob))?.message || 'no error thrown', expectedError, "addPositionedImage should throw in fake environment");
    } else {
      // Test on the live environment
      const posImage = para.addPositionedImage(imageBlob);
      t.is(posImage.toString(), 'PositionedImage', "addPositionedImage should return a PositionedImage on live");
      t.true(posImage.getWidth() > 0, "Live positioned image should have a width");

      // Verify with getPositionedImages
      const images = para.getPositionedImages();
      t.is(images.length, 1, "Paragraph should report 1 positioned image after adding");
      t.is(images[0].getId(), posImage.getId(), "Retrieved image should have the same ID as the added one");
    }

    // Test getPositionedImages on a pre-existing document
    const testDocId = fixes.TEST_DOC_WITH_POS_IMAGE_ID;
    // The build script might pass "''" or an empty string if the env var is not set.
    if (!testDocId || testDocId === "''") {
      console.log("Skipping getPositionedImages test: TEST_DOC_WITH_POS_IMAGE_ID not set in .env");
      return;
    }

    // In sandbox mode, we need to allow access to this specific file.


    try {
      const testDoc = DocumentApp.openById(testDocId);
      const testBody = testDoc.getBody();
      const children = getChildren(testBody);
      const paraWithImage = children.find(p => p.getType() === DocumentApp.ElementType.PARAGRAPH && p.getText().includes("This paragraph has a positioned image."));

      t.truthy(paraWithImage, "Should find the paragraph with the positioned image in the test doc");
      if (!paraWithImage) return;

      const positionedImages = paraWithImage.getPositionedImages();
      t.is(positionedImages.length, 1, "Should find one positioned image in the test doc");

      if (positionedImages.length > 0) {
        const image = positionedImages[0];
        t.is(image.toString(), 'PositionedImage', "Object from test doc should be a PositionedImage");
        t.true(image.getWidth() > 0, "Image from test doc should have a width");
        t.true(image.getHeight() > 0, "Image from test doc should have a height");
        t.is(image.getLayout(), DocumentApp.PositionedLayout.WRAP_TEXT, "Image from test doc should have WRAP_TEXT layout");
        const blob = image.getBlob();
        t.is(blob.getContentType(), 'image/png', "Blob content type should be correct (assuming PNG)");
      }
    } finally {

    }
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testDocsImages);