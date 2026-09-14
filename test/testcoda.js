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

  const discoverFolders = (currentFolder, folderMap, visited = new Set()) => {
    const folderId = currentFolder.getId();
    if (visited.has(folderId)) return;
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

  const discoverFiles = (folderMap, fileMap) => {
    for (const [folderId, folder] of folderMap.entries()) {
      const childFiles = folder.getFiles();
      while (childFiles.hasNext()) {
        const file = childFiles.next();
        fileMap.set(file.getId(), { file, parentFolderId: folderId });
      }
    }
  };

  unit.section("coda research and existing doc structure", (t) => {
    ScriptApp.__platform = "coda";

    const welcomeId = "Wb3DILwRgq";
    ScriptApp.__behavior.addIdWhitelist(
      ScriptApp.__behavior.newIdWhitelistItem(welcomeId)
    );

    const welcome = DriveApp.getFolderById(welcomeId);

    // 1. Discover Folders (1 Root + 10 Pages)
    const folderMap = new Map();
    discoverFolders(welcome, folderMap);
    t.is(folderMap.size, 11, "Discovered root doc and 10 subpage folder containers");

    // 2. Discover Non-Folder Files across all page containers
    const fileMap = new Map();
    discoverFiles(folderMap, fileMap);

    // Filter discovered files into Canvas Markdowns vs Tables/Views
    const canvasFiles = [];
    const tableFiles = [];

    for (const [fileId, { file, parentFolderId }] of fileMap.entries()) {
      if (fileId.endsWith("/_canvas")) {
        canvasFiles.push({ fileId, name: file.getName(), file, parentFolderId });
      } else {
        tableFiles.push({ fileId, name: file.getName(), file, parentFolderId });
      }
    }

    console.log(`\n--- DISCOVERY SUMMARY ---`);
    console.log(`Canvas Files Discovered: ${canvasFiles.length} (Expected: 10)`);
    console.log(`Tables/Views Discovered: ${tableFiles.length} (Expected: 13)`);

    t.is(canvasFiles.length, 10, "Discovered all 10 page canvas files");
    t.is(
      tableFiles.length,
      13,
      "Discovered all 13 tables/views reported in docSize metadata"
    );

    // 3. Log details and markdown content for all discovered canvas pages
    if (canvasFiles.length > 0) {
      console.log(`\n==================================================`);
      console.log(`             CANVAS PAGES CONTENT LOG             `);
      console.log(`==================================================`);
      
      for (const item of canvasFiles) {
        console.log(`\n--------------------------------------------------`);
        console.log(`[CANVAS ITEM] ID: ${item.fileId}`);
        console.log(`[NAME]: ${item.name}`);
        console.log(`[PARENT CONTAINER]: ${item.parentFolderId}`);
        console.log(`------------------- CONTENT ----------------------`);
        try {
          const content = item.file.getBlob().getDataAsString();
          console.log(content && content.trim() ? content : "(Empty canvas content)");
        } catch (err) {
          console.log(`[ERROR READING CANVAS]: ${err.message}`);
        }
      }
      console.log(`==================================================\n`);
    }

    // 4. Log all discovered tables/views details
    if (tableFiles.length > 0) {
      console.log(`\n--- DISCOVERED TABLES AND VIEWS ---`);
      for (const item of tableFiles) {
        console.log(`[TABLE ITEM] ID: ${item.fileId} | Name: "${item.name}" | Parent: ${item.parentFolderId}`);
      }
    }
  });

  unit.section("recreate coda doc structure and canvas content", (t) => {
    ScriptApp.__platform = "coda";

    const sourceDocId = "Wb3DILwRgq";
    ScriptApp.__behavior.addIdWhitelist(
      ScriptApp.__behavior.newIdWhitelistItem(sourceDocId)
    );

    const sourceDoc = DriveApp.getFolderById(sourceDocId);

    // 1. Create a new target Coda document
    const targetDocName = `Recreated - ${sourceDoc.getName()} (${new Date().toISOString().slice(0, 10)})`;
    const targetDoc = DriveApp.createFolder(targetDocName);
    const targetDocId = targetDoc.getId();

    ScriptApp.__behavior.addIdWhitelist(
      ScriptApp.__behavior.newIdWhitelistItem(targetDocId)
    );

    console.log(`\n==================================================`);
    console.log(`[RECREATION] Created new Coda Doc container`);
    console.log(`[NEW DOC NAME]: ${targetDocName}`);
    console.log(`[NEW DOC ID]:   ${targetDocId}`);
    console.log(`==================================================\n`);

    t.truthy(targetDocId, "Target Coda document created successfully");

    // Map source folder ID -> target folder instance
    const folderMapping = new Map();
    folderMapping.set(sourceDocId, targetDoc);

    // 2. Recursively clone subpages and copy canvas contents
    const recreateBranch = (sourceFolder, targetFolder) => {
      // Replicate child pages
      const childFolders = sourceFolder.getFolders();
      while (childFolders.hasNext()) {
        const sourceSubPage = childFolders.next();
        const subPageName = sourceSubPage.getName();

        console.log(`[RECREATING PAGE]: "${subPageName}" inside "${targetFolder.getName()}"`);
        
        // Create child page in target doc
        const targetSubPage = targetFolder.createFolder(subPageName);
        const targetSubPageId = targetSubPage.getId();

        ScriptApp.__behavior.addIdWhitelist(
          ScriptApp.__behavior.newIdWhitelistItem(targetSubPageId)
        );

        folderMapping.set(sourceSubPage.getId(), targetSubPage);

        // Copy canvas markdown content if available
        const sourceFiles = sourceSubPage.getFiles();
        while (sourceFiles.hasNext()) {
          const file = sourceFiles.next();
          if (file.getId().endsWith("/_canvas")) {
            try {
              const canvasContent = file.getBlob().getDataAsString();
              if (canvasContent && canvasContent.trim()) {
                console.log(`  └─ Copying canvas content (${canvasContent.length} bytes)...`);
                
                // Write content into new target page's synthetic canvas file
                const targetCanvasFiles = targetSubPage.getFiles();
                while (targetCanvasFiles.hasNext()) {
                  const targetCanvas = targetCanvasFiles.next();
                  if (targetCanvas.getId().endsWith("/_canvas")) {
                    targetCanvas.setContent(canvasContent);
                  }
                }
              }
            } catch (err) {
              console.error(`  └─ Error copying canvas content for "${subPageName}":`, err.message);
            }
          }
        }

        // Recurse down sub-branches
        recreateBranch(sourceSubPage, targetSubPage);
      }
    };

    // Execute tree replication starting from root doc
    recreateBranch(sourceDoc, targetDoc);

    // Verify recreated structure count
    const targetFolderMap = new Map();
    discoverFolders(targetDoc, targetFolderMap);

    console.log(`\n[RECREATION SUMMARY] Recreated ${targetFolderMap.size - 1} pages in new doc ${targetDocId}`);
    t.is(targetFolderMap.size, 11, "Successfully recreated root doc and all 10 subpage folder containers");
  });

  if (!pack) unit.report();
  ScriptApp.__platform = currentPlatform;
  return { unit, fixes };
};

wrapupTest(testCoda, false);