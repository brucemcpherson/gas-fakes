import inspector from 'node:inspector';

export const isDebugging = () => {
  // 1. Catches VS Code Auto Attach once the debugger activates the session
  if (inspector.url() !== undefined) {
    return true;
  }

  // 2. Catches VS Code Auto Attach injecting the inspector flag into Node options
  if (process.env.NODE_OPTIONS && /--inspect(-brk)?/.test(process.env.NODE_OPTIONS)) {
    return true;
  }

  // 3. Catches explicit VS Code environment variables
  if (process.env.VSCODE_INSPECTOR_OPTIONS) {
    return true;
  }

  return false;
}