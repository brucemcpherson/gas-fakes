import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';

import { initTests } from './testinit.js';
import { cachePerformance , wrapupTest, trasher } from './testassist.js';

export const testPeople = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  // advanced people service does exist on live apps script, but we'll test the fake props
  if (People.isFake) {
    unit.section("basic adv people props", t => {
      t.is(People.toString(), "AdvancedServiceIdentifier{name=people, version=v1}")
      t.is(People.getVersion(), "v1")

      Reflect.ownKeys(People)
        .filter(f => is.string(f) && f.match(/^new/))
        .forEach(f => {
          t.true(is.function(People[f]), `check ${f} is a function`);
          const method = People[f];
          const ob = method();
          t.true(Reflect.ownKeys(ob).every(g => is.function(ob[g])), `all People.${f}().subprops are functions`)
        })
      t.is(is(People.People), "Object")
      t.is(People.toString(), People.People.toString())
      if (People.isFake) cachePerformance()
    })
  }

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testPeople);