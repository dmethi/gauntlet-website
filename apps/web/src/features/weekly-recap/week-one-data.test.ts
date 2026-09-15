import { describe, expect, it } from 'vitest';
import { WEEK_ONE_RECAP } from './week-one-data';

describe('WEEK_ONE_RECAP', () => {
  it('keeps six matchups inside each legion before presentation', () => {
    expect(WEEK_ONE_RECAP.leagues).toHaveLength(3);
    expect(WEEK_ONE_RECAP.leagues.map(league => league.matchups.length)).toEqual([6, 6, 6]);
  });

  it('uses a unique composite key for every matchup', () => {
    const matchups = WEEK_ONE_RECAP.leagues.flatMap(league => league.matchups);
    const keys = matchups.map(matchup => matchup.key);

    expect(matchups).toHaveLength(18);
    expect(new Set(keys).size).toBe(18);
    expect(keys.every(key => /^\d+:1:[1-6]$/.test(key))).toBe(true);
  });

  it('assigns every matchup to exactly one game-flow section', () => {
    const matchupKeys = WEEK_ONE_RECAP.leagues.flatMap(league =>
      league.matchups.map(matchup => matchup.key),
    );
    const flowKeys = WEEK_ONE_RECAP.flowSections.flatMap(section => section.matchupKeys);

    expect(flowKeys).toHaveLength(18);
    expect(new Set(flowKeys).size).toBe(18);
    expect([...flowKeys].sort()).toEqual([...matchupKeys].sort());
  });

  it('marks the higher final score as the winner', () => {
    for (const matchup of WEEK_ONE_RECAP.leagues.flatMap(league => league.matchups)) {
      const winner = matchup.teams.find(team => team.rosterId === matchup.winnerRosterId);
      const loser = matchup.teams.find(team => team.rosterId !== matchup.winnerRosterId);

      expect(winner).toBeDefined();
      expect(loser).toBeDefined();
      expect(winner!.score).toBeGreaterThan(loser!.score);
    }
  });
});
