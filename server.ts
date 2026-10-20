import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { analyzePrescriptionWithGemini } from './api/analyze-prescription.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'RxLens Prescription Reader API',
      geminiConfigured: Boolean(
        process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
      )
    });
  });

  app.post('/api/analyze-prescription', async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body || {};
      if (!imageBase64) {
        res.status(400).json({ error: 'Please provide an imageBase64 payload.' });
        return;
      }
      const extracted = await analyzePrescriptionWithGemini(
        imageBase64,
        mimeType || 'image/jpeg'
      );
      res.json(extracted);
    } catch (error: any) {
      res.status(500).json({
        error: error?.message || 'Unable to process prescription photo via Gemini Vision.'
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RxLens server listening on http://localhost:${PORT}`);
  });
}

startServer();
