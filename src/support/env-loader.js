import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

/**
 * Conditionally loads environment variables from a .env file.
 * 
 * If Node.js was started with the --env-file flag, this loader does nothing
 * to allow the native Node.js environment file handling to take precedence.
 * 
 * Otherwise, it attempts to load a .env file from the directory where the 
 * main script is located. If not found, it falls back to the default 
 * dotenv behavior (searching the current working directory).
 */

// Check if node was run with --env-file
const hasEnvFileFlag = process.execArgv.some(arg => arg.startsWith('--env-file'));

if (!hasEnvFileFlag) {
  const mainScript = process.argv[1];
  if (mainScript) {
    // Try to find .env in the same directory as the main entry point script
    const envPath = join(dirname(mainScript), '.env');
    if (existsSync(envPath)) {
      dotenv.config({ path: envPath });
    } else {
      // Fallback to default dotenv behavior (CWD)
      dotenv.config();
    }
  } else {
    // Fallback if mainScript is not available (e.g. REPL)
    dotenv.config();
  }
}
