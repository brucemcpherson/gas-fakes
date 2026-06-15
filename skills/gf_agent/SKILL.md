---
name: gf_agent
description: >
  Specialized agent for automating Google Workspace tasks locally using gas-fakes.
  Generates and executes Google Apps Script code on Node.js.
---
# Skill: gf_agent

## Overview
`gf_agent` is a specialized agent for automating Google Workspace tasks using the `gas-fakes` local emulation environment. It can generate and execute Google Apps Script (GAS) code locally on Node.js.

## Capabilities
- **Automate Workspace**: Create, read, and modify Google Docs, Sheets, Slides, Forms, Drive files, and Calendars.
- **Local Execution**: Run scripts using `@mcpher/gas-fakes` to avoid needing a live Apps Script environment for every task.
- **Service Integration**: Seamlessly combine multiple Google services (e.g., fetch data from a Sheet and create a Doc).
- **Mock/Real Parity**: Write code that works both locally (using fakes) and on the real Google Apps Script platform.

## Instructions
1. **Understand and Orchestrate**:
    - Identify required Google Apps Script services (e.g., SpreadsheetApp, DriveApp).
    - For multi-service or complex tasks, adopt the **Orchestrator Pattern**: Plan the task as a sequence of service-specific sub-tasks.
2. **Research and Verify (Service Agent Phase)**:
    - For each service, first verify method existence by reading the local `skills/{service}.md` files in the skill directory.
    - If detailed method signatures or descriptions are needed, fetch the latest implementation details from the remote `gas-fakes` repository.
    - **Remote URL**: `https://raw.githubusercontent.com/brucemcpherson/gas-fakes/main/progress/{service}.md` (Note: `{service}` is lowercase, e.g., `spreadsheet.md`).
    - Use these details to construct precise, parity-compliant code without relying on external search engines unless documentation is missing.
3. **Generate Script**: Create a Node.js script that:
    - Uses standard GAS syntax.
    - (Optional) Uses `ScriptApp.isFake` for local-only logic like logging or cleanup.
4. **Execute & Verify**: Use the `mcp_gas-fakes-mcp_workspace_agent` tool to execute the code and report the results to the user.

## Example Workflow
User: "Summarize the last 5 unread emails and save the summary to a new Google Doc."
Agent:
1. **Identify Services**: `GmailApp`, `DocumentApp`.
2. **Verify Methods**: 
   - Check `skills/gmail.md` and `skills/document.md`.
   - (Optional) Fetch `progress/gmail.md` and `progress/document.md` from GitHub for detailed signatures.
3. **Generate Script**:
   ```javascript
   const threads = GmailApp.getInboxThreads(0, 5);
   let summary = 'Email Summary:\n\n';
   threads.forEach(t => {
     const msg = t.getMessages()[0];
     summary += `From: ${msg.getFrom()}\nSubject: ${msg.getSubject()}\n---\n`;
   });
   const doc = DocumentApp.create('Email Summaries');
   doc.getBody().appendParagraph(summary);
   console.log('Summary saved to Doc ID:', doc.getId());
   ```
4. **Execute**: Call `mcp_gas-fakes-mcp_workspace_agent({ script: '...' })`.
5. **Report**: Confirm completion and provide the Doc ID.

## Notes
- Always use ES modules (`import`).
- Note that the Apps Script Services are all  automatically available- for Example DriveApp, SpreadsheetApp, etc. are all available in the global namespace - no need to import them.
- the manifest file is used to conteol which scopes are required. dwd is the preferred authentication method but it needs the user to enable it from the domain admain console during the authentication stage.
- Advanced Service versions of the services are available - and map to their apps script equivalents. These are also available via the global namespace for example Drive, Sheets , etc. 
- Note that Apps Script is synchronous. gas-fake emulates this so all calls to services will be synchronous
- Where possible, use the native Apps Script service (for example DriveApp) in preference to the advanced services (Drive, Sheets, etc.)

## Lessons Learned & Best Practices (from Test Patterns)


### Execution Context & Artifacts (CRITICAL)
- **Role Boundary**: You are the `gf_agent` operating on behalf of an end-user to automate Google Workspace tasks. You are NOT a developer writing internal tests for the `gas-fakes` emulator repository.
- **Transient Execution**: When fulfilling automation requests (e.g., "Create a sheet", "Summarize emails"), you MUST use the provided MCP execution tools (e.g., `run_script` or `mcp_gas-fakes-mcp_workspace_agent`) to execute code dynamically on-the-fly.
- **No Import Required**: Do NOT include `import '@mcpher/gas-fakes';` at the top of your scripts when using the MCP execution tools. The MCP server environment automatically provisions all Google Apps Script globals (like `SpreadsheetApp`, `DriveApp`, etc.) into the execution context for you.
- **No Permanent Artifacts**: DO NOT write script files to disk (e.g., in a `test/` folder) to execute user tasks, and DO NOT use the internal `gas-fakes` testing harness (like `initTests()`). The end-user of `gf_agent` does not have or care about the emulator's testing environment. Provide the plain Apps Script code directly as a string parameter to the MCP tool.

### Efficient Drive Searching (Best Practice)
- **Prefer `searchFiles()` over manual iteration**: When looking for specific files (e.g., by name, date, or parent), always use `DriveApp.searchFiles(query)` instead of `DriveApp.getFiles()` with manual filtering. Searching happens on the server and is significantly faster.
- **Date Formatting for Queries**: When searching by date (e.g., `modifiedTime` or `createdTime`), you MUST use the RFC3339 format (e.g., `YYYY-MM-DDThh:mm:ss`). 
  - **Crucial**: Use `modifiedTime` instead of `modifiedDate` when querying Drive via `gas-fakes`, as it maps to the Drive API v3 field.
  - *Example*: `DriveApp.searchFiles("modifiedTime >= '2024-04-24T00:00:00'")`.

### Advanced Service Versioning (v3 Preference)
- **Drive API**: `gas-fakes` follows the **Drive API v3** naming convention. 
  - Use `Drive.Files.create()` instead of `insert()`.
  - Use `name` instead of `title` in resource objects.
  - If a method from a live Apps Script snippet fails, check for its v3 equivalent before assuming it is missing.
- **Service Discovery**: If unsure about available methods, run a short `workspace_agent` script to log `Object.keys(Service.SubService)` to confirm implemented endpoints.


### Common Apps Script Syntax Gotchas (First-Time Accuracy)
- **File Conversion (Exporting to PDF)**: 
  - **`DriveApp.File.getAs()` Workaround**: While live Apps Script can seamlessly convert text files (`text/plain`) to PDF using `file.getAs('application/pdf')`, the underlying Google Drive API **only supports exporting Docs Editor files** (Docs, Sheets, Slides). `gas-fakes` handles this transparently by automatically performing a temporary two-step conversion (copying it to a Google Doc, exporting it, and trashing the temp file). This ensures parity with live Apps Script without manual intervention.
  - **`Spreadsheet.getAs()` Limitation**: The `getAs()` method is **NOT** implemented directly on `Spreadsheet`, `Document`, or `Presentation` objects in `gas-fakes`. If you try to call `ss.getAs('application/pdf')`, the script will crash. **Crucial Rule**: You MUST fetch the file via DriveApp first to convert it: `DriveApp.getFileById(ss.getId()).getAs('application/pdf')`.
- **Google Docs Formatting**: You CANNOT apply formatting (bold, italic, etc.) directly to a `Paragraph` or `ListItem`. You MUST use `editAsText()` first.
  - *Incorrect*: `paragraph.setItalic(true)`
  - *Correct*: `paragraph.editAsText().setItalic(true)`
- **Google Docs Element Detachment**: To move or duplicate an element (like an image, paragraph, or table) within a document, you **cannot** just append it if it's already attached to the document tree. You must either detach it (`element.removeFromParent()`) or copy it (`element.copy()`) first, otherwise an "Element must be detached" error is thrown.
- **Google Docs Headers/Footers**: You can only add one header/footer to a document tab. Calling `doc.addHeader()` twice will throw an error.
- **Google Sheets Developer Metadata**: You **cannot** add `DeveloperMetadata` to an arbitrary range (e.g., `A1:B2`) or a partial row/column. It **only** works on full sheets, full rows (`9:9`), full columns (`J:J`), or the spreadsheet itself.
- **Google Sheets Filters**: A sheet can only have one filter at a time. Attempting to call `range.createFilter()` on a sheet that already has a filter will throw an error.
- **Google Drive Blob Naming**: When creating a file from a Blob (`DriveApp.createFile(blob)`), the Blob **must** have a name. `Utilities.newBlob("content")` does not set a name by default and will throw "Blob object must have non-null name". Always use `Utilities.newBlob("content", "text/plain", "filename.txt")`.
- **Flush Requirements**: If your script creates a resource and immediately tries to perform a complex search or metadata operation on it, call `SpreadsheetApp.flush()` or `doc.saveAndClose()` to ensure the state is synchronized.
- **Date Comparison**: When comparing dates from `getLastUpdated()` or `getDateCreated()`, remember they are JavaScript `Date` objects. Use `.getTime()` for reliable numerical comparison.


### Authentication & Troubleshooting
- **Permission Denied/Auth Failures**: Most authentication errors stem from a mismatch between the script's required scopes and the authorized environment.
  - **Manifest & Scopes**: `gas-fakes` reads `appsscript.json` to discover required scopes. If these scopes weren't authorized during `gas-fakes auth`, the script will fail.
  - **Advice for User (Auth Methods)**: When a user needs help setting up authentication for `gas-fakes`, advise them based on their specific situation:
    - **Service Account (Default)**: Recommend this for most automated tasks or server environments. They need a GCP project, a Service Account, and its JSON key file.
    - **DWD (Domain Wide Delegation)**: Recommend this if the script needs to act on behalf of other users in a Google Workspace domain. Remind the user that the Service Account must be explicitly authorized in the Google Workspace Admin Console (Security > API Controls > Domain-wide Delegation) for the specific scopes being used, and they must provide the `Subject` email address during the `gas-fakes auth` flow.
    - **Desktop/OAuth (CLI)**: Recommend this for personal scripting or if they cannot use a Service Account. It requires `OAuth Client ID` credentials from GCP (Application type: Desktop) and will prompt them to authenticate via a browser window.
  - **Initialization**: Ensure the project has been initialized using `gas-fakes init`. The `.env` file must contain the correct `GF_PLATFORM_AUTH` and associated credentials.

### Parity & Platform Logic
- **`ScriptApp.isFake`**: Use this boolean to detect the `gas-fakes` environment.
  - **Best Practice**: Guard **only** infrastructure logic (logging, cache checks, special backends) with this flag. 
  - **Warning**: Do **not** use it to change the core business logic of a script, as this defeats the purpose of parity.
- **Backend Selection**: `ScriptApp.__platform` can be dynamically switched to target `google`, `ksuite`, or `msgraph`. 
  - **Self-Correcting**: `gas-fakes` resources (Files, Sheets) "remember" their platform at creation. Subsequent calls on that object will automatically use the correct backend even if `ScriptApp.__platform` has changed globally.


### Advanced Service Usage & Interop
- **Metadata Access**: If a standard service object (e.g., `Spreadsheet`) doesn't expose a specific property, use `Service.__getMetaProps(fields)` or `Service.__getMeta()` to fetch the underlying JSON resource from the Google API.
- **Batching and Flush**:
  - **Spreadsheets**: Use `SpreadsheetApp.flush()` to force calculation and commitment of values.
  - **Documents**: Use `doc.saveAndClose()` followed by `DocumentApp.openById(id)` to synchronize the "Shadow Document" state with the Google servers.
- **Advanced Drive (v3)**:
  - **List Files**: `Drive.Files.list({ q: "...", fields: "files(id, name)" })` is the most efficient way to batch fetch file metadata.
  - **Permissions**: `Drive.Permissions.create({ role, type, emailAddress }, fileId)` is preferred for programmatic sharing.
- **Iterators**: `gas-fakes` iterators (like `FileIterator`) implement the native Apps Script `hasNext()` and `next()` methods, which differ from standard JavaScript iterators.

### Google Docs & Images
- **Inline Image Resizing (DocumentApp)**: Native methods like `setWidth()` and `setHeight()` on `InlineImage` objects are **NOT** implemented in `gas-fakes`. If you call these, the script will crash with a "not yet implemented" error.
- **Conversion**: To create a Google Doc from HTML, use `Drive.Files.create()` with the correct v3 parameters:
  ```javascript
  const resource = { name: "Doc Name", mimeType: "application/vnd.google-apps.document" };
  Drive.Files.create(resource, htmlBlob);
  ```
- **Resizing Workaround (Advanced Docs Service)**: Because the Docs API does not support updating image properties directly, you must use the Advanced Docs Service (`Docs.Documents.batchUpdate`) to **delete and re-insert** the image with the new dimensions. 
  - To do this, fetch the document via `Docs.Documents.get()`, extract the `contentUri` from the existing inline image, and construct `deleteObject` and `insertInlineImage` requests.
  - **Crucial**: Always sort your delete/insert operations by `startIndex` in **descending order** so you don't corrupt the document's indices during a batch update.
  - **Example Code Pattern**:
    ```javascript
    const docData = Docs.Documents.get(docId);
    const requests = [];
    // ... logic to find images in docData.body.content, saving objectId, contentUri, startIndex, and dimensions ...
    // ... sort found images by startIndex DESCENDING ...
    images.forEach(img => {
      requests.push({ deleteObject: { objectId: img.objectId } });
      requests.push({ 
        insertInlineImage: { 
          uri: img.contentUri, 
          location: { index: img.startIndex }, 
          objectSize: { 
            width: { magnitude: img.width * 0.25, unit: 'PT' }, 
            height: { magnitude: img.height * 0.25, unit: 'PT' } 
          } 
        } 
      });
    });
    if (requests.length > 0) Docs.Documents.batchUpdate({ requests }, docId);
    ```
- **Shadow Document & Named Ranges**: `gas-fakes` uses a "Shadow Document" approach. Elements are tracked using Named Range tags to maintain positional integrity during updates.
- **Table Creation**: `appendTable()` without arguments creates a 1x1 table in `gas-fakes`, whereas live Apps Script creates an empty table stub.
- **Rate Limiting (429 Errors)**: Because `gas-fakes` translates local calls into real-time API requests, making rapid, successive calls like `appendParagraph()` in a loop will trigger Google's rate limit. 
  - **Best Practice**: Concatenate strings locally and make a single `appendParagraph()` call, rather than appending multiple short lines separately.
  - **Real-time Feedback**: If you see retryable 429 errors in the console output during script execution, you MUST inform the user that the process is experiencing rate limiting but that `gas-fakes` is automatically handling retries.


### Google Sheets (SpreadsheetApp)
- **Efficiency & Batching (CRITICAL)**: Always prefer `range.setValues(array)` over making multiple individual `range.setValue(val)` calls. If you need to write multiple rows or columns of data to a sheet, batch them up into a 2D array and write them all at once. This significantly improves performance and avoids unnecessary API rate limits.
- **Chart Creation & Ranges**: While `gas-fakes` now emulates Live Apps Script behavior by automatically splitting multi-column ranges in `addRange()` (first column as domain, rest as series), for **maximum reliability** and clear control over your chart structure, it is still recommended to add domains and series as separate single-column ranges.
  - *Example*: `chart.addRange(sheet.getRange("A2:A10")).addRange(sheet.getRange("B2:B10"))` is preferred over `chart.addRange(sheet.getRange("A2:B10"))`.
- **Values vs. Display Values**: 
  - `getValues()` returns unformatted data.
  - `getDisplayValues()` returns formatted strings.
  - `setValues()` uses "USER_ENTERED" mode.
- **Bulk Operations (RangeList)**: Use `sheet.getRangeList(['A1', 'C1', 'E1'])` for multi-range formatting.
- **Exporting to PDF (`getAs`)**: The `Spreadsheet.getAs()` method is **NOT** implemented in `gas-fakes`. If you need to convert a Spreadsheet (or a Document/Presentation) to a PDF, you MUST use the `DriveApp` service workaround: `DriveApp.getFileById(spreadsheet.getId()).getAs('application/pdf')`.

### Google Forms (FormApp)
- **Programmatic Submission**: The public Forms API does **not** support submitting responses. `gas-fakes` uses a "web submission hack" that temporarily makes the form public to scrape tokens and POST the response.
- **Choice IDs**: The Forms API uses hex string IDs, while Apps Script uses numbers. `gas-fakes` handles this conversion automatically.

### JDBC
- **MySQL 8+ Authentication**: You must downgrade users to `mysql_native_password` on the server for successful connection.
- **BigDecimal**: Always wrap `getBigDecimal()` result in `Number()` or `parseFloat()` for cross-platform compatibility.

### Chart Generation Parity (SpreadsheetApp.newChart)
When implementing Google Sheets Embedded Charts, be aware of the following Live Apps Script vs. REST API oddities:
- **Enum Strictness**: Live GAS actively rejects string literals for `Charts` Enums (e.g., passing `"SHOW_ALL"` instead of `Charts.ChartHiddenDimensionStrategy.SHOW_ALL` throws `The parameters (String) don't match the method signature`). Ensure your generated test scripts strictly use the Enum objects.
- **Method Availability**: Live GAS does not support visual formatting methods (`setTitle`, `setBackgroundColor`) on the generic `EmbeddedChartBuilder` returned by `sheet.newChart()`. They are only available *after* casting to a specific builder (e.g., `.asPieChart().setTitle(...)`). 
- **Hidden Dimensions Crash**: `setHiddenDimensionStrategy` will throw a backend `Unexpected error` if called before assigning a chart type, or if called on an incompatible type (like a Pie chart or Table chart). Only call it on compatible builders (like a Bar or Column chart).

### Environment-Agnostic Test Design
- When generating scripts or test assertions designed to run interoperably (both locally on Node.js and on Live Apps Script), **never assert against internal private properties** (e.g., properties prefixed with `__`, like `__apiChart`). These properties do not exist on the Live Apps Script Java classes and will cause the script to crash in the cloud environment. Only assert against public, documented getter/setter methods.


### JDBC & Cloud SQL Troubleshooting

#### 1. MySQL 8.x/8.4 Authentication Plugin
**The Problem:** Apps Script's JDBC driver is incompatible with the default `caching_sha2_password` security in MySQL 8.0+.
**The Solution:** Use the legacy `mysql_native_password` plugin.
1. **Enable Database Flag:** In Cloud SQL Console, add the flag `mysql_native_password` and set it to `on`.
2. **Downgrade User:** Run `ALTER USER 'your-user'@'%' IDENTIFIED WITH mysql_native_password BY 'your-password';`.

#### 2. GCP Project Configuration
**The Problem:** Connection fails even with correct DB credentials because the script isn't authorized to "tunnel" to the instance.
**The Solution:**
1. **Enable API:** Ensure the **Cloud SQL Admin API** is enabled in the Google Cloud project.
2. **IAM Role:** The user running the script (or the service account) must have the **Cloud SQL Client** (`roles/cloudsql.client`) role.
3. **OAuth Scopes:** The script must include the `https://www.googleapis.com/auth/sqlservice` scope. Add this to your `appsscript.json` manifest if not automatically prompted.

#### 3. Connection Syntax
**The Problem:** Using IP addresses with `getCloudSqlConnection`.
**The Solution:** Use the **Instance Connection Name** (`project:region:instance`).
- **MySQL:** `jdbc:google:mysql://INSTANCE_CONNECTION_NAME/DATABASE_NAME`
- **PostgreSQL:** `jdbc:google:postgres://INSTANCE_CONNECTION_NAME/DATABASE_NAME`
- **SQL Server:** `jdbc:google:sqlserver://INSTANCE_CONNECTION_NAME/DATABASE_NAME`

### JDBC & Cloud SQL Authentication Guide

#### 1. "Failed to establish a database connection" (Generic Error)
This is the most common error. Systematically check:
- **Cloud SQL Admin API**: MUST be enabled in the Google Cloud Console for the project.
- **IAM Permissions**: The authenticated user (or service account) must have the **Cloud SQL Client** role (`roles/cloudsql.client`).
- **OAuth Scopes**: Your `appsscript.json` manifest must include the `"https://www.googleapis.com/auth/sqlservice"` scope.
- **Instance Connection Name**: Ensure you are using the full name (`project-id:region:instance-id`) and not just the instance ID or IP address when using `getCloudSqlConnection`.

#### 2. "Access denied for user" (Database Level)
Even if the secure tunnel is established, the database engine may reject the user:
- **Host Wildcard**: In MySQL/PostgreSQL, users are often restricted by host (e.g., `'user'@'localhost'`). Connections via `getCloudSqlConnection` appear as coming from an internal Google network. Ensure your user is created with a wildcard host or a host that allows Google's internal ranges (e.g., `'user'@'%'`).
- **Password Complexity**: While `Jdbc.getCloudSqlConnection` handles passwords as separate arguments (avoiding URI encoding issues), double-check for typos or expired passwords.

#### 3. MySQL 8.0+ Authentication Plugin
MySQL 8.0+ uses `caching_sha2_password` by default, which is incompatible with the Apps Script JDBC driver.
- **Symptom**: `Handshake failed` or `Access denied` even with correct credentials.
- **Fix**:
  1. In the Cloud SQL Console, add the database flag `mysql_native_password` and set it to `on`.
  2. Run the following SQL to downgrade the user: `ALTER USER 'your-user'@'%' IDENTIFIED WITH mysql_native_password BY 'your-password';`.

#### 4. Connection Methods: Tunneling vs. Public IP
- **Method A: `Jdbc.getCloudSqlConnection(url, user, password)` (Recommended)**
  - Works for MySQL and PostgreSQL.
  - Uses an internal secure tunnel; **no IP whitelisting required**.
  - URL format: `jdbc:google:mysql://INSTANCE_CONNECTION_NAME/DATABASE_NAME`
- **Method B: `Jdbc.getConnection(url, user, password)`**
  - Required for **SQL Server** or non-Google hosted databases.
  - **IP Whitelisting**: You MUST whitelist Apps Script's public IP ranges in your database firewall/networking settings.
  - URL format: `jdbc:sqlserver://PUBLIC_IP:1433;databaseName=DB_NAME`


### Google Docs API Limitations

- **Horizontal Rules**: The underlying Google Docs API does not support creating, updating, or managing `HorizontalRule` elements. Because `gas-fakes` maps local calls to the REST API, attempting to use methods like `body.appendHorizontalRule()` or `body.insertHorizontalRule()` will crash the script with a `GoogleJsonResponseException` (e.g., `Invalid requests...`).
  - **Workaround**: If you need to visually separate content in a generated Document, use simple text-based separators like `body.appendParagraph('--------------------------------------------------')` instead.


# Orchestrator and Service Agent Pattern

To improve the reliability and accuracy of `gf_agent` when handling complex Google Workspace tasks, the agent should follow an **Orchestrator/Service Agent** architecture. This pattern minimizes "tool space interference" and ensures that the agent always uses the most accurate and up-to-date implementation details for each service.

## The Problem: Tool Space Interference
When an agent attempts to handle multiple services (e.g., Spreadsheet, Drive, and Gmail) in a single turn, the context can become overwhelmed with conflicting method signatures or outdated knowledge from external search results. This often leads to "hallucinated" methods or incorrect parameter usage.

## The Solution: Modular Delegation

### 1. The Orchestrator Phase
Upon receiving a user request, the agent acts as an **Orchestrator**. 
- **Identify Services**: Determine exactly which Apps Script services are required (e.g., `SpreadsheetApp`, `DriveApp`).
- **Decomposition**: Break the request into service-specific sub-tasks.
- **Service Verification**: Verify that the required services and classes exist by checking the local `skills/` directory within the `gf_agent` skill.

### 2. The Service Agent Phase (Context Compression)
For each identified service, the main agent MUST invoke a **sub-agent** (e.g., `generalist`) to perform the deep research.
- **Why?**: Large documentation files (like `spreadsheet.md`) can bloat the main context window. Sub-agents run in isolated environments and return only a distilled summary.
- **Process**:
  1. Main Agent calls `invoke_agent` with the instruction: "Research Class X in Service Y from remote docs. Return ONLY the method signatures for A, B, and C."
  2. Sub-Agent uses `curl` + `awk` (or `web_fetch`) to find the information.
  3. Sub-Agent returns a precise report.
  4. The main context stays lean.

- **Remote Document Retrieval (Sub-Agent Technique)**:
  - Sub-agents should use `run_shell_command` with `curl` and `awk` for surgical class extraction.
  - **Branch Routing (CRITICAL)**: 
    - If the user is operating within the `gas-fakes` repository (developer mode), the sub-agent MUST run `git branch --show-current` to determine the active branch, and use THAT branch name in the URL. This ensures they get work-in-progress signatures.
    - If the user is operating outside the repository (end-user mode), the sub-agent MUST ALWAYS use the `main` branch.
  - **Command Template**:
  - `curl -s https://raw.githubusercontent.com/brucemcpherson/gas-fakes/{BRANCH_NAME}/progress/{Service}.md | awk '/^## Class: \[{ClassName}\]/{flag=1; print; next} /^## Class:/{if(flag) {flag=0; exit}} flag'`
  - *(Note: `{Service}.md` is case-sensitive. Check `gf_agent/skills/` for the exact casing, e.g., `Spreadsheet.md`)*

### 3. Synthesis and Execution
Once all required service-specific knowledge is gathered:
- **Unified Implementation**: Combine the gathered patterns into a single, cohesive Apps Script block.
- **Execution**: Use the `mcp_gas-fakes-mcp_workspace_agent` to execute the script.
- **Validation**: If the script fails, the agent returns to the Service Agent phase for the failing service to re-verify the implementation details.

## Benefits
- **Zero-Search Dependency**: By using the remote `progress` files as the primary source of truth, the agent avoids the risk of using outdated or non-parity GAS snippets found on the web.
- **Context Efficiency**: Researching one service at a time prevents the "interference" of unrelated documentation.
- **Parity Guarantee**: The remote documentation is generated directly from the `gas-fakes` source code, ensuring 100% parity with the local environment.

## Delegation Anti-Patterns (CRITICAL)
- **NEVER Delegate Execution**: The main orchestrator agent MUST retain control of script generation and the execution tool (`mcp_gas-fakes-mcp_workspace_agent`). 
- **Unauthorized Tool Call Error**: Sub-agents (like `generalist`) DO NOT have access to MCP tools. If you use `invoke_agent` to delegate a task that requires executing code, the sub-agent will crash with: `Error: Unauthorized tool call: 'mcp_gas-fakes-mcp_workspace_agent' is not available to this agent.`
- **Subagent Context Loss**: Subagents do **not** inherit the `gf_agent` knowledge base, parity rules, or active skills. If you tell a subagent to "execute these 5 tasks," it will generate standard Google Apps Script code that ignores `gas-fakes` specific workarounds, leading to widespread failures.
- **Strict Role Boundary**: Subagents are strictly for **isolated documentation retrieval** (the Service Agent Phase) via standard shell commands like `curl`. The main agent writes and runs the code.

## Safe Parallelism (Performance)
If the user asks you to run multiple tasks in parallel, DO NOT use `invoke_agent`. You must handle them directly in the main session. The orchestrator should achieve parallelism in two ways:
1. **Tool Call Parallelism**: The Main Agent generates multiple, parity-compliant scripts and issues them as independent, simultaneous calls to `mcp_gas-fakes-mcp_workspace_agent` within a single turn.
2. **Execution-Level Async**: Since `gas-fakes` runs on Node.js, the Main Agent can generate a single script that uses `Promise.all()` to execute multiple non-dependent operations (like `UrlFetchApp` calls or creating separate files) simultaneously.
3. **Sequence when Dependent**: Only use `wait_for_previous: true` or sequential turns when a task depends on the side-effect of a previous one (e.g., reading a sheet that was just created).


# Sandbox and Security Controls

`gf_agent` can operate in a **Sandbox Mode** to ensure that automated tasks are restricted to specific files, recipients, or usage quotas. This is critical for preventing accidental modification of sensitive data or exceeding API limits.

## Core Concepts

### 1. Enabling the Sandbox
The sandbox is controlled via `ScriptApp.__behavior`. Enabling it locks down the environment.
```javascript
ScriptApp.__behavior.sandboxMode = true;
ScriptApp.__behavior.strictSandbox = true; // Only allow files created in this session
```

### 2. ID Whitelisting (Files & Folders)
In `strictSandbox` mode, all external files are blocked by default. Use whitelisting to grant granular access.
- **Pattern**: `addIdWhitelist(item)`
- **Permissions**: `.setRead(true)`, `.setWrite(true)`, `.setTrash(true)`
```javascript
const behavior = ScriptApp.__behavior;
const item = behavior.newIdWhitelistItem('FILE_ID')
  .setRead(true)
  .setWrite(false) // Read-only
  .setTrash(false);
behavior.addIdWhitelist(item);
```

### 3. Gmail Security
The Gmail service has specialized sandbox settings under `sandboxService.GmailApp`.
- **Email Whitelist**: Restricts `sendEmail` to specific addresses.
- **Label Whitelist**: Restricts which labels can be read, applied, or deleted.
- **Usage Limits**: Sets quotas for `read`, `write`, `trash`, and `send` operations.
```javascript
const gmail = ScriptApp.__behavior.sandboxService.GmailApp;
gmail.emailWhitelist = ['allowed@example.com'];
gmail.usageLimit = { send: 5, read: 10 }; // Granular limits
// OR
gmail.usageLimit = 50; // Total operations limit
```

### 4. Service & Method Restrictions
You can disable entire services or restrict scripts to a subset of allowed methods.
```javascript
// Disable a service entirely
ScriptApp.__behavior.sandboxService.SlidesApp.enabled = false;

// Whitelist specific methods for a service
ScriptApp.__behavior.sandboxService.DriveApp.setMethodWhitelist(['getFileById', 'getBlob']);
```

### 5. Automated Cleanup
The sandbox tracks every resource created during a session. When `behavior.trash()` is called, it automatically deletes these resources unless `cleanup` is disabled.
```javascript
ScriptApp.__behavior.cleanup = true; // Default: true
// Set per-service
ScriptApp.__behavior.sandboxService.GmailApp.cleanup = false;
```

## Best Practices for `gf_agent`
- **Session Isolation**: When a user provides a list of files or emails, always initialize the sandbox with those specific whitelists at the top of the script.
- **Explicit Whitelisting**: Use `behavior.addIdWhitelist` for file access. DO NOT assume `sandboxService.SpreadsheetApp` has an `addFileWhitelist` method (it is handled globally by the behavior ID whitelist).
- **Cross-Platform Portability**: The `ScriptApp.__behavior` object is a `gas-fakes` exclusive feature. If the generated script is intended to be copied and run in Live Apps Script later, you MUST wrap all sandbox-related boilerplate in an `if (ScriptApp.isFake)` block to prevent `TypeError` crashes in the cloud.
- **Safe Execution**: In the Orchestrator Phase, identify if the task requires external access and include the necessary sandbox boilerplate in the generated script.


### Chart Builder Method Limitations (API Parity)

When generating code that builds Embedded Charts in Google Sheets (`SpreadsheetApp.newChart()`), you must adhere to the following restrictions, as `gas-fakes` maps directly to the Google Sheets REST API v4 which has limitations compared to Live Apps Script:

1. **Method Fragmentation (Range Settings)**: 
   - You MUST NOT use `setXAxisRange()` or `setYAxisRange()` unless you are specifically building a `ScatterChart`. In Live Apps Script, these methods are exclusive to `EmbeddedScatterChartBuilder` and will throw a `TypeError` on other chart types.
   - For all other chart types (Column, Bar, Line, Area), you MUST use the generic `setRange(min, max)` method.

2. **Unimplemented Formatting Methods**: 
   - The REST API v4 lacks direct properties for many granular text-styling and sub-scale formatting options. 
   - You MUST NOT use the following methods as they will throw a `notYetImplemented` error in `gas-fakes`: `useLogScale()`, `setXAxisLogScale()`, `setYAxisLogScale()`, `reverseCategories()`, `reverseDirection()`, `setPointStyle()`, `enablePaging()`, `enableSorting()`, or any method ending in `*TextStyle()` (e.g., `setTitleTextStyle()`).
   - Stick to core configurations: `setColors()`, `setXAxisTitle()`, `setYAxisTitle()`, `setRange()`, `setStacked()`, `setBackgroundColor()`, `setLegendPosition()`, and `set3D()`.

3. **Pie Chart Custom Colors**: 
   - The REST API v4 does not support setting custom slice colors for Pie Charts. Calling `setColors()` on a Pie Chart builder will be silently ignored. Do not attempt to style Pie Chart slices.

### Gmail Modifiers and Eventual Consistency

When writing scripts that modify Gmail objects (e.g., `GmailMessage.markRead()`, `GmailMessage.star()`, `GmailThread.markImportant()`), be aware of a significant difference between `gas-fakes` and Live Apps Script regarding synchronization.

- **Live Apps Script (Eventual Consistency)**: Despite documentation claiming these methods are synchronous and "force a refresh", the backend operations are eventually consistent. If you check the state immediately after modifying it (e.g., `message.markRead(); console.log(message.isUnread());`), it will likely return the old state.
- **Portable Code Pattern**: If you are writing tests or robust code that must run reliably in Live Apps Script as well as `gas-fakes`, you must introduce an artificial delay and manually refresh the object state:
  ```javascript
  message.markRead();
  if (!ScriptApp.isFake) Utilities.sleep(1000); // Wait for Live GAS backend
  message.refresh(); // Manually force a re-fetch of the state
  console.log(message.isUnread()); // Now safe to assert
  ```
- **gas-fakes Execution**: When executing transient scripts locally via `gas-fakes` that don't need immediate assertions, this pattern is not strictly necessary as `gas-fakes` handles the REST API synchronization reliably, but it is best practice for cross-platform parity.

### Researching Advanced Services (Google API Discovery)

Unlike the standard Apps Script Services (`SpreadsheetApp`, `DriveApp`), the signatures and payloads for **Advanced Services** (`Docs`, `Sheets`, `Drive`, etc.) are not fully documented in the `progress/` directory of the `gas-fakes` repository. Advanced Services are 1:1 mappings of the underlying Google REST APIs.

If you are orchestrating a complex task that requires an Advanced Service (such as resizing an image via `Docs.Documents.batchUpdate` or applying granular formatting via `Sheets.Spreadsheets.batchUpdate`) and you do not know the exact JSON payload structure, you MUST research it using the Google API Discovery documents.

**How to Research Advanced Services:**
You SHOULD FIRST use the `run_shell_command` tool to `curl` and `grep` the official Google API Discovery Document for the specific API version. This is the most reliable way to guarantee accurate, 100% current REST JSON schemas.

**Web Search Fallback**: Only if `curl`ing the Discovery API fails, or if it does not provide enough clarity to construct the request, you MAY use the `google_web_search` tool as a fallback default. Be cautious: web search often returns outdated or non-REST API examples (like Java or Python SDKs) which cause script failures.

**Discovery Document URLs:**
- **Docs API v1**: `https://docs.googleapis.com/$discovery/rest?version=v1`
- **Sheets API v4**: `https://sheets.googleapis.com/$discovery/rest?version=v4`
- **Drive API v3**: `https://drive.googleapis.com/$discovery/rest?version=v3`
- **Slides API v1**: `https://slides.googleapis.com/$discovery/rest?version=v1`
- **Gmail API v1**: `https://gmail.googleapis.com/$discovery/rest?version=v1`

**Example Research Command:**
If you need to know how to structure an `insertInlineImage` request for the Docs API, you would run:
```bash
curl -s "https://docs.googleapis.com/$discovery/rest?version=v1" | grep -A 30 '"InsertInlineImageRequest":'
```
For `deleteObject` (e.g., deleting an image):
```bash
curl -s "https://docs.googleapis.com/$discovery/rest?version=v1" | grep -A 20 '"DeleteObjectRequest":'
```

By fetching the exact schema from the discovery document, you ensure your `batchUpdate` arrays and payload objects are 100% accurate before generating the execution script.

### Utilities Service Constraints (API Parity)

When generating code that uses the `Utilities` service, you must adhere to the following restrictions to ensure parity with Live Apps Script:

1. **`formatString` Format Specifiers**: 
   - Live Apps Script uses Java's underlying `String.format` implementation. Therefore, it **does not** support Node.js-specific format specifiers like `%j` for JSON.
   - You MUST stick to standard Java/C-style format specifiers: `%s` (string), `%d` / `%i` (integer), and `%f` (float). 
   - *Incorrect*: `Utilities.formatString("Data: %j", obj)`
   - *Correct*: `Utilities.formatString("Data: %s", JSON.stringify(obj))`

2. **`parseDate` Error Handling**:
   - If `Utilities.parseDate` is given an invalid date string, Live Apps Script throws a generic Apps Script `Exception` (e.g., `{"name":"Exception"}`) rather than a standard JavaScript `Error` object. 
   - If you are writing tests or robust `try/catch` blocks intended to run cross-platform, DO NOT assert against the exact string value of the error message (like `e.message.includes("failed")`). Simply check that an exception was thrown.


### Context Efficiency & Logging (CRITICAL)

To maintain a clean and professional user experience, `gf_agent` MUST prioritize context efficiency and minimize redundant tool logging.

1. **Avoid Redundant Research**: 
   - Before calling `lookup_docs` or searching remote documentation, ALWAYS check the local `skills/` directory for the required service.
   - If the method signatures are already known or simple, proceed to script generation without extra tool calls.
   - DO NOT call `lookup_docs` for every service in every turn. Only call it when a specific method signature is unknown or when a script fails with a "not a function" error.

2. **SILENCE TOOL OUTPUT (CRITICAL MANDATE)**:
   - When you use tools like `lookup_docs`, `web_fetch`, or `run_shell_command`, you MUST NOT echo, repeat, or print the raw tool output into your chat response.
   - The user considers seeing long lists of methods (e.g., `Class: HTTPResponse... Supported Methods:...`) in the chat to be highly disruptive.
   - **Rule**: Consume the tool output silently in your context window. Only tell the user *what* you learned in a single brief sentence (e.g., "I verified the UrlFetchApp methods."), or simply proceed with writing the script without mentioning the lookup at all.

3. **Quiet Execution**:
   - Aim for a "one-shot" success pattern. Use the gathered knowledge to write a robust script that works on the first try, avoiding the "Retry/Correction" cycle which generates excessive terminal logs.


### Exporting Local Variables for Templates & RPC (Parity)

When developing a Google Apps Script project locally that uses `HtmlService` templates (e.g., `<?!= Include.html() ?>`) or client-side RPC calls (`google.script.run.doSomething()`), the `gas-fakes` backend requires those server-side functions and variables to be explicitly exported from your entry point (`index.js`). 

However, using `globalThis.MyVar = ...` inside your code is an **anti-pattern** because it introduces Node-specific hacks that might pollute the global scope or crash if accidentally pushed to Live Apps Script.

**The Solution (100% Parity):**
Google Apps Script (specifically the V8 engine and the Clasp pusher) completely ignores ES6 `export` statements in standard `.gs` / `.js` files. You can safely append exports to the bottom of your source files to expose them to Node.js, while Live GAS will naturally treat them as part of the monolithic global scope.

**Step 1: Append export to the source file**
```javascript
// File: Utils.js
var Utils = (function() { return { html: () => "hi" } })();
function doSomething() { return true; }

// Add this to the very bottom. 
// Node.js will read it. Live Apps Script will ignore it.
export { Utils, doSomething };
```

**Step 2: Re-export from the entry point**
```javascript
// File: index.js (Local entry point for `gas-fakes serve`)
import '@mcpher/gas-fakes';

// Directly re-export them so gas-fakes can bridge them to the template/RPC workers
export { Utils, doSomething } from './Utils.js';

export const main = () => {
  return HtmlService.createTemplateFromFile('index.html').evaluate();
}
```
This pattern ensures your templates and `google.script.run` calls can seamlessly find your backend methods locally, while keeping the source code perfectly compliant with Live Apps Script.

# 📚 Local Documentation Discovery: Google Apps Script (GAS)

This knowledge file outlines the preferred method for discovering documentation, methods, interfaces, and signatures for Google Apps Script (GAS) within our local environment.

## 🎯 Primary Source of Truth

The definitive source for all Google Apps Script documentation is the local JSON file:

`/Users/brucemcpherson/Documents/repos/gas-fakes/doccreation/gi-fake-all.json`

This file contains a complete, comprehensive duplicate of all official Apps Script documentation, including methods, classes, parameters, return types, and descriptions.

## ✨ Why Use Local JSON Over Web Search?

Relying on the local JSON file provides significant advantages over performing external web searches:

1. **Instant Efficiency:** The documentation is local, allowing for near-instantaneous retrieval without network latency.
2. **Guaranteed Syntax Matching:** The data within the JSON is guaranteed to match the specific environment and API version we are targeting, ensuring perfect syntax and usage examples.
3. **Avoids Ambiguity:** It eliminates the risk of encountering outdated web search results, documentation for other language SDKs, or incorrect API versions that might be indexed online.

## 🔍 Usage Guideline: How to Search the JSON

**The agent must prioritize searching and reading `gi-fake-all.json` before initiating any external web searches for GAS documentation.**

When a query requires knowledge of a GAS method, class, or interface, follow these steps:

1. **Local Search:** Use local search utilities (e.g., `grep`, `jq`, or internal file parsing capabilities) to query `gi-fake-all.json`.
2. **Targeted Extraction:** Search for the relevant class name, method name, or interface.
3. **Information Retrieval:** Extract the following details from the JSON structure:
    *   Method/Function Signature (including parameters and return types).
    *   Detailed Description of the method's purpose.
    *   Specific parameter requirements and constraints.
4. **Fallback:** Only if the local JSON search fails to yield a relevant result, or if the query is too broad, should the agent fall back to external web searches.

**In summary: Treat `gi-fake-all.json` as the authoritative, real-time documentation database for all Google Apps Script interactions.**


# gf_agent Knowledge Base

This directory contains modular markdown files representing the "Lessons Learned & Best Practices" for the `gf_agent` skill.

## Contributing

To prevent Git merge conflicts on the monolithic `gf_agent/SKILL.md` file, collaborators should **never edit `gf_agent/SKILL.md` directly**. 

Instead, to add new knowledge or instructions to the agent:
1. Create a new markdown file in this directory (e.g., `06-new-feature.md`).
2. Prefix it with a number to control the insertion order.
3. Write your instructions, tips, or parity warnings.
4. Commit ONLY your new markdown file and submit a Pull Request.

**Do not attempt to compile the SKILL.md file yourself.**
When your Pull Request is merged into the core `gas-fakes` repository, the maintainer will run the overarching `npm run docs` pipeline. The `builder.js` script will automatically read all files in this directory, sort them, and cleanly generate the final `gf_agent/SKILL.md` artifact for all users.

