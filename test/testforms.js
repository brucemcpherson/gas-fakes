import is from '@sindresorhus/is';
import '../main.js';
import { initTests } from './testinit.js';
import { getFormsPerformance, wrapupTest, getDrivePerformance, trasher } from './testassist.js';

export const testForms = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('FormApp basics', (t) => {
    // Test create()
    const formName = `gas-fakes-test-form-${new Date().getTime()}`;
    const form = FormApp.create(formName);
    toTrash.push(DriveApp.getFileById(form.getId()));

    t.true(is.object(form), 'create() should return an object');
    t.is(form.getName(), formName, 'create() should set the form name');
    t.is(form.toString(), 'Form', 'form.toString() should be "Form"');
    t.true(is.nonEmptyString(form.getId()), 'created form should have an ID');
    t.true(form.getUrl().includes(form.getId()), 'created form URL should contain ID');

    // Test create() with a default name
    const newForm = FormApp.create('Untitled form');
    toTrash.push(DriveApp.getFileById(newForm.getId()));
    t.is(newForm.getName(), 'Untitled form', 'create() with default name should work');
    t.true(is.nonEmptyString(newForm.getId()), 'new form should have an ID');

    // Test openById()
    const openedForm = FormApp.openById(form.getId());
    t.is(openedForm.getId(), form.getId(), 'openById() should open the correct form');
    t.is(openedForm.getName(), form.getName(), 'opened form should have correct name');

    // Test openByUrl()
    const openedByUrl = FormApp.openByUrl(form.getUrl());
    t.is(openedByUrl.getId(), form.getId(), 'openByUrl() should open the correct form');
    t.is(openedByUrl.getName(), form.getName(), 'opened form by URL should have correct name');

    // Test openByUrl() with invalid URL
    t.threw(() => FormApp.openByUrl('http://invalid.url/'), 'openByUrl() should throw on invalid URL');

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

wrapupTest(testForms);