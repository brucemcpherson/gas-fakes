import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testDriveSharing = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('DriveApp Sharing Methods', (t) => {
    const file = DriveApp.createFile('Sharing Test File', 'content');
    toTrash.push(file);

    // Default sharing (PRIVATE / NONE)
    t.is(file.getSharingAccess().toString(), 'PRIVATE', 'Default access should be PRIVATE');
    t.is(file.getSharingPermission().toString(), 'NONE', 'Default permission should be NONE');

    // Set sharing to ANYONE_WITH_LINK / VIEW
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    t.is(file.getSharingAccess().toString(), 'ANYONE_WITH_LINK', 'Access should be ANYONE_WITH_LINK');
    t.is(file.getSharingPermission().toString(), 'VIEW', 'Permission should be VIEW');

    // Set sharing to ANYONE / EDIT
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT);
    t.is(file.getSharingAccess().toString(), 'ANYONE', 'Access should be ANYONE');
    t.is(file.getSharingPermission().toString(), 'EDIT', 'Permission should be EDIT');

    // Back to PRIVATE
    file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
    t.is(file.getSharingAccess().toString(), 'PRIVATE', 'Access should be back to PRIVATE');
    t.is(file.getSharingPermission().toString(), 'NONE', 'Permission should be back to NONE');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testDriveSharing);
