import { CodaConstants } from './constants.js';

/**
 * Fetches the user profile from Coda API using the provided API Key.
 * @param {string} codaKey The Coda API Key.
 * @returns {Promise<object>} The resolved Coda user profile.
 */
export async function fetchCodaProfile(codaKey) {
  const response = await fetch(CodaConstants.PROFILE_URL, {
    headers: { "Authorization": `Bearer ${codaKey}` }
  });
  if (!response.ok) {
    throw new Error(`Coda API responded with status ${response.status}`);
  }
  const userData = await response.json();
  return {
    id: userData.loginId || CodaConstants.DEFAULT_USER_ID,
    email: userData.email || CodaConstants.DEFAULT_USER_EMAIL,
    name: userData.name || CodaConstants.DEFAULT_USER_NAME,
    token: codaKey
  };
}
