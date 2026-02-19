# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Getting Started with `gas-fakes`

This guide provides a consolidated set of instructions to get you up and running with `gas-fakes` for local Google Apps Script development on Node.js.

## Introduction

`gas-fakes` allows you to run your Google Apps Script code in a local Node.js environment, emulating native GAS services like `DriveApp` and `SpreadsheetApp`. This enables faster development, testing, and debugging without constantly deploying to the Apps Script platform.

The key principle is to use the exact same synchronous code you would write for Apps Script. `gas-fakes` handles the complexities of authentication and the asynchronous nature of the underlying Google Workspace APIs for you.

## Prerequisites

1.  **Node.js**: A current version of Node.js installed on your machine.
3.  **Google Cloud Project**: You must have a Google Cloud Platform (GCP) project. You cannot use the Apps Script-managed cloud project. If you don't have one, create a new project and ensure it is associated with a Google Workspace organization if possible.

---

## Step 1: Prepare your Manifest (`appsscript.json`)

`gas-fakes` reads your local `appsscript.json` manifest to understand your script's configuration and required permissions. If you are syncing with a real Apps Script project via `clasp`, you will already have this file. If not, create one in your project root.

Ensure your `oauthScopes` section includes all the scopes your script needs.

> **Note on Mandatory Scopes:** `gas-fakes` automatically includes the following mandatory scopes:
> - `openid` and `https://www.googleapis.com/auth/userinfo.email`: Used for user identity and stability across platforms.
> - `https://www.googleapis.com/auth/cloud-platform`: A "super-scope" that often allows Workspace service operations to succeed even if their specific individual scopes (like `.../auth/spreadsheets`) are not explicitly granted.

## Step 2: Install the Package

In your Node.js project directory, install `gas-fakes` from npm:

```sh
npm i @mcpher/gas-fakes
```

## Step 3: Initialize gas-fakes

The `gas-fakes-cli` is the recommended way to set up your environment. It handles authentication, API enablement, and configuration.

Run the initialization command:

```bash
gas-fakes init
```

### Authentication Types

gas-fakes supports 2 kinds of authentication
- Domain-Wide Delegation (DWD) - recommended for local development, production and cross-platform deployment
- Application Default Credentials (ADC) - fall back method for local development only

Here are the key features of each:

| Feature | Domain-Wide Delegation (DWD) | Application Default Credentials (ADC) |
| :--- | :--- | :--- |
| **Primary Use** | Production-ready, cross-platform deployment | Local development and quick start |
| **Platform Support** | Universal (Local, Cloud Run, Kubernetes, Workload Identity, AWS) | Good for local, limited in some cloud environments |
| **Security** | Secure service-account based impersonation | Direct user or service account permissions |
| **Configuration** | `gas-fakes init --auth-type dwd` (Default). Automatic service account creation. | `gas-fakes init --auth-type adc`. Manual scope setup via env vars. |
| **Admin action required** | **Yes**, requires admin action to enable DWD for the service account. | Normally none |
| **Workspace Scopes** | Simplifies and streamlines restricted scope handling | Can involve complex restricted scope management |
| **Consistency** | Identical artifacts across all environments | Variations between local and cloud artifacts |

### gas-fakes init --auth-type dwd (Default)

This is the recommended and default method. `gas-fakes` will automatically create a service account for you. This is a keyless method, which means that there is no need to download or manage secret service account credentials, is the most secure method and allows the use of workload identity in cloud run, kubernetes and other cloud platforms in addition to supporting local development. 

```bash
gas-fakes init
```

In this mode, the scopes required by your project are automatically detected from your `appsscript.json` manifest file oauthscopes section. However, you will need to perform a one-time admin action to enable Domain-Wide Delegation for this service account in the Google Workspace Admin Console.  The CLI will provide you with the necessary details (Client ID and Scopes) to complete this step.

### gas-fakes init --auth-type adc

This method is supported for cases where you do not have admin access to the Workspace admin console, and you only need to run gas-fakes locally. It relies on your local user credentials. Note that managing restricted/sensitive scopes need special workarounds in this mode. See [Restricted and sensitive scopes](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/) for more details.

```bash
gas-fakes init --auth-type adc
```
In this mode, you provide the scopes required by your project via a the cli's init dialog.

## Step 4: Authorize and Enable APIs

Once initialized, use the CLI to complete the authentication and enable the APIS. The CLI will guide you through the process. Note that the selections made in the init stage are persisted in your .env file, whichever method you chose, and used to direct the CLI to the correct authentication method.

1.  **Authorize**:
    ```bash
    gas-fakes auth
    ```

2.  **Enable Workspace APIs**: You may need to enable the any new APIs (Drive, Sheets, Docs, etc.). use can use gas-fakes cli to check and do this for you.

    ```bash
    gas-fakes enableAPIs
    ```

## Step 5: (Optional) Configure Settings (`gasfakes.json`)

This optional file tells `gas-fakes` where to find things. If you don't provide one, it will be created with sensible defaults. For a detailed explanation of each property, see the Settings section in the main [readme](README.md)

Here is an example with common settings:
```json
{
  "manifest": "./appsscript.json",
  "clasp": "./.clasp.json",
  "documentId": null,
  "cache": "/tmp/gas-fakes/cache",
  "properties": "/tmp/gas-fakes/properties",
  "scriptId": "a-unique-id-for-your-local-project"
}
```
*   `scriptId`: It's recommended to set a unique but static value here. This ensures that local data stores for `PropertiesService` and `CacheService` are persistent between runs. If you are runing the project in your apps script IDE as well as in gas-fakes you can make it the id of your live project. If a .clasp.json file is present gas-fakes will use the id from there. 
  

---

## Step 6: (Optional) Using a Shared Data Store with Upstash

By default, `gas-fakes` emulates `PropertiesService` and `CacheService` using local files. For advanced use cases, such as sharing data between your local Node.js environment and a live Apps Script project, you can configure `gas-fakes` to use Upstash Redis as a backend.

This is especially useful for integration testing, where you can write data in a local test and verify it in the live environment, or vice-versa.

### 1. Configure `gas-fakes` (Local Environment)

*   **Get Upstash Credentials**: Sign up for a free Upstash Redis database and get your REST URL and Token.
*   **Update your `.env` file**: Set `STORE_TYPE` to `UPSTASH` and add your credentials. You can do this by rerunning `gas-fakse init`

    ```env
    # ... other settings
    STORE_TYPE="UPSTASH"
    UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
    UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
    ```
*   **Match Script ID**: Ensure the `scriptId` in your `gasfakes.json` file matches the Script ID of your live Apps Script project. This is crucial for partitioning the data correctly. `gas-fakes` will automatically use the ID from `.clasp.json` if available.

### 2. Configure Live Apps Script Project

To allow your live script to access the same Upstash database, you'll use the `gas-flex-cache` library.

*   **Add the Library**: Add the `bmGasFlexCache` library to your `appsscript.json` manifest.

    ```json
    "dependencies": {
      "libraries": [
        {
          "userSymbol": "bmGasFlexCache",
          "libraryId": "1R_r9n4EGctvA8lWBZVeuT66mgaKBRV5IxfIsD_And-ra2H16iNXVWva0",
          "version": "...whatever the latest version is.."
        }
      ]
    }
    ```

*   **Store Credentials in Live Script**: Securely store your Upstash credentials in the live script's native `PropertiesService`.

    ```javascript
    function setLiveCredentials() {
      const creds = {
        type: "upstash",
        url: "YOUR_UPSTASH_URL",
        token: "YOUR_UPSTASH_TOKEN"
      };
      PropertiesService.getScriptProperties()
        .setProperty("dropin_upstash_credentials", JSON.stringify(creds));
    }
    ```

*   **Instantiate the Drop-in Service**: In your live script, you can now create a drop-in replacement for `CacheService` or `PropertiesService` that connects to your Upstash database, allowing you to read data written by `gas-fakes`. gas-fakes uses the openid as a stable userid which will be the same on both apps script and gas-fakes.

    ```javascript
    // Example: Reading a user property set by a gas-fakes test
    const creds = JSON.parse(PropertiesService.getScriptProperties().getProperty("dropin_upstash_credentials"));
    creds.userId = getUserIdFromToken(ScriptApp.getOAuthToken())
    creds.scriptId = ScriptApp.getScriptId();
    creds.kind = 'property';

    const sharedUserProps = bmGasFlexCache.newCacheDropin({ creds });
    const valueFromFake = sharedUserProps.getProperty('some-key-written-by-fake');
    console.log(valueFromFake);
    ```
### A note on userId if you are planning to share user orientated cache or property stores 
To generate a unique, stable `userId` that'll be the same on both gas-fakes and Apps Script we could have used Session.getEffectiveUser().getEmail(). However, to avoid inserting email addresses into the redis database, it would be better to use an openid. An openid will be unique to an authenticated user across platforms. This is what gas-fakes uses when emulating a service.

On gas-fakes, the default scopes include openid, but to be able to get the same value for a user on Apps Script, your appsscript.json manifest needs the scope "openid". gas-flex-cache has a handy convenience method to deduce your openid from and accesstoken. If you do not include the openid scope, we will be able to retrieve your unique openid to use as a userId.

You would need at least these scopes in your app
```json
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.external_request",
    "openid"
  ]
```

We import the getUserIdFromToken on gas-fakes
```javascript
  import { newCacheDropin , getUserIdFromToken } from '@mcpher/gas-flex-cache'
``` 

And on apps script
```javascript
var getUserIdFromToken = bmGasFlexCache.getUserIdFromToken;
```


Now you can use this stable userId instead of writing an email to redis.
```javaScript
const userId = getUserIdFromToken(ScriptApp.getOAuthToken())
const userCacheCreds = {
  ...upstashCreds, 
  scriptId: ScriptApp.getScriptId(),
  userId,
  defaultExpirationSeconds: 360 
}
const userCache = newCacheDropin({creds:userCacheCreds});

---


```

## You're Ready to Code!

Your environment is now configured. You can start writing Apps Script code in your local `.js` files and run them with Node.js. 

### Environment Variables (.env)

`gas-fakes` requires environment variables for configuration (authentication type, store settings, etc.). These are typically stored in a `.env` file. 

The library handles environment loading automatically with the following precedence:
1.  **Node.js `--env-file` Flag**: If you start your script with `node --env-file=.env.path main.js`, `gas-fakes` will respect this and skip its own loading logic. This is the recommended modern approach for Node.js 20.6.0+.
2.  **Automatic Local Lookup**: If no flag is used, `gas-fakes` automatically looks for a `.env` file in the same directory as your main script.
3.  **Current Working Directory**: As a fallback, it looks in the current working directory.

You no longer need to manually import `dotenv/config` in your script.

```javascript
// The main entry point for gas-fakes
// This will automatically handle environment loading if not already handled by node --env-file
import '@mcpher/gas-fakes';

// Your Apps Script code here...
function myFunction() {
  const doc = DocumentApp.create('Hello from Node!');
  Logger.log('Created file with ID: ' + doc.getId());
}

// Run your function
if (ScriptApp.isFake) {
  myFunction();
}
```

---

## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading

- [getting started](GETTING_STARTED.md) - how to handle authentication for restricted scopes.
- [readme](README.md)
- [gas fakes cli](gas-fakes-cli.md)
- [running gas-fakes on google cloud run](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on google kubernetes engine](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on Amazon AWS lambda](https://github.com/brucemcpherson/gas-fakes-containers)
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
