import { describe, it, expect } from 'vitest';
import { getMockArgumentScore } from './mockData';
import type { IracArgument } from '../types/legal';

describe('getMockArgumentScore', () => {
  it('returns a score within the documented 1-10 range', () => {
    const result = getMockArgumentScore(null);
    expect(result.score).toBeGreaterThanOrEqual(1);
    expect(result.score).toBeLessThanOrEqual(10);
  });

  it('scores a fully-developed argument higher than an empty one', () => {
    const filled: IracArgument = {
      issue: 'x'.repeat(60),
      rule: 'y'.repeat(60),
      application: 'z'.repeat(60),
      conclusion: 'w'.repeat(60),
      general_principles: [],
      assumptions: [],
      limitations: [],
      educational_notice: ''
    };
    const filledScore = getMockArgumentScore(filled);
    const emptyScore = getMockArgumentScore(null);
    expect(filledScore.score).toBeGreaterThan(emptyScore.score);
  });

  it('always returns non-empty strengths and improvements lists', () => {
    const result = getMockArgumentScore(null);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.improvements.length).toBeGreaterThan(0);
  });
});
