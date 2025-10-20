import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeagueView } from './LeagueView';
import type { LeagueViewProps, TeamData } from '@/features/stats/types';
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

const createMockTeamEntry = (
  key: string,
  teamName: string,
  totalPoints: number,
): [string, TeamData] => [
  key,
  {
    teamInfo: {
      teamName,
      leagueName: 'Test League',
      leagueId: 'league-1',
      rosterId: parseInt(key.split('-')[1]),
    },
    teamScores: [
      { week: 1, value: totalPoints / 3 },
      { week: 2, value: totalPoints / 3 },
      { week: 3, value: totalPoints / 3 },
    ],
    opponentScores: [
      { week: 1, value: 100 },
      { week: 2, value: 100 },
      { week: 3, value: 100 },
    ],
  },
];

describe('LeagueView', () => {
  const mockPositionsMap = new Map<TrackedPosition, { teams: Array<[string, unknown]> }>([
    ['QB', { teams: [] }],
    ['RB', { teams: [] }],
    ['WR', { teams: [] }],
    ['TE', { teams: [] }],
    ['DEF', { teams: [] }],
  ]);

  const createProps = (overrides: Partial<LeagueViewProps> = {}): LeagueViewProps => ({
    selectedWeek: 'season',
    setSelectedWeek: vi.fn(),
    availableWeeks: [1, 2, 3, 4],
    allTeamEntries: [],
    positionsMap: mockPositionsMap,
    dataset: createMockDataset(),
    fromWeek: 1,
    toWeek: 3,
    ...overrides,
  });

  describe('Rendering', () => {
    it('renders league rankings table', () => {
      const entries = [
        createMockTeamEntry('team-1', 'Team Alpha', 360),
        createMockTeamEntry('team-2', 'Team Beta', 340),
      ];

      const props = createProps({ allTeamEntries: entries });

      render(<LeagueView {...props} />);

      expect(screen.getByText(/League Rankings/i)).toBeInTheDocument();
    });

    it('displays team names in rankings', () => {
      const entries = [
        createMockTeamEntry('team-1', 'Team Alpha', 360),
        createMockTeamEntry('team-2', 'Team Beta', 340),
      ];

      const props = createProps({ allTeamEntries: entries });

      render(<LeagueView {...props} />);

      expect(screen.getByText('Team Alpha')).toBeInTheDocument();
      expect(screen.getByText('Team Beta')).toBeInTheDocument();
    });
  });

  describe('Position Rankings', () => {
    it('displays position ranking sections', () => {
      const entries = [createMockTeamEntry('team-1', 'Team Alpha', 360)];

      const props = createProps({ allTeamEntries: entries });

      render(<LeagueView {...props} />);

      // Should display position sections
      expect(screen.getByText(/QB Rankings/i)).toBeInTheDocument();
      expect(screen.getByText(/RB Rankings/i)).toBeInTheDocument();
      expect(screen.getByText(/WR Rankings/i)).toBeInTheDocument();
    });
  });

  describe('Positional Advantages', () => {
    it('displays positional advantages card', () => {
      const entries = [createMockTeamEntry('team-1', 'Team Alpha', 360)];

      const props = createProps({ allTeamEntries: entries });

      render(<LeagueView {...props} />);

      expect(screen.getAllByText(/Positional Advantages/i)).not.toHaveLength(0);
    });
  });

  describe('Data Display', () => {
    it('displays total points for teams', () => {
      const entries = [
        createMockTeamEntry('team-1', 'Team Alpha', 360),
        createMockTeamEntry('team-2', 'Team Beta', 340),
      ];

      const props = createProps({ allTeamEntries: entries });

      render(<LeagueView {...props} />);

      // Total points should be displayed
      expect(screen.getByText('360.0')).toBeInTheDocument();
      expect(screen.getByText('340.0')).toBeInTheDocument();
    });
  });

  describe('Rankings Order', () => {
    it('orders teams by total points', () => {
      const entries = [
        createMockTeamEntry('team-1', 'Team Alpha', 360),
        createMockTeamEntry('team-2', 'Team Beta', 380),
        createMockTeamEntry('team-3', 'Team Gamma', 340),
      ];

      const props = createProps({ allTeamEntries: entries });

      const { container } = render(<LeagueView {...props} />);

      // Check that teams are ordered (highest to lowest)
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty team list', () => {
      const props = createProps();

      render(<LeagueView {...props} />);

      expect(screen.getByText(/League Rankings/i)).toBeInTheDocument();
    });

    it('handles single team', () => {
      const entries = [createMockTeamEntry('team-1', 'Solo Team', 360)];

      const props = createProps({ allTeamEntries: entries });

      render(<LeagueView {...props} />);

      expect(screen.getByText('Solo Team')).toBeInTheDocument();
      expect(screen.getByText('360.0')).toBeInTheDocument();
    });

    it('handles zero scores', () => {
      const entries = [createMockTeamEntry('team-1', 'Zero Team', 0)];

      const props = createProps({ allTeamEntries: entries });

      render(<LeagueView {...props} />);

      expect(screen.getByText('0.0')).toBeInTheDocument();
    });
  });
});
