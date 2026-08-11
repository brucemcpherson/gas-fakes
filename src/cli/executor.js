import fs from "fs";
import { normalizeScriptNewlines } from "./utils.js";

// --- Sandbox Generation ---

function generateServiceWhitelistScript(services) {
  if (!services || services.length === 0) return [];
  return services.flatMap(({ className, methodNames }, index) => {
    if (!className) {
      console.error("Error: Class name not found in whitelistServices.");
      process.exit(1);
    }
    const serviceVar = `service${index + 1}`;
    const lines = [
      `const ${serviceVar} = behavior.sandboxService.${className};`,
    ];
    if (methodNames && methodNames.length > 0) {
      const methods = methodNames.map((name) => `"${name}"`).join(", ");
      lines.push(`${serviceVar}.setMethodWhitelist([${methods}]);`);
    }
    return lines;
  });
}

function generateServiceBlacklistScript(services) {
  if (!services || services.length === 0) return [];
  return services.map(
    (service) => `behavior.sandboxService.${service}.enabled = false;`
  );
}

function generateItemWhitelistScript(items) {
  if (!items || items.length === 0) return "";
  const whitelistItemsString = items
    .map(({ itemId = "", read = true, write = false, trash = false }) => {
      if (!itemId) {
        console.error("Error: itemId not found in whitelistItems.");
        process.exit(1);
      }
      return `behavior.newIdWhitelistItem("${itemId}").setRead(${read}).setWrite(${write}).setTrash(${trash})`;
    })
    .join(",\n        ");
  return `behavior.setIdWhitelist([${whitelistItemsString}]);`;
}

function generateGmailSandbox(gmailSandbox) {
  if (!gmailSandbox) return [];
  const { emailWhitelist, usageLimit, labelWhitelist, cleanup } = gmailSandbox;
  const temp = ["const gmailSettings = behavior.sandboxService.GmailApp;"];
  if (emailWhitelist && emailWhitelist.length > 0) {
    temp.push(
      `gmailSettings.emailWhitelist = ${JSON.stringify(emailWhitelist)};`
    );
  }
  if (gmailSandbox.hasOwnProperty("cleanup")) {
    temp.push(`gmailSettings.cleanup = ${cleanup};`);
  }
  if (usageLimit) {
    temp.push(`gmailSettings.usageLimit = ${usageLimit};`);
  }
  if (labelWhitelist && labelWhitelist.length > 0) {
    temp.push(
      `gmailSettings.labelWhitelist = ${JSON.stringify(labelWhitelist)};`
    );
  }
  return temp;
}

function generateCalendarSandbox(calendarSandbox) {
  if (!calendarSandbox) return [];
  const { calendarWhitelist, usageLimit, cleanup } = calendarSandbox;
  const temp = [
    "const calendarSettings = behavior.sandboxService.CalendarApp;",
  ];

  if (calendarWhitelist && calendarWhitelist.length > 0) {
    temp.push(
      `calendarSettings.calendarWhitelist = ${JSON.stringify(
        calendarWhitelist
      )};`
    );
  }
  if (calendarSandbox.hasOwnProperty("cleanup")) {
    temp.push(`calendarSettings.cleanup = ${cleanup};`);
  }
  if (usageLimit) {
    // usageLimit can be a number or an object, so stringify ensures correct format.
    temp.push(`calendarSettings.usageLimit = ${JSON.stringify(usageLimit)};`);
  }
  return temp;
}

function generateSandboxSetupScript(sandboxConfig) {
  const script = [
    "const behavior = ScriptApp.__behavior;",
    "behavior.sandboxMode = true;",
    "behavior.strictSandbox = true;",
  ];

  const {
    whitelistServices,
    blacklistServices,
    whitelistItems,
    gmailSandbox,
    calendarSandbox,
  } = sandboxConfig;

  script.push(...generateServiceWhitelistScript(whitelistServices));
  script.push(...generateServiceBlacklistScript(blacklistServices));
  script.push(...generateGmailSandbox(gmailSandbox));
  script.push(...generateCalendarSandbox(calendarSandbox));

  const itemWhitelist = generateItemWhitelistScript(whitelistItems);
  if (itemWhitelist) {
    script.push(itemWhitelist);
  }
  return script;
}

function generateExecutionScript({ scriptText, useSandbox, sandboxConfig }) {
  if (!scriptText || scriptText.trim() === "") {
    console.error("Error: Google Apps Script is empty or was not found.");
    process.exit(1);
  }

  let gasScriptLines = [];

  if (sandboxConfig) {
    gasScriptLines.push(...generateSandboxSetupScript(sandboxConfig));
    gasScriptLines.push(`\n\n${scriptText}\n\n`);
    gasScriptLines.push("ScriptApp.__behavior.trash();");
  } else if (useSandbox) {
    gasScriptLines.push("ScriptApp.__behavior.sandBoxMode = true;");
    gasScriptLines.push(`\n\n${scriptText}\n\n`);
    gasScriptLines.push("ScriptApp.__behavior.trash();");
  } else {
    gasScriptLines.push(scriptText);
  }

  const gasScript = gasScriptLines.join("\n");
  const mainScript = [
    "async function runGas() {",
    '  await import("../../main.js"); // This will trigger the fxInit call',
    gasScript,
    "}",
    "return runGas();",
  ].join("\n");
  
  return { mainScript, gasScript };
}

// --- Execution ---

export async function executeGasScript(options) {
  const {
    filename,
    script,
    display,
    useSandbox,
    sandboxConfig,
    args,
    gas_library,
  } = options;

  let scriptText = filename ? fs.readFileSync(filename, "utf8") : script;

  if (scriptText) {
    scriptText = scriptText.replace(/\\\s*?\n/g, "\n");
  }

  let { mainScript, gasScript } = generateExecutionScript({
    scriptText: normalizeScriptNewlines(scriptText),
    useSandbox,
    sandboxConfig,
  });

  if (display) {
    console.log(
      `\n--- Generated GAS ---\n${gasScript}\n--- End Generated GAS ---\n`
    );
  }
 
  if (gas_library && gas_library.length > 0) {
    const libs = gas_library.reduce((ar, { identifier, libScript }) => {
      if (mainScript.includes(identifier)) {
        ar.push(libScript);
      }
      return ar;
    }, []);
    if (libs.length > 0) {
      mainScript = `${libs.join("\n\n")}\n\n${mainScript}`;
    }
  }

  let res;
  if (args) {
    const gasFunction = new Function("args", mainScript);
    res = await gasFunction(args);
  } else {
    const gasFunction = new Function(mainScript);
    res = await gasFunction();
  }
  if (res) {
    const output = typeof res == "string" ? res : JSON.stringify(res);
    console.log(output);
  }

  
}
