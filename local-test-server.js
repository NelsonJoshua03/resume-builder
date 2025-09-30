// local-test-server.js
import { handler } from './netlify/functions/jobs-rss.js';
import http from 'http';

const server = http.createServer(async (req, res) => {
  if (req.url === '/test-jobs') {
    const mockEvent = {
      httpMethod: 'GET',
      path: '/.netlify/functions/jobs-rss',
      queryStringParameters: {},
      headers: {},
      body: null
    };

    const mockContext = {};

    try {
      const result = await handler(mockEvent, mockContext);
      
      res.writeHead(result.statusCode, result.headers);
      res.end(result.body);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3000, () => {
  console.log('🚀 Local test server running on http://localhost:3000');
  console.log('📋 Test your function at: http://localhost:3000/test-jobs');
});