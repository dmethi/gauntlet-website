import { describe, expect, it } from 'vitest';
import { WEEK_SEVEN_RECAP } from './week-seven-data';
import { WEEK_SEVEN_ANALYSIS } from './week-seven-analysis';
import source from './week-seven-source.json';

const canAssign = (players: { eligible: string[] }[], slots: string[]): boolean => {
  if (!slots.length) return true;
  const [slot, ...rest] = slots;
  const positions = slot === 'FLEX' ? ['RB', 'WR', 'TE'] : [slot];
  return players.some(
    (player, index) =>
      player.eligible.some(position => positions.includes(position)) &&
      canAssign(
        players.filter((_, candidate) => candidate !== index),
        rest,
      ),
  );
};

describe('the frozen 2026 Week 7 edition', () => {
  it('publishes every final score and chart qualification in its own Legion', () => {
    expect(WEEK_SEVEN_RECAP.week).toBe(7);
    expect(WEEK_SEVEN_RECAP.season).toBe(2026);
    expect(WEEK_SEVEN_RECAP.leagues.map(league => league.matchups.length)).toEqual([6, 6, 6]);
    for (const league of WEEK_SEVEN_RECAP.leagues) {
      const frozen = source.leagues.find(item => item.leagueId === league.leagueId)!;
      expect(
        new Set(league.matchups.flatMap(game => game.teams.map(team => team.rosterId))).size,
      ).toBe(12);
      for (const game of league.matchups) {
        const original = frozen.matchups.find(item => item.matchupId === game.matchupId)!;
        expect(game.key).toBe(`${league.leagueId}:7:${game.matchupId}`);
        expect(game.teams.map(team => [team.rosterId, team.score])).toEqual(
          original.teams.map(team => [team.rosterId, team.score]),
        );
        expect(game.winnerRosterId).toBe(original.winnerRosterId);
        expect(game.openingFavoriteRosterId).toBe(original.flow.favoriteRosterId);
        expect(game.openingWinProbability).toBe(original.flow.favoriteProbability);
        expect(game.probabilityQuality).toBe(
          original.flow.finalAligned ? 'reliable' : 'directional',
        );
        for (const team of original.teams) {
          expect(team.starters.reduce((sum, player) => sum + player.points, 0)).toBeCloseTo(
            team.score,
            2,
          );
        }
      }
    }
    const games = WEEK_SEVEN_RECAP.leagues.flatMap(league => league.matchups);
    expect(WEEK_SEVEN_RECAP.flowSections.flatMap(section => section.matchupKeys).sort()).toEqual(
      games.map(game => game.key).sort(),
    );
  });

  it('pins the two payout places to the cross-Legion final scoreboard', () => {
    expect(WEEK_SEVEN_ANALYSIS.podium.slice(0, 2).map(team => [team.key, team.score])).toEqual([
      ['1387520168866885632:3', 161.33],
      ['1387520086092312576:4', 147.35],
    ]);
    expect(WEEK_SEVEN_ANALYSIS.podium[2].score).toBe(146.78);
    expect(WEEK_SEVEN_ANALYSIS.totalPoints).toBeCloseTo(3985.63, 2);
    expect(WEEK_SEVEN_ANALYSIS.scoringChange).toBeCloseTo(314.64, 2);
    expect(WEEK_SEVEN_ANALYSIS.favoriteWins).toBe(8);
  });

  it('keeps all-play comparisons inside each Legion and preserves seven-week standings', () => {
    for (const league of WEEK_SEVEN_ANALYSIS.leagues) {
      expect(league.teams).toHaveLength(12);
      expect(league.teams.reduce((sum, team) => sum + team.expectedWins, 0)).toBeCloseTo(42, 3);
      for (const team of league.teams) {
        expect(team.wins + team.losses).toBe(7);
        expect(team.weeklyScores.reduce((sum, score) => sum + score, 0)).toBeCloseTo(
          team.pointsFor,
          2,
        );
        expect(team.recentAverage).toBeCloseTo(
          team.weeklyScores.slice(4).reduce((sum, score) => sum + score, 0) / 3,
          2,
        );
        expect(team.formChange).toBeCloseTo(
          team.recentAverage -
            team.weeklyScores.slice(0, 4).reduce((sum, score) => sum + score, 0) / 4,
          2,
        );
      }
      expect(league.nextWeek).toHaveLength(6);
      expect(new Set(league.nextWeek.flatMap(game => game.teams.map(team => team.key))).size).toBe(
        12,
      );
    }
    expect(WEEK_SEVEN_ANALYSIS.scheduleGaps[0].key).toBe('1387520236663615488:5');
    expect(WEEK_SEVEN_ANALYSIS.scheduleGaps.at(-1)?.key).toBe('1387520168866885632:5');
  });

  it('shows only legal, winning retrospective substitutions', () => {
    expect(WEEK_SEVEN_RECAP.autopsies).toHaveLength(3);
    for (const autopsy of WEEK_SEVEN_RECAP.autopsies) {
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
      expect(autopsy.revisedScore).toBeCloseTo(team.score + swap.in.points - swap.out.points, 2);
      expect(autopsy.opponentScore).toBe(
        game.teams.find(item => item.rosterId !== team.rosterId)!.score,
      );
      expect(autopsy.revisedScore).toBeGreaterThan(autopsy.opponentScore);
      expect(
        canAssign(
          [...team.starters.filter(player => player.id !== swap.out.id), swap.in],
          league.rosterSlots.filter(slot => slot !== 'BN'),
        ),
      ).toBe(true);
    }
  });

  it('uses the exact top-starter subtraction for the dependency experiment', () => {
    expect(WEEK_SEVEN_ANALYSIS.starIndependentWins).toHaveLength(5);
    for (const team of WEEK_SEVEN_ANALYSIS.starIndependentWins) {
      expect(team.withoutStar).toBeCloseTo(team.score - team.star.points, 2);
      expect(team.withoutStar).toBeGreaterThan(team.opponentScore);
    }
  });
});
