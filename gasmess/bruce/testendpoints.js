import '../../main.js';
import got from 'got';

const testEndpoints = async () => {
  const token = process.env.KSUITE_TOKEN;
  const baseUrl = 'https://api.infomaniak.com';
  
  const endpoints = [
    'profile',
    '1/user',
    '1/user/me',
    '2/user/info',
    '1/account',
    '2/drive'
  ];

  console.log('--- Testing Endpoints with Current Token ---');
  
  for (const ep of endpoints) {
    try {
      const url = `${baseUrl}/${ep}`;
      console.log(`
Testing ${url}...`);
      const response = await got(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'json'
      });
      console.log(`SUCCESS: ${ep}`);
      console.log('Data sample:', JSON.stringify(response.body.data).substring(0, 200));
    } catch (err) {
      console.log(`FAILED: ${ep} - ${err.message}`);
      if (err.response?.body) {
        console.log('Response Error:', JSON.stringify(err.response.body));
      }
    }
  }
};

testEndpoints();
