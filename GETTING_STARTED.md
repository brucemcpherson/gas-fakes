# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Getting Started with `gas-fakes`

This guide provides a consolidated set of instructions to get you up and running with `gas-fakes` for local Google Apps Script development on Node.js.

## Introduction

`gas-fakes` allows you to run your Google Apps Script code in a local Node.js environment, emulating native GAS services like `DriveApp` and `SpreadsheetApp`. This enables faster development, testing, and debugging without constantly deploying to the Apps Script platform.

The key principle is to use the exact same synchronous code you would write for Apps Script. `gas-fakes` handles the complexities of authentication and the asynchronous nature of the underlying Google Workspace APIs for you.

## Prerequisites

1.  **Node.js**: A current version of Node.js installed on your machine.
3.  **Google Cloud Project**: (Required for Google backend) You must have a Google Cloud Platform (GCP) project. You cannot use the Apps Script-managed cloud project. 

---

## Step 1: Prepare your Manifest (`appsscript.json`)

`gas-fakes` reads your local `appsscript.json` manifest to understand your script's configuration and required permissions. If you are syncing with a real Apps Script project via `clasp`, you will already have this file. If not, create one in your project root.

Ensure your `oauthScopes` section includes all the scopes your script needs. 

> **Automatic Scope Discovery:** `gas-fakes` now automatically detects required scopes for both DWD and ADC methods by reading your manifest. You no longer need to manually select them during initialization.

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

### Supported Backends

`gas-fakes` now supports multiple backends simultaneously. Note that as from v2.1.0, the auth process has been streamlined to support this. for more details see [gas-fakes-cli](gas-fakes-cli.md) and [v2.1.0 release notes](./versionnotes/v2.1.0.md). 

During `init`, you can select one or more:

| Backend | Authentication Method | Best Use Case |
| :--- | :--- | :--- |
| **Google Workspace** | DWD (Default) or ADC | Standard Google Apps Script emulation. |
| **Infomaniak KSuite** | API Token | Hybrid or standalone Infomaniak KDrive development. |

### Google Authentication Types

If you select the Google backend, you can choose between:
- **Domain-Wide Delegation (DWD)** (Default): Recommended for production-ready, cross-platform deployment. Requires admin action in the Workspace Admin Console.
- **Application Default Credentials (ADC)**: Easier for quick local-only development. Uses your local user login.
    > **Note on Sensitive Scopes (ADC only):** If your project requires sensitive or restricted scopes (e.g., full Gmail or Calendar access), the standard ADC login process may be blocked by Google during the `auth` step. To resolve this, you must provide an OAuth2 client credentials JSON file during the `init` process. For a detailed guide on how to set this up, see [How to allow access to sensitive scopes with ADC](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/).

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

## Step 5: (Optional) Configure Settings (`gasfakes.json`)

This file tells `gas-fakes` where to find local files and cache. For details, see the Settings section in the main [README.md](README.md).

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
ScriptApp.__platform = 'ksuite';

// 4. Use services - backend initialization happens here automatically
const root = DriveApp.getRootFolder(); // Returns KDrive Private root
```

---

## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading

- [getting started](GETTING_STARTED.md) - how to handle authentication for restricted scopes.
- [readme](README.md)
- [gas fakes cli](gas-fakes-cli.md)
- [ksuite poc](ksuite_poc.md)
- [apps script - a lingua franca for workspace platforms](https://ramblings.mcpher.com/apps-script-a-lingua-franca/)
- [running gas-fakes on google cloud run](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on google kubernetes engine](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on Amazon AWS lambda](https://github.com/brucemcpherson/gas-fakes-containers)
- [Yes – you can run native apps script code on AWS Lambda!](https://ramblings.mcpher.com/apps-script-on-aws-lambda/)
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
