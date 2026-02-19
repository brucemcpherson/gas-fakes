# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> `gas-fakes` Sandbox Mode

`gas-fakes` includes a powerful sandbox feature that allows you to control file access and manage test artifacts, ensuring your tests are isolated, predictable, and clean.

## The `ScriptApp.__behavior` Object

All sandbox configurations are managed through the global `ScriptApp.__behavior` object. This object is your central point for enabling, disabling, and fine-tuning the sandbox environment.

## Global Sandbox Controls

You can set the overall behavior of the sandbox using these top-level properties.

| Property | Type | Default | Description |
|---|---|---|---|
| `sandboxMode` | `boolean` | `false` | When `true`, file access is restricted. By default, only files created during the current session are accessible. |
| `strictSandbox` | `boolean` | `true` | When `true` (and `sandboxMode` is active), any attempt to access a non-whitelisted, non-session file will throw an error. If `false`, access is allowed, which is useful for debugging but doesn't strictly emulate the `drive.file` scope. |
| `cleanup` | `boolean` | `true` | If `true`, calling `ScriptApp.__behavior.trash()` will move all files created during the session to the Google Drive trash. Set to `false` to leave test artifacts for inspection. |

### Sandbox Management Methods

| Method | Description |
|---|---|
| `resetDrive()` | Clears the session tracking for DriveApp files (created and allowed IDs). |
| `resetGmail()` | Clears the session tracking for GmailApp resources (threads and labels). |
| `resetCalendar()` | Clears the session tracking for CalendarApp calendars. |
| `reset()` | Clears session tracking for all services (calls the three above). |
| `trash()` | Moves all files created during the session to the Google Drive trash (if `cleanup` is `true`). |

### Basic Usage

```javascript
// Enable sandbox mode at the start of your test suite
ScriptApp.__behavior.sandboxMode = true;

// Your test code...
const myFile = DriveApp.createFile('test.txt', 'hello');

// This will succeed because the file was created in the current session
const retrievedFile = DriveApp.getFileById(myFile.getId());

// This would fail because the file ID was not created in this session and is not whitelisted
// const otherFile = DriveApp.getFileById('some-other-id');

// At the end of your test run, clean up all created files
ScriptApp.__behavior.trash();
```

## File Access Control: The Whitelist

When you need to access specific, pre-existing files (like templates or test data fixtures) in strict sandbox mode, you can add their IDs to a whitelist.

### `IdWhitelistItem`

You create whitelist entries using `behavior.newIdWhitelistItem(id)`. Each item can be configured with specific permissions.

| Method | Description |
|---|---|
| `setRead(boolean)` | Allows read operations (e.g., `openById`, `getName`). Defaults to `true`. |
| `setWrite(boolean)` | Allows write operations (e.g., `setContent`, `appendParagraph`). Defaults to `false`. |
| `setTrash(boolean)` | Allows the file to be trashed (`setTrashed(true)`). Defaults to `false`. |

### Whitelist Management Methods

| Method | Description |
|---|---|
| `addIdWhitelist(item)` | Adds an `IdWhitelistItem` to the list. |
| `removeIdWhitelist(id)` | Removes an item from the list by its ID. |
| `clearIdWhitelist()` | Clears all items from the whitelist. |
| `setIdWhitelist(items)` | Replaces the entire whitelist with a new array of `IdWhitelistItem`s. |

### Whitelist Example

```javascript
const behavior = ScriptApp.__behavior;
behavior.sandboxMode = true;
behavior.strictSandbox = true;

const TEMPLATE_DOC_ID = 'your-template-doc-id';
const LOG_SHEET_ID = 'your-log-sheet-id';

// Whitelist a document for reading only
const readOnlyItem = behavior.newIdWhitelistItem(TEMPLATE_DOC_ID);

// Whitelist a spreadsheet for reading, writing, and trashing
const readWriteItem = behavior.newIdWhitelistItem(LOG_SHEET_ID)
  .setWrite(true)
  .setTrash(true);

behavior.setIdWhitelist([readOnlyItem, readWriteItem]);

// --- Accessing whitelisted files ---

// This succeeds (read is allowed)
const doc = DocumentApp.openById(TEMPLATE_DOC_ID);
console.log(doc.getName());

// This fails (write is not allowed for the doc)
try {
  doc.getBody().appendParagraph('This will fail.');
} catch (e) {
  console.error(e.message); // Write access to file ... is denied
}

// This succeeds (write is allowed for the sheet)
const sheet = SpreadsheetApp.openById(LOG_SHEET_ID);
sheet.getRange('A1').setValue('Log entry');

// This succeeds (trash is allowed for the sheet)
DriveApp.getFileById(LOG_SHEET_ID).setTrashed(true);
```

## Granular Per-Service Controls

For even more fine-grained control, you can define specific sandbox behaviors for individual services (`DriveApp`, `SpreadsheetApp`, `DocumentApp`, `SlidesApp`, and their advanced service counterparts). Per-service settings override the global settings.

Settings for a service are accessed via `ScriptApp.__behavior.sandboxService.<ServiceName>`.

| Property | Type | Default (Effective) | Description |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Set to `false` to completely disable all methods of this service. |
| `sandboxMode` | `boolean` | Global `sandboxMode` | Overrides the global `sandboxMode` for this service only. |
| `strictSandbox` | `boolean` | Global `strictSandbox` | Overrides the global `strictSandbox` for this service only. |
| `methodWhitelist` | `string[]` | `null` (all allowed) | An array of method names that are permitted. If set, any call to a method not in this array will throw an error. |

### Per-Service Configuration Methods

| Method | Description |
|---|---|
| `clear()` | Resets all settings for a specific service, causing it to inherit from the global configuration again. |
| `addMethodWhitelist(name)` | Adds a method name to the service's whitelist. |
| `removeMethodWhitelist(name)` | Removes a method name from the whitelist. |
| `clearMethodWhitelist()` | Clears the method whitelist for the service. |

### Advanced Examples

#### Disabling a Service

**Note:** Most services (`SpreadsheetApp`, `DocumentApp`, etc.) depend on `DriveApp` for file operations. Disabling `DriveApp` while other services are enabled will have no effect.

```javascript
// Disable DocumentApp, but allow other services to work
ScriptApp.__behavior.sandboxService.DocumentApp.enabled = false;

// This will throw an error
try {
  DocumentApp.create('wont-work');
} catch (e) {
  console.error(e.message); // "DocumentApp service is disabled..."
}

// This will still work
const ss = SpreadsheetApp.create("My Sheet");
```

#### Restricting Methods

**Note:** Certain core methods (like `getFileById`) are essential for a service to function and may be implicitly allowed even if not in the whitelist.

```javascript
// In DriveApp, only allow creating folders and getting files by name.
const driveSettings = ScriptApp.__behavior.sandboxService.DriveApp;
driveSettings.setMethodWhitelist(['createFolder', 'getFilesByName']);

// This will succeed
const newFolder = DriveApp.createFolder("My Test Folder");

// This will throw an error
try {
  const root = DriveApp.getRootFolder();
} catch (e) {
  console.error(e.message); // "Method DriveApp.getRootFolder is not allowed..."
}
```


## Gmail Sandbox Checks

In addition to standard file restrictions, `gas-fakes` provides specific sandbox controls for `GmailApp` to prevent unintended emails or changes to your Gmail account during testing.

These rules are configured in `ScriptApp.__behavior.sandboxService.GmailApp`.

### Configuration Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `emailWhitelist` | `string[]` | `[]` | List of email addresses allowed to receive emails. Emails sent to addresses not in this list (or allowed by session rules) will throw an error. |
| `usageLimit` | `object` or `number` | `undefined` | Limits for operations. Can be a number (implies **total** limit for all operations combined) or an object `{ read?: number, write?: number, trash?: number, send?: number }`. |
| `labelWhitelist` | `LabelWhitelistConfig[]` | `[]` | Configuration for allowed labels, specifying `name` and permissions (`read`, `write`, `delete`, `send`). |
| `cleanup` | `boolean` | Global `cleanup` | Controls whether Gmail artifacts (labels, threads) created in the session are trashed on cleanup. Defaults to global setting if not set. |

### Session Tracking & Cleanup

- **Session Access**: Any email, thread, or label created *during* the sandbox session is automatically whitelisted and tracking in `__createdGmailIds`. You can access and modify these items freely.
- **Cleanup**: When `ScriptApp.__behavior.trash()` is called (and `cleanup` is `true`), `gas-fakes` will attempt to delete labels and trash threads created during the session.

### Label Whitelist

Restricts which *existing* threads and messages your script can access.

`LabelWhitelistConfig` has the structure: `{ name: string, read?: boolean, write?: boolean, delete?: boolean, send?: boolean }` (defaults are `false`).

- **Access Rule**: `GmailApp.getThreadById(id)` or `GmailApp.search(...)` will only return threads that either:
    1. Were created in the current session.
    2. Have at least one label present in `labelWhitelist` with `read: true`.
- **Modification Rule**: `GmailApp.createLabel(name)` or `deleteLabel(label)` requires the label name to be in the whitelist (with `write` or `delete` permissions respectively), or be a new session label.
- **Deletion Rule**: `GmailApp.moveThreadToTrash(thread)` requires the thread to be accessible (session-created or whitelisted label).

### Gmail Example

```javascript
const behavior = ScriptApp.__behavior;
behavior.sandboxMode = true;

// Configure Gmail Sandbox
const gmailSettings = behavior.sandboxService.GmailApp;
gmailSettings.emailWhitelist = ['allowed@example.com'];
gmailSettings.cleanup = false; // Keep Gmail artifacts after test (overrides global cleanup=true)

// Granular limits
gmailSettings.usageLimit = { write: 5, read: 20, trash: 1 };
// Or simple write limit: gmailSettings.usageLimit = 5;

gmailSettings.labelWhitelist = [
  { name: 'AllowedLabel', read: true, write: true, delete: false },
  { name: 'Inbox', read: true } // Allow reading inbox threads
];

// --- Sending Emails ---

// Succeeds
GmailApp.sendEmail('allowed@example.com', 'Subject', 'Body');

// Fails (email not in whitelist)
// GmailApp.sendEmail('random@example.com', ...);

// --- Accessing Threads ---

// Succeeds (thread has 'AllowedLabel' or 'Inbox')
const threads = GmailApp.search('label:AllowedLabel');

// Fails (access denied if thread doesn't match rules)
// const forbiddenThread = GmailApp.getThreadById('some-hidden-thread-id');

// --- Creating Labels ---

// Succeeds (in whitelist with write: true)
GmailApp.createLabel('AllowedLabel');

// Fails (not in whitelist)
// GmailApp.createLabel('SecretLabel');
```

## CalendarApp Sandbox Checks

Similar to `GmailApp`, `gas-fakes` provides specific sandbox controls for `CalendarApp` to prevent unintended calendar modifications during testing.

These rules are configured in `ScriptApp.__behavior.sandboxService.CalendarApp`.

### Configuration Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `calendarWhitelist` | `CalendarWhitelistConfig[]` | `[]` | Configuration for allowed calendars, specifying `name` and permissions (`read`, `write`, `delete`). |
| `usageLimit` | `object` or `number` | `undefined` | Limits for operations. Can be a number (implies **total** limit for all operations combined) or an object `{ read?: number, write?: number, trash?: number }`. |
| `cleanup` | `boolean` | Global `cleanup` | Controls whether calendars created in the session are deleted on cleanup. Defaults to global setting if not set. |

### Session Tracking & Cleanup

- **Session Access**: Any calendar created *during* the sandbox session is automatically whitelisted and tracked in `__createdCalendarIds`. You can access and modify these calendars freely.
- **Cleanup**: When `ScriptApp.__behavior.trash()` is called (and `cleanup` is `true`), `gas-fakes` will delete calendars created during the session.

### Calendar Whitelist

Restricts which *existing* calendars your script can access.

`CalendarWhitelistConfig` has the structure: `{ name: string, read?: boolean, write?: boolean, delete?: boolean }` (defaults are `false`).

- **Access Rule**: `CalendarApp.getCalendarById(id)` or `CalendarApp.getAllCalendars()` will only return calendars that either:
    1. Were created in the current session.
    2. Are the primary calendar (`'primary'`).
    3. Have a name present in `calendarWhitelist` with `read: true`.
- **Modification Rule**: `Calendar.setName()`, `setDescription()`, or `setTimeZone()` requires the calendar to be session-created, primary, or in the whitelist with `write: true`.
- **Deletion Rule**: Deleting calendars requires appropriate permissions (to be implemented with event-level sandboxing).

### CalendarApp Example

```javascript
const behavior = ScriptApp.__behavior;
behavior.sandboxMode = true;

// Configure Calendar Sandbox
const calendarSettings = behavior.sandboxService.CalendarApp;
calendarSettings.cleanup = true; // Delete calendars created during test

// Granular limits
calendarSettings.usageLimit = { write: 5, read: 20, trash: 1 };
// Or simple total limit: calendarSettings.usageLimit = 10;

calendarSettings.calendarWhitelist = [
  { name: 'Work Calendar', read: true, write: true, delete: false },
  { name: 'Personal', read: true, write: false }
];

// --- Accessing Calendars ---

// Succeeds (primary calendar always accessible)
const primary = CalendarApp.getDefaultCalendar();

// Succeeds (in whitelist with read: true)
const workCals = CalendarApp.getCalendarsByName('Work Calendar');

// Fails (not in whitelist)
// const secretCal = CalendarApp.getCalendarsByName('Secret Calendar');

// --- Creating Calendars ---

// Succeeds (session-created calendars are always accessible)
const newCal = CalendarApp.createCalendar('Test Calendar');
newCal.setDescription('Created during test'); // Succeeds (session-created)

// --- Modifying Calendars ---

// Succeeds (in whitelist with write: true)
workCals[0].setDescription('Updated description');

// Fails (in whitelist but write: false)
// const personalCal = CalendarApp.getCalendarsByName('Personal')[0];
// personalCal.setName('New Name'); // Throws error

// --- Cleanup ---

// At end of test, newCal will be automatically deleted
ScriptApp.__behavior.trash();
```

### Calendar Event Sandbox

`gas-fakes` extends calendar sandboxing to individual events.

- **Event Modification**: Methods that modify an event (e.g., `setTitle()`, `setDescription()`, `setTime()`) are subject to the same read/write/delete permissions as the parent calendar.
- **Usage Limits**: Event modifications count towards the `CalendarApp` usage limits (`read`, `write`, `trash`).
- **Invitee Sandboxing**: Adding guests to an event using `addGuest()` is restricted by the `GmailApp` `emailWhitelist`. Only email addresses in the whitelist (if configured) can be added as guests.

### Future Calendar Sandbox Features

The following features are planned for future implementation:

- **Recurrence sandboxing**: Control access and modifications to recurring event series.
- **Advanced event properties**: Granular control over attachments, visibility, and other advanced event fields.

## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading

- [getting started](GETTING_STARTED.md) - how to handle authentication for restricted scopes.
- [readme](README.md)
- [gas fakes cli](gas-fakes-cli.md)
- [running gas-fakes on google cloud run](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on google kubernetes engine](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on Amazon AWS lambda](https://github.com/brucemcpherson/gas-fakes-containers)
- [Yes – you can run native apps script code on AWS Lambda!](https://ramblings.mcpher.com/apps-script-on-aws-lambda/)
- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/)
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](oddities.md) - a collection of oddities uncovered during this project
- [named colors](named-colors.md)
- [sandbox](sandbox.md)
- [senstive scopes](senstive_scopes.md)
- [using apps script libraries with gas-fakes](libraries.md)
- [how libhandler works](libhandler.md)
- [article:using apps script libraries with gas-fakes](https://ramblings.mcpher.com/how-to-use-apps-script-libraries-directly-from-node/)
- [named range identity](named-range-identity.md)
- [adc and restricted scopes](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- [push test pull](pull-test-push.md)
- [sharing cache and properties between gas-fakes and live apps script](https://ramblings.mcpher.com/sharing-cache-and-properties-between-gas-fakes-and-live-apps-script/)
- [gas-fakes-cli now has built in mcp server and gemini extension](https://ramblings.mcpher.com/gas-fakes-cli-now-has-built-in-mcp-server-and-gemini-extension/)
- [gas-fakes CLI: Run apps script code directly from your terminal](https://ramblings.mcpher.com/gas-fakes-cli-run-apps-script-code-directly-from-your-terminal/)
- [How to allow access to sensitive scopes with Application Default Credentials](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- [Supercharge Your Google Apps Script Caching with GasFlexCache](https://ramblings.mcpher.com/supercharge-your-google-apps-script-caching-with-gasflexcache/)
- [Fake-Sandbox for Google Apps Script: Granular controls.](https://ramblings.mcpher.com/fake-sandbox-for-google-apps-script-granular-controls/)
- [A Fake-Sandbox for Google Apps Script: Securely Executing Code Generated by Gemini CLI](https://ramblings.mcpher.com/gas-fakes-sandbox/)
- [Power of Google Apps Script: Building MCP Server Tools for Gemini CLI and Google Antigravity in Google Workspace Automation](https://medium.com/google-cloud/power-of-google-apps-script-building-mcp-server-tools-for-gemini-cli-and-google-antigravity-in-71e754e4b740)
- [A New Era for Google Apps Script: Unlocking the Future of Google Workspace Automation with Natural Language](https://medium.com/google-cloud/a-new-era-for-google-apps-script-unlocking-the-future-of-google-workspace-automation-with-natural-a9cecf87b4c6)
- [Next-Generation Google Apps Script Development: Leveraging Antigravity and Gemini 3.0](https://medium.com/google-cloud/next-generation-google-apps-script-development-leveraging-antigravity-and-gemini-3-0-c4d5affbc1a8)
- [Modern Google Apps Script Workflow Building on the Cloud](https://medium.com/google-cloud/modern-google-apps-script-workflow-building-on-the-cloud-2255dbd32ac3)
- [Bridging the Gap: Seamless Integration for Local Google Apps Script Development](https://medium.com/@tanaike/bridging-the-gap-seamless-integration-for-local-google-apps-script-development-9b9b973aeb02)
- [Next-Level Google Apps Script Development](https://medium.com/google-cloud/next-level-google-apps-script-development-654be5153912)
- [Secure and Streamlined Google Apps Script Development with gas-fakes CLI and Gemini CLI Extension](https://medium.com/google-cloud/secure-and-streamlined-google-apps-script-development-with-gas-fakes-cli-and-gemini-cli-extension-67bbce80e2c8)
- [Secure and Conversational Google Workspace Automation: Integrating Gemini CLI with a gas-fakes MCP Server](https://medium.com/google-cloud/secure-and-conversational-google-workspace-automation-integrating-gemini-cli-with-a-gas-fakes-mcp-0a5341559865)
- [A Fake-Sandbox for Google Apps Script: A Feasibility Study on Securely Executing Code Generated by Gemini CL](https://medium.com/google-cloud/a-fake-sandbox-for-google-apps-script-a-feasibility-study-on-securely-executing-code-generated-by-cc985ce5dae3)
