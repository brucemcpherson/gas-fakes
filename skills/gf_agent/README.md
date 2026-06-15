# gf_agent - Google Apps Script Local Automation Agent

`gf_agent` is an interactive agent for Gemini CLI that allows you to automate Google Workspace tasks locally using [gas-fakes](https://github.com/brucemcpherson/gas-fakes).

*For full project details, see the [main gas-fakes README](../README.md).*

## Requirements & Setup

Before using the agent or the MCP tools, you **must** configure your local environment to allow access to your Google Workspace account:

1. **Manifest File**: You need a local `appsscript.json` file in your directory containing the necessary `oauthScopes` you intend to use.
2. **Initialization**: Run `gas-fakes init` to generate a `.env` file and configure your auth parameters.
3. **Authentication**: Run `gas-fakes auth` to log in and generate the tokens required to run the scripts.

## Installation & Integration

*Note: You can skip these manual steps if you already chose to install the Gemini skills during the `gas-fakes init` process. The `init` command will automatically detect if you are in a local clone and link the skills appropriately.*

### 1. Install the Plugin Agent

**For General Users:**
You can install the `gas-fakes-agent` directly from this repository using the Antigravity CLI (`agy`):
```bash
agy plugin install https://github.com/tanaikech/gas-fakes.git
```

**For Contributors & Developers:**
You can install the plugin from your local clone:
```bash
agy plugin install .
```

### 2. Configure the MCP Server
To use Google Workspace services as tools within Gemini CLI, add the MCP server to your settings. 

The easiest way is to use the built-in command (assuming you installed `gas-fakes` globally):
```bash
gemini mcp add --scope project gas-fakes-mcp gas-fakes mcp
```

*(Advanced: Alternatively, you can manually add the configuration to your `.gemini/settings.json` file instead of using the command above. See [documentation.md](documentation.md) for the manual JSON structure).*

### 3. Requirements
Ensure dependencies are installed in your workspace:
```bash
npm install
```

## Usage

Once the MCP server is configured, you don't need to use any special prefixes or agent names. Simply describe what you want to do in plain English:

- "Create a sheet called 'Latest Drive Files' and add my recently created Drive files to it."
- "Find latest 5 emails from 'Martin Hawksey' and summarize them in a Google Doc."
- "Add a meeting with Martin Hawksey to my calendar for tomorrow at 10am. Subject is gas-fakes agent"
- "Find my airports spreadsheet, and using the sheet with the most data, list to the console the 5 highest airports sorted by elevation high to low, and convert elevation to meters.

The LLM will automatically:
1. Identify the correct Google Workspace services needed.
2. Generate the appropriate Apps Script code.
3. Execute it locally via `gas-fakes`.
4. Confirm the results to you.

## Antigravity & MCP Integration

`gas-fakes` can also act as an MCP (Model Context Protocol) server for tools like Antigravity. To launch the MCP server:

```bash
gas-fakes mcp
```

This allows Antigravity or other MCP-compatible clients to call Google Workspace tools directly through `gas-fakes`.


## Why use gf_agent?

- **Fast Iteration**: Test your automation logic without waiting for the Apps Script IDE or deployment.
- **Security**: Run tasks locally using your own Google credentials (via ADC) without uploading code to a third-party service.
- **Powerful Integration**: Use Node.js libraries alongside Google Apps Script APIs.

## Contributing to gf_agent

If you'd like to improve the agent by teaching it new tricks, outlining Apps Script API parity warnings, or documenting best practices, we welcome your contributions!

To avoid Git merge conflicts on the large monolithic `SKILL.md` file, the `gf_agent` uses a **modular knowledge base**.

1. Clone or fork this repository (or just the `gf_agent` directory).
2. Create a new Markdown file inside the `gf_agent/knowledge/` directory (e.g., `06-new-feature.md`).
3. Write your specific instructions or lessons learned in that file.
4. **Do NOT** attempt to compile `SKILL.md` yourself.
5. Commit and submit a Pull Request with your new Markdown file.

Once merged, the repository maintainers will run the automated pipeline to compile your new knowledge into the master `gf_agent/SKILL.md` for all users! See the [Knowledge Base README](knowledge/README.md) or ask the `gf-agent-contributor` skill for more details.
