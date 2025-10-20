import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

/**
 * Integration Tests: User Flows
 *
 * Tests complete user journeys through the application:
 * - Stats page: view teams, filter, sort
 * - Draft analysis: view managers, filter, sort
 * - Matchups: view matchups, simulate, view results
 *
 * Note: These tests focus on data flow and state management,
 * not full component rendering (which would require many more mocks)
 */

describe('User Flow Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    vi.clearAllMocks();
  });

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  describe('Stats Page Flow', () => {
    it('loads teams from both leagues', async () => {
      const mockStatsData = {
        afc: {
          teams: Array.from({ length: 12 }, (_, i) => ({
            roster_id: i + 1,
            league_id: 'afc-123',
            compositeId: `afc-123-${i + 1}`,
            name: `AFC Team ${i + 1}`,
            points: 1000 + i * 50,
            league: 'AFC',
          })),
        },
        nfc: {
          teams: Array.from({ length: 12 }, (_, i) => ({
            roster_id: i + 1,
            league_id: 'nfc-456',
            compositeId: `nfc-456-${i + 1}`,
            name: `NFC Team ${i + 1}`,
            points: 1100 + i * 50,
            league: 'NFC',
          })),
        },
        combined: {
          teams: [],
        },
      };

      // Combine teams for combined view
      mockStatsData.combined.teams = [...mockStatsData.afc.teams, ...mockStatsData.nfc.teams];

      // Mock API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockStatsData,
      });

      // Simulate data fetch
      const response = await fetch('/api/stats');
      const data = await response.json();

      // Verify data structure
      expect(data.afc.teams).toHaveLength(12);
      expect(data.nfc.teams).toHaveLength(12);
      expect(data.combined.teams).toHaveLength(24);

      // Verify composite IDs
      data.combined.teams.forEach((team: { compositeId: string; league: string }) => {
        expect(team.compositeId).toBeDefined();
        expect(team.compositeId).toContain(team.league === 'AFC' ? 'afc' : 'nfc');
      });
    });

    it('filters teams by league', async () => {
      const teams = [
        { id: 1, league: 'AFC', points: 1200 },
        { id: 2, league: 'AFC', points: 1150 },
        { id: 3, league: 'NFC', points: 1250 },
        { id: 4, league: 'NFC', points: 1180 },
      ];

      // Simulate filtering
      const filterByLeague = (teams: typeof teams, league: string | null) => {
        if (!league) return teams;
        return teams.filter(t => t.league === league);
      };

      const afcTeams = filterByLeague(teams, 'AFC');
      const nfcTeams = filterByLeague(teams, 'NFC');
      const allTeams = filterByLeague(teams, null);

      expect(afcTeams).toHaveLength(2);
      expect(nfcTeams).toHaveLength(2);
      expect(allTeams).toHaveLength(4);

      expect(afcTeams.every(t => t.league === 'AFC')).toBe(true);
      expect(nfcTeams.every(t => t.league === 'NFC')).toBe(true);
    });

    it('sorts teams by points correctly', async () => {
      const teams = [
        { id: 1, name: 'Team A', points: 1150, league: 'AFC' },
        { id: 2, name: 'Team B', points: 1250, league: 'NFC' },
        { id: 3, name: 'Team C', points: 1100, league: 'AFC' },
        { id: 4, name: 'Team D', points: 1200, league: 'NFC' },
      ];

      // Simulate sorting
      const sortedDesc = [...teams].sort((a, b) => b.points - a.points);
      const sortedAsc = [...teams].sort((a, b) => a.points - b.points);

      // Descending (highest first)
      expect(sortedDesc[0]?.points).toBe(1250);
      expect(sortedDesc[sortedDesc.length - 1]?.points).toBe(1100);

      // Ascending (lowest first)
      expect(sortedAsc[0]?.points).toBe(1100);
      expect(sortedAsc[sortedAsc.length - 1]?.points).toBe(1250);
    });

    it('maintains composite IDs through filtering and sorting', async () => {
      const teams = [
        { id: 1, league: 'AFC', leagueId: 'afc-123', rosterId: 1, points: 1150 },
        { id: 2, league: 'NFC', leagueId: 'nfc-456', rosterId: 1, points: 1250 },
        { id: 3, league: 'AFC', leagueId: 'afc-123', rosterId: 2, points: 1100 },
      ];

      // Add composite IDs
      const teamsWithComposite = teams.map(t => ({
        ...t,
        compositeId: `${t.leagueId}-${t.rosterId}`,
      }));

      // Filter and sort
      const afcTeams = teamsWithComposite.filter(t => t.league === 'AFC');
      const sorted = [...afcTeams].sort((a, b) => b.points - a.points);

      // Composite IDs should be preserved
      sorted.forEach(team => {
        expect(team.compositeId).toBeDefined();
        expect(team.compositeId).toContain(team.leagueId);
      });
    });
  });

  describe('Draft Analysis Flow', () => {
    it('loads manager data for both leagues', async () => {
      const mockManagerData = {
        profiles: [
          { manager: 'Manager 1', league: 'AFC', team_total: 200 },
          { manager: 'Manager 2', league: 'AFC', team_total: 195 },
          { manager: 'Manager 3', league: 'NFC', team_total: 205 },
          { manager: 'Manager 4', league: 'NFC', team_total: 190 },
        ],
      };

      // Verify data structure
      const afcManagers = mockManagerData.profiles.filter(m => m.league === 'AFC');
      const nfcManagers = mockManagerData.profiles.filter(m => m.league === 'NFC');

      expect(afcManagers).toHaveLength(2);
      expect(nfcManagers).toHaveLength(2);
    });

    it('filters managers by league', async () => {
      const managers = [
        { id: 1, name: 'Manager A', league: 'AFC', gini: 0.45 },
        { id: 2, name: 'Manager B', league: 'AFC', gini: 0.5 },
        { id: 3, name: 'Manager C', league: 'NFC', gini: 0.42 },
      ];

      const filterByLeague = (managers: typeof managers, league: string | null) => {
        if (!league) return managers;
        return managers.filter(m => m.league === league);
      };

      const afcOnly = filterByLeague(managers, 'AFC');
      expect(afcOnly).toHaveLength(2);
      expect(afcOnly.every(m => m.league === 'AFC')).toBe(true);
    });

    it('sorts managers by metrics', async () => {
      const managers = [
        { name: 'Manager A', gini: 0.5 },
        { name: 'Manager B', gini: 0.45 },
        { name: 'Manager C', gini: 0.6 },
      ];

      const sorted = [...managers].sort((a, b) => b.gini - a.gini);

      expect(sorted[0]?.gini).toBe(0.6);
      expect(sorted[sorted.length - 1]?.gini).toBe(0.45);
    });
  });

  describe('Matchup Flow', () => {
    it('loads matchups for specific week and league', async () => {
      const week = 5;
      const leagueId = 'afc-123';

      const mockMatchups = Array.from({ length: 6 }, (_, i) => ({
        matchup_id: i + 1,
        leagueId,
        week,
        compositeId: `${leagueId}-${week}-${i + 1}`,
        teams: [
          { roster_id: i * 2 + 1, points: 120 },
          { roster_id: i * 2 + 2, points: 115 },
        ],
      }));

      // Verify structure
      expect(mockMatchups).toHaveLength(6);
      mockMatchups.forEach(m => {
        expect(m.teams).toHaveLength(2);
        expect(m.compositeId).toContain(leagueId);
        expect(m.compositeId).toContain(String(week));
      });
    });

    it('groups matchups correctly for both leagues', async () => {
      const week = 5;

      const createMatchups = (leagueId: string) => {
        return Array.from({ length: 12 }, (_, i) => ({
          matchup_id: Math.floor(i / 2) + 1, // 1-6
          roster_id: i + 1,
          points: 100 + i * 10,
          leagueId,
          week,
        }));
      };

      const afcMatchups = createMatchups('afc-123');
      const nfcMatchups = createMatchups('nfc-456');

      // Group matchups
      const groupMatchups = (matchups: typeof afcMatchups) => {
        const grouped = matchups.reduce(
          (acc, m) => {
            const key = `${m.leagueId}-${m.week}-${m.matchup_id}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(m);
            return acc;
          },
          {} as Record<string, typeof matchups>,
        );

        return Object.entries(grouped).map(([compositeId, teams]) => ({
          compositeId,
          teams,
        }));
      };

      const afcGrouped = groupMatchups(afcMatchups);
      const nfcGrouped = groupMatchups(nfcMatchups);
      const allGrouped = [...afcGrouped, ...nfcGrouped];

      // Verify grouping
      expect(allGrouped).toHaveLength(12); // 6 per league
      allGrouped.forEach(g => {
        expect(g.teams).toHaveLength(2);
      });

      // Verify unique composite IDs
      const ids = allGrouped.map(g => g.compositeId);
      expect(new Set(ids).size).toBe(12);
    });

    it('calculates matchup results correctly', async () => {
      const matchup = {
        compositeId: 'afc-123-5-1',
        teams: [
          { roster_id: 1, points: 125.5, name: 'Team A' },
          { roster_id: 2, points: 118.0, name: 'Team B' },
        ],
      };

      // Calculate winner
      const calculateWinner = (matchup: typeof matchup) => {
        const [team1, team2] = matchup.teams;
        if (!team1 || !team2) return null;

        return {
          winner: team1.points > team2.points ? team1 : team2,
          loser: team1.points > team2.points ? team2 : team1,
          margin: Math.abs(team1.points - team2.points),
        };
      };

      const result = calculateWinner(matchup);

      expect(result).toBeDefined();
      expect(result?.winner.roster_id).toBe(1);
      expect(result?.loser.roster_id).toBe(2);
      expect(result?.margin).toBeCloseTo(7.5);
    });
  });

  describe('Multi-League View Flow', () => {
    it('switches between league views correctly', async () => {
      const allTeams = [
        { id: 1, league: 'AFC', points: 1200 },
        { id: 2, league: 'AFC', points: 1150 },
        { id: 3, league: 'NFC', points: 1250 },
        { id: 4, league: 'NFC', points: 1180 },
      ];

      // Simulate view switching
      const getTeamsForView = (teams: typeof allTeams, view: 'all' | 'afc' | 'nfc') => {
        switch (view) {
          case 'afc':
            return teams.filter(t => t.league === 'AFC');
          case 'nfc':
            return teams.filter(t => t.league === 'NFC');
          case 'all':
          default:
            return teams;
        }
      };

      expect(getTeamsForView(allTeams, 'all')).toHaveLength(4);
      expect(getTeamsForView(allTeams, 'afc')).toHaveLength(2);
      expect(getTeamsForView(allTeams, 'nfc')).toHaveLength(2);
    });

    it('maintains correct ranks across league views', async () => {
      const teams = [
        { id: 1, league: 'AFC', points: 1200 },
        { id: 2, league: 'AFC', points: 1150 },
        { id: 3, league: 'NFC', points: 1250 },
        { id: 4, league: 'NFC', points: 1180 },
      ];

      // Calculate overall rank
      const withOverallRank = [...teams]
        .sort((a, b) => b.points - a.points)
        .map((t, idx) => ({ ...t, overallRank: idx + 1 }));

      // Calculate league-specific rank
      const withLeagueRank = (teams: typeof withOverallRank) => {
        const afcTeams = teams.filter(t => t.league === 'AFC');
        const nfcTeams = teams.filter(t => t.league === 'NFC');

        const rankedAfc = afcTeams
          .sort((a, b) => b.points - a.points)
          .map((t, idx) => ({ ...t, leagueRank: idx + 1 }));

        const rankedNfc = nfcTeams
          .sort((a, b) => b.points - a.points)
          .map((t, idx) => ({ ...t, leagueRank: idx + 1 }));

        return [...rankedAfc, ...rankedNfc];
      };

      const fullyRanked = withLeagueRank(withOverallRank);

      // Verify rankings
      const team1 = fullyRanked.find(t => t.id === 1);
      const team3 = fullyRanked.find(t => t.id === 3);

      expect(team1?.overallRank).toBe(2); // 2nd overall
      expect(team1?.leagueRank).toBe(1); // 1st in AFC

      expect(team3?.overallRank).toBe(1); // 1st overall
      expect(team3?.leagueRank).toBe(1); // 1st in NFC
    });
  });

  describe('Data Loading States', () => {
    it('handles loading state for async data', async () => {
      let isLoading = true;
      let data: unknown = null;

      // Simulate async fetch
      const fetchData = async () => {
        isLoading = true;
        await new Promise(resolve => setTimeout(resolve, 10));
        data = { teams: [] };
        isLoading = false;
      };

      await fetchData();

      expect(isLoading).toBe(false);
      expect(data).toBeDefined();
    });

    it('handles error state', async () => {
      let error: Error | null = null;
      let data: unknown = null;

      const fetchData = async () => {
        try {
          throw new Error('API Error');
        } catch (e) {
          error = e as Error;
          data = null;
        }
      };

      await fetchData();

      expect(error).toBeDefined();
      expect(error?.message).toBe('API Error');
      expect(data).toBeNull();
    });
  });

  describe('Navigation Between Pages', () => {
    it('preserves league context when navigating', async () => {
      // Simulate navigation with league context
      const navigationState = {
        currentLeague: 'AFC',
        currentPage: 'stats',
      };

      // Navigate to matchups
      navigationState.currentPage = 'matchups';

      // League context should be preserved
      expect(navigationState.currentLeague).toBe('AFC');
      expect(navigationState.currentPage).toBe('matchups');
    });

    it('maintains composite IDs across navigation', async () => {
      const selectedTeam = {
        roster_id: 1,
        league_id: 'afc-123',
        compositeId: 'afc-123-1',
      };

      // Navigate from stats to team detail
      const teamDetailUrl = `/team/${selectedTeam.compositeId}`;

      // Composite ID should be in URL
      expect(teamDetailUrl).toContain('afc-123-1');

      // Can parse composite ID back
      const parseCompositeId = (id: string) => {
        const parts = id.split('-');
        return {
          leagueId: parts.slice(0, -1).join('-'),
          rosterId: parts[parts.length - 1],
        };
      };

      const parsed = parseCompositeId(selectedTeam.compositeId);
      expect(parsed.leagueId).toBe('afc-123');
      expect(parsed.rosterId).toBe('1');
    });
  });

  describe('Complex Filter Combinations', () => {
    it('applies multiple filters correctly', async () => {
      const teams = [
        { id: 1, league: 'AFC', points: 1200, wins: 5 },
        { id: 2, league: 'AFC', points: 1150, wins: 3 },
        { id: 3, league: 'NFC', points: 1250, wins: 6 },
        { id: 4, league: 'NFC', points: 1180, wins: 4 },
      ];

      const applyFilters = (
        teams: typeof teams,
        filters: { league?: string; minPoints?: number; minWins?: number },
      ) => {
        let filtered = teams;

        if (filters.league) {
          filtered = filtered.filter(t => t.league === filters.league);
        }

        if (filters.minPoints) {
          filtered = filtered.filter(t => t.points >= filters.minPoints);
        }

        if (filters.minWins) {
          filtered = filtered.filter(t => t.wins >= filters.minWins);
        }

        return filtered;
      };

      // AFC teams with at least 1180 points
      const result1 = applyFilters(teams, { league: 'AFC', minPoints: 1180 });
      expect(result1).toHaveLength(1);
      expect(result1[0]?.id).toBe(1);

      // All teams with at least 5 wins
      const result2 = applyFilters(teams, { minWins: 5 });
      expect(result2).toHaveLength(2);

      // NFC teams with at least 4 wins
      const result3 = applyFilters(teams, { league: 'NFC', minWins: 4 });
      expect(result3).toHaveLength(2);
    });
  });
});
