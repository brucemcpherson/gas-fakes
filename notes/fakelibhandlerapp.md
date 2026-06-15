# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  `fakelibhandlerapp.js` Documentation

## Overview

The `fakelibhandlerapp.js` module is a key component of the `gas-fakes` environment, designed to simulate Google Apps Script's library management system for local development and testing. Its primary responsibility is to handle the recursive loading and injection of library dependencies defined in a project's `appsscript.json` manifest file.

This allows scripts that depend on one or more libraries (and any libraries *they* might depend on) to be tested locally without needing to be in the Google Apps Script cloud environment.

## `newFakeLibHandlerApp([...args])`

This is the main exported factory function used to create an instance of the `FakeLibHandlerApp` class.

```javascript
export const newFakeLibHandlerApp = (...args) => {
  return Proxies.guard(new FakeLibHandlerApp(...args));
};
```

- It instantiates `FakeLibHandlerApp`.
- It wraps the new instance in a `Proxies.guard`. This is a security measure to prevent direct access to private properties or methods of the instance (those prefixed with `__`), ensuring that interaction with the object goes through its public interface.

## `FakeLibHandlerApp` Class

This class contains the logic for processing and loading the libraries.

### `constructor()`

The constructor initializes a `Map` to store all the unique libraries that are found and loaded. This map, `__libMap`, uses the library's script ID as the key to prevent the same library from being loaded multiple times.

### `load(manifest)`

This is the central method of the class. It orchestrates the process of finding and preparing all required libraries.

```javascript
load(manifest) {
  if (!manifest && !Auth.hasAuth()) {
    Syncit.fxInit();
  }
  manifest = manifest || Auth.getManifest();
  if (!manifest) {
    throw new Error('manifest not found in auth and not provided');
  }
  // ...
}
```

1.  **Manifest Resolution**: It takes an optional `manifest` object. If one isn't provided, it attempts to retrieve the manifest of the current project using `Auth.getManifest()`. If the environment hasn't been initialized yet, it calls `Syncit.fxInit()` to perform lazy initialization, ensuring that the project's `appsscript.json` is loaded.

2.  **Recursive Loading**:
    - It defines an inner function, `recurseManifests`, that processes a given manifest to find its dependencies.
    - Inside this function, `newFakeLibHandler(manifest).fetchLibraries()` is called to extract the list of libraries from the current manifest.
    - It iterates through each discovered library (if any). If the library hasn't already been loaded (by checking its presence in `libMap`), it's added.
    - Crucially, if a newly discovered library itself has dependencies (indicated by the presence of `lib.libraries`), the `recurseManifests` function is called again with that library's manifest. This recursive step ensures that the entire dependency tree is traversed.

3.  **Injection**:
    - After the entire dependency tree has been explored and all unique libraries are collected in `libMap`, the method iterates through the map.
    - For each library, it calls the `lib.inject()` method. This final step is what makes the library's functions and variables available in the global scope of the simulated environment, mimicking how Google Apps Script handles libraries.

### `toString()`

A standard method that returns the string `'LibHandlerApp'`, identifying the object type.

# Gas-Fakes Progress Summary

| Service | Classes | Methods | Completed | In Progress | Not Started |
|---|---|---|---|---|---|
| [Base](../progress/base.md) | 17 | 127 | 93 | 2 | 32 |
| [Cache](../progress/cache.md) | 2 | 11 | 7 | 4 | 0 |
| [Calendar](../progress/calendar.md) | 13 | 273 | 273 | 0 | 0 |
| [Charts](../progress/charts.md) | 29 | 238 | 37 | 0 | 201 |
| [Content](../progress/content.md) | 3 | 16 | 16 | 0 | 0 |
| [Document](../progress/document.md) | 47 | 1032 | 880 | 12 | 140 |
| [Drive](../progress/drive.md) | 8 | 164 | 124 | 8 | 32 |
| [Forms](../progress/forms.md) | 41 | 504 | 266 | 0 | 238 |
| [Gmail](../progress/gmail.md) | 6 | 168 | 167 | 0 | 1 |
| [HTML](../progress/html.md) | 6 | 39 | 34 | 0 | 5 |
| [JDBC](../progress/jdbc.md) | 20 | 753 | 311 | 0 | 442 |
| [Lock](../progress/lock.md) | 2 | 7 | 7 | 0 | 0 |
| [Mail](../progress/mail.md) | 1 | 5 | 0 | 0 | 5 |
| [Properties](../progress/properties.md) | 4 | 11 | 6 | 5 | 0 |
| [Script](../progress/script.md) | 16 | 84 | 22 | 0 | 62 |
| [Slides](../progress/slides.md) | 76 | 1288 | 1005 | 0 | 283 |
| [Spreadsheet](../progress/spreadsheet.md) | 108 | 1771 | 1301 | 19 | 451 |
| [URL Fetch](../progress/urlfetch.md) | 2 | 13 | 12 | 0 | 1 |
| [Utilities](../progress/utilities.md) | 5 | 59 | 59 | 0 | 0 |
| [XML](../progress/xml.md) | 14 | 149 | 142 | 0 | 7 |
| **Total** | **420** | **6712** | **4762** | **50** | **1900** |

## <img src="../pngs/logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading



## Watch the gas-fakes intro video

[![Watch the intro video](../pngs/introvideo.png)](https://youtu.be/oEjpIrkYpEM)

## Watch the explainer about delegating work to local LLMs to save token costs

[![Use local LLMs to save tokens](../pngs/hybrid_LLM_Architecture_Overview.png)](https://youtu.be/tcvU2NLEaNE)

## Watch the gf_agent video on natural language automation

[![Use natural language with gf_agent](../pngs/gfagent.png)](https://youtu.be/lujByoX71HU)

## Watch the local webapps and addons development video

[![Local Apps Script Webapp and UI Emulation with gas-fakes](../pngs/srv.jpg)](https://youtu.be/vH9wl7QloZ4)

## Read more docs

- [release notes](../versionnotes/)
- [gas fakes intro video](https://youtu.be/oEjpIrkYpEM)
- [getting started](../GETTING_STARTED.md) - how to handle authentication for Workspace scopes.
- [readme](../README.md)
- [apps script parity](../notes/parity.md)
- [omlx setup](../notes/omlx-setup.md)
- [Natural Language Automation with Gemini Skills & MCP Server](../notes/gemini-skills-mcp.md) - new skills-based agent approach.
- [Add agent skills to gf_agent](https://ramblings.mcpher.com/add-skills-gf_agent/)
- [gf_agent documentation](../../skills/gf_agent/README.md) - instructions for the Gemini CLI automation agent and MCP server.
- [gas fakes cli](../notes/gas-fakes-cli.md)
- [local add-on and webapp development with gas-fakes](../notes/local-web-development.md)
- [Bringing the webapp home](https://ramblings.mcpher.com/local-apps-script-webapp-and-ui-emulation/)
- [Local development example code](https://github.com/brucemcpherson/gf-serve)
- [github actions using adc](https://github.com/brucemcpherson/gas-fakes-actions-adc)
- [github actions using dwd and wif](https://github.com/brucemcpherson/gas-fakes-actions-dwd)
- [ksuite as a back end](../notes/ksuite_poc.md)
- [msgraph as a back end](../notes/msgraph.md)
- [resurrecting scriptDb repo](https://github.com/brucemcpherson/scriptdb-redux)
- [Resurrecting ScriptDb – nosql database for Apps Script](https://ramblings.mcpher.com/resurrecting-scriptdb-nosql-database-for-apps-script/)
- [gas-fakes in serverless containers](https://docs.google.com/presentation/d/1JlXF9T--DD4ERHopyP3WyAMhjRCxxHblgCP5ynxaJ3k/edit?usp=sharing)
- [apps script - a lingua franca for workspace platforms](https://ramblings.mcpher.com/apps-script-a-lingua-franca/)
- [Apps Script: A ‘Lingua Franca’ for the Multi-Cloud Era](https://ramblings.mcpher.com/apps-script-with-ksuite/)
- [running gas-fakes on google cloud run](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on google kubernetes engine](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on Amazon AWS lambda](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on Azure ACA](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on Github actions](https://github.com/brucemcpherson/gas-fakes-containers)
- [jdbc notes](../notes/jdbc-notes.md)
- [Yes – you can run native apps script code on Azure ACA as well!](https://ramblings.mcpher.com/yes-you-can-run-native-apps-script-code-on-azure-aca-as-well/)
- [Yes – you can run native apps script code on AWS Lambda!](https://ramblings.mcpher.com/apps-script-on-aws-lambda/)
- [initial idea and thoughts - how it all started](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/)
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [colaborators](../collaborators.md) - additional information for collaborators
- [oddities](../notes/oddities.md) - a collection of oddities uncovered during this project
- [named colors](../notes/named-colors.md)
- [sandbox](../notes/sandbox.md)
- [senstive scopes](../notes/workspace_scopes.md)
- [using apps script libraries with gas-fakes](../notes/libraries.md)
- [how libhandler works](../libhandler.md)
- [article:using apps script libraries with gas-fakes](https://ramblings.mcpher.com/how-to-use-apps-script-libraries-directly-from-node/)
- [named range identity](../notes/named-range-identity.md)
- [Workspace scopes with local authentication](../notes/workspace_scopes.md)
- [sharing cache and properties between gas-fakes and live apps script](https://ramblings.mcpher.com/sharing-cache-and-properties-between-gas-fakes-and-live-apps-script/)
- [gas-fakes-cli now has built in mcp server and gemini extension](https://ramblings.mcpher.com/gas-fakes-cli-now-has-built-in-mcp-server-and-gemini-extension/)
- [gas-fakes CLI: Run apps script code directly from your terminal](https://ramblings.mcpher.com/gas-fakes-cli-run-apps-script-code-directly-from-your-terminal/)
- [How to allow access to Workspace scopes with Application Default Credentials](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
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

