
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

//board key and certificate name
//const cert_key_name = configs.cert_key_name;

// const sslOptions = {
//   key: fs.readFileSync('../certs/'+cert_key_name+'.key'),
//   cert: fs.readFileSync('../certs/'+cert_key_name+'.crt')
// };


const configs = require('./config/config.json');

//board key and certificate name
const cert_key_name = configs.cert_key_name;
const staticPath = '../Callisto-UI/dist';

const sslOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};



// Serve the static files
app.use(express.static(staticPath));

// Define your API routes
app.get('/api/data', (req, res) => {
  // Handle API requests here
  res.json({ message: 'API response' });
});

// Serve the Vue.js app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(staticPath, 'index.html'));
});

// Create HTTPS server
//const server = http.createServer(app);
const server = https.createServer(sslOptions, app);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(80);
