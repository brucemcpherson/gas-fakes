import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';

import { initTests } from './testinit.js';
import { cachePerformance , wrapupTest, trasher } from './testassist.js';

export const testWorkspaceEvents = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();


    unit.section("basic adv workspaceevents props", t => {
      t.is(WorkspaceEvents.toString(), "AdvancedServiceIdentifier{name=workspaceevents, version=v1}")
      t.is(WorkspaceEvents.getVersion(), "v1")

      Reflect.ownKeys(WorkspaceEvents)
        .filter(f => is.string(f) && f.match(/^new/))
        .forEach(f => {
          t.true(is.function(WorkspaceEvents[f]), `check ${f} is a function`);
          const method = WorkspaceEvents[f];
          const ob = method();
          t.true(Reflect.ownKeys(ob).every(g => is.function(ob[g])), `all WorkspaceEvents.${f}().subprops are functions`)
        });

      const resources = ['Subscriptions'];
      resources.forEach(resource => {
        t.is(is(WorkspaceEvents[resource]), "Object", `WorkspaceEvents.${resource} should be an object`);
        t.is(WorkspaceEvents.toString(), WorkspaceEvents[resource].toString(), `WorkspaceEvents.${resource} should have the correct toString()`);
      });

      if (WorkspaceEvents.isFake)cachePerformance()
    })
  

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testWorkspaceEvents);