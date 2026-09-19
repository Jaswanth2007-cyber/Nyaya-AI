import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

// Isolate this test run's data on disk before any of our modules (which read
// this env var at import time) are ever loaded.
const tmpDataDir = path.join(os.tmpdir(), `nyaya-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
process.env.NYAYA_DATA_DIR = tmpDataDir;
process.env.JWT_SECRET = 'test-secret-do-not-use-in-production';

const { createApp } = await import('./app.js');
const { closeDb } = await import('./db.js');

const app = createApp();
const server = app.listen(0);
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;

test.after(() => {
  server.close();
  closeDb();
  fs.rmSync(tmpDataDir, { recursive: true, force: true });
});

async function post(pathname, body, token) {
  const res = await fetch(`${base}${pathname}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  return { status: res.status, body: await res.json() };
}

async function get(pathname, token) {
  const res = await fetch(`${base}${pathname}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return { status: res.status, body: await res.json() };
}

async function del(pathname, token) {
  const res = await fetch(`${base}${pathname}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return { status: res.status, body: await res.json() };
}

test('signup creates a real account and returns a usable token', async () => {
  const { status, body } = await post('/api/auth/signup', {
    name: 'Aarav Sharma',
    email: 'aarav@law.edu',
    password: 'correct-horse-battery'
  });
  assert.equal(status, 201);
  assert.ok(body.token);
  assert.equal(body.user.email, 'aarav@law.edu');
  assert.equal(body.user.passwordHash, undefined, 'password hash must never be returned to the client');
});

test('signup rejects a duplicate email', async () => {
  await post('/api/auth/signup', { name: 'A', email: 'dup@law.edu', password: 'password123' });
  const { status, body } = await post('/api/auth/signup', { name: 'B', email: 'dup@law.edu', password: 'password456' });
  assert.equal(status, 409);
  assert.match(body.error, /already exists/);
});

test('signup rejects an invalid email format', async () => {
  const { status } = await post('/api/auth/signup', { name: 'A', email: 'not-an-email', password: 'password123' });
  assert.equal(status, 400);
});

test('signup rejects a too-short password', async () => {
  const { status } = await post('/api/auth/signup', { name: 'A', email: 'short@law.edu', password: '123' });
  assert.equal(status, 400);
});

test('login succeeds with correct credentials and fails with the wrong password', async () => {
  await post('/api/auth/signup', { name: 'Login Test', email: 'login@law.edu', password: 'right-password' });

  const ok = await post('/api/auth/login', { email: 'login@law.edu', password: 'right-password' });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.token);

  const wrong = await post('/api/auth/login', { email: 'login@law.edu', password: 'wrong-password' });
  assert.equal(wrong.status, 401);
});

test('login fails for an email that was never registered', async () => {
  const { status } = await post('/api/auth/login', { email: 'ghost@law.edu', password: 'whatever123' });
  assert.equal(status, 401);
});

test('protected routes reject requests with no token, and accept a valid one', async () => {
  const noToken = await get('/api/auth/me');
  assert.equal(noToken.status, 401);

  const { body: signupBody } = await post('/api/auth/signup', { name: 'Me', email: 'me@law.edu', password: 'password123' });
  const withToken = await get('/api/auth/me', signupBody.token);
  assert.equal(withToken.status, 200);
  assert.equal(withToken.body.user.email, 'me@law.edu');
});

test('protected routes reject a garbage/expired-looking token', async () => {
  const { status } = await get('/api/auth/me', 'not-a-real-token');
  assert.equal(status, 401);
});

test('sessions are private per-user, and full CRUD works end to end', async () => {
  const userA = (await post('/api/auth/signup', { name: 'A', email: 'sessions-a@law.edu', password: 'password123' })).body;
  const userB = (await post('/api/auth/signup', { name: 'B', email: 'sessions-b@law.edu', password: 'password123' })).body;

  const created = await post('/api/sessions', { title: 'Contract dispute practice', input: { facts: 'x', issue: 'y' } }, userA.token);
  assert.equal(created.status, 201);
  assert.ok(created.body.session.id);

  const listA = await get('/api/sessions', userA.token);
  assert.equal(listA.body.sessions.length, 1);

  const listB = await get('/api/sessions', userB.token);
  assert.equal(listB.body.sessions.length, 0, "user B must not see user A's sessions");

  const afterDelete = await del(`/api/sessions/${created.body.session.id}`, userA.token);
  assert.equal(afterDelete.status, 200);
  assert.equal(afterDelete.body.sessions.length, 0);
});

test('/api/score requires case fields and a prior argument', async () => {
  const missingFields = await post('/api/score', { argument: { issue: 'x' } });
  assert.equal(missingFields.status, 400);

  const missingArgument = await post('/api/score', {
    facts: 'f', issue: 'i', subject: 'Contract Law', jurisdiction: 'India'
  });
  assert.equal(missingArgument.status, 400);
});

test('guest login issues a real, working session token with no account created', async () => {
  const usersBefore = (await post('/api/auth/signup', { name: 'probe', email: 'probe-before@law.edu', password: 'password123' })).body;
  const { status, body } = await post('/api/auth/guest', {});
  assert.equal(status, 201);
  assert.ok(body.token);
  assert.equal(body.user, null);
  assert.equal(body.isGuest, true);
  assert.notEqual(body.token, usersBefore.token, 'guest token must be distinct from a real account token');
});

test('guest session and registered-account session both pass /api/auth/me, distinguished by isGuest', async () => {
  const guest = (await post('/api/auth/guest', {})).body;
  const guestMe = await get('/api/auth/me', guest.token);
  assert.equal(guestMe.status, 200);
  assert.equal(guestMe.body.user, null);
  assert.equal(guestMe.body.isGuest, true);

  const real = (await post('/api/auth/signup', { name: 'Real User', email: 'real-vs-guest@law.edu', password: 'password123' })).body;
  const realMe = await get('/api/auth/me', real.token);
  assert.equal(realMe.status, 200);
  assert.equal(realMe.body.user.email, 'real-vs-guest@law.edu');
  assert.equal(realMe.body.isGuest, false);
});

test('unified storage: a guest session can save/list/delete sessions through the exact same /api/sessions routes as a real account', async () => {
  const guest = (await post('/api/auth/guest', {})).body;

  const created = await post('/api/sessions', { title: 'Guest practice session' }, guest.token);
  assert.equal(created.status, 201);

  const listed = await get('/api/sessions', guest.token);
  assert.equal(listed.body.sessions.length, 1);
  assert.equal(listed.body.sessions[0].title, 'Guest practice session');

  const afterDelete = await del(`/api/sessions/${created.body.session.id}`, guest.token);
  assert.equal(afterDelete.body.sessions.length, 0);
});

test('session history has no artificial row cap — well past the old 50-entry limit still persists in full', async () => {
  const user = (await post('/api/auth/signup', { name: 'Heavy User', email: 'heavy-user@law.edu', password: 'password123' })).body;

  for (let i = 0; i < 60; i++) {
    await post('/api/sessions', { title: `Session ${i}` }, user.token);
  }

  const { body } = await get('/api/sessions', user.token);
  assert.equal(body.sessions.length, 60);
});

test('streaming /api/generate still validates required fields before ever contacting Groq', async () => {
  const { status, body } = await post('/api/generate', { stream: true, facts: 'only facts, no issue/subject/jurisdiction' });
  assert.equal(status, 400);
  assert.match(body.error, /Missing required field/);
});
