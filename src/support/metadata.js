import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

/**
 * Initializes the global GasFakes metadata object.
 * @param {string} packageJsonPath The relative path to package.json from this file.
 * @returns {object} The GasFakes global object.
 */
export function initMetadata(packageJsonPath = '../../package.json') {
  // add the version number to gasfakes metadata

  if (!globalThis.GasFakes) globalThis.GasFakes = {};
  const pjson = require(packageJsonPath);
  if (!globalThis.GasFakes.metadata) globalThis.GasFakes.metadata =  {}
  globalThis.GasFakes.metadata.version = pjson.version

  return globalThis.GasFakes;
}
