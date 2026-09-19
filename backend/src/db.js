import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configurable so tests can point at an isolated temp directory instead of
// polluting real data on disk.
const DATA_DIR = process.env.NYAYA_DATA_DIR || path.join(__dirname, '..', 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

export function readCollection(name) {
  ensureDataDir();
  const file = filePath(name);
  if (!fs.existsSync(file)) return [];
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return raw.trim() ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeCollection(name, records) {
  ensureDataDir();
  fs.writeFileSync(filePath(name), JSON.stringify(records, null, 2), 'utf-8');
}
