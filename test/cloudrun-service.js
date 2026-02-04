
import '@mcpher/gas-fakes'
import { testFakes } from './test.js';
import http from 'http';

const server = http.createServer(async (req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);

  if (req.url === '/run' || req.url === '/') {

    try {


      testFakes();


      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Test execution completed. Check Cloud Run logs for details.');
    } catch (error) {
      console.error('Test execution failed:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Test execution failed: ${error.message}`);
    }
  } else if (req.url === '/healthz') {
    res.writeHead(200);
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Cloud Run test runner listening on port ${port}`);
});
