
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '@mcpher/gas-fakes'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { wrapupTest, trasher, createTrashCollector } from './testassist.js';
// this can run standalone, or as part of combined tests if result of inittests is passed over

export const testSlidesAdv = (pack) => {

  const toTrash = createTrashCollector();
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

  })

  unit.section ("slide thumbnail", t=> {
    const presName = `gas-fakes-test-thumbnail-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    const presentation = SlidesApp.openById(pres.getId());
    const firstSlideId = presentation.getSlides()[0].getObjectId();

    // Call the Advanced Slides API to get a thumbnail URL
    // You can specify the size using "thumbnailProperties.thumbnailSize" (LARGE, MEDIUM, or SMALL)
    const thumbs = ["SMALL", "MEDIUM", "LARGE"]
    const getThumb = (size) => {
      const thumb = Slides.Presentations.Pages.getThumbnail(pres.getId(), firstSlideId, {
        "thumbnailProperties.thumbnailSize": size
      });
      t.true(is.nonEmptyString(thumb.contentUrl))
      const thumbResponse = UrlFetchApp.fetch(thumb.contentUrl);
      const thumbBlob = thumbResponse.getBlob()
      t.is(thumbBlob.getContentType(),'image/png' )
      t.true(is.number(thumbBlob.getBytes().length))
      return thumbBlob
    }

    const [small, med, large] = thumbs.map (f=>getThumb (f));
    t.true (small.getBytes().length < med.getBytes().length)
    t.true (med.getBytes().length < large.getBytes().length)
  })
  

  // running standalone
  if (!pack) {
    if (SlidesApp.isFake) cachePerformance()
    unit.report()

  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes }
}


wrapupTest(testSlidesAdv);