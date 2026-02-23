

## Authentication 

Up till now gas-fakes has relied on ADC for authentication. This is fine for running locally, but in order to support more platforms gas-fakes will now also support Keyless Domain Wide Delegation (DWD). This will be the default method ongoing. This means we can use the same artifacts when running locally or using workload identity. In addition to the increased security, this also allows gas-fakes to be used in environments where ADC is not available, such as Cloud Run and Kubernetes. Another advantage is that we can also remove the complexity associated with using restricted Workspace scopes.

### DWD vs ADC Comparison

| Feature | Application Default Credentials (ADC) | Domain-Wide Delegation (DWD) |
| :--- | :--- | :--- |
| **Primary Use** | Local development and quick start | Production-ready, cross-platform deployment |
| **Platform Support** | Good for local, limited in some cloud environments | Universal (Local, Cloud Run, Kubernetes, Workload Identity) |
| **Security** | Direct user or service account permissions | Secure service-account based impersonation |
| **Configuration** | Prompt driven `gas-fakes init --auth-type adc` | Prompt driven `gas-fakes init --auth-type dwd` now the default. All service account creation etc is handled automatically.|
| **Admin action required** | Normally none, unless you are using restricted or sensitive scopes | Yes, requires admin action to enable DWD for the service account. |
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

## <img src="../logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading

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
