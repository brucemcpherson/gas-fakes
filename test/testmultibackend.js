/**
 * Test multi-backend switching and data transfer
 */
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';
import is from '@sindresorhus/is';

export const testMultiBackend = (pack) => {
  
  if (!ScriptApp.isFake) {
    console.log('...skipping Multi-Backend tests as not in fake mode');
    return pack;
  }

  // 1. IMPORT First to make ScriptApp available
  // 2. Configure authorized platforms BEFORE they are used
  // We want to authorize both for this test
  ScriptApp.__platformAuth = ['google', 'ksuite'];

  const { unit, fixes } = pack || initTests();
  const toTrash = [];

  // sandbox check
  const behavior = ScriptApp.__behavior;
  if (behavior) {
    behavior.sandboxMode = false; // Disable sandbox for discovery
  }

  unit.section('Google to KSuite data transfer', t => {
    // Start with Google
    ScriptApp.__platform = 'google';
    const gRoot = DriveApp.getRootFolder();
    t.is(gRoot.toString(), "My Drive", "Should start in Google Drive");

    const content = "Hello from Google Drive! Time: " + Date.now();
    const gFile = DriveApp.createFile("transfer-test-google.txt", content);
    toTrash.push(gFile);
    
    t.is(gFile.getBlob().getDataAsString(), content, "File created in Google correctly");
    const gId = gFile.getId();

    // Switch to KSuite
    ScriptApp.__platform = 'ksuite';
    const kRoot = DriveApp.getRootFolder();
    // In our implementation, KSuite root is "Private"
    t.is(kRoot.toString(), "Private", "Should have switched to KSuite (Infomaniak)");

    // Create file in KSuite with content from Google
    const kFile = DriveApp.createFile("transferred-from-google.txt", content);
    toTrash.push(kFile);

    t.is(kFile.getBlob().getDataAsString(), content, "Content transferred to KSuite correctly");
    t.not(kFile.getId(), gId, "File IDs should be different across platforms");
    
    const kId = kFile.getId();

    // Switch back to Google
    ScriptApp.__platform = 'google';
    t.is(DriveApp.getRootFolder().toString(), "My Drive", "Should be back in Google Drive");

    // Create a "receipt" in Google referencing the KSuite file
    const receiptContent = `Successfully transferred content to KSuite.
KSuite File ID: ${kId}
Source Google ID: ${gId}`;
    const receiptFile = DriveApp.createFile("transfer-receipt.txt", receiptContent);
    toTrash.push(receiptFile);

    t.true(receiptFile.getBlob().getDataAsString().includes(kId), "Receipt should contain KSuite ID");
  });

  unit.section('Advanced Drive cross-platform check', t => {
    // Advanced Drive 'Drive' also follows ScriptApp.__platform
    
    // Check Google
    ScriptApp.__platform = 'google';
    const gFiles = Drive.Files.list({pageSize: 1});
    t.true(Array.isArray(gFiles.files), "Should be able to list Google files via Advanced service");

    // Check KSuite
    ScriptApp.__platform = 'ksuite';
    const kFiles = Drive.Files.list({pageSize: 1});
    t.true(Array.isArray(kFiles.files), "Should be able to list KSuite files via Advanced service");
  });

  if (!pack) {
    unit.report();
  }

  // Cleanup
  unit.section('Multi-backend Cleanup', t => {
    // We need to trash files on their respective platforms
    toTrash.forEach(file => {
      try {
        const id = file.getId();
        const isGoogle = id.length > 20; 
        
        ScriptApp.__platform = isGoogle ? 'google' : 'ksuite';
        file.setTrashed(true);
        console.log(`...trashed ${id} on ${ScriptApp.__platform}`);
      } catch (err) {
        // console.log(`...failed to trash ${file.getId()}: ${err.message}`);
      }
    });
  });

  return { unit, fixes };
}

// Support running as a standalone test
if (process.argv[1].includes('testmultibackend.js')) {
  wrapupTest(testMultiBackend);
}
