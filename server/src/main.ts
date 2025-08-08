// main server file
import express from 'express';
import path from 'path';
import postcoderoutes from './routes/postcode.js';
import parliamentroutes from './routes/parliament.js';
import { buildPostcodeDictionaryFromFiles } from './services/csvService.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Trust proxy if you run behind one locally (so req.ip resolves properly)
app.set('trust proxy', true);

console.log("✅ Main is running.");
app.use((req, _res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

try {
  app.use('/postcode', postcoderoutes);
  app.use('/parliament', parliamentroutes);
} catch (err) {
  console.error('❌ Error while mounting routes:', err);
}

app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, './client')));

// ------- LOCAL-ONLY ADMIN ENDPOINT -------
const isLocalEnv = process.env.NODE_ENV !== 'production';

// Simple localhost guard
const localOnly: express.RequestHandler = (req, res, next) => {
  const ip = req.ip || '';
  const isLoopback =
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('::ffff:127.0.0.1');

  if (isLoopback) return next();
  return res.status(403).send('Forbidden');
};

if (isLocalEnv) {
  app.get('/admin/build-postcode-dictionary', localOnly, async (_req, res) => {
    try {
      await buildPostcodeDictionaryFromFiles();
      res.json({ ok: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'Build failed' });
    }
  });
}
// -----------------------------------------

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, './client/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});