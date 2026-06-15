### Google Docs API Limitations

- **Horizontal Rules**: The underlying Google Docs API does not support creating, updating, or managing `HorizontalRule` elements. Because `gas-fakes` maps local calls to the REST API, attempting to use methods like `body.appendHorizontalRule()` or `body.insertHorizontalRule()` will crash the script with a `GoogleJsonResponseException` (e.g., `Invalid requests...`).
  - **Workaround**: If you need to visually separate content in a generated Document, use simple text-based separators like `body.appendParagraph('--------------------------------------------------')` instead.
