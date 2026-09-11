import "@mcpher/gas-fakes";
import { initTests } from "./testinit.js";
import {
  wrapupTest,
  createTrashCollector,
  trasher,
  checkBackend,
} from "./testassist.js";
import is from "@sindresorhus/is";

export const testCoda = (pack) => {
  const isCodaActive = checkBackend("coda");
  if (!isCodaActive) {
    console.log("Skipping Coda tests: CODA_API_KEY is not defined.");
    return pack;
  }
  const { unit, fixes } = pack || initTests();
  const currentPlatform = ScriptApp.__platform;
  ScriptApp.__platform = "coda";

  // In the Master Doc / Multi-Level model:
  // - "My Drive" is the virtual root container (Folder).
  // - Coda Docs and Pages act as Folder containers (folderMimeType).
  // - Leaf elements (Canvas content / Tables) act as Files (docMimeType / sheetMimeType).
  const rootName = fixes.CODA_MY_DRIVE || "My Drive";
  const docMimeType = "application/vnd.google-apps.document";
  const folderMimeType = "application/vnd.google-apps.folder";
  const sheetMimeType = "application/vnd.google-apps.spreadsheet";

  const toTrash = createTrashCollector();
  const prefix = fixes.PREFIX + "-" + "c" + "-";

unit.section("coda research", async (t) => {
  ScriptApp.__platform = "coda";
  const croot = DriveApp.getRootFolder();
  t.is(croot.getName(), "My Drive");
  t.is(croot.getId(), "root");
  t.is(croot.getMimeType(), folderMimeType);

  // Get existing white-listed doc
  const welcomeId = "Wb3DILwRgq";
  ScriptApp.__behavior.addIdWhitelist(
    ScriptApp.__behavior.newIdWhitelistItem(welcomeId)
  );

  // A Coda Doc presents as a Folder in Drive terms
  const welcome = DriveApp.getFolderById(welcomeId);
  t.is(welcome.getName(), "Copy of The learn doc");
  t.is(welcome.getMimeType(), folderMimeType);

  // Confirming a Doc cannot be accessed via getFileById
  const wf = t.threw(() => {
    DriveApp.getFileById(welcomeId);
  });
  t.rxMatch(wf.message, /file cant be a folder/);

  // Inspect Coda Custom Meta on the Doc
  const codaItem = welcome.meta.__platformCustom.item;
  t.is(codaItem.id, welcomeId);
  t.is(codaItem.type, "doc");
  t.true(codaItem.href.includes(welcome.getId()));

  // Inspect Child Pages inside the Doc
  const pages = [];
  const pl = welcome.getFolders(); // Pages act as child folders/files inside the doc container
  while (pl.hasNext()) {
    const page = pl.next();
    pages.push(page);

    // LOG REAL CANVAS METADATA & CONTENT STRUCTURE
    console.log("PAGE NAME:", page.getName());
    console.log("PAGE ID:", page.getId());
    console.log("PAGE META:", JSON.stringify(page.meta));

    // Fetch actual text content from the child page
    if (page.getBlob) {
      const pageText = page.getBlob().getDataAsString();
      console.log("PAGE CANVAS CONTENT:", JSON.stringify(pageText));
    }
  }

  t.is(pages.length, codaItem.docSize.pageCount);
});
  
  unit.section("Coda Master Doc root checks", (t) => {
    const root = DriveApp.getRootFolder();
    t.is(root.getId(), "root", "Root folder ID should be virtual 'root'");
    t.is(
      root.getName(),
      rootName,
      `Root folder name should match '${rootName}'`,
    );

    // Fetch top-level items in root
    const topFiles = root.getFiles();
    const files = [];
    while (topFiles.hasNext()) {
      files.push(topFiles.next());
    }
    t.true(is.array(files), "Files iterator should return an array of items");

    const topFolders = root.getFolders();
    const folders = [];
    while (topFolders.hasNext()) {
      folders.push(topFolders.next());
    }
    t.true(
      is.array(folders),
      "Folders iterator should return an array of items",
    );
  });

  unit.section("Coda folder and sub-page container creation", (t) => {
    const rootFolder = DriveApp.getRootFolder();
    t.is(rootFolder.getId(), "root");

    // 1. Create a top-level doc/folder using architecture naming
    const fname = prefix + "folder--of-junk";
    const folder = DriveApp.createFolder(fname);
    toTrash.push(folder);

    const mfolder = DriveApp.getFolderById(folder.getId());
    t.is(mfolder.getId(), folder.getId());
    t.is(mfolder.getName(), fname);
    t.is(
      mfolder.getMimeType(),
      folderMimeType,
      "Top-level doc/folder must have folder MIME type",
    );

    // Helper to test creation of page containers inside parent folders
    const testCreateFolderContainer = (
      fName,
      targetFolder = rootFolder
    ) => {
      fName = prefix + fName;
      const subFolder = targetFolder.createFolder(fName);
      toTrash.push(subFolder);

      t.is(subFolder.getName(), fName, "folder created with correct name");

      const parentId = subFolder.getParents().next().getId();
      t.is(
        parentId,
        targetFolder.getId(),
        "parent properly discovered as " + targetFolder.getId(),
      );

      t.is(
        subFolder.getMimeType(),
        folderMimeType,
        "page container should match folder MIME type",
      );

      // Verify retrieval by Folder ID
      const retrievedFolder = DriveApp.getFolderById(subFolder.getId());
      t.is(
        retrievedFolder.getMimeType(),
        folderMimeType,
        "retrieved folder matches type",
      );
      t.is(retrievedFolder.getName(), fName, "retrieved folder matches name");
      t.is(
        retrievedFolder.getParents().next().getId(),
        targetFolder.getId(),
        "retrieved folder matches parent",
      );

      return subFolder;
    };

    // 2. Test folder container creations at root and inside nested folders
    testCreateFolderContainer("empty file in root");
    testCreateFolderContainer("empty file in folder of junk", folder);
  });

  unit.section("Coda leaf elements with content inside page containers", (t) => {
    const rootFolder = DriveApp.getRootFolder();

    // Create a doc folder to hold content pages
    const docFolder = DriveApp.createFolder(prefix + "content-doc-container");
    toTrash.push(docFolder);

    // Create a page folder inside doc
    const pageFolder = docFolder.createFolder(prefix + "content-page-container");
    toTrash.push(pageFolder);

    // Helper to test leaf content element creation inside a page folder
    const testCreateLeafFile = (fName, text = "", targetFolder = pageFolder) => {
      fName = prefix + fName;
      const subFile = targetFolder.createFile(fName, text, docMimeType);
      toTrash.push(subFile);

      t.is(subFile.getName(), fName, "leaf file created with correct name");

      const parentId = subFile.getParents().next().getId();
      t.is(
        parentId,
        targetFolder.getId(),
        "parent properly discovered as page folder " + targetFolder.getId(),
      );

      t.is(
        subFile.getMimeType(),
        docMimeType,
        "leaf content element should match document MIME type",
      );

      // Verify retrieval by File ID
      const retrievedFile = DriveApp.getFileById(subFile.getId());
      t.is(
        retrievedFile.getMimeType(),
        docMimeType,
        "retrieved leaf file matches type",
      );
      t.is(retrievedFile.getName(), fName, "retrieved leaf file matches name");
      t.is(
        retrievedFile.getParents().next().getId(),
        targetFolder.getId(),
        "retrieved leaf file matches parent",
      );

      // Verify leaf content when present
      if (text) {
        const fileContent = retrievedFile.getBlob().getDataAsString();

        console.log("ACTUAL RETRIEVED CONTENT:", JSON.stringify(fileContent));
        console.log("EXPECTED SEARCH TEXT:", JSON.stringify(text));

        t.true(
          fileContent.includes(text),
          "retrieved leaf content matches initialized text",
        );
      }

      return subFile;
    };

    testCreateLeafFile(
      "file in folder of junk",
      "# Header\nsome text in folder of junk",
      pageFolder
    );
  });

  unit.section("Coda sub-page hierarchy & granular page deletion", (t) => {
    // Create parent folder/doc container
    const parentName = prefix + "parent-doc-page";
    const parentFolder = DriveApp.createFolder(parentName);
    toTrash.push(parentFolder);

    // Create sub-page folder container inside parent doc
    const childName = prefix + "child-subpage";
    const childPageFolder = parentFolder.createFolder(childName);
    toTrash.push(childPageFolder);

    t.is(childPageFolder.getParents().next().getId(), parentFolder.getId());
    t.is(
      childPageFolder.getMimeType(),
      folderMimeType,
      "child sub-page should be a folder container",
    );

    // Delete ONLY the sub-page folder
    childPageFolder.setTrashed(true);

    // Assert sub-page folder is trashed/inaccessible
    let isChildAccessible = true;
    try {
      const trashedCheck = DriveApp.getFolderById(childPageFolder.getId());
      isChildAccessible = !trashedCheck.isTrashed();
    } catch (e) {
      isChildAccessible = false;
    }
    t.false(isChildAccessible, "sub-page folder should be trashed/removed");

    // Assert parent doc folder is still active and untouched
    const retrievedParent = DriveApp.getFolderById(parentFolder.getId());
    t.is(
      retrievedParent.getId(),
      parentFolder.getId(),
      "parent document/folder remains intact after sub-page deletion",
    );
  });

  unit.section("Emulated Coda table / spreadsheet element isolation", (t) => {
    // Create parent page folder to hold emulated table element
    const pageName = prefix + "page-with-table";
    const pageFolder = DriveApp.createFolder(pageName);
    toTrash.push(pageFolder);

    // Create table element mapped to spreadsheet MIME type inside page folder
    const tableName = prefix + "embedded-table";
    const tableFile = pageFolder.createFile(
      tableName,
      JSON.stringify({ columns: ["A", "B"], rows: [] }),
      sheetMimeType,
    );
    toTrash.push(tableFile);

    t.is(
      tableFile.getMimeType(),
      sheetMimeType,
      "table element correctly mapped to spreadsheet mimeType",
    );
    t.is(
      tableFile.getParents().next().getId(),
      pageFolder.getId(),
      "table element parent is the hosting page folder",
    );

    // Retrieve leaf file directly via getFileById
    const retrievedTable = DriveApp.getFileById(tableFile.getId());
    t.is(retrievedTable.getId(), tableFile.getId(), "retrieved table ID matches");

    // Delete individual table element without deleting host page folder
    tableFile.setTrashed(true);

    const retrievedPage = DriveApp.getFolderById(pageFolder.getId());
    t.is(
      retrievedPage.getId(),
      pageFolder.getId(),
      "host page folder remains available after table element deletion",
    );
  });

  if (!pack) {
    unit.report();
  }

  if (fixes.CLEAN) trasher(toTrash);
  ScriptApp.__platform = currentPlatform;
  return { unit, fixes };
};

wrapupTest(testCoda, false);