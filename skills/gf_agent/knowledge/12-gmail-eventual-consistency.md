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