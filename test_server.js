const http = require('http');
console.log('Starting minimal server...');
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Minimal Server OK');
});

server.listen(5175, '127.0.0.1', () => {
  console.log('Server is listening on http://127.0.0.1:5175');
});

setTimeout(() => {
  console.log('Closing server after 5s...');
  server.close();
  process.exit(0);
}, 5000);
