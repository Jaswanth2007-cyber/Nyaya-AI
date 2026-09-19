import { describe, it, expect } from 'vitest';
import { countWords, truncate, getSubjectTheme, getJurisdictionBadge } from './formatting';

describe('countWords', () => {
  it('counts whitespace-separated words', () => {
    expect(countWords('The reasonable person standard applies here')).toBe(6);
  });

  it('returns 0 for empty or whitespace-only input', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });

  it('collapses multiple spaces without over-counting', () => {
    expect(countWords('offer   acceptance    consideration')).toBe(3);
  });
});

describe('truncate', () => {
  it('leaves short text untouched', () => {
    expect(truncate('short text', 100)).toBe('short text');
  });

  it('truncates and appends an ellipsis when over the limit', () => {
    const result = truncate('a'.repeat(120), 100);
    expect(result.endsWith('...')).toBe(true);
    expect(result.length).toBe(103);
  });

  it('returns an empty string for empty input', () => {
    expect(truncate('', 50)).toBe('');
  });
});

describe('getSubjectTheme', () => {
  it('returns a distinct theme per known subject', () => {
    expect(getSubjectTheme('Contract Law').color).toContain('amber');
    expect(getSubjectTheme('Criminal Law').color).toContain('rose');
  });

  it('falls back to a default theme for unknown subjects', () => {
    expect(getSubjectTheme('Something Unlisted').color).toContain('emerald');
  });
});

describe('getJurisdictionBadge', () => {
  it('labels known jurisdictions', () => {
    expect(getJurisdictionBadge('India').label).toBe('India');
  });

  it('falls back to General / Educational for unknown jurisdictions', () => {
    expect(getJurisdictionBadge('Mars').label).toBe('General / Educational');
  });
});
