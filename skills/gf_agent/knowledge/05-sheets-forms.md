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
