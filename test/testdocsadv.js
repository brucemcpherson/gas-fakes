// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js';
import { getDocsPerformance, wrapupTest, trasher } from './testassist.js';


// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testDocsAdv = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests()

  unit.section("test batch updates", t => {
    const docName = fixes.PREFIX + "temp-doc";
    const resource = Docs.newDocument()
      .setTitle(docName);
    const doc = Docs.Documents.create(resource);
    const ps = Docs.newSize()
      .setHeight({
        magnitude: 800,
        unit: "PT"
      })
      .setWidth({
        magnitude: 400,
        unit: "PT"
      });

    const dsp = Docs.newDocumentStyle()
      .setPageSize(ps)

    const urp1 = {
      updateDocumentStyle: Docs.newUpdateDocumentStyleRequest()
        .setDocumentStyle(dsp)
        .setFields("pageSize")
    };


    const requests = [urp1];
    const response = Docs.Documents.batchUpdate({ requests }, doc.documentId)
    t.is(response.replies.length, requests.length, "Should have the same number of replies as requests");

    if (fixes.CLEAN) toTrash.push(DriveApp.getFileById(doc.documentId));

  })

  unit.section("basic adv docs props", t => {
    t.is(Docs.toString(), "AdvancedServiceIdentifier{name=docs, version=v1}")
    t.is(Docs.getVersion(), "v1")

    Reflect.ownKeys(Docs)
      .filter(f => is.string(f) && f.match(/^new/))
      .forEach(f => {
        t.true(is.function(Docs[f]), `check ${f} is a function`);
        const method = Docs[f];
        const ob = method();
        t.true(Reflect.ownKeys(ob).every(g => is.function(ob[g])), "all Docs.newsubprops are functions")
      })

    t.is(is(Docs.Documents), "Object")
    t.is(Docs.toString(), Docs.Documents.toString())
    if (Docs.isFake) console.log('...cumulative docs cache performance', getDocsPerformance())
  })

  unit.section("basic adv docs", t => {
    const docName = fixes.PREFIX + "temp-doc"
    const resource = Docs.newDocument()
      .setTitle(docName)

    const doc = Docs.Documents.create(resource)
    t.true(is.nonEmptyString(doc.documentId))
    t.true(is.nonEmptyString(doc.revisionId))
    t.is(doc.title, docName)
    t.true(is.object(doc.body))
    t.true(is.object(doc.documentStyle))
    t.true(is.nonEmptyString(doc.suggestionsViewMode))

    /*
     https://developers.google.com/workspace/docs/api/reference/rest/v1/documents/get
     {includeTabsContent: boolean}
      When True: Document content populates in the Document.tabs field instead of the text content fields in Document.
      When False: The content of the document's first tab populates the content fields in Document excluding Document.tabs. If a document has only one tab, then that tab is used to populate the document content. Document.tabs will be empty.
    }
    */

    const r1 = Docs.Documents.get(doc.documentId, { includeTabsContent: false })
    t.is(Reflect.has(r1, "tabs"), false, "no tabs, content should be at top level")

    const r2 = Docs.Documents.get(doc.documentId, { includeTabsContent: true })
    t.is(Reflect.has(r2, "tabs"), true, "no tabs, content should be at t[0] level")
    t.true(is.array(r2.tabs), "tabs should be an array")
    t.is(r2.tabs.length, 1, "tabs should be an array of length 1")
    t.true(is.nonEmptyObject(r2.tabs[0]))
    t.true(is.nonEmptyObject(r2.tabs[0].documentTab))
    t.true(is.nonEmptyObject(r2.tabs[0].documentTab.body))
    t.true(is.nonEmptyObject(r2.tabs[0].tabProperties))

    const r3 = Docs.Documents.get(doc.documentId)
    t.is(Reflect.has(r3, "tabs"), false, "default, content should be at top level")

    // this is just a check that caching is happening in fake environment
    // so wont need to run on apps script
    if (ScriptApp.isFake) {
      const t1 = new Date().getTime()
      const r4 = Docs.Documents.get(doc.documentId)
      const t2 = new Date().getTime()
      t.true(t2 - t1 < 40, "should have come from cache so should b real quick")
      t.deepEqual(r4, r3)
    }

    t.deepEqual(r1, r3, "default has no tabs")
    t.deepEqual(r2.tabs[0].documentTab.body, r3.body, "if tabs are asked for")

    t.is(r1.documentId, r2.documentId)
    t.is(r3.documentId, doc.documentId)
    if (fixes.CLEAN) toTrash.push(DriveApp.getFileById(doc.documentId));
    if (Docs.isFake) console.log('...cumulative docs cache performance', getDocsPerformance())
  })



  // running standalone
  if (!pack) {
    /// if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    unit.report()

  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes }
}


wrapupTest(testDocsAdv);