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
  const codaType = "application/vnd.coda.doc";
  const minFilesInRoot = 1; // at least these files in root folder


  const toTrash = createTrashCollector();
  const prefix = fixes.PREFIX + "-" + "c" + "-";

  unit.section("Coda lists in root folder", (t) => {
    const root = DriveApp.getRootFolder();
    t.true(root.getId().startsWith("ws-"), "Root folder should be a workspace");
    // this will be mcpher.com or someone else's workspace name
    t.is(root.getName(), rootName, "Should be in Coda root folder 'My docs'");
    // at this point we are getting the files not in a folder, but in the workspace
    // however I see that we get all the files, whether or not they are in a folder
    // TODO - this behavior is not like Drive - in the coda UI - the Home shows all files, but the Folders view is more like Drive
    // however AppsScript DriveApp.list without a folder filter will behave the same - lets check that then dup the behavior
    const top = root.getFiles();
    const files = [];
    while (top.hasNext()) {
      files.push(top.next());
    }
    t.true(
      files.length >= minFilesInRoot,
      "Should be at least " + minFilesInRoot + " files",
    );

    // because the 'root' in coda is the workspace not a folder
    files.forEach((f) => {
      t.true(is.nonEmptyString(f.getName()));
      t.true(is.nonEmptyString(f.getId()));
      t.is(f.getMimeType(), codaType);
      const parents = [];
      const p = f.getParents();
      while (p.hasNext()) {
        parents.push(p.next());
      }
      
      t.is(parents.length, 1, "Should have one parent");
      const [parent] = parents;
      t.is(parent.getId(), root.getId(), "Parent should be root folder");
      t.is(parent.getName(), root.getName(), "Parent should be root folder");

      const topFolders = DriveApp.getFolders();
      const folders = [];
      while (topFolders.hasNext()) {
        folders.push(topFolders.next());
      }
      t.is(folders.length, 1, "Should have one folder");
    });
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

    // now can we create a fle in that folder
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
    f.setTrashed(true);
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
