import { describe, expect, it } from 'vitest';
import type { PositionalTeamData, PositionData, TeamData, TeamInfo } from '@/features/stats/types';
import type { PlainStatsDataset, TrackedPosition } from '@/shared/utils/stats';
import {
  calculateConsistency,
  calculatePlayerContributions,
  calculatePositionalBreakdown,
  calculateTeamAdvantages,
  calculateTeamTotals,
  calculateWeeklyPerformance,
  groupByPosition,
} from './utils';

const trackedPositions: TrackedPosition[] = ['QB', 'RB', 'WR', 'TE', 'DEF'];

const createTeamInfo = (overrides: Partial<TeamInfo>): TeamInfo => ({
  teamName: overrides.teamName ?? 'Team',
  leagueName: overrides.leagueName ?? 'League',
  avatar: overrides.avatar,
  leagueId: overrides.leagueId,
  rosterId: overrides.rosterId,
});

const createTeamData = (overrides: {
  key: string;
  info: TeamInfo;
  teamScores: Array<{ week: number; value: number }>;
  opponentScores: Array<{ week: number; value: number }>;
}): [string, TeamData] => [
  overrides.key,
  {
    teamInfo: overrides.info,
    teamScores: overrides.teamScores,
    opponentScores: overrides.opponentScores,
  },
];

const createPositionalTeamData = (
  info: TeamInfo,
  scores: Array<{ week: number; value: number }>,
): PositionalTeamData => ({
  teamInfo: info,
  scores,
});

const buildDataset = (
  entries: Array<[string, TeamData]>,
  positionMap: Map<TrackedPosition, PositionData>,
  weeklyPlayerData: PlainStatsDataset['weeklyPlayerData'],
): PlainStatsDataset => {
  const teams = entries.map(([key, data]) => [
    key,
    {
      teamInfo: data.teamInfo,
      teamScores: data.teamScores,
      opponentScores: data.opponentScores,
      seasonTotals: {
        teamTotal: data.teamScores.reduce((sum, score) => sum + score.value, 0),
        opponentTotal: data.opponentScores.reduce((sum, score) => sum + score.value, 0),
        diff: 0,
        avgDelta: 0,
        medianDelta: 0,
        rank24: 1,
        rankLeague: 1,
        gamesPlayed: data.teamScores.length,
      },
    },
  ]);

  return {
    currentWeek: 3,
    currentSeason: '2025',
    leagues: [],
    weekRange: { from: 1, to: 18 },
    teams,
    positions: Array.from(positionMap.entries()).map(([position, value]) => [
      position,
      { position, teams: value.teams },
    ]),
    weeklyPlayerData,
    weeklyMedians: {},
    weeklyAverages: {},
  };
};

describe('TeamView utils', () => {
  const teamKeyA = 'L1-1';
  const teamKeyB = 'L1-2';

  const teamInfoA = createTeamInfo({
    teamName: 'Alpha',
    leagueName: 'Premier',
    leagueId: 'L1',
    rosterId: 1,
  });
  const teamInfoB = createTeamInfo({
    teamName: 'Bravo',
    leagueName: 'Premier',
    leagueId: 'L1',
    rosterId: 2,
  });

  const teamScoresA = [
    { week: 1, value: 120 },
    { week: 2, value: 110 },
    { week: 3, value: 130 },
  ];
  const oppScoresA = [
    { week: 1, value: 115 },
    { week: 2, value: 118 },
    { week: 3, value: 122 },
  ];
  const teamScoresB = [
    { week: 1, value: 105 },
    { week: 2, value: 125 },
    { week: 3, value: 118 },
  ];
  const oppScoresB = [
    { week: 1, value: 100 },
    { week: 2, value: 130 },
    { week: 3, value: 117 },
  ];

  const qbScoresA = [
    { week: 1, value: 30 },
    { week: 2, value: 25 },
    { week: 3, value: 28 },
  ];
  const qbScoresB = [
    { week: 1, value: 20 },
    { week: 2, value: 32 },
    { week: 3, value: 27 },
  ];

  const positionMap = new Map<TrackedPosition, PositionData>([
    [
      'QB',
      {
        teams: [
          [teamKeyA, createPositionalTeamData(teamInfoA, qbScoresA)],
          [teamKeyB, createPositionalTeamData(teamInfoB, qbScoresB)],
        ],
      },
    ],
  ]);

  const entries = [
    createTeamData({
      key: teamKeyA,
      info: teamInfoA,
      teamScores: teamScoresA,
      opponentScores: oppScoresA,
    }),
    createTeamData({
      key: teamKeyB,
      info: teamInfoB,
      teamScores: teamScoresB,
      opponentScores: oppScoresB,
    }),
  ];

  const weeklyPlayerData: PlainStatsDataset['weeklyPlayerData'] = {
    1: {
      [teamKeyA]: {
        week: 1,
        teamKey: teamKeyA,
        positions: {
          QB: [
            {
              playerId: 'qb1',
              name: 'Alpha QB',
              team: 'ALP',
              fantasyPoints: 20,
              stats: { pass_td: 2 },
            },
          ],
          RB: [],
          WR: [],
          TE: [],
          DEF: [],
        },
      },
    },
    2: {
      [teamKeyA]: {
        week: 2,
        teamKey: teamKeyA,
        positions: {
          QB: [
            {
              playerId: 'qb1',
              name: 'Alpha QB',
              team: 'ALP',
              fantasyPoints: 18,
              stats: { pass_td: 2 },
            },
            {
              playerId: 'qb2',
              name: 'Backup QB',
              team: 'ALP',
              fantasyPoints: 5,
              stats: { rush_td: 1 },
            },
          ],
          RB: [],
          WR: [],
          TE: [],
          DEF: [],
        },
      },
    },
    3: {
      [teamKeyA]: {
        week: 3,
        teamKey: teamKeyA,
        positions: {
          QB: [
            {
              playerId: 'qb1',
              name: 'Alpha QB',
              team: 'ALP',
              fantasyPoints: 22,
              stats: { pass_td: 2 },
            },
          ],
          RB: [],
          WR: [],
          TE: [],
          DEF: [],
        },
      },
    },
  };

  const dataset = buildDataset(entries, positionMap, weeklyPlayerData);

  it('computes consistency score on stable data', () => {
    const score = calculateConsistency([120, 121, 119, 123]);
    expect(score).toBeGreaterThan(70);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('aggregates player contributions across weeks', () => {
    const contributions = calculatePlayerContributions(dataset, teamKeyA, [1, 2, 3]);
    expect(contributions.groups.length).toBeGreaterThan(0);
    expect(contributions.totals[0]?.name).toBe('Alpha QB');
    expect(contributions.totals[0]?.totalPoints).toBeGreaterThan(0);
  });

  it('groups items by position', () => {
    const contributions = calculatePlayerContributions(dataset, teamKeyA, [1, 2, 3]);
    const grouped = groupByPosition(contributions.groups);
    expect(grouped.get('QB')?.length).toBe(contributions.groups.length);
  });

  it('calculates team totals and rankings', () => {
    const totals = calculateTeamTotals({
      teamEntry: entries[0],
      allTeamEntries: entries,
      selectedTeamKey: teamKeyA,
      fromWeek: 1,
      toWeek: 3,
      availableWeeks: [1, 2, 3, 4],
      dataset,
    });

    expect(totals).not.toBeNull();
    expect(totals?.teamTotal).toBeGreaterThan(0);
    expect(totals?.wins).toBe(2);
    expect(totals?.topPerformers.length).toBeGreaterThan(0);
  });

  it('builds weekly performance rows with opponent data', () => {
    const totals = calculateTeamTotals({
      teamEntry: entries[0],
      allTeamEntries: entries,
      selectedTeamKey: teamKeyA,
      fromWeek: 1,
      toWeek: 3,
      availableWeeks: [1, 2, 3],
      dataset,
    });
    expect(totals).not.toBeNull();
    if (!totals) return;

    const weekly = calculateWeeklyPerformance({
      teamTotals: totals,
      allTeamEntries: entries,
      selectedTeamKey: teamKeyA,
      fromWeek: 1,
      toWeek: 3,
    });

    expect(weekly.length).toBe(3);
    expect(weekly[0]).toHaveProperty('opponentRank24');
    expect(weekly[1].result).toBe('L');
  });

  it('derives positional breakdown with summaries', () => {
    const breakdown = calculatePositionalBreakdown({
      positions: trackedPositions,
      positionsMap: positionMap,
      selectedTeamKey: teamKeyA,
      allTeamEntries: entries,
      fromWeek: 1,
      toWeek: 3,
      weeks: [1, 2, 3],
    });

    const qbSummary = breakdown.get('QB')?.summary;
    expect(qbSummary).toBeDefined();
    expect(qbSummary?.seasonTotal).toBeCloseTo(83, 1);
  });

  it('produces team advantage summary from dataset', () => {
    const advantages = calculateTeamAdvantages({
      dataset,
      teamKey: teamKeyA,
      fromWeek: 1,
      toWeek: 3,
    });

    expect(advantages).not.toBeNull();
    expect(advantages?.positions.QB).toBeDefined();
  });
});
