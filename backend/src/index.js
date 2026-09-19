import 'dotenv/config';
import { createApp } from './app.js';
import { logger } from './logger.js';

const app = createApp();
const port = Number(process.env.PORT) || 8000;

app.listen(port, () => {
  logger.info({ port }, 'Nyaya-AI backend listening');
  if (!process.env.GROQ_API_KEY) {
    logger.warn('GROQ_API_KEY is not set — /api/generate, /api/counterargument, /api/explain and /api/score will fail until you add it to backend/.env');
  }
  if (!process.env.JWT_SECRET) {
    logger.warn('JWT_SECRET is not set — using a random per-process secret, so sessions will not survive a server restart. Set JWT_SECRET in backend/.env for stable sessions.');
  }
});
