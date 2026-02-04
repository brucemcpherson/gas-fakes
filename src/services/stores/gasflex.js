import { Auth } from '../../support/auth.js'
import { getUserIdFromToken } from '@mcpher/gas-flex-cache'

// these are the default models to match live apps script
export const storeModels = {
  SCRIPT: {
    scriptId: ScriptApp.getScriptId()
  },
  USER: {
    scriptId: ScriptApp.getScriptId(),
    userId: getUserIdFromToken(ScriptApp.getOAuthToken())
  },
  DOCUMENT: {
    scriptId: ScriptApp.getScriptId(),
    documentId: Auth.getDocumentId()
  }
}
