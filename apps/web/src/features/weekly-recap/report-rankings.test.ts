import { describe, expect, it } from 'vitest';
import { buildLeagueRankings, type RankingLeague } from './report-rankings';

const players = {
  rb: { name: 'Drafted back', position: 'RB' },
  bench: { name: 'Bench back', position: 'RB' },
  add: { name: 'Waiver back', position: 'RB' },
};

const fixture = (): RankingLeague => ({
  leagueId: 'first',
  shortName: 'Throne',
  faabBudget: 200,
  teams: [
    { rosterId: 1, label: 'First' },
    { rosterId: 2, label: 'Second' },
  ],
  draftPicks: [{ playerId: 'rb', rosterId: 1, price: 20 }],
  transactions: [
    {
      id: 'early',
      type: 'waiver',
      completedAt: 5,
      adds: { add: 1 },
      drops: {},
      bid: 16,
      draftPicks: 0,
    },
    {
      id: 'drop',
      type: 'free_agent',
      completedAt: 15,
      adds: {},
      drops: { add: 1 },
      bid: 0,
      draftPicks: 0,
    },
    {
      id: 'return',
      type: 'free_agent',
      completedAt: 25,
      adds: { add: 1 },
      drops: {},
      bid: 0,
      draftPicks: 0,
    },
    {
      id: 'future',
      type: 'waiver',
      completedAt: 35,
      adds: { bench: 1 },
      drops: {},
      bid: 200,
      draftPicks: 0,
    },
  ],
  weeks: [1, 2, 3].map(week => ({
    week,
    endsAt: week * 10,
    teams: [
      {
        rosterId: 1,
        matchupId: 1,
        score: 30,
        starters: week === 2 ? ['rb'] : ['rb', 'add'],
        points: week === 2 ? { rb: 10, add: 0 } : { rb: 10, add: 20 },
      },
      { rosterId: 2, matchupId: 1, score: 0, starters: [], points: { bench: 4 } },
    ],
  })),
});

describe('recap rankings', () => {
  it('uses same-position bench medians inside each Legion', () => {
    const first = buildLeagueRankings(fixture(), players);
    expect(first.draftPicks[0].vorp).toBe(20);
    const second = fixture();
    second.leagueId = 'second';
    second.weeks.forEach(week => {
      week.teams[1].points.bench = 40;
    });
    expect(buildLeagueRankings(second, players).draftPicks[0].vorp).toBe(-70);
    expect(first.draftPicks[0].vorp).toBe(20);
  });

  it('credits separate ownership stints once and excludes future claims', () => {
    const result = buildLeagueRankings(fixture(), players);
    const adds = result.transactions;
    expect(adds.map(add => add.transactionId)).toEqual(['early', 'return']);
    expect(adds.map(add => add.starts)).toEqual([1, 1]);
    expect(adds.map(add => add.vorp)).toEqual([16, 16]);
    expect(adds[0].score).toBe(14); // 16 VORP minus 16/200 * 25.
    expect(result.unattributedStarts).toBe(0);
  });

  it('charges the full draft price even if the player never starts', () => {
    const league = fixture();
    league.draftPicks.push({ playerId: 'bench', rosterId: 1, price: 30 });
    const result = buildLeagueRankings(league, players);
    expect(result.drafts[0].cost).toBe(50);
    expect(result.drafts[0].vorpPerDollar).toBe(0.4);
    expect(result.draftPicks.reduce((sum, pick) => sum + pick.surplus, 0)).toBeCloseTo(0);
  });

  it('stops draft credit when a player is dropped and reacquired', () => {
    const league = fixture();
    league.transactions.push(
      {
        id: 'drop-draft',
        type: 'free_agent',
        completedAt: 15,
        adds: {},
        drops: { rb: 1 },
        bid: 0,
        draftPicks: 0,
      },
      {
        id: 'readd-draft',
        type: 'free_agent',
        completedAt: 25,
        adds: { rb: 1 },
        drops: {},
        bid: 0,
        draftPicks: 0,
      },
    );
    league.weeks[1].teams[0].starters = [];
    const result = buildLeagueRankings(league, players);
    expect(result.draftPicks[0].starts).toBe(1);
    expect(result.transactions.find(move => move.transactionId === 'readd-draft')?.starts).toBe(1);
  });

  it('keeps a midweek trade from moving points already locked to the original lineup', () => {
    const league = fixture();
    league.transactions.push({
      id: 'trade',
      type: 'trade',
      completedAt: 25,
      adds: { rb: 2 },
      drops: { rb: 1 },
      bid: 0,
      draftPicks: 0,
    });
    const result = buildLeagueRankings(league, players);
    expect(result.draftPicks[0].starts).toBe(3);
    expect(result.unattributedStarts).toBe(0);
  });
});
