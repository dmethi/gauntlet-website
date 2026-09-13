import { describe, expect, it } from 'vitest';
import { buildDraftReport, type DraftLeagueInput, normalizeDraftPosition } from './draft-report';

const leagues: DraftLeagueInput[] = [
  {
    leagueId: 'league-1',
    leagueName: 'Legion I',
    draftId: 'draft-1',
    logo: '/one.svg',
    status: 'complete',
    startedAt: '2026-09-07T22:00:00.000Z',
    finishedAt: '2026-09-07T22:10:00.000Z',
    rosterSize: 2,
    managers: [
      { rosterId: 1, ownerId: 'owner-a', managerName: 'A', teamName: 'Alpha' },
      { rosterId: 2, ownerId: 'owner-b', managerName: 'B', teamName: 'Bravo' },
    ],
    picks: [
      {
        pickNo: 1,
        rosterId: 1,
        playerId: 'p1',
        playerName: 'Player One',
        position: 'RB',
        nflTeam: 'A',
        price: 30,
      },
      {
        pickNo: 2,
        rosterId: 2,
        playerId: 'p2',
        playerName: 'Player Two',
        position: 'WR',
        nflTeam: 'B',
        price: 40,
      },
      {
        pickNo: 4,
        rosterId: 1,
        playerId: 'p3',
        playerName: 'Player Three',
        position: 'WR',
        nflTeam: 'C',
        price: 10,
      },
      {
        pickNo: 6,
        rosterId: 2,
        playerId: 'p4',
        playerName: 'Player Four',
        position: 'QB',
        nflTeam: 'D',
        price: 20,
      },
    ],
  },
  {
    leagueId: 'league-2',
    leagueName: 'Legion II',
    draftId: 'draft-2',
    logo: '/two.svg',
    status: 'complete',
    startedAt: '2026-09-07T23:00:00.000Z',
    finishedAt: '2026-09-07T23:08:00.000Z',
    rosterSize: 2,
    managers: [
      { rosterId: 1, ownerId: 'owner-a', managerName: 'A', teamName: 'Alpha II' },
      { rosterId: 2, ownerId: 'owner-c', managerName: 'C', teamName: 'Charlie' },
    ],
    picks: [
      {
        pickNo: 1,
        rosterId: 2,
        playerId: 'p1',
        playerName: 'Player One',
        position: 'RB',
        nflTeam: 'A',
        price: 50,
      },
      {
        pickNo: 2,
        rosterId: 1,
        playerId: 'p3',
        playerName: 'Player Three',
        position: 'WR',
        nflTeam: 'C',
        price: 5,
      },
      {
        pickNo: 4,
        rosterId: 1,
        playerId: 'p2',
        playerName: 'Player Two',
        position: 'WR',
        nflTeam: 'B',
        price: 35,
      },
      {
        pickNo: 7,
        rosterId: 2,
        playerId: 'p5',
        playerName: 'Player Five',
        position: 'TE',
        nflTeam: 'E',
        price: 10,
      },
    ],
  },
  {
    leagueId: 'league-3',
    leagueName: 'Legion III',
    draftId: 'draft-3',
    logo: '/three.svg',
    status: 'complete',
    startedAt: '2026-09-08T00:00:00.000Z',
    finishedAt: '2026-09-08T00:09:00.000Z',
    rosterSize: 2,
    managers: [
      { rosterId: 1, ownerId: 'owner-d', managerName: 'D', teamName: 'Delta' },
      { rosterId: 2, ownerId: 'owner-e', managerName: 'E', teamName: 'Echo' },
    ],
    picks: [
      {
        pickNo: 1,
        rosterId: 1,
        playerId: 'p1',
        playerName: 'Player One',
        position: 'RB',
        nflTeam: 'A',
        price: 40,
      },
      {
        pickNo: 2,
        rosterId: 2,
        playerId: 'p2',
        playerName: 'Player Two',
        position: 'WR',
        nflTeam: 'B',
        price: 55,
      },
      {
        pickNo: 5,
        rosterId: 1,
        playerId: 'p6',
        playerName: 'Player Six',
        position: 'WR',
        nflTeam: 'F',
        price: 10,
      },
      {
        pickNo: 6,
        rosterId: 2,
        playerId: 'p7',
        playerName: 'Player Seven',
        position: 'TE',
        nflTeam: 'G',
        price: 10,
      },
    ],
  },
];

describe('buildDraftReport', () => {
  it('treats Travis Hunter as a wide receiver for Gauntlet analysis', () => {
    expect(normalizeDraftPosition('Travis Hunter', 'DB')).toBe('WR');
    expect(normalizeDraftPosition('Travis Hunter', 'WR')).toBe('WR');
    expect(normalizeDraftPosition('Someone Else', 'DB')).toBe('DB');
  });

  it('keeps league identities composite while finding three-league market stories', () => {
    const report = buildDraftReport({
      leagues,
      generatedAt: '2026-09-08T01:00:00.000Z',
      benchmark: {
        name: 'Fixture values',
        url: 'https://example.com',
        publishedAt: '2026-09-03',
        assumptions: 'fixture',
        valuesByPlayerId: { p1: 45, p2: 44.2, p3: 25, p4: 10, p5: 5, p6: 5, p7: 5 },
      },
    });

    expect(report.leagues).toHaveLength(3);
    expect(new Set(report.teamGrades.map(team => team.teamId)).size).toBe(6);
    expect(report.priceDivergences[0]).toMatchObject({
      playerId: 'p2',
      lowPrice: 35,
      highPrice: 55,
      spread: 20,
    });
    expect(report.rootingInterests.find(item => item.ownerId === 'owner-a')).toMatchObject({
      repeatedPlayers: [
        { playerId: 'p3', playerName: 'Player Three', leagues: ['Legion I', 'Legion II'] },
      ],
    });
    expect(report.rosterSimilarities[0]).toMatchObject({ sharedPlayerIds: ['p3'] });
    expect(report.marketAnalytics.leagues).toHaveLength(3);
    expect(report.marketAnalytics.leagueAgreement).toHaveLength(3);
    expect(
      report.marketAnalytics.positionMarkets.find(item => item.position === 'RB'),
    ).toBeDefined();
    expect(report.managerAnalytics).toHaveLength(6);
    expect(report.teamGrades.flatMap(team => team.picks)).toHaveLength(12);
  });

  it('grades benchmark value as 70% starters and 30% bench', () => {
    const report = buildDraftReport({
      leagues,
      generatedAt: '2026-09-08T01:00:00.000Z',
      benchmark: {
        name: 'Fixture values',
        url: 'https://example.com',
        publishedAt: '2026-09-03',
        assumptions: 'fixture',
        valuesByPlayerId: { p1: 45, p2: 44.2, p3: 25, p4: 10, p5: 5, p6: 5, p7: 5 },
      },
    });

    const alpha = report.teamGrades.find(team => team.teamId === 'league-1:1');
    expect(alpha).toMatchObject({
      starterPlayerIds: ['p1', 'p3'],
      benchmarkStarterValue: 70,
      benchmarkBenchValue: 0,
      starterSpend: 40,
      benchSpend: 0,
      starterValueDelta: 30,
      benchValueDelta: 0,
    });
    expect(report.metadata.grading).toMatchObject({ starterWeight: 0.7, benchWeight: 0.3 });
  });

  it('derives auction superlatives from winning-purchase order without inventing timestamps', () => {
    const report = buildDraftReport({
      leagues,
      generatedAt: '2026-09-08T01:00:00.000Z',
      benchmark: {
        name: 'Fixture values',
        url: 'https://example.com',
        publishedAt: '2026-09-03',
        assumptions: 'fixture',
        valuesByPlayerId: { p1: 45, p2: 44.2, p3: 25, p4: 10, p5: 5, p6: 5, p7: 5 },
      },
    });

    expect(report.superlatives.bestValue).toMatchObject({
      playerId: 'p3',
      price: 5,
      benchmarkValue: 25,
    });
    expect(report.superlatives.biggestPremium).toMatchObject({
      playerId: 'p2',
      price: 55,
      benchmarkValue: 44.2,
      valueDelta: -10.8,
    });
    expect(report.superlatives.longestPurchaseDrought.unit).toBe('picks');
    expect(report.superlatives.longestPurchaseDrought.value).toBe(5);
    expect(report.superlatives.fastestDraft.leagueName).toBe('Legion II');
  });
});
