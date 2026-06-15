# Skill: gf-agent-maintenance

## Overview
This skill is used to maintain and update the `gf_agent` (Google Apps Script Local Automation Agent) under `skills/gf_agent`. It ensures the agent's internal skills, index, and documentation stay synchronized with the latest implementations in `gas-fakes`.

## Responsibilities
1. **Synchronize Skills**: Run `node skills/gf_agent/scripts/builder.js` whenever `progress/` files are updated to refresh the agent's knowledge base.
2. **Update Documentation**: Analyze new test files in `test/` to extract usage patterns and add them to `skills/gf_agent/documentation.md`.
3. **Verify Agent**: Ensure `skills/gf_agent/SKILL.md` and `skills/gf_agent/README.md` accurately reflect the current capabilities of the project.
4. **Package for Distribution**: Ensure the `skills/gf_agent/` directory is self-contained and ready for download by users.

## Workflow
1. **Detect Changes**: Monitor `progress/` and `test/` for updates.
2. **Local Model Consultation**: Delegate log analysis, pattern extraction from tests, and drafts of documentation updates (`skills/gf_agent/documentation.md`, etc.) to the local model via the `omlx/query_local_model` tool.
3. **Run Builder**: Execute the build script to regenerate markdown files.
4. **Refine Patterns**: If a new service or complex pattern is added to `test/`, document it in `skills/gf_agent/documentation.md` using the local model's extracted patterns.
5. **Test/Verify the Agent**: Use the local model to simulate user requests, verify code generation, and ensure the agent performs as expected.
