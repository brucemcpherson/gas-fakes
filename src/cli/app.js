import { Command, Option } from "commander";
import dotenv from "dotenv";
import path from "path";
import { VERSION, buildSandboxConfig } from "./utils.js";
import { executeGasScript } from "./executor.js";
import { getLibraries } from "./lib-manager.js";
import {
  initializeConfiguration,
  authenticateUser,
  enableGoogleAPIs,
} from "./setup.js";
import { startMcpServer } from "./mcp.js";

export async function main() {
  const program = new Command();

  program
    .name("gas-fakes")
    .description("A CLI tool to execute Google Apps Script with fakes/mocks.")
    .version(
      VERSION,
      "-v, --version",
      "Display the current version of gas-fakes"
    );

  // --- Main Execution Command ---
  program
    .description("Execute a Google Apps Script file or string.")
    .option("-f, --filename <string>", "Path to the Google Apps Script file.")
    .option(
      "-s, --script <string>",
      "A string containing the Google Apps Script."
    )
    .option("-e, --env <path>", "Path to a custom .env file.", "./.env")
    .option(
      "-g, --gfsettings <path>",
      "Path to a gasfakes.json settings file.",
      "./gasfakes.json"
    )
    .option("-x, --sandbox", "Run the script in a basic sandbox.")
    .option(
      "-w, --whitelistRead <string>",
      "Comma-separated file IDs for read-only access (enables sandbox)."
    )
    .option(
      "--ww, --whitelistReadWrite <string>",
      "Comma-separated file IDs for read/write access (enables sandbox)."
    )
    .option(
      "--wt, --whitelistReadWriteTrash <string>",
      "Comma-separated file IDs for read/write/trash access (enables sandbox)."
    )
    .option(
      "-j, --json <string>",
      "JSON string for advanced sandbox configuration (overrides whitelist flags)."
    )
    .option(
      "-d, --display",
      "Display the generated script before execution.",
      false
    )
    .option(
      "-a, --args <string>",
      `Arguments for the GAS function (JSON string). Name must be "args".`,
      null
    )
    .option(
      "-l, --libraries <string...>",
      `Libraries in format "Identifier@Source" (Source can be file path, URL, or Drive ID).`,
      null
    )
    .action(async (options) => {
      const { filename, script, env, gfsettings } = options;

      // If no script provided and no sub-command matched, show help
      if (!filename && !script) {
        const knownCommands = program.commands.map((cmd) => cmd.name());
        if (!process.argv.slice(2).some((arg) => knownCommands.includes(arg))) {
          program.help();
          process.exit(1);
        }
        return;
      }

      // Load environment variables. 
      // If --env-file is used, we skip the default .env to avoid conflicts,
      // but if the user explicitly provided -e, we use that.
      const hasEnvFileFlag = process.execArgv.some(arg => arg.startsWith('--env-file'));
      const isDefaultEnv = env === "./.env";

      if (!hasEnvFileFlag || !isDefaultEnv) {
        const envPath = path.resolve(process.cwd(), env);
        console.log(`...using env file in ${envPath}`);
        dotenv.config({ path: envPath, quiet: true });
      }

      const settingsPath = path.resolve(process.cwd(), gfsettings);
      console.log(`...using gasfakes settings file in ${settingsPath}`);
      process.env.GF_SETTINGS_PATH = settingsPath;

      const sandboxConfig = buildSandboxConfig(options);
      const useSandbox = !!options.sandbox || !!sandboxConfig;

      let args = null;
      if (options.args) {
        try {
          args = JSON.parse(
            options.args
              .replace(/\\\s*?\n/g, "\\n")
              .replace(/\n/g, "\\n")
              .replace(/\r/g, "\\r")
          );
        } catch (err) {
          console.error("Error: Invalid JSON provided to --args option.");
          process.exit(1);
        }
      }

      const gas_library = await getLibraries(options);

      await executeGasScript({
        filename,
        script,
        display: options.display,
        useSandbox,
        sandboxConfig,
        gfSettings: settingsPath,
        args,
        gas_library,
      });
    });

  // --- Setup Commands ---
  program
    .command("init")
    .description("Initializes the configuration (.env).")
    .option("-e, --env <path>", "Path to a custom .env file.")
    .option("-b, --backends <string...>", "List of backends to initialize (google, ksuite).", ["google"])
    .addOption(
      new Option(
        "--at,--auth-type <string>",
        "Use Domain Wide Delegation (dwd) or Application Default Credentials (adc) for authentication (default)."
      )
        .choices(["dwd", "adc"])
        .default("dwd")
    )
    .action(initializeConfiguration);

  program
    .command("auth")
    .description("Runs the authentication flow for a backend.")
    .option("-b, --backend <string>", "Backend to authenticate (google, ksuite).", "google")
    .action(authenticateUser);

  program
    .command("enableAPIs")
    .description("Enables or disables required Google Cloud APIs.")
    .option("--all", "Enable all default APIs.")
    // Drive
    .option("--edrive", "Enable drive.googleapis.com")
    .option("--ddrive", "Disable drive.googleapis.com")
    // Sheets
    .option("--esheets", "Enable sheets.googleapis.com")
    .option("--dsheets", "Disable sheets.googleapis.com")
    // Forms
    .option("--eforms", "Enable forms.googleapis.com")
    .option("--dforms", "Disable forms.googleapis.com")
    // Docs
    .option("--edocs", "Enable docs.googleapis.com")
    .option("--ddocs", "Disable docs.googleapis.com")
    // Gmail
    .option("--egmail", "Enable gmail.googleapis.com")
    .option("--dgmail", "Disable gmail.googleapis.com")
    // Logging
    .option("--elogging", "Enable logging.googleapis.com")
    .option("--dlogging", "Disable logging.googleapis.com")
    .action(enableGoogleAPIs);

  // --- MCP Command ---
  program
    .command("mcp")
    .description("Launch gas-fakes as an MCP server.")
    .option("-t, --tools <string>", "Path to custom tools file.")
    .action(startMcpServer);

  program.showHelpAfterError("(add --help for additional information)");

  await program.parseAsync(process.argv);
}
