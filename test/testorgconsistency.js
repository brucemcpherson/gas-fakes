// test consistency of drive gets across platforms
import "@mcpher/gas-fakes";
import { initTests } from "./testinit.js";
import { wrapupTest, checkBackend } from "./testassist.js";
import is from "@sindresorhus/is";

// no need for trashing files here as sanbox will take care of it and this test in not designed to run on live apps script
export const testOrgConsistency = (pack) => {
  const { unit, fixes } = pack || initTests();

  const initialPlatform = ScriptApp.__platform;

  const checkThese = [
    { platform: "coda", rootName: "mcpher.com" },
    { platform: "msgraph", rootName: "root" },
    { platform: "ksuite", rootName: "Private" },
    { platform: "google", rootName: "My Drive" },
  ];

  const checkFile = (file, type, t, parentName) => {
    t.true(is.nonEmptyString(file.getId()), `${type} id is a non-empty string`);
    t.true(
      is.nonEmptyString(file.getName()),
      `${type} name is a non-empty string`,
    );
    t.is(
      file.getParents().next().getName(),
      parentName,
      `${type} has correct parent`,
    );
  };
  checkThese.forEach((checkThis) => {
    if (!checkBackend(checkThis.platform)) {
      console.log(`...skipping ${checkThis.platform} backend not enabled`);
      return;
    }
    const { platform, rootName } = checkThis;
    ScriptApp.__platform = platform;

    unit.section(`${platform} root consistency check`, (t) => {
      const root = DriveApp.getRootFolder();
      t.is(rootName, root.getName(), "root name matched");
      t.true(is.nonEmptyString(root.getId()), "root id is a non-empty string");
    });

    unit.section(`${platform} top level folders check`, (t) => {
      const root = DriveApp.getRootFolder();
      const folders = root.getFolders();
      while (folders.hasNext()) {
        const folder = folders.next();
        checkFile(folder, "folder", t, rootName)
      }
    });

    unit.section(`${platform} top level files check`, (t) => {
      const root = DriveApp.getRootFolder();
      const files = root.getFiles();
      while (files.hasNext()) {
        const file = files.next();
        checkFile(file, "file", t, rootName);
      }
    });

    unit.section(`${platform} subfolders folders check`, (t) => {
      const root = DriveApp.getRootFolder();
      const folders = root.getFolders();
      while (folders.hasNext()) {
        const folder = folders.next();
        // the folder we've just opened wont be whitelisted so we need to allow reading of it as we know we can read its parent
        ScriptApp.__behavior.addIdWhitelist(ScriptApp.__behavior.newIdWhitelistItem(folder.getId()));
        const subFolders = folder.getFolders();
        // TODO coda is listing the parent of My Docs to be itself.....
        while (subFolders.hasNext()) { 
          const subFolder = subFolders.next(); 
          checkFile(subFolder, "folder", t, folder.getName())
        }
      }
    });

  });

  ScriptApp.__platform = initialPlatform;

  if (!pack) {
    unit.report();
  }

  return { unit, fixes };
};

// Support running as a standalone test
if (ScriptApp.isFake) {
  wrapupTest(testOrgConsistency);
} else {
  console.log("...skipping testOrgConsistency on live apps script");
}
