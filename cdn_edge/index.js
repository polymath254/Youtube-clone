const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 9000;

const CACHE_DIR = path.join(__dirname, 'cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

const BACKEND_BASE = "http://localhost:8000/media/videos";

app.get('/videos/:filename', async (req, res) => {
  const filename = req.params.filename;
  const cachePath = path.join(CACHE_DIR, filename);

  if (fs.existsSync(cachePath)) {
    console.log(`[CDN] Serving from cache: ${filename}`);
    return res.sendFile(cachePath);
  }

  try {
    const backendUrl = `${BACKEND_BASE}/${filename}`;
    console.log(`[CDN] Fetching from backend: ${backendUrl}`);
    const response = await axios.get(backendUrl, { responseType: 'stream' });
    const writeStream = fs.createWriteStream(cachePath);
    response.data.pipe(writeStream);
    response.data.pipe(res);
    writeStream.on('finish', () => {
      console.log(`[CDN] Cached: ${filename}`);
    });
  } catch (err) {
    res.status(404).send('Video not found');
  }
});

app.listen(PORT, () => {
  console.log(`CDN Edge Server running on http://localhost:${PORT}`);
});
