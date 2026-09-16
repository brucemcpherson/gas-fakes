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
          ScriptApp.__behavior.newIdWhitelistItem(childId),
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

  unit.section("research manual file getByName", (t) => {
    const sourceDocId = "DB19Al-hx7";
    ScriptApp.__behavior.addIdWhitelist(
      ScriptApp.__behavior.newIdWhitelistItem(sourceDocId),
    );

    const sourceDoc = DriveApp.getFolderById(sourceDocId);

    const folderMap = new Map();
    discoverFolders(sourceDoc, folderMap);

    const fileMap = new Map();
    discoverFiles(folderMap, fileMap);

    // Whitelist all discovered items so they are accessible by DriveApp
    for (const [id, fileEntry] of fileMap.entries()) {
      const file = fileEntry.file || fileEntry;
      ScriptApp.__behavior.addIdWhitelist(
        ScriptApp.__behavior.newIdWhitelistItem(file.getId()),
      );
    }

    // --- Test getFoldersByName ---
    console.log(`\n=== TESTING DriveApp.getFoldersByName() ===`);
    const folderNames = new Set();
    for (const entry of folderMap.values()) {
      const folder = entry.folder || entry;
      folderNames.add(folder.getName());
    }

    for (const name of folderNames) {
      console.log(`\nQuerying folders by name: "${name}"`);
      const iterator = DriveApp.getFoldersByName(name);
      let count = 0;
      while (iterator.hasNext()) {
        iterator.next();
        count++;
      }
      t.true(count > 0, `Should find at least 1 folder with name '${name}'`);
    }

    // --- Test getFilesByName ---
    console.log(`\n=== TESTING DriveApp.getFilesByName() ===`);
    const fileNames = new Set();
    for (const entry of fileMap.values()) {
      const item = entry.file || entry;
      // ONLY collect actual files, exclude folders/docs/pages!
      if (item.getMimeType() !== MimeType.FOLDER) {
        fileNames.add(item.getName());
      }
    }

    for (const name of fileNames) {
      console.log(`\nQuerying files by name: "${name}"`);
      const iterator = DriveApp.getFilesByName(name);
      let count = 0;
      while (iterator.hasNext()) {
        iterator.next();
        count++;
      }
      t.true(count > 0, `Should find at least 1 file with name '${name}'`);
    }

    // --- 3. Test Non-Existent Names ---
    console.log(
      `\n=== TESTING DriveApp.getFilesByName() & getFoldersByName() FOR MISSING ITEMS ===`,
    );

    const missingFolderName = "NonExistentFolder_12345";
    const missingFolderIter = DriveApp.getFoldersByName(missingFolderName);
    t.false(
      missingFolderIter.hasNext(),
      `getFoldersByName('${missingFolderName}') should have no items`,
    );

    const missingFileName = "NonExistentFile_12345.txt";
    const missingFileIter = DriveApp.getFilesByName(missingFileName);
    t.false(
      missingFileIter.hasNext(),
      `getFilesByName('${missingFileName}') should have no items`,
    );
  });

  unit.section("research manual file", (t) => {
    const sourceDocId = "DB19Al-hx7";
    ScriptApp.__behavior.addIdWhitelist(
      ScriptApp.__behavior.newIdWhitelistItem(sourceDocId),
    );

    const sourceDoc = DriveApp.getFolderById(sourceDocId);

    const folderMap = new Map();
    discoverFolders(sourceDoc, folderMap);

    const fileMap = new Map();
    discoverFiles(folderMap, fileMap);

    // Whitelist discovered files in the sandbox
    for (const [id, fileEntry] of fileMap.entries()) {
      const file = fileEntry.file || fileEntry;
      console.log(`...whitelisting ${id} : ${file.getName()}`);
      ScriptApp.__behavior.addIdWhitelist(
        ScriptApp.__behavior.newIdWhitelistItem(file.getId()),
      );
    }

    // --- 1. Log & Validate Discovered Folders / Pages & Links ---
    console.log(
      `\n=== DISCOVERED FOLDERS / PAGES & HREFS (${folderMap.size}) ===`,
    );
    for (const [id, folderObj] of folderMap.entries()) {
      const folder = folderObj.folder || folderObj;
      const webViewLink = folder.getUrl
        ? folder.getUrl()
        : folder.meta && folder.meta.webViewLink;

      console.log(`[Folder/Page] ID: ${id}`);
      console.log(`  Name:        "${folder.getName()}"`);
      console.log(`  Browser Link: ${webViewLink || "N/A"}`);

      t.true(
        Boolean(webViewLink),
        `Folder/Page ${id} should have a webViewLink`,
      );
      if (webViewLink) {
        t.true(
          webViewLink.startsWith("http://") ||
            webViewLink.startsWith("https://"),
          `Folder/Page ${id} link should be a valid HTTP(S) URL`,
        );
      }
    }

    // Assert specific subpage browser link
    const subPageFolder = folderMap.get("DB19Al-hx7/canvas-UhxoRbO5jB");
    if (subPageFolder) {
      const folder = subPageFolder.folder || subPageFolder;
      const url = folder.getUrl ? folder.getUrl() : folder.meta?.webViewLink;
      t.is(
        url,
        "https://docs.superhuman.com/d/_dDB19Al-hx7/_suRbO5jB",
        "Subpage canvas-UhxoRbO5jB should match expected browser href link",
      );
    }

    // --- 2. Log Discovered Files, Content & Links ---
    console.log(`\n=== DISCOVERED FILES & CONTENT (${fileMap.size}) ===`);
    for (const [id, fileEntry] of fileMap.entries()) {
      const file = fileEntry.file || fileEntry;
      const webViewLink = file.getUrl
        ? file.getUrl()
        : file.meta && file.meta.webViewLink;

      console.log(`\n----------------------------------------`);
      console.log(`[File] ID: ${id}`);
      console.log(`Name:      "${file.getName()}"`);
      console.log(`MimeType:  ${file.getMimeType()}`);
      console.log(`Parent ID: ${fileEntry.parentFolderId || "N/A"}`);
      console.log(`Link:      ${webViewLink || "N/A"}`);

      try {
        const content = file.getBlob().getDataAsString();
        console.log(`Content:\n${content || "(empty)"}`);
      } catch (err) {
        console.error(`Failed to read content for file ${id}:`, err.message);
      }
    }

    // --- 3. Verify Folder Metadata via DriveApp.getFolderById ---
    console.log(`\n=== METADATA VERIFICATION: FOLDERS (${folderMap.size}) ===`);
    for (const [id, folderObj] of folderMap.entries()) {
      const folder = folderObj.folder || folderObj;
      const expectedName = folder.getName();

      const fetchedFolder = DriveApp.getFolderById(id);

      t.true(
        Boolean(fetchedFolder),
        `DriveApp.getFolderById should return folder for ID: ${id}`,
      );
      if (fetchedFolder) {
        const fetchedName = fetchedFolder.getName();
        const fetchedUrl = fetchedFolder.getUrl();

        console.log(`[Folder Fetch] ID: ${id}`);
        console.log(`  Name: "${fetchedName}" | URL: ${fetchedUrl}`);

        t.is(
          fetchedFolder.getId(),
          id,
          `Fetched folder ID should match '${id}'`,
        );
        t.is(
          fetchedName,
          expectedName,
          `Fetched folder name should match expected '${expectedName}'`,
        );
        t.true(
          Boolean(fetchedUrl),
          `Fetched folder ${id} should have a valid URL`,
        );
      }
    }

    // --- 4. Verify File Metadata via DriveApp.getFileById ---
    console.log(`\n=== METADATA VERIFICATION: FILES (${fileMap.size}) ===`);
    for (const [id, fileEntry] of fileMap.entries()) {
      const file = fileEntry.file || fileEntry;
      const expectedName = file.getName();
      const expectedMime = file.getMimeType();

      const fetchedFile = DriveApp.getFileById(id);

      t.true(
        Boolean(fetchedFile),
        `DriveApp.getFileById should return file for ID: ${id}`,
      );
      if (fetchedFile) {
        const fetchedName = fetchedFile.getName();
        const fetchedMime = fetchedFile.getMimeType();
        const fetchedUrl = fetchedFile.getUrl();

        console.log(`[File Fetch] ID: ${id}`);
        console.log(
          `  Name: "${fetchedName}" | MimeType: ${fetchedMime} | URL: ${fetchedUrl}`,
        );

        t.is(fetchedFile.getId(), id, `Fetched file ID should match '${id}'`);
        t.is(
          fetchedName,
          expectedName,
          `Fetched file name should match expected '${expectedName}'`,
        );
        t.is(
          fetchedMime,
          expectedMime,
          `Fetched file MIME type should match expected '${expectedMime}'`,
        );
      }
    }

    // --- 5. Structured Table Test (Rows & Columns) ---
    console.log(`\n=== STRUCTURED TABLE DATA TEST ===`);
    const tableFileId = "DB19Al-hx7/grid-5pYJctWhs8";
    const tableEntry = fileMap.get(tableFileId);

    t.true(
      Boolean(tableEntry),
      "Table grid-5pYJctWhs8 should be discovered in fileMap",
    );

    if (tableEntry) {
      const tableFile = DriveApp.getFileById(tableFileId);
      const csvContent = tableFile.getBlob().getDataAsString();

      // Parse CSV into structured rows and columns
      const lines = csvContent
        .trim()
        .split("\n")
        .map((line) =>
          line.split(",").map((cell) => cell.replace(/^"|"$/g, "")),
        );

      const headers = lines[0] || [];
      const rows = lines.slice(1);

      console.log(`Headers (${headers.length}):`, headers);
      console.log(`Row Count: ${rows.length}`);

      t.is(headers.length, 4, "Table should have 4 columns");
      t.is(headers[0], "t1label", "First column header should be 't1label'");
      t.is(rows.length, 3, "Table should have 3 data rows");

      console.log("\nParsed Table Rows:");
      rows.forEach((row, idx) => {
        const rowObj = {};
        headers.forEach((h, colIdx) => {
          rowObj[h] = row[colIdx] || "";
        });
        console.log(`Row ${idx + 1}:`, JSON.stringify(rowObj));
      });

      // Verify specific cell assertions
      t.is(rows[0][0], "a", "Row 1, Column 1 should be 'a'");
      t.is(rows[0][1], "a2", "Row 1, Column 2 should be 'a2'");
      t.is(rows[2][2], "c3", "Row 3, Column 3 should be 'c3'");
    }
  });

  /*
  DB19Al-hx7 (Folder / Doc: "example doc title")
│
├── DB19Al-hx7/grid-5pYJctWhs8 (File / Table)
│   ├── Name: "table at top level"
│   ├── MimeType: null (Native Coda Grid)
│   ├── Parent: DB19Al-hx7/canvas-AkHaDeNcya
│   └── Format: CSV
│
├── DB19Al-hx7/canvas-AkHaDeNcya (Folder / Page: "example doc title")
│   └── DB19Al-hx7/canvas-AkHaDeNcya/_canvas (File / Content)
│       ├── Name: "example doc title"
│       ├── MimeType: text/markdown
│       └── Content: [Doc Canvas Text + Embedded Table Render]
│
└── DB19Al-hx7/canvas-UhxoRbO5jB (Folder / Page: "this is a page")
    └── DB19Al-hx7/canvas-UhxoRbO5jB/_canvas (File / Content)
        ├── Name: "this is a page"
        ├── MimeType: text/markdown
        └── Content: [Subpage Canvas Text + Embedded Table Render]
        */

  /**
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
*/
  if (!pack) unit.report();
  ScriptApp.__platform = currentPlatform;
  return { unit, fixes };
};

wrapupTest(testCoda, false);
