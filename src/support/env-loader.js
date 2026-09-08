import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

/**
 * Conditionally loads environment variables from a .env file.
 * 
 * If Node.js was started with the --env-file flag, this loader does nothing
 * to allow the native Node.js environment file handling to take precedence.
 * 
 * Otherwise, it attempts to load a .env file from the directory where the 
 * main script is located. If not found, it falls back to the default 
 * dotenv behavior (searching the current working directory).
 * 
 * It also checks process.argv in case the user mistakenly passed --env-file
 * after the script name.
 */

// Check if node was run with --env-file natively
const hasEnvFileFlag = process.execArgv.some(arg => arg.startsWith('--env-file'));

if (!hasEnvFileFlag) {
  // Suppress dotenv logs/tips
  process.env.DOTENV_CONFIG_NO_TIP = 'true';
  
  // Check if --env-file was passed as a script argument
  let customEnvPath = null;
  const argvEnvFileIdx = process.argv.findIndex(arg => arg === '--env-file');
  
  if (argvEnvFileIdx !== -1 && process.argv.length > argvEnvFileIdx + 1) {
    customEnvPath = resolve(process.cwd(), process.argv[argvEnvFileIdx + 1]);
  } else {
    const argvEnvFileMatch = process.argv.find(arg => arg.startsWith('--env-file='));
    if (argvEnvFileMatch) {
      customEnvPath = resolve(process.cwd(), argvEnvFileMatch.split('=')[1]);
    }
  }

  if (customEnvPath && existsSync(customEnvPath)) {
    dotenv.config({ path: customEnvPath, override: false, quiet: true });
    console.log ('...using .env in custom path', customEnvPath)
  } else {
    const mainScript = process.argv[1];
    if (mainScript) {
      // Try to find .env in the same directory as the main entry point script
      const envPath = join(dirname(mainScript), '.env');
      if (existsSync(envPath)) {
        dotenv.config({ path: envPath, override: false, quiet: true });
        console.log ('...using .env in ', envPath)
      } else {
        // Fallback to default dotenv behavior (CWD)
        dotenv.config({ override: false, quiet: true });
        console.log ('...using .env in ', process.cwd())
      }
    } else {
      // Fallback if mainScript is not available (e.g. REPL)
      dotenv.config({ override: false, quiet: true });
      console.log ('...no main script available - using .env in ', process.cwd())
    }
  }
}
