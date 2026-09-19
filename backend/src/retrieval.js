import { readFileSync } from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const KNOWLEDGE_BASE = JSON.parse(
  readFileSync(path.join(__dirname, 'data', 'legalPrinciples.json'), 'utf-8')
);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean);
}

// Precompute each entry's token set once at module load instead of
// re-tokenizing the same static doctrine text on every single request.
const TOKENIZED_KNOWLEDGE_BASE = Object.fromEntries(
  Object.entries(KNOWLEDGE_BASE).map(([subject, entries]) => [
    subject,
    entries.map(entry => ({
      entry,
      tokens: [...tokenize(entry.principle), ...tokenize(entry.description), ...entry.keywords.map(k => k.toLowerCase())]
    }))
  ])
);

// Common legal principles are asked about again and again (the same handful
// of subjects and near-duplicate fact patterns), so cache retrieval results
// in memory rather than re-scoring the whole knowledge base every time.
// Small, bounded, FIFO-evicted — this is a request-scoping cache, not a
// distributed one, which is the right scope for a single-process backend.
const CACHE_MAX_ENTRIES = 200;
const retrievalCache = new Map();
let cacheHits = 0;
let cacheMisses = 0;

function cacheKey({ subject, issue, facts, topN }) {
  return crypto.createHash('sha1').update(`${subject}\u0000${issue}\u0000${facts}\u0000${topN}`).digest('hex');
}

export function getRetrievalCacheStats() {
  return { size: retrievalCache.size, hits: cacheHits, misses: cacheMisses };
}

export function clearRetrievalCache() {
  retrievalCache.clear();
  cacheHits = 0;
  cacheMisses = 0;
}

/**
 * Lightweight retrieval-augmented-generation step: scores every curated
 * doctrine entry for the given subject against the student's issue/facts by
 * keyword overlap, and returns the most relevant ones as grounding context.
 *
 * This deliberately never touches case names or citations — the knowledge
 * base holds only general, verified legal doctrines (the same kind of thing
 * a first-year casebook would state), so retrieval augments the prompt with
 * real reference material instead of inventing anything.
 */
export function retrievePrinciples({ subject, issue, facts }, topN = 4) {
  const tokenizedEntries = TOKENIZED_KNOWLEDGE_BASE[subject];
  if (!tokenizedEntries || !tokenizedEntries.length) return [];

  const key = cacheKey({ subject, issue, facts, topN });
  const cached = retrievalCache.get(key);
  if (cached) {
    cacheHits += 1;
    return cached;
  }
  cacheMisses += 1;

  const result = computeRetrieval(tokenizedEntries, { issue, facts }, topN);

  if (retrievalCache.size >= CACHE_MAX_ENTRIES) {
    // Evict the oldest entry (Map preserves insertion order) to keep this bounded.
    retrievalCache.delete(retrievalCache.keys().next().value);
  }
  retrievalCache.set(key, result);

  return result;
}

function computeRetrieval(tokenizedEntries, { issue, facts }, topN) {
  const queryTokens = new Set([...tokenize(issue), ...tokenize(facts)]);
  if (queryTokens.size === 0) return tokenizedEntries.slice(0, topN).map(t => t.entry);

  const haystack = `${issue || ''} ${facts || ''}`.toLowerCase();

  const scored = tokenizedEntries.map(({ entry, tokens }) => {
    let score = 0;
    for (const token of tokens) {
      if (queryTokens.has(token)) score += 1;
    }
    // Multi-word keyword phrases (e.g. "meeting of the minds") also count via substring match.
    for (const phrase of entry.keywords) {
      if (phrase.includes(' ') && haystack.includes(phrase.toLowerCase())) score += 2;
    }
    return { entry, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const withSignal = scored.filter(s => s.score > 0);
  const pool = withSignal.length ? withSignal : scored;
  return pool.slice(0, topN).map(s => s.entry);
}
