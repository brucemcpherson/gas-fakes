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