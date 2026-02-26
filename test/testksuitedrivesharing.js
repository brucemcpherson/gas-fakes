import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testKSuiteDriveSharing = (pack) => {
  const { unit, fixes } = pack || initTests();

  // Only run this test in fake mode as it requires KSUITE_TOKEN and platform switching
  if (!ScriptApp.isFake) {
    console.log('...skipping KSuite Drive Sharing tests as not in fake mode');
    return { unit, fixes };
  }

  if (!process.env.KSUITE_TOKEN) {
    console.log('...skipping KSuite Drive Sharing tests as KSUITE_TOKEN is not available');
    return { unit, fixes };
  }

  const behavior = ScriptApp.__behavior;
  const toTrash = [];

  // Helper to run a section with KSuite platform active and sandbox disabled
  const kSection = (name, fn) => {
    unit.section(name, (t) => {
      const originalPlatform = ScriptApp.__platform;
      const wasSandbox = behavior ? behavior.sandboxMode : false;

      ScriptApp.__platform = 'ksuite';
      if (behavior) behavior.sandboxMode = false;

      try {
        return fn(t);
      } finally {
        ScriptApp.__platform = originalPlatform;
        if (behavior) behavior.sandboxMode = wasSandbox;
      }
    });
  };

  kSection('KSuite DriveApp Sharing Methods', (t) => {
    const fileName = fixes.PREFIX + 'Sharing Test File ' + Date.now();
    const file = DriveApp.createFile(fileName, 'content');
    toTrash.push(file);

    // Default sharing (PRIVATE / NONE)
    t.is(file.getSharingAccess().toString(), 'PRIVATE', 'Default access should be PRIVATE');
    t.is(file.getSharingPermission().toString(), 'NONE', 'Default permission should be NONE');

    // Set sharing to ANYONE_WITH_LINK / VIEW
    console.log('Setting sharing to ANYONE_WITH_LINK / VIEW...');
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    t.is(file.getSharingAccess().toString(), 'ANYONE_WITH_LINK', 'Access should be ANYONE_WITH_LINK');
    t.is(file.getSharingPermission().toString(), 'VIEW', 'Permission should be VIEW');

    // Set sharing to ANYONE / EDIT (In KSuite, ANYONE maps to public share link too)
    console.log('Setting sharing to ANYONE / EDIT...');
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT);
    t.is(file.getSharingAccess().toString(), 'ANYONE_WITH_LINK', 'Access should be ANYONE_WITH_LINK (KSuite maps both to public link)');
    t.is(file.getSharingPermission().toString(), 'EDIT', 'Permission should be EDIT');

    // Back to PRIVATE
    console.log('Setting sharing back to PRIVATE...');
    file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
    t.is(file.getSharingAccess().toString(), 'PRIVATE', 'Access should be back to PRIVATE');
    t.is(file.getSharingPermission().toString(), 'NONE', 'Permission should be back to NONE');

    if (fixes.CLEAN) {
      console.log('Cleaning up in KSuite section...');
      trasher(toTrash);
      toTrash.length = 0; // Clear it so wrapupTest doesn't try again
    }
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testKSuiteDriveSharing);
