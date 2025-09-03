// all these imports
// this is loaded by npm, but is a library on Apps Script side

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import "../main.js";
import { initTests } from "./testinit.js";
import { testDrive } from "./testdrive.js";
import { testSheets } from "./testsheets.js";
import { testSheetsPermissions } from "./testsheetspermissions.js";
import { testSheetsValues } from "./testsheetsvalues.js";
import { testFetch } from "./testfetch.js";
import { testSession } from "./testsession.js";
import { testUtilities } from "./testutilities.js";
import { testStores } from "./teststores.js";
import { testScriptApp } from "./testscriptapp.js";
import {
  getDrivePerformance,
  getSheetsPerformance,
  getDocsPerformance,
  getSlidesPerformance,
} from "./testassist.js";
import { testFiddler } from "./testfiddler.js";
import { testSheetsDataValidations } from "./testsheetsdatavalidations.js";
import { testEnums } from "./testenums.js";
import { testSheetsExotics } from "./testsheetsexotics.js";
import { testSheetsSets } from "./testsheetssets.js";
import { testSheetsVui } from "./testsheetsvui.js";
import { testSheetsDeveloper } from "./testsheetsdeveloper.js";
import { testSheetsData } from "./testsheetsdata.js";
import { testDocsAdv } from "./testdocsadv.js";
import { testDocs } from "./testdocs.js";
import { testDocsNext } from "./testdocsnext.js";
import { testDocsHeaders } from "./testdocsheaders.js";
import { testDocsFooters } from "./testdocsfooters.js";
import { testDocsFootnotes } from "./testdocsfootnotes.js";
import { testDocsListItems } from "./testdocslistitems.js";
import { testSlidesAdv } from "./testslidesadv.js";
import { testSlides } from "./testslides.js";
import { testForm } from "./testform.js";
import { testFormsAdv } from "./testformsadv.js";
import { testSheetsText } from "./testsheetstext.js";
import { testSheetsRange } from "./testsheetsrange.js";
import { testDocsImages } from "./testdocsimages.js";
import { testSandbox } from "./testsandbox.js";

const testFakes = () => {
  const pack = initTests();
  const { unit } = pack;

  // add one of these for each service being tested
  console.log("\n----Test sandbox----");
  testSandbox(pack);
  console.log("\n----Test docs headers----");
  testDocsHeaders(pack);
  console.log("\n----Test docs footers----");
  testDocsFooters(pack);
  console.log("\n----Test docs footnotes----");
  testDocsFootnotes(pack);
  console.log("\n----Test slides----");
  testSlides(pack);
  console.log("\n----Test slidesadv----");
  testSlidesAdv(pack);
  console.log("\n----Test form----");
  testForm (pack);
  console.log("\n----Test formsadv----");
  testFormsAdv(pack);
  console.log("\n----Test docsadv----");
  testDocsAdv(pack);
  console.log("\n----Test docs----");
  testDocs(pack);
  console.log("\n----Test docs images----");
  testDocsImages(pack);
  console.log("\n----Test docs next----");
  testDocsNext(pack);
  console.log("\n----Test docs list items----");
  testDocsListItems(pack);
  console.log("\n----Test Enums----");
  testEnums(pack);
  console.log("\n----Test Sheets text----");
  testSheetsText(pack);
  console.log("\n----Test Sheets Data----");
  testSheetsData(pack);
  console.log("\n----Test Sheets DataValidations----");
  testSheetsDataValidations(pack);
  console.log("\n----Test Sheets compat with UI----");
  testSheetsVui(pack);
  console.log("\n----Test Sheets Sets----");
  testSheetsSets(pack);
  console.log("\n----Test Sheets Permissions----");
  testSheetsPermissions(pack);
  console.log("\n----Test Sheets----");
  testSheets(pack);
  console.log("\n----Test SheetsValues----");
  testSheetsValues(pack);
  console.log("\n----Test SheetsDeveloper----");
  testSheetsDeveloper(pack);
  console.log("\n----Test SheetsExotics----");
  testSheetsExotics(pack);
  console.log("\n----Test Fiddler----");
  testFiddler(pack);
  console.log("\n----Test Drive----");
  testDrive(pack);
  console.log("\n----Test Fetch----");
  testFetch(pack);
  console.log("\n----Test Session----");
  testSession(pack);
  console.log("\n----Test Utilities----");
  testUtilities(pack);
  console.log("\n----Test Stores----");
  testStores(pack);
  console.log("\n----Test ScriptApp----");
  testScriptApp(pack);
  console.log("\n----Test Sheets Range----");
  testSheetsRange(pack);
  console.log("\n----TEST FILES COMPLETE----");

  // reports on cache performance
  if (ScriptApp.isFake) {
    console.log("...cumulative drive cache performance", getDrivePerformance());
    console.log(
      "...cumulative sheets cache performance",
      getSheetsPerformance()
    );
    console.log("...cumulative docs cache performance", getDocsPerformance());
    console.log("...cumulative slides cache performance", getSlidesPerformance());
    console.log("...cumulative forms cache performance", getFormsPerformance());
  }

  // all tests cumulative unit report
  unit.report();

  // final cleanup of all files created during the test run
  if (ScriptApp.isFake) {
    ScriptApp.__behavior.trash();
  }
};

// this required on Node but not on Apps Script
if (ScriptApp.isFake) testFakes();
