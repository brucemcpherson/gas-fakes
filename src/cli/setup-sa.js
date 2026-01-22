import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import prompts from "prompts";
import { execSync } from "child_process";
import { checkForGcloudCli, runCommandSync } from "./utils.js";

// --- Constants & Colors ---
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const NC = "\x1b[0m"; // No Color

const MANIFEST_FILE = "appsscript.json";
const SA_NAME = "gas-fakes-worker";
const KEY_DIR = "private";

/**
 * Updates or appends a key-value pair to the .env file.
 * @param {string} key - The environment variable key.
 * @param {string} val - The value to set.
 */
function updateEnvVar(key, val) {
  const envPath = path.join(process.cwd(), ".env");
  let content = "";

  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf8");
  }

  // Escape double quotes in value if any
  const safeVal = val.replace(/"/g, '\\"');
  const newLine = `${key}="${safeVal}"`;
  const regex = new RegExp(`^${key}=.*`, "m");

  if (regex.test(content)) {
    content = content.replace(regex, newLine);
    console.log(`Updated ${YELLOW}${key}${NC}`);
  } else {
    if (content && !content.endsWith("\n")) {
      content += "\n";
    }
    content += `${newLine}\n`;
    console.log(`Added ${YELLOW}${key}${NC}`);
  }

  fs.writeFileSync(envPath, content, "utf8");
}

/**
 * Helper to capture stdout from a shell command.
 */
function getCommandOutput(command) {
  try {
    return execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch (e) {
    return "";
  }
}

/**
 * Main function to setup the Service Account.
 */
export async function setupServiceAccount() {
  // 1. Prerequisites Check
  await checkForGcloudCli();

  // Load .env (create if not exists, similar to `touch .env`)
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, "", "utf8");
  }
  dotenv.config({ path: envPath });

  // 2. Get Gcloud Identity
  const currentUser = getCommandOutput("gcloud config get-value account");
  const gcpProjectId = getCommandOutput("gcloud config get-value project");

  if (!currentUser || currentUser === "(unset)") {
    console.error(`${RED}Error: Run 'gcloud auth login' first.${NC}`);
    process.exit(1);
  }

  // Derived Constants
  const saEmail = `${SA_NAME}@${gcpProjectId}.iam.gserviceaccount.com`;
  const keyFile = path.join(KEY_DIR, `${SA_NAME}.json`);

  // ==========================================
  // SCOPE RESOLUTION (Optional Manifest Extraction)
  // ==========================================
  let useManifest = false;
  if (fs.existsSync(MANIFEST_FILE)) {
    console.log(`${CYAN}Found ${MANIFEST_FILE}.${NC}`);
    const response = await prompts({
      type: "confirm",
      name: "extract",
      message: "Extract oauthScopes from manifest into .env?",
      initial: false,
    });
    if (response.extract) {
      useManifest = true;
    }
  }

  if (useManifest) {
    console.log(
      `${GREEN}--- Extracting oauthScopes from ${MANIFEST_FILE} ---${NC}`,
    );
    try {
      const manifestContent = fs.readFileSync(MANIFEST_FILE, "utf8");
      // Use JSON parse instead of awk/grep for robustness, handling potential comments is tricky in pure JSON
      // but appsscript.json is standard JSON.
      const manifest = JSON.parse(manifestContent);
      const scopes = manifest.oauthScopes || [];

      // Filter for http or openid scopes similar to the grep logic
      const filteredScopes = scopes.filter(
        (s) => s.includes("http") || s.includes("openid"),
      );

      if (filteredScopes.length > 0) {
        const joinedScopes = filteredScopes.join(",");
        updateEnvVar("EXTRA_SCOPES", joinedScopes);
        // Reload env to ensure subsequent steps use fresh values
        process.env.EXTRA_SCOPES = joinedScopes;
      } else {
        console.error(
          `${RED}Error: Could not find relevant oauthScopes in ${MANIFEST_FILE}${NC}`,
        );
      }
    } catch (e) {
      console.error(`${RED}Error parsing ${MANIFEST_FILE}: ${e.message}${NC}`);
    }
  } else {
    console.log(`${YELLOW}--- Using existing EXTRA_SCOPES from .env ---${NC}`);
  }

  // ==========================================
  // SERVICE ACCOUNT & KEY LOGIC
  // ==========================================
  runCommandSync(`gcloud config set project "${gcpProjectId}" --quiet`);

  // Check if SA exists
  let createNew = false;
  try {
    execSync(`gcloud iam service-accounts describe "${saEmail}"`, {
      stdio: "ignore",
    });
    // If command succeeds, SA exists
    console.log(`${YELLOW}Service Account '${SA_NAME}' exists.${NC}`);

    const choice = await prompts({
      type: "select",
      name: "action",
      message: "Service Account exists. What would you like to do?",
      choices: [
        { title: "Replace (Delete and Recreate)", value: "replace" },
        { title: "Keep / Rotate Keys", value: "keep" },
        { title: "Cancel", value: "cancel" },
      ],
    });

    if (choice.action === "replace") {
      runCommandSync(`gcloud iam service-accounts delete "${saEmail}" --quiet`);
      createNew = true;
    } else if (choice.action === "keep") {
      createNew = false;
    } else {
      process.exit(0);
    }
  } catch (e) {
    // SA does not exist
    createNew = true;
  }

  console.log(`${GREEN}--- Enabling APIs ---${NC}`);
  runCommandSync(
    "gcloud services enable iam.googleapis.com drive.googleapis.com sheets.googleapis.com gmail.googleapis.com --quiet",
  );

  if (createNew) {
    console.log(`${GREEN}--- Creating Service Account ---${NC}`);
    runCommandSync(
      `gcloud iam service-accounts create "${SA_NAME}" --display-name="GAS Fakes Worker"`,
    );
    // Sleep briefly to ensure propagation
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Permissions
  console.log(`${GREEN}--- Updating Permissions ---${NC}`);
  runCommandSync(
    `gcloud projects add-iam-policy-binding "${gcpProjectId}" --member="serviceAccount:${saEmail}" --role="roles/editor" --condition=None --quiet`,
  );
  runCommandSync(
    `gcloud iam service-accounts add-iam-policy-binding "${saEmail}" --member="user:${currentUser}" --role="roles/iam.serviceAccountTokenCreator" --condition=None --quiet`,
  );

  // Key Generation
  if (!fs.existsSync(KEY_DIR)) {
    fs.mkdirSync(KEY_DIR, { recursive: true });
  }
  if (fs.existsSync(keyFile)) {
    fs.unlinkSync(keyFile);
  }

  runCommandSync(
    `gcloud iam service-accounts keys create "${keyFile}" --iam-account="${saEmail}" --quiet`,
  );

  const saUniqueId = getCommandOutput(
    `gcloud iam service-accounts describe "${saEmail}" --format='get(uniqueId)'`,
  );

  // Optionally write filename and subject to .env
  const envChoice = await prompts({
    type: "confirm",
    name: "writeEnv",
    message: "Write filename and subject to .env?",
    initial: false,
  });

  if (envChoice.writeEnv) {
    updateEnvVar("SERVICE_ACCOUNT_FILE", `${SA_NAME}.json`);
    updateEnvVar("GOOGLE_WORKSPACE_SUBJ", saEmail);
  }

  // ==========================================
  // FINAL STRING GENERATION
  // ==========================================
  // Merge Default and Extra scopes
  const defaultScopes = (process.env.DEFAULT_SCOPES || "").split(",");
  const extraScopes = (process.env.EXTRA_SCOPES || "").split(",");

  const allScopes = [...defaultScopes, ...extraScopes]
    .map((s) => s.trim().replace(/['"]/g, "")) // Remove quotes and spaces
    .filter((s) => s.length > 0);

  // Deduplicate using Set
  const uniqueScopes = [...new Set(allScopes)];
  const finalAdminScopes = uniqueScopes.join(",");

  // ==========================================
  // OUTPUT
  // ==========================================
  console.log(`\n${GREEN}==========================================${NC}`);
  console.log(`${GREEN}SUCCESS! CONFIGURATION COMPLETE${NC}`);
  console.log(`${GREEN}==========================================${NC}`);
  console.log(
    `${YELLOW}You need to copy the following client ID and scopes to the Workspace Admin Console${NC}`,
  );
  console.log(
    `${YELLOW}This will enable domain wide delegation for the service account${NC}`,
  );
  console.log(`Project:    ${CYAN}${gcpProjectId}${NC}`);
  console.log(`Client ID:  ${CYAN}${saUniqueId}${NC}`);
  console.log(`\nURL: https://admin.google.com/ac/owl/domainwidedelegation\n`);
  console.log(`${CYAN}${finalAdminScopes}${NC}\n`);
}
