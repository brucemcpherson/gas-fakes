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
