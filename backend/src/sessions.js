import crypto from 'node:crypto';
import { readCollection, writeCollection } from './db.js';

const SESSIONS_COLLECTION = 'sessions';

export function listSessions(userId) {
  return readCollection(SESSIONS_COLLECTION)
    .filter(s => s.userId === userId)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function upsertSession(userId, session) {
  const sessions = readCollection(SESSIONS_COLLECTION);
  const id = session.id || crypto.randomUUID();
  const existingIndex = sessions.findIndex(s => s.id === id && s.userId === userId);

  const record = { ...session, id, userId, timestamp: session.timestamp || Date.now() };

  if (existingIndex >= 0) {
    sessions[existingIndex] = record;
  } else {
    sessions.push(record);
  }

  writeCollection(SESSIONS_COLLECTION, sessions);
  return record;
}

export function deleteSession(userId, sessionId) {
  const sessions = readCollection(SESSIONS_COLLECTION);
  const next = sessions.filter(s => !(s.id === sessionId && s.userId === userId));
  writeCollection(SESSIONS_COLLECTION, next);
  return next.filter(s => s.userId === userId);
}

export function clearSessions(userId) {
  const sessions = readCollection(SESSIONS_COLLECTION);
  const next = sessions.filter(s => s.userId !== userId);
  writeCollection(SESSIONS_COLLECTION, next);
}
