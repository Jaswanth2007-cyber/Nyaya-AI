import { describe, it, expect } from 'vitest';
import { generateMarkdownBrief, EDUCATIONAL_DISCLAIMER_TEXT } from './exportUtils';
import type { CaseInput, IracArgument } from '../types/legal';

const input: CaseInput = {
  facts: 'A shopkeeper mislabeled a watch at $10 instead of $100.',
  issue: 'Whether the mislabeled price constitutes a binding offer.',
  subject: 'Contract Law',
  jurisdiction: 'India'
};

const argument: IracArgument = {
  issue: 'Restated issue',
  rule: 'Offer-acceptance-consideration',
  application: 'Applying the rule to the facts',
  conclusion: 'Likely an invitation to treat',
  general_principles: ['Invitation to treat'],
  assumptions: ['No prior dealings between the parties'],
  limitations: ['Simplified hypothetical'],
  educational_notice: 'Practice material only.'
};

describe('generateMarkdownBrief', () => {
  it('always includes the persistent educational disclaimer', () => {
    const brief = generateMarkdownBrief(input, null, null, null, false);
    expect(brief).toContain(EDUCATIONAL_DISCLAIMER_TEXT);
  });

  it('includes the IRAC section only when an argument is provided', () => {
    const withArgument = generateMarkdownBrief(input, argument, null, null, false);
    const withoutArgument = generateMarkdownBrief(input, null, null, null, false);
    expect(withArgument).toContain('STRUCTURED IRAC ARGUMENT');
    expect(withArgument).toContain('Invitation to treat');
    expect(withoutArgument).not.toContain('STRUCTURED IRAC ARGUMENT');
  });

  it('flags demo/mock content explicitly', () => {
    const mockBrief = generateMarkdownBrief(input, null, null, null, true);
    expect(mockBrief).toContain('Demo Mode');
  });

  it('always includes the original case facts and issue', () => {
    const brief = generateMarkdownBrief(input, null, null, null, false);
    expect(brief).toContain(input.issue);
    expect(brief).toContain(input.facts);
  });
});
