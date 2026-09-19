import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGeneratePrompt, buildCounterargumentPrompt, buildExplainPrompt } from './prompts.js';

const sampleInput = {
  facts: 'A shopkeeper mislabeled a watch at $10 instead of $100.',
  issue: 'Whether the mislabeled price constitutes a binding offer.',
  subject: 'Contract Law',
  jurisdiction: 'India'
};

test('buildGeneratePrompt forbids fabricated citations and requests the IRAC JSON schema', () => {
  const { system, user } = buildGeneratePrompt(sampleInput);
  assert.match(system, /NEVER invent, name, or cite a specific case/);
  assert.match(user, /"issue"/);
  assert.match(user, /"rule"/);
  assert.match(user, /"application"/);
  assert.match(user, /"conclusion"/);
  assert.match(user, /"general_principles"/);
  assert.match(user, /"educational_notice"/);
  assert.match(user, new RegExp(sampleInput.issue));
});

test('buildGeneratePrompt injects retrieved-principle grounding when provided, and omits it when empty', () => {
  const withPrinciples = buildGeneratePrompt({
    ...sampleInput,
    retrievedPrinciples: [{ principle: 'Invitation to Treat', description: 'Displays are invitations, not offers.' }]
  });
  assert.match(withPrinciples.user, /Verified reference doctrines/);
  assert.match(withPrinciples.user, /Invitation to Treat/);

  const withoutPrinciples = buildGeneratePrompt(sampleInput);
  assert.doesNotMatch(withoutPrinciples.user, /Verified reference doctrines/);
});

test('buildCounterargumentPrompt includes the prior argument when provided', () => {
  const argument = { issue: 'x', rule: 'y', application: 'z', conclusion: 'w' };
  const { user } = buildCounterargumentPrompt({ ...sampleInput, argument });
  assert.match(user, /"opposition_position"/);
  assert.match(user, /"opposing_arguments"/);
  assert.match(user, /"student_weaknesses"/);
  assert.match(user, /"rebuttal_directions"/);
  assert.match(user, /"issue": "x"/);
});

test('buildCounterargumentPrompt omits the argument block when none is given', () => {
  const { user } = buildCounterargumentPrompt(sampleInput);
  assert.doesNotMatch(user, /The student's existing IRAC argument/);
});

test('buildExplainPrompt requests key legal terms with plain-language definitions', () => {
  const { user } = buildExplainPrompt({ reasoning_text: 'The offeree accepted via performance.' });
  assert.match(user, /"key_legal_terms"/);
  assert.match(user, /"plain_explanation"/);
  assert.match(user, /"reasoning_breakdown"/);
  assert.match(user, /"nuances_limitations"/);
});
