import "@mcpher/gas-fakes";
import { initTests } from "./testinit.js";
import {
  wrapupTest,
  createTrashCollector,
  trasher,
  checkBackend,
} from "./testassist.js";
import is from "@sindresorhus/is";

// note that in coda, the root folder is at the top level, but is a folder called My docs
// when you create a folder or file with no parent, it goes at the same level as My docs, not inside My docs (like other platforms)
// so you would need to explicitly create a file with DriveApp.getRootFolder().createFile(...) to put things in the My docs root foler.
// I dont know why this is yet or if this the correct behavior TBD

export const testCoda = (pack) => {
  const isCodaActive = checkBackend("coda");
  if (!isCodaActive) {
    console.log("Skipping Coda tests: CODA_API_KEY is not defined.");
    return pack;
  }
  const { unit, fixes } = pack || initTests();
  const currentPlatform = ScriptApp.__platform;
  ScriptApp.__platform = "coda";

  // this is the equivalent of My Drive in Drive - as its actually a workspace in coda
  const rootName = fixes.CODA_WORKSPACE;
  const docsName = fixes.CODA_MY_DRIVE
  const codaType = "application/vnd.coda.doc";
  const minFilesInRoot = 0; // actually we dont know
  const minFoldersInRoot = 1; // there should at least be My docs


  const toTrash = createTrashCollector();
  const prefix = fixes.PREFIX + "-" + "c" + "-";

  unit.section("Coda lists in root folder", (t) => {
    const root = DriveApp.getRootFolder();
    t.true(root.getId().startsWith("ws-"), "Root folder should be a workspace");
    // this will be mcpher.com or someone else's workspace name
    t.is(root.getName(), rootName, "Should be in Coda root folder 'My docs'");

    // there may or may not be some of these
    const top = root.getFiles();
    const files = [];
    while (top.hasNext()) {
      files.push(top.next());
    }
    t.true(
      files.length >= minFilesInRoot,
      "Should be at least " + minFilesInRoot + " files in root",
    );

    // the my drive equivalent at least should exist
    const topFolders = root.getFolders();
    const folders = [];
    while (topFolders.hasNext()) {
      folders.push(topFolders.next());
    }
    t.true(
      folders.length >= minFoldersInRoot,
      "Should be at least " + minFoldersInRoot + " file folders in root",
    );

    // we should have found the my drive equivalent
    t.truthy (folders.find (f=>f.getName() === docsName), 'should find my drive equivalent:' + docsName)

  });

  unit.section("Coda folder and file creation", (t) => {
    const rootFolder = DriveApp.getRootFolder();
    t.is(rootFolder.toString(), rootName);

    // folders
    const fname = prefix + "folder--of-junk";
    const folder = DriveApp.createFolder(fname);
    
    const mfolder = DriveApp.getFolderById(folder.getId());
    t.is(mfolder.getId(), folder.getId());
    t.is(DriveApp.getFolderById(folder.getId()).getSize(), 0);
    // some problem - is the created folder being added to the whitelist - doesnt seem to be
    // now can we create a fle in that folder
    // also empty file in root is still going to the my Docs folder.
    const testCreateFile = (fName, text = "", folder = rootFolder) => {
      fName = prefix + fName;
      const subFile = folder.createFile(fName, text);
      t.is(subFile.getName(), fName, "file created with correct name");
      t.is(
        subFile.getParents().next().getId(),
        folder.getId(),
        "parent properly discovered",
      );
      t.is(subFile.getMimeType(), codaType, "coda only has 1 type of doc");
      const retreivedFile = DriveApp.getFileById(subFile.getId());
      t.is(
        retreivedFile.getMimeType(),
        codaType,
        "retreived file matches type",
      );
      t.is(retreivedFile.getName(), fName, "retreived file matches name");
      t.is(
        retreivedFile.getParents().next().getId(),
        folder.getId(),
        "retreived file matches parent",
      );
      return subFile;
    };

    const f = testCreateFile("empty file in root");

    testCreateFile("empty file in folder of junk", "", folder);
    testCreateFile(
      "file in folder of junk",
      "some text in folder of junk",
      folder,
    );
    testCreateFile("file in root", "some text in root");
  });

  if (!pack) {
    unit.report();
  }

  if (fixes.CLEAN) trasher(toTrash);
  ScriptApp.__platform = currentPlatform;
  return { unit, fixes };
};

wrapupTest(testCoda);
