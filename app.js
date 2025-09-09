const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const { Readable } = require('stream');

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

const MAP_TILE_TOKEN = process.env.MAP_TILE_TOKEN;

app.get('/tiles/:z/:x/:y.png', async (req, res) => {
  const { z, x, y } = req.params;
  const tileUrl = `https://api.maptiler.com/maps/aquarelle/256/${z}/${x}/${y}.png?key=${MAP_TILE_TOKEN}`;
  console.log('Fetching tile:', tileUrl);
  try {
    const response = await fetch(tileUrl);
    console.log('Tile fetch status:', response.status);
    if (!response.ok) {
      const text = await response.text();
      console.error('Tile fetch failed:', response.status, text);
      return res.status(response.status).send('Tile not found');
    }
    res.set('Content-Type', 'image/png');
    // Convert 'web' ReadableStream to Node.js stream
    const nodeStream = Readable.fromWeb(response.body);
    nodeStream.pipe(res);
  } catch (err) {
    console.error('Error fetching tile:', err);
    res.status(500).send('Error fetching tile');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

app.get('/inventory', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'inventory.html'));
});

app.get('/resume', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets/docs/resume.pdf'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});