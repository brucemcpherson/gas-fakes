import { spawn, execSync } from "child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pjson = require("../../package.json");

export const VERSION = pjson.version;
export const CLI_VERSION = "0.0.20";
export const MCP_VERSION = "0.0.7";

/**
 * Replaces escaped newline characters ('\\n') with actual newlines,
 * while ignoring newlines inside string literals.
 */
export function normalizeScriptNewlines(text) {
  const regex =
    /("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(`(?:[^`\\]|\\.)*`)|(\/\\[rn]\/[dgimsuy]*)|(\/\*[\s\S]*?\*\/)|(\/\/(?:(?!\\n).)*)|(\\n)/g;
  return text.replace(regex, (match, g1, g2, g3, g4, g5, g6, g7) => {
    if (g7) return "\n";
    return match;
  });
}

/**
 * Helper function to wrap spawn in a Promise.
 */
export function spawnCommand(command, args) {
  return new Promise((resolve, reject) => {
    // shell: true is important for Windows to find .cmd/.bat files correctly
    const child = spawn(command, args, { shell: true });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(
          new Error(stderr.trim() || `Command failed with exit code ${code}`)
        );
      }
    });
  });
}

/**
 * Checks if the gcloud CLI is installed and available.
 */
export async function checkForGcloudCli() {
  try {
    await spawnCommand("gcloud", ["--version"]);
  } catch (error) {
    console.error(
      "\n[Error] Google Cloud SDK (gcloud CLI) not found or failed to run."
    );
    console.error("Please install it by following the official instructions:");
    console.error("https://cloud.google.com/sdk/gcloud");
    process.exit(1);
  }
}

/**
 * Helper function to run a shell command sync (used in setup).
 */
export function runCommandSync(command, silent = false) {
  try {
    // shell: true is explicitly added to ensure compatibility on Windows,
    // especially for handling interactive commands or batch files like gcloud.cmd
    execSync(command, { stdio: silent ? "ignore" : "inherit", shell: true });
  } catch (error) {
    console.error(`\nError executing command: ${command}`);
    process.exit(1);
  }
}

/**
 * Parses sandbox-related CLI options into a structured config object.
 */
export function buildSandboxConfig(options) {
  const { json, whitelistRead, whitelistReadWrite, whitelistReadWriteTrash } =
    options;

  if (json) {
    try {
      return JSON.parse(json);
    } catch (err) {
      console.error("Error: Invalid JSON provided to --json option.");
      process.exit(1);
    }
  }

  if (whitelistRead || whitelistReadWrite || whitelistReadWriteTrash) {
    const config = { whitelistItems: [] };
    const parseWhitelist = (idString, permissions) => {
      if (!idString) return;
      idString.split(",").forEach((id) => {
        const trimmedId = id.trim();
        if (trimmedId) {
          config.whitelistItems.push({ itemId: trimmedId, ...permissions });
        }
      });
    };

    parseWhitelist(whitelistRead, { read: true });
    parseWhitelist(whitelistReadWrite, { read: true, write: true });
    parseWhitelist(whitelistReadWriteTrash, {
      read: true,
      write: true,
      trash: true,
    });

    return config;
  }

  return undefined;
}
