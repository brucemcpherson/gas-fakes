### <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> How Named Ranges Are Used to Track Element Identity

The core challenge in emulating `DocumentApp` is understanding how Apps Script objects, like a `Paragraph`, remain "alive" and valid even after the document is modified and their position changes.

```javascript
// Live Apps Script Example
var body = DocumentApp.getActiveDocument().getBody();
var p2 = body.appendParagraph("Paragraph 2");

// Now, insert a new paragraph before p2
body.insertParagraph(1, "A new paragraph before p2"); 

// Even though p2 has shifted, this still works!
p2.setText("Paragraph 2 has been updated."); 
```

The `p2` object somehow "knows" where it is in the document, even though its character indices (`startIndex`, `endIndex`) have changed. A simple approach of just storing an element's `startIndex` would fail immediately after the first insertion or deletion.

### The Solution: Named Ranges as Stable Anchors

`gas-fakes` solves this by using the Google Docs API's **Named Range** feature as a persistent, stable "tag" for every structural element in the document.

Here’s the step-by-step process:

#### 1. Initial "Tagging" on Document Load

When a `FakeDocument` is opened or refreshed, `gas-fakes` performs a full scan of the document's structure using the advanced `Docs.Documents.get()` method.

*   For every structural element it finds (a `PARAGRAPH`, `LIST_ITEM`, `TABLE`, etc.), it creates a corresponding **unique named range** in the live Google Doc.
*   This named range is given a unique, randomly generated name, like `GAS_FAKE_body_PARAGRAPH_13260ced-7174-4bb9-b7e8-f39d1ad662a1`.
*   This name becomes the **stable, unique identifier** for that specific element instance.

#### 2. The `FakeElement` Object's Identity

When `gas-fakes` returns an element object to your script (e.g., the `FakeParagraph` returned by `body.appendParagraph()`), that object doesn't just know its current position. Its most important internal property is this unique named range name, stored in `this.__name`.

This `__name` is the element's "soul." It's the key that allows the object to find itself again, no matter how the document changes around it.

#### 3. The "Self-Healing" Mechanism on Method Calls

When you call a method on a `FakeParagraph` object, like `p2.getText()`, the following happens:

1.  The `FakeParagraph` object accesses its internal `__elementMapItem` property.
2.  This is a dynamic getter that first tries to find the element in its local document model (`shadowDocument`) using its last known name (`this.__name`).
3.  If the document has been modified and that name is no longer valid (the "stale reference" problem), the getter uses a fallback: it finds the element based on its **original `startIndex`** that was cached when the object was first created.
4.  Once it finds the element at the new position, it retrieves the element's **new unique name** from the refreshed document model and updates its own `this.__name`.
5.  With the "revived" element data, the `getText()` method can now execute correctly.

#### 4. The Critical Importance of Named Range Protection

The self-healing mechanism described above only works if the element's identity is preserved in the live document across API calls.

*   **The Problem:** We discovered that when you send a `batchUpdate` request that modifies content (like `insertText` or `deleteContentRange`), the Docs API will often **move or delete** the named ranges that overlap with the modification. This breaks the link between our `FakeElement` object and its representation in the document.

*   **The Solution (The Core Principle):** To prevent this, any `batchUpdate` that modifies an element's content **must also include requests to protect its named range**. This is done by atomically:
    1.  `deleteNamedRange`: Deleting the old named range by its ID.
    2.  `createNamedRange`: Immediately recreating it with the **exact same name** but with the new, correct character range.

By doing this in a single `batchUpdate`, we are explicitly telling the Docs API: "I am changing this element, but I want it to keep its identity." This ensures that when the `shadowDocument` refreshes, it can still find the named range and the `FakeElement` object remains valid. This protection is the key to the entire system's stability.

## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading

- [getting started](GETTING_STARTED.md) - how to handle authentication for restricted scopes.
- [readme](README.md)
- [gas fakes cli](gas-fakes-cli.md)
- [running gas-fakes on google cloud run](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on google kubernetes engine](https://github.com/brucemcpherson/gas-fakes-containers)
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
