import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayoffBracket } from './PlayoffBracket';
import type { PlayoffBracketProps } from '@/features/playoffs/types';
import type { TeamStats } from '@/shared/types/api';

const createMockTeams = (): TeamStats[] =>
  Array.from({ length: 12 }).map((_, index) => ({
    id: String(index + 1),
    name: `Team ${index + 1}`,
    owner: `Owner ${index + 1}`,
    wins: 12 - index,
    losses: index,
    totalPoints: 1500 - index * 25,
    expectedWins: 10 - index * 0.3,
    luckRating: 1.2 - index * 0.05,
    winPercentage: (12 - index) / 12,
    canonicalRank: index + 1,
    division: index % 3,
  }));

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
      expect(screen.getAllByText(new RegExp(teams[0].name))).not.toHaveLength(0);
      expect(screen.getAllByText(new RegExp(teams[3].name))).not.toHaveLength(0);
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

      // Should render core fallback structure
      expect(screen.getAllByText(/Wildcard 1/i)).not.toHaveLength(0);
      expect(screen.getAllByText(/Lower Bracket/i)).not.toHaveLength(0);
      expect(screen.getAllByText(/Toilet Wildcard 1/i)).not.toHaveLength(0);
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
      expect(screen.getAllByText(/#1/)).not.toHaveLength(0);
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

      // Records should be displayed (monospace spans with dash-separated record)
      const recordSpans = screen.getAllByText((content, element) => {
        if (!element) return false;
        return element.classList.contains('text-muted-foreground') && /\d+-\d+/.test(content);
      });

      expect(recordSpans.length).toBeGreaterThan(0);
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
    });

    it('handles missing league data', () => {
      const teams = createMockTeams();
      const props: PlayoffBracketProps = {
        teams,
        playoffBracket: null,
      };

      render(<PlayoffBracket {...props} />);
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
      expect(screen.getAllByText(new RegExp(teams[0].name))).not.toHaveLength(0);
      expect(screen.getAllByText(new RegExp(teams[3].name))).not.toHaveLength(0);
      expect(screen.getAllByText(new RegExp(teams[1].name))).not.toHaveLength(0);
      expect(screen.getAllByText(new RegExp(teams[2].name))).not.toHaveLength(0);
    });
  });
});
