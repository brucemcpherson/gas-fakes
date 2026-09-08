import "@mcpher/gas-fakes";

import is from "@sindresorhus/is";

import { initTests } from "./testinit.js";
import { cachePerformance } from "./testassist.js";

export const testSandbox = (pack) => {
  const { unit, fixes } = pack || initTests();

  if (!ScriptApp.isFake) {
    console.log("Running in live apps script - skipping sandbox tests");
    return { unit, fixes };
  }

  // Save the initial state of the sandbox to restore it later, ensuring these tests don't affect others.
  const behavior = ScriptApp.__behavior;
  const initialState = {
    sandboxMode: behavior.sandboxMode,
    strictSandbox: behavior.strictSandbox,
    cleanup: behavior.cleanup,
    // a shallow copy is sufficient as the items themselves are not modified
    idWhitelist: behavior.idWhitelist ? [...behavior.idWhitelist] : null,
    serviceStates: {},
  };
  unit.section("init tests", (t) => {
    if (behavior.sandboxService) {
      const registered = ScriptApp.__registeredServices;
      const sandboxedServices = Object.keys(behavior.sandboxService).sort();
      const nonSandboxedServices = ["PropertiesService", "CacheService"];
      const loaded = ScriptApp.__loadedServices;
      t.true(
        is.nonEmptyArray(registered),
        "these are the services that have been registered",
      );
      t.true(
        is.nonEmptyArray(loaded),
        "these are the services that have been loaded",
      );

      t.deepEqual(
        loaded.filter((f) => !nonSandboxedServices.includes(f)).sort(),
        sandboxedServices.filter((f) => loaded.includes(f)),
      );

      registered.forEach((serviceName) => {
        const service = behavior.sandboxService[serviceName];
        // a bit naughty to access private property, but it's the only way to preserve state
        if (service && service.__state) {
          initialState.serviceStates[serviceName] = JSON.parse(
            JSON.stringify(service.__state),
          );
        }
      });
    }
  });

  // Helper to reset sandbox to the default state defined in testinit.js for each section
  const resetSandbox = () => {
    const behavior = ScriptApp.__behavior;
    // Reset global properties to test defaults
    behavior.sandboxMode = true;
    behavior.strictSandbox = true;
    behavior.cleanup = fixes.CLEAN;
    behavior.clearIdWhitelist();

    // Reset per-service properties
    if (behavior.sandboxService) {
      Object.keys(behavior.sandboxService).forEach((serviceName) => {
        const service = behavior.sandboxService[serviceName];
        if (service && service.clear) {
          service.clear();
        }
      });
    }
  };

  unit.section("Sandbox Mode Basics", (t) => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;

    // 1. Test strict sandbox mode (default)
    const fileName = fixes.PREFIX + "sandbox-session-file.txt";
    const file = DriveApp.createFile(fileName, "content");

    t.is(
      DriveApp.getFileById(file.getId()).getName(),
      fileName,
      "Should be able to access file created in session",
    );

    const err = t.threw(() => DriveApp.getFileById(fixes.TEXT_FILE_ID));
    t.rxMatch(
      err?.message,
      /Access to file .* is denied by sandbox rules/,
      "Should deny access to external file in strict mode",
    );

    // 2. Test non-strict sandbox mode
    behavior.strictSandbox = false;
    const externalFile = DriveApp.getFileById(fixes.TEXT_FILE_ID);
    t.is(
      externalFile.getId(),
      fixes.TEXT_FILE_ID,
      "Should allow access to external file in non-strict mode",
    );
  });

  unit.section("Sandbox Whitelisting", (t) => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;

    // 1. Whitelist a file for reading only (default)
    behavior.addIdWhitelist(behavior.newIdWhitelistItem(fixes.TEXT_FILE_ID));

    const readFile = DriveApp.getFileById(fixes.TEXT_FILE_ID);
    t.is(
      readFile.getName(),
      fixes.TEXT_FILE_NAME,
      "Should be able to read whitelisted file",
    );

    // Create a temporary file to test write-denial without modifying a shared fixture.
    const tempFile = DriveApp.createFile(
      "sandbox-write-test.txt",
      "original temp content",
    );
    const tempFileId = tempFile.getId();

    // Add the new file to the whitelist with read-only permissions (the default).
    behavior.addIdWhitelist(behavior.newIdWhitelistItem(tempFileId));

    const writeErr = t.threw(() => tempFile.setContent("new content"));
    t.rxMatch(
      writeErr?.message,
      /Write access to file .* is denied by sandbox whitelist rules/,
      "Should deny write access to read-only whitelisted file",
    );

    // Verify the content was not changed.
    t.is(
      DriveApp.getFileById(tempFileId).getBlob().getDataAsString(),
      "original temp content",
      "File content should not have changed after denied write.",
    );

    // 2. Whitelist a spreadsheet for reading
    const sheetId = fixes.TEST_SHEET_ID;
    behavior
      .clearIdWhitelist()
      .addIdWhitelist(behavior.newIdWhitelistItem(sheetId).setRead(true));

    const ss = SpreadsheetApp.openById(sheetId);
    t.is(ss.getId(), sheetId, "Should be able to open whitelisted spreadsheet");
    const sheet = ss.getSheets()[0];
    // should not throw
    t.not(
      sheet.getRange("A1").getValue(),
      null,
      "Should be able to read whitelisted spreadsheet",
    );
  });

  unit.section("Per-Service Sandbox Controls", (t) => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;

    // 1. Disable a service
    behavior.sandboxService.SlidesApp.enabled = false;
    const err = t.threw(() => SlidesApp.create("wont work"));
    t.rxMatch(
      err?.message,
      /SlidesApp service is disabled by sandbox settings/,
      "Should deny access to disabled service",
    );
    const ss = SpreadsheetApp.create("will work"); // Other services should still work
    t.is(ss.getName(), "will work", "Other services should remain enabled");

    // 2. Method Whitelist
    behavior.sandboxService.DriveApp.setMethodWhitelist(["createFolder"]);
    const folder = DriveApp.createFolder(fixes.PREFIX + "whitelist-folder");
    t.is(
      folder.getName(),
      fixes.PREFIX + "whitelist-folder",
      "createFolder should be allowed by methodWhitelist",
    );

    const fileErr = t.threw(() => DriveApp.createFile("wont-work.txt", ""));
    t.rxMatch(
      fileErr?.message,
      /Method DriveApp.createFile is not allowed by sandbox settings/,
      "createFile should be denied by methodWhitelist",
    );
  });

  unit.section("Sandbox with DocumentApp and SlidesApp", (t) => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;

    // Turn off sandbox mode temporarily to create test files we can use IDs from.
    // This prevents them from being added to the session's "known files" list.
    const wasSandbox = behavior.sandboxMode;
    behavior.sandboxMode = false;
    const doc = DocumentApp.create(fixes.PREFIX + "sandbox-doc-test");
    const pres = SlidesApp.create(fixes.PREFIX + "sandbox-slides-test");
    const docId = doc.getId();
    const presId = pres.getId();
    // We need to save and close to ensure the fakes framework commits the new files
    // before we try to open them by ID.
    doc.saveAndClose();
    pres.saveAndClose();
    behavior.sandboxMode = wasSandbox; // Restore sandbox mode for testing

    // 1. Test access is denied without whitelisting
    t.rxMatch(
      t.threw(() => DocumentApp.openById(docId))?.message,
      /Access to file .* is denied by sandbox rules/,
      "Should deny access to external Doc without whitelist",
    );

    t.rxMatch(
      t.threw(() => SlidesApp.openById(presId))?.message,
      /Access to file .* is denied by sandbox rules/,
      "Should deny access to external Presentation without whitelist",
    );

    // 2. Test read access with whitelisting
    behavior
      .addIdWhitelist(behavior.newIdWhitelistItem(docId))
      .addIdWhitelist(behavior.newIdWhitelistItem(presId));

    const openedDoc = DocumentApp.openById(docId);
    t.is(openedDoc.getId(), docId, "Should open whitelisted Doc");

    const openedPres = SlidesApp.openById(presId);
    t.is(openedPres.getId(), presId, "Should open whitelisted Presentation");

    // 3. Test write/trash permissions
    t.rxMatch(
      t.threw(() => openedDoc.getBody().appendParagraph("no write access"))
        ?.message,
      /Write access to file .* is denied by sandbox whitelist rules/,
      "Should deny write access to read-only whitelisted Doc",
    );

    // Now allow writing to the doc
    behavior.setIdWhitelist([
      behavior.newIdWhitelistItem(docId).setWrite(true),
      behavior.newIdWhitelistItem(presId), // keep this one read-only
    ]);
    openedDoc.getBody().appendParagraph("write access granted");
    t.is(
      DocumentApp.openById(docId).getBody().getText(),
      "\nwrite access granted",
      "Should allow writing to whitelisted Doc",
    );

    // Test trashing the presentation (should fail)
    t.rxMatch(
      t.threw(() => DriveApp.getFileById(presId).setTrashed(true))?.message,
      /Trash access to file .* is denied by sandbox whitelist rules/,
      "Should deny trash access to read-only whitelisted Presentation",
    );

    // Now allow trashing the presentation
    behavior.setIdWhitelist([
      behavior.newIdWhitelistItem(docId).setWrite(true),
      behavior.newIdWhitelistItem(presId).setTrash(true),
    ]);
    DriveApp.getFileById(presId).setTrashed(true);
    t.true(
      DriveApp.getFileById(presId).isTrashed(),
      "Should allow trashing of whitelisted Presentation",
    );
  });

  unit.section("Whitelist add/remove methods", (t) => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;

    // Test ID whitelist methods
    behavior.addIdWhitelist(behavior.newIdWhitelistItem("id1"));
    t.is(behavior.idWhitelist.length, 1, "addIdWhitelist should add one item");
    t.is(
      behavior.idWhitelist[0].id,
      "id1",
      "addIdWhitelist should add correct item",
    );

    behavior.addIdWhitelist(behavior.newIdWhitelistItem("id2"));
    t.is(
      behavior.idWhitelist.length,
      2,
      "addIdWhitelist should add a second item",
    );

    behavior.removeIdWhitelist("id1");
    t.is(
      behavior.idWhitelist.length,
      1,
      "removeIdWhitelist should remove an item",
    );
    t.is(
      behavior.idWhitelist[0].id,
      "id2",
      "removeIdWhitelist should leave correct item",
    );

    behavior.clearIdWhitelist();
    t.is(behavior.idWhitelist, null, "clearIdWhitelist should clear the list");

    // Test method whitelist methods
    const driveService = behavior.sandboxService.DriveApp;
    driveService.addMethodWhitelist("method1");
    t.is(
      driveService.methodWhitelist.length,
      1,
      "addMethodWhitelist should add one method",
    );
    t.is(
      driveService.methodWhitelist[0],
      "method1",
      "addMethodWhitelist should add correct method",
    );

    driveService.addMethodWhitelist("method2");
    t.is(
      driveService.methodWhitelist.length,
      2,
      "addMethodWhitelist should add a second method",
    );

    driveService.removeMethodWhitelist("method1");
    t.is(
      driveService.methodWhitelist.length,
      1,
      "removeMethodWhitelist should remove a method",
    );
    t.is(
      driveService.methodWhitelist[0],
      "method2",
      "removeMethodWhitelist should leave correct method",
    );

    driveService.clearMethodWhitelist();
    t.is(
      driveService.methodWhitelist,
      null,
      "clearMethodWhitelist should clear the list",
    );
  });

  // Restore the initial sandbox state
  behavior.sandboxMode = initialState.sandboxMode;
  behavior.strictSandbox = initialState.strictSandbox;
  behavior.cleanup = initialState.cleanup;
  behavior.setIdWhitelist(initialState.idWhitelist);

  if (behavior.sandboxService) {
    Object.keys(initialState.serviceStates).forEach((serviceName) => {
      const service = behavior.sandboxService[serviceName];
      if (service) {
        // a bit naughty, but necessary to restore private state
        service.__state = initialState.serviceStates[serviceName];
      }
    });
  }

  if (!pack) {
    unit.report();
  }

  return { unit, fixes };
};

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
  testSandbox();

  if (Drive.isFake) cachePerformance()

  ScriptApp.__behavior.trash();
}
