import is from '@sindresorhus/is';
import '../main.js';
import { initTests } from './testinit.js';
import { getFormsPerformance, wrapupTest, getDrivePerformance, trasher } from './testassist.js';

export const testForm = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('FormApp basics', (t) => {
    // Test create()
    const formName = `gas-fakes-test-form-${new Date().getTime()}`;
    const form = FormApp.create(formName);
    const file = DriveApp.getFileById(form.getId());
    toTrash.push(file);

    t.true(is.object(form), 'create() should return an object');
    t.is(form.toString(), 'Form', 'form.toString() should be "Form"');
    t.true(is.nonEmptyString(form.getId()), 'created form should have an ID');
    t.true(form.getEditUrl().includes(form.getId()), 'created form URL should contain ID');

    // Verify that create() sets the file name in Drive, but not the form's internal title.
    t.is(file.getName(), formName, 'create() should set the file name in Drive');
    // see issue https://issuetracker.google.com/issues/442747794 for discrepancy in platform
  
    t.is(form.getTitle(), FormApp.isFake ? formName: '', 'create() should result in an empty form title on gas');


    // Test openById()
    const openedForm = FormApp.openById(form.getId());
    t.is(openedForm.getId(), form.getId(), 'openById() should open the correct form');
    t.is(openedForm.getTitle(), FormApp.isFake ? formName: '', 'opened form should have correct (empty) title');


    // Test openByUrl()
    const openedByUrl = FormApp.openByUrl(form.getEditUrl());
    t.is(openedByUrl.getId(), form.getId(), 'openByUrl() should open the correct form');
    t.is(openedByUrl.getTitle(), FormApp.isFake ? formName: '', 'opened form by URL should have correct (empty) title');


    // Test openByUrl() with invalid URL
    t.threw(() => FormApp.openByUrl('http://invalid.url/'), 'openByUrl() should throw on invalid URL');

    // Test setTitle() - affects internal form title
    const newTitle = `gas-fakes-test-form-renamed-${new Date().getTime()}`;
    form.setTitle(newTitle);
    const reopenedForm = FormApp.openById(form.getId());
    t.is(reopenedForm.getTitle(), newTitle, 'setTitle() should update the form title');
    t.is(file.getName(), formName, 'setTitle() should NOT change the file name');

    // Test getActiveForm()
    const activeForm = FormApp.getActiveForm();
    t.is(activeForm, null, 'getActiveForm() should be null if no documentId is set');

    // Test enums
    t.is(FormApp.ItemType.CHECKBOX.toString(), 'CHECKBOX', 'should have ItemType enum');
    t.is(FormApp.Alignment.LEFT.toString(), 'LEFT', 'should have Alignment enum');

    if (FormApp.isFake) {
      console.log('...cumulative forms cache performance', getFormsPerformance());
      console.log('...cumulative drive cache performance', getDrivePerformance());
    }
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testForm);
