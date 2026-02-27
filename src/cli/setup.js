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

  // --- Step 1: Select Platforms ---
  // If backends provided via CLI, use them, otherwise prompt
  let platforms = options.backends;
  if (!platforms || (Array.isArray(platforms) && platforms.length === 0)) {
    const platformSelection = await prompts({
      type: "multiselect",
      name: "platforms",
      message: "Select backends to initialize",
      choices: [
        { title: "Google Workspace", value: "google", selected: true },
        { title: "Infomaniak KSuite", value: "ksuite", selected: existingConfig.KSUITE_TOKEN ? true : false },
      ],
      hint: "- Use space to select/deselect. Press Enter to submit.",
    });

    if (typeof platformSelection.platforms === "undefined" || platformSelection.platforms.length === 0) {
      console.log("Initialization cancelled. At least one platform must be selected.");
      return;
    }
    platforms = platformSelection.platforms;
  }
  
  if (typeof platforms === "string") platforms = platforms.split(",");
  responses.GF_PLATFORM_AUTH = platforms.join(",");

  // --- Step 2: Google Workspace Configuration ---
  if (platforms.includes("google")) {
    console.log("\n--- Configuring Google Workspace backend ---");

    // If authType is provided via CLI, use it directly, otherwise prompt
    if (options.authType) {
      console.log(`...using specified auth type: ${options.authType.toUpperCase()}`);
      responses.AUTH_TYPE = options.authType;
    } else {
      const authTypeResponse = await prompts({
        type: "select",
        name: "AUTH_TYPE",
        message: "Select Google authentication type",
        choices: [
          { title: "Domain-Wide Delegation (DWD)", value: "dwd", description: "Best for service-to-service with full user impersonation" },
          { title: "Application Default Credentials (ADC)", value: "adc", description: "Standard gcloud-based auth" },
        ],
        initial: existingConfig.AUTH_TYPE === "adc" ? 1 : 0,
      });

      if (typeof authTypeResponse.AUTH_TYPE === "undefined") {
        console.log("Initialization cancelled.");
        return;
      }
      responses.AUTH_TYPE = authTypeResponse.AUTH_TYPE;
    }

    // Discover Scopes from appsscript.json
    const manifestPath = path.resolve(process.cwd(), "appsscript.json");
    let manifestScopes = [];
    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
        manifestScopes = manifest.oauthScopes || [];
        console.log(`...discovered ${manifestScopes.length} scopes in appsscript.json`);
      } catch (err) {
        console.warn("...warning: failed to parse appsscript.json. Using default scopes only.");
      }
    } else {
      console.log("...appsscript.json not found. Using default scopes only.");
    }

    const DEFAULT_SCOPES_VALUES = [
      "https://www.googleapis.com/auth/userinfo.email",
      "openid",
      "https://www.googleapis.com/auth/cloud-platform",
    ];
    responses.DEFAULT_SCOPES = DEFAULT_SCOPES_VALUES.join(",");
    responses.EXTRA_SCOPES = manifestScopes
      .filter(s => !DEFAULT_SCOPES_VALUES.includes(s))
      .join(",");

    const googleQuestions = [
      {
        type: "text",
        name: "GOOGLE_CLOUD_PROJECT",
        message: "Enter your GCP Project ID",
        initial: existingConfig.GOOGLE_CLOUD_PROJECT || existingConfig.GCP_PROJECT_ID || "",
      },
      {
        type: responses.AUTH_TYPE === "dwd" ? "text" : null,
        name: "GOOGLE_SERVICE_ACCOUNT_NAME",
        message: "Enter service account name for DWD",
        initial: existingConfig.GOOGLE_SERVICE_ACCOUNT_NAME || "gas-fakes-sa",
      },
      {
        type: responses.AUTH_TYPE === "adc" ? "text" : null,
        name: "CLIENT_CREDENTIAL_FILE",
        message: "Enter path to OAuth client credentials JSON (optional, required for restricted scopes)",
        initial: existingConfig.CLIENT_CREDENTIAL_FILE || "",
      }
    ];

    const googleResponses = await prompts(googleQuestions);
    if (typeof googleResponses.GOOGLE_CLOUD_PROJECT === "undefined") {
      console.log("Initialization cancelled.");
      return;
    }
    Object.assign(responses, googleResponses);
  }

  // --- Step 3: Infomaniak KSuite Configuration ---
  if (platforms.includes("ksuite")) {
    console.log("\n--- Configuring Infomaniak KSuite backend ---");
    const ksuiteQuestions = [
      {
        type: "password",
        name: "KSUITE_TOKEN",
        message: "Enter your Infomaniak API Token",
        initial: existingConfig.KSUITE_TOKEN || "",
      },
      {
        type: "text",
        name: "KSUITE_EMAIL",
        message: "Enter your Infomaniak user email",
        initial: existingConfig.KSUITE_EMAIL || "",
      }
    ];
    const ksuiteResponses = await prompts(ksuiteQuestions);
    if (typeof ksuiteResponses.KSUITE_TOKEN === "undefined") {
      console.log("Initialization cancelled.");
      return;
    }
    Object.assign(responses, ksuiteResponses);
  }

  // --- Step 4: Shared Remaining Config ---
  const remainingQuestions = [
    {
      type: "toggle",
      name: "QUIET",
      message: "Run gas-fakes in quiet mode?",
      initial: existingConfig.QUIET === "true" ? true : false,
    },
    {
      type: "select",
      name: "LOG_DESTINATION",
      message: "Logging destination",
      choices: [
        { title: "CONSOLE", value: "CONSOLE" },
        { title: "CLOUD", value: "CLOUD" },
        { title: "BOTH", value: "BOTH" },
        { title: "NONE", value: "NONE" },
      ],
      initial: ["CONSOLE", "CLOUD", "BOTH", "NONE"].indexOf(existingConfig.LOG_DESTINATION) > -1
          ? ["CONSOLE", "CLOUD", "BOTH", "NONE"].indexOf(existingConfig.LOG_DESTINATION)
          : 0,
    },
    {
      type: "select",
      name: "STORE_TYPE",
      message: "Internal storage type",
      choices: [
        { title: "FILE (local)", value: "FILE" },
        { title: "UPSTASH (Redis)", value: "UPSTASH" },
      ],
      initial: ["FILE", "UPSTASH"].indexOf(existingConfig.STORE_TYPE?.toUpperCase()) > -1
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
      console.log("Initialization cancelled.");
      return;
    }
    Object.assign(responses, upstashResponses);
  }

  // --- Confirmation and Saving ---
  console.log("\n------------------ Summary ------------------");
  Object.entries(responses).forEach(([key, value]) => {
    if (value !== undefined) console.log(`${key}: ${key.includes('TOKEN') ? '********' : value}`);
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

  console.log(`Writing configuration to "${envPath}"...`);
  const finalConfig = { ...existingConfig, ...responses };
  if (responses.STORE_TYPE !== "UPSTASH") {
    finalConfig.UPSTASH_REDIS_REST_TOKEN = "";
    finalConfig.UPSTASH_REDIS_REST_URL = "";
  }

  const envContent = Object.keys(finalConfig)
    .map((key) => `${key}="${(finalConfig[key] || "").toString().trim()}"`)
    .join("\n");

  fs.writeFileSync(envPath, envContent + "\n", "utf8");
  console.log("Setup complete. Your .env file has been updated.");
}

/**
 * Handles the 'auth' command to authenticate with configured backends.
 */
export async function authenticateUser(options = {}) {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    console.error(`Error: .env file not found at '${envPath}'`);
    process.exit(1);
  }
  dotenv.config({ path: envPath, quiet: true });

  let platforms = (process.env.GF_PLATFORM_AUTH || "google").split(",");
  
  // If specific backend requested via CLI, only auth that one
  if (options.backend) {
    platforms = [options.backend];
  }

  for (const platform of platforms) {
    if (platform === "ksuite") {
      console.log("\n--- Validating KSuite Token ---");
      if (!process.env.KSUITE_TOKEN) {
        console.error("Error: KSUITE_TOKEN not found in .env.");
        continue;
      }
      // Simple length/format check for now
      if (process.env.KSUITE_TOKEN.length < 20) {
        console.error("Error: KSUITE_TOKEN appears invalid.");
      } else {
        console.log("KSuite token format validated.");
      }
    }

    if (platform === "google") {
      console.log("\n--- Authenticating Google Workspace ---");
      await checkForGcloudCli();
      
      const {
        GOOGLE_CLOUD_PROJECT,
        DEFAULT_SCOPES,
        EXTRA_SCOPES,
        CLIENT_CREDENTIAL_FILE,
        AC,
        AUTH_TYPE,
        GOOGLE_SERVICE_ACCOUNT_NAME
      } = process.env;

      const projectId = GOOGLE_CLOUD_PROJECT;
      if (!projectId) {
        console.error("Error: GOOGLE_CLOUD_PROJECT is not set.");
        continue;
      }

      const scopes = Array.from(new Set([
        ...(DEFAULT_SCOPES || "").split(","),
        ...(EXTRA_SCOPES || "").split(","),
      ])).filter(s => s).join(",");

      console.log(`...requesting scopes: ${scopes}`);

      const driveAccessFlag = "--enable-gdrive-access";
      const activeConfig = AC || "default";

      if (AUTH_TYPE === "adc") {
        let clientFlag = "";
        if (CLIENT_CREDENTIAL_FILE) {
          const clientPath = path.resolve(process.cwd(), CLIENT_CREDENTIAL_FILE);
          if (fs.existsSync(clientPath)) clientFlag = `--client-id-file="${clientPath}"`;
        }

        console.log("Revoking previous ADC credentials...");
        try { execSync("gcloud auth application-default revoke --quiet", { stdio: "ignore", shell: true }); } catch (e) {}

        console.log(`Setting up gcloud config: ${activeConfig}`);
        try { execSync(`gcloud config configurations describe "${activeConfig}"`, { stdio: "ignore", shell: true }); } 
        catch (e) { runCommandSync(`gcloud config configurations create "${activeConfig}"`); }
        runCommandSync(`gcloud config configurations activate "${activeConfig}"`);
        
        runCommandSync(`gcloud config set project ${projectId}`);
        runCommandSync(`gcloud config set billing/quota_project ${projectId}`);
        
        console.log("Logging in...");
        runCommandSync(`gcloud auth login ${driveAccessFlag}`);
        
        console.log("Setting up ADC...");
        runCommandSync(`gcloud auth application-default login --scopes="${scopes}" ${clientFlag}`);
        runCommandSync(`gcloud auth application-default set-quota-project ${projectId}`);
      }

      if (AUTH_TYPE === "dwd") {
        const current_user = execSync("gcloud config get-value account", { shell: true }).toString().trim();
        const sa_email = `${GOOGLE_SERVICE_ACCOUNT_NAME}@${projectId}.iam.gserviceaccount.com`;
        
        console.log(`...service account: ${sa_email}`);
        
        let sa_exists = false;
        try { execSync(`gcloud iam service-accounts describe "${sa_email}"`, { stdio: "ignore", shell: true }); sa_exists = true; } catch (e) {}

        if (!sa_exists) {
          console.log(`...creating service account: ${GOOGLE_SERVICE_ACCOUNT_NAME}`);
          runCommandSync(`gcloud iam service-accounts create "${GOOGLE_SERVICE_ACCOUNT_NAME}" --display-name "${GOOGLE_SERVICE_ACCOUNT_NAME}"`);
        }

        console.log("...applying IAM permissions");
        runCommandSync(`gcloud projects add-iam-policy-binding "${projectId}" --member="serviceAccount:${sa_email}" --role="roles/editor" --quiet`, true);
        runCommandSync(`gcloud iam service-accounts add-iam-policy-binding "${sa_email}" --member="serviceAccount:${sa_email}" --role="roles/iam.serviceAccountTokenCreator" --quiet`, true);
        runCommandSync(`gcloud iam service-accounts add-iam-policy-binding "${sa_email}" --member="user:${current_user}" --role="roles/iam.serviceAccountTokenCreator" --quiet`, true);
        
        const saUniqueId = execSync(`gcloud iam service-accounts describe "${sa_email}" --format="value(uniqueId)"`, { shell: true }).toString().trim();
        console.log(`\n\x1b[1;33m************************************************************************`);
        console.log(`IMPORTANT: Add this to Admin Console (Domain-Wide Delegation):`);
        console.log(`************************************************************************\x1b[0m`);
        console.log(`URL: https://admin.google.com/ac/owl/domainwidedelegation`);
        console.log(`Client ID: ${saUniqueId}\nScopes: ${scopes}`);
      }
    }
  }

  console.log("\n--- All requested authentications completed ---");
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
