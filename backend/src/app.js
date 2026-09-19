import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import { callGroqJson, streamGroqJson, GroqError } from './groqClient.js';
import { buildGeneratePrompt, buildCounterargumentPrompt, buildExplainPrompt, buildScorePrompt } from './prompts.js';
import { requireFields, findOversizedField, MAX_FIELD_LENGTH } from './validators.js';
import { createUser, verifyCredentials, getUserById, signToken, requireAuth, isValidEmail, isValidPassword } from './auth.js';
import { listSessions, upsertSession, deleteSession, clearSessions } from './sessions.js';
import { retrievePrinciples } from './retrieval.js';

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
      // Retrieval-augmented grounding: pull the most relevant verified general
      // doctrines for this subject/fact-pattern from the curated knowledge base
      // before generating, so the model's "general_principles" lean on real
      // reference material rather than free-associating doctrine names.
      const retrievedPrinciples = retrievePrinciples(req.body);
      const { system, user } = buildGeneratePrompt({ ...req.body, retrievedPrinciples });

      // Optional token-level streaming: the client opts in with { stream: true }
      // and receives live "event: delta" chunks over SSE as Groq generates,
      // followed by one "event: complete" carrying the fully-parsed JSON.
      if (req.body.stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        try {
          const data = await streamGroqJson({ system, user }, delta => {
            res.write(`event: delta\ndata: ${JSON.stringify({ text: delta })}\n\n`);
          });
          res.write(`event: complete\ndata: ${JSON.stringify(data)}\n\n`);
        } catch (streamErr) {
          const message = streamErr instanceof GroqError ? streamErr.message : 'Streaming generation failed.';
          res.write(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`);
        } finally {
          res.end();
        }
        return;
      }

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

  // Anonymous, no-signup session — used by the "1-Click Instant Access" path.
  // Issues a real, backend-verified token so guest history goes through the
  // exact same /api/sessions storage as a registered account (no separate
  // localStorage-only code path to keep in sync).
  app.post('/api/auth/guest', (_req, res) => {
    const guestId = `guest_${crypto.randomUUID()}`;
    const token = signToken(guestId);
    res.status(201).json({ token, user: null, isGuest: true });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = getUserById(req.userId);
    // A valid token whose id has no stored user record is a guest session,
    // not an error — sessions work identically for guests and real accounts.
    res.json({ user, isGuest: !user });
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
