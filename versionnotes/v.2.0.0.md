

## Authentication 

Up till now gas-fakes has relied on ADC for authentication. This is fine for running locally, but in order to support more platforms gas-fakes will now also support Keyless Domain Wide Delegation (DWD). This will be the default method ongoing. This means we can use the same artifacts when running locally or using workload identity. In addition to the increased security, this also allows gas-fakes to be used in environments where ADC is not available, such as Cloud Run and Kubernetes. Another advantage is that we can also remove the complexity associated with using regular Workspace scopes.

### DWD vs ADC Comparison

| Feature | Application Default Credentials (ADC) | Domain-Wide Delegation (DWD) |
| :--- | :--- | :--- |
| **Primary Use** | Local development and quick start | Production-ready, cross-platform deployment |
| **Platform Support** | Good for local, limited in some cloud environments | Universal (Local, Cloud Run, Kubernetes, Workload Identity) |
| **Security** | Direct user or service account permissions | Secure service-account based impersonation |
| **Configuration** | Prompt driven `gas-fakes init --auth-type adc` | Prompt driven `gas-fakes init --auth-type dwd` now the default. All service account creation etc is handled automatically.|
| **Admin action required** | Normally none, unless you are using restricted or Workspace scopes | Yes, requires admin action to enable DWD for the service account. |
| **Workspace Scopes** | Can involve complex restricted scope management | Simplifies and streamlines restricted scope handling |
| **Scope setup** | From environment variables | Directly from project manifest |
| **Consistency** | Variations between local and cloud artifacts | Identical artifacts across all environments |
| **Service Account** | User or service account | Service account |

### gas-fakes init --auth-type dwd

This will now be the default method. All service account creation etc is handled automatically. A prompt driven dialog will guide you through the process.

### gas-fakes init --auth-type adc

This is still supported and can be used in cases where you cannot get admin access to enable DWD for the service account (which can only be done via tha admin GUI). In this mode scopes are set up using environment variables and gas-fakes can only be run locally. 


### Authentication Steering

Starting with v2.0.0, you can explicitly control the authentication method using the `AUTH_TYPE` environment variable. While `DWD` is the recommended default for production and cross-platform consistency, `ADC` remains available for local development without admin-level Workspace configuration. Note that AUTH_TYPE is maintained by gas-fakes init, so you don't actually need to modify the .env file manually.

The steering logic is as follows:
- **Explicit DWD**: Set `AUTH_TYPE="DWD"`.
- **Explicit ADC**: Set `AUTH_TYPE="ADC"`.
- **Automatic**: If `AUTH_TYPE` is not set, `gas-fakes` will use `DWD` if `GOOGLE_SERVICE_ACCOUNT_NAME` is present, otherwise it falls back to `ADC`.

### Reliability and Idempotency

To support long-running scripts and handle network transients (like `ETIMEDOUT`), v2.0.0 introduces several reliability features:

- **Idempotent Slides Mutations**: Slides operations (append, insert, duplicate, etc.) now use stable `objectId`s. This ensures that retries after timeouts do not result in duplicate slides or shapes.
- **Graceful Error Recovery**: Service proxies now catch and handle "already exists" or "not found" errors during retries of mutative operations, treating them as success if the previous attempt actually reached the server.
- **Robust XML Parsing**: Sheets `getImages()` now handles XLSX archives more robustly by filtering for XML content and skipping binary image data during the metadata extraction phase.

### Environment Variable Changes
...
| Variable | Description | Example / Value |
| :--- | :--- | :--- |
| **GOOGLE_CLOUD_PROJECT** | The GCP Project ID where the services are hosted. | `your-gcp-project-id` |
| **DRIVE_TEST_FILE_ID** | optional - ID of a Drive file used for integration testing. | `1iOqRbA6zbV3ry73iEf4y9cygtDchJvAh` |
| **STORE_TYPE** | The storage backend for persistence.| `UPSTASH`, `FILE` |
| **LOG_DESTINATION** | Destination for application logs. | `CONSOLE`, `CLOUD_LOGGING` |
| **DEFAULT_SCOPES** | Baseline identity and auth scopes (ADC mode only). | `.../auth/userinfo.email, openid, ...` |
| **EXTRA_SCOPES** | Service-specific scopes (ADC mode only). | `.../auth/drive, .../auth/spreadsheets, ...` |
| **UPSTASH_REDIS_REST_URL** | REST URL for Upstash (if STORE_TYPE is UPSTASH). | `https://...upstash.io` |
| **UPSTASH_REDIS_REST_TOKEN** | REST Token for Upstash authentication. (if STORE_TYPE is UPSTASH).| `AVlrAA...` |
| **QUIET** | Suppresses non-essential logging output. | `true` or `false` |
| **GOOGLE_SERVICE_ACCOUNT_NAME** | Service account name used for DWD. | `gas-fakes-worker` |
| **AUTH_TYPE** | Explicitly steer auth method. | `adc`, `dwd` (Defaults to dwd if GOOGLE_SERVICE_ACCOUNT_NAME is present) |

### Shell Scripts

All legacy shell scripts associated with authentication have been removed, as this is now handled via gas-fakes init.


### Russian documentation

The Russian README documentation has been removed as it is no longer up to date.

### Logging from cloud run

In order to ensure that cloud run correctly logs messages in the proper order, there's now a timestamp prefix added to all log messages.

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

