# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> A proof of concept implementation of Apps Script Environment on Node

I use clasp/antigravity to develop Google Apps Script (GAS) applications, but when using GAS native services, there's way too much back and forwards to the GAS IDE going while testing. I set myself the ambition of implementing a fake version of the GAS runtime environment on Node so I could at least do some testing and debugging of Apps Scripts locally on Node.

This is a proof of concept so I've implemented a growing subset of number of services and methods. There are a rigorous set of tests for all emulated classes and methods to make sure the same code produces the same result on both Node and Apps Script. Please report any inconsistencies in the issues of this repo.


## Getting started as a package user

You can get the package from npm:
```sh
npm i @mcpher/gas-fakes
```

For a complete guide on how to set up your local environment for authentication and development, please see the consolidated guide: [Getting Started with `gas-fakes`](GETTING_STARTED.md)

Collaborators should fork the repo and use the local versions of these files - see collaborators info.

### Use exactly the same code as in Apps Script

Just as on Apps Script, everything is executed synchronously so you don't need to bother with handling Promises/async/await. Just write normal Apps Script code. Usually you would have an associated App Script project if that's your eventual target, but it's not essential that you do. You can get started right away on Node. 

# gas-fakes-cli

Now you can run apps script code directly from your console - for example 

```bash
gas-fakes  -s "const files=DriveApp.getRootFolder().searchFiles('title contains \"Untitled\"');while (files.hasNext()) {console.log(files.next().getName())};" 
```

For details see [gas fakes cli](gas-fakes-cli.md)

### Settings

The optional `gasfakes.json` file holds various location and behavior parameters for your local Node environment. It is not required on GAS, as you can't change anything over there. If you don't provide this file, `gas-fakes` will create one for you with sensible defaults.

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

| property   | type   | default                          | description                                                                                                                                                                                                                                                                              |
| ---------- | ------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| manifest   | string | ./appsscript.json                | the manifest path and name relative to your main module                                                                                                                                                                                                                                  |
| clasp      | string | ./clasp.json                     | where to look for an optional clasp file                                                                                                                                                                                                                                                 |
| documentId | string | null                             | a bound document id. This will allow testing of container bound script. The documentId will become your activeDocument (for the appropriate service)                                                                                                                                     |
| cache      | string | /tmp/gas-fakes/cache             | gas-fakes uses a local file to emulate apps script's CacheService. This is where it should put the files                                                                                                                                                                                 |
| properties | string | /tmp/gas-fakes/properties        | gas-fakes uses a local file to emulate apps script's PropertiesService. This is where it should put the files. You may want to put it somewhere other than /tmp to avoid accidental deletion, but don't put it in a place that'll get commited to public git repo                        |
| scriptId   | string | from clasp, or some random value | If you have a clasp file, it'll pick up the scriptId from there. If not you can enter your scriptId manually, or just leave it to create a fake one. It's use for the moment is to return something useful from ScriptApp.getScriptId() and to partition the cache and properties stores |

### Troubleshooting: Missing Environment Tags

If you see a warning or error like `Project '...' lacks an 'environment' tag`, it means your Google Cloud Organization has a policy requiring projects to be designated with an environment tag (e.g., `Development`, `Production`).

To resolve this, you need to bind an environment tag to your project. Replace `YOUR_ORG_ID` and `YOUR_PROJECT_ID` with your actual identifiers:

```bash
# Bind the 'Development' environment tag to your project
gcloud resource-manager tags bindings create \
  --tag-value=YOUR_ORG_ID/environment/Development \
  --parent=//cloudresourcemanager.googleapis.com/projects/YOUR_PROJECT_ID
```

*Note: The tag key `environment` and the value `Development` must already exist at the organization level. If they don't, you (or your admin) will need to create them first using `gcloud resource-manager tags keys create` and `gcloud resource-manager tags values create`.*

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

It contains a cloud logging query that will display any logging done in this session - the filter is based on the scriptId (from gasfakes.json), the projectId and userId (from Auth), as well as the start and end time of the session. 

#### A note on .env location

You will have used the gas-fakes init command to create a .env file, containing the LOG_DESTINATION setting. You can change any of the settings in the .env file manually if you want to.

If you want to set an initial LOG_DESTINATION using that .env file, you have to let gas-fakes know where to find it. Let's assume it's in the same folder as your main script. 
```env
node yourapp.js
# or if your .env is somewhere else
node --env-file pathtoenv yourapp.js
```

Alternatively, instead of putting it in an env file, you can export it in your shell environment. 
```sh
export LOG_DESTINATION="BOTH"
```
Finally, another approach is to set it dynamically at the beginning of your app.
```javascript
Logger.__logDestination="BOTH"
```

Do whichever one suits you best.

### Pushing files to GAS

There are a couple of syntactical differences between Node and Apps Script. Not in the body of the code but in how the IDE executes. The 2 main ones are
- apps script doesnt support 'import'. Alls its top level variables are global, so we need to drop imports from the files that are pushed to the IDE
- Script run on Node are called immediately. Normally on Apps Script we hit the run button.  Here's how I handle this in my scripts that need to run on both environments. 
````
// this required on Node but not on Apps Script
if (ScriptApp.isFake) testFakes()
````
For inspiration on pushing modified files to the IDE, see the togas.sh bash script I use for the test suite. There's also a complete push pull workflow available - see - [push test pull](pull-test-push.md)


## Help

As I mentioned earlier, to take this further, I'm going to need a lot of help to extend the methods and services supported - so if you feel this would be useful to you, and would like to collaborate, please ping me on bruce@mcpher.com and we'll talk.

## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading

- [getting started](GETTING_STARTED.md) - how to handle authentication for restricted scopes.
- [readme](README.md)
- [gas fakes cli](gas-fakes-cli.md)
- [running gas-fakes on google cloud run](cloud-run.md)
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
