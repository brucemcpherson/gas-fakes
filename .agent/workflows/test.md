---
description: How to run tests for gas-fakes
---
All tests must be run from the `test` directory to ensure environment variables and dependencies are correctly loaded.

1. Set the working directory to the `test` folder.
2. Run the specific test script using `npm run`.


Or if you want to run a specific test file directly:
```bash
cd test && node testsandbox.js execute
```

> [!IMPORTANT]
> Never run tests from the root directory as they will fail to find the `.env` file and other local dependencies.
