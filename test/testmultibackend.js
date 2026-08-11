/**
 * Test multi-backend switching and data transfer
 */
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher, checkBackend, createTrashCollector } from './testassist.js';

export const testMultiBackend = (pack) => {

  const { unit, fixes } = pack || initTests();
  const toTrash = createTrashCollector();

  // Sandbox check
  const behavior = ScriptApp.__behavior;
  if (behavior) {
    behavior.sandboxMode = false; // Disable sandbox for discovery
  }

  // Google to KSuite data transfer (runs only if google and ksuite are authed)
  if (checkBackend('google') && checkBackend('ksuite')) {
    unit.section('Google to KSuite data transfer', t => {
      ScriptApp.__platform = 'google';
      const gRoot = DriveApp.getRootFolder();
      t.is(gRoot.toString(), "My Drive", "Should start in Google Drive");

      const content = "Hello from Google Drive! Time: " + Date.now();
      const gFile = DriveApp.createFile("transfer-test-google.txt", content);
      toTrash.push(gFile);
      t.is(gFile.getBlob().getDataAsString(), content, "File created in Google correctly");
      const gId = gFile.getId();

      ScriptApp.__platform = 'ksuite';
      const kRoot = DriveApp.getRootFolder();
      t.is(kRoot.toString(), "Private", "Should have switched to KSuite");

      const kFile = DriveApp.createFile("transferred-from-google.txt", content);
      toTrash.push(kFile);
      t.is(kFile.getBlob().getDataAsString(), content, "Content transferred to KSuite correctly");
      t.not(kFile.getId(), gId, "File IDs should be different across platforms");
    });
  } else {
    console.log('Skipping section: Google to KSuite data transfer (not fully authenticated)');
  }

  // MS Graph to KSuite data transfer (runs only if msgraph and ksuite are authed)
  if (checkBackend('msgraph') && checkBackend('ksuite')) {
    unit.section('MS Graph to KSuite data transfer', t => {
      ScriptApp.__platform = 'msgraph';
      const msRoot = DriveApp.getRootFolder();
      t.is(msRoot.getName(), "root", "Should be in MS Graph (OneDrive)");

      const content = "Hello from MS Graph! Time: " + Date.now();
      const msFile = DriveApp.createFile("transfer-test-msgraph.txt", content);
      toTrash.push(msFile);
      const msId = msFile.getId();

      ScriptApp.__platform = 'ksuite';
      const kFile = DriveApp.createFile("transferred-from-msgraph.txt", content);
      toTrash.push(kFile);
      const kId = kFile.getId();

      t.is(kFile.getBlob().getDataAsString(), content, "Content transferred from MS Graph to KSuite correctly");
      t.not(kId, msId, "File IDs should be different across platforms");
    });
  } else {
    console.log('Skipping section: MS Graph to KSuite data transfer (not fully authenticated)');
  }

  // Google to Coda data transfer (runs only if google and coda are authed)
  if (checkBackend('google') && checkBackend('coda')) {
    unit.section('Google to Coda data transfer', t => {
      ScriptApp.__platform = 'google';
      const gRoot = DriveApp.getRootFolder();
      t.is(gRoot.toString(), "My Drive", "Should start in Google Drive");

      const content = "Hello from Google Drive! Transferring to Coda. Time: " + Date.now();
      const gFile = DriveApp.createFile("transfer-test-google-to-coda.txt", content);
      toTrash.push(gFile);
      t.is(gFile.getBlob().getDataAsString(), content, "File created in Google correctly");
      const gId = gFile.getId();

      ScriptApp.__platform = 'coda';
      const cRoot = DriveApp.getRootFolder();
      t.is(cRoot.getName(), "My docs", "Should have switched to Coda");

      const cFile = DriveApp.createFile("transferred-from-google-to-coda.txt", content);
      toTrash.push(cFile);
      t.is(cFile.getName(), "transferred-from-google-to-coda.txt", "Coda file name matches");
      t.not(cFile.getId(), gId, "File IDs should be different across platforms");
      t.is(cFile.getBlob().getDataAsString(), content, "Content transferred to Coda correctly");
    });
  } else {
    console.log('Skipping section: Google to Coda data transfer (not fully authenticated)');
  }

  // MS Graph to Coda data transfer (runs only if msgraph and coda are authed)
  if (checkBackend('msgraph') && checkBackend('coda')) {
    unit.section('MS Graph to Coda data transfer', t => {
      ScriptApp.__platform = 'msgraph';
      const msRoot = DriveApp.getRootFolder();
      t.is(msRoot.getName(), "root", "Should be in MS Graph (OneDrive)");

      const content = "Hello from MS Graph! Transferring to Coda. Time: " + Date.now();
      const msFile = DriveApp.createFile("transfer-test-msgraph-to-coda.txt", content);
      toTrash.push(msFile);
      const msId = msFile.getId();

      ScriptApp.__platform = 'coda';
      const cFile = DriveApp.createFile("transferred-from-msgraph-to-coda.txt", content);
      toTrash.push(cFile);
      const cId = cFile.getId();

      t.is(cFile.getName(), "transferred-from-msgraph-to-coda.txt", "Coda file name matches");
      t.not(cId, msId, "File IDs should be different across platforms");
      t.is(cFile.getBlob().getDataAsString(), content, "Content transferred to Coda correctly");
    });
  } else {
    console.log('Skipping section: MS Graph to Coda data transfer (not fully authenticated)');
  }

  // Multi-platform binary (PDF & Image) transfer check
  if (checkBackend('google')) {
    unit.section('Multi-platform binary (PDF & Image) transfer check', t => {
      // 1. Fetch real PDF from Google Drive and real Image from URL
      ScriptApp.__platform = 'google';
      const pdfBlob = DriveApp.getFileById(fixes.PDF_ID).getBlob();
      const pdfBytes = pdfBlob.getBytes();
      const pdfName = fixes.PREFIX + "test-real-transfer.pdf";

      const imgBlob = UrlFetchApp.fetch(fixes.RANDOM_IMAGE).getBlob();
      const imgBytes = imgBlob.getBytes();
      const imgName = fixes.PREFIX + "test-real-transfer-image.png";

      const platforms = ['google', 'ksuite', 'msgraph', 'coda'].filter(p => checkBackend(p));

      platforms.forEach(platform => {
        ScriptApp.__platform = platform;
        
        try {
          // --- PDF Transfer ---
          // Upload PDF to platform
          const uploadedPdf = DriveApp.createFile(Utilities.newBlob(pdfBytes, 'application/pdf', pdfName));
          toTrash.push(uploadedPdf);
          t.is(uploadedPdf.getName(), pdfName, `PDF name should match on ${platform}`);

          // Retrieve PDF and verify bytes
          const retrievedPdf = DriveApp.getFileById(uploadedPdf.getId());
          t.deepEqual(retrievedPdf.getBlob().getBytes(), pdfBytes, `PDF binary bytes should match exactly on ${platform}`);

          // --- Image Transfer ---
          // Upload Image to platform
          const uploadedImg = DriveApp.createFile(Utilities.newBlob(imgBytes, 'image/png', imgName));
          toTrash.push(uploadedImg);
          t.is(uploadedImg.getName(), imgName, `Image name should match on ${platform}`);

          // Retrieve Image and verify bytes
          const retrievedImg = DriveApp.getFileById(uploadedImg.getId());
          t.deepEqual(retrievedImg.getBlob().getBytes(), imgBytes, `Image binary bytes should match exactly on ${platform}`);

        } catch (e) {
          // If a specific platform fails, log the error but allow the test to continue for others
          t.fail(`Test failed for platform ${platform}: ${e.message}`);
        }
      });
    });
  } else {
    console.log('Skipping section: Multi-platform binary transfer check (google backend not authenticated to fetch source files)');
  }

  // Advanced Drive cross-platform check (conditional for whichever are authenticated)
  unit.section('Advanced Drive cross-platform check', t => {
    const platformsToCheck = ['google', 'ksuite', 'msgraph', 'coda'].filter(p => checkBackend(p));
    
    platformsToCheck.forEach(platform => {
      ScriptApp.__platform = platform;
      const files = Drive.Files.list({ pageSize: 1 });
      t.true(Array.isArray(files.files), `Should be able to list ${platform} files via Advanced service`);
    });
  });

  if (!pack) {
    unit.report();
  }

  // Cleanup
  unit.section('Multi-backend Cleanup', t => {
    trasher(toTrash);
  });

  return { unit, fixes };
}

// Support running as a standalone test
wrapupTest(testMultiBackend);
