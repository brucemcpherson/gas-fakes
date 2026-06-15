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
