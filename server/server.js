const fs = require('fs');
const http = require('http');
const express = require('express');
const path = require('path');
const cors = require('cors');
const {generateScript} = require('./generator');

const SERVER_PORT = 3000;
const STATIC_FILES_ROOT = path.resolve(__dirname, '../');
const GENERATED_DIR = path.resolve(__dirname, '../generated-scripts');

const FILE_TTL = 3 * 24 * 60 * 60 * 1000;
const CLEAN_INTERVAL = 24 * 60 * 60 * 1000;

const app = express();

const allowedOrigins = ['https://snowfall-generator.ru'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Access denied'));
    }
  }
}));

app.use(express.json());
app.use(express.static(STATIC_FILES_ROOT));

app.post('/generate-script', async (req, res) => {
  try {
    const params = req.body;
    const generatedFilePath = await generateScript(params);
    const relativePath = path.relative(STATIC_FILES_ROOT, generatedFilePath).replace(/\\/g, '/');
    res.json({scriptUrl: `/${relativePath}`});
  }
  catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({error: 'Script generation error'});
  }
});

http.createServer(app).listen(SERVER_PORT, () => {
  console.log(`HTTP server running at http://localhost:${SERVER_PORT}`);
});

async function cleanOldFiles() {
  try {
    const files = await fs.promises.readdir(GENERATED_DIR);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(GENERATED_DIR, file);
      const stats = await fs.promises.stat(filePath);

      if (now - stats.mtimeMs > FILE_TTL) {
        await fs.promises.unlink(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    }
  }
  catch (error) {
    console.error('Error during cleaning old files:', error);
  }
}

cleanOldFiles();
setInterval(cleanOldFiles, CLEAN_INTERVAL);
