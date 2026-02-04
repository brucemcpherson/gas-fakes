

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