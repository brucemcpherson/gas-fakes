# <img src="./pngs/logo.png" alt="gas-fakes logo" width="50" align="top">  Getting Started with `gas-fakes`

This guide provides a consolidated set of instructions to get you up and running with `gas-fakes` for local Google Apps Script development on Node.js.

## What has changed in v2.3.0

- **ADC Workspace Scopes Enforcement**: If you are using Application Default Credentials (`authType: adc`) and your project requires regular Workspace scopes (like Drive, Sheets, or Gmail), Google now blocks the default `gcloud` CLI client ID. You **must** now provide a custom OAuth2 client credentials JSON file during initialization to avoid `403 Access Blocked` errors. (Note: DWD users are unaffected).
- **Automatic Manifest Emulation**: If `appsscript.json` is missing or has no scopes, the runtime now automatically emulates one using the scopes defined in your `.env` file. This allows "pure" `gas-fakes` projects to run without a manifest file.

## Introduction

`gas-fakes` allows you to run your Google Apps Script code in a local Node.js environment, emulating native GAS services like `DriveApp` and `SpreadsheetApp`. This enables faster development, testing, and debugging without constantly deploying to the Apps Script platform.

The key principle is to use the exact same synchronous code you would write for Apps Script. `gas-fakes` handles the complexities of authentication and the asynchronous nature of the underlying Google Workspace APIs for you.

### Natural Language Automation with `@gf_agent`
You can now use the specialized `gf_agent` skill for Gemini CLI to automate tasks using natural language. The `gas-fakes init` process will offer to automatically install this skill and configure the built-in MCP server for you. This allows you to perform complex Workspace operations—like searching Drive or summarizing emails—using plain English prompts directly from your terminal. For more information, see the [gf_agent README](skills/gf_agent/README.md).

## Prerequisites

1.  **Node.js**: A current version of Node.js installed on your machine.
3.  **Google Cloud Project**: (Required for Google backend) You must have a Google Cloud Platform (GCP) project. You cannot use the Apps Script-managed cloud project. 

---

## Step 1: Prepare your Manifest (`appsscript.json`)

`gas-fakes` uses your local `appsscript.json` manifest as the source of truth to understand your script's configuration, required permissions, and timezone. If you are syncing with a real Apps Script project via `clasp`, you will already have this file. If not, create one in your project root.

Ensure your `oauthScopes` section includes all the scopes your script needs. 

> **Note on "Pure" Local Projects:** If you are building a project solely for the `gas-fakes` environment and do not intend to push it to the live Apps Script cloud, you can run without an `appsscript.json`. If it's missing (or has no scopes), `gas-fakes` will automatically emulate a manifest in memory, generating the scopes from your `.env` file (`DEFAULT_SCOPES` + `EXTRA_SCOPES`) and defaulting your timezone to `America/New_York` (or the value of `GF_TIMEZONE`). However, for full fidelity with live Apps Script, an `appsscript.json` is recommended.

> **Automatic Scope Discovery:** `gas-fakes` automatically detects required scopes for both DWD and ADC methods by reading your manifest. You no longer need to manually select them during initialization. Note that because of some [changes](https://docs.cloud.google.com/docs/authentication/troubleshoot-adc#access_blocked_when_using_scopes) recently introduced by Google, you may need to provide a custom client id for ADC to work with Workspace scopes. See [How to allow access to Workspace scopes](notes/workspace_scopes.md) for more details. For this reason, DWD is the recommended approach for Workspace projects as you don't need to bother with all that.

## Step 2: Install the Package

In your Node.js project directory, install `gas-fakes` from npm:

```sh
npm i @mcpher/gas-fakes
```

## Step 3: Initialize gas-fakes

The `gas-fakes-cli` is the recommended way to set up your environment. It handles authentication, backend configuration, and API enablement.

Run the initialization command:

```bash
gas-fakes init
```
## A note on insufficient scopes

The .env file and the manifest file play different roles:
- the manifest file in the folder from which you run `gas-fakes init` informs the auth process of all the scopes you might ever want to use in all the scripts in your project.
- the .env file will hold a record of these scopes and will be used by `gas-fakes auth` to request them. 

When you run a script, the manifest local to that script is read to determine the scopes required for the script. It can be a different one to the one you used to perform the auth process. If no manifest is found, then the all the scopes that were authorized are used for your script. If a manifest is found it should have all, or a subset of the scopes you specified in your original manifest. If you request a scope in a manifest that was not authorized in the original manifest, then the script will fail with an insufficient scopes error.

This is by design to allow you to specify least permissive scopes for individual scripts in your project, while avoiding a separate auth process for each of them. 

### The Drive scope

When you need a scope like Spreadsheets, which accesses Drive behind the scenes, you should explicitly ask for Drive scope too. Live Apps Script implicitly allows Drive access for such services, but `gas-fakes` does not in order to ensure that you are in complete control of scope authorization.

### Supported Backends

`gas-fakes` now supports multiple backends simultaneously. Note that as from v2.1.0, the auth process has been streamlined to support this. for more details see [gas-fakes-cli](notes/gas-fakes-cli.md) and [v2.1.0 release notes](./versionnotes/v2.1.0.md). 

During `init`, you can select one or more:

| Backend | Authentication Method | Best Use Case |
| :--- | :--- | :--- |
| **Google Workspace** | DWD (Default) or ADC | Standard Google Apps Script emulation. |
| **Infomaniak KSuite** | API Token | Hybrid or standalone Infomaniak KDrive development. |
| **Microsoft Graph** | Azure CLI | OneDrive Personal and Microsoft 365 OneDrive development. |

> [!IMPORTANT]
> **Microsoft Graph Caveat:** Currently, `gas-fakes` has been primarily tested with **Personal Microsoft Accounts**. Business accounts often require a specific "SharePoint Online (SPO) license" to access the Drive API. guest/EXT accounts may experience 400 errors if this license is missing.

### Google Authentication Types

If you select the Google backend, you can choose between:
- **Domain-Wide Delegation (DWD)** (Default): Recommended for production-ready, cross-platform deployment. Requires admin action in the Workspace Admin Console.
- **Application Default Credentials (ADC)**: Uses your local user login.
    > **Note on Workspace Scopes (ADC):** If your project requires Workspace scopes (e.g., full Gmail or Calendar access), the standard Google CLI login process will be blocked by Google during the `auth` step. To resolve this, you must provide a custom OAuth2 client credentials JSON file during the `init` process. For a detailed guide on how to set this up, see [How to allow access to Workspace scopes](notes/workspace_scopes.md). Better still, use DWD if your can. 

### Consumer versus domain accounts

Because you need to access permissions for your domain to allow your workspace assets to be delegated to a service acccount, consumer accounts will have to use ADC. If you have a domain account, use DWD if your organizational policies allow it.

### Workload Identity Federation
gas-fakes also supports a range of workload identity federation hich will allow you to run your workload on a selection of cloud providers. See the [gas-fakes container repo](https://github.com/brucemcpherson/gas-fakes-containers) and the github actions repos [gas-fakes-actions-adc](https://github.com/brucemcpherson/gas-fakes-actions-adc) and [gas-fakes-actions-dwd](https://github.com/brucemcpherson/gas-fakes-actions-dwd)



### Initialization Flow

1.  **Backend Selection**: You will be prompted to select which backends to enable (Google, KSuite, or both).
2.  **Manifest Reading**: `gas-fakes` will read your `appsscript.json` to configure the required Google scopes.
3.  **Persistence**: Your choices are saved to your `.env` file via the `GF_PLATFORM_AUTH` variable, which steers the library's startup behavior.

## Step 4: Authorize and Enable APIs

Once initialized, use the CLI to complete the authentication and enable any required APIs.

1.  **Authorize**:
    ```bash
    gas-fakes auth
    ```
    This will run the gcloud login flow for Google and/or validate your KSuite token.

2.  **Enable Google APIs**: If using Google, you may need to enable specific APIs (Drive, Sheets, etc.):
    ```bash
    gas-fakes enableAPIs --all
    ```

## Step 5: Configure Paths and Behavior

During the `init` process, you will also be prompted to configure various paths and behavior settings. These are saved to your `.env` file and allow `gas-fakes` to find your local files and manage storage.

| Variable | Description |
| :--- | :--- |
| `GF_MANIFEST_PATH` | Path to your `appsscript.json`. |
| `GF_CLASP_PATH` | Path to your `.clasp.json` (optional). |
| `GF_SCRIPT_ID` | Picked from `.clasp.json` or generated as a random UUID during `gas-fakes init`. Used for partitioning stores. |
| `GF_CACHE_PATH` | Where to store local `CacheService` files. |
| `GF_PROPERTIES_PATH` | Where to store local `PropertiesService` files. |

These replace the old `gasfakes.json` configuration file, centralizing all settings in your `.env`.

---

## Step 6: Coding with gas-fakes

Your environment is now configured. `gas-fakes` automatically loads your environment and initializes the correct backends based on your `.env` settings.

```javascript
import '@mcpher/gas-fakes';

function myFunction() {
  const doc = DocumentApp.create('Hello from Node!');
  Logger.log('Created file with ID: ' + doc.getId());
}

if (ScriptApp.isFake) {
  myFunction();
}
```

### Steering Platforms at Runtime

`gas-fakes` uses lazy initialization. This means you can programmatically override your `.env` defaults **after** the import, as long as you do it before calling any service method that requires authentication.

```javascript
// 1. Import first to make ScriptApp available
import '@mcpher/gas-fakes';

// 2. Configure authorized platforms (optional override of .env)
// This must happen before any service calls (like DriveApp.getRootFolder())
ScriptApp.__platformAuth = ['ksuite'];

// 3. Switch active execution context
ScriptApp.__platform = 'google';

// 4. Use services - backend initialization happens here automatically
const root = DriveApp.getRootFolder(); // Returns Google Drive root
```

---

# Gas-Fakes Progress Summary

| Service | Classes | Methods | Completed | In Progress | Not Started |
|---|---|---|---|---|---|
| [Base](./progress/base.md) | 17 | 127 | 93 | 2 | 32 |
| [Cache](./progress/cache.md) | 2 | 11 | 7 | 4 | 0 |
| [Calendar](./progress/calendar.md) | 13 | 273 | 273 | 0 | 0 |
| [Charts](./progress/charts.md) | 29 | 238 | 37 | 0 | 201 |
| [Content](./progress/content.md) | 3 | 16 | 16 | 0 | 0 |
| [Document](./progress/document.md) | 47 | 1032 | 880 | 12 | 140 |
| [Drive](./progress/drive.md) | 8 | 164 | 124 | 8 | 32 |
| [Forms](./progress/forms.md) | 41 | 504 | 266 | 0 | 238 |
| [Gmail](./progress/gmail.md) | 6 | 168 | 167 | 0 | 1 |
| [HTML](./progress/html.md) | 6 | 39 | 34 | 0 | 5 |
| [JDBC](./progress/jdbc.md) | 20 | 753 | 311 | 0 | 442 |
| [Lock](./progress/lock.md) | 2 | 7 | 7 | 0 | 0 |
| [Mail](./progress/mail.md) | 1 | 5 | 0 | 0 | 5 |
| [Properties](./progress/properties.md) | 4 | 11 | 6 | 5 | 0 |
| [Script](./progress/script.md) | 16 | 84 | 22 | 0 | 62 |
| [Slides](./progress/slides.md) | 76 | 1288 | 1005 | 0 | 283 |
| [Spreadsheet](./progress/spreadsheet.md) | 108 | 1771 | 1301 | 19 | 451 |
| [URL Fetch](./progress/urlfetch.md) | 2 | 13 | 12 | 0 | 1 |
| [Utilities](./progress/utilities.md) | 5 | 59 | 59 | 0 | 0 |
| [XML](./progress/xml.md) | 14 | 149 | 142 | 0 | 7 |
| **Total** | **420** | **6712** | **4762** | **50** | **1900** |

## <img src="./pngs/logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading



## Watch the gas-fakes intro video

[![Watch the intro video](./pngs/introvideo.png)](https://youtu.be/oEjpIrkYpEM)

## Watch the explainer about delegating work to local LLMs to save token costs

[![Use local LLMs to save tokens](./pngs/hybrid_LLM_Architecture_Overview.png)](https://youtu.be/tcvU2NLEaNE)

## Watch the gf_agent video on natural language automation

[![Use natural language with gf_agent](./pngs/gfagent.png)](https://youtu.be/lujByoX71HU)

## Watch the local webapps and addons development video

[![Local Apps Script Webapp and UI Emulation with gas-fakes](./pngs/srv.jpg)](https://youtu.be/vH9wl7QloZ4)

## Read more docs

- [release notes](versionnotes/)
- [gas fakes intro video](https://youtu.be/oEjpIrkYpEM)
- [getting started](GETTING_STARTED.md) - how to handle authentication for Workspace scopes.
- [readme](README.md)
- [apps script parity](notes/parity.md)
- [omlx setup](notes/omlx-setup.md)
- [Natural Language Automation with Gemini Skills & MCP Server](notes/gemini-skills-mcp.md) - new skills-based agent approach.
- [Add agent skills to gf_agent](https://ramblings.mcpher.com/add-skills-gf_agent/)
- [gf_agent documentation](../skills/gf_agent/README.md) - instructions for the Gemini CLI automation agent and MCP server.
- [gas fakes cli](notes/gas-fakes-cli.md)
- [local add-on and webapp development with gas-fakes](notes/local-web-development.md)
- [Bringing the webapp home](https://ramblings.mcpher.com/local-apps-script-webapp-and-ui-emulation/)
- [Local development example code](https://github.com/brucemcpherson/gf-serve)
- [github actions using adc](https://github.com/brucemcpherson/gas-fakes-actions-adc)
- [github actions using dwd and wif](https://github.com/brucemcpherson/gas-fakes-actions-dwd)
- [ksuite as a back end](notes/ksuite_poc.md)
- [msgraph as a back end](notes/msgraph.md)
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
- [jdbc notes](notes/jdbc-notes.md)
- [Yes – you can run native apps script code on Azure ACA as well!](https://ramblings.mcpher.com/yes-you-can-run-native-apps-script-code-on-azure-aca-as-well/)
- [Yes – you can run native apps script code on AWS Lambda!](https://ramblings.mcpher.com/apps-script-on-aws-lambda/)
- [initial idea and thoughts - how it all started](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/)
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](notes/oddities.md) - a collection of oddities uncovered during this project
- [named colors](notes/named-colors.md)
- [sandbox](notes/sandbox.md)
- [senstive scopes](notes/workspace_scopes.md)
- [using apps script libraries with gas-fakes](notes/libraries.md)
- [how libhandler works](libhandler.md)
- [article:using apps script libraries with gas-fakes](https://ramblings.mcpher.com/how-to-use-apps-script-libraries-directly-from-node/)
- [named range identity](notes/named-range-identity.md)
- [Workspace scopes with local authentication](notes/workspace_scopes.md)
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

