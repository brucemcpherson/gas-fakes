
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { wrapupTest, getSlidesPerformance, trasher } from './testassist.js';
// this can run standalone, or as part of combined tests if result of inittests is passed over

export const testSlidesAdv = (pack) => {

  const toTrash = [];
  const { unit, fixes } = pack || initTests()


  unit.section("basic adv slides props", t => {
    t.is(Slides.toString(), "AdvancedServiceIdentifier{name=slides, version=v1}")
    t.is(Slides.getVersion(), "v1")

    Reflect.ownKeys(Slides)
      .filter(f => is.string(f) && f.match(/^new/))
      .forEach(f => {
        t.true(is.function(Slides[f]), `check ${f} is a function`);
        const method = Slides[f];
        const ob = method();
        t.true(Reflect.ownKeys(ob).every(g => is.function(ob[g])), "all Slides.newsubprops are functions")
      })
    t.is(is(Slides.Presentations), "Object")
    t.is(Slides.toString(), Slides.Presentations.toString())
    if (SlidesApp.isFake) console.log('...cumulative slides cache performance', getSlidesPerformance())
  })

  // running standalone
  if (!pack) {
    /// if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    unit.report()

  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes }
}


wrapupTest(testSlidesAdv);