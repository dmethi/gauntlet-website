import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScheduleAnalysis } from './ScheduleAnalysis';
import type { ScheduleAnalysisProps, TeamData } from '@/features/stats/types';
import type { PlainStatsDataset } from '@/shared/utils/stats';

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
  leagueName: string,
): [string, TeamData] => [
  key,
  {
    teamInfo: {
      teamName,
      leagueName,
      leagueId: leagueName === 'AFC' ? 'afc-123' : 'nfc-456',
      rosterId: parseInt(key.split('-')[1]),
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

describe('ScheduleAnalysis', () => {
  describe('Rendering', () => {
    it('renders schedule analysis title', () => {
      const entries = [createMockTeamEntry('team-1', 'Team Alpha', 'AFC')];
      const props: ScheduleAnalysisProps = {
        allTeamEntries: entries,
        dataset: createMockDataset(),
      };

      render(<ScheduleAnalysis {...props} />);

      expect(screen.getByText('Schedule Analysis')).toBeInTheDocument();
      expect(
        screen.getByText(/Hypothetical records and schedule strength comparisons/i),
      ).toBeInTheDocument();
    });

    it('renders schedule matrix table', () => {
      const entries = [
        createMockTeamEntry('team-1', 'Team Alpha', 'AFC'),
        createMockTeamEntry('team-2', 'Team Beta', 'AFC'),
      ];
      const props: ScheduleAnalysisProps = {
        allTeamEntries: entries,
        dataset: createMockDataset(),
      };

      render(<ScheduleAnalysis {...props} />);

      expect(screen.getByText(/Hypothetical Records Matrix/i)).toBeInTheDocument();
    });
  });

  describe('Schedule Strength', () => {
    it('displays schedule strength table', () => {
      const entries = [createMockTeamEntry('team-1', 'Team Alpha', 'AFC')];
      const props: ScheduleAnalysisProps = {
        allTeamEntries: entries,
        dataset: createMockDataset(),
      };

      render(<ScheduleAnalysis {...props} />);

      expect(screen.getByText(/Schedule Strength/i)).toBeInTheDocument();
    });
  });

  describe('Schedule Difficulty', () => {
    it('displays schedule difficulty table', () => {
      const entries = [createMockTeamEntry('team-1', 'Team Alpha', 'AFC')];
      const props: ScheduleAnalysisProps = {
        allTeamEntries: entries,
        dataset: createMockDataset(),
      };

      render(<ScheduleAnalysis {...props} />);

      expect(screen.getByText(/Schedule Difficulty/i)).toBeInTheDocument();
    });
  });

  describe('League-by-League Matrices', () => {
    it('displays AFC league matrix when AFC teams present', () => {
      const entries = [
        createMockTeamEntry('team-1', 'Team Alpha', 'AFC'),
        createMockTeamEntry('team-2', 'Team Beta', 'AFC'),
      ];
      const props: ScheduleAnalysisProps = {
        allTeamEntries: entries,
        dataset: createMockDataset(),
      };

      render(<ScheduleAnalysis {...props} />);

      expect(screen.getByText(/AFC League/i)).toBeInTheDocument();
    });

    it('displays NFC league matrix when NFC teams present', () => {
      const entries = [
        createMockTeamEntry('team-1', 'Team Alpha', 'NFC'),
        createMockTeamEntry('team-2', 'Team Beta', 'NFC'),
      ];
      const props: ScheduleAnalysisProps = {
        allTeamEntries: entries,
        dataset: createMockDataset(),
      };

      render(<ScheduleAnalysis {...props} />);

      expect(screen.getByText(/NFC League/i)).toBeInTheDocument();
    });

    it('displays both AFC and NFC matrices with mixed teams', () => {
      const entries = [
        createMockTeamEntry('team-1', 'Team Alpha', 'AFC'),
        createMockTeamEntry('team-2', 'Team Beta', 'NFC'),
      ];
      const props: ScheduleAnalysisProps = {
        allTeamEntries: entries,
        dataset: createMockDataset(),
      };

      render(<ScheduleAnalysis {...props} />);

      expect(screen.getByText(/AFC League/i)).toBeInTheDocument();
      expect(screen.getByText(/NFC League/i)).toBeInTheDocument();
    });
  });

  describe('Expected Wins', () => {
    it('displays expected wins table', () => {
      const entries = [createMockTeamEntry('team-1', 'Team Alpha', 'AFC')];
      const props: ScheduleAnalysisProps = {
        allTeamEntries: entries,
        dataset: createMockDataset(),
      };

      render(<ScheduleAnalysis {...props} />);

      expect(screen.getByText(/Expected Wins/i)).toBeInTheDocument();
    });
  });

  describe('Weekly Difficulty', () => {
    it('displays weekly difficulty chart', () => {
      const entries = [createMockTeamEntry('team-1', 'Team Alpha', 'AFC')];
      const props: ScheduleAnalysisProps = {
        allTeamEntries: entries,
        dataset: createMockDataset(),
      };

      render(<ScheduleAnalysis {...props} />);

      expect(screen.getByText(/Weekly Difficulty/i)).toBeInTheDocument();
    });
  });

  describe('Luck Distribution', () => {
    it('displays luck distribution section', () => {
      const entries = [createMockTeamEntry('team-1', 'Team Alpha', 'AFC')];
      const props: ScheduleAnalysisProps = {
        allTeamEntries: entries,
        dataset: createMockDataset(),
      };

      render(<ScheduleAnalysis {...props} />);

      expect(screen.getByText(/Luck Distribution/i)).toBeInTheDocument();
    });

    it('allows team selection for luck distribution', () => {
      const entries = [
        createMockTeamEntry('team-1', 'Team Alpha', 'AFC'),
        createMockTeamEntry('team-2', 'Team Beta', 'AFC'),
      ];
      const props: ScheduleAnalysisProps = {
        allTeamEntries: entries,
        dataset: createMockDataset(),
      };

      render(<ScheduleAnalysis {...props} />);

      // Should have team selector
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty team list', () => {
      const props: ScheduleAnalysisProps = {
        allTeamEntries: [],
        dataset: createMockDataset(),
      };

      render(<ScheduleAnalysis {...props} />);

      expect(screen.getByText('Schedule Analysis')).toBeInTheDocument();
    });

    it('handles single team', () => {
      const entries = [createMockTeamEntry('team-1', 'Solo Team', 'AFC')];
      const props: ScheduleAnalysisProps = {
        allTeamEntries: entries,
        dataset: createMockDataset(),
      };

      render(<ScheduleAnalysis {...props} />);

      expect(screen.getByText(/Hypothetical Records Matrix/i)).toBeInTheDocument();
    });
  });
});
