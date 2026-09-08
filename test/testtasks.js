import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';

import { initTests } from './testinit.js';
import { cachePerformance, wrapupTest, trasher } from './testassist.js';

export const testTasks = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

    unit.section("basic adv tasks props", t => {
      t.is(Tasks.toString(), "AdvancedServiceIdentifier{name=tasks, version=v1}")
      t.is(Tasks.getVersion(), "v1")

      Reflect.ownKeys(Tasks)
        .filter(f => is.string(f) && f.match(/^new/))
        .forEach(f => {
          t.true(is.function(Tasks[f]), `check ${f} is a function`);
          const method = Tasks[f];
          const ob = method();
          t.true(Reflect.ownKeys(ob).every(g => is.function(ob[g])), `all Tasks.${f}().subprops are functions`)
        })
      t.is(is(Tasks.Tasklists), "Object")
      t.is(Tasks.toString(), Tasks.Tasklists.toString())
      if (Tasks.isFake) cachePerformance()
    })
  

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testTasks);