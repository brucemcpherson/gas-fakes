# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">   gas-fakes: Bringing Apps Script to the desktop

A brief summary on approaching parity of Google Apps Script methods and classes, some of the 'extras' gas-fakes provides for platform variety, production, development and testing and glimpse of some of the techniques used to get there.


## Introduction: The Challenge of the Scripting Layer

Google Apps Script (GAS) is a powerful tool for extending Google Workspace, automating workflows, and building lightweight backend services. It excels at rapid prototyping and integration within the Google ecosystem. However the limitations of the GAS environment (its proprietary runtime, laborious deployment cycle, and lack of modern tooling and debugging) become significant bottlenecks.

We love the power and integration of GAS, but we require the debuggability and flexibility of a modern Node.js environment.

This is the problem that **gas-fakes** is designed to address.

`gas-fakes` is an architectural emulation layer designed to bring the entire GAS runtime experience (its APIs, its behaviors, and its constraints) into a robust, controllable Node.js environment. It allows developers to write GAS-like code while leveraging the full power of modern software engineering practices.

---

## 1. The Path to Parity: Emulating the GAS Runtime

The core challenge in building `gas-fakes` is the fundamental mismatch between the GAS execution model and the Node.js event loop. GAS is inherently asynchronous, relying on a managed, proprietary execution environment. Node.js, is designed for high-throughput, asynchronous execution and non-blocking I/O.

Our architectural approach to achieving parity focuses on accurate API simulation and execution model transformation.

### The API Contract: Discovery Documents and REST

The foundation of GAS is its reliance on Google's ecosystem of REST APIs, exposed through its own managed runtime. We've mapped the exact schema, parameters, and expected responses of every GAS service (e.g., `SpreadsheetApp`, `GmailApp`). This allows `gas-fakes` to treat the GAS environment as a highly structured, predictable API contract.

### The Execution Model: Synchronous Emulation via Worker Threads

The most complex hurdle is the transformation of GAS's asynchronous API calls (which often feel synchronous to the developer) into a predictable, synchronous-feeling flow within Node.js.

We achieve this by employing **Worker Threads** and **Atomics**.

1.  **Worker Isolation:** When a GAS method is called (e.g., `SpreadsheetApp.getActiveSpreadsheet().getRange().getValue()`), the request is routed to a dedicated Worker Thread. This isolates the simulated GAS execution from the main Node.js event loop, preventing blocking while maintaining the illusion of synchronous execution.
2.  **Asynchronous-to-Synchronous Bridge:** The Worker Thread executes the simulated API call. Instead of returning a standard Promise, we use `Atomics` to manage shared memory state between the Worker and the main thread. This allows the main thread to effectively "wait" for the combined result from the Worker, mimicking the blocking behavior of the original GAS runtime, while allowing the worker to execute multiple asynchronous activities. 

### The Importance of Behavioral Oddities

A perfect API contract is insufficient. GAS has numerous subtle, undocumented behaviors such as rate limiting quirks, specific error codes, divergences from the associated API behavior, ID transformations, and timing dependencies that need to be understood and emulated for true parity.

A significant part of the `gas-fakes` development process is the meticulous documentation and reproduction of these **behavioral oddities**. We don't just emulate the *happy path*; we emulate the *edge cases* and the *developer experience* of the live GAS environment, ensuring that code written in `gas-fakes` behaves identically to how it would in production.

### 🧪 Rigorous Testing Regime: `gas-fakes` fidelity assurance

To validate the claim of behavioral parity, `gas-fakes` operates under a massive, dual-environment testing regime. We maintain a comprehensive suite of **over 10,500 tests** (as of version 2.5.3) that are executed across two distinct environments:

1.  **The Local `gas-fakes` Emulator:** This allows for rapid, isolated unit and integration testing of the simulated runtime, ensuring the internal logic and API contracts are sound.
2.  **The Live Google Apps Script Environment:** Crucially, every test suite is also executed against the actual, live GAS runtime.

This dual-environment verification ensures that the emulation is not merely "close," but **behaviorally identical** to production GAS, including the precise handling of complex error states, rate limiting, and obscure edge cases that only manifest in the live Google ecosystem.

---

## 2. Transparency and Auditing: The Documentation Layer

Beyond achieving functional parity, `gas-fakes` is engineered with a core commitment to engineering transparency. We recognize that for enterprise adoption, developers require not just a working emulator, but a fully auditable and self-documenting environment.

To address this, we have built a sophisticated documentation layer that provides unprecedented visibility into the emulation process.

### 📚 Embedded API Documentation

The repository includes a locally accessible and searchable version of the official Google Apps Script documentation. This documentation is integrated directly into the development environment, allowing developers to reference precise API definitions, parameter types, and expected behaviors without needing to switch context or leave their local codebase. This eliminates the friction of external documentation lookups, accelerating the development cycle while maintaining technical accuracy.

### 📊 Fidelity Progress Summary

To manage the monumental task of API parity, we provide an automated **Fidelity Progress Summary**. This system offers a clear, high-level overview of the implementation status for every class and method across all supported services. Developers can instantly see whether a specific function is `Completed`, `In Progress`, or `Not Started`, providing a transparent roadmap of the emulation effort and allowing them to gauge the maturity of the API they are using.

As of version 2.5.3, 4399 of Apps Scripts total of 6708	are implemented. 

### 🔍 Deep Implementation Links: The Audit Trail

A unique feature of `gas-fakes` is deep implementation transparency. The documentation includes direct, clickable links to the **exact line of source code** where every single method is implemented within the emulator. This feature allows for instant verification and auditing of the emulation logic. If a developer questions the behavior of `SpreadsheetApp.getRange()`, they can instantly trace the call through the documentation to the specific line of code in `gas-fakes` that dictates its behavior, providing a high level of trust and debuggability.

---

## 3. Beyond Parity: The gas-fakes Advantage

While achieving parity is a huge task, another value of `gas-fakes` lies in the capabilities it enables. Capabilities that are fundamentally impossible or prohibitively difficult within the constraints of the live Google Apps Script environment. This includes the elimination of theat troublesome 6 minute execution time limit on Live Apps Script.

`gas-fakes` transforms the Apps Script language into a modern application development platform by separating its syntax from the place it traditionally runs.

### 🚀 GAS Syntax for Regular Node Apps: Simplified Workspace Access

A transformative features of `gas-fakes` is its ability to inject the familiar, high-level syntax of Google Apps Script directly into a standard Node.js runtime. 

Even if you have no intention of ever deploying to Google Apps Script, you can use the simple, intuitive GAS syntax (e.g., `SpreadsheetApp`, `DriveApp`) in your regular Node.js apps. This provides a much simpler interface for accessing Workspace resources compared to the complex, low-level parameters of the raw REST APIs. It reduces cognitive load, improves maintainability, and abstracts away the complexity of OAuth scopes and request formatting.

### 🔑 Auth Provisioning & Token Reuse: A Unified Credential Manager

Managing authentication tokens across multiple services is an operational burden. `gas-fakes auth` acts as a powerful, centralized credential manager. It provisions OAuth tokens for multiple backends (Google, KSuite, MS Graph) scoped to your provided manifest which can then be easily retrieved and **reused** by other parts of your Node application or even by separate CLI tools. This creates a streamlined, single source of truth for credentials.

### ☁️ Containerization and Multi-Cloud Deployment

The entire GAS runtime emulation can be packaged using **Docker**. This allows developers to deploy and run GAS-like logic in modern, serverless, and scalable multi-cloud environments. By leveraging the container image, `gas-fakes` is fully compatible with leading cloud platforms, including:

*   **Google Cloud Run**, **Azure Container Apps**, **AWS Lambda**, **IBM Cloud**, and **Kubernetes**.

This capability fundamentally breaks the vendor lock-in associated with proprietary GAS deployment, allowing the same business logic to be executed in any serverless or containerized architecture.

### 🚀 CLI Workflow and Initialization

While the core functionality of `gas-fakes` provides a local execution environment, the initial setup and integration with live cloud services are handled through a streamlined Command Line Interface (CLI). This workflow is designed to minimize friction, automate complex configuration tasks, and ensure that your local testing environment perfectly mirrors the permissions and dependencies of your production Apps Script project.

#### 🛠️ Streamlined Project Setup (`gas-fakes init`)

The `gas-fakes init` command serves as the foundational step for any new project. It automates the tedious process of environment configuration, allowing developers to focus immediately on coding. It automatically generates a local `.env` file, which securely stores necessary configuration variables and prompts the user to select the target cloud backends (e.g., Google Workspace, KSuite, MS Graph).

#### 🔑 Authentication and Token Management (`gas-fakes auth`)

Connecting a local environment to live cloud services requires managing complex OAuth flows and token lifecycles. The `gas-fakes auth` command abstracts this complexity, providing a robust mechanism for secure, persistent authentication across all supported backends. It handles initial authorization guiding the user through browser redirects and manages secure token storage and refresh logic.

#### 🔬 Automatic Scope Discovery: Precision Permissions

The CLI automatically reads the `appsscript.json` manifest file from your project. By parsing this file, `gas-fakes` automatically infers and registers the exact OAuth scopes necessary for local execution. This ensures that your local environment is provisioned with the precise permissions required by the live project, guaranteeing parity without requiring developers to manually track or update scope lists.  

`gas-fakes` even supports existing published Apps Script libraries. If they are mentioned in your manifest, they can be accessed remotely from live Apps Script and executed locally. 

### 🚀 Local Web Server and RPC Testing

In live GAS, testing a Web App requires deployment and a live URL. In `gas-fakes`, you can use its cli to instantiate the entire GAS environment locally, deploy your code to a simulated endpoint, and test complex `google.script.run` interactions and HTML Service templating with full local debugging tools without the need for any actual deployments. This accelerates the development feedback loop, with code changes showing up live in your local environment.

### 🌐 Multi-Backend Architecture

Live GAS is tightly coupled to Google services. `gas-fakes` decouples the business logic from the data source. By simply switching a configuration property, your GAS-like code can run against **Google Services**, **KSuite**, or **MS Graph**. This enables hybrid architectures and sovereign cloud, with increased parity for non-Google backends currently being prioritized.

### 🧠 The Automation Layer: CLI, `gf_agent`, and `togas`

While the sandbox provides the secure environment, the **`gas-fakes` CLI** and the specialized **`gf_agent`** provide the intelligence and accessibility needed for modern automation.

*   **The CLI**: A robust command-line tool for running scripts, starting local servers, and managing the sandbox.
*   **`gf_agent`**: This AI-powered companion acts as a translator, bridging the gap between natural language intent and executable code. For example, a request like *"Summarize my last 5 emails and put them in a new spreadsheet"* is instantly converted into optimized Apps Script and executed by your AI agent. This is a self learning skills agaent which can both enhance its own knowledge, and optionally contribute towards community skills.
*   **`togas` & Clasp Integration**: The `togas` command acts as a high-level orchestrator for deployment. It automates the process of bundling and synchronizing local files with a live GAS project. It builds upon and enhances the core functionality of **`clasp`**, providing a streamlined local-to-cloud workflow and making the necessary adjustments to local 'Node specific' ES syntax.
*   **Sandbox-Agent Synergy**: This combination enables safe, instant Workspace automation. The agent handles the *what*, and the sandbox ensures the *how*, guaranteeing that code only touches whitelisted resources without the overhead of building complex specialized agents or MCP servers.

### 🛠️ Modern Tooling and Developer Experience

A big pain point for GAS developers is the lack of modern tooling. `gas-fakes` eliminates this by providing a full Node.js development stack:

*   **NPM Ecosystem:** Utilize any modern NPM package, allowing access to thousands of specialized libraries.
*   **Advanced Debugging:** Leverage industry-standard Node.js debuggers (e.g., VS Code, AntiGravity) to step through code, inspect variables, and trace execution paths—a luxury unavailable in the GAS runtime—while simultaneously inspecting client-side HTML Service code in the Chrome debugger in its original structure, line numberings and format.

### 🛡️ Granular Sandbox and Security

The live GAS environment offers a broad permission model. `gas-fakes` provides a fine-grained, developer-controlled sandbox:

*   **File-Level Whitelisting:** Define exactly which files or modules the script is allowed to access.
*   **Service-Level Permission Controls:** Explicitly define which simulated services (e.g., `GmailApp`, `DriveApp`) the script is permitted to call, allowing for highly secure, auditable execution environments.

This optional level of granularity gives protection against Vibe coding hallucination.

### 🔗 Hybrid Interoperability: Bridging Local and Live

You often need to maintain state across environments. `gas-fakes` supports **Hybrid Interoperability**.

By integrating with external services like Redis or Upstash, `gas-fakes` allows the local development environment to share cache data, properties, and session state with the live, deployed GAS instance. This means your local tests are not isolated; they are running against a realistic, persistent state, ensuring seamless transition from development to production. We provide a drop-in replacement property and cache service library for live Apps Script, so you can share exactly the same stores between your local environment and the live deployed GAS.

---

## Conclusion: Apps Script as a 'Lingua Franca'

`gas-fakes` elevates Apps Script, a powerful yet constrained scripting language, to the level of a modern, maintainable, and scalable application framework—a lingua franca for Google Workspace integration. It allows teams to write the code they know, test it with the fidelity they require, and deploy it with the control they deserve.

We are not just emulating GAS; we are liberating it.

To use `gas-fakes` just include `import @mcpher/gas-fakes` at the top of your regular Apps Script code.

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

