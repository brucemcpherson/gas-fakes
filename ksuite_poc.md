# KSuite Integration: Apps Script as a "Lingua Franca"

This document explains the architectural changes made to `gas-fakes` to support **Infomaniak KSuite** as a target platform. The core objective is to allow standard Google Apps Script code to run against non-Google platforms with zero or minimal modification.

## 1. The "Lingua Franca" Concept

The idea is to use the Google Apps Script API surface (e.g., `DriveApp`, `SpreadsheetApp`) as a universal interface for workspace products. 

*   **Logic**: Your business logic remains written in standard GAS.
*   **Steering**: You tell `gas-fakes` which backend to use via `ScriptApp.__platform`.
*   **Translation**: `gas-fakes` intercepts the calls and translates them to the target platform's API (in this case, Infomaniak V3).

## 2. Architectural Overview

### Platform Steering
A new property `__platform` was added to the `ScriptApp` global.
*   `ScriptApp.__platform = 'workspace'` (Default): Hits Google APIs.
*   `ScriptApp.__platform = 'ksuite'`: Intercepts calls and routes them to the KSuite translation layer.

### Interception Point
The translation happens at the `Syncit` / Worker level. When a script calls `DriveApp.getRootFolder()`, the request is sent to the worker thread. The worker checks `Auth.getPlatform()` and, if set to `ksuite`, routes the request through the `KSuiteDrive` translator instead of the standard `googleapis` client.

## 3. KSuite Implementation Details

### Dynamic Discovery
Infomaniak's API is multi-tenant and requires specific IDs (`account_id`, `drive_id`). To keep the experience seamless, `gas-fakes` performs **Dynamic Discovery**:
1.  **Account Discovery**: Probes `/1/account` or `/profile` to find the user's organization ID.
2.  **Drive Discovery**: Probes `/2/drive` or `/2/drive/preferences` to find the default kDrive ID.
3.  **Caching**: These IDs are discovered once and cached for the remainder of the session to ensure high performance.

### Idiomatic Root Mapping
In Google Drive, the root is "My Drive". In KSuite, the Super Root (ID `1`) contains both "Private" and "Common documents". 
To match GAS expectations, `gas-fakes` **dynamically maps the "Private" folder as the Root**.
*   `DriveApp.getRootFolder()` resolves to the user's "Private" folder.
*   Files created in "root" land in "Private".

### Metadata Translation
The `KSuiteDrive.translateFile` method maps KSuite's JSON response to the schema expected by `gas-fakes` service classes:
*   `mime_type` -> `mimeType`
*   `created_at` -> `createdTime`
*   `last_modified_at` -> `modifiedTime`
*   Root detection (ID `1` or `5`) maps to the standard folder behavior.

## 4. Supported Operations (POC)

The current integration supports the following `DriveApp` and `Drive` advanced service operations on KSuite:
*   **Navigation**: `getRootFolder()`, `getFolders()`, `getFiles()`, `getFolderById()`, `getFileById()`.
*   **Creation**: `createFolder()`, `createFile()` (with content and type).
*   **Management**: `setName()`, `setTrashed()`.
*   **Content**: `getBlob()`, `getDataAsString()`.
*   **Queries**: Basic `q` parameter parsing for parent and `mimeType` filtering.

## 5. Setup & Usage

### Environment Configuration
Ensure your `KSUITE_TOKEN` is in your `.env` file. `gas-fakes` now uses `override: true` to ensure local tokens always take precedence.

```env
KSUITE_TOKEN=your_infomaniak_api_token
```

### Example Code
```javascript
import '@mcpher/gas-fakes'

const main = () => {
  // Switch to KSuite
  ScriptApp.__platform = 'ksuite';

  // This code is now running against Infomaniak kDrive!
  const root = DriveApp.getRootFolder();
  console.log("Root Folder:", root.getName()); 

  const folder = root.createFolder("GAS-Fakes-Test");
  folder.createFile("hello.txt", "This was created via standard GAS code.");
  
  const files = folder.getFiles();
  while (files.hasNext()) {
    console.log("Found file:", files.next().getName());
  }
}
```

## 6. Testing

Tests are located in `test/testksuitedrive.js`. You can run them via npm:
```bash
cd test && npm run testksuitedrive
```
The test suite validates the full lifecycle: Discovery -> Mapping -> Creation -> Renaming -> Deletion.
