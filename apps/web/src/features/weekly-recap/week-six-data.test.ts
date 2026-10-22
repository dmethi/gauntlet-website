import { describe, expect, it } from 'vitest';
import { WEEK_SIX_RECAP } from './week-six-data';
import source from './week-six-source.json';

describe('the 2026 Week 6 edition', () => {
  const matchups = WEEK_SIX_RECAP.leagues.flatMap(league => league.matchups);

  it('publishes all 36 final scores inside their own Legion', () => {
    expect(WEEK_SIX_RECAP.season).toBe(2026);
    expect(WEEK_SIX_RECAP.week).toBe(6);
    expect(WEEK_SIX_RECAP.leagues.map(league => league.matchups.length)).toEqual([6, 6, 6]);
    for (const league of WEEK_SIX_RECAP.leagues) {
      const frozen = source.leagues.find(item => item.leagueId === league.leagueId)!;
      expect(
        new Set(league.matchups.flatMap(game => game.teams.map(team => team.rosterId))).size,
      ).toBe(12);
      for (const game of league.matchups) {
        expect(game.key).toBe(`${league.leagueId}:6:${game.matchupId}`);
        const original = frozen.matchups.find(item => item.matchupId === game.matchupId)!;
        expect(game.teams.map(team => [team.rosterId, team.score])).toEqual(
          original.teams.map(team => [team.rosterId, team.score]),
        );
        expect(game.winnerRosterId).toBe(original.winnerRosterId);
        const winner = game.teams.find(team => team.rosterId === game.winnerRosterId)!;
        const loser = game.teams.find(team => team.rosterId !== game.winnerRosterId)!;
        expect(winner.score).toBeGreaterThan(loser.score);
        expect(game.openingFavoriteRosterId).toBe(original.flow.favoriteRosterId);
        expect(game.openingWinProbability).toBe(original.flow.favoriteProbability);
        expect(game.probabilityQuality).toBe(
          original.flow.finalAligned ? 'reliable' : 'directional',
        );
      }
    }
  });

  it('gives every game exactly one editorial home', () => {
    const keys = WEEK_SIX_RECAP.flowSections.flatMap(section => section.matchupKeys);
    expect([...keys].sort()).toEqual(matchups.map(game => game.key).sort());
    expect(new Set(keys).size).toBe(18);
  });

  it('gives every Stats Hub finding its own rendering key', () => {
    const views = WEEK_SIX_RECAP.statsDeepDive.items.map(item => item.view);
    expect(new Set(views).size).toBe(views.length);
  });

  it('backs every autopsy with a frozen legal replacement and a winning score', () => {
    for (const autopsy of WEEK_SIX_RECAP.autopsies) {
      const [leagueId, rosterId] = autopsy.teamKey.split(':');
      const league = source.leagues.find(item => item.leagueId === leagueId)!;
      const game = league.matchups.find(item =>
        item.teams.some(team => team.rosterId === Number(rosterId)),
      )!;
      const team = game.teams.find(item => item.rosterId === Number(rosterId))!;
      const swap = team.winningSwaps.find(
        item => `${item.in.name} over ${item.out.name}` === autopsy.swap,
      )!;
      expect(swap).toBeDefined();
      expect(autopsy.actualScore).toBe(team.score);
      expect(autopsy.revisedScore).toBe(swap.revisedScore);
      expect(autopsy.revisedScore).toBeCloseTo(team.score + swap.in.points - swap.out.points, 2);
      expect(autopsy.opponentScore).toBe(
        game.teams.find(item => item.rosterId !== team.rosterId)!.score,
      );
      expect(autopsy.revisedScore).toBeGreaterThan(autopsy.opponentScore);
    }
  });
});
