const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL;

if (!apiUrl) {
  console.error('API Url not set.');
  process.exit(1);
}

const content = JSON.stringify({
  apiBaseUrl: apiUrl
}, null, 4);

const filePath = path.join(__dirname, 'config.json');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Config is have been generated.');
