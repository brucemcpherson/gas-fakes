
// testing locally
// sync the version with gas fakes code since they share a package.json
import { initMetadata } from './src/support/metadata.js';
initMetadata();
console.log (`...gas-fakes version ${globalThis.GasFakes.metadata.version}`)
import './src/index.js'