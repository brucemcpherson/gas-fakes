// use package.json to direct to file:../ for local code testing
import '@mcpher/gas-fakes'

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
  getFormsPerformance,
  getCalendarPerformance,
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
import { testSlidesTextRange } from "./testslidestextrange.js";
import { testSlides } from "./testslides.js";
import { testSlidesSlide } from "./testslidesslide.js";
import { testForm } from "./testform.js";
import { testFormsAdv } from "./testformsadv.js";
import { testFormResponse } from "./testformresponse.js";
import { testSheetsText } from "./testsheetstext.js";
import { testSlidesParagraph } from "./testslidesparagraph.js";
import { testSlidesAffineTransform } from "./testslidesaffinetransform.js";
import { testSlidesAutofit } from "./testslidesautofit.js";
import { testSlidesAutoText } from "./testslidesautotext.js";
import { testSlidesConnectionSite } from "./testslidesconnectionsite.js";
import { testSlidesLineProps } from "./testslideslineprops.js";
import { testSheetsChart } from "./testsheetschart.js";
import { testSheetsRange } from "./testsheetsrange.js";
import { testDocsImages } from "./testdocsimages.js";
import { testSandbox } from "./testsandbox.js";
import { testDocsStyles } from "./testdocsstyles.js";
import { testChat } from './testchat.js';
import { testPeople } from './testpeople.js';
import { testCalendars } from './testcalendars.js';
import { testCalendarSandbox } from './testcalendarsandbox.js';
import { testTasks } from './testtasks.js';
import { testWorkspaceEvents } from './testworkspaceevents.js';
import { testLogger } from "./testlogger.js";
import { testMimeType } from './testmimetype.js';
import { testLock } from './testlock.js';
import { testChartsApp } from "./testchartsapp.js";
import { testFormWebHack } from "./testformwebhack.js";
import { testDriveSharing } from "./testdrivesharing.js";
import { testDwdRefresh } from "./testdwdrefresh.js";
import { testKSuiteDrive } from './testksuitedrive.js';
import { testKSuiteDriveSharing } from './testksuitedrivesharing.js';
// important - run this last for now - see https://github.com/brucemcpherson/gas-fakes/issues/118
import { testGmail } from "./testgmail.js";
import { testSandboxGmail } from "./testsandboxgmail.js";


export const testFakes = () => {
  const pack = initTests();
  const { unit } = pack;

  console.log("\n----Test KSuite Integration----");
  testKSuiteDrive(pack);
  testKSuiteDriveSharing(pack);

  console.log("\n----Test Sheets text----");
  testSheetsText(pack);

  console.log("\n----Test Sheets DataValidations----");
  testSheetsDataValidations(pack);
  console.log("\n----Test Sheets compat with UI----");
  testSheetsVui(pack);
  console.log("\n----Test Sheets Sets----");
  testSheetsSets(pack);



  console.log("\n----Test Enums----");
  testEnums(pack);

  console.log("\n----Test sheets chart----");
  testSheetsChart(pack);
  console.log("\n----Test SheetsExotics----");
  testSheetsExotics(pack);
  console.log("\n----Test charts app----");
  testChartsApp(pack);
  console.log("\n----Test form web hack----");
  testFormWebHack(pack);
  console.log("\n----Test drive sharing----");
  testDriveSharing(pack);
  console.log("\n----Test ScriptApp----");
  testScriptApp(pack);
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
  console.log("\n----Test Logger----");
  testLogger(pack);

  console.log("\n----Test lock----");
  testLock(pack);
  console.log("\n----Test mimetype----");
  testMimeType(pack);
  console.log("\n----Test workspaceevents----");
  testWorkspaceEvents(pack);



  console.log("\n----Test calendar----");
  testCalendars(pack);
  console.log("\n----Test calendarsandbox----");
  testCalendarSandbox(pack);

  console.log("\n----Test tasks----");
  testTasks(pack);
  console.log("\n----Test people----");
  testPeople(pack);
  console.log("\n----Test chat----");
  testChat(pack);
  console.log("\n----Test sandbox----");
  testSandbox(pack);
  console.log("\n----Test docs styles----");
  testDocsStyles(pack);
  console.log("\n----Test docs headers----");
  testDocsHeaders(pack);


  console.log("\n----Test SheetsValues----");
  testSheetsValues(pack);
  console.log("\n----Test SheetsDeveloper----");
  testSheetsDeveloper(pack);

  console.log("\n----Test slides----");
  testSlides(pack);
  console.log("\n----Test slides text range----");
  testSlidesTextRange(pack);
  console.log("\n----Test slidesparagraph----");
  testSlidesParagraph(pack);
  console.log("\n----Test slidesaffinetransform----");
  testSlidesAffineTransform(pack);
  console.log("\n----Test slidesautofit----");
  testSlidesAutofit(pack);
  console.log("\n----Test slidesautotext----");
  testSlidesAutoText(pack);
  console.log("\n----Test slidesconnectionsite----");
  testSlidesConnectionSite(pack);
  console.log("\n----Test slideslineprops----");
  testSlidesLineProps(pack);
  console.log("\n----Test slidesadv----");
  testSlidesAdv(pack);
  console.log("\n----Test slidesslide----");
  testSlidesSlide(pack);
  console.log("\n----Test Sheets Permissions----");
  testSheetsPermissions(pack);
  console.log("\n----Test Sheets----");
  testSheets(pack);

  console.log("\n----Test docs footers----");
  testDocsFooters(pack);
  console.log("\n----Test docs footnotes----");
  testDocsFootnotes(pack);


  console.log("\n----Test form----");
  testForm(pack);
  console.log("\n----Test formsadv----");
  testFormsAdv(pack);
  console.log("\n----Test formresponse----");
  testFormResponse(pack);

  console.log("\n----Test Sheets Data----");
  testSheetsData(pack);
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


  console.log("\n----Test Sheets Range----");
  testSheetsRange(pack);
  console.log("\n----TEST FILES COMPLETE----");


  // important - run this last for now - see https://github.com/brucemcpherson/gas-fakes/issues/118
  console.log("\n----Test gmail----");
  testGmail(pack);
  console.log("\n----Test sandbox gmail----");
  testSandboxGmail(pack);

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
    console.log("...cumulative calendar cache performance", getCalendarPerformance());
  }
  // final cleanup of all files created during the test run
  if (ScriptApp.isFake) {
    ScriptApp.__behavior.trash();
  }
  // all tests cumulative unit report
  unit.report();

};

// this required on Node but not on Apps Script
if (ScriptApp.isFake) testFakes();
