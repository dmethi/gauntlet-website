import { describe, expect, it } from 'vitest';
import { normalizeNflTeamAbbreviation } from './nfl-team';

describe('normalizeNflTeamAbbreviation', () => {
  it('normalizes legacy/alternate abbreviations to modern codes', () => {
    expect(normalizeNflTeamAbbreviation('WSH')).toBe('WAS');
    expect(normalizeNflTeamAbbreviation('JAC')).toBe('JAX');
  });

  it('passes through already-modern abbreviations unchanged', () => {
    expect(normalizeNflTeamAbbreviation('KC')).toBe('KC');
  });

  it('returns undefined for null (players with no current NFL team, e.g. free agents/bye-week DEF)', () => {
    expect(normalizeNflTeamAbbreviation(null)).toBeUndefined();
  });

  it('returns undefined for undefined', () => {
    expect(normalizeNflTeamAbbreviation(undefined)).toBeUndefined();
  });
});
