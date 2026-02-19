
# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Using Google Apps Script Libraries with `gas-fakes`

`gas-fakes` provides robust support for testing your Google Apps Script projects that use shared libraries. This allows you to develop and test your code locally, even when it has complex dependencies, by simulating the Apps Script library environment.

There are three primary ways to make your libraries available in the `gas-fakes` environment:

1.  **Automatic Loading**: From your project's `appsscript.json` manifest.
2.  **Custom Manifest**: By providing a manifest object directly in your code.
3.  **Manual Loading**: From the command line interface (CLI).

## 1. Automatic Library Loading from Manifest

If your project already has an `appsscript.json` file with libraries listed in the `dependencies` section, `gas-fakes` can automatically load them. This is the most seamless method as it uses your existing project configuration.

### How it Works

`gas-fakes` provides a global object, `LibHandlerApp`, in the execution environment. To load the libraries from your project's manifest, simply call `LibHandlerApp.load()`. It's best practice to wrap this call in a check for `ScriptApp.isFake`, so your code doesn't produce errors when running on Google's actual servers.

The `load()` method will:

1.  Read your `appsscript.json` manifest file.
2.  Find all the libraries listed in the `dependencies.libraries` array.
3.  Fetch the code for each library.
4.  Recursively perform the same process for any libraries that your dependencies use.
5.  "Inject" all the libraries into the global scope, making them available for your script to use.

### Example

Let's say your `appsscript.json` looks like this:

```json
{
  "timeZone": "Europe/London",
  "dependencies": {
    "libraries": [{
      "userSymbol": "TestLib",
      "libraryId": "1zOlHMOpO89vqLPe5XpC-wzA9r5yaBkWt_qFjKqFNsIZtNJ-iUjBYDt-x",
      "version": "1"
    }]
  }
}
```

Your script `main.js` can then load and use the library:

```javascript
// main.js

// Best practice: Only run this in the gas-fakes environment
if (typeof ScriptApp !== 'undefined' && ScriptApp.isFake) {
  // Load all libraries from the project manifest
  LibHandlerApp.load();
}

function myFunction() {
  // Now you can use functions from TestLib
  TestLib.hello();
}

myFunction();
```

You can run this with `gas-fakes`, and it will automatically fetch and include `TestLib`:

```bash
npx gas-fakes -f main.js
```

## 2. Providing a Custom Manifest

You can also pass a manifest object directly to `LibHandlerApp.load()`. This is useful for testing specific library configurations without modifying your project's `appsscript.json`.

### Example

Here's an example of loading a library using a custom-defined manifest object.

```javascript
// test-script.js

// Best practice: Only run this in the gas-fakes environment
if (typeof ScriptApp !== 'undefined' && ScriptApp.isFake) {
  const mockManifest = {
    dependencies: {
      libraries: [
        {
          libraryId: '13JUFGY18RHfjjuKmIRRfvmGlCYrEkEtN6uUm-iLUcxOUFRJD-WBX-tkR',
          userSymbol: 'bmPreFiddler',
        },
      ],
    },
  };
  LibHandlerApp.load(mockManifest);
}

function runFiddler() {
  // Use the library loaded from the mock manifest
  const result = bmPreFiddler.PreFiddler().getFiddler().getData();
  console.log(result.slice(0, 5));
}

runFiddler();
```

## 3. Manual Library Loading from the CLI

For quick tests or situations where you don't want to create a manifest, you can manually specify libraries using the `--libraries` flag with the `gas-fakes` CLI.

### How it Works

The `--libraries` flag takes an argument in the format `Identifier@Source`.

-   **`Identifier`**: This is the name your script will use to refer to the library (e.g., `MyLib`).
-   **`Source`**: This is where to get the library code. It can be:
    -   A path to a local JavaScript file (e.g., `./libs/my-lib.js`).
    -   A URL pointing to a raw JavaScript file.
    -   The script ID of a deployed Google Apps Script library.

You can provide the `--libraries` flag multiple times to load multiple libraries.

### Example

Imagine you have a local library file `sample-lib.js`:

```javascript
// sample-lib.js
function sayHello() {
  console.log('Hello from the library!');
}
```

And a script `main.js` that wants to use it:

```javascript
// main.js
function runTest() {
  // MyLib is available because we are loading it via the CLI
  MyLib.sayHello();
}

runTest();
```

You can run your main script and link the library using this command:

```bash
npx gas-fakes -f main.js --libraries "MyLib@sample-lib.js"
```

The output would be: `Hello from the library!`

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
