import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';

import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testAdvBigQuery = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section("basic adv bigquery props", t => {
    t.is(BigQuery.toString(), "AdvancedServiceIdentifier{name=bigquery, version=v2}")
    t.is(BigQuery.getVersion(), "v2")

    Reflect.ownKeys(BigQuery)
      .filter(f => is.string(f) && f.match(/^new/))
      .forEach(f => {
        t.true(is.function(BigQuery[f]), `check ${f} is a function`);
        const method = BigQuery[f];
        const ob = method();
        t.true(Reflect.ownKeys(ob).every(g => is.function(ob[g])), `all BigQuery.${f}().subprops are functions`)
      })
    
    t.is(is(BigQuery.Datasets), "Object")
    t.is(is(BigQuery.Jobs), "Object")
    t.is(is(BigQuery.Projects), "Object")
    t.is(is(BigQuery.Tabledata), "Object")
    t.is(is(BigQuery.Tables), "Object")
    t.is(BigQuery.toString(), BigQuery.Datasets.toString())
  })

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testAdvBigQuery);
