import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const SALT_ROUNDS = 10;
const TOKEN_TTL = '7d';

// Falls back to a random per-process secret so the server never boots with a
// hardcoded/empty secret. Set JWT_SECRET in .env for stable sessions across restarts.
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export async function createUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    createdAt: Date.now()
  };

  db.prepare('INSERT INTO users (id, name, email, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)')
    .run(user.id, user.name, user.email, user.passwordHash, user.createdAt);

  return toPublicUser(user);
}

export async function verifyCredentials({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

  // Always run bcrypt.compare (even against a dummy hash) so login timing
  // doesn't leak whether the email exists.
  const hashToCheck = user?.passwordHash || '$2a$10$invalidsaltinvalidsaltinvalidsaO';
  const isMatch = await bcrypt.compare(password, hashToCheck);

  if (!user || !isMatch) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  return toPublicUser(user);
}

export function getUserById(id) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return user ? toPublicUser(user) : null;
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET).sub;
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }

  try {
    req.userId = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}
