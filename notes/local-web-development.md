#  <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Local Web Development with gas-fakes

As of `gas-fakes` v2.4.0, you can develop and test Google Apps Script Web Apps and UI Add-ons entirely on your local machine using the built-in local web server. You will need to have the gas fakes cli installed globally (`npm i -g @mcpher/gas-fakes`) or use "npx". You'll also need to install "@mcpher/fake-gass in your project locally (`npm i @mcpher/fake-gass`). See [getting started with gas-fakes](GETTING_STARTED.md) if you are new to gas-fakes.

## Starting the Server

To launch the emulator and test an HTML service script, use the `serve` command:

```bash
gas-fakes serve ./main.js 
```
or to use a different port number use the -p flag:

```bash
gas-fakes serve ./main.js -p 3000
```

By default, visiting `http://localhost:8080` (or `http://localhost:[port_number]` if you used the -p flag) from the browser will execute the `doGet(e)` function in `./main.js`. 

## Testing Web Apps (`doGet` / `doPost`)

If you are building a standard Web App, simply export your `doGet` and `doPost` functions in your entry file. `gas-fakes` automatically injects the `e.parameter`, `e.parameters`, and `e.queryString` event properties based on the URL you hit in your browser.

```javascript
// main.js
export const doGet = (e) => {
  return HtmlService.createHtmlOutput(`Hello, you searched for: ${e.parameter.query}`);
};

export const doPost = (e) => {
  return ContentService.createTextOutput(`Received POST: ${e.postData.getDataAsString()}`);
};
```

## Testing Dialogs and Sidebars

When you build Google Workspace Add-ons/custom menus etc (e.g. for Google Sheets), your HTML isn't served as a full webpage—it's usually constrained inside a Sidebar or a Modal Dialog.

`gas-fakes` provides visual emulation for this framing!

### 1. Using a default entry point
When you run `gas-fakes serve` the default entry point is the `doGet(e)` function (or doPost(e)` if it receives a POST request). If you are building a web app, you can test it by visiting `http://localhost:8080`. However if you want to test a sidebar or a dialog you can provide a default entry point that opens your UI by using the `-m` flag:

```bash
gas-fakes serve ./localserve.js -m addon
```

Now when you visit `http://localhost:8080` it will execute the `addon()` function in `./localserve.js`. 

### 2. Using a Custom Entry Point
You can tell `gas-fakes serve` to execute a specific function on load by using the `?main=name` query parameter:

```bash
gas-fakes serve ./localserve.js
```
Then access `http://localhost:8080?main=showMySidebar`. This will execute the `showMySidebar()` function in `./localserve.js` and override any default entry point defined by the `-m` flag.

### Dialogs
By default the frame will the size of, and positioned in the same place as a sidebar. To get a dialog sized visualization instead use the `?modal` parameter instead of the applied default of '?sidebar'

### UI Framing Methods
Inside your script, call the UI methods exactly as you would in Apps Script. But, note the comment on returning the UI. In Apps Script this is not necessary, but in Node you must return the ui object.

```javascript
// localserve.js
export function showMySidebar() {
  const html = HtmlService.createHtmlOutput('<b>My Sidebar Content</b>');
  
  // This tells gas-fakes to frame the output visually as a 300px sidebar
  SpreadsheetApp.getUi().showSidebar(html);
  
  // IMPORTANT!! You must return the HTML so the local server can render it to your browser
  return html; 
}

export function showMyModal() {
  const html = HtmlService.createHtmlOutput('<b>My Modal Content</b>');
  html.setWidth(600).setHeight(400);
  
  // Frames it as a floating modal with a backdrop and title bar
  SpreadsheetApp.getUi().showModalDialog(html, 'My Custom Modal');
  
  return html;
}
```

When you visit `localhost`, `gas-fakes` will wrap your HTML in an `iframe` stylized exactly like the Google Workspace UI, complete with the standard `add-ons1.css` stylesheet automatically injected!

## Client-Side RPC (`google.script.run`)

`gas-fakes` fully supports the `google.script.run` asynchronous RPC API. 

The server automatically injects a polyfill into your `<head>` when it serves the HTML. You can call any top-level function exported by your script directly from your client-side JavaScript, and it will securely execute inside the Node.js sandbox environment!

### Example HTML
```html
<script>
  function fetchSpreadsheetData() {
    google.script.run
      .withSuccessHandler((data) => {
        console.log("Got data from Node.js server!", data);
      })
      .withFailureHandler((err) => {
        console.error("Server threw an error:", err.message);
      })
      .getServerData();
  }
</script>
```

### Server Side
```javascript
export function getServerData() {
  // Use native Apps Script calls locally
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  return sheet.getDataRange().getValues();
}
```

## Closing Dialogs

Modern browsers block scripts from executing `window.close()` on tabs that users opened manually. To work around this during local development, `gas-fakes` polyfills `google.script.host.close()`. 

When your client-side code calls `google.script.host.close()`, it intercepts it and visually closes the emulated dialog window, replacing the screen with a "Dialog Closed" message—so your close button logic is fully testable!

## Template Evaluation and Includes

`gas-fakes` fully emulates `HtmlTemplate`. It securely evaluates scriptlets using a Node.js Worker.

You can modularize your front-end code using standard includes:

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <?!= include('stylesheet.html') ?>
  </head>
  <body>
    <h1>Hello <?= username ?>!</h1>
  </body>
</html>
```

```javascript
// server.js
export const username = "Bruce";

export function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

export function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate();
}
```

## Debugging

### 1. Named Modules in Chrome Debugger
When debugging client-side JavaScript in Chrome DevTools, it can be difficult to locate your scripts if they are served as anonymous blocks. To give them a recognizable name in the "Sources" tab, add a `sourceURL` comment to the end of your script:

```javascript
// At the bottom of your script or .html file
//# sourceURL=gas-fakes:///my_script_name.gs
```
This tells Chrome to map the script to the specified virtual path, making it much easier to set breakpoints and step through code.

### 2. Debugging the Node.js Side (VS Code)
To debug the `gas-fakes` server itself or your server-side Apps Script logic running in Node, you can use a VS Code launch configuration.

#### Recommended Configuration
Set this up as a launch configuration with your required serve arguments.

```json
{
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Chordsnip",
      "runtimeExecutable": "gas-fakes",
      "runtimeArgs": ["serve", "localserve.js", "-m", "serve"],
      "cwd": "${workspaceFolder}/chordsnip-gas-fakes-redux",
      "console": "integratedTerminal",
      "skipFiles": [
        "<node_internals>/**"
      ]
    }
  ]
}
```

## multi file projects

Most Apps Script projects consist of multiple `.gs` and `.html` files in the same directory. In order for them to be visible in Node, you typically need to export them from their host modules. In addition, because Apps Script does not have the concept of imports, we need to export all of these in a top level module. 

Here's an example of a typical wrapper - which of course include @gas-fakes module to be able to run apps script functions locally:

```javascript

import '@mcpher/gas-fakes'
export { Include } from "./Include.js";
export { exposeRun, ServerWatcher } from "./ServerWatcher.js";
export { Props } from "./Props.js";
export { Process } from "./Process.js";
export { App } from "./App.js";
export { Server } from "./Server.js";
export { Fiddler } from "./Fiddler.js";
export { SheetsMore } from "./SheetsMore.js";
export { Utils } from "./Utils.js";
export { Image } from "./Image.js";
export { Chord } from "./Chord.js";
export { ChordUtils } from "./ChordUtils.js";
export { Elementer } from "./Elementer.js";
export { DomUtils } from "./DomUtils.js";
export { Provoke } from "./Provoke.js";
import { showChordSnip } from "./Addon.js";


export const addon = () => {
  return showChordSnip();
};
```

Each of these modules should export all of the functions that you want to be able to call from the client. For example:

```javascript
var Server = (function (ns) {
  
  ns.generateTestData = function (data) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.insertSheet();
    sh.getRange(1, 1, data.length, data[0].length).setValues(data);
    ss.setActiveSheet(sh);
    return data;
  };

  return ns;
})(Server || {});

export { Server }
```

### What does this mean for Apps Script compatibility?

gas-fakes cli provides a function to transform native Node code which contains many things that Apps Script does not support. Just run `gas-fakes togas` from your project folder and it will sanitize Node specific stuff and push everything to the App Script IDE, preserving all filenames and line numbers.

## Debugging client side code

Unlike Apps Script, Client side code created by gas-fakes emulation of  `HtmlService` retains your code in its original form. This means that you can actually debug client side code using the chrome debugger, and simultaneously debug server side code using the Node debugger.

If you have multiple source files, you can encourage the Chrome browser to organize them into separate files in the debugger by adding a source URL comment to the end of each file. This removes the location problem associated with bundling code.

```javascript
// At the bottom of your script or .html file
//# sourceURL=gas-fakes:///my_script_name.gs
```

For example if you have the following files:

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
  </head>
  <body>
    <h1>Hello <?= username ?>!</h1>
    <script>
      console.log("Hello World")
      //# sourceURL=gas-fakes:///js/main.js
    </script>
  </body>
</html>
```

### Container bound workaround

If you were creating, say, a custom menu for a spreadsheet, the code would be defined as a container bound script for that spreadsheet. 

1. Create that empty script with the required manifest and use clasp to pull down the .clasp.json into your target folder that `gas-fakes togas` will use.
2. run `gas-fakes init` and provide your spreadsheet id as the document id when asked, and provide the path it should look for the .clasp.json in, then `gas-fakes auth` to set up your repo with the appriate permissions See [getting started](../GETTING_STARTED.md) for info on authentication.

This will associate your local instance of your code with the container it would normally be bound to. Like this you can debug both the client and the server code and also see the real time effect on the actual document it will eventually be bound to. Just position the windows side by side and you'll have a simulated add-on experience but with the server side code running locally on Node.

### Include function

This repo contains an example Include function. This is not part of gas-fakes, but I mention it here in case you want to implement something similar. This allows for a neater definition of the client side app, and it also allows me to share common code between client and server. For example, my main html looks like this. 

```html
<!DOCTYPE html>
<html>
  <head>
  <base target="_top">
    <?!= Include.html(['cdn.css']); ?>
    <?!= Include.css(['spinner','app']); ?>  
  </head>
  <body>
   
    <?!= Include.html(['appmarkup','cdn']); ?>  
    <?!= Include.js(['main']); ?>
    <?!= Include.gs(['ClientWatcher','Elementer','Utils', 'ChordUtils',
    'Chord' , 'Process'  ,'Home' ,'App', 
    'Client','DomUtils','Provoke','Fiddler']); ?>

  </body>
</html>
```

The Include function in this repo will automatically inject the necessary code to keep the original files separated.

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

