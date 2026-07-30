---
name: gas-fakes-dev
description: Develop and implement the 'gas-fakes' project, emulating Google Apps Script (GAS) functionality using Node.js.
tags:[nodejs, google-apps-script, google-cloud-api, testing, mock]
version: "1.0.0"
---

## Summary
This skill enables the agent to assist in the development of the `gas-fakes` project. The primary objective is to emulate Google Apps Script (GAS) behavior using Node.js and Google APIs, allowing Apps Script code to run in a local Node.js environment.

## Usage
- When you need to implement fake/mock functionality for GAS classes or methods.
- When creating test scripts to verify the implemented functionalities.
- When assisting a human developer with Node.js and Google APIs integration.

## Workflow

### 0. Local Model Consultation (Hybrid Hierarchical Delegation)
Before drafting implementation plans, code, tests, refactoring, debugging, analyzing logs, or drafting documentation, Gemini (the Strategic Planner) must first gather all relevant file context, decompose the request into structured atomic sub-tasks, and call the local model (via the `omlx:query_local_model` tool with the `prompt` parameter) to generate precise code implementations, detailed tests, refactored components, bug fixes, or documentation updates.

### 1. Context and Specification Check
Before implementing, verify the specifications of the target Google Apps Script classes and methods. Ensure that the functionality you are about to build aligns with real GAS behavior.

### 2. Implementation & Focused Execution (CRITICAL DELEGATION GATE)
> [!IMPORTANT] **ZERO-TOLERANCE DELEGATION GATE**
> You are **FORBIDDEN** from using `write_file` or `replace` to implement logic, write tests, perform refactoring, diagnose/fix debug errors, or draft documentation yourself. 
> **MANDATORY SEQUENCE**:
> 1.  Gather context (Research).
> 2.  **CALL `omlx/query_local_model`** with a comprehensive prompt containing specific constraints.
> 3.  Review and synthesize the output.
> 4.  Apply changes to files (e.g., in `src/`, `test/`, etc.).
> 
> **EXCEPTION**: This mandate only applies if the local model is available and its use has not been explicitly forbidden by the user. If unavailable or forbidden, you may proceed with the tasks using your own weights, but you MUST document the reason in your `update_topic`.
> 
> You MUST explicitly state "Delegating logic generation/task to local Gemma model" in your `update_topic` summary when transitioning to execution.

- The planner (Gemini) reviews the local model's output code, refines it, and applies it to the `src/` directory.
- Ensure the code runs correctly in the Node.js environment.

### 3. Testing
You must verify your implementation by writing and executing test scripts.
- **Always Add Tests for New Methods**: Whenever you implement a new method, class, or service, you MUST immediately add corresponding tests in the `test/` directory to prove your implementation works and maintains parity. Never add code without adding tests.
- **Network Call Safety**: All network-based commands (e.g., `curl`) MUST include an aggressive timeout (e.g., `--max-time 5` or `--connect-timeout 2`) to prevent processes from hanging and accruing costs in the event of a server deadlock.
- **Temporary/Exploratory Scripts**: If you need to create temporary scripts to test logic, explore APIs, or run isolated experiments outside the formal test suite, you MUST create them in the `gasmess/gemini/` directory (e.g., `gasmess/gemini/test_something.js`). This folder is excluded from version control and prevents cluttering the repository root.
- Place your formal test scripts in the `test/` directory.
- Execute the tests to ensure there are no errors and the behavior matches expectations.
- Full instructions on test and other workflows are in ../../workflows. Be sure to read the relevant workflow file before starting any task.

### 4. Test Registration and Suite Integrity (CRITICAL)
Whenever you create a new test script (e.g., `test/testnewfeature.js`) or significantly modify an existing one, you MUST follow the [**`add-new-test.md`**](file:///Users/brucemcpherson/Documents/repos/gas-fakes/.agents/workflows/add-new-test.md) workflow exactly:
1.  **Create the file** in the `test/` directory.
2.  **Register in `test/test.js`**: Add the `import` statement and the test call within `testFakes()`.
3.  **Register in `test/package.json`**: Add a corresponding entry to the `"scripts"` section (e.g., `"testnewfeature": "node testnewfeature.js execute"`).

- **Workflow Compliance**: At the beginning of EVERY task involving testing or implementation, you MUST consult the `.agents/workflows/` directory (specifically [**`test.md`**](file:///Users/brucemcpherson/Documents/repos/gas-fakes/.agents/workflows/test.md) and [**`add-new-test.md`**](file:///Users/brucemcpherson/Documents/repos/gas-fakes/.agents/workflows/add-new-test.md)) to ensure you are following the latest project-specific procedures.

### 5. Holistic/Targeted Skill Evolution (Self-Updating SKILL)
**[CRITICAL INSTRUCTION]**
The `gas-fakes` project is complex, and bridging Node.js with GAS involves many hidden constraints, specific architectural patterns, and potential errors. You are required to continuously learn and autonomously evolve this SKILL.

- **Trigger:** Whenever you encounter an error during implementation or testing, or when you receive correction feedback/prompts from the human developer.
- **Action:** You MUST extract the lessons learned from the failure and recovery process. Identify the underlying rules, technical constraints, or coding patterns that caused the issue.
- **Update:** Immediately update this `SKILL.md` file (by adding, deleting, or modifying content) to document the newly acquired knowledge. If necessary, also create or update sample scripts, helper templates, or explanatory Markdown files in the project. 
- **Goal:** Transform your localized, temporary learnings into permanent, universally readable knowledge to prevent repeating the same mistakes and to handle the complexities of the project autonomously.
- **CREDENTIALS**: Never commit actual credentials or keys you might discover in the .env file to the repository nor to the SKILL.md file.

## Documented Knowledge & Lessons Learned

### Apps Script JDBC to Google Cloud SQL PostgreSQL
- **Connection Method**: You CANNOT use `Jdbc.getCloudSqlConnection()` for PostgreSQL in Apps Script; it only works for MySQL. You MUST use standard `Jdbc.getConnection()`.
- **IP Whitelisting**: Because Live Apps Script runs on dynamic Google IPs, you must whitelist Google's API IP ranges (fetched from `https://www.gstatic.com/ipranges/goog.json`) in your Cloud SQL instance's Authorized Networks to allow connection.
- **Connection String Formatting**: Apps Script's `Jdbc.getConnection()` has strict requirements for Postgres when hosted on Google Cloud:
  - You CANNOT use `ssl=true` as a query parameter (e.g., `jdbc:postgresql://<IP>:<PORT>/<DB>?ssl=true`). The Java driver on Apps Script throws `The following connection properties are unsupported: ssl`.
  - Do not embed url-encoded credentials directly into the URL. Instead, use the 3-argument signature: `Jdbc.getConnection("jdbc:postgresql://<IP>:<PORT>/<DB>", rawUser, rawPass)`.

### Apps Script JDBC to Google Cloud SQL MySQL
- **Connection Method**: You CAN use `Jdbc.getCloudSqlConnection(url, user, password)` for MySQL on Google Cloud using the specific protocol format `jdbc:google:mysql://[INSTANCE_CONNECTION_NAME]/[DATABASE_NAME]`.
- **Local Node.js Emulation**: The Node `mysql2` driver cannot directly resolve Google Cloud SQL instance names containing colons (e.g. `project:region:instance`). To emulate `Jdbc.getCloudSqlConnection` locally without the Cloud SQL Auth Proxy, you must:
  1. Extract the instance connection name.
  2. Use the `gcloud sql instances describe [INSTANCE_NAME]` command to dynamically resolve the instance's public IP address.
  3. Swap the instance name for the resolved IP address in the connection string.
  4. Ensure your local machine's IP address is authorized on the Cloud SQL instance.
- **Node URL Parsing**: Avoid passing connection strings with instance names (colons) directly into standard Node.js URL parsers (like `new URL()`), as it will fail. Ensure the string is formatted as `[protocol://]user:pass@host/db` or parse the parameters manually.

### Apps Script JDBC Data Types & Results
- **BigDecimal Handling**: `JdbcResultSet.getBigDecimal()` returns a `JdbcBigDecimal` object on live GAS. This is a Java proxy that may NOT expose standard Java methods like `doubleValue()`. To get a numeric value safely across all platforms, use `Number(val)` or `parseFloat(val.toString())`.
- **Column Resolution**: `JdbcResultSet` methods (e.g., `getString()`) support both 1-indexed integers and string column labels. Ensure the fake implementation resolves both using `findColumn`.

### JDBC Driver Compatibility (Live GAS)
- **Semicolons in Prepared Statements**: Avoid trailing semicolons (`;`) in strings passed to `prepareStatement`. Some drivers (e.g., MySQL on GAS) may fail to recognize `?` placeholders if a semicolon is present.
- **Connection Methods**:
  - **MySQL (Google Cloud)**: MUST use `Jdbc.getCloudSqlConnection`.
  - **MySQL (Other/External)**: MUST use `Jdbc.getConnection`.
  - **PostgreSQL (All)**: MUST use `Jdbc.getConnection`.
- **Parameter Index Errors (MySQL 8+)**: For external MySQL databases (e.g., Aiven), the `prepareStatement` method may fail with `Parameter index out of range (1 > 0)` because the older GAS driver cannot parse placeholders in modern MySQL 8+ protocols.
  - **Workaround**: Implement a `try/catch` fallback to standard `Statement.execute()` with manually escaped values if `prepareStatement` fails for MySQL backends.

### Apps Script Constraints & Web APIs
- **Unavailable Web APIs**: The GAS V8 runtime **DOES NOT** support many standard Web APIs, including `TextDecoder`, `TextEncoder`, `fetch`, `setTimeout`, and `ReadableStream`.
- **String/Byte Conversion**: To convert a byte array to a string portably, use:
  ```javascript
  const str = Utilities.newBlob(bytes).getDataAsString();
  ```
- **IP Whitelisting**: Because Live Apps Script runs on dynamic Google IPs, you must whitelist Google's API IP ranges (fetched from `https://www.gstatic.com/ipranges/goog.json`) in your Cloud SQL instance's Authorized Networks to allow connection.
- **Portability Rule**: When writing tests designed to run on both platforms, you MUST guard access to fake-only properties using `if (ScriptApp.isFake)`. 
- **Minimization Strategy (CRITICAL)**: **Minimize** the use of `if (ScriptApp.isFake)` blocks. Whenever possible, verify behaviors and expected return values using the **Public API**. 
    - *Example*: Instead of checking `__fakeObjectType === 'JdbcBlob'`, simply call `blob.length()` or `blob.getBytes()`. If these work, the object is implicitly of the correct type.
- **Why?**: Extensive use of `if (ScriptApp.isFake)` makes the test suite harder to maintain and reduces confidence that the same test is actually verifying the same behavior on both platforms.

### GAS JDBC Runtime Constraints (Critical for Live Tests)
- **`getBlob()` requires an OID large object column — not BYTEA**: Calling `rs.getBlob(n)` on a `TEXT` or `BYTEA` column throws `"Bad value for type long : <value>"` because the PostgreSQL JDBC driver's `getBlob()` internally calls `getLong()` to retrieve a PostgreSQL large object OID from `pg_largeobject`. For inline binary data, use `getBytes()` / `getBinaryStream()` instead. MySQL's `BLOB` type maps directly and works with `getBlob()`. **In practice: never test `getBlob()` against a PostgreSQL/CockroachDB backend in a parity test.**
- **`createStatement()` returns `FORWARD_ONLY`**: Plain `conn.createStatement()` returns a forward-only cursor. Navigation methods `last()`, `first()`, `absolute()`, `relative()`, `previous()`, `beforeFirst()`, `afterLast()` all throw `"Operation requires a scrollable ResultSet"`. Use `conn.createStatement(1004, 1007)` (TYPE_SCROLL_INSENSITIVE, CONCUR_READ_ONLY) to get a scrollable cursor. In the fake, these parameters are accepted but advisory — results are already buffered.
- **`getFloat()` is 32-bit**: GAS `rs.getFloat()` returns an IEEE 754 single-precision float. `1.1` becomes `1.100000023841858`. Always compare with `Math.fround(expected)`. The fake applies `Math.fround()` accordingly.
- **`getDouble()` is 64-bit**: Unlike the above, `rs.getDouble()` returns a full 64-bit double.
### Test Suite Execution & Architecture (CRITICAL)
> [!DANGER] **NEVER RUN TESTS FROM THE ROOT DIRECTORY.**
> All test commands MUST be run from within the `test/` directory. Failure to do so will result in `.env` variables not being loaded and tests failing silently or with obscure errors.
> **CORRECT**: `cd test && node testsheetsdeveloper.js execute`
> **INCORRECT**: `node test/testsheetsdeveloper.js`

- **Directory Requirement**: You **MUST** run all test commands from within the `test/` directory.
- **Execution Flag**: When running a test file directly with `node`, you MUST append the `execute` argument (e.g., `node testsomething.js execute`).
- **Individual Test Execution (Efficiency)**: Do NOT run the full test suite (`node test.js` or `npm test`) unless explicitly requested or necessary for final verification. Instead, run only the specific test file you are working on. This saves significant time and avoids API rate limits.
- **Dependency Aliasing (CRITICAL)**: The `test/package.json` resolves `"@mcpher/gas-fakes": "file:.."` as a local symlink. Because of this, `import '@mcpher/gas-fakes'` inside the `test/` directory *automatically* pulls in your local, uncommitted changes from `src/`. **NEVER** rewrite test imports to relative paths like `import '../src/index.js'`. Doing so breaks the test suite's isolation from module-level side effects and ignores the intended aliasing architecture.
- **Worker Thread Error Re-hydration**: `gas-fakes` uses a background worker (`src/support/workersync/worker.js`) to make async API calls synchronous. If an API request fails, the worker catches the error, serializes it (often as a nested JSON string like `err.response.data.error`), and writes it to a `SharedArrayBuffer`. 
  - To properly intercept these errors in tests using `@mcpher/unit`'s `t.threw`, you must ensure that the `synchronizer.js` successfully extracts the underlying error message and explicitly assigns it when re-hydrating the `Error` object on the main thread (otherwise `err.message` might be `undefined`).

### Apps Script API Nuances & Discoveries
- **DeveloperMetadata Location (Sheets API)**: When updating or creating `DeveloperMetadata` using the Sheets API (`batchUpdate`), the API considers the `location.locationType` property to be **read-only**. You must supply the boundary object (`dimensionRange`, `spreadsheet`, or `sheetId`), but you MUST NOT supply the string `locationType`. Including it will cause a 400 Bad Request.
- **Drive API Exports (`file.getAs`)**: Live Apps Script allows developers to call `file.getAs('application/pdf')` on plain text files. However, the standard Google Drive REST API (`drive.files.export`) strictly only supports exporting **Google Docs Editor** files (Docs, Sheets, Slides). 
  - To maintain parity with Apps Script, `gas-fakes` implements a **two-step conversion workaround** under the hood: when an export fails due to the `fileNotExportable` limitation, `gas-fakes` temporarily copies the file into a Google Doc (or Sheet/Slide), exports the temporary file to the requested format, and then trashes the temporary file. This ensures `file.getAs('application/pdf')` succeeds transparently for text and CSV files just like it does in live Apps Script.
- **Drive API Permissions & Roles Parity**: In `DriveApp`, functions like `getViewers()` and `getEditors()` do **NOT** cascade or inherit roles. A user is only returned in the specific group they are assigned to via the Drive API.
  - `owner` role -> returned by `getOwner()`
  - `writer` role -> returned by `getEditors()`
  - `reader` and `commenter` roles -> returned by `getViewers()`
  - There is no need to manually append "owners" or "writers" to the viewers list. Live Apps Script maintains strict segregation between these categories based on their primary role.
- **Null IDs in Advanced Services**: Unlike standard `DriveApp` (which immediately throws an `Invalid argument: id` error if passed `null` or `undefined`), Live Apps Script Advanced Services (like `Drive.Files.get(null)`) might silently fail or not throw an easily catchable exception. Do not write parity tests that expect Advanced Services to consistently throw specific errors for `null` parameters.

### GmailApp & GmailMessage Limitations
- **Missing Methods**: `gas-fakes` implementation of `GmailMessage` (i.e. `FakeGmailMessage`) does not natively support all methods found in Apps Script (e.g., `getSubject()`, `getDate()`, `getSnippet()`, `getFrom()`, `getTo()`). 
- **Workaround/Implementation**: When implementing these missing methods, you must extract the information from the raw Gmail API resource (e.g., parsing the `payload.headers` array to find the 'Subject' or 'Date').
- **Message Retrieval**: `GmailThread.getMessages()` is not implemented directly on the `FakeGmailThread` object. You should use `GmailApp.getMessagesForThread(thread)` instead.

### Google Cloud CLI & Eventual Consistency
- **IAM Propagation Delay**: When creating a new service account or applying IAM permissions via `gcloud`, Google Cloud IAM may take several seconds to propagate changes. Subsequent commands referencing the new entity may fail with "not found" errors if executed too quickly.
- **Retry Mechanism**: Always implement a retry loop (e.g., 5 retries with 5s delay) for `gcloud iam` commands that depend on recently created resources. A simple busy-wait or `execSync` to a sleep command can be used in a synchronous CLI environment to ensure portability.
- **Portability**: For cross-platform sync sleep in Node.js, a busy-wait loop (`while (Date.now() - start < delay)`) is often more reliable than depending on OS-specific `sleep` or `timeout` commands when running inside a CLI tool.


### Gmail API & Advanced Service Nuances
- **Advanced Service Method Hand-Coding**: The Advanced Services in `gas-fakes` (like `FakeAdvGmailMessages`) do not automatically expose all methods from the underlying `googleapis` package. If you need a method like `gmail.users.messages.modify` or `gmail.users.messages.attachments.get`, you MUST explicitly define a stub method on the `FakeAdvGmailMessages` class that invokes `this._call()`.
- **Worker Thread Dot-Notation (`sxGmail`)**: The synchronous worker wrapper (`sxGmail` in `sxgmail.js`) was updated to support dot notation. When adding deeply nested API calls (e.g., `method: 'attachments.get'`), `sxGmail` can iteratively resolve the nested function context on the `googleapis` client.
- **Gmail Object State Mutation**: Modifying labels on a `FakeGmailMessage` or `FakeGmailThread` (e.g., `addLabel()`, `markRead()`) via the REST API does not automatically update the local object's cached labels or headers. To maintain parity with Live GAS ("forces the message to refresh"), modifier methods MUST conclude by calling and returning `this.refresh()`, which re-fetches the latest state from the API.
- **Draft Creation & Payload Hydration**: When `Gmail.Users.Drafts.create` returns a draft resource, the embedded `.message` object is a minimal stub containing only `id` and `threadId`. It lacks the `payload` and headers. Therefore, `FakeGmailDraft.getMessage()` MUST perform a distinct `Gmail.Users.Messages.get` API call using the message ID to retrieve the fully hydrated message (otherwise `getSubject()`, `getBody()`, etc., will be empty).

### Caching & Data Mutation (CRITICAL)
- **Problem**: When data is returned from a local cache (e.g., `sheetsCacher`), it may be returned as a reference. If the calling code mutates this data (e.g., using `Array.prototype.shift()` on results from `getValues()`), the mutation affects the cache itself. Subsequent calls for the same data will then return the mutated (incorrect) results.
- **Fix**: ALWAYS return a deep copy of data from the cache. In `Syncit.js`, ensure that both `getEntry` results and data being passed to `setEntry` are deep-copied (e.g., using `JSON.parse(JSON.stringify(data))`). This ensures that the cache remains an immutable snapshot of the API response and that each caller receives a fresh, independent copy.
- **Implementation**: The `fxGeneric` and `fxDriveGet` functions in `Syncit.js` have been updated to use `normalizeSerialization()` for this purpose.

### Iterators and API Object Wrapping (CRITICAL)
- **Problem**: When fetching a list of resources (like `Drive.Files.list`), the API returns plain JSON objects. If you convert an entire chunk of these objects into class instances (e.g., `FakeDriveFolder`) prematurely and store them in the state (or `tank`), and then subsequently pass those instances *back* through the instantiation function (`__settleClass`), you will double-wrap them. This causes the internal `this.meta` to be a Fake instance instead of a plain object.
- **Consequence**: This corruption leaks into the `improveFileCache` mechanism (since the cached "raw" data is actually an instance). Later API calls that rely on reading `this.meta` (e.g., checking `Reflect.has(this.meta, 'id')`) fail because `normalizeSerialization` strips the prototype properties, resulting in a plain object missing its core fields. This leads to infinite resolution loops (e.g., `RangeError: Maximum call stack size exceeded` in `getId()`).
- **Fix**: Generators and iterators (like `filesink()` in `driveiterators.js`) MUST store only plain API JSON objects in their state (`tank`). Only convert the raw API object into a Fake instance at the exact moment it is `yield`ed or returned to the caller.

### Google Drive API vs Apps Script Roles (Parity)
- **Problem**: When fetching the users attached to a file, the live Google Drive API (and thus `gas-fakes` using the `Drive.Permissions` endpoint) strictly isolates users by their specific role (e.g., `writer`, `reader`). However, Live Apps Script behaves differently: `getViewers()` returns anyone with *at least* view access (including Editors and the Owner), and `getEditors()` returns anyone with *at least* edit access (including the Owner). 
- **Fix**: The `getSharers()` helper in `filesharers.js` dynamically expands the queried roles based on this hierarchy to match live GAS behavior. Specifically:
  - When querying for `writer`, we also fetch `owner`.
  - When querying for `reader` or `commenter`, we fetch `writer` and `owner` as well.

### Slides API ColorScheme & Role Hierarchy (CRITICAL)
- **Inheritance**: In the Google Slides REST API, the `colorScheme` property is only present on `Master` pages. `Slide` and `Layout` pages inherit their color scheme from their parent master. `gas-fakes` emulates this by resolving the master page when `getColorScheme()` is called on a slide or layout.
- **Update Constraints**: When updating a `ColorScheme` via the API (`updatePageProperties`), you MUST provide the entire array of 12 theme color pairs (Dark 1, Light 1, etc.). Providing only the updated color will result in an API error.
- **Data Structure Inconsistency**: While the REST API documentation for `OpaqueColor` specifies a nested `rgbColor` object, `ColorScheme` results (and updates) often use a flat structure where `red`, `green`, and `blue` are direct properties of the color object. `gas-fakes` handles both formats to ensure compatibility.
- **Layout Properties**: In the Slides API, a layout's connection to its master is stored in `layoutProperties.masterObjectId`, not at the top level of the page resource.
- **Background Fill propertyState**: The Slides REST API returns the `solidFill` object even when `propertyState` is `'NOT_RENDERED'` (representing transparent/none). When implementing `getType()` or `isVisible()`, you must verify that `propertyState !== 'NOT_RENDERED'` to correctly identify transparent fills.


### Delivery
- Output the complete code for modified or newly created service classes and test scripts.
- **ALWAYS output the updated `SKILL.md`** when new knowledge is extracted and crystallized.

### Documentation & Progress Tracking (CRITICAL)
- **Do NOT update progress files manually**: Files in the `progress/` directory (e.g., `progress/spreadsheet.md`) and the top-level `progress.md` are generated automatically.
- **Generation Pipeline**: After implementing or modifying ANY methods, classes, or enums, you MUST run the documentation generation pipeline to ensure your changes are discoverable and accurately reflected in the `progress/` documentation. This acts as your "Definition of Done".
  ```bash
  npm run docs
  ```
  *(This command executes the full documentation pipeline including `gi-analyzer-all.js`, `gi-render.js`, and `gi-progress-summary.js`.)*
- **Detection Logic**: The analyzer (`doccreation/gi-analyzer-all.js`) detects implemented methods by searching for method names in the `src/` directory. 
  - If a method is implemented in a base class or uses a synonym, ensure the class is correctly mapped in the `classSynonyms` object within `doccreation/gi-analyzer-all.js`.
  - For **dynamically generated methods** (like `require*` in `DataValidationBuilder` or `set*`/`get*` in `Range`), the analyzer must be explicitly updated to map these methods from their source definitions (e.g., `datavalidationcriteriamapping.js` or `sheetrangemakers.js`) to the target class.
- **In-Progress Status**: Methods that call `notYetImplemented()` are automatically marked as `in progress`. Once the implementation is complete and the call to `notYetImplemented()` is removed, the status will switch to `completed` upon running the pipeline.
### Chart Generation API Parity (SpreadsheetApp.newChart)
When implementing or modifying `EmbeddedChartBuilder` features, you must handle the strict differences between Google's Java V8 engine and the actual Sheets REST API payloads:
- **Enum Strictness**: Live GAS actively rejects string literals for `Charts` Enums (e.g., passing `"SHOW_ALL"` instead of `Charts.ChartHiddenDimensionStrategy.SHOW_ALL` throws `The parameters (String) don't match the method signature`). All new Enums MUST be mapped in `src/services/enums/` and exposed via the parent `FakeApp` proxy.
- **REST API Translation**: The structure of the `EmbeddedChartBuilder` does not match the Google Sheets REST API. 
  - `BOTTOM` becomes `BOTTOM_LEGEND`.
  - `PIE` and `HISTOGRAM` charts cannot be sent in a `basicChart` spec wrapper; they require top-level `pieChart` and `histogramChart` payloads.
  - `COMBO` charts will crash the Sheets API if their internal series arrays are missing explicit type definitions (`COLUMN` or `LINE`). The visual default fallback in Apps Script is `COLUMN`.
  - Ensure all Enum and API-specific restructuring occurs in the `.build()` translation layer, or within dedicated mappers like `chartenummapping.js`.
- **Dynamic toString**: A Live GAS builder's `toString()` output changes dynamically depending on the active internal chart type (e.g., `com.google.apps.maestro...` vs `EmbeddedPieChartBuilder`). Use `FakeEmbeddedChartBuilder`'s dynamic `toString()` pattern to maintain parity.
- **Method Availability (Live GAS Crash Warning)**: Live GAS does not support visual formatting methods (`setTitle`, `setBackgroundColor`) on the root `EmbeddedChartBuilder`; they are only available *after* casting (`.asPieChart()`). Furthermore, `setHiddenDimensionStrategy` will throw a backend `Unexpected error` if called before assigning a type, or if called on an incompatible type (like a Pie chart).

### Environment-Agnostic Test Design (CRITICAL)
- **No Direct Mock Class References**: Test files MUST NOT import or directly reference fake classes using `new` (e.g. `new FakeElement()`, `new FakeAttribute()`, etc.). These classes do not exist in the live Google Apps Script environment, where the same tests are run. Instead, always instantiate objects via the public factory methods of their respective service (e.g., `XmlService.createElement()`) and assert against properties instead of direct object reference comparisons.
- **Private Data Structures**: Under no circumstances should test files directly assert against internal `gas-fakes` structural properties (e.g., checking `builder.__apiChart.spec.title`). The test suite executes against **both** local Node.js mocks and Live Apps Script Java classes. Live Apps Script does not expose these internal variables, causing tests to crash.
- **gas-fakes Specific Objects (`__behavior`)**: Objects like `ScriptApp.__behavior` or `sandboxMode` exist ONLY in the local Node.js environment. If you need to manipulate the sandbox during a test (e.g., adding a whitelist ID), you MUST wrap that code in an `if (ScriptApp.isFake)` block. Attempting to access `ScriptApp.__behavior.sandboxMode` in Live Apps Script will result in a `TypeError: Cannot read properties of undefined`.
- **Test Outcomes**: Only assert against public, documented getter/setter behavior or the visual/functional output of a method (e.g., inserting the chart into a sheet and validating the resulting API object). Avoid bypassing validations using `ScriptApp.isFake` for private implementation assertions unless strictly manipulating the local test harness (like the sandbox).

### Exporting Local Variables for Templates & RPC (Parity)
- **Problem**: When developing an Apps Script project locally with `gas-fakes`, templates (`<?!= Include.html() ?>`) and client-side RPC calls (`google.script.run.foo()`) require backend functions/variables to be explicitly exported from the entry point (`index.js`). 
- **Constraint**: The Google Apps Script V8 engine **DOES NOT** support ES6 `export` or `import` statements. Including them will cause syntax errors in the Apps Script environment.
- **Fix (Using togas)**: Use the `gas-fakes togas` CLI command to prepare your local code for deployment.
  1. The `togas` command automatically comments out `import` statements and removes `export` keywords.
  2. It copies the transformed files to a target directory (configured via `init` or `--target`).
  3. It uses `clasp push` to deploy the transformed code to Apps Script.
- **Result**: You can maintain idiomatic Node.js code with ESM imports/exports locally while ensuring the deployed Apps Script code remains valid.

### Local Documentation Discovery (Parity & Method Verification)

For rapid and accurate verification of Apps Script class and method signatures, parameter lists, return types, and descriptions, developers should prioritize searching the local documentation repository.

The file `/Users/brucemcpherson/Documents/repos/gas-fakes/doccreation/gi-fake-all.json` contains a complete, comprehensive duplicate of all Apps Script documentation.

**Prioritization Strategy:**

Instead of relying on external web searches, which can be slow, prone to outdated information, or lack precise syntax matching, use local command-line tools (`grep`, `jq`, etc.) to query `gi-fake-all.json`.

**Why Local Search is Superior:**

1.  **Efficiency:** Local searches are instantaneous compared to network latency.
2.  **Offline Access:** Documentation is available even without an internet connection.
3.  **Guaranteed Accuracy:** The JSON file provides a guaranteed, static snapshot of the documentation, ensuring that the syntax and usage details match the expected environment, eliminating ambiguity found in general web searches.

### Apps Script Advanced BigQuery Service Emulation
- **Emulation Architecture**: Emulating the Advanced BigQuery Service (`BigQuery`) requires:
  - Defining the factory methods and creators properties list (e.g. `newQueryRequest`, `newDataset`, etc.) in `bqpropslist.js` for `advClassMaker` to construct objects with matching getters, setters, and `toString()` JSON stringifiers.
  - Implementing sub-resource classes like `FakeAdvBigQueryDatasets`, `FakeAdvBigQueryJobs`, etc., extending `FakeAdvResource` and calling `Syncit.fxBigQuery`.
  - Creating `bqapis.js` to construct the standard Google BigQuery v2 client using `google.bigquery({ version: 'v2', auth })` from `googleapis`.
  - Registering the sync task runner `sxBigQuery` in `sxbigquery.js` and integrating it with `sxfunctions.js` and `Syncit.js` (`fxBigQuery`).


## 💡 Code Design, Performance, and gas-fakes Parity Guidelines

To maintain full transferability and prevent API quota limits, strictly adhere to these design principles:

### 1. Synchronous Code Nature (gas-fakes Parity)
- **Concept**: `gas-fakes` emulates the synchronous nature of Google Apps Script APIs using fiber/worker threads.
- **Rule**: Avoid writing code using `async`/`await` or promises when calling Google Workspace API methods (e.g. `BigQuery.Jobs.query`, `SpreadsheetApp.create`, etc.). 
- **Benefit**: Writing synchronous code ensures that scripts and tests are 100% transferable to the live Google Apps Script environment without modification.

### 2. Quota & Rate-Limit Optimization (`setValues` over `appendRow`)
- **Concept**: Making repeated individual API calls (such as in a loop using `sheet.appendRow()`) generates multiple HTTP REST requests, leading to Google API rate limits and quota errors (e.g., HTTP 429 quota exceptions).
- **Rule**: Collect data into a two-dimensional array first, grab the full target range using `sheet.getRange(startRow, startCol, numRows, numCols)`, and update everything in a single, atomic operation using `.setValues(twoDArray)`.
- **Benefit**: Reduces network round-trips to one single highly optimized call, avoiding 429 errors and significantly speeding up execution.


