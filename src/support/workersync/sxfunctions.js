import fsSync from 'node:fs';
const dbg = (msg) => fsSync.appendFileSync('/tmp/worker-debug.log', `${new Date().toISOString()} ${msg}\n`);

dbg('[sxfunctions.js] START');

const mods = {};
const load = async (name, path) => {
  dbg(`[sxfunctions.js] loading ${name}...`);
  mods[name] = await import(path);
  dbg(`[sxfunctions.js] loaded ${name}`);
};

await load('sxdrive', '../sxdrive.js');
await load('sxsheets', '../sxsheets.js');
await load('sxdocs', '../sxdocs.js');
await load('sxslides', '../sxslides.js');
await load('sxforms', '../sxforms.js');
await load('sxfetch', '../sxfetch.js');
await load('sxstore', '../sxstore.js');
await load('sxzip', '../sxzip.js');
await load('sxauth', '../sxauth.js');
await load('sxgmail', '../sxgmail.js');
await load('sxcalendar', '../sxcalendar.js');
await load('sxxlsx', '../sxxlsx.js');
await load('sxtoken', '../sxtoken.js');
await load('sxbigquery', '../sxbigquery.js');
await load('sxjdbc', '../sxjdbc.js');

dbg('[sxfunctions.js] ALL LOADED');

// re-export everything as named exports, mirroring the original export * behavior
const merged = Object.assign({}, ...Object.values(mods));
export default merged;