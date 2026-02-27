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

`gas-fakes` now supports multiple backends simultaneously. During `init`, you can select one or more:

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

- [gas fakes cli](gas-fakes-cli.md)
- [readme](README.md)
- [How to allow access to sensitive scopes with ADC](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
