import prompts from "prompts";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "node:crypto";
import { execSync } from "child_process";
import { checkForGcloudCli, runCommandSync, runCommandWithRetrySync } from "./utils.js";
import { getMsGraphToken, mapGasScopesToMsGraph } from "../support/msgraph/msauth.js";

// --- Utility Functions ---

/**
 * Retrieves the scriptId and its source.
 * @returns {{scriptId: string, source: string}}
 */
function getScriptIdInfo() {
  if (process.env.GF_SCRIPT_ID) {
    return { scriptId: process.env.GF_SCRIPT_ID, source: "env (GF_SCRIPT_ID)" };
  }

  const claspPath = process.env.GF_CLASP_PATH || "./.clasp.json";
  if (fs.existsSync(claspPath)) {
    try {
      const clasp = JSON.parse(fs.readFileSync(claspPath, "utf8"));
      if (clasp.scriptId) {
        return { scriptId: clasp.scriptId, source: `clasp (${claspPath})` };
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }

  return { scriptId: "not set (will be random at runtime)", source: "none" };
}

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
  console.log("...gas-fakes init starting");
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
    const currentPlatforms = existingConfig.GF_PLATFORM_AUTH || "google";
    const platformSelection = await prompts({
      type: "multiselect",
      name: "platforms",
      message: "Select backends to initialize",
      choices: [
        {
          title: "Google Workspace",
          value: "google",
          selected: currentPlatforms.includes("google")
        },
        {
          title: "Microsoft Graph (Office 365)",
          value: "msgraph",
          selected: currentPlatforms.includes("msgraph")
        },
        {
          title: "Infomaniak KSuite",
          value: "ksuite",
          selected: currentPlatforms.includes("ksuite")
        },
        {
          title: "Coda",
          value: "coda",
          selected: currentPlatforms.includes("coda")
        },
      ],
      hint: "- Use space to select/deselect. Press Enter to submit.",
    });

    if (typeof platformSelection.platforms === "undefined" || platformSelection.platforms.length === 0) {
      console.log("Initialization cancelled. At least one platform must be selected.");
      return;
    }
    platforms = platformSelection.platforms;
  }

  // Normalize platforms to an array of individual strings
  if (typeof platforms === "string") platforms = platforms.split(",");
  if (Array.isArray(platforms)) {
    platforms = platforms.flatMap(p => p.split(",")).map(p => p.trim());
  }

  responses.GF_PLATFORM_AUTH = (platforms || []).join(",");
  console.log(`...active backends: ${responses.GF_PLATFORM_AUTH}`);

  // --- Step 2: Gas-Fakes Behavior Configuration ---
  console.log("\n--- Configuring Gas-Fakes paths and behavior ---");
  const gasFakesQuestions = [
    {
      type: "text",
      name: "GF_MANIFEST_PATH",
      message: "Path to appsscript.json",
      initial: existingConfig.GF_MANIFEST_PATH || "./appsscript.json",
    },
    {
      type: "text",
      name: "GF_CLASP_PATH",
      message: "Path to .clasp.json",
      initial: existingConfig.GF_CLASP_PATH || "./.clasp.json",
    },
    {
      type: "text",
      name: "GF_SCRIPT_ID",
      message: (prev, values) => {
        const claspPath = values.GF_CLASP_PATH || "./.clasp.json";
        let hint = "";
        if (fs.existsSync(claspPath)) {
          try {
            const clasp = JSON.parse(fs.readFileSync(claspPath, "utf8"));
            if (clasp.scriptId) {
              hint = ` (found in ${claspPath}: ${clasp.scriptId})`;
            }
          } catch (e) { }
        }
        if (!hint && !existingConfig.GF_SCRIPT_ID) {
          hint = " (no ID found; a random one will be generated)";
        }
        return `Script ID (optional, overrides .clasp.json)${hint}`;
      },
      initial: (prev, values) => {
        if (existingConfig.GF_SCRIPT_ID) return existingConfig.GF_SCRIPT_ID;
        const claspPath = values.GF_CLASP_PATH || "./.clasp.json";
        if (fs.existsSync(claspPath)) {
          try {
            const clasp = JSON.parse(fs.readFileSync(claspPath, "utf8"));
            if (clasp.scriptId) return clasp.scriptId;
          } catch (e) { }
        }
        return randomUUID();
      },
    },
    {
      type: "text",
      name: "GF_DOCUMENT_ID",
      message: "Document ID (optional, for container-bound scripts)",
      initial: existingConfig.GF_DOCUMENT_ID || "",
    },
    {
      type: "text",
      name: "GF_CACHE_PATH",
      message: "Cache storage path",
      initial: existingConfig.GF_CACHE_PATH || "/tmp/gas-fakes/cache",
    },
    {
      type: "text",
      name: "GF_PROPERTIES_PATH",
      message: "Properties storage path",
      initial: existingConfig.GF_PROPERTIES_PATH || "/tmp/gas-fakes/properties",
    },
    {
      type: "number",
      name: "GF_SERVER_PORT",
      message: "Port for local web server (doGet/doPost)",
      initial: parseInt(existingConfig.GF_SERVER_PORT) || 8080,
    },
    {
      type: "text",
      name: "TOGAS_TARGET",
      message: "Togas: Target directory for clasp project (e.g., ../testongas)",
      initial: existingConfig.TOGAS_TARGET || "../testongas",
    },
    {
      type: "text",
      name: "TOGAS_SCRIPT_ID",
      message: "Togas: Script ID for the target clasp project",
      initial: existingConfig.TOGAS_SCRIPT_ID || existingConfig.GF_SCRIPT_ID || "",
    },
    {
      type: "text",
      name: "TOGAS_PATTERN",
      message: "Togas: Comma-separated glob patterns for files to include (e.g. abc*,xyz*)",
      initial: existingConfig.TOGAS_PATTERN || "*",
    }
  ];

  const gasFakesResponses = await prompts(gasFakesQuestions);
  if (typeof gasFakesResponses.GF_MANIFEST_PATH === "undefined") {
    console.log("Initialization cancelled.");
    return;
  }
  Object.assign(responses, gasFakesResponses);

  // Discover Scopes from appsscript.json (Shared across backends)
  const manifestPath = path.resolve(process.cwd(), responses.GF_MANIFEST_PATH);
  let manifestScopes = [];
  let manifestHasCloudSql = false;
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      manifestScopes = manifest.oauthScopes || [];
      console.log(`...discovered ${manifestScopes.length} scopes in ${responses.GF_MANIFEST_PATH}`);
      
      // Check for JDBC or Cloud SQL usage (simplified check)
      const manifestContent = fs.readFileSync(manifestPath, "utf8");
      if (manifestContent.includes("jdbc:google:") || manifestContent.includes("Jdbc.")) {
        manifestHasCloudSql = true;
      }
    } catch (err) {
      console.warn(`...warning: failed to parse ${responses.GF_MANIFEST_PATH}.`);
    }
  }

  // --- Step 2.5: Database & Cloud SQL Proxy Configuration ---
  const hasJdbc = manifestHasCloudSql || Object.keys(existingConfig).some(k => k.includes("DATABASE_URL"));
  if (hasJdbc) {
    console.log("\n--- Configuring Database & Cloud SQL Auth Proxy ---");
    
    // Check if proxy is installed
    let proxyInstalled = false;
    try {
      execSync("cloud-sql-proxy --version", { stdio: "ignore" });
      proxyInstalled = true;
    } catch (e) {
      // not installed or not in path
    }

    if (!proxyInstalled) {
      console.log("\x1b[1;33mNotice: Cloud SQL Auth Proxy is not installed or not in your PATH.\x1b[0m");
      console.log("If you plan to test Google Cloud SQL locally, please install it:");
      console.log("  - macOS (Homebrew): brew install google-cloud-sdk");
      console.log("    then: gcloud components install cloud-sql-proxy");
      console.log("  - Other: https://cloud.google.com/sql/docs/postgres/sql-proxy#install\n");
    }

    const dbQuestions = [
      {
        type: "toggle",
        name: "GF_USE_CLOUD_PG_SQL_PROXY",
        message: "Use Cloud SQL Auth Proxy for local database connections?",
        initial: existingConfig.GF_USE_CLOUD_PG_SQL_PROXY === "true",
        active: "yes",
        inactive: "no"
      }
    ];

    const dbResponses = await prompts(dbQuestions);
    Object.assign(responses, dbResponses);
  }

  // --- Step 3: Google Workspace Configuration ---
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

    const DEFAULT_SCOPES_VALUES = [
      "https://www.googleapis.com/auth/userinfo.email",
      "openid",
      "https://www.googleapis.com/auth/cloud-platform",
    ];
    responses.DEFAULT_SCOPES = DEFAULT_SCOPES_VALUES.join(",");

    let extraScopes = manifestScopes.filter(s => !DEFAULT_SCOPES_VALUES.includes(s));

    // Restricted scopes that trigger blocks for the default 'well-known' ADC client ID
    const restrictedMatch = (s) =>
      s.includes("auth/drive") ||
      s.includes("auth/spreadsheets") ||
      s.includes("auth/documents") ||
      s.includes("auth/forms") ||
      s.includes("auth/presentations") ||
      s.includes("auth/script.external_request");

    if (responses.AUTH_TYPE === "adc" && !responses.CLIENT_CREDENTIAL_FILE) {
      const toSkip = extraScopes.filter(restrictedMatch);
      if (toSkip.length > 0) {
        console.log(`\n\x1b[1;33mWarning: ADC requested with Workspace scopes (${toSkip.map(s => s.split("/").pop()).join(", ")}). Google now blocks these scopes when using the default gcloud CLI client ID. You MUST provide a custom OAuth client credential file.\x1b[0m`);
      }
    }

    responses.EXTRA_SCOPES = extraScopes.join(",");

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
        message: "Enter path to OAuth client credentials JSON (optional, required for Workspace scopes with ADC)",
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

  // --- Step 3.5: Microsoft Graph Configuration ---
  if (platforms.includes("msgraph")) {
    console.log("\n--- Configuring Microsoft Graph backend ---");

    const msGraphNamePrompt = await prompts({
      type: "text",
      name: "MS_GRAPH_APP_NAME",
      message: "Enter the name for your Microsoft App Registration",
      initial: existingConfig.MS_GRAPH_APP_NAME || "gas-fakes-ms-sa",
    });

    if (typeof msGraphNamePrompt.MS_GRAPH_APP_NAME === "undefined") {
      console.log("Initialization cancelled.");
      return;
    }
    responses.MS_GRAPH_APP_NAME = msGraphNamePrompt.MS_GRAPH_APP_NAME;

    // --- Account Type Prompt ---
    const msAccountType = await prompts({
      type: "select",
      name: "type",
      message: "What type of Microsoft account are you using?",
      choices: [
        { title: "Consumer (Personal, Outlook.com, Hotmail, etc.)", value: "consumers" },
        { title: "Business/Education (Work or School) ", value: "organizations" },
        { title: "Standard Multi-tenant", value: "common" }
      ],
      initial: existingConfig.MS_GRAPH_TENANT_ID === "organizations" ? 1 : (existingConfig.MS_GRAPH_TENANT_ID === "common" ? 2 : 0)
    });

    if (typeof msAccountType.type === "undefined") {
      console.log("Initialization cancelled.");
      return;
    }
    responses.MS_GRAPH_TENANT_ID = msAccountType.type;

    // --- Dynamic Discovery and Creation ---
    let discoveredClientId = "";
    console.log(`...searching Azure for '${responses.MS_GRAPH_APP_NAME}' registration`);
    try {
      const filter = `displayName eq '${responses.MS_GRAPH_APP_NAME}'`;
      const cmd = `az ad app list --filter "${filter}" --query "[0].appId" -o tsv`;
      const result = execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'], shell: true }).toString().trim();

      if (result && result !== 'None' && result !== 'null') {
        discoveredClientId = result;
        console.log(`...found existing registration: ${discoveredClientId}`);
      } else {
        // Offer to create it
        const confirmCreate = await prompts({
          type: "confirm",
          name: "create",
          message: `App Registration '${responses.MS_GRAPH_APP_NAME}' not found. Would you like to create it now?`,
          initial: true,
        });

        if (confirmCreate.create) {
          console.log(`...creating '${responses.MS_GRAPH_APP_NAME}' as a Multitenant App`);
          const createCmd = `az ad app create --display-name "${responses.MS_GRAPH_APP_NAME}" --public-client-redirect-uris "http://localhost" --sign-in-audience "AzureADandPersonalMicrosoftAccount" --query "appId" -o tsv`;
          discoveredClientId = execSync(createCmd, { shell: true }).toString().trim();

          if (discoveredClientId) {
            console.log(`...created successfully! Client ID: ${discoveredClientId}`);
            console.log("...waiting 5s for Azure propagation...");
            execSync('sleep 5', { shell: true });

            console.log("...discovering API permission IDs from Microsoft Graph");
            try {
              // Dynamically find the permission IDs for this environment
              const graphId = "00000003-0000-0000-c000-000000000000";
              const spCmd = `az ad sp show --id ${graphId} --query "oauth2PermissionScopes[?value=='Files.ReadWrite.All' || value=='User.Read' || value=='Mail.ReadWrite' || value=='Calendars.ReadWrite' || value=='offline_access' || value=='openid' || value=='profile' || value=='email'].{id:id, value:value}" -o json`;
              const scopes = JSON.parse(execSync(spCmd, { shell: true }).toString());

              if (scopes && scopes.length > 0) {
                const resourceAccess = scopes.map(s => ({ id: s.id, type: "Scope" }));
                const requiredAccess = [{
                  resourceAppId: graphId,
                  resourceAccess
                }];

                const tempFile = path.join(os.tmpdir(), `ms-perms-${randomUUID()}.json`);
                fs.writeFileSync(tempFile, JSON.stringify(requiredAccess));

                execSync(`az ad app update --id ${discoveredClientId} --required-resource-access @${tempFile}`, { shell: true });
                console.log(`...successfully assigned ${scopes.length} permissions: ${scopes.map(s => s.value).join(', ')}`);
                if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
              }
            } catch (e) {
              console.error(`...failed to dynamically assign permissions: ${e.message}`);
              console.warn("...attempting fallback to standard IDs...");
              // (Keep the previous fallback logic here if discovery fails entirely)
            }
          }
        }
      }
    } catch (e) {
      console.warn("...warning: Azure CLI discovery failed. Please ensure 'az login' has been run.");
    }

    const msgraphQuestions = [
      {
        type: "text",
        name: "MS_GRAPH_CLIENT_ID",
        message: "Microsoft Client ID (discovered or provided)",
        initial: discoveredClientId || existingConfig.MS_GRAPH_CLIENT_ID || "",
      }
    ];
    const msgraphResponses = await prompts(msgraphQuestions);
    if (typeof msgraphResponses.MS_GRAPH_CLIENT_ID === "undefined") {
      console.log("Initialization cancelled.");
      return;
    }
    Object.assign(responses, msgraphResponses);
  }

  // --- Step 4: Infomaniak KSuite Configuration ---
  if (platforms.includes("ksuite")) {
    console.log("\n--- Configuring Infomaniak KSuite backend ---");
    const ksuiteQuestions = [
      {
        type: "password",
        name: "KSUITE_TOKEN",
        message: "Enter your Infomaniak API Token",
        initial: existingConfig.KSUITE_TOKEN || "",
      }
    ];
    const ksuiteResponses = await prompts(ksuiteQuestions);
    if (typeof ksuiteResponses.KSUITE_TOKEN === "undefined") {
      console.log("Initialization cancelled.");
      return;
    }
    Object.assign(responses, ksuiteResponses);
  }

  // --- Step 4.5: Coda Configuration ---
  if (platforms.includes("coda")) {
    console.log("\n--- Configuring Coda backend ---");
    const codaQuestions = [
      {
        type: "password",
        name: "CODA_API_KEY",
        message: "Enter your Coda API Key",
        initial: existingConfig.CODA_API_KEY || "",
      }
    ];
    const codaResponses = await prompts(codaQuestions);
    if (typeof codaResponses.CODA_API_KEY === "undefined") {
      console.log("Initialization cancelled.");
      return;
    }
    Object.assign(responses, codaResponses);
  }

  // --- Step 5: Shared Remaining Config ---
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
  if (!platforms.includes("coda")) {
    finalConfig.CODA_API_KEY = "";
  }

  const envContent = Object.keys(finalConfig)
    .map((key) => `${key}="${(finalConfig[key] || "").toString().trim()}"`)
    .join("\n");

  fs.writeFileSync(envPath, envContent + "\n", "utf8");
  console.log("Setup complete. Your .env file has been updated.");

  // --- Skill Installation Hint ---
  console.log("\n--- Gemini CLI Integration ---");
  const skillResponse = await prompts({
    type: "confirm",
    name: "installSkills",
    message: "Would you like to install the gas-fakes skills for Gemini CLI?",
    initial: true,
  });

  if (skillResponse.installSkills) {
    console.log("Installing Gemini CLI skills and MCP server...");
    let manualSkillCmd;
    try {
      // 1. Install or link the agent skill
      let skillCmd;
      const gfAgentSubdir = path.resolve(process.cwd(), "gf_agent", "SKILL.md");
      const gfAgentCurrent = path.resolve(process.cwd(), "SKILL.md");

      if (fs.existsSync(gfAgentSubdir)) {
        console.log("Detected local gas-fakes repository. Linking local skill for development...");
        skillCmd = "gemini skills link ./gf_agent --consent";
        manualSkillCmd = "1. gemini skills link ./gf_agent";
        execSync(skillCmd, { stdio: ["ignore", "pipe", "ignore"] });
        console.log("Skill linked successfully.");
      } else if (fs.existsSync(gfAgentCurrent) && fs.existsSync(path.resolve(process.cwd(), "index.md"))) {
        console.log("Detected local gf_agent directory. Linking local skill for development...");
        skillCmd = "gemini skills link . --consent";
        manualSkillCmd = "1. gemini skills link .";
        execSync(skillCmd, { stdio: ["ignore", "pipe", "ignore"] });
        console.log("Skill linked successfully.");
      } else {
        // Not a local clone, check if already installed to avoid overwriting
        let isAlreadyInstalled = false;
        try {
          const existingSkills = execSync("gemini skills list", {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
          });
          if (existingSkills.includes("gf_agent")) {
            isAlreadyInstalled = true;
          }
        } catch (err) {
          // Ignore errors checking skills list
        }

        if (isAlreadyInstalled) {
          console.log("gf_agent skill is already installed. Skipping remote installation.");
          manualSkillCmd = "1. gemini skills update gf_agent (if needed)";
        } else {
          const installChoice = await prompts({
            type: "select",
            name: "method",
            message: "How would you like to install the gf_agent skill?",
            choices: [
              {
                title: "Global (Standard)",
                value: "global",
                description: "Recommended for most users. Installs a read-only copy globally.",
              },
              {
                title: "Local Standalone (Contributor)",
                value: "local",
                description: "Installs a local sparse-clone for skill development and linking.",
              },
            ],
            initial: 0,
          });

          if (installChoice.method === "local") {
            const standaloneDir = "gf_agent_standalone";
            const fullStandalonePath = path.resolve(process.cwd(), standaloneDir);
            console.log(`Setting up local standalone skill environment in "./${standaloneDir}"...`);

            try {
              if (!fs.existsSync(fullStandalonePath)) {
                fs.mkdirSync(fullStandalonePath, { recursive: true });
                execSync("git init", { cwd: fullStandalonePath, stdio: "ignore" });
                execSync("git remote add origin https://github.com/brucemcpherson/gas-fakes.git", {
                  cwd: fullStandalonePath,
                  stdio: "ignore",
                });
                execSync("git config core.sparseCheckout true", { cwd: fullStandalonePath, stdio: "ignore" });

                const sparsePath = path.join(fullStandalonePath, ".git", "info", "sparse-checkout");
                fs.writeFileSync(sparsePath, "gf_agent/*\n");
              }

              execSync("git pull origin main", { cwd: fullStandalonePath, stdio: "ignore" });

              skillCmd = "gemini skills link ./gf_agent --consent";
              execSync(skillCmd, { cwd: fullStandalonePath, stdio: ["ignore", "pipe", "ignore"] });
              console.log("Skill linked successfully.");

              manualSkillCmd = `1. cd ${standaloneDir} && gemini skills link ./gf_agent`;
            } catch (gitErr) {
              console.error(`Error during local setup: ${gitErr.message}`);
              throw gitErr;
            }
          } else {
            skillCmd = "gemini skills install https://github.com/brucemcpherson/gas-fakes.git --path gf_agent --consent";
            manualSkillCmd = "1. gemini skills install https://github.com/brucemcpherson/gas-fakes.git --path gf_agent";
            console.log(`Installing global skill from remote...`);
            execSync(skillCmd, { stdio: ["ignore", "pipe", "ignore"] });
            console.log("Skill installed successfully.");
          }
        }
      }

      // 2. Add the MCP server
      const mcpCmd = "gemini mcp add --scope project gas-fakes-mcp gas-fakes mcp";
      console.log(`Executing: ${mcpCmd}`);
      execSync(mcpCmd, { stdio: "inherit" });

      console.log("\x1b[1;32mInstallation complete!\x1b[0m");
      console.log("\nYou can now use natural language to automate tasks:");
      console.log("   \x1b[1;33m\“Create a sheet called ‘Todays drive files' and add any files on Drive modified today to it\"\x1b[0m");
    } catch (err) {
      console.error(`\x1b[1;31mError during Gemini installation: ${err.message}\x1b[0m`);
      console.log("You may need to install them manually:");
      console.log(manualSkillCmd);
      console.log("2. gemini mcp add --scope project gas-fakes-mcp gas-fakes mcp");
    }
  } else {
    console.log("Skipping Gemini CLI integration.");
  }
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

  const { scriptId, source } = getScriptIdInfo();
  console.log(`...using scriptId: ${scriptId} (source: ${source})`);

  let platforms;

  // If specific backend(s) requested via CLI, use them
  if (options.backend) {
    // Handle both single string and array of strings (from commander <string...>)
    const rawBackends = Array.isArray(options.backend) ? options.backend : [options.backend];
    platforms = rawBackends.flatMap(p => p.split(",")).map(p => p.trim());
  } else {
    // Default to all platforms in GF_PLATFORM_AUTH, or just 'google' if not set
    platforms = (process.env.GF_PLATFORM_AUTH || "google").split(",").map(p => p.trim());
  }

  for (const platform of platforms) {
    if (platform === "coda") {
      console.log("\n--- Validating Coda API Key ---");
      if (!process.env.CODA_API_KEY) {
        console.error("Error: CODA_API_KEY not found in .env.");
        continue;
      }
      if (process.env.CODA_API_KEY.length < 10) {
        console.error("Error: CODA_API_KEY appears invalid (too short).");
      } else {
        console.log("Coda API Key format validated.");
      }
    }

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

    if (platform === "msgraph") {
      console.log("\n--- Authenticating Microsoft Graph ---");

      const gasScopes = Array.from(new Set([
        ...(process.env.DEFAULT_SCOPES || "").split(","),
        ...(process.env.EXTRA_SCOPES || "").split(","),
      ])).filter(s => s);

      const msScopes = mapGasScopesToMsGraph(gasScopes);

      try {
        const tenantId = process.env.MS_GRAPH_TENANT_ID || 'consumers';
        const azCmd = `az config set core.login_experience_v2=off && az login --allow-no-subscriptions --output none`;

        console.log(`Executing: ${azCmd}`);
        try {
          runCommandSync(azCmd);
          console.log(`\n\x1b[1;32mSuccess!\x1b[0m Azure CLI session discovered.`);
          console.log(`Silent fallback is now enabled for: \x1b[1;36m${tenantId}\x1b[0m`);
        } catch (e) {
          console.error(`\x1b[1;31mAzure CLI Login failed.\x1b[0m`);
          process.exit(1);
        }

        console.log(`...checking authentication status and fetching Graph token...`);
        process.env.GF_AUTH_FLOW = 'true';
        const token = await getMsGraphToken(msScopes);
        console.log("Successfully authenticated with Microsoft Graph.");

        // Diagnostic: Get user info and drive info
        const { MsGraph } = await import('../support/msgraph/msclient.js');
        const msGraph = new MsGraph(token);
        const me = await msGraph.getMe();
        const drive = await msGraph.getDrive();
        console.log(`...Connected as: ${me.displayName} (${me.userPrincipalName || me.mail})`);
        console.log(`...Primary Drive ID: ${drive.id} (Type: ${drive.driveType})`);

      } catch (err) {
        console.error(`Microsoft Graph authentication failed: ${err.message}`);
        process.exit(1);
      }
    }

    if (platform === "google") {
      console.log("\n--- Authenticating Google Workspace ---");
      await checkForGcloudCli();

      const {
        GOOGLE_CLOUD_PROJECT,
        GCP_PROJECT_ID,
        DEFAULT_SCOPES,
        EXTRA_SCOPES,
        CLIENT_CREDENTIAL_FILE,
        AC,
        AUTH_TYPE,
        GOOGLE_SERVICE_ACCOUNT_NAME
      } = process.env;

      const projectId = GOOGLE_CLOUD_PROJECT || GCP_PROJECT_ID;
      if (!projectId) {
        console.error("Error: Project ID not set. Please run 'gas-fakes init' first.");
        continue;
      }

      const scopes = Array.from(new Set([
        ...(DEFAULT_SCOPES || "").split(","),
        ...(EXTRA_SCOPES || "").split(","),
      ])).filter(s => s).join(",");

      let adcScopes = AUTH_TYPE === "dwd" 
        ? Array.from(new Set((DEFAULT_SCOPES || "").split(","))).filter(s => s).join(",")
        : scopes;

      const hasClientId = CLIENT_CREDENTIAL_FILE && fs.existsSync(path.resolve(process.cwd(), CLIENT_CREDENTIAL_FILE));
      if (AUTH_TYPE !== "dwd" && !hasClientId) {
        const scopeList = adcScopes.split(",");
        const workspaceScopes = scopeList.filter(s => 
          s.includes("auth/drive") || 
          s.includes("auth/spreadsheets") || 
          s.includes("auth/documents") || 
          s.includes("auth/forms") ||
          s.includes("auth/presentations")
        );
        
        if (workspaceScopes.length > 0) {
          console.warn(`\n\x1b[1;33mWarning: Workspace scopes (${workspaceScopes.map(s => s.split("/").pop()).join(", ")}) requested with ADC and no CLIENT_CREDENTIAL_FILE. This is expected to be blocked by Google.\x1b[0m`);
        }
      }

      console.log(`...requesting scopes: ${adcScopes}`);

      const driveAccessFlag = "--enable-gdrive-access";
      const activeConfig = AC || "default";

      // --- Common Google Login (Normal Auth Dialog) ---
      console.log("Revoking previous user credentials...");
      try { execSync("gcloud auth revoke --quiet", { stdio: "ignore", shell: true }); } catch (e) { }
      try { execSync("gcloud auth application-default revoke --quiet", { stdio: "ignore", shell: true }); } catch (e) { }

      console.log(`Setting up gcloud config: ${activeConfig}`);
      try { execSync(`gcloud config configurations describe "${activeConfig}"`, { stdio: "ignore", shell: true }); }
      catch (e) { runCommandSync(`gcloud config configurations create "${activeConfig}"`); }
      runCommandSync(`gcloud config configurations activate "${activeConfig}"`);

      runCommandSync(`gcloud config set project ${projectId}`);
      runCommandSync(`gcloud config set billing/quota_project ${projectId}`);

      console.log("Initiating user login...");
      runCommandSync(`gcloud auth login ${driveAccessFlag}`);

      let clientFlag = "";
      if (AUTH_TYPE !== "dwd" && CLIENT_CREDENTIAL_FILE) {
        const clientPath = path.resolve(process.cwd(), CLIENT_CREDENTIAL_FILE);
        if (fs.existsSync(clientPath)) {
          console.log(`...using client credentials from ${clientPath}`);
          clientFlag = `--client-id-file="${clientPath}"`;
        }
      }

      console.log("Setting up Application Default Credentials (ADC)...");
      const adcScopeFlag = `--scopes="${adcScopes}"`;
      runCommandSync(`gcloud auth application-default login ${adcScopeFlag} ${clientFlag}`.trim());
      runCommandSync(`gcloud auth application-default set-quota-project ${projectId}`);

      // --- DWD Specific Setup (if configured) ---
      if (AUTH_TYPE === "dwd") {
        console.log("\n--- Performing Domain-Wide Delegation (DWD) Setup ---");
        const current_user = execSync("gcloud config get-value account", { shell: true }).toString().trim();
        const sa_email = `${GOOGLE_SERVICE_ACCOUNT_NAME}@${projectId}.iam.gserviceaccount.com`;

        console.log(`...service account: ${sa_email}`);

        let sa_exists = false;
        try { execSync(`gcloud iam service-accounts describe "${sa_email}"`, { stdio: "ignore", shell: true }); sa_exists = true; } catch (e) { }

        if (!sa_exists) {
          console.log(`...creating service account: ${GOOGLE_SERVICE_ACCOUNT_NAME}`);
          runCommandSync(`gcloud iam service-accounts create "${GOOGLE_SERVICE_ACCOUNT_NAME}" --display-name "${GOOGLE_SERVICE_ACCOUNT_NAME}"`);
        }

        console.log("...applying IAM permissions");
        runCommandWithRetrySync(`gcloud projects add-iam-policy-binding "${projectId}" --member="serviceAccount:${sa_email}" --role="roles/editor" --quiet`, true);
        runCommandWithRetrySync(`gcloud iam service-accounts add-iam-policy-binding "${sa_email}" --member="serviceAccount:${sa_email}" --role="roles/iam.serviceAccountTokenCreator" --quiet`, true);
        runCommandWithRetrySync(`gcloud iam service-accounts add-iam-policy-binding "${sa_email}" --member="user:${current_user}" --role="roles/iam.serviceAccountTokenCreator" --quiet`, true);

        const saUniqueId = execSync(`gcloud iam service-accounts describe "${sa_email}" --format="value(uniqueId)"`, { shell: true }).toString().trim();
        console.log(`\n\x1b[1;33m*************************************************************************************************`);
        console.log(`IMPORTANT: If you haven't already done it, add this to Admin Console (Domain-Wide Delegation):`);
        console.log(`************************************************************************\x1b[0m`);
        console.log(`URL: https://admin.google.com/ac/owl/domainwidedelegation`);
        console.log(`Client ID: ${saUniqueId}\nScopes: ${scopes}`);
      }
    }
  }

  console.log("\n--- All requested authentications completed ---");
}

/**
 * Handles the 'enableAPIs' command to enable or disable required Google Cloud services based on options.
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
