### Authentication & Troubleshooting
- **Permission Denied/Auth Failures**: Most authentication errors stem from a mismatch between the script's required scopes and the authorized environment.
  - **Manifest & Scopes**: `gas-fakes` reads `appsscript.json` to discover required scopes. If these scopes weren't authorized during `gas-fakes auth`, the script will fail.
  - **Advice for User (Auth Methods)**: When a user needs help setting up authentication for `gas-fakes`, advise them based on their specific situation:
    - **Service Account (Default)**: Recommend this for most automated tasks or server environments. They need a GCP project, a Service Account, and its JSON key file.
    - **DWD (Domain Wide Delegation)**: Recommend this if the script needs to act on behalf of other users in a Google Workspace domain. Remind the user that the Service Account must be explicitly authorized in the Google Workspace Admin Console (Security > API Controls > Domain-wide Delegation) for the specific scopes being used, and they must provide the `Subject` email address during the `gas-fakes auth` flow.
    - **Desktop/OAuth (CLI)**: Recommend this for personal scripting or if they cannot use a Service Account. It requires `OAuth Client ID` credentials from GCP (Application type: Desktop) and will prompt them to authenticate via a browser window.
  - **Initialization**: Ensure the project has been initialized using `gas-fakes init`. The `.env` file must contain the correct `GF_PLATFORM_AUTH` and associated credentials.

### Parity & Platform Logic
- **`ScriptApp.isFake`**: Use this boolean to detect the `gas-fakes` environment.
  - **Best Practice**: Guard **only** infrastructure logic (logging, cache checks, special backends) with this flag. 
  - **Warning**: Do **not** use it to change the core business logic of a script, as this defeats the purpose of parity.
- **Backend Selection**: `ScriptApp.__platform` can be dynamically switched to target `google`, `ksuite`, or `msgraph`. 
  - **Self-Correcting**: `gas-fakes` resources (Files, Sheets) "remember" their platform at creation. Subsequent calls on that object will automatically use the correct backend even if `ScriptApp.__platform` has changed globally.
