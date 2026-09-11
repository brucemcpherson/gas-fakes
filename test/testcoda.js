import "@mcpher/gas-fakes";
import { initTests } from "./testinit.js";
import { wrapupTest, checkBackend } from "./testassist.js";
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

  const folderMimeType = "application/vnd.google-apps.folder";

  /**
   * Phase 1: Exhaustively traverses all container folders into folderMap.
   */
  const discoverFolders = (currentFolder, folderMap, visited = new Set()) => {
    const folderId = currentFolder.getId();
    if (visited.has(folderId)) {
      return;
    }
    visited.add(folderId);
    folderMap.set(folderId, currentFolder);

    const childFolders = currentFolder.getFolders();
    while (childFolders.hasNext()) {
      const childFolder = childFolders.next();
      const childId = childFolder.getId();

      if (!visited.has(childId)) {
        ScriptApp.__behavior.addIdWhitelist(
          ScriptApp.__behavior.newIdWhitelistItem(childId)
        );
        discoverFolders(childFolder, folderMap, visited);
      }
    }
  };

  /**
   * Phase 2: Queries non-folder files within every discovered folder node.
   */
  const discoverFiles = (folderMap, fileMap) => {
    for (const [folderId, folder] of folderMap.entries()) {
      const childFiles = folder.getFiles();
      while (childFiles.hasNext()) {
        const file = childFiles.next();
        fileMap.set(file.getId(), { file, parentFolderId: folderId });
      }
    }
  };

  unit.section("coda research and existing doc structure", async (t) => {
    ScriptApp.__platform = "coda";
    const croot = DriveApp.getRootFolder();
    t.is(croot.getName(), "My Drive", "Root name is 'My Drive'");
    t.is(croot.getId(), "root", "Root ID is 'root'");
    t.is(croot.getMimeType(), folderMimeType, "Root MIME type is folder");

    const welcomeId = "Wb3DILwRgq";
    ScriptApp.__behavior.addIdWhitelist(
      ScriptApp.__behavior.newIdWhitelistItem(welcomeId)
    );

    const welcome = DriveApp.getFolderById(welcomeId);
    t.is(welcome.getName(), "Copy of The learn doc", "Doc title matches");
    t.is(
      welcome.getMimeType(),
      folderMimeType,
      "Coda Doc presents as a Folder container"
    );

    // 1. Phase 1: Container discovery
    const folderMap = new Map();
    discoverFolders(welcome, folderMap);

    t.is(folderMap.size, 11, "Discovered root doc and 10 subpage folder containers");

    // Expected pages mapping
    const expectedHierarchy = [
      { id: "canvas-bTjRQ3cUS7", name: "Welcome to Coda!", parent: null },
      { id: "canvas-DoXQXz9y6h", name: "Learn by watching", parent: null },
      { id: "canvas-DtOWV9HFiU", name: "Coda essentials", parent: "canvas-DoXQXz9y6h" },
      { id: "canvas-1F8C4n-Br7", name: "Formula essentials", parent: "canvas-DoXQXz9y6h" },
      { id: "canvas-PLHDVDMW-p", name: "Designing docs", parent: "canvas-DoXQXz9y6h" },
      { id: "canvas-cVZuuBNRTc", name: "Coda in action", parent: "canvas-DoXQXz9y6h" },
      { id: "canvas-iQgTrOc2lV", name: "Learn by doing", parent: null },
      { id: "canvas-atYcSQoQPp", name: "Exercises", parent: "canvas-iQgTrOc2lV" },
      { id: "canvas-uMO0XOnFt0", name: "Puzzles", parent: "canvas-iQgTrOc2lV" },
      { id: "canvas-wxZ_XrKJ0B", name: "Relevant reading", parent: null }
    ];

    // 2. Validate folder hierarchy
    for (const item of expectedHierarchy) {
      const fullId = `${welcomeId}/${item.id}`;
      const pageFolder = folderMap.get(fullId);

      t.true(is.object(pageFolder), `Folder container for page '${item.name}' exists`);
      t.is(pageFolder?.getName(), item.name, `Page title matches '${item.name}'`);

      const expectedParentId = item.parent ? `${welcomeId}/${item.parent}` : welcomeId;
      const actualParentId = pageFolder?.getParents().next().getId();
      t.is(actualParentId, expectedParentId, `Parent ID for '${item.name}' is correct`);
    }

    // 3. Phase 2: File discovery
    const fileMap = new Map();
    discoverFiles(folderMap, fileMap);

    // 4. Verify subpage content blobs by fetching file direct or via DriveApp
    const watchingSubpages = [
      { id: "canvas-DtOWV9HFiU", name: "Coda essentials" },
      { id: "canvas-1F8C4n-Br7", name: "Formula essentials" },
      { id: "canvas-PLHDVDMW-p", name: "Designing docs" },
      { id: "canvas-cVZuuBNRTc", name: "Coda in action" }
    ];

    for (const sub of watchingSubpages) {
      const parentPageId = `${welcomeId}/${sub.id}`;
      const parentFolder = folderMap.get(parentPageId);

      t.true(is.object(parentFolder), `Parent subpage folder exists: ${sub.name}`);

      // Retrieve canvas content file via direct file lookup or folder iterator
      let file;
      const filesIter = parentFolder.getFiles();

      if (filesIter.hasNext()) {
        file = filesIter.next();
      } else {
        // Fall back to getting canvas file directly by ID if folder file iterator yields empty
        file = DriveApp.getFileById(parentPageId);
      }

      t.true(is.object(file), `Subpage '${sub.name}' contains a canvas file`);

      if (file) {
        const blob = file.getBlob();
        t.is(blob.getMimeType(), "text/markdown", `${sub.name} file blob is text/markdown`);

        const content = blob.getDataAsString();
        t.true(
          is.string(content) && content.length > 0,
          `${sub.name} file contains non-empty canvas markdown content`
        );
        console.log(`\n--- SUBPAGE CONTENT: ${sub.name} (${sub.id}) ---`);
        console.log(content.slice(0, 300) + (content.length > 300 ? "..." : ""));
      }
    }
  });

  if (!pack) {
    unit.report();
  }

  ScriptApp.__platform = currentPlatform;
  return { unit, fixes };
};

wrapupTest(testCoda, false);