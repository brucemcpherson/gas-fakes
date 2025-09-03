// all these imports
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { wrapupTest, trasher, getFormsPerformance } from './testassist.js';
// this can run standalone, or as part of combined tests if result of inittests is passed over

export const testFormsAdv = (pack) => {

  const toTrash = [];
  const { unit, fixes } = pack || initTests()

  // advanced forms dont exist on live apps script
  if (FormApp.isFake) {
    unit.section("basic adv forms props", t => {
      t.is(Forms.toString(), "AdvancedServiceIdentifier{name=forms, version=v1}")
      t.is(Forms.getVersion(), "v1")

      Reflect.ownKeys(Forms)
        .filter(f => is.string(f) && f.match(/^new/))
        .forEach(f => {
          t.true(is.function(Forms[f]), `check ${f} is a function`);
          const method = Forms[f];
          const ob = method();
          t.true(Reflect.ownKeys(ob).every(g => is.function(ob[g])), `all Forms.${f}().subprops are functions`)
        })
      t.is(is(Forms.Form), "Object")
      t.is(Forms.toString(), Forms.Form.toString())
      if (Forms.isFake) console.log('...cumulative forms cache performance', getFormsPerformance())
    })

    unit.section("adv forms create and get", t => {
      const formName = fixes.PREFIX + "temp-form";
      const resource = Forms.newFormInfo()
        .setTitle(formName)
        .setDocumentTitle("A document title for the form");

      const form = Forms.Form.create({
        info: resource
      });
      toTrash.push(DriveApp.getFileById(form.formId));

      t.is(form.info.title, formName, "Created form should have the correct title");
      t.is(form.info.documentTitle, "A document title for the form", "Created form should have the correct document title");
      t.true(is.nonEmptyString(form.formId), "Created form should have an ID");

      const gotForm = Forms.Form.get(form.formId);
      t.is(gotForm.formId, form.formId, "get() should retrieve the correct form by ID");
      t.is(gotForm.info.title, formName, "Retrieved form should have the correct title");

      if (Forms.isFake) console.log('...cumulative forms cache performance', getFormsPerformance());
    });

    unit.section("adv forms batchUpdate", t => {
      const formName = fixes.PREFIX + "batch-update-form";
      const createResource = Forms.newFormInfo().setTitle(formName);
      const form = Forms.Form.create({ info: createResource });
      toTrash.push(DriveApp.getFileById(form.formId));
      t.is(form.info.title, formName, "pre-check: form created with correct title");

      // now prepare the update
      const newTitle = formName + "-updated";
      const updateInfo = Forms.newFormInfo().setTitle(newTitle);

      const updateRequest = Forms.newRequest().setUpdateFormInfo(
        Forms.newUpdateFormInfoRequest()
          .setInfo(updateInfo)
          .setUpdateMask("title")
      );

      const batchRequest = Forms.newBatchUpdateFormRequest()
        .setIncludeFormInResponse(true)
        .setRequests([updateRequest]);

      // execute the batch update
      const batchResponse = Forms.Form.batchUpdate(batchRequest, form.formId);
      t.truthy(batchResponse, "batchUpdate should return a response");
      t.is(batchResponse.form.formId, form.formId, "response should contain the formId");

      // get the form again to check the update
      const updatedForm = Forms.Form.get(form.formId);
      t.is(updatedForm.info.title, newTitle, "form title should be updated after batchUpdate");

      if (Forms.isFake) console.log('...cumulative forms cache performance', getFormsPerformance());
    });
  } else {
    console.log('...Advanced forms doesnt exist in live environment - skipping tests')
  }
  // running standalone
  if (!pack) {
    unit.report()
  }

  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes }
}

wrapupTest(testFormsAdv);