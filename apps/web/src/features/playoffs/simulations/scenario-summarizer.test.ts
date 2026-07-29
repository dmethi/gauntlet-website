import { describe, expect, it } from 'vitest';
import { parseGeminiResponse } from './scenario-summarizer';

const fallback = {
  teamName: 'Test Team',
  overallSummary: 'Unable to generate summary',
  seedSummaries: {},
};

describe('parseGeminiResponse', () => {
  it('accepts only the bounded structured provider response', () => {
    const result = parseGeminiResponse(
      JSON.stringify({
        overallSummary: 'Win and the first-round bye is secured.',
        seedSummaries: {
          '1': 'Win this week.',
          '2': 'Lose while the current second seed also loses.',
        },
      }),
      'Test Team',
    );

    expect(result).toEqual({
      teamName: 'Test Team',
      overallSummary: 'Win and the first-round bye is secured.',
      seedSummaries: {
        1: 'Win this week.',
        2: 'Lose while the current second seed also loses.',
      },
    });
  });

  it.each([
    {
      name: 'unknown top-level fields',
      value: { overallSummary: 'Summary', seedSummaries: {}, injected: true },
    },
    {
      name: 'out-of-range seed keys',
      value: { overallSummary: 'Summary', seedSummaries: { '13': 'Impossible key' } },
    },
    {
      name: 'non-string seed summaries',
      value: { overallSummary: 'Summary', seedSummaries: { '1': { nested: 'value' } } },
    },
    {
      name: 'oversized summary strings',
      value: { overallSummary: 'x'.repeat(501), seedSummaries: {} },
    },
  ])('rejects $name from the provider', ({ value }) => {
    expect(parseGeminiResponse(JSON.stringify(value), 'Test Team')).toEqual(fallback);
  });

  it('rejects provider responses above the parser byte cap', () => {
    const response = JSON.stringify({
      overallSummary: 'Summary',
      seedSummaries: { '1': 'x'.repeat(9_000) },
    });

    expect(parseGeminiResponse(response, 'Test Team')).toEqual(fallback);
  });
});
