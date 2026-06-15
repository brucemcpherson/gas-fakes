# 📚 Local Documentation Discovery: Google Apps Script (GAS)

This knowledge file outlines the preferred method for discovering documentation, methods, interfaces, and signatures for Google Apps Script (GAS) within our local environment.

## 🎯 Primary Source of Truth

The definitive source for all Google Apps Script documentation is the local JSON file:

`/Users/brucemcpherson/Documents/repos/gas-fakes/doccreation/gi-fake-all.json`

This file contains a complete, comprehensive duplicate of all official Apps Script documentation, including methods, classes, parameters, return types, and descriptions.

## ✨ Why Use Local JSON Over Web Search?

Relying on the local JSON file provides significant advantages over performing external web searches:

1. **Instant Efficiency:** The documentation is local, allowing for near-instantaneous retrieval without network latency.
2. **Guaranteed Syntax Matching:** The data within the JSON is guaranteed to match the specific environment and API version we are targeting, ensuring perfect syntax and usage examples.
3. **Avoids Ambiguity:** It eliminates the risk of encountering outdated web search results, documentation for other language SDKs, or incorrect API versions that might be indexed online.

## 🔍 Usage Guideline: How to Search the JSON

**The agent must prioritize searching and reading `gi-fake-all.json` before initiating any external web searches for GAS documentation.**

When a query requires knowledge of a GAS method, class, or interface, follow these steps:

1. **Local Search:** Use local search utilities (e.g., `grep`, `jq`, or internal file parsing capabilities) to query `gi-fake-all.json`.
2. **Targeted Extraction:** Search for the relevant class name, method name, or interface.
3. **Information Retrieval:** Extract the following details from the JSON structure:
    *   Method/Function Signature (including parameters and return types).
    *   Detailed Description of the method's purpose.
    *   Specific parameter requirements and constraints.
4. **Fallback:** Only if the local JSON search fails to yield a relevant result, or if the query is too broad, should the agent fall back to external web searches.

**In summary: Treat `gi-fake-all.json` as the authoritative, real-time documentation database for all Google Apps Script interactions.**
