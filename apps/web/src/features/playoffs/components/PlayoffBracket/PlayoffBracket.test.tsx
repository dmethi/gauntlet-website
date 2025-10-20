import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayoffBracket } from './PlayoffBracket';
import type { BracketTeam, PlayoffBracketProps } from '@/features/playoffs/types';

const createMockTeams = (): BracketTeam[] => [
  {
    rosterId: 1,
    teamName: 'Team Alpha',
    seed: 1,
    record: { wins: 10, losses: 3, ties: 0 },
    totalPoints: 1500,
  },
  {
    rosterId: 2,
    teamName: 'Team Beta',
    seed: 2,
    record: { wins: 9, losses: 4, ties: 0 },
    totalPoints: 1450,
  },
  {
    rosterId: 3,
    teamName: 'Team Gamma',
    seed: 3,
    record: { wins: 8, losses: 5, ties: 0 },
    totalPoints: 1400,
  },
  {
    rosterId: 4,
    teamName: 'Team Delta',
    seed: 4,
    record: { wins: 7, losses: 6, ties: 0 },
    totalPoints: 1350,
  },
];

describe('PlayoffBracket', () => {
  describe('Rendering', () => {
    it('renders bracket with teams', () => {
      const teams = createMockTeams();
      const props: PlayoffBracketProps = {
        teams,
        league: {
          name: 'Test League',
          leagueId: 'league-1',
          season: '2025',
          previousLeagueId: null,
        },
        playoffBracket: null,
      };

      render(<PlayoffBracket {...props} />);

      expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    });

    it('displays bracket legend', () => {
      const teams = createMockTeams();
      const props: PlayoffBracketProps = {
        teams,
        league: {
          name: 'Test League',
          leagueId: 'league-1',
          season: '2025',
          previousLeagueId: null,
        },
        playoffBracket: null,
      };

      render(<PlayoffBracket {...props} />);

      expect(screen.getByText(/Legend/i)).toBeInTheDocument();
    });
  });

  describe('Official Bracket', () => {
    it('displays official bracket badge when data available', () => {
      const teams = createMockTeams();
      const props: PlayoffBracketProps = {
        teams,
        league: {
          name: 'Test League',
          leagueId: 'league-1',
          season: '2025',
          previousLeagueId: null,
        },
        playoffBracket: {
          winners_bracket: [
            {
              r: 1,
              m: 1,
              t1: 1,
              t2: 4,
              w: 1,
              t1_from: null,
              t2_from: null,
            },
          ],
          losers_bracket: [],
        },
      };

      render(<PlayoffBracket {...props} />);

      expect(screen.getByText(/Official Bracket Data/i)).toBeInTheDocument();
      expect(screen.getByText(/Loaded from Sleeper API/i)).toBeInTheDocument();
    });

    it('renders official bracket flow', () => {
      const teams = createMockTeams();
      const props: PlayoffBracketProps = {
        teams,
        league: {
          name: 'Test League',
          leagueId: 'league-1',
          season: '2025',
          previousLeagueId: null,
        },
        playoffBracket: {
          winners_bracket: [
            {
              r: 1,
              m: 1,
              t1: 1,
              t2: 4,
              w: 1,
              t1_from: null,
              t2_from: null,
            },
          ],
          losers_bracket: [],
        },
      };

      render(<PlayoffBracket {...props} />);

      // Should render official bracket structure
      expect(screen.getByText('Team Alpha')).toBeInTheDocument();
      expect(screen.getByText('Team Delta')).toBeInTheDocument();
    });
  });

  describe('Fallback Bracket', () => {
    it('displays fallback badge when no official data', () => {
      const teams = createMockTeams();
      const props: PlayoffBracketProps = {
        teams,
        league: {
          name: 'Test League',
          leagueId: 'league-1',
          season: '2025',
          previousLeagueId: null,
        },
        playoffBracket: null,
      };

      render(<PlayoffBracket {...props} />);

      expect(screen.getByText(/Reconstructed Bracket View/i)).toBeInTheDocument();
      expect(screen.getByText(/No official bracket detected/i)).toBeInTheDocument();
    });

    it('renders fallback bracket structure', () => {
      const teams = createMockTeams();
      const props: PlayoffBracketProps = {
        teams,
        league: {
          name: 'Test League',
          leagueId: 'league-1',
          season: '2025',
          previousLeagueId: null,
        },
        playoffBracket: null,
      };

      render(<PlayoffBracket {...props} />);

      // Should render all teams in fallback view
      expect(screen.getByText('Team Alpha')).toBeInTheDocument();
      expect(screen.getByText('Team Beta')).toBeInTheDocument();
    });
  });

  describe('Team Display', () => {
    it('displays team seeds', () => {
      const teams = createMockTeams();
      const props: PlayoffBracketProps = {
        teams,
        league: {
          name: 'Test League',
          leagueId: 'league-1',
          season: '2025',
          previousLeagueId: null,
        },
        playoffBracket: null,
      };

      render(<PlayoffBracket {...props} />);

      // Seeds should be displayed
      expect(screen.getByText(/#1/)).toBeInTheDocument();
    });

    it('displays team records', () => {
      const teams = createMockTeams();
      const props: PlayoffBracketProps = {
        teams,
        league: {
          name: 'Test League',
          leagueId: 'league-1',
          season: '2025',
          previousLeagueId: null,
        },
        playoffBracket: null,
      };

      render(<PlayoffBracket {...props} />);

      // Records should be displayed
      expect(screen.getByText(/10-3/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty teams array', () => {
      const props: PlayoffBracketProps = {
        teams: [],
        league: {
          name: 'Test League',
          leagueId: 'league-1',
          season: '2025',
          previousLeagueId: null,
        },
        playoffBracket: null,
      };

      render(<PlayoffBracket {...props} />);

      expect(screen.getByText(/Reconstructed Bracket View/i)).toBeInTheDocument();
    });

    it('handles single team', () => {
      const teams = [createMockTeams()[0]];
      const props: PlayoffBracketProps = {
        teams,
        league: {
          name: 'Test League',
          leagueId: 'league-1',
          season: '2025',
          previousLeagueId: null,
        },
        playoffBracket: null,
      };

      render(<PlayoffBracket {...props} />);

      expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    });

    it('handles missing league data', () => {
      const teams = createMockTeams();
      const props: PlayoffBracketProps = {
        teams,
        playoffBracket: null,
      };

      render(<PlayoffBracket {...props} />);

      expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    });
  });

  describe('Bracket Structure', () => {
    it('displays matchup structure', () => {
      const teams = createMockTeams();
      const props: PlayoffBracketProps = {
        teams,
        league: {
          name: 'Test League',
          leagueId: 'league-1',
          season: '2025',
          previousLeagueId: null,
        },
        playoffBracket: {
          winners_bracket: [
            {
              r: 1,
              m: 1,
              t1: 1,
              t2: 4,
              w: 1,
              t1_from: null,
              t2_from: null,
            },
            {
              r: 1,
              m: 2,
              t1: 2,
              t2: 3,
              w: 2,
              t1_from: null,
              t2_from: null,
            },
          ],
          losers_bracket: [],
        },
      };

      render(<PlayoffBracket {...props} />);

      // Both matchups should be displayed
      expect(screen.getByText('Team Alpha')).toBeInTheDocument();
      expect(screen.getByText('Team Delta')).toBeInTheDocument();
      expect(screen.getByText('Team Beta')).toBeInTheDocument();
      expect(screen.getByText('Team Gamma')).toBeInTheDocument();
    });
  });
});
