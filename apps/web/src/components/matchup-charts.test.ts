import { describe, expect, it } from 'vitest';
import { formatTimestampEastern } from './matchup-charts';

describe('formatTimestampEastern', () => {
  it('formats an EDT kickoff without applying a fixed EST offset', () => {
    expect(formatTimestampEastern(new Date('2026-09-13T17:00:00.000Z'))).toBe('Sun 1PM');
  });

  it('formats an EST kickoff after daylight saving time ends', () => {
    expect(formatTimestampEastern(new Date('2026-11-08T18:00:00.000Z'))).toBe('Sun 1PM');
  });
});
