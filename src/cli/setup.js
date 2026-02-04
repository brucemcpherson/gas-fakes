import prompts from "prompts";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { checkForGcloudCli, runCommandSync } from "./utils.js";

// --- Utility Functions ---

/**
 * Recursively searches for .env files starting from a directory.
 * @param {string} dir - Start directory
 * @returns {Promise<string[]>} List of found .env file paths
 */
async function findEnvFiles(dir) {
  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const promises = entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") {
          return Promise.resolve([]);
        }
        return findEnvFiles(fullPath);
      } else if (entry.isFile() && entry.name === ".env") {
        return Promise.resolve(fullPath);
      }
      return Promise.resolve([]);
    });
    const results = await Promise.all(promises);
    return results.flat();
  } catch (err) {
    console.error(`No directory: ${dir}`);
    return [];
  }
}

// --- Exported Command Implementations ---

export async function initializeConfiguration(options = {}) {
  let envPath;

  // first step is to check we have a manifest file if we are doing auth type dwd
  if (options.authType === "dwd") {
    const manifestPath = path.resolve(process.cwd(), "appsscript.json");
    if (!fs.existsSync(manifestPath)) {
      console.log("No manifest file found. Please create an appsscript.json file in the current directory with required scopes.");
      return;
    }
  }

  // need to figure out which env file we are operating on
  if (options.env) {
    envPath = path.resolve(process.cwd(), options.env);
    console.log(`-> Using specified .env path: ${envPath}`);
  } else {
    const foundFiles = await findEnvFiles(process.cwd());
    if (foundFiles.length > 0) {
      const choices = foundFiles.map((file) => ({
        title: file,
        value: file,
      }));
      choices.push({
        title: "Create a new .env file in the current directory",
        value: "new",
      });

      const response = await prompts({
        type: "select",
        name: "envPathSelection",
        message: "Found .env file(s). Which one would you like to use?",
        choices: choices,
      });

      if (typeof response.envPathSelection === "undefined") {
        console.log("Initialization cancelled.");
        return;
      }

      if (response.envPathSelection === "new") {
        envPath = path.join(process.cwd(), ".env");
      } else {
        envPath = response.envPathSelection;
      }
    } else {
      console.log(
        "No .env file found. A new one will be created in the current directory."
      );
      envPath = path.join(process.cwd(), ".env");
    }
    console.log(`-> Using .env file at: ${envPath}`);
  }

  let existingConfig = {};
  if (fs.existsSync(envPath)) {
    console.log(
      "Found existing .env file. Loading current values as defaults."
    );
    existingConfig = dotenv.parse(fs.readFileSync(envPath));
  }

  const responses = {};
  const DEFAULT_SCOPES_VALUES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "openid",
    "https://www.googleapis.com/auth/cloud-platform",
  ];
  console.log(
    "\nThe following default scopes are required for basic operations and will be enabled automatically:"
  );
  DEFAULT_SCOPES_VALUES.forEach((scope) => console.log(`  - ${scope}`));
  responses.DEFAULT_SCOPES = DEFAULT_SCOPES_VALUES;

  if (options.authType === "dwd") {
    responses.AUTH_TYPE = "dwd";
    // we need to get the scopes from the manifest file
    const manifestPath = path.resolve(process.cwd(), "appsscript.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath));
    const scopes = manifest?.oauthScopes;
    // remove any in manifest that are default anyway
    responses.EXTRA_SCOPES = (scopes || []).filter(scope => !DEFAULT_SCOPES_VALUES.includes(scope));

    // if we are doing dwd we need to ask for the service account name
    const serviceAccountNameQuestion = {
      type: "text",
      name: "GOOGLE_SERVICE_ACCOUNT_NAME",
      message: "Enter a service account name (it will be created if it doesnt already exist)",
      initial: existingConfig.GOOGLE_SERVICE_ACCOUNT_NAME || "gas-fakes-sa",
    };
    const serviceAccountNameResponse = await prompts(serviceAccountNameQuestion);
    if (typeof serviceAccountNameResponse.GOOGLE_SERVICE_ACCOUNT_NAME === "undefined") {
      console.log("Initialization cancelled.");
      return;
    }
    Object.assign(responses, serviceAccountNameResponse);
  } else {
    responses.AUTH_TYPE = "adc";
    console.log("--------------------------------------------------");
    console.log("Configuring .env for gas-fakes");
    console.log("Press Enter to accept the default value in brackets.");
    console.log("Use Space to select/deselect scopes.");
    console.log("--------------------------------------------------");
  }




  // --- Stage 1: Basic Info ---
  const basicInfoQuestions = [
    {
      type: "text",
      name: "GOOGLE_CLOUD_PROJECT",
      message: "Enter your GCP Project ID",
      initial:
        existingConfig.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
    },
    {
      type: "text",
      name: "DRIVE_TEST_FILE_ID",
      message:
        "Enter a test Drive file ID for authentication checks (optional)",
      initial: existingConfig.DRIVE_TEST_FILE_ID || "",
    },
  ];

  const basicInfoResponses = await prompts(basicInfoQuestions);
  if (typeof basicInfoResponses.GOOGLE_CLOUD_PROJECT === "undefined") {
    console.log("Initialization cancelled.");
    return;
  }
  Object.assign(responses, basicInfoResponses);

  // --- Stage 2: Scopes ---

  // we only need this if we doing adc  
  if (options.authType === "adc") {
    const existingExtraScopes = existingConfig.EXTRA_SCOPES
      ? existingConfig.EXTRA_SCOPES.split(",").filter((s) => s)
      : [];
    const extraScopeQuestion = {
      type: "multiselect",
      name: "EXTRA_SCOPES",
      message: "Select any extra scopes your script requires",
      choices: [
        {
          title: "Workspace resources",
          value: "https://www.googleapis.com/auth/drive",
        },
        {
          sensitivity: "sensitive",
          title: "Calendar (full access)",
          value: "https://www.googleapis.com/auth/calendar",
        },
        {
          // actually labels are not sensitive
          title: "Gmail labels",
          value: "https://www.googleapis.com/auth/gmail.labels",
        },
        {
          sensitivity: "sensitive",
          title: "Gmail compose",
          value: "https://www.googleapis.com/auth/gmail.compose",
        },
        {
          sensitivity: "sensitive",
          title: "Gmail modify",
          value: "https://www.googleapis.com/auth/gmail.modify",
        },
        {
          sensitivity: "sensitive",
          title: "Gmail send",
          value: "https://www.googleapis.com/auth/gmail.send",
        },
      ].map((scope) => ({
        ...scope,
        title: scope.sensitivity
          ? `[${scope.sensitivity}] ${scope.title}`
          : scope.title,
        // because we always need drive for ant extra scopes
        selected:
          existingExtraScopes.length > 0
            ? existingExtraScopes.includes(scope.value)
            : scope.value === "https://www.googleapis.com/auth/drive",
      })),
      hint: "- Use space to select/deselect. Press Enter to submit.",
    };

    // Check for any kind of sensitivity
    const sensitiveScopesList = extraScopeQuestion.choices.filter(
      (scope) => scope.sensitivity
    );

    const extraScopeResponses = options.authType === "adc" ? await prompts(extraScopeQuestion) : {};

    if (typeof extraScopeResponses.EXTRA_SCOPES === "undefined") {
      console.log("Initialization cancelled.");
      return;
    }
    Object.assign(responses, extraScopeResponses);

    const selectedExtraScopes = responses.EXTRA_SCOPES || [];

    const usesSensitiveScopes = sensitiveScopesList.some((s) =>
      selectedExtraScopes.includes(s.value)
    );

    if (usesSensitiveScopes) {
      console.log("\n--------------------------------------------------");
      console.log(
        "You have selected sensitive or restricted scopes. Google requires an OAuth client credential file for these."
      );
      console.log(
        "See the getting started guide https://github.com/brucemcpherson/gas-fakes/blob/main/GETTING_STARTED.md for how."
      );
      console.log("--------------------------------------------------");
    }

    const clientCredentialQuestion = {
      type: "text",
      name: "CLIENT_CREDENTIAL_FILE",
      message: usesSensitiveScopes
        ? "Enter the path and filename for your OAuth client credentials JSON"
        : "Enter path to OAuth client credentials JSON (optional)",
      initial: existingConfig.CLIENT_CREDENTIAL_FILE || "",
      validate: (input) => {
        const trimmedInput = input.trim();

        if (usesSensitiveScopes) {
          if (trimmedInput === "") {
            return "This field is required for the selected sensitive scopes.";
          }
        } else {
          if (trimmedInput === "") {
            return true;
          }
        }

        const resolvedPath = path.resolve(process.cwd(), trimmedInput);
        if (!fs.existsSync(resolvedPath)) {
          return `File not found at '${resolvedPath}'. Please check the path and try again.`;
        }

        return true;
      },
    };

    const clientCredentialResponse = await prompts(clientCredentialQuestion);
    if (typeof clientCredentialResponse.CLIENT_CREDENTIAL_FILE === "undefined") {
      console.log("Initialization cancelled.");
      return;
    }
    Object.assign(responses, clientCredentialResponse);
  }
  // --- Stage 3: Remaining Config ---
  const defaultScopesDisplay = `\n  - Default: [${responses.DEFAULT_SCOPES.join(
    ", "
  )}]`;
  const extraScopesDisplay =
    responses.EXTRA_SCOPES && responses.EXTRA_SCOPES.length > 0
      ? `\n  - Extra:   [${responses.EXTRA_SCOPES.join(", ")}]`
      : "\n  - Extra:   [None]";


  const remainingQuestions = [
    {
      type: "toggle",
      name: "QUIET",
      message: "Run gas-fakes package in quiet mode",
      initial: existingConfig.QUIET === "true" ? true : false,
    },
    {
      type: "select",
      name: "LOG_DESTINATION",
      message: `Selected Scopes:${defaultScopesDisplay}${extraScopesDisplay}\n\nEnter logging destination`,
      choices: [
        { title: "CONSOLE", value: "CONSOLE" },
        { title: "CLOUD", value: "CLOUD" },
        { title: "BOTH", value: "BOTH" },
        { title: "NONE", value: "NONE" },
      ],
      initial:
        ["CONSOLE", "CLOUD", "BOTH", "NONE"].indexOf(
          existingConfig.LOG_DESTINATION
        ) > -1
          ? ["CONSOLE", "CLOUD", "BOTH", "NONE"].indexOf(
            existingConfig.LOG_DESTINATION
          )
          : 0,
    },
    {
      type: "select",
      name: "STORE_TYPE",
      message: "Enter storage type",
      choices: [
        { title: "FILE", value: "FILE" },
        { title: "UPSTASH", value: "UPSTASH" },
      ],
      initial:
        ["FILE", "UPSTASH"].indexOf(existingConfig.STORE_TYPE?.toUpperCase()) >
          -1
          ? ["FILE", "UPSTASH"].indexOf(existingConfig.STORE_TYPE.toUpperCase())
          : 0,
    },
  ];

  const remainingResponses = await prompts(remainingQuestions);
  if (typeof remainingResponses.LOG_DESTINATION === "undefined") {
    console.log("Initialization cancelled.");
    return;
  }
  Object.assign(responses, remainingResponses);

  // Convert scope arrays to comma-separated strings for saving
  if (Array.isArray(responses.DEFAULT_SCOPES)) {
    responses.DEFAULT_SCOPES = responses.DEFAULT_SCOPES.join(",");
  }
  if (Array.isArray(responses.EXTRA_SCOPES)) {
    responses.EXTRA_SCOPES = responses.EXTRA_SCOPES.join(",");
  }

  if (responses.STORE_TYPE === "UPSTASH") {
    const upstashQuestions = [
      {
        type: "text",
        name: "UPSTASH_REDIS_REST_URL",
        message: "Enter your Upstash Redis REST URL",
        initial: existingConfig.UPSTASH_REDIS_REST_URL || "",
      },
      {
        type: "text",
        name: "UPSTASH_REDIS_REST_TOKEN",
        message: "Enter your Upstash Redis REST Token",
        initial: existingConfig.UPSTASH_REDIS_REST_TOKEN || "",
      },
    ];
    const upstashResponses = await prompts(upstashQuestions);

    if (typeof upstashResponses.UPSTASH_REDIS_REST_URL === "undefined") {
      console.log("Initialization cancelled during Upstash configuration.");
      return;
    }
    Object.assign(responses, upstashResponses);
  }

  // --- Confirmation Step ---
  console.log("\n------------------ Summary ------------------");
  Object.entries(responses).forEach(([key, value]) => {
    if (value !== undefined) console.log(`${key}: ${value}`);
  });
  console.log("-------------------------------------------");

  const confirmSave = await prompts({
    type: "confirm",
    name: "save",
    message: `Save this configuration to ${envPath}?`,
    initial: true,
  });

  if (!confirmSave.save) {
    console.log("Configuration discarded. No changes were made.");
    return;
  }

  // --- File Writing Logic ---
  console.log(`Writing configuration to "${envPath}"...`);
  const inits =
    responses.STORE_TYPE !== "UPSTASH"
      ? { UPSTASH_REDIS_REST_TOKEN: "", UPSTASH_REDIS_REST_URL: "" }
      : {};
  const finalConfig = { ...existingConfig, ...responses, ...inits };

  console.log("\n------------------ Final output ------------------");
  const envContent = Reflect.ownKeys(finalConfig)
    .map((key) => {
      const item = finalConfig[key];
      const res = `${key}="${(item.toString() || "").trim()}"`;
      console.log(res);
      return res;
    })
    .join("\n");

  fs.writeFileSync(envPath, envContent + "\n", "utf8");

  console.log("--------------------------------------------------");
  console.log("Setup complete. Your .env file has been updated.");
  console.log("--------------------------------------------------");
}

/**
 * Handles the 'auth' command to authenticate with Google Cloud.
 */
export async function authenticateUser() {

  // First, check if gcloud CLI is available.
  await checkForGcloudCli();

  const rootDirectory = process.cwd();
  const envPath = path.join(rootDirectory, ".env");

  if (!fs.existsSync(envPath)) {
    console.error(`Error: .env file not found at '${envPath}'`);
    console.error("Please run './gas-fakes.js init' first.");
    process.exit(1);
  }

  dotenv.config({ path: envPath, quiet: true });

  const {
    // still supported for backwards compatibility
    GCP_PROJECT_ID,

    GOOGLE_CLOUD_PROJECT,

    // the scopes would have been set up in the init process whether or not they came form the manifest
    DEFAULT_SCOPES,
    EXTRA_SCOPES,

    // this would be required for sensitive scopes if using adc
    CLIENT_CREDENTIAL_FILE,
    AC,
    AUTH_TYPE,
    GOOGLE_SERVICE_ACCOUNT_NAME
  } = process.env;

  const projectId = GOOGLE_CLOUD_PROJECT || GCP_PROJECT_ID;
  if (!projectId) {
    console.error("Error: GOOGLE_CLOUD_PROJECT is not set in your .env file.");
    process.exit(1);
  }

  // question for Kanshi -- why all this stuff? it's all in the .env file....
  /*
  const defaultScopes =
    DEFAULT_SCOPES ||
    "https://www.googleapis.com/auth/userinfo.email,openid,https://www.googleapis.com/auth/cloud-platform";
  const extraScopes =
    EXTRA_SCOPES ||
    "https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/spreadsheets";

  let scopes = defaultScopes;
  if (extraScopes && extraScopes.length > 0) {
    scopes += (extraScopes.startsWith(",") ? "" : ",") + extraScopes;
  }
  */
  const scopes = Array.from(new Set([DEFAULT_SCOPES.split(",").concat(EXTRA_SCOPES.split(","))].filter(d => d))).join(",")
  const driveAccessFlag = "--enable-gdrive-access";

  console.log(`...requesting scopes ${scopes}`);

  let clientFlag = "";
  const activeConfig = AC || "default";
  //--- specific to adc auth type
  if (AUTH_TYPE === "adc") {

    if (CLIENT_CREDENTIAL_FILE) {
      console.log("...attempting to use enhanced client credentials");

      let clientPath = CLIENT_CREDENTIAL_FILE;
      if (!path.isAbsolute(clientPath)) {
        clientPath = path.join(rootDirectory, clientPath);
      }

      if (fs.existsSync(clientPath)) {
        clientFlag = `--client-id-file="${clientPath}"`;
      } else {
        console.error(
          `Error: Client credential file specified in .env not found at '${clientPath}'`
        );
        process.exit(1);
      }
    } else {
      console.log(
        "\n...CLIENT_CREDENTIAL_FILE is not set. Using default Application Default Credentials (ADC)."
      );
      console.log(
        "...if you have requested any sensitive scopes, you'll see 'This app is blocked message.'"
      );
      console.log(
        "...To allow them see - https://github.com/brucemcpherson/gas-fakes/blob/main/GETTING_STARTED.md\n"
      );
    }



    console.log("Revoking previous credentials...");
    try {
      execSync("gcloud auth revoke --quiet", { stdio: "ignore", shell: true });
    } catch (e) {
      /* ignore */
    }
    try {
      execSync("gcloud auth application-default revoke --quiet", {
        stdio: "ignore",
        shell: true,
      });
    } catch (e) {
      /* ignore */
    }

    console.log(`Ensuring gcloud configuration '${activeConfig}' exists...`);
    try {
      execSync(`gcloud config configurations describe "${activeConfig}"`, {
        stdio: "ignore",
        shell: true,
      });
      console.log(`Configuration '${activeConfig}' already exists.`);
    } catch (error) {
      console.log(`Configuration '${activeConfig}' not found. Creating it...`);
      runCommandSync(`gcloud config configurations create "${activeConfig}"`);
    }

    console.log(`Activating gcloud configuration: ${activeConfig}`);
    runCommandSync(`gcloud config configurations activate "${activeConfig}"`);
  }

  //--- need this for both auth types
  console.log(`Setting project to: ${projectId}`);
  runCommandSync(`gcloud config set project ${projectId}`);
  runCommandSync(`gcloud config set billing/quota_project ${projectId}`);

  console.log("Initiating user login...");
  runCommandSync(`gcloud auth login ${driveAccessFlag}`);

  // --- Verify that the user is actually logged in ---
  try {
    const currentAccount = execSync("gcloud config get-value account", {
      encoding: "utf8",
      shell: true,
    }).trim();

    if (!currentAccount || currentAccount === "(unset)") {
      console.error("\n[Error] Login appeared to fail or no account selected.");
      console.error(
        "Please try running 'gcloud auth login' manually to diagnose issues."
      );
      process.exit(1);
    }
    console.log(`Successfully logged in as: ${currentAccount}`);
  } catch (error) {
    console.error("\n[Error] Failed to verify logged-in account.");
    process.exit(1);
  }

  //--- specific to adc auth type
  if (AUTH_TYPE === "adc") {
    console.log("Initiating Application Default Credentials (ADC) login...");
    runCommandSync(
      `gcloud auth application-default login --scopes="${scopes}" ${clientFlag}`
    );
    runCommandSync(
      `gcloud auth application-default set-quota-project ${projectId}`
    );

    // --- Verification ---
    console.log("\nVerifying configuration...");

    const gcloudConfigDir =
      process.env.CLOUDSDK_CONFIG || path.join(os.homedir(), ".config", "gcloud");
    const activeConfigPath = path.join(gcloudConfigDir, "active_config");

    let currentConfig = "unknown";
    if (fs.existsSync(activeConfigPath)) {
      currentConfig = fs.readFileSync(activeConfigPath, "utf8").trim();
    } else {
      console.warn(
        `Warning: Could not find active_config file at ${activeConfigPath}`
      );
    }

    const currentProject = execSync("gcloud config get project", { shell: true })
      .toString()
      .trim();
    console.log(
      `Active config is ${currentConfig} - project is ${currentProject}`
    );
  }
  let sa_email = ""
  // -- specifc to dwd auth type
  if (AUTH_TYPE === "dwd") {
    console.log("Initiating keyless domain-wide delegation authentication...");
    const current_user = execSync("gcloud config get-value account", { shell: true })
      .toString()
      .trim();

    sa_email = `${GOOGLE_SERVICE_ACCOUNT_NAME}@${projectId}.iam.gserviceaccount.com`;
    console.log(`Service account email: ${sa_email}`);
    console.log(`Current user: ${current_user}`);

    // Service Account Lifecycle
    let existing_sa = false
    try {
      execSync(`gcloud iam service-accounts describe "${sa_email}"`, { shell: true });
      existing_sa = true;
    } catch (error) {
      /* ignore */
    }
    if (existing_sa) {
      const serviceAccountNameQuestion = {
        type: "select",
        name: "ROTATE_OR_REPLACE",
        message: "Select an action for the existing service account",
        initial: 0,
        choices: [
          { title: "Keep/rotate existing Service Account", value: "keep" },
          { title: "Replace/Recreate Service Account", value: "replace" },
        ],
      };

      const { ROTATE_OR_REPLACE } = await prompts(serviceAccountNameQuestion);
      if (ROTATE_OR_REPLACE === "replace") {
        console.log("Replacing existing service account...");
        runCommandSync(`gcloud iam service-accounts delete "${sa_email}" --quiet --format=none`);
        runCommandSync(`gcloud iam service-accounts create "${GOOGLE_SERVICE_ACCOUNT_NAME}" --display-name "${GOOGLE_SERVICE_ACCOUNT_NAME}" --quiet --format=none`);
      }
    } else {
      console.log("Creating new service account...");
      runCommandSync(`gcloud iam service-accounts create "${GOOGLE_SERVICE_ACCOUNT_NAME}" --display-name "${GOOGLE_SERVICE_ACCOUNT_NAME}" --quiet --format=none`);
    }

    // set service account permissions
    runCommandSync(`gcloud projects add-iam-policy-binding "${projectId}" --member="serviceAccount:${sa_email}" --role="roles/editor" --quiet --format=none`);
    runCommandSync(`gcloud iam service-accounts add-iam-policy-binding "${sa_email}" --member="serviceAccount:${sa_email}" --role="roles/iam.serviceAccountTokenCreator" --quiet --format=none`);
    runCommandSync(`gcloud iam service-accounts add-iam-policy-binding "${sa_email}" --member="user:${current_user}" --role="roles/iam.serviceAccountTokenCreator" --quiet --format=none`);
    runCommandSync(`gcloud projects add-iam-policy-binding "${projectId}" --member="serviceAccount:${sa_email}" --role="roles/logging.logWriter" --quiet --format=none`);

  }

  console.log("\nFetching token information...");
  const userToken = execSync("gcloud auth print-access-token", { shell: true })
    .toString()
    .trim();
  const appDefaultToken = execSync(
    "gcloud auth application-default print-access-token",
    { shell: true }
  )
    .toString()
    .trim();


  console.log("\n...user token scopes");
  runCommandSync(
    `curl https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${userToken}`
  );

  console.log("\n...application default token scopes");
  runCommandSync(
    `curl https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${appDefaultToken}`
  );
  console.log("\nAuthentication process finished.");

  if (AUTH_TYPE === "dwd") {
    const saUniqueId = execSync(`gcloud iam service-accounts describe "${sa_email}" --format="value(uniqueId)"`, { shell: true })
      .toString()
      .trim();
    console.log("\nNow you need to ensure that workspace admin console has the scopes and client ID added to Domain-Wide Delegation");
    console.log("Enter the following in Admin Console: https://admin.google.com/ac/owl/domainwidedelegation");
    console.log(`
      Client ID: ${saUniqueId}
      Scopes: ${scopes}
    `);
  }
}

/**
 * Handles the 'enableAPIs' command to enable or disable necessary Google Cloud services based on options.
 * @param {object} options Options object provided by commander.js.
 */
export function enableGoogleAPIs(options) {
  checkForGcloudCli();

  const API_SERVICES = {
    drive: "drive.googleapis.com",
    sheets: "sheets.googleapis.com",
    forms: "forms.googleapis.com",
    docs: "docs.googleapis.com",
    gmail: "gmail.googleapis.com",
    logging: "logging.googleapis.com",
    calendar: "calendar"
  };

  const servicesToEnable = new Set();
  const servicesToDisable = new Set();
  if (options.all || Object.keys(options).length === 0) {
    Object.values(API_SERVICES).forEach((service) =>
      servicesToEnable.add(service)
    );
  } else {
    for (const key in API_SERVICES) {
      if (options[`e${key}`]) {
        servicesToEnable.add(API_SERVICES[key]);
      }
      if (options[`d${key}`]) {
        servicesToDisable.add(API_SERVICES[key]);
      }
    }
  }
  if (servicesToEnable.size > 0) {
    const enableList = Array.from(servicesToEnable);
    console.log(`Enabling Google Cloud services: ${enableList.join(", ")}...`);
    runCommandSync(`gcloud services enable ${enableList.join(" ")}`);
    console.log("Services enabled successfully.");
  }
  if (servicesToDisable.size > 0) {
    const disableList = Array.from(servicesToDisable);
    console.log(
      `Disabling Google Cloud services: ${disableList.join(", ")}...`
    );
    runCommandSync(`gcloud services disable ${disableList.join(" ")}`);
    console.log("Services disabled successfully.");
  }
  if (
    servicesToEnable.size === 0 &&
    servicesToDisable.size === 0 &&
    Object.keys(options).length > 0 &&
    !options.all
  ) {
    console.log("No specific APIs were selected to enable or disable.");
    console.log(
      "Use '--all' to enable all default APIs, or specify flags like '--edrive' or '--ddrive'."
    );
  }
}
