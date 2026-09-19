import express from 'express';
import cors from 'cors';
import { callGroqJson, GroqError } from './groqClient.js';
import { buildGeneratePrompt, buildCounterargumentPrompt, buildExplainPrompt, buildScorePrompt } from './prompts.js';
import { requireFields, findOversizedField, MAX_FIELD_LENGTH } from './validators.js';
import { createUser, verifyCredentials, getUserById, signToken, requireAuth, isValidEmail, isValidPassword } from './auth.js';
import { listSessions, upsertSession, deleteSession, clearSessions } from './sessions.js';

export function createApp() {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
  app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      version: '1.1.0',
      message: 'Nyaya-AI backend is running',
      provider: 'groq',
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      keyConfigured: Boolean(process.env.GROQ_API_KEY)
    });
  });

  // ---------- LLM-backed generation routes ----------

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

  app.post('/api/score', async (req, res, next) => {
    try {
      const missing = requireFields(req.body, ['facts', 'issue', 'subject', 'jurisdiction']);
      if (missing.length) {
        return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
      }
      if (!req.body.argument || typeof req.body.argument !== 'object') {
        return res.status(400).json({ error: 'Missing required field: argument' });
      }
      const { system, user } = buildScorePrompt(req.body);
      const data = await callGroqJson({ system, user });
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  // ---------- Auth routes ----------

  app.post('/api/auth/signup', async (req, res, next) => {
    try {
      const { name, email, password } = req.body || {};
      const missing = requireFields(req.body, ['name', 'email', 'password']);
      if (missing.length) {
        return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
      }
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }
      if (!isValidPassword(password)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
      }

      const user = await createUser({ name, email, password });
      const token = signToken(user.id);
      res.status(201).json({ token, user });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/login', async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      const missing = requireFields(req.body, ['email', 'password']);
      if (missing.length) {
        return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
      }

      const user = await verifyCredentials({ email, password });
      const token = signToken(user.id);
      res.json({ token, user });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = getUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  });

  // ---------- Server-persisted session history (authenticated) ----------

  app.get('/api/sessions', requireAuth, (req, res) => {
    res.json({ sessions: listSessions(req.userId) });
  });

  app.post('/api/sessions', requireAuth, (req, res) => {
    const record = upsertSession(req.userId, req.body || {});
    res.status(201).json({ session: record });
  });

  app.delete('/api/sessions/:id', requireAuth, (req, res) => {
    const sessions = deleteSession(req.userId, req.params.id);
    res.json({ sessions });
  });

  app.delete('/api/sessions', requireAuth, (req, res) => {
    clearSessions(req.userId);
    res.json({ sessions: [] });
  });

  app.use((req, res) => {
    res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || (err instanceof GroqError ? err.status : 500);
    console.error('[nyaya-backend]', err.message);
    res.status(status).json({ error: err.message || 'Internal server error' });
  });

  return app;
}
