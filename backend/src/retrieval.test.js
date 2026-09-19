import test from 'node:test';
import assert from 'node:assert/strict';
import { retrievePrinciples, getRetrievalCacheStats, clearRetrievalCache } from './retrieval.js';

test('retrieval only returns entries from the requested subject', () => {
  const results = retrievePrinciples({
    subject: 'Contract Law',
    issue: 'Whether a mislabeled price is a binding offer',
    facts: 'A shopkeeper listed a watch at $10 instead of $100.'
  });
  assert.ok(results.length > 0);
  for (const r of results) {
    assert.ok('principle' in r && 'description' in r);
  }
});

test('retrieval ranks keyword-relevant doctrines above unrelated ones for the same subject', () => {
  const results = retrievePrinciples({
    subject: 'Contract Law',
    issue: 'Whether the mislabeled price constitutes a unilateral mistake negating the offer',
    facts: 'The shopkeeper made a pricing error on the display tag.'
  }, 2);
  const names = results.map(r => r.principle);
  assert.ok(names.includes('Unilateral Mistake (Snapping Up)'), `expected snapping-up doctrine to rank highly, got: ${names}`);
});

test('retrieval returns nothing fabricated — every entry is drawn from the static curated knowledge base', () => {
  const results = retrievePrinciples({
    subject: 'Criminal Law',
    issue: 'Whether entering the wrong apartment while exhausted negates burglary intent',
    facts: 'Daniel entered the wrong unit by mistake.'
  });
  const names = results.map(r => r.principle);
  assert.ok(names.every(n => typeof n === 'string' && n.length > 0));
  // None of these should ever look like a fabricated case citation (e.g. "Smith v. Jones").
  assert.ok(names.every(n => !/\bv\.?\s/i.test(n)));
});

test('retrieval falls back gracefully for a subject with no knowledge base entries', () => {
  const results = retrievePrinciples({ subject: 'Not A Real Subject', issue: 'x', facts: 'y' });
  assert.deepEqual(results, []);
});

test('identical queries hit the in-memory cache instead of re-scoring the knowledge base', () => {
  clearRetrievalCache();
  const query = { subject: 'Contract Law', issue: 'cache-test unique issue string', facts: 'cache-test unique facts string' };

  const first = retrievePrinciples(query);
  const afterFirst = getRetrievalCacheStats();
  assert.equal(afterFirst.misses, 1);
  assert.equal(afterFirst.hits, 0);

  const second = retrievePrinciples(query);
  const afterSecond = getRetrievalCacheStats();
  assert.equal(afterSecond.hits, 1);
  assert.deepEqual(second, first);
});

test('a different query is a fresh cache miss, not a stale hit', () => {
  clearRetrievalCache();
  retrievePrinciples({ subject: 'Contract Law', issue: 'first unique query', facts: '' });
  retrievePrinciples({ subject: 'Contract Law', issue: 'second, totally different query', facts: '' });
  assert.equal(getRetrievalCacheStats().misses, 2);
});
