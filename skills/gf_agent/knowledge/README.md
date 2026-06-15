# gf_agent Knowledge Base

This directory contains modular markdown files representing the "Lessons Learned & Best Practices" for the `gf_agent` skill.

## Contributing

To prevent Git merge conflicts on the monolithic `skills/gf_agent/SKILL.md` file, collaborators should **never edit `skills/gf_agent/SKILL.md` directly**. 

Instead, to add new knowledge or instructions to the agent:
1. Create a new markdown file in this directory (e.g., `06-new-feature.md`).
2. Prefix it with a number to control the insertion order.
3. Write your instructions, tips, or parity warnings.
4. Commit ONLY your new markdown file and submit a Pull Request.

**Do not attempt to compile the SKILL.md file yourself.**
When your Pull Request is merged into the core `gas-fakes` repository, the maintainer will run the overarching `npm run docs` pipeline. The `builder.js` script will automatically read all files in this directory, sort them, and cleanly generate the final `skills/gf_agent/SKILL.md` artifact for all users.
