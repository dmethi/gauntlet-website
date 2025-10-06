import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createGauntletAPIClient, gauntletAPI } from '../gauntlet-api-client';

// Mock global fetch
global.fetch = vi.fn();

describe('GauntletAPIClient', () => {
  let client: ReturnType<typeof createGauntletAPIClient>;

  beforeEach(() => {
    client = createGauntletAPIClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should use default options', () => {
      const client = createGauntletAPIClient();
      expect(client).toBeDefined();
    });

    it('should accept custom options', () => {
      const client = createGauntletAPIClient({
        baseUrl: 'https://custom.example.com',
        timeout: 60000,
      });
      expect(client).toBeDefined();
    });
  });

  describe('getCurrentWeek', () => {
    it('should fetch current NFL week successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ week: 5 }),
      });

      const week = await client.getCurrentWeek();
      expect(week).toBe(5);
      expect(global.fetch).toHaveBeenCalledWith('https://api.sleeper.app/v1/state/nfl');
    });

    it('should default to week 4 when API returns non-ok response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const week = await client.getCurrentWeek();
      expect(week).toBe(4);
    });

    it('should default to week 4 when API throws error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const week = await client.getCurrentWeek();
      expect(week).toBe(4);
    });

    it('should default to week 4 when response has no week field', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ season: '2025' }),
      });

      const week = await client.getCurrentWeek();
      expect(week).toBe(4);
    });
  });

  describe('fetchLeagueOdds', () => {
    it('should fetch league odds with cache busting', async () => {
      const mockResponse = {
        highestScorer: [
          { rosterId: 1, teamName: 'Team A', projection: 130.5 },
          { rosterId: 2, teamName: 'Team B', projection: 125.2 },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const odds = await client.fetchLeagueOdds(5);
      expect(odds).toEqual(mockResponse);

      // Verify cache-busting query parameter
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toMatch(/\/api\/matchups\/league-odds\/5\?t=\d+/);
      expect(fetchCall[1].headers['Cache-Control']).toBe('no-cache');
      expect(fetchCall[1].headers['Pragma']).toBe('no-cache');
    });

    it('should throw error when API returns non-ok response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(client.fetchLeagueOdds(5)).rejects.toThrow(
        'Failed to fetch league odds for week 5'
      );
    });

    it('should throw error on network failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network timeout'));

      await expect(client.fetchLeagueOdds(5)).rejects.toThrow(
        'Failed to fetch league odds for week 5'
      );
    });

    it('should respect custom baseUrl', async () => {
      const customClient = createGauntletAPIClient({
        baseUrl: 'https://custom.example.com',
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ highestScorer: [] }),
      });

      await customClient.fetchLeagueOdds(5);

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toMatch(/^https:\/\/custom\.example\.com/);
    });
  });

  describe('fetchMatchupSimulation', () => {
    const mockSimulation = {
      success: true,
      simulation: {
        teams: [
          {
            rosterId: 1,
            players: [
              {
                name: 'Player A',
                position: 'QB',
                projection: 25.5,
                currentScore: 20.0,
              },
            ],
          },
          {
            rosterId: 2,
            players: [
              {
                name: 'Player B',
                position: 'RB',
                projection: 15.2,
                currentScore: 12.0,
              },
            ],
          },
        ],
        team1WinPct: 0.65,
        team2WinPct: 0.35,
        team1Scores: { mean: 125.5 },
        team2Scores: { mean: 110.2 },
        impliedOdds: { spread: -3.5, total: 235.7 },
      },
    };

    it('should fetch matchup simulation successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSimulation,
      });

      const result = await client.fetchMatchupSimulation('1263744209295245312', 5, 1);
      expect(result).toEqual(mockSimulation);
      expect(result.success).toBe(true);

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toMatch(/\/api\/matchups\/1263744209295245312\/5\/1\/simulate$/);
    });

    it('should throw error when API returns non-ok response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.fetchMatchupSimulation('1263744209295245312', 5, 1)).rejects.toThrow(
        'Failed to fetch matchup simulation'
      );
    });

    it('should throw error when simulation returns unsuccessful response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Simulation failed' }),
      });

      await expect(client.fetchMatchupSimulation('1263744209295245312', 5, 1)).rejects.toThrow(
        'Matchup simulation returned unsuccessful response'
      );
    });

    it('should throw error on network failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Timeout'));

      await expect(client.fetchMatchupSimulation('1263744209295245312', 5, 1)).rejects.toThrow(
        'Failed to fetch matchup simulation'
      );
    });

    it('should respect custom timeout', async () => {
      const customClient = createGauntletAPIClient({ timeout: 5000 });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSimulation,
      });

      await customClient.fetchMatchupSimulation('1263744209295245312', 5, 1);

      // Verify AbortSignal.timeout was called (implicitly through signal param)
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].signal).toBeDefined();
    });
  });

  describe('getTeamNames', () => {
    const mockUsers = [
      {
        user_id: 'user1',
        display_name: 'Alice',
        metadata: { team_name: "Alice's Team" },
      },
      {
        user_id: 'user2',
        display_name: 'Bob',
        metadata: { team_name: "Bob's Team" },
      },
      {
        user_id: 'user3',
        display_name: 'Charlie',
        metadata: {},
      },
    ];

    const mockRosters = [
      { roster_id: 1, owner_id: 'user1' },
      { roster_id: 2, owner_id: 'user2' },
      { roster_id: 3, owner_id: 'user3' },
      { roster_id: 4, owner_id: 'user_unknown' },
    ];

    it('should fetch team names successfully', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUsers,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRosters,
        });

      const teamNames = await client.getTeamNames('1263744209295245312');

      expect(teamNames.size).toBe(4);
      expect(teamNames.get(1)).toBe("Alice's Team");
      expect(teamNames.get(2)).toBe("Bob's Team");
      expect(teamNames.get(3)).toBe('Charlie'); // Falls back to display_name
      expect(teamNames.get(4)).toBe('Team 4'); // Falls back to default
    });

    it('should use parallel API calls', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUsers,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRosters,
        });

      await client.getTeamNames('1263744209295245312');

      // Both calls should be made
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect((global.fetch as any).mock.calls[0][0]).toContain('/users');
      expect((global.fetch as any).mock.calls[1][0]).toContain('/rosters');
    });

    it('should return empty map when users API fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const teamNames = await client.getTeamNames('1263744209295245312');
      expect(teamNames.size).toBe(0);
    });

    it('should return empty map when rosters API fails', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUsers,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const teamNames = await client.getTeamNames('1263744209295245312');
      expect(teamNames.size).toBe(0);
    });

    it('should return empty map on network error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const teamNames = await client.getTeamNames('1263744209295245312');
      expect(teamNames.size).toBe(0);
    });
  });

  describe('gauntletAPI singleton', () => {
    it('should export a default client instance', () => {
      expect(gauntletAPI).toBeDefined();
      expect(gauntletAPI.getCurrentWeek).toBeTypeOf('function');
      expect(gauntletAPI.fetchLeagueOdds).toBeTypeOf('function');
      expect(gauntletAPI.fetchMatchupSimulation).toBeTypeOf('function');
      expect(gauntletAPI.getTeamNames).toBeTypeOf('function');
    });
  });
});
