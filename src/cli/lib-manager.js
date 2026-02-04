import fs from "fs";
import { parse } from "acorn";
import { Auth } from "../support/auth.js"; // Relative to gas-fakes-cli directory
import { checkForGcloudCli, spawnCommand } from "./utils.js";

async function getAccessToken(pattern) {
  if (pattern == 1) {
    // Authorization pattern 1
    const auth = await Auth.setAuth(
      ["https://www.googleapis.com/auth/drive.readonly"],
      true
    );
    auth.cachedCredential = null;
    return await auth.getAccessToken();
  } else {
    // Authorization pattern 2
    await checkForGcloudCli();
    try {
      const accessToken = await spawnCommand("gcloud", [
        "auth",
        "print-access-token",
      ]);
      return accessToken;
    } catch (error) {
      console.error("\nError obtaining access token:");
      console.error(error.message);
      console.error(
        "Please ensure you are authenticated with gcloud CLI. Run 'gcloud auth application-default login'."
      );
      process.exit(1);
    }
  }
}

/**
 * Fetches the script content from Google Drive, recursively resolving dependencies found in appsscript.json.
 *
 * @param {string} sourcePath - The Drive File ID.
 * @param {number} pattern - The auth pattern (1 or 2).
 * @param {Set<string>} visited - A Set of visited library IDs to prevent circular recursion.
 * @returns {Promise<string>} The combined source code (dependencies + current script).
 */
async function fetchScriptFileFromGoogleDrive(
  sourcePath,
  pattern = 1,
  visited = new Set()
) {
  try {
    const accessToken = await getAccessToken(pattern);
    const url = `https://www.googleapis.com/drive/v3/files/${sourcePath}/export?mimeType=${encodeURIComponent(
      "application/vnd.google-apps.script+json"
    )}`;

    const response = await fetch(url, {
      headers: { authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error ${response.status} fetching Drive ID "${sourcePath}".`
      );
    }

    const text = await response.json();
    let dependencyScripts = "";

    if (text.files && text.files.length > 0) {
      // 1. Check for manifest (appsscript.json) and process dependencies
      const manifestFile = text.files.find(
        (e) => e.type === "json" && e.name === "appsscript"
      );

      if (manifestFile) {
        const manifestObj = JSON.parse(manifestFile.source);

        if (
          manifestObj?.dependencies?.libraries &&
          manifestObj.dependencies.libraries.length > 0
        ) {
          // Process dependencies sequentially to maintain order
          for (const lib of manifestObj.dependencies.libraries) {
            const { userSymbol, libraryId } = lib;

            // Prevent infinite recursion or duplicate fetching
            if (visited.has(libraryId)) {
              continue;
            }
            visited.add(libraryId);

            // console.log(`Fetching dependency: ${userSymbol} (${libraryId})...`);

            // Recursive call: Fetch the raw source of the dependency
            // We pass the same 'visited' set down the tree
            const rawLibSource = await fetchScriptFileFromGoogleDrive(
              libraryId,
              1, // Reset pattern to 1 for new requests usually, or keep current
              visited
            );

            // Wrap the dependency so it is usable as an object (e.g., LIB2.method())
            // inside the current script scope.
            const wrappedLib = generateLibraryWrapper(userSymbol, rawLibSource);

            dependencyScripts += wrappedLib + "\n\n";
          }
        }
      }

      // 2. Extract the current project's server_js files
      const currentProjectScript = text.files
        .filter((e) => e.type === "server_js")
        .map((e) => e.source)
        .join("\n\n");

      // 3. Return dependencies at the top, followed by current script
      return dependencyScripts + currentProjectScript;
    }
  } catch (err) {
    if (pattern == 1) {
      // Retry with pattern 2, preserving the visited set
      return await fetchScriptFileFromGoogleDrive(sourcePath, 2, visited);
    }
    throw new Error(
      `Could not retrieve script from "${sourcePath}". Ensure it is a valid path, URL, or Drive ID, and that you are authenticated. Error: ${err.message}`
    );
  }
}

/**
 * Fetches the source code for a library from a local file, a URL, or Google Drive.
 */
async function fetchLibrarySource(sourcePath) {
  // 1. Check Local File
  if (fs.existsSync(sourcePath)) {
    return fs.readFileSync(sourcePath, "utf8");
  }

  // 2. Check URL
  if (URL.canParse(sourcePath)) {
    const response = await fetch(sourcePath);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} fetching ${sourcePath}`);
    }
    return await response.text();
  }

  // 3. Check Google Drive (via gcloud/auth)
  try {
    return await fetchScriptFileFromGoogleDrive(sourcePath);
  } catch (err) {
    throw new Error(
      `No valid source code found for "${sourcePath}". Error message: ${err.message}`
    );
  }
}

/**
 * Wraps raw library source code into a GAS-style namespace using an IIFE.
 */
function generateLibraryWrapper(identifier, source) {
  try {
    const ast = parse(source, { ecmaVersion: 2020 });

    const exportNames = ast.body.reduce((names, node) => {
      if (node.type === "FunctionDeclaration") {
        names.push(node.id.name);
      } else if (node.type === "VariableDeclaration" && node.kind === "var") {
        names.push(...node.declarations.map((d) => d.id.name));
      }
      return names;
    }, []);

    if (exportNames.length === 0) {
      throw new Error(
        `No top-level functions or var variables found to export in library "${identifier}".`
      );
    }

    return [
      `var ${identifier} = (function () {`,
      `var ${identifier};`,
      source,
      `\n`,
      `if (this && this.${identifier}) { ${identifier} = this.${identifier}; }`,
      `return { ${exportNames.join(", ")} };`,
      `}).call({});`,
    ].join("\n");
  } catch (err) {
    console.error(`Error processing library "${identifier}": ${err.message}`);
    process.exit(1);
  }
}

/**
 * Processes library arguments, fetches source code, and generates namespaced wrapper scripts.
 */
export async function getLibraries(options) {
  const { libraries } = options;

  if (!libraries || !Array.isArray(libraries) || libraries.length === 0) {
    return null;
  }

  const fetchPromises = libraries.map(async (libArg) => {
    const splitIndex = libArg.indexOf("@");
    if (splitIndex === -1) {
      throw new Error(
        `Invalid library format: "${libArg}". Expected format: 'Identifier@Source'.`
      );
    }
    const identifier = libArg.substring(0, splitIndex).trim();
    const sourcePath = libArg.substring(splitIndex + 1).trim();

    if (!identifier || !sourcePath) {
      throw new Error(
        `Invalid library argument: "${libArg}". Identifier or Source is missing.`
      );
    }

    try {
      const source = await fetchLibrarySource(sourcePath);
      return { identifier, source };
    } catch (err) {
      throw new Error(`Failed to load library "${identifier}": ${err.message}`);
    }
  });

  let fetchedLibs;
  try {
    fetchedLibs = await Promise.all(fetchPromises);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  const mergedLibsMap = new Map();
  for (const { identifier, source } of fetchedLibs) {
    if (mergedLibsMap.has(identifier)) {
      const existingSource = mergedLibsMap.get(identifier);
      mergedLibsMap.set(identifier, existingSource + "\n\n" + source);
    } else {
      mergedLibsMap.set(identifier, source);
    }
  }

  const wrappedScripts = [];
  for (const [identifier, source] of mergedLibsMap) {
    wrappedScripts.push({
      identifier,
      libScript: generateLibraryWrapper(identifier, source),
    });
  }

  return wrappedScripts;
}
