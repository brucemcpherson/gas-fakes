import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testFormWebHack = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('FormResponse "Web Hack" Submission', (t) => {
    const form = FormApp.create('Web Hack Test Form');
    toTrash.push(DriveApp.getFileById(form.getId()));

    const listItem = form.addListItem().setTitle('Category');
    listItem.setChoices([listItem.createChoice('Choice A'), listItem.createChoice('Choice B')]);
    const itemResponse = listItem.createResponse('Choice B');

    const textItem = form.addTextItem().setTitle('Text');
    const textItemResponse = textItem.createResponse('some text');

    const formResponse = form.createResponse()
    formResponse.withItemResponse(itemResponse);
    formResponse.withItemResponse(textItemResponse);
    const beforeResponses = form.getResponses();

    const f = formResponse.submit();
    t.is(f && f.toString(), 'FormResponse', 'submit returns a FormResponse');


    const afterResponses = form.getResponses();
    t.is(afterResponses.length, beforeResponses.length + 1, 'form.getResponses() called after submit (cache should have been cleared)');

  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testFormWebHack);
