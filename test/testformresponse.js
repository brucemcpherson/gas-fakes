import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testFormResponse = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('ItemResponse.createResponse and getResponse', (t) => {
    const form = FormApp.create('Response Test Form');
    toTrash.push(DriveApp.getFileById(form.getId()));

    // TextItem
    const textItem = form.addTextItem().setTitle('Name');
    const textResp = textItem.createResponse('John Doe');
    t.is(textResp.getItem().getId(), textItem.getId(), 'TextItem response item should match');
    t.is(textResp.getResponse(), 'John Doe', 'TextItem response value should match');

    // CheckboxItem
    const checkboxItem = form.addCheckboxItem().setTitle('Colors');
    checkboxItem.setChoices([
      checkboxItem.createChoice('Red'),
      checkboxItem.createChoice('Blue'),
      checkboxItem.createChoice('Green')
    ]);
    const checkboxResp = checkboxItem.createResponse(['Red', 'Green']);
    t.deepEqual(checkboxResp.getResponse(), ['Red', 'Green'], 'CheckboxItem response value should be an array');

    // MultipleChoiceItem
    const mcItem = form.addMultipleChoiceItem().setTitle('Favorite');
    mcItem.setChoices([
      mcItem.createChoice('Red'),
      mcItem.createChoice('Blue')
    ]);
    const mcResp = mcItem.createResponse('Red');
    t.is(mcResp.getResponse(), 'Red', 'MultipleChoiceItem response value should match');

    // ListItem
    const listItem = form.addListItem().setTitle('Select Category');
    listItem.setChoices([
      listItem.createChoice('Category A'),
      listItem.createChoice('Category B')
    ]);
    const listResp = listItem.createResponse('Category A');
    t.is(listResp.getResponse(), 'Category A', 'ListItem response value should match');

    // ScaleItem
    const scaleItem = form.addScaleItem().setTitle('Rate');
    const scaleResp = scaleItem.createResponse(4);
    t.is(scaleResp.getResponse(), '4', 'ScaleItem response value should be a string');

    // GridItem
    const gridItem = form.addGridItem().setTitle('Grid');
    gridItem.setRows(['Row 1', 'Row 2']).setColumns(['A', 'B']);
    const gridResp = gridItem.createResponse(['A', 'B']);
    t.deepEqual(gridResp.getResponse(), ['A', 'B'], 'GridItem response value should be an array of strings');

    // CheckboxGridItem
    const cbGridItem = form.addCheckboxGridItem().setTitle('CB Grid');
    cbGridItem.setRows(['Row 1', 'Row 2']).setColumns(['A', 'B']);
    const cbGridResp = cbGridItem.createResponse([['A'], ['A', 'B']]);
    t.deepEqual(cbGridResp.getResponse(), [['A'], ['A', 'B']], 'CheckboxGridItem response value should be a 2D array');

    // ParagraphTextItem
    const paraItem = form.addParagraphTextItem().setTitle('Bio');
    const paraResp = paraItem.createResponse('Long text...');
    t.is(paraResp.getResponse(), 'Long text...', 'ParagraphTextItem response value should match');

    // DateItem
    const dateItem = form.addDateItem().setTitle('Birthday');
    const bday = new Date(2000, 0, 1); // Jan 1, 2000
    const dateResp = dateItem.createResponse(bday);
    t.is(dateResp.getResponse(), '2000-01-01', 'DateItem response value should be YYYY-MM-DD');

    // DateTimeItem
    const dateTimeItem = form.addDateTimeItem().setTitle('Appointment');
    const appt = new Date(2024, 4, 20, 14, 30); // May 20, 2024, 14:30
    const dateTimeResp = dateTimeItem.createResponse(appt);
    const expectedDateTime = `2024-05-20 ${String(appt.getHours()).padStart(2, '0')}:${String(appt.getMinutes()).padStart(2, '0')}`;
    // Note: Live Apps Script might shift the time based on Form/Script timezone settings.
    // In our fake, it should match the input Date's local hours/minutes.
    if (FormApp.isFake) {
      t.is(dateTimeResp.getResponse(), '2024-05-20 14:30', 'DateTimeItem response value should match local input time');
    } else {
      // On live, we just check that it's a non-empty string as it may shift.
      t.true(is.nonEmptyString(dateTimeResp.getResponse()), 'DateTimeItem response should be a string');
    }

    // TimeItem
    const timeItem = form.addTimeItem().setTitle('Wake up');
    const timeResp = timeItem.createResponse(7, 45);
    t.is(timeResp.getResponse(), '07:45', 'TimeItem response value should be HH:mm');

    // DurationItem
    const durationItem = form.addDurationItem().setTitle('Lap time');
    const durationResp = durationItem.createResponse(1, 2, 3);
    t.is(durationResp.getResponse(), '01:02:03', 'DurationItem response value should be HH:mm:ss');
  });

  unit.section('Form.deleteAllResponses', (t) => {
    const form = FormApp.create('Delete Responses Test');
    toTrash.push(DriveApp.getFileById(form.getId()));

    if (FormApp.isFake) {
      const err = t.threw(() => form.deleteAllResponses());
      t.truthy(err, 'deleteAllResponses should throw in fake environment');
      if (err) {
        t.rxMatch(err.message, /deleteAllResponses is not yet implemented/, 'Error message should be descriptive');
      }
    } else {
      // On live, we just verify the method exists and doesn't crash (though it might fail if no responses)
      t.true(is.function(form.deleteAllResponses), 'deleteAllResponses should be a function');
    }
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testFormResponse);
