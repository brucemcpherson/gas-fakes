import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testSlidesSlide = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Slide class methods', (t) => {
    const presName = `gas-fakes-test-slide-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    // Test getSlides() and appendSlide()
    const initialSlides = pres.getSlides();
    t.is(initialSlides.length, 1, 'New presentation should have 1 slide by default');

    const slide2 = pres.appendSlide();
    const slidesAfterAppend = pres.getSlides();
    t.is(slidesAfterAppend.length, 2, 'Presentation should have 2 slides after append');
    t.is(slide2.getObjectId(), slidesAfterAppend[1].getObjectId(), 'Appended slide should be the last slide');

    // Test insertSlide()
    const slide3 = pres.insertSlide(1);
    const slidesAfterInsert = pres.getSlides();
    t.is(slidesAfterInsert.length, 3, 'Presentation should have 3 slides after insert');
    t.is(slide3.getObjectId(), slidesAfterInsert[1].getObjectId(), 'Inserted slide should be at the correct index');

    // Test getObjectId()
    t.true(is.nonEmptyString(slide2.getObjectId()), 'Slide should have an object ID');

    // Test duplicate()
    const duplicatedSlide = slide2.duplicate();
    const slidesAfterDuplicate = pres.getSlides();
    t.is(slidesAfterDuplicate.length, 4, 'Presentation should have 4 slides after duplicate');
    t.is(duplicatedSlide.toString(), 'Slide', 'Duplicated slide toString() should be "Slide"');

    // Test move()
    const slideToMove = slidesAfterDuplicate[0];
    const originalId = slideToMove.getObjectId();
    slideToMove.move(2);
    const slidesAfterMove = pres.getSlides();

    // Moving 0 to 2 means insert before item at index 2 (which is the 3rd item).
    // Original list: [s0, s1, s2, s3]
    // Move s0 to 2: [s1, s0, s2, s3] -> s0 is now at index 1.
    t.is(slidesAfterMove[1].getObjectId(), originalId, 'Slide should be moved to the correct index (1)');

    // Test remove()
    const slideToRemove = slidesAfterMove[0];
    const idToRemove = slideToRemove.getObjectId();
    slideToRemove.remove();
    const slidesAfterRemove = pres.getSlides();
    t.is(slidesAfterRemove.length, 3, 'Presentation should have 3 slides after remove');
    t.false(slidesAfterRemove.some(s => s.getObjectId() === idToRemove), 'Slide should be removed from presentation');

    // Test supporting objects (minimal check)
    t.is(slide2.getNotesPage().toString(), 'NotesPage', 'getNotesPage() should return a NotesPage object');
    t.is(slide2.getLayout().toString(), 'Layout', 'getLayout() should return a Layout object');
    const master = slide2.getLayout().getMaster();
    if (master) {
      t.is(master.toString(), 'Master', 'getLayout().getMaster() should return a Master object');
    }
    t.true(is.array(slide2.getPageElements()), 'getPageElements() should return an array');

    // Test insertTextBox()
    const textBoxText = 'Hello World';
    const textBox = slide2.insertTextBox(textBoxText, 50, 60, 200, 100);
    t.is(textBox.toString(), 'Shape', 'insertTextBox() should return a Shape object');
    t.is(textBox.getText().asString(), textBoxText + '\n', 'Text box should contain the inserted text plus trailing newline');

    // Test insertTable()
    const table = slide2.insertTable(2, 3, 10, 10, 300, 100);
    t.is(table.toString(), 'Table', 'insertTable(rows, cols) should return a Table object');
    t.is(table.getNumRows(), 2, 'Table should have 2 rows');
    t.is(table.getNumColumns(), 3, 'Table should have 3 columns');

    const cellText = 'Cell Content';
    table.getRow(0).getCell(0).getText().setText(cellText);
    t.is(table.getRow(0).getCell(0).getText().asString(), cellText + '\n', 'Cell content should be set');

    // Test getShapes()
    const shapes = slide2.getShapes();
    // slide2 already had one textbox inserted earlier
    t.is(shapes.length, 1, 'slide2 should have 1 shape (the textbox)');
    t.true(shapes.every(s => s.toString() === 'Shape'), 'All items returned by getShapes() should be Shape objects');
    t.is(shapes[0].getObjectId(), textBox.getObjectId(), 'Shape ID should match the textbox ID');

    const copiedTable = slide2.insertTable(table);
    t.is(copiedTable.toString(), 'Table', 'insertTable(table) should return a Table object');
    t.is(copiedTable.getNumRows(), 2, 'Copied table should have 2 rows');
    t.is(copiedTable.getRow(0).getCell(0).getText().asString(), cellText + '\n', 'Copied table cell should have identical content');

    // Test getTables()
    const tables = slide2.getTables();
    t.is(tables.length, 2, 'slide2 should have 2 tables');
    t.true(tables.every(tbl => tbl.toString() === 'Table'), 'All items returned by getTables() should be Table objects');
    t.is(tables[0].getObjectId(), table.getObjectId(), 'First table should match the first inserted table');
    t.is(tables[1].getObjectId(), copiedTable.getObjectId(), 'Second table should match the second inserted table');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesSlide);
