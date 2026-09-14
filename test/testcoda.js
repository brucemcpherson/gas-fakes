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

unit.section("research manual file", (t) => {
    const sourceDocId = "DB19Al-hx7";
    ScriptApp.__behavior.addIdWhitelist(
      ScriptApp.__behavior.newIdWhitelistItem(sourceDocId)
    );

    const sourceDoc = DriveApp.getFolderById(sourceDocId);

    const folderMap = new Map();
    discoverFolders(sourceDoc, folderMap);

    const fileMap = new Map();
    discoverFiles(folderMap, fileMap);

    // Whitelist discovered files in the sandbox
    for (const [id, fileEntry] of fileMap.entries()) {
      const file = fileEntry.file || fileEntry;
      ScriptApp.__behavior.addIdWhitelist(
        ScriptApp.__behavior.newIdWhitelistItem(file.getId())
      );
    }

    // --- Log Discovered Folders ---
    console.log(`\n=== DISCOVERED FOLDERS (${folderMap.size}) ===`);
    for (const [id, folderObj] of folderMap.entries()) {
      const folder = folderObj.folder || folderObj;
      console.log(`[Folder] ID: ${id} | Name: "${folder.getName()}"`);
    }

    // --- Log Discovered Files & Contents ---
    console.log(`\n=== DISCOVERED FILES & CONTENT (${fileMap.size}) ===`);
    for (const [id, fileEntry] of fileMap.entries()) {
      const file = fileEntry.file || fileEntry;

      console.log(`\n----------------------------------------`);
      console.log(`[File] ID: ${id}`);
      console.log(`Name:      "${file.getName()}"`);
      console.log(`MimeType:  ${file.getMimeType()}`);
      console.log(`Parent ID: ${fileEntry.parentFolderId || "N/A"}`);

      try {
        const content = file.getBlob().getDataAsString();
        console.log(`Content:\n${content || "(empty)"}`);
      } catch (err) {
        console.error(`Failed to read content for file ${id}:`, err.message);
      }
    }

    // --- Structured Table Test (Rows & Columns) ---
    console.log(`\n=== STRUCTURED TABLE DATA TEST ===`);
    const tableFileId = "DB19Al-hx7/grid-5pYJctWhs8";
    const tableEntry = fileMap.get(tableFileId);
    
    t.true(Boolean(tableEntry), "Table grid-5pYJctWhs8 should be discovered in fileMap");

    if (tableEntry) {
      const tableFile = tableEntry.file || tableEntry;
      const csvContent = tableFile.getBlob().getDataAsString();

      // Parse CSV into structured rows and columns
      const lines = csvContent.trim().split("\n").map((line) =>
        line.split(",").map((cell) => cell.replace(/^"|"$/g, ""))
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
📁 example doc title (Doc Root: DB19Al-hx7)
├── 📄 example doc title (Landing Page / Canvas Container)
│   │   [ID: DB19Al-hx7/canvas-AkHaDeNcya]
│   │   [Parent: DB19Al-hx7]
│   │
│   ├── 📝 example doc title.md (Canvas Markdown Content)
│   │       [ID: DB19Al-hx7/canvas-AkHaDeNcya/_canvas]
│   │       [Type: Synthetic File (text/markdown)]
│   │
│   └── 📊 table at top level (Coda Base Table)
│           [ID: DB19Al-hx7/grid-5pYJctWhs8]
│           [Type: Table (grid)]
│
└── 📄 this is a page (Subpage Container)
    │   [ID: DB19Al-hx7/canvas-UhxoRbO5jB]
    │   [Parent: DB19Al-hx7]
    │
    └── 📝 this is a page.md (Canvas Markdown Content)
            [ID: DB19Al-hx7/canvas-UhxoRbO5jB/_canvas]
            [Type: Synthetic File (text/markdown)]

{
  "meta": {
    "createdTime": null,
    "id": "DB19Al-hx7",
    "kind": "drive#file",
    "md5Checksum": null,
    "mimeType": "application/vnd.google-apps.folder",
    "modifiedTime": null,
    "name": "example doc title",
    "parents": [
      "root"
    ],
    "size": null,
    "trashed": false,
    "webViewLink": "https://docs.superhuman.com/d/_dDB19Al-hx7",
    "platform": "coda",
    "__platformCustom": {
      "docId": "DB19Al-hx7",
      "pageId": null,
      "isDoc": true,
      "isPage": false,
      "isFolder": true,
      "contentType": "folder",
      "item": {
        "id": "DB19Al-hx7",
        "type": "doc",
        "href": "https://coda.io/apis/v1/docs/DB19Al-hx7",
        "browserLink": "https://docs.superhuman.com/d/_dDB19Al-hx7",
        "name": "example doc title",
        "owner": "bruce@mcpher.com",
        "ownerName": "Bruce Mcpherson",
        "createdAt": "2026-09-14T09:21:36.118Z",
        "updatedAt": "2026-09-14T09:25:54.046Z",
        "docSize": {
          "totalRowCount": 3,
          "tableAndViewCount": 1,
          "pageCount": 2,
          "overApiSizeLimit": false,
          "baseTableCount": 1
        },
        "workspaceId": "ws-g2n-BQgmpN",
        "folderId": "fl-Vn2t1pUvlj",
        "workspace": {
          "id": "ws-g2n-BQgmpN",
          "type": "workspace",
          "browserLink": "https://docs.superhuman.com/docs?workspaceId=ws-g2n-BQgmpN",
          "name": "mcpher.com"
        },
        "folder": {
          "id": "fl-Vn2t1pUvlj",
          "type": "folder",
          "browserLink": "https://docs.superhuman.com/folders/fl-Vn2t1pUvlj",
          "name": "My docs"
        }
      }
    },
    "__rootRequested": false
  },
  "__gas_fake_service": "DriveApp",
  "platform": "coda",
  "folderApp": {}
}
[
  {
    "meta": {
      "createdTime": null,
      "id": "DB19Al-hx7",
      "kind": "drive#file",
      "md5Checksum": null,
      "mimeType": "application/vnd.google-apps.folder",
      "modifiedTime": null,
      "name": "example doc title",
      "parents": [
        "root"
      ],
      "size": null,
      "trashed": false,
      "webViewLink": "https://docs.superhuman.com/d/_dDB19Al-hx7",
      "platform": "coda",
      "__platformCustom": {
        "docId": "DB19Al-hx7",
        "pageId": null,
        "isDoc": true,
        "isPage": false,
        "isFolder": true,
        "contentType": "folder",
        "item": {
          "id": "DB19Al-hx7",
          "type": "doc",
          "href": "https://coda.io/apis/v1/docs/DB19Al-hx7",
          "browserLink": "https://docs.superhuman.com/d/_dDB19Al-hx7",
          "name": "example doc title",
          "owner": "bruce@mcpher.com",
          "ownerName": "Bruce Mcpherson",
          "createdAt": "2026-09-14T09:21:36.118Z",
          "updatedAt": "2026-09-14T09:25:54.046Z",
          "docSize": {
            "totalRowCount": 3,
            "tableAndViewCount": 1,
            "pageCount": 2,
            "overApiSizeLimit": false,
            "baseTableCount": 1
          },
          "workspaceId": "ws-g2n-BQgmpN",
          "folderId": "fl-Vn2t1pUvlj",
          "workspace": {
            "id": "ws-g2n-BQgmpN",
            "type": "workspace",
            "browserLink": "https://docs.superhuman.com/docs?workspaceId=ws-g2n-BQgmpN",
            "name": "mcpher.com"
          },
          "folder": {
            "id": "fl-Vn2t1pUvlj",
            "type": "folder",
            "browserLink": "https://docs.superhuman.com/folders/fl-Vn2t1pUvlj",
            "name": "My docs"
          }
        }
      },
      "__rootRequested": false
    },
    "__gas_fake_service": "DriveApp",
    "platform": "coda",
    "folderApp": {}
  },
  {
    "meta": {
      "__rootRequested": false,
      "platform": "coda",
      "id": "DB19Al-hx7/canvas-AkHaDeNcya",
      "name": "example doc title",
      "mimeType": "application/vnd.google-apps.folder",
      "kind": "drive#file",
      "parents": [
        "DB19Al-hx7"
      ],
      "trashed": false,
      "webViewLink": "https://docs.superhuman.com/d/_dDB19Al-hx7/_suKO9QRn",
      "__platformCustom": {
        "docId": "DB19Al-hx7",
        "pageId": "canvas-AkHaDeNcya",
        "isDoc": false,
        "isPage": true,
        "isFolder": true,
        "contentType": "folder",
        "item": {
          "id": "canvas-AkHaDeNcya",
          "type": "page",
          "href": "https://coda.io/apis/v1/docs/DB19Al-hx7/pages/canvas-AkHaDeNcya",
          "name": "example doc title",
          "subtitle": "",
          "contentType": "canvas",
          "isHidden": false,
          "isEffectivelyHidden": false,
          "browserLink": "https://docs.superhuman.com/d/_dDB19Al-hx7/_suKO9QRn",
          "children": [],
          "authors": [
            {
              "@context": "http://schema.org/",
              "@type": "Person",
              "name": "Bruce Mcpherson",
              "email": "bruce@mcpher.com"
            }
          ],
          "createdAt": "2026-09-14T09:21:36.175Z",
          "updatedAt": "2026-09-14T09:25:54.046Z",
          "createdBy": {
            "@context": "http://schema.org/",
            "@type": "Person",
            "name": "Bruce Mcpherson",
            "email": "bruce@mcpher.com"
          },
          "updatedBy": {
            "@context": "http://schema.org/",
            "@type": "Person",
            "name": "Bruce Mcpherson",
            "email": "bruce@mcpher.com"
          }
        }
      }
    },
    "__gas_fake_service": "DriveApp",
    "platform": "coda",
    "folderApp": {}
  },
  {
    "meta": {
      "__rootRequested": false,
      "platform": "coda",
      "id": "DB19Al-hx7/canvas-UhxoRbO5jB",
      "name": "this is a page",
      "mimeType": "application/vnd.google-apps.folder",
      "kind": "drive#file",
      "parents": [
        "DB19Al-hx7"
      ],
      "trashed": false,
      "webViewLink": "https://docs.superhuman.com/d/_dDB19Al-hx7/_suRbO5jB",
      "__platformCustom": {
        "docId": "DB19Al-hx7",
        "pageId": "canvas-UhxoRbO5jB",
        "isDoc": false,
        "isPage": true,
        "isFolder": true,
        "contentType": "folder",
        "item": {
          "id": "canvas-UhxoRbO5jB",
          "type": "page",
          "href": "https://coda.io/apis/v1/docs/DB19Al-hx7/pages/canvas-UhxoRbO5jB",
          "name": "this is a page",
          "subtitle": "",
          "contentType": "canvas",
          "isHidden": false,
          "isEffectivelyHidden": false,
          "browserLink": "https://docs.superhuman.com/d/_dDB19Al-hx7/_suRbO5jB",
          "children": [],
          "authors": [
            {
              "@context": "http://schema.org/",
              "@type": "Person",
              "name": "Bruce Mcpherson",
              "email": "bruce@mcpher.com"
            }
          ],
          "createdAt": "2026-09-14T09:22:33.338Z",
          "updatedAt": "2026-09-14T09:24:16.719Z",
          "createdBy": {
            "@context": "http://schema.org/",
            "@type": "Person",
            "name": "Bruce Mcpherson",
            "email": "bruce@mcpher.com"
          },
          "updatedBy": {
            "@context": "http://schema.org/",
            "@type": "Person",
            "name": "Bruce Mcpherson",
            "email": "bruce@mcpher.com"
          }
        }
      }
    },
    "__gas_fake_service": "DriveApp",
    "platform": "coda",
    "folderApp": {}
  }
]

[
  {
    "file": {
      "meta": {
        "__rootRequested": false,
        "platform": "coda",
        "id": "DB19Al-hx7/grid-5pYJctWhs8",
        "name": "table at top level",
        "kind": "drive#file",
        "parents": [
          "DB19Al-hx7/canvas-AkHaDeNcya"
        ],
        "trashed": false,
        "webViewLink": "https://docs.superhuman.com/d/_dDB19Al-hx7#_tugrid-5pYJctWhs8",
        "__platformCustom": {
          "docId": "DB19Al-hx7",
          "pageId": "canvas-AkHaDeNcya",
          "isDoc": false,
          "isPage": false,
          "isFolder": false,
          "contentType": "table",
          "item": {
            "id": "grid-5pYJctWhs8",
            "type": "table",
            "tableType": "table",
            "href": "https://coda.io/apis/v1/docs/DB19Al-hx7/tables/grid-5pYJctWhs8",
            "browserLink": "https://docs.superhuman.com/d/_dDB19Al-hx7#_tugrid-5pYJctWhs8",
            "name": "table at top level",
            "parent": {
              "id": "canvas-AkHaDeNcya",
              "type": "page",
              "href": "https://coda.io/apis/v1/docs/DB19Al-hx7/pages/canvas-AkHaDeNcya",
              "browserLink": "https://docs.superhuman.com/d/_dDB19Al-hx7/_suDeNcya",
              "name": "example doc title"
            }
          }
        }
      },
      "__gas_fake_service": "DriveApp",
      "platform": "coda"
    },
    "parentFolderId": "DB19Al-hx7/canvas-AkHaDeNcya"
  },
  {
    "file": {
      "meta": {
        "__rootRequested": false,
        "platform": "coda",
        "id": "DB19Al-hx7/canvas-AkHaDeNcya/_canvas",
        "name": "example doc title.md",
        "mimeType": "text/markdown",
        "kind": "drive#file",
        "parents": [
          "DB19Al-hx7/canvas-AkHaDeNcya"
        ],
        "trashed": false,
        "webViewLink": "https://coda.io/d/_dDB19Al-hx7/_sucanvas-AkHaDeNcya",
        "__platformCustom": {
          "docId": "DB19Al-hx7",
          "pageId": "canvas-AkHaDeNcya",
          "isDoc": false,
          "isPage": false,
          "isFolder": false,
          "isSynthetic": true,
          "syntheticType": "canvas",
          "contentType": "canvas"
        }
      },
      "__gas_fake_service": "DriveApp",
      "platform": "coda"
    },
    "parentFolderId": "DB19Al-hx7/canvas-AkHaDeNcya"
  },
  {
    "file": {
      "meta": {
        "__rootRequested": false,
        "platform": "coda",
        "id": "DB19Al-hx7/canvas-UhxoRbO5jB/_canvas",
        "name": "this is a page.md",
        "mimeType": "text/markdown",
        "kind": "drive#file",
        "parents": [
          "DB19Al-hx7/canvas-UhxoRbO5jB"
        ],
        "trashed": false,
        "webViewLink": "https://coda.io/d/_dDB19Al-hx7/_sucanvas-UhxoRbO5jB",
        "__platformCustom": {
          "docId": "DB19Al-hx7",
          "pageId": "canvas-UhxoRbO5jB",
          "isDoc": false,
          "isPage": false,
          "isFolder": false,
          "isSynthetic": true,
          "syntheticType": "canvas",
          "contentType": "canvas"
        }
      },
      "__gas_fake_service": "DriveApp",
      "platform": "coda"
    },
    "parentFolderId": "DB19Al-hx7/canvas-UhxoRbO5jB"
  }
]

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