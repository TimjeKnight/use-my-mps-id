import express from 'express';
import path from 'path';
import postcoderoutes from './routes/postcode.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

console.log("✅ Main is running.");
// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

try {
  app.use('/postcode', postcoderoutes);
} catch (err) {
  console.error('❌ Error while mounting /postcode:', err);
}

app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Serve React static files from root
app.use(express.static(path.join(__dirname, './client')));



app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, './client/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
