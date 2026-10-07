import { describe, expect, it } from 'vitest';
import { WEEK_FOUR_RECAP } from './week-four-data';

describe('WEEK_FOUR_RECAP', () => {
  const matchups = WEEK_FOUR_RECAP.leagues.flatMap(league => league.matchups);

  it('covers each Week 4 matchup once and names the actual winner', () => {
    expect(WEEK_FOUR_RECAP.leagues.map(league => league.matchups.length)).toEqual([6, 6, 6]);
    expect(new Set(matchups.map(matchup => matchup.key)).size).toBe(18);
    for (const matchup of matchups) {
      const winner = matchup.teams.find(team => team.rosterId === matchup.winnerRosterId);
      const loser = matchup.teams.find(team => team.rosterId !== matchup.winnerRosterId);
      expect(winner?.score).toBeGreaterThan(loser?.score ?? 0);
    }
  });

  it('places every matchup in exactly one section', () => {
    const keys = WEEK_FOUR_RECAP.flowSections.flatMap(section => section.matchupKeys);
    expect(keys.sort()).toEqual(matchups.map(matchup => matchup.key).sort());
  });

  it('supports every one-swap autopsy with a winning score', () => {
    for (const autopsy of WEEK_FOUR_RECAP.autopsies) {
      expect(autopsy.revisedScore).toBeGreaterThan(autopsy.opponentScore);
    }
  });

  it('uses a recorded opening favorite for every matchup', () => {
    for (const matchup of matchups) {
      expect(matchup.teams.map(team => team.rosterId)).toContain(matchup.openingFavoriteRosterId);
      expect(matchup.openingWinProbability).toBeGreaterThanOrEqual(0.5);
      expect(matchup.openingWinProbability).toBeLessThanOrEqual(1);
    }
  });
});
