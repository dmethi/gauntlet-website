import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type {
  PositionalTeamData,
  PositionData,
  TeamData,
  TeamInfo,
  TeamViewProps,
} from '@/features/stats/types';
import type { PlainStatsDataset, TrackedPosition } from '@/shared/utils/stats';
import { TeamView } from './TeamView';

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
): PlainStatsDataset => ({
  currentWeek: 4,
  currentSeason: '2025',
  leagues: [],
  weekRange: { from: 1, to: 18 },
  teams: entries.map(([key, data]) => [
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
  ]),
  positions: Array.from(positionMap.entries()).map(([position, value]) => [
    position,
    { position, teams: value.teams },
  ]),
  weeklyPlayerData,
  weeklyMedians: {},
  weeklyAverages: {},
});

const buildProps = (): TeamViewProps => {
  const teamInfo = createTeamInfo({
    teamName: 'Alpha',
    leagueName: 'Premier',
    leagueId: 'L1',
    rosterId: 1,
  });
  const teamScores = [
    { week: 1, value: 120 },
    { week: 2, value: 110 },
    { week: 3, value: 130 },
  ];
  const opponentScores = [
    { week: 1, value: 115 },
    { week: 2, value: 118 },
    { week: 3, value: 122 },
  ];

  const entry = createTeamData({
    key: 'L1-1',
    info: teamInfo,
    teamScores,
    opponentScores,
  });
  const allTeamEntries: Array<[string, TeamData]> = [entry];

  const positionMap = new Map<TrackedPosition, PositionData>([
    [
      'QB',
      {
        teams: [
          [
            entry[0],
            createPositionalTeamData(teamInfo, [
              { week: 1, value: 30 },
              { week: 2, value: 25 },
              { week: 3, value: 28 },
            ]),
          ],
        ],
      },
    ],
  ]);

  trackedPositions.forEach(position => {
    if (!positionMap.has(position)) {
      positionMap.set(position, { teams: [] });
    }
  });

  const weeklyPlayerData: PlainStatsDataset['weeklyPlayerData'] = {
    1: {
      [entry[0]]: {
        week: 1,
        teamKey: entry[0],
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
  };

  const dataset = buildDataset(allTeamEntries, positionMap, weeklyPlayerData);

  return {
    allTeamEntries,
    positionsMap: positionMap,
    dataset,
    fromWeek: 1,
    toWeek: 3,
    availableWeeks: [1, 2, 3],
  };
};

describe('TeamView component', () => {
  it('renders summary, comparison, and positional sections', () => {
    const props = buildProps();
    render(<TeamView {...props} />);

    expect(screen.getByText(/Team Overview/)).toBeInTheDocument();
    expect(screen.getByText(/League Comparison/)).toBeInTheDocument();
    expect(screen.getByText(/Weekly Performance/)).toBeInTheDocument();
    expect(screen.getByText(/Positional Breakdown/)).toBeInTheDocument();
  });
});
