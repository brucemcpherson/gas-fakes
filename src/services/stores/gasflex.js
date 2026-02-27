import { Auth } from '../../support/auth.js'

// Refactored to a function to avoid early initialization and platform-specific issues
// This ensures getOAuthToken() is only called when a store is actually accessed
export const getStoreModels = () => {
  return {
    SCRIPT: {
      scriptId: ScriptApp.getScriptId()
    },
    USER: {
      scriptId: ScriptApp.getScriptId(),
      userId: Auth.getUserId()
    },
    DOCUMENT: {
      scriptId: ScriptApp.getScriptId(),
      documentId: Auth.getDocumentId()
    }
  }
}
