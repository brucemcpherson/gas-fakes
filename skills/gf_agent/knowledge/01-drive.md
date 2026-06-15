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
