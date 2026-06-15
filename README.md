# <img src="./pngs/logo.png" alt="gas-fakes logo" width="50" align="top"> Run Native Apps Script code anywhere with gas-fakes

## Google Apps Script, meet Local Development. 

gas-fakes is a powerful emulation layer that lets you run Apps Script projects on Node.js as if they were native. By translating GAS service calls into granular Google API requests, it provides a secure, high-speed sandbox for local debugging and automated testing.

Built for the modern stack, it features plug-and-play containerization—allowing you to package your scripts as portable microservices or isolated workers. Coupled with automated identity management, gas-fakes handles the heavy lifting of OAuth and credential cycling, enabling your scripts to act on behalf of users or service accounts without manual intervention. It’s the missing link for building robust, scalable Google Workspace automations and AI-driven workflows.


## Getting started as a package user

You can get the package from npm:
```sh
npm i @mcpher/gas-fakes
```

For a complete guide on how to set up your local environment for authentication and development, please see the consolidated guide: [Getting Started with `gas-fakes`](GETTING_STARTED.md)

Collaborators should fork the repo and use the local versions of these files - see [collaborators info](./notes/contributing.md)

### Use exactly the same code as in Apps Script
## Usage
Just as on Apps Script, everything is executed synchronously so you don't need to bother with handling Promises/async/await. Just write normal Apps Script code. Usually you would have an associated App Script project if that's your eventual target. Just like Apps Script, you need a manifest file (appsscript.json) so you can be sure that the correct scopes are authorized and asked for.

### Local Web Development (`doGet` / `doPost`)
You can develop and test Google Apps Script Web Apps and UI Add-ons entirely on your local machine using the built-in local web server. The `gas-fakes serve` command spins up a local HTTP endpoint that routes requests to your `doGet` or `doPost` functions, perfectly emulating the Apps Script environment.

It features complete support for:
- `HtmlService` templating (`<?!= include() ?>`).
- Client-side RPC via `google.script.run`.
- Visual UI emulation for Add-ons: Calling `SpreadsheetApp.getUi().showSidebar(html)` automatically frames your HTML output inside a visually accurate Workspace-style sidebar right in your browser!

See the [Local Web Development Guide](notes/local-web-development.md) for full details.

### Natural Language Automation with `@gf_agent`
With the introduction of the `gf_agent` skill for Gemini CLI and the built-in MCP server, you can now automate Google Workspace tasks using natural language. This specialized agent understands the full range of `gas-fakes` services and can generate and execute code locally based on your plain English prompts. Whether it's summarizing emails in a Google Doc or analyzing spreadsheet data, you can now do it directly from your terminal using plain English. See the [gf_agent documentation](skills/gf_agent/README.md) for more details.

> **Note on `appsscript.json`:** For full fidelity with live Apps Script, you should have a manifest available. However, as a workaround for "pure" `gas-fakes` projects where there is no intention to run in live Apps Script, if `appsscript.json` is missing or has no scopes, the runtime will automatically emulate one using the `DEFAULT_SCOPES` and `EXTRA_SCOPES` defined in your `.env` file, and will default the script's `timeZone` to `America/New_York` (or `GF_TIMEZONE`).

# gas-fakes-cli

Now you can run apps script code directly from your console - for example

```bash
gas-fakes  -s "const files=DriveApp.getRootFolder().searchFiles('title contains \"Untitled\"');while (files.hasNext()) {console.log(files.next().getName())};" 
```

For details see [gas fakes cli](notes/gas-fakes-cli.md)

### Configuration

Configuration for your local Node environment is handled interactively by the `gas-fakes init` process, which manages the necessary environment variables in your `.env` file.

### Note on Consumer Accounts and ADC

If you are using a consumer account (gmail.com) or do not have access to Domain-Wide Delegation (DWD), you must use Application Default Credentials (`AUTH_TYPE="adc"`) to authenticate with Google Workspace assets.

**Important Security Note:** Due to recent Workspace security changes, you **must** create and provide a custom OAuth2 client credentials JSON file during initialization (`gas-fakes init`) to avoid `403 Access Blocked` errors when using Workspace scopes (like Gmail or Drive).

- **Guide:** [How to allow access to Workspace scopes with Application Default Credentials](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- **Link to Create Credentials:** [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials)

**Security Warning:** Always add your client credentials JSON file to your `.gitignore` to prevent it from being committed to GitHub or other source control.



### Cloud Logging Integration

`gas-fakes` emulates the native Google Apps Script `Logger.log()` integration with Google Cloud Logging, allowing you to send structured logs from your local Node.js environment directly to your Google Cloud project. Note that console.log is the normal Node console and writes to the local console only. All messages from gas-fakes api still go to the console, so the Logger.log is for your own user messages as required.

#### Initial Configuration

The initial logging behavior is controlled by the `LOG_DESTINATION` environment variable in your `.env` file.

| `LOG_DESTINATION` | Behavior |
|---|---|
| `CONSOLE` (Default) | Logs structured JSON to the console (`stdout`). This is the default behavior if the variable is not set. |
| `CLOUD` | Sends logs directly to Google Cloud Logging. Nothing is written to the console. |
| `BOTH` | Sends logs to both Google Cloud Logging and the console. |
| `NONE` | Disables all output from `Logger.log()`. |

When logging to the cloud, entries are sent to the `gas-fakes/console_logs` log name and include the following labels for easy filtering in the Log Explorer:
- `gas-fakes-scriptId`
- `gas-fakes-userId`

#### Dynamic Control

You can change the logging destination at any time during runtime by setting the `Logger.__logDestination` property. This is especially useful for testing or for applications that need to change their logging behavior dynamically.

The method accepts one of the following string values: `'CONSOLE'`, `'CLOUD'`, `'BOTH'`, or `'NONE'`.

#### Example Usage

To set the initial destination, modify your `.env` file:
```
LOG_DESTINATION="BOTH"
```

To change the destination during runtime in your script:
```javascript
// Initially logs to BOTH (from .env)
Logger.log('This goes to console and cloud');

// Switch to only logging to the console
Logger.__logDestination='CONSOLE';
Logger.log('This now only goes to the console');

// Disable logging completely
Logger.__logDestination='NONE';
Logger.log('This goes nowhere');
```

#### Link to Cloud log for this run

If you have used Logging to cloud, you can get a link to the log data like this. 

```javascript
console.log ('....example cloud log link for this session',Logger.__cloudLogLink)
```

It contains a cloud logging query that will display any logging done in this session - the filter is based on the scriptId (from the environment), the projectId and userId (from Auth), as well as the start and end time of the session. 

Finally, another approach is to set it dynamically at the beginning of your app.
```javascript
Logger.__logDestination="BOTH"
```

Do whichever one suits you best.

### Troubleshooting: Missing Environment Tags

If you see a warning or error like `Project '...' lacks an 'environment' tag`, it means your Google Cloud Organization has a policy requiring projects to be designated with an environment tag (e.g., `Development`, `Production`). 

You can ignore this, but you can resolve it if you want to keep things tidy.  You need to bind an environment tag to your project. Replace `YOUR_ORG_ID` and `YOUR_PROJECT_ID` with your actual identifiers:
```bash
# Bind the 'Development' environment tag to your project
gcloud resource-manager tags bindings create \
  --tag-value=YOUR_ORG_ID/environment/Development \
  --parent=//cloudresourcemanager.googleapis.com/projects/YOUR_PROJECT_ID
```

*Note: The tag key `environment` and the value `Development` must already exist at the organization level. If they don't, you (or your admin) will need to create them first using `gcloud resource-manager tags keys create` and `gcloud resource-manager tags values create`.*

### Pushing files to GAS

There are a couple of syntactical differences between Node and Apps Script. Not in the body of the code but in how the IDE executes. The 2 main ones are
- apps script doesnt support 'import'. Alls its top level variables are global, so we need to drop imports from the files that are pushed to the IDE
- Script run on Node are called immediately. Normally on Apps Script we hit the run button.  Here's how I handle this in my scripts that need to run on both environments. 
````
// this required on Node but not on Apps Script
if (ScriptApp.isFake) testFakes()
````
For pushing modified files back to the Apps Script IDE, use the built-in `gas-fakes togas` CLI command which handles necessary module syntax transformations automatically.


## Help

As I mentioned earlier, to take this further, I'm going to need a lot of help to extend the methods and services supported - so if you feel this would be useful to you, and would like to collaborate, please ping me on bruce@mcpher.com and we'll talk.

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

