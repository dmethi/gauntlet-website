import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrendsView } from './TrendsView';
import type { TeamData, TrendsViewProps } from '@/features/stats/types';
import type { PlainStatsDataset, TrackedPosition } from '@/shared/utils/stats';

const createMockDataset = (): PlainStatsDataset => ({
  currentWeek: 4,
  currentSeason: '2025',
  leagues: [],
  weekRange: { from: 1, to: 18 },
  teams: [],
  positions: [],
  weeklyPlayerData: {},
  weeklyMedians: {},
  weeklyAverages: {},
});

const createMockTeamEntry = (key: string, teamName: string): [string, TeamData] => [
  key,
  {
    teamInfo: {
      teamName,
      leagueName: 'Test League',
      leagueId: 'league-1',
      rosterId: 1,
    },
    teamScores: [
      { week: 1, value: 120 },
      { week: 2, value: 115 },
      { week: 3, value: 130 },
    ],
    opponentScores: [
      { week: 1, value: 110 },
      { week: 2, value: 125 },
      { week: 3, value: 120 },
    ],
  },
];

describe('TrendsView', () => {
  const mockPositionsMap = new Map<TrackedPosition, { teams: Array<[string, unknown]> }>([
    ['QB', { teams: [] }],
    ['RB', { teams: [] }],
    ['WR', { teams: [] }],
    ['TE', { teams: [] }],
    ['DEF', { teams: [] }],
  ]);

  describe('Rendering', () => {
    it('renders all trend sections', () => {
      const entry = createMockTeamEntry('team-1', 'Team Alpha');
      const props: TrendsViewProps = {
        allTeamEntries: [entry],
        positionsMap: mockPositionsMap,
        dataset: createMockDataset(),
      };

      render(<TrendsView {...props} />);

      // Check for section headings. "Weekly Performance Trends" is matched with
      // an exact (non-regex) string since PositionPerformanceTrends renders
      // per-position cards titled "{position} Weekly Performance Trends", which
      // would also match a substring/regex query.
      expect(screen.getByText(/Power Rankings Evolution/i)).toBeInTheDocument();
      expect(screen.getByText('Weekly Performance Trends')).toBeInTheDocument();
      expect(screen.getByText(/Team Consistency/i)).toBeInTheDocument();
    });

    it('renders with multiple teams', () => {
      const entries = [
        createMockTeamEntry('team-1', 'Team Alpha'),
        createMockTeamEntry('team-2', 'Team Beta'),
        createMockTeamEntry('team-3', 'Team Gamma'),
      ];

      const props: TrendsViewProps = {
        allTeamEntries: entries,
        positionsMap: mockPositionsMap,
        dataset: createMockDataset(),
      };

      render(<TrendsView {...props} />);

      // Should render with multiple teams
      expect(screen.getByText(/Power Rankings Evolution/i)).toBeInTheDocument();
    });
  });

  describe('Power Rankings Evolution', () => {
    it('displays power rankings component', () => {
      const entry = createMockTeamEntry('team-1', 'Team Alpha');
      const props: TrendsViewProps = {
        allTeamEntries: [entry],
        positionsMap: mockPositionsMap,
        dataset: createMockDataset(),
      };

      render(<TrendsView {...props} />);

      expect(screen.getByText(/Power Rankings Evolution/i)).toBeInTheDocument();
    });
  });

  describe('Weekly Performance Trends', () => {
    it('displays weekly performance component', () => {
      const entry = createMockTeamEntry('team-1', 'Team Alpha');
      const props: TrendsViewProps = {
        allTeamEntries: [entry],
        positionsMap: mockPositionsMap,
        dataset: createMockDataset(),
      };

      render(<TrendsView {...props} />);

      expect(screen.getByText('Weekly Performance Trends')).toBeInTheDocument();
    });
  });

  describe('Position Performance Trends', () => {
    it('displays position performance component', () => {
      const entry = createMockTeamEntry('team-1', 'Team Alpha');
      const props: TrendsViewProps = {
        allTeamEntries: [entry],
        positionsMap: mockPositionsMap,
        dataset: createMockDataset(),
      };

      render(<TrendsView {...props} />);

      // PositionPerformanceTrends renders one card per position, titled
      // "{position} Weekly Performance Trends" (e.g. "QB Weekly Performance Trends").
      expect(screen.getByText('QB Weekly Performance Trends')).toBeInTheDocument();
    });
  });

  describe('Consistency Analysis', () => {
    it('displays team consistency component', () => {
      const entry = createMockTeamEntry('team-1', 'Team Alpha');
      const props: TrendsViewProps = {
        allTeamEntries: [entry],
        positionsMap: mockPositionsMap,
        dataset: createMockDataset(),
      };

      render(<TrendsView {...props} />);

      expect(screen.getByText(/Team Consistency/i)).toBeInTheDocument();
    });

    it('displays position consistency component', () => {
      const entry = createMockTeamEntry('team-1', 'Team Alpha');
      const props: TrendsViewProps = {
        allTeamEntries: [entry],
        positionsMap: mockPositionsMap,
        dataset: createMockDataset(),
      };

      render(<TrendsView {...props} />);

      // PositionConsistencyAnalysis renders one card per position, titled
      // "{position} Consistency Analysis" (e.g. "QB Consistency Analysis").
      expect(screen.getByText('QB Consistency Analysis')).toBeInTheDocument();
    });
  });

  describe('Scoring Distribution', () => {
    it('displays team scoring distribution', () => {
      const entry = createMockTeamEntry('team-1', 'Team Alpha');
      const props: TrendsViewProps = {
        allTeamEntries: [entry],
        positionsMap: mockPositionsMap,
        dataset: createMockDataset(),
      };

      render(<TrendsView {...props} />);

      expect(screen.getByText(/Team Scoring Distribution/i)).toBeInTheDocument();
    });

    it('displays position scoring distribution', () => {
      const entry = createMockTeamEntry('team-1', 'Team Alpha');
      const props: TrendsViewProps = {
        allTeamEntries: [entry],
        positionsMap: mockPositionsMap,
        dataset: createMockDataset(),
      };

      render(<TrendsView {...props} />);

      // PositionScoringDistribution renders one card per position, titled
      // "{position} Scoring Distribution Analysis" (e.g. "QB Scoring Distribution Analysis").
      expect(screen.getByText('QB Scoring Distribution Analysis')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty team entries', () => {
      const props: TrendsViewProps = {
        allTeamEntries: [],
        positionsMap: mockPositionsMap,
        dataset: createMockDataset(),
      };

      render(<TrendsView {...props} />);

      // Should still render sections
      expect(screen.getByText(/Power Rankings Evolution/i)).toBeInTheDocument();
    });

    it('handles single team', () => {
      const entry = createMockTeamEntry('team-1', 'Solo Team');
      const props: TrendsViewProps = {
        allTeamEntries: [entry],
        positionsMap: mockPositionsMap,
        dataset: createMockDataset(),
      };

      render(<TrendsView {...props} />);

      expect(screen.getByText(/Power Rankings Evolution/i)).toBeInTheDocument();
    });
  });
});
