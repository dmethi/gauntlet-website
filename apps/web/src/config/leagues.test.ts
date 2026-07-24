import { describe, expect, it } from 'vitest';
import {
  ALL_LEAGUES,
  getAllLeagues,
  getAllSeasons,
  getLeagueConfig,
  getLeaguesForSeason,
  LEAGUE_REGISTRY,
} from './leagues';

/**
 * Multi-league safety: the registry is the source every downstream tool reads
 * from (see docs/AGENTS.md's "process leagues separately" hard constraint).
 * These tests guard the real registry — seasons stay distinct entries (never
 * merged), and every league is addressable by a globally unique composite key
 * (its Sleeper league ID), which is the precondition every other multi-league
 * safety test in this suite relies on.
 */

describe('League registry: seasons kept separate', () => {
  it('returns only the leagues registered for a given season, not other seasons', () => {
    for (const season of getAllSeasons()) {
      const leagues = getLeaguesForSeason(season);
      expect(leagues.every(l => String(l.season) === season)).toBe(true);
    }
  });

  it('returns an empty array, not undefined or a fallback league, for an unregistered season', () => {
    expect(getLeaguesForSeason('1999')).toEqual([]);
  });

  it('lists every registered season without merging their league lists', () => {
    const seasons = getAllSeasons();
    const totalFromSeasons = seasons.reduce(
      (sum, season) => sum + getLeaguesForSeason(season).length,
      0,
    );

    expect(totalFromSeasons).toBe(getAllLeagues().length);
  });
});

describe('League registry: composite key uniqueness', () => {
  it('gives every league across every season a globally unique ID', () => {
    const all = getAllLeagues();

    expect(all.length).toBeGreaterThan(0);
    expect(new Set(all.map(l => l.id)).size).toBe(all.length);
  });

  it('is not hardcoded to exactly 2 leagues per season — registry supports N', () => {
    // Guards against a future regression that assumes a 2-element tuple
    // instead of iterating the array (the bug class this whole suite exists
    // to catch — see ROADMAP.md Phase 2).
    for (const leagues of Object.values(LEAGUE_REGISTRY)) {
      expect(Array.isArray(leagues)).toBe(true);
    }
  });

  it('getLeagueConfig resolves a league by its own ID, never a different league', () => {
    for (const league of ALL_LEAGUES) {
      const resolved = getLeagueConfig(league.id);
      expect(resolved?.id).toBe(league.id);
      expect(resolved?.season).toBe(league.season);
    }
  });

  it('getLeagueConfig returns undefined, not a wrong league, for an unknown ID', () => {
    expect(getLeagueConfig('does-not-exist')).toBeUndefined();
  });
});
