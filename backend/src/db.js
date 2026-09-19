import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configurable so tests can point at an isolated temp directory instead of
// polluting real data on disk.
const DATA_DIR = process.env.NYAYA_DATA_DIR || path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'nyaya.sqlite');

// A real embedded database (SQLite, via Node's built-in node:sqlite — no
// external dependency, no native build step) instead of hand-rolled flat
// JSON files: proper indexes, per-user composite-key isolation enforced by
// the schema itself, and no artificial row-count cap.
export const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT NOT NULL,
    userId TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    data TEXT NOT NULL,
    PRIMARY KEY (id, userId)
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_userId_timestamp ON sessions (userId, timestamp DESC);
`);

export function closeDb() {
  db.close();
}
