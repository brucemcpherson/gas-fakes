
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import '../main.js'
import { initTests }  from  './testinit.js'
import { testDrive } from './testdrive.js';
import { testSheets } from './testsheets.js';
import { testSheetsPermissions } from './testsheetspermissions.js';
import { testSheetsValues } from './testsheetsvalues.js';
import { testFetch } from './testfetch.js';
import { testSession } from './testsession.js';
import { testUtilities } from './testutilities.js';
import { testStores } from './teststores.js';
import { testScriptApp } from './testscriptapp.js';
import { getPerformance } from '../src/support/filecache.js';
import { getSheetsPerformance } from '../src/support/sheetscache.js';
import { testFiddler } from './testfiddler.js';
import { testSheetsDataValidations } from './testsheetsdatavalidations.js';
import { testEnums } from './testenums.js';
import { testSheetsSets } from './testsheetssets.js';
import { testSheetsVui } from './testsheetsvui.js';

const testFakes = () => {
  const pack = initTests()
  const {unit} = pack

  // add one of these for each service being tested
  console.log ('\n----Test Enums----')
  testEnums(pack)
  console.log ('\n----Test Sheets compat with UI----')
  testSheetsVui(pack)
  console.log ('\n----Test Sheets Sets----')
  testSheetsSets(pack)
  console.log ('\n----Test Sheets DataValidations----')
  testSheetsDataValidations(pack)
  console.log ('\n----Test Sheets Permissions----')
  testSheetsPermissions(pack)
  console.log ('\n----Test Sheets----')
  testSheets(pack)
  console.log ('\n----Test SheetsValues----')
  testSheetsValues(pack)  
  console.log ('\n----Test Fiddler----')
  testFiddler(pack)
  console.log ('\n----Test Drive----')
  testDrive(pack)
  console.log ('\n----Test Fetch----')
  testFetch(pack)
  console.log ('\n----Test Session----')
  testSession(pack)
  console.log ('\n----Test Utilities----')
  testUtilities(pack)
  console.log ('\n----Test Stores----')
  testStores(pack)
  console.log ('\n----Test ScriptApp----')
  testScriptApp(pack)
  console.log ('\n----TEST FILES COMPLETE----')
  // reports on cache performance
  if (Drive.isFake) console.log('...cumulative drive cache performance', getPerformance())
  if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  
  // all tests cumulative unit report
  unit.report()
}

// this required on Node but not on Apps Script
if (ScriptApp.isFake) testFakes()
