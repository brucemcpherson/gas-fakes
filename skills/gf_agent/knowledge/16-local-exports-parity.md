### Exporting Local Variables for Templates & RPC (Parity)

When developing a Google Apps Script project locally that uses `HtmlService` templates (e.g., `<?!= Include.html() ?>`) or client-side RPC calls (`google.script.run.doSomething()`), the `gas-fakes` backend requires those server-side functions and variables to be explicitly exported from your entry point (`index.js`). 

However, using `globalThis.MyVar = ...` inside your code is an **anti-pattern** because it introduces Node-specific hacks that might pollute the global scope or crash if accidentally pushed to Live Apps Script.

**The Solution (100% Parity):**
Google Apps Script (specifically the V8 engine and the Clasp pusher) completely ignores ES6 `export` statements in standard `.gs` / `.js` files. You can safely append exports to the bottom of your source files to expose them to Node.js, while Live GAS will naturally treat them as part of the monolithic global scope.

**Step 1: Append export to the source file**
```javascript
// File: Utils.js
var Utils = (function() { return { html: () => "hi" } })();
function doSomething() { return true; }

// Add this to the very bottom. 
// Node.js will read it. Live Apps Script will ignore it.
export { Utils, doSomething };
```

**Step 2: Re-export from the entry point**
```javascript
// File: index.js (Local entry point for `gas-fakes serve`)
import '@mcpher/gas-fakes';

// Directly re-export them so gas-fakes can bridge them to the template/RPC workers
export { Utils, doSomething } from './Utils.js';

export const main = () => {
  return HtmlService.createTemplateFromFile('index.html').evaluate();
}
```
This pattern ensures your templates and `google.script.run` calls can seamlessly find your backend methods locally, while keeping the source code perfectly compliant with Live Apps Script.