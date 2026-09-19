import test from 'node:test';
import assert from 'node:assert/strict';
import { requireFields, findOversizedField, MAX_FIELD_LENGTH } from './validators.js';

test('requireFields flags missing and blank fields', () => {
  const missing = requireFields({ facts: 'ok', issue: '   ' }, ['facts', 'issue', 'subject']);
  assert.deepEqual(missing, ['issue', 'subject']);
});

test('requireFields returns empty array when all fields are present', () => {
  const missing = requireFields({ facts: 'a', issue: 'b' }, ['facts', 'issue']);
  assert.deepEqual(missing, []);
});

test('findOversizedField flags a string field over the limit', () => {
  const oversized = findOversizedField({ facts: 'x'.repeat(MAX_FIELD_LENGTH + 1) }, ['facts']);
  assert.equal(oversized, 'facts');
});

test('findOversizedField returns undefined when within the limit', () => {
  const oversized = findOversizedField({ facts: 'x'.repeat(100) }, ['facts']);
  assert.equal(oversized, undefined);
});
