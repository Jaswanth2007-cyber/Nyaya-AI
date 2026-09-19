import { readFileSync } from 'node:fs';
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
  const entries = KNOWLEDGE_BASE[subject];
  if (!entries || !entries.length) return [];

  const queryTokens = new Set([...tokenize(issue), ...tokenize(facts)]);
  if (queryTokens.size === 0) return entries.slice(0, topN);

  const scored = entries.map(entry => {
    const entryTokens = [...tokenize(entry.principle), ...tokenize(entry.description), ...entry.keywords.map(k => k.toLowerCase())];
    let score = 0;
    for (const token of entryTokens) {
      if (queryTokens.has(token)) score += 1;
    }
    // Multi-word keyword phrases (e.g. "meeting of the minds") also count via substring match.
    const haystack = `${issue || ''} ${facts || ''}`.toLowerCase();
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
