# gf_agent Documentation

This document provides patterns and examples for using `gf_agent` and `gas-fakes` to automate Google Workspace tasks.

## Integration Guides

### Gemini CLI & MCP Setup
To integrate `gf_agent` and its Workspace tools into Gemini CLI:

1. **Link the Skill**:
   ```bash
   gemini skills link /Users/brucemcpherson/Documents/repos/gas-fakes/gf_agent
   ```
2. **Add MCP Tools**:
   Run this to register the service-specific tools (Spreadsheet, Doc, Drive, etc.):
   ```bash
   gemini mcp add --scope project gas-fakes-mcp node ./gas-fakes.js mcp
   ```
3. **Verify**: Run `gemini mcp list` to see the registered `gas-fakes-mcp` tools.
4. **Use it**:
   - **As an Agent**: `@gf_agent create a sheet...`
   - **As Tools**: You don't need to specify the tool name. The LLM automatically infers whether to use `spreadsheet_service`, `drive_service`, or the cross-service `workspace_agent`. Just say: *"Read my latest Drive document and email it to john@example.com."*

### Generic MCP Setup (Antigravity, Claude, etc.)
`gas-fakes` includes a built-in MCP server that can be used by any MCP-compatible client.

## Core Patterns

### Initialization
Every script must import `@mcpher/gas-fakes` to enable the local emulation environment.
```javascript
import '@mcpher/gas-fakes';
```

### Google Sheets (SpreadsheetApp)
#### Create and modify a sheet
```javascript
const ss = SpreadsheetApp.create('My New Sheet');
const sheet = ss.getActiveSheet();
sheet.getRange('A1').setValue('Item');
sheet.getRange('B1').setValue('Count');
sheet.getRange('A2:B2').setValues([['Apples', 10]]);
```

#### Read data from a sheet
```javascript
const ss = SpreadsheetApp.openById('SPREADSHEET_ID');
const data = ss.getDataRange().getValues();
console.log(data);
```

### Google Docs (DocumentApp)
#### Create and append text
```javascript
const doc = DocumentApp.create('My Doc');
const body = doc.getBody();
body.appendParagraph('Hello World');
body.appendListItem('First Item');
body.appendTable([['Header 1', 'Header 2'], ['Val 1', 'Val 2']]);
```

### Google Drive (DriveApp)
#### List files in a folder
```javascript
const folder = DriveApp.getFolderById('FOLDER_ID');
const files = folder.getFiles();
while (files.hasNext()) {
  const file = files.next();
  console.log(file.getName(), file.getId());
}
```

#### Create a folder
```javascript
const newFolder = DriveApp.createFolder('Project Assets');
```

### Gmail (GmailApp)
#### Send an email
```javascript
GmailApp.sendEmail('recipient@example.com', 'Subject', 'Body content');
```

## Advanced Usage

### Using the Sandbox
By default, `gas-fakes` operates in a sandbox. You can check if you are in fake mode and configure behavior:
```javascript
if (ScriptApp.isFake) {
  const behavior = ScriptApp.__behavior;
  behavior.sandboxMode = true; // only see files created in this session
}
```

### Cleanup
If you create many test files, you can trash them at the end of the session:
```javascript
if (ScriptApp.isFake) {
  ScriptApp.__behavior.trash();
}
```

## Troubleshooting
- **Method not found**: Check the [Index](index.md) to see if the method is implemented.
- **Permission denied**: Ensure you are using the correct IDs or that the sandbox is configured to allow access to those IDs.
