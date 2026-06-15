# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> Some notes for gas-fakes collaborators 


## progress

 I'm looking for collaborators who not only want to help on this project, but also to deepen their understanding of Apps Script services, and the worksace APIs. I've certainly learned a lot so far. As far as progress is concerned, we're well into Apps Script parity. For progress against Apps Script landscape [see](../progress.md). Also see [parity](../notes/parity.md).

## Getting started

First take a look at the [readme](../README.md) for how to get started as a user. The main difference is
- You'll be using a local fork from the [repo](https://github.com/brucemcpherson/gas-fakes) of the source code rather than from npm
- You'll need a companion Apps Script project so you can test your work as you go
- You can merge your updates, issues and tests into the main repo
- Merges are happening almost daily so you can pull the latest updates to your fork regularily


### Development schedule

 If you would specifically like some service or method prioritized, let me know and I'll see if I can push it forward. Better still, if you'd like to have a crack at implementing it yourself, let me know and I'll get you started.

### Typescript vs Javascript

This project is fully JavaScript by design. This makes it entirely accessible to the Apps Script developer, who would not necessarily have typescript knowledge. This is key for the transparency of the project. Using the [generated code links in](../progress) all developers will be able to examine and understand how each method is implemented.

## Testing

Here's some guidance on testing. Before submitting a PR always run all the existing tests on both live Apps Script and gas-fakes to ensure your changes havn't broken anything.


### Create a unit.section for each class method or group of related methods

 If you are a collaborator and want to add some additional methods, you need to create a test section and always run a full set of tests on both environments before creating a merge request to ensure your changes havent broken anything. At the time of writing there are about 4,500 active tests.

### Unit tester for both GAS and Node

Note that I use a [unit tester](https://ramblings.mcpher.com/apps-script-test-runner-library-ported-to-node/) that runs in both GAS and Node, so the exact same tests will run in both environments. There are some example tests in the repo. Each test has been proved on both Node and GAS. Use the `gas-fakes togas` CLI command to push the test code to Apps Script.

### test location

All tests should be run from the test folder, and the `gas-fakes togas` command can be used from there to deploy tests.

Each test can be run individually (for example `npm run testdrive`) or all with `npm test`

### Test Settings

Test settings and fixtures are in test/testfixes.js. Some readonly files are publicly shared and can be left at current values. Most files which are written are created and deleted afterwards on successful completion. They will be named something starting with -- and often centralized into a scratch folder for easy maintentance. In case of failures you may need to delete these yourself. 

##### Breaking fixtures change at v1.1.0

Previously we were using the .env file to pass fixed values to the tests. That has proved to be problematic, so now the test values are in ./test/testfixes.js 

If you need to convert an existing .env file, there's a shell script for that. 
- go to the test folder
- execute sh efixconvert.sh
- run once, check testfixes.js, run a test 
- from v1.1.0 .env fixtures are no longer supprted.
- the package.json in the test folder has been updated as below, so you'll need to reinstall there.

##### authentication mandatory enhancement

With recent security changes, many methods requiring Workspace scopes have been restricted for regular local authentication. This affects both Application Default Credentials (ADC) and Domain-Wide Delegation (DWD) due to Google's token provenance tracking. We have to do a little fiddling to the local auth process to get around these - see [getting started](../GETTING_STARTED.md) and [Workspace scopes](workspace_scopes.md) for additional guidance on how to configure a custom OAuth client to handle this.


##### how to redirect to use local files

When testing and you want to use the local files rather than @mcpher/gas-fakes, you can have a local package.json in the same folder as your tests which directs the package to a local file. just run npm i to install
````
  "dependencies": {
    "@mcpher/gas-fakes": "file:../../"
  }
````
where the file value points to the root of gas-fakes. If you want to instead use the npm version then just revert that normal npm syntax and install again. 

##### Testing local changes using npm link

If you are developing features or fixing bugs in the `gas-fakes` repository and need to test them in another local project *before* publishing to the npm registry, `npm link` is the most effective approach. This is often less confusing than updating `package.json` with file paths.

**Step 1: Create the global link from your source code**
Navigate to the root of your local `gas-fakes` repository (where its `package.json` is located) and create a global symlink:
```sh
cd /path/to/your/gas-fakes
npm link
```
*This tells your global npm installation to point the package name `@mcpher/gas-fakes` to your local folder.*

**Step 2: Use the linked version in your test project**
Navigate to the project where you want to test your changes.

*To link the module locally (so your `import '@mcpher/gas-fakes'` statements use your local source):*
```sh
cd /path/to/your/test-project
npm link @mcpher/gas-fakes
```

*To link the CLI globally (so running `gas-fakes serve` in your terminal uses your local source):*
If you have `gas-fakes` installed globally (e.g., `npm i -g @mcpher/gas-fakes`), you can temporarily override the global CLI with your local version.
```sh
# First, find where your global node_modules are located
npm root -g

# Navigate to the global @mcpher/gas-fakes directory
cd $(npm root -g)/@mcpher/gas-fakes

# Link it to your local source
npm link
```

**Step 3: Unlinking when you are done**

Once you have finished testing and want to revert to using the published npm version:

*Unlink the local module from your test project:*
```sh
cd /path/to/your/test-project
npm unlink @mcpher/gas-fakes
npm install # To reinstall the standard version from the registry
```

*Unlink the global source (to stop pointing the global name to your folder):*
```sh
cd /path/to/your/gas-fakes
npm unlink
```
*(If you linked the global CLI, you may need to run `npm install -g @mcpher/gas-fakes` to restore the published CLI).*

#### handy check for large tests 
I you run the entire test suire there are hundreds of tests and for now the "SOME TESTS FAILED" message at the very end isnt very useful to help finding them. If using a mac, you can copy the the terminal log to the paste buffer and use 'pbpaste | grep -E "failures:[1-9][0-9]*"  ' to see only lines with more than 0 failures

#### Specifics on expectations for test files. 

In principle test files specified in the .env file should belong to you, although for simplicity and to test predefined ui set values, some are necesseraily shared - here are all the test files expected by the test suite.

| name | value | ownership | comments |
|---|---|---|---|
| TEST_AIRPORTS_ID | 1TS2JzPZa1LeA4TmpkSjoYTRZaphXDinM | shared | used to test fiddler library with known values | 
| TEST_FOLDER_NAME | your own folder name | you | a folder in the top Drive level you create |
| TEST_FOLDER_FILES | the number of files | your value | the number of files we should expect to find in TEST_FOLDER_NAME | 
| TEST_FOLDER_ID | your own folder id | you | a folder you have write access to - its used to move files into |
| DRIVE_TEST_FILE_ID | your own file id | you | a file you have read access to - token.sh uses it to check authenticated properly |
| TEXT_FILE_NAME | fake.txt | shared | the name of a known file we'll check for content can be your own or shared |
| TEXT_FILE_ID | 1142Vn7W-pGl5nWLpUSkpOB82JDiz9R6p | shared | the id of the TEXT_FILE_NAME |
| TEXT_FILE_TYPE | text/plain | shared | the type of the TEXT_FILE_ID |
| TEXT_FILE_CONTENT | foo is not bar | shared | the content of the TEXT_FILE_ID |
| TEST_SHEET_ID | 1IZAJKBTeW2zMFS3dynSFJKkdGopQXNLXHCrYKvDYtvI | shared | a sheet you have access to |
| TEST_SHEET_NAME | sharedlibraries | shared | the name of TEST_SHEET_ID |
| PDF_ID | 1-c_5JV1Br5KkEcG6Pu518ocM6CN4BBFz | shared | id of a test pdf file you have access to |
| SCRATCH_VIEWER | viewer@mcpher.com" | your own version | email addresses to use to test assigning permissions |
| SCRATCH_EDITOR | editor@mcpher.com" | .. | .. |
| SCRATCH_B_VIEWER | viewer2@mcpher.com" | .. | .. |
| SCRATCH_B_EDITOR | editor2@mcpher.com" | .. | .. |
| MIN_ROOT_PDFS | 20 | change to your own | the minimum number of pdfs to expect to find in your root folder |
| MIN_PDFS | 400 | change to your own | the minimum number of pdfs to expect to find everywhere in drive |
| MIN_FOLDERS_ROOT | change to your own | the minimum number of folders to expect to find in your root folder |
https://drive.google.com/file/d/1-c_5JV1Br5KkEcG6Pu518ocM6CN4BBFz/view?usp=drive_link
### cleaning up

Most unit sections are isolated so will create their own files with some easily recognizable nonsense names. Tis can lead to many files appearing in Drive. Test runs are supposed to clean them up afterards, but if you have a failure they won't. Lately I've been adding all test files to a specific folder. If you move that folder to the bin, then all test files will automatocally end up in the bin too.

### Pushing to GAS

The `gas-fakes togas` command will move the test scripts to GAS with clasp - just set the target folder using `gas-fakes init` or the `--target` flag. Make sure you have an `appsscript.json` manifest in the source folder, as **gas-fakes** reads that to handle OAuth on Node.

You can write your project to run on Node and call GAS services, and it will also run on the GAS environment with no code changes, except on the Node side you have this one import

```sh
// all the fake services are here
import '@mcpher/gas-fakes/main.js'
```

`gas-fakes togas` will remove imports and exports on the way to apps script, which doesnt support them.

## Mocking

I haven't found a real need to create many mocks, as the Live Apps Script environment has all you need to check test scripts. I always run all tests on Apps Script first, then strive to get the same result in Node. In principle there should be no 'special exceptions' in the test files, except in the case of outstanding issues reported in buganizer (where apps script is not behaving as it should) and also in the issues of the repo.


## Using Gemini etc

I've had mixed result with Gemini on this large project, and in any case I can't afford to. The accuracy of generated code is much better now the project has such large coverage, but it still needs careful audit of any tests you ask it to generate as it tends to test what it has coded, not necessaily what it should have coded. The jury is still out on whether it saves any tiem and whether teh quality is good enough.

## Help

As I mentioned earlier, I'd love to improve the project sustainability with mpre contributors - so if you feel this would be useful to you, and would like to collaborate, please ping me on [bruce@mcpher.com](mailto:bruce@mcpher.com) and we'll talk.

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

