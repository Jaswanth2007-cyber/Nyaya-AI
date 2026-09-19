import crypto from 'node:crypto';
import { db } from './db.js';

// Everything besides id/userId/timestamp is stored as a JSON blob — the
// CaseSession shape (title, input, argument, counterargument, explanation,
// status) is UI-defined and doesn't need its own rigid columns, but id/userId
// stay real indexed SQL columns so lookups, ordering, and per-user isolation
// are enforced by the database itself rather than by application code.
const PAYLOAD_FIELDS = ['title', 'input', 'argument', 'counterargument', 'explanation', 'status'];

function toRecord(row) {
  return { id: row.id, userId: row.userId, timestamp: row.timestamp, ...JSON.parse(row.data) };
}

export function listSessions(userId) {
  const rows = db.prepare('SELECT * FROM sessions WHERE userId = ? ORDER BY timestamp DESC').all(userId);
  return rows.map(toRecord);
}

export function upsertSession(userId, session) {
  const id = session.id || crypto.randomUUID();
  const timestamp = session.timestamp || Date.now();

  const payload = {};
  for (const field of PAYLOAD_FIELDS) {
    if (field in session) payload[field] = session[field];
  }
  const data = JSON.stringify(payload);

  // (id, userId) is the composite primary key: if another user's request
  // happens to reuse the same session id, it inserts as a new row scoped to
  // them instead of overwriting the original owner's session.
  db.prepare(`
    INSERT INTO sessions (id, userId, timestamp, data)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id, userId) DO UPDATE SET timestamp = excluded.timestamp, data = excluded.data
  `).run(id, userId, timestamp, data);

  return { id, userId, timestamp, ...payload };
}

export function deleteSession(userId, sessionId) {
  db.prepare('DELETE FROM sessions WHERE id = ? AND userId = ?').run(sessionId, userId);
  return listSessions(userId);
}

export function clearSessions(userId) {
  db.prepare('DELETE FROM sessions WHERE userId = ?').run(userId);
}
