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

