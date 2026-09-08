import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';

import { initTests } from './testinit.js';
import { cachePerformance, wrapupTest, trasher } from './testassist.js';

export const testChat = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();


    unit.section("basic adv chat props", t => {
      t.is(Chat.toString(), "AdvancedServiceIdentifier{name=chat, version=v1}")
      t.is(Chat.getVersion(), "v1")

      Reflect.ownKeys(Chat)
        .filter(f => is.string(f) && f.match(/^new/))
        .forEach(f => {
          t.true(is.function(Chat[f]), `check ${f} is a function`);
          const method = Chat[f];
          const ob = method();
          t.true(Reflect.ownKeys(ob).every(g => is.function(ob[g])), `all Chat.${f}().subprops are functions`)
        })
      t.is(is(Chat.Spaces), "Object")
      t.is(Chat.toString(), Chat.Spaces.toString())
      if (Chat.isFake) cachePerformance()
    })

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testChat);