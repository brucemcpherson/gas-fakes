# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> Some notes for gas-fakes collaborators 

This is a proof of concept so I've implemented a subset of number of services and methods, but the tricky parts are all in place so all that's left is a load of busy work (to which I heartily invite any interested collaborators).

## progress

This is a pretty huge task, so I'm working on adding services a little bit at a time, with usually just a few methods added in each release. I'm looking for collaborators who not only want to help on this project, but also to deepen their understanding of Apps Script services, and the worksace APIs. I've certainly learned a lot so far.

## Getting started

First take a look at the [readme](README.md) for how to get started as a user. The main difference is
- You'll be using a local fork from the [repo](https://github.com/brucemcpherson/gas-fakes) of the source code rather than from npm
- You'll need a companion Apps Script project so you can test your work as you go
- You can merge your updates, issues and tests into the main repo
- Merges are happening almost daily so you can pull the latest updates to your fork regularily


### Development schedule

As a background project I'm chipping away at this when I can. There's a mountain of work to do, and I'm not that bothered about the general order I do it in. If you would specifically like some service or method prioritized, let me know and I'll see if I can push it forward. Better still, if you'd like to have a crack at implementing it yourself, let me know and I'll get you started.


## Testing

Here's some guidance on testing. Before submitting a PR always run all the existing tests on both live Apps Script and gas-fakes to ensure your changes havn't broken anything.


### Create a unit.section for each class method or group of related methods

 If you are a collaborator and want to add some additional methods, you need to create a test section and always run a full set of tests on both environments before creating a merge request to ensure your changes havent broken anything. At the time of writing there are about 4,500 active tests.

### Unit tester for both GAS and Node

Note that I use a [unit tester](https://ramblings.mcpher.com/apps-script-test-runner-library-ported-to-node/) that runs in both GAS and Node, so the exact same tests will run in both environments. There are some example tests in the repo. Each test has been proved on both Node and GAS. There's also a shell (togas.sh) which will use clasp to push the test code to Apps Script.

### test location change at v1.2.7

As of v1.2.7 all tests should be run from the test folder, and as of v1.2.11 togas.sh should also be run from the test folder

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

With recent security changes, and updates to the latest googleapis module, msny of the methods have now been restreicted for regular ADC access, so we have to do a little fiddling to ADC process to get round these - see [getting started](GETTING_STARTED.md) for additional guidance on how to do this -- better still use `gas-fakes init` to use keyless DWD authentication.


##### how to redirect to use local files

When testing and you want to use the local files rather than @mcpher/gas-fakes, you can have a local package.json in the same folder as your tests which directs the package to a local file. just run npm i to install
````
  "dependencies": {
    "@mcpher/gas-fakes": "file:../../"
  }
````
where the file value points to the root of gas-fakes. If you want to instead use the npm version then just revert that normal npm syntax and install again. 



#### Specifics on expectations for test files. 

In principle test files specified in the .env file should belong to you, although for simplicity and to test predefined ui set values, some are necesseraily shared - here are all the test files expected by the test suite.

| name | value | ownership | comments |
|---|---|---|---|
| TEST_BORDERS_ID | 1hRGdrYHEPixXTuQLeL3Z0qGRZVs_8ojMIm6D4KrCh1o | shared | used to test UI set values | 
| TEST_AIRPORTS_ID | 1h9IGIShgVBVUrUjjawk5MaCEQte_7t32XeEP1Z5jXKQ | shared | used to test fiddler library with known values | 
| TEST_FOLDER_NAME | your own folder name | you | a folder in the top Drive level you create |
| TEST_FOLDER_FILES | the number of files | your value | the number of files we should expect to find in TEST_FOLDER_NAME | 
| TEST_FOLDER_ID | your own folder id | you | a folder you have write access to - its used to move files into |
| DRIVE_TEST_FILE_ID | your own file id | you | a file you have read access to - token.sh uses it to check authenticated properly |
| TEXT_FILE_NAME | fake.txt | shared | the name of a known file we'll check for content can be your own or shared |
| TEXT_FILE_ID | 1142Vn7W-pGl5nWLpUSkpOB82JDiz9R6p | shared | the id of the TEXT_FILE_NAME |
| TEXT_FILE_TYPE | text/plain | shared | the type of the TEXT_FILE_ID |
| TEXT_FILE_CONTENT | foo is not bar | shared | the content of the TEXT_FILE_ID |
| TEST_SHEET_ID | 1DlKpVVYCrCPNfRbGsz6N_K3oPTgdC9gQIKi0aNb42uI | shared | a sheet you have read access to |
| TEST_SHEET_NAME | sharedlibraries | shared | the name of TEST_SHEET_ID |
| PDF_ID | 17t4ep9Jt6jRyDx0KlxMhHQNGZ3whg6GS | shared | id of a test pdf file you have access to |
| SCRATCH_VIEWER | viewer@mcpher.com" | your own version | email addresses to use to test assigning permissions |
| SCRATCH_EDITOR | editor@mcpher.com" | .. | .. |
| SCRATCH_B_VIEWER | viewer2@mcpher.com" | .. | .. |
| SCRATCH_B_EDITOR | editor2@mcpher.com" | .. | .. |
| MIN_ROOT_PDFS | 20 | change to your own | the minimum number of pdfs to expect to find in your root folder |
| MIN_PDFS | 400 | change to your own | the minimum number of pdfs to expect to find everywhere in drive |
| MIN_FOLDERS_ROOT | change to your own | the minimum number of folders to expect to find in your root folder |

### cleaning up

Most unit sections are isolated so will create their own files with some easily recognizable nonsense names. Tis can lead to many files appearing in Drive. Test runs are supposed to clean them up afterards, but if you have a failure they won't. Lately I've been adding all test files to a specific folder. If you move that folder to the bin, then all test files will automatocally end up in the bin too.

### Pushing to GAS

The script uses togas.sh will move the test scripts to GAS with clasp - just set the `SOURCE` and `TARGET` folders in the TOGAS script. Make sure you have an `appsscript.json` manifest in the `SOURCE` folder, as **gas-fakes** reads that to handle OAuth on Node.

You can write your project to run on Node and call GAS services, and it will also run on the GAS environment with no code changes, except on the Node side you have this one import

```sh
// all the fake services are here
import '@mcpher/gas-fakes/main.js'
```

togas.sh will remove imports and exports on the way to apps script, which doesnt support them.

## Mocking

I haven't found a real need to create many mocks, as the Live Apps Script environment has all you need to check test scripts. I always run all tests on Apps Script first, then strive to get the same result in Node. In principle there should be no 'special exceptions' in the test files, except in the case of outstanding issues reported in buganizer (where apps script is not behaving as it should) and also in the issues of the repo.

## Experiments

There's a folder 'experiments' for this. They don't form part of the project, but can be used for playing around. It can be useful to preservce these for future use. See the readme in the experiments folder for more info.

## Using Gemini code assist

I've had mixed result with Gemini on this large project. If you're planning to use Gemini to do some legwork, I have no objections but here's some [notes](gemini.md) - some reflections and experiences on using Gemini to help code large projects on my experience so far.

## Help

As I mentioned earlier, to take this further, I'm going to need a lot of help to extend the methods and services supported - so if you feel this would be useful to you, and would like to collaborate, please ping me on [bruce@mcpher.com](mailto:bruce@mcpher.com) and we'll talk.

## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading

- [getting started](GETTING_STARTED.md) - how to handle authentication for restricted scopes.
- [readme](README.md)
- [gas fakes cli](gas-fakes-cli.md)
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
