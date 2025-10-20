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
  describe('Rendering', () => {
    it('renders summary, comparison, and positional sections', () => {
      const props = buildProps();
      render(<TeamView {...props} />);

      expect(screen.getByText(/Team Overview/)).toBeInTheDocument();
      expect(screen.getByText(/League Comparison/)).toBeInTheDocument();
      expect(screen.getByText(/Weekly Performance/)).toBeInTheDocument();
      expect(screen.getByText(/Positional Breakdown/)).toBeInTheDocument();
    });

    it('renders team selector', () => {
      const props = buildProps();
      render(<TeamView {...props} />);

      expect(screen.getByText('Select Team')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('displays team name in selector', () => {
      const props = buildProps();
      render(<TeamView {...props} />);

      expect(screen.getAllByText(/Alpha.*Premier/)).not.toHaveLength(0);
    });
  });

  describe('Team Selection', () => {
    it('renders with first team selected by default', () => {
      const props = buildProps();
      render(<TeamView {...props} />);

      // First team should be selected
      expect(screen.getAllByText(/Alpha.*Premier/)).not.toHaveLength(0);
    });

    it('displays multiple team options', () => {
      const teamInfo1 = createTeamInfo({
        teamName: 'Alpha',
        leagueName: 'Premier',
        leagueId: 'L1',
        rosterId: 1,
      });
      const teamInfo2 = createTeamInfo({
        teamName: 'Beta',
        leagueName: 'Premier',
        leagueId: 'L1',
        rosterId: 2,
      });

      const entry1 = createTeamData({
        key: 'L1-1',
        info: teamInfo1,
        teamScores: [{ week: 1, value: 120 }],
        opponentScores: [{ week: 1, value: 115 }],
      });
      const entry2 = createTeamData({
        key: 'L1-2',
        info: teamInfo2,
        teamScores: [{ week: 1, value: 110 }],
        opponentScores: [{ week: 1, value: 105 }],
      });

      const positionMap = new Map<TrackedPosition, PositionData>();
      trackedPositions.forEach(position => {
        positionMap.set(position, { teams: [] });
      });

      const dataset = buildDataset([entry1, entry2], positionMap, {
        1: {
          [entry1[0]]: {
            week: 1,
            teamKey: entry1[0],
            positions: { QB: [], RB: [], WR: [], TE: [], DEF: [] },
          },
        },
      });

      render(
        <TeamView
          allTeamEntries={[entry1, entry2]}
          positionsMap={positionMap}
          dataset={dataset}
          fromWeek={1}
          toWeek={1}
          availableWeeks={[1]}
        />,
      );

      // Both teams should be available
      expect(screen.getAllByText(/Alpha.*Premier/)).not.toHaveLength(0);
    });
  });

  describe('Data Display', () => {
    it('displays team total points', () => {
      const props = buildProps();
      render(<TeamView {...props} />);

      // Total should be 120 + 110 + 130 = 360
      expect(screen.getAllByText('360.0')).not.toHaveLength(0);
    });

    it('displays weekly scores', () => {
      const props = buildProps();
      render(<TeamView {...props} />);

      // Individual week scores should be displayed
      expect(screen.getAllByText('120.0')).not.toHaveLength(0);
      expect(screen.getAllByText('110.0')).not.toHaveLength(0);
      expect(screen.getAllByText('130.0')).not.toHaveLength(0);
    });

    it('displays opponent totals', () => {
      const props = buildProps();
      render(<TeamView {...props} />);

      // Opponent total should be 115 + 118 + 122 = 355
      expect(screen.getAllByText('355.0')).not.toHaveLength(0);
    });
  });

  describe('Positional Breakdown', () => {
    it('displays QB scores', () => {
      const props = buildProps();
      render(<TeamView {...props} />);

      // QB positional data should be present
      // Check for QB label
      expect(screen.getAllByText('QB')).not.toHaveLength(0);
    });

    it('handles empty positional data', () => {
      const teamInfo = createTeamInfo({
        teamName: 'Empty Team',
        leagueName: 'Test',
        leagueId: 'L1',
        rosterId: 1,
      });

      const entry = createTeamData({
        key: 'L1-1',
        info: teamInfo,
        teamScores: [{ week: 1, value: 100 }],
        opponentScores: [{ week: 1, value: 95 }],
      });

      const positionMap = new Map<TrackedPosition, PositionData>();
      trackedPositions.forEach(position => {
        positionMap.set(position, { teams: [] });
      });

      const dataset = buildDataset([entry], positionMap, {
        1: {
          [entry[0]]: {
            week: 1,
            teamKey: entry[0],
            positions: { QB: [], RB: [], WR: [], TE: [], DEF: [] },
          },
        },
      });

      render(
        <TeamView
          allTeamEntries={[entry]}
          positionsMap={positionMap}
          dataset={dataset}
          fromWeek={1}
          toWeek={1}
          availableWeeks={[1]}
        />,
      );

      // Should still render with empty data
      expect(screen.getByText(/Team Overview/)).toBeInTheDocument();
    });
  });

  describe('Week Range Handling', () => {
    it('filters data by week range', () => {
      const props = buildProps();
      render(<TeamView {...props} />);

      // Should show data for weeks 1-3
      expect(screen.getAllByText('120.0')).not.toHaveLength(0);
      expect(screen.getAllByText('110.0')).not.toHaveLength(0);
      expect(screen.getAllByText('130.0')).not.toHaveLength(0);
    });

    it('handles single week range', () => {
      const teamInfo = createTeamInfo({
        teamName: 'Single Week',
        leagueName: 'Test',
        leagueId: 'L1',
        rosterId: 1,
      });

      const entry = createTeamData({
        key: 'L1-1',
        info: teamInfo,
        teamScores: [{ week: 1, value: 100 }],
        opponentScores: [{ week: 1, value: 95 }],
      });

      const positionMap = new Map<TrackedPosition, PositionData>();
      trackedPositions.forEach(position => {
        positionMap.set(position, { teams: [] });
      });

      const dataset = buildDataset([entry], positionMap, {
        1: {
          [entry[0]]: {
            week: 1,
            teamKey: entry[0],
            positions: { QB: [], RB: [], WR: [], TE: [], DEF: [] },
          },
        },
      });

      render(
        <TeamView
          allTeamEntries={[entry]}
          positionsMap={positionMap}
          dataset={dataset}
          fromWeek={1}
          toWeek={1}
          availableWeeks={[1]}
        />,
      );

      expect(screen.getAllByText('100.0')).not.toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('shows empty state when no teams provided', () => {
      const positionMap = new Map<TrackedPosition, PositionData>();
      trackedPositions.forEach(position => {
        positionMap.set(position, { teams: [] });
      });

      const dataset = buildDataset([], positionMap, {});

      render(
        <TeamView
          allTeamEntries={[]}
          positionsMap={positionMap}
          dataset={dataset}
          fromWeek={1}
          toWeek={3}
          availableWeeks={[1, 2, 3]}
        />,
      );

      expect(screen.getByText('Select a team to view analysis')).toBeInTheDocument();
    });

    it('handles zero scores', () => {
      const teamInfo = createTeamInfo({
        teamName: 'Zero Team',
        leagueName: 'Test',
        leagueId: 'L1',
        rosterId: 1,
      });

      const entry = createTeamData({
        key: 'L1-1',
        info: teamInfo,
        teamScores: [{ week: 1, value: 0 }],
        opponentScores: [{ week: 1, value: 0 }],
      });

      const positionMap = new Map<TrackedPosition, PositionData>();
      trackedPositions.forEach(position => {
        positionMap.set(position, { teams: [] });
      });

      const dataset = buildDataset([entry], positionMap, {
        1: {
          [entry[0]]: {
            week: 1,
            teamKey: entry[0],
            positions: { QB: [], RB: [], WR: [], TE: [], DEF: [] },
          },
        },
      });

      render(
        <TeamView
          allTeamEntries={[entry]}
          positionsMap={positionMap}
          dataset={dataset}
          fromWeek={1}
          toWeek={1}
          availableWeeks={[1]}
        />,
      );

      expect(screen.getAllByText('0.0')).not.toHaveLength(0);
    });
  });
});
