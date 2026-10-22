import { describe, expect, it } from 'vitest';
import { WEEK_SIX_RANKINGS } from './week-six-rankings-data';
import source from './week-six-rankings-source.json';

describe('the frozen six-week rankings', () => {
  it('accounts for every Legion, team, draft pick, and starter', () => {
    expect(WEEK_SIX_RANKINGS.leagues).toHaveLength(3);
    for (const league of WEEK_SIX_RANKINGS.leagues) {
      expect(league.drafts).toHaveLength(12);
      expect(league.draftPicks).toHaveLength(180);
      expect(league.unattributedPlayers).toEqual([]);
      expect(league.draftPicks.reduce((sum, pick) => sum + pick.surplus, 0)).toBeCloseTo(0);
    }
  });

  it('excludes the next Wednesday waiver run regardless of Sleeper transaction leg', () => {
    for (const league of WEEK_SIX_RANKINGS.leagues) {
      expect(league.transactions.every(move => move.acquiredAt <= Date.parse(source.cutoff))).toBe(
        true,
      );
      expect(new Set(league.transactions.map(move => move.key)).size).toBe(
        league.transactions.length,
      );
    }
  });

  it('backs the printed leaders with the frozen production calculations', () => {
    expect(WEEK_SIX_RANKINGS.drafts.best[0]).toMatchObject({
      label: 'King Henry’s Court',
      legion: 'Keep',
    });
    expect(WEEK_SIX_RANKINGS.picks.best[0]).toMatchObject({ player: 'Chuba Hubbard', cost: 6 });
    expect(WEEK_SIX_RANKINGS.transactions.best[0]).toMatchObject({
      player: 'Emanuel Wilson',
      cost: 0,
    });
    expect(WEEK_SIX_RANKINGS.byPosition.map(row => row.position)).toEqual([
      'QB',
      'RB',
      'WR',
      'TE',
      'DEF',
    ]);
    expect(WEEK_SIX_RANKINGS.positions.best[0].edge).toBeCloseTo(22.45);
  });
});
