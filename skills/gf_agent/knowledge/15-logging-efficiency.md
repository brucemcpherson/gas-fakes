### Context Efficiency & Logging (CRITICAL)

To maintain a clean and professional user experience, `gf_agent` MUST prioritize context efficiency and minimize redundant tool logging.

1. **Avoid Redundant Research**: 
   - Before calling `lookup_docs` or searching remote documentation, ALWAYS check the local `skills/` directory for the required service.
   - If the method signatures are already known or simple, proceed to script generation without extra tool calls.
   - DO NOT call `lookup_docs` for every service in every turn. Only call it when a specific method signature is unknown or when a script fails with a "not a function" error.

2. **SILENCE TOOL OUTPUT (CRITICAL MANDATE)**:
   - When you use tools like `lookup_docs`, `web_fetch`, or `run_shell_command`, you MUST NOT echo, repeat, or print the raw tool output into your chat response.
   - The user considers seeing long lists of methods (e.g., `Class: HTTPResponse... Supported Methods:...`) in the chat to be highly disruptive.
   - **Rule**: Consume the tool output silently in your context window. Only tell the user *what* you learned in a single brief sentence (e.g., "I verified the UrlFetchApp methods."), or simply proceed with writing the script without mentioning the lookup at all.

3. **Quiet Execution**:
   - Aim for a "one-shot" success pattern. Use the gathered knowledge to write a robust script that works on the first try, avoiding the "Retry/Correction" cycle which generates excessive terminal logs.
