// test-direct.js
import { Auth } from './src/support/auth.js';
import { sxDrive, sxStreamUpMedia } from './src/support/sxdrive.js'; // adjust path

async function runDirectTest() {
  try {
    console.log('--- Initializing Auth ---');
    Auth.setPlatform('coda');
    
    // Set token if testing with API keys directly or via Auth
    // Auth.setIdentity('coda', { accessToken: process.env.CODA_API_KEY });

    console.log('--- Testing sxDrive (list) ---');
    const listRes = await sxDrive(Auth, {
      prop: 'files',
      method: 'list',
      params: {}
    });
    console.log('List Success:', listRes);

    console.log('--- Testing sxStreamUpMedia ---');
    const testBytes = Array.from(Buffer.from('Hello from Direct Mode'));
    const createRes = await sxStreamUpMedia(Auth, {
      method: 'create',
      resource: { name: 'DirectTestDoc' },
      bytes: testBytes,
      mimeType: 'text/plain'
    });
    console.log('Create Success:', createRes);

  } catch (err) {
    console.error('*** DIRECT EXECUTION FAILED WITH STACK TRACE ***');
    console.error(err);
  }
}

runDirectTest();