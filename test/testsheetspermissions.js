
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '@mcpher/gas-fakes'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { wrapupTest, cachePerformance } from './testassist.js';



// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsPermissions = (pack) => {
  const { unit, fixes } = pack || initTests()


  unit.section("protected cells", t => {

    const sp = SpreadsheetApp.openById(fixes.TEST_BORDERS_ID)
    t.is(SpreadsheetApp.ProtectionType.SHEET.toString(), 'SHEET')
    t.is(SpreadsheetApp.ProtectionType.RANGE.toString(), 'RANGE')

    const protections = sp.getProtections(SpreadsheetApp.ProtectionType.RANGE)
    const pss = sp.getProtections(SpreadsheetApp.ProtectionType.SHEET)

    t.true(protections.every(f => f.toString() === "Protection"))
    t.true(pss.every(f => f.toString() === "Protection"))

    // ive set the descriptions to be the same as the ranges in the test sheet
    t.true(protections.every(f => f.getDescription() === f.getRange().getA1Notation()))
    t.true(pss.every(f => f.getDescription() === f.getRange().getA1Notation()))

    t.true(protections.every(f => f.canEdit()))
    t.true(pss.every(f => f.canEdit()))

    t.false(protections.every(f => f.canDomainEdit()))
    t.false(pss.every(f => f.canDomainEdit()))

    // a sheet range actually has the dimensions of the max of that sheet if there's no given range
    pss.forEach(f => t.is(f.getRange().getNumColumns(), f.getRange().getSheet().getMaxColumns()))
    pss.forEach(f => t.is(f.getRange().getNumRows(), f.getRange().getSheet().getMaxRows()))
    pss.forEach(f => t.is(f.getRange().getA1Notation(), "", "sheet level range has no a1 notation"))

    // shouldnt have any unprotected ranges at this point
    t.true(protections.every(f => is.emptyArray(f.getUnprotectedRanges())))
    t.true(pss.every(f => is.emptyArray(f.getUnprotectedRanges())))

    // shared files are owned by me
    protections.forEach(f => t.deepEqual(f.getEditors().map(f => f.getEmail()), [fixes.SHARED_FILE_OWNER]))
    pss.forEach(f => t.deepEqual(f.getEditors().map(f => f.getEmail()), [fixes.SHARED_FILE_OWNER]))

  })


  // running standalone
  if (!pack) {
    if (SpreadsheetApp.isFake) cachePerformance()
    unit.report()

  }


  return { unit, fixes }
}

wrapupTest(testSheetsPermissions)