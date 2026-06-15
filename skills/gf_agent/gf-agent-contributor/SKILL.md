---
name: gf-agent-contributor
description: Guide for creating or contributing modular knowledge to the gf_agent skill. Use this when a user wants to teach gf_agent a new trick or document an Apps Script parity oddity.
---
# Skill: gf-agent-contributor

## Overview
This skill provides instructions on how to correctly contribute knowledge, best practices, or API parity warnings to the `gf_agent` so that it learns how to write better Google Apps Script automation code.

## The Architecture
To prevent Git merge conflicts between multiple developers, the monolithic `gf_agent/SKILL.md` file is **auto-generated**. You MUST NOT edit `gf_agent/SKILL.md` directly. 

Instead, `gf_agent` uses a modular knowledge base. The `builder.js` script aggregates all markdown files in the `gf_agent/knowledge/` directory and appends them to a base template (`gf_agent/scripts/SKILL.template.md`).

## How to Contribute Knowledge

When you need to teach `gf_agent` something new, you must first ensure you are working from a local Git clone, NOT the cached Gemini skills folder.

1. **Clone the gf_agent Environment (Sparse Checkout)**:
   Because `gf_agent` is a subfolder of the larger `gas-fakes` repository, you should use Git's Sparse Checkout feature to download *only* the `gf_agent` directory. 
   
   **🤖 Agent Instruction**: If the user is not yet in a configured workspace, offer to run the sparse checkout setup for them! If they agree, use `run_shell_command` to execute this exact sequence (adjust the parent directory if they specify one):
   ```bash
   mkdir gf_agent_standalone && cd gf_agent_standalone
   git init
   git remote add origin https://github.com/brucemcpherson/gas-fakes.git
   git config core.sparseCheckout true
   echo "gf_agent/*" >> .git/info/sparse-checkout
   git pull origin main
   gemini skills link ./gf_agent
   ```
   *(If the user prefers to do it manually, provide them the script above).*

2. **Create a Modular File**: 
   Navigate to the `gf_agent/knowledge/` directory inside your new standalone environment. Create a new markdown file for your topic. 
   - Use a numeric prefix to ensure it sorts correctly during compilation if order matters (e.g., `06-new-feature.md`). If it is a standalone topic, any descriptive name is fine.
   
3. **Draft the Knowledge**:
   Write your instructions clearly. Use Markdown headers (`###`). Keep it concise and actionable for an AI agent. 
   *Good Example:* "When creating a Foo, you MUST always set the Bar property, otherwise the API will crash with error X."

4. **Testing Your Contributions (Optional but Recommended)**:
   If you want to verify that your new knowledge correctly guides the agent before you submit your PR:
   - Run the builder script from the root of your standalone directory (or the `gas-fakes` root) to compile your change into the monolithic `SKILL.md`:
     ```bash
     node gf_agent/scripts/builder.js
     ```
   - Since you have already "linked" the skill in step 1, the Gemini CLI will immediately start using your updated `SKILL.md`. You can now test the behavior by asking the agent a question related to your new knowledge.

5. **Submit Your Knowledge**:
   Once satisfied, you do **not** need to include the updated monolithic `SKILL.md` in your commit (the repo maintainers will handle the final build). 
   Simply stage your new `gf_agent/knowledge/XX-my-topic.md` file, commit it, and push it to your fork.
   
6. **The Merge Process**:
   Submit a Pull Request with your new file. Because you only added a distinct file to a directory, your pull request will not cause merge conflicts. 
   Once your PR is merged, the repository maintainers will run the root-level documentation pipeline (`npm run docs`) which will automatically compile your new knowledge into the master `gf_agent/SKILL.md` for all users!
