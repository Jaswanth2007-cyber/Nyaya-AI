import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { callGroqJson, GroqError } from './groqClient.js';
import { buildGeneratePrompt, buildCounterargumentPrompt, buildExplainPrompt } from './prompts.js';
import { requireFields, findOversizedField, MAX_FIELD_LENGTH } from './validators.js';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    message: 'Nayaya-AI backend is running',
    provider: 'groq',
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    keyConfigured: Boolean(process.env.GROQ_API_KEY)
  });
});

app.post('/api/generate', async (req, res, next) => {
  try {
    const missing = requireFields(req.body, ['facts', 'issue', 'subject', 'jurisdiction']);
    if (missing.length) {
      return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
    }
    const oversized = findOversizedField(req.body, ['facts', 'issue']);
    if (oversized) {
      return res.status(400).json({ error: `Field "${oversized}" exceeds the ${MAX_FIELD_LENGTH}-character limit.` });
    }
    const { system, user } = buildGeneratePrompt(req.body);
    const data = await callGroqJson({ system, user });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post('/api/counterargument', async (req, res, next) => {
  try {
    const missing = requireFields(req.body, ['facts', 'issue', 'subject', 'jurisdiction']);
    if (missing.length) {
      return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
    }
    const oversized = findOversizedField(req.body, ['facts', 'issue']);
    if (oversized) {
      return res.status(400).json({ error: `Field "${oversized}" exceeds the ${MAX_FIELD_LENGTH}-character limit.` });
    }
    const { system, user } = buildCounterargumentPrompt(req.body);
    const data = await callGroqJson({ system, user });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post('/api/explain', async (req, res, next) => {
  try {
    const missing = requireFields(req.body, ['reasoning_text']);
    if (missing.length) {
      return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
    }
    const oversized = findOversizedField(req.body, ['reasoning_text']);
    if (oversized) {
      return res.status(400).json({ error: `Field "${oversized}" exceeds the ${MAX_FIELD_LENGTH}-character limit.` });
    }
    const { system, user } = buildExplainPrompt(req.body);
    const data = await callGroqJson({ system, user });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err instanceof GroqError ? err.status : 500;
  console.error('[nayaya-backend]', err.message);
  res.status(status).json({ error: err.message || 'Internal server error' });
});

const port = Number(process.env.PORT) || 8000;
app.listen(port, () => {
  console.log(`Nayaya-AI backend listening on http://localhost:${port}`);
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠ GROQ_API_KEY is not set — /api/generate, /api/counterargument and /api/explain will fail until you add it to backend/.env');
  }
});
