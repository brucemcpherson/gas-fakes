# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Pull, Test, and Push Apps Script projects with gas-fakes

Developing for Google Apps Script (GAS) can sometimes feel disconnected from modern development practices. The online editor is convenient for quick changes, but for complex projects, developers often prefer a local environment with version control, robust testing, and powerful build tools. 

I've written extensively on how to use gas-fakes to run native Apps Script code directly in Node, but with a focus on projects created in Node and pushed to GAS for final deployment. However, many projects start life in Apps Script and later migrate to Node for development, while retain their 'pure Apps Script' character.

This article describes a complete, general-purpose workflow built within the `src-gas` directory. It solves the challenge of local development by enabling a seamless "round-trip" process: pulling code from GAS, bundling it for local testing in gas-fakes environment, and pushing the processed code back to the cloud. It assumes you're already familiar with and have already authenticated your environment.

## The Purpose

The primary goal of this workflow is to bridge the gap between the Google Apps Script cloud environment and a local Node.js gas-fakes setup. It allows you to:

1.  **Pull** your GAS project code to your local machine.
2.  **Bundle** the code to run in Node.js, automatically injecting testing libraries like `@mcpher/gas-fakes` to simulate the GAS environment.
3.  **Test** and debug your code locally using familiar tools and a fast feedback loop.
4.  **Push** your changes back to Google Apps Script, automatically stripping out Node.js-specific syntax.

## Folder Organization

The workflow is organized into a logical structure that separates source code, build artifacts, and scripts.

*   `src-gas/`: The heart of the workflow. It contains all the scripts and configurations.
    *   `fromgas.sh`: A script to **pull** code from GAS and **bundle** it for local execution.
    *   `togas.sh`: A script to prepare local code by removing module syntax and **push** it back to GAS.
    *   `package.json`: Defines the `npm` scripts that serve as the main entry points for running the workflow (e.g., `npm run fromgas:test`).
    *   `esbuild.config.js`: The bundler configuration. It concatenates files to mimic the global scope of GAS, rather than performing a traditional bundle, while still generating source maps for easy debugging.

*   `src/`: The **source directory** for your Apps Script project.
    *   This is where `clasp` pulls your `.js` and `appsscript.json` files.
    *   It serves as the "source of truth" for your project's cloud version.

*   `bundle/`: The **local testing build output**.
    *   `fromgas.sh` creates a Node.js-compatible `index.js` file and its sourcemap here. This is the file you execute for local testing.

*   `gas-dist/`: A **temporary staging directory**.
    *   `togas.sh` creates this folder to prepare your code for deployment. It copies the source files, strips `import`/`export` statements, and then pushes the contents to GAS. This directory is automatically cleaned up after the push.

*   `pre.js` & `post.js` (Optional): Files at the project root that can be used to inject custom code before or after the main bundle during the `fromgas` process, perfect for setting up test runners or specific test conditions.

## The Workflow in Action

If you are starting from scratch, with an existing Apps Script project.
- create a project root folder, with a src folder
- navigate to the src folder and perform an initial clasp clone
- go back to your project root - everything else happens from there
- Any edits you want to make during the testing process should be to the code in the ./src folder


The entire process is driven by simple `npm` commands defined in `src-gas/package.json`. 

### Step 1: Pulling from Google Apps Script

To start, or to sync with the latest cloud version, you pull the code.

```bash
# From your project root, run:
npm run fromgas:pull -w src-gas
```

This command executes `fromgas.sh` with the `--pull` flag, which runs `clasp pull` and populates the `src/` directory with your project files.

### Step 2: Bundling and Testing Locally

This is the most common part of the development cycle. After making changes to the files in `src/`, you can bundle and run them locally.

```bash
# Bundle local changes and run them immediately
npm run fromgas:test -w src-gas

```

The `fromgas:test` script is a convenient shortcut that runs `fromgas.sh` with the `--bundle` and `--run` flags. It:
1.  Concatenates the `.js` files from `src/` into `bundle/index.js`.
2.  Injects the `@mcpher/gas-fakes` import and any code from `pre.js`/`post.js`.
3.  Executes the resulting `bundle/index.js` with Node.js.

### Step 3: Pushing Back to Google Apps Script

Once you are satisfied with your local changes, you can push them back to your Apps Script project.

```bash
# Prepare and push your local code
npm run togas -w src-gas
```

This command runs `togas.sh`, which:
1.  Copies your code from `src/` to the temporary `gas-dist/` directory.
2.  Processes the JavaScript files, removing `export` statements and commenting out `import` statements to make them compatible with the GAS environment.
3.  Uses `clasp push` to upload the cleaned-up code.

## Why bundling is required

Most developers organize their script files into multiple files and even folders in Apps Script. Any variables defined in the global space are accessible from any file in your project. In Node, unexported variables are only accessible in the file in which they are defined, and exported ones need to be imported into any other files that needs to use them. 

Apps Script doesn't support export and import, yet Node needs to have them. We solve this dilemma by bundling all the source files into a single file (this is probably what the Apps Script IDE does too when you run something there), and it's this bundle that is executed in the gas-fakes context to preserve the 'global scope' of variables and functions defined there. `npm run fromgas:test` bundles the files in ./src into ./bundle then runs them in the gas-fakes context.

### What's in the pre and post scripts

In the repo in the example folder `gas-fakes-bundle` you'll find these.
####`pre.js`

The contents of this file are added to the beginning of the bundle. If you have nothing to say here, then you can just leave it blank or not even provide a pre.js file. In this example, I want to make use of gas-fakes sandbox feature and whitelist a file I'm going to allow it to access for input.
```javascript
// in here goes any code you'd like to execute before your gas code

// I'm going to use the sandbox here just for info
// turn on the sandbox
ScriptApp.__behavior.sandboxMode = true

// add any whitelist items - this is the id of a file it's okay to access
ScriptApp.__behavior.addIdWhitelist(ScriptApp.__behavior.newIdWhitelistItem('1JiDI-BN3cpjSyAvKPJ_7zRsrEbF0l02rUF6BisjLbqU'));
```


####`post.js`

The contents of this file are added to the end of the bundle. In Apps Script, you execute the main entry point of your script by executing it from the IDE. In Node you want it to run the entry point as part of the process, so your post.js will almost certainly need to contatin a call to your main entry point. 

In this example I'm executing the main entry point, then using gas-fakes sandbox feature that removes any temporaty files that were created during the run
```javascript
// on the ide this is script you would manually run
// on node we can immediately execute it
main()

// clean up any created files if required to do so
// this will delete any files you created during this session
ScriptApp.__behavior.trash ()
```

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
