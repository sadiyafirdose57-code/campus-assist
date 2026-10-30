import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import documentRoutes from './routes/documents.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) =>
    res.json({ ok: true, college: config.collegeName, ai: config.llm.provider }));

  app.use('/api/auth', authRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/documents', documentRoutes);

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  });
  return app;
}
