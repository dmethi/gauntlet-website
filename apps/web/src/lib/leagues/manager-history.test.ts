import { describe, expect, it, vi } from 'vitest';
import { getManagerHistory, listManagers, type SleeperHistoryClient } from './manager-history';

vi.mock('@/config/leagues', () => ({
  getCurrentLeagues: () => [],
  getAllSeasons: () => ['2025', '2024'],
  getLeaguesForSeason: (season: string) =>
    season === '2025'
      ? [
          {
            id: 'league_2025_afc',
            name: 'Gauntlet AFC',
            season: 2025,
            conference: 'AFC',
            previousLeagueId: null,
          },
          {
            id: 'league_2025_nfc',
            name: 'Gauntlet NFC',
            season: 2025,
            conference: 'NFC',
            previousLeagueId: null,
          },
        ]
      : [
          {
            id: 'league_2024_afc',
            name: 'Gauntlet AFC',
            season: 2024,
            conference: 'AFC',
            previousLeagueId: null,
          },
        ],
}));

const OWNER_ID = 'owner_42';

const makeClient = (overrides: Partial<SleeperHistoryClient> = {}): SleeperHistoryClient => ({
  fetchRostersWithOwners: vi.fn().mockResolvedValue([]),
  fetchMatchups: vi.fn().mockResolvedValue([]),
  fetchLeague: vi
    .fn()
    .mockRejectedValue(new Error('fetchLeague should not be called with an override')),
  fetchNFLState: vi
    .fn()
    .mockRejectedValue(new Error('fetchNFLState should not be called with an override')),
  ...overrides,
});

describe('getManagerHistory', () => {
  it('returns null when the owner is not found in any registered league', async () => {
    const client = makeClient();
    const result = await getManagerHistory(OWNER_ID, client, 1);
    expect(result).toBeNull();
  });

  it('finds the manager in some leagues but skips leagues they are not in', async () => {
    const client = makeClient({
      fetchRostersWithOwners: vi.fn().mockImplementation(async (leagueId: string) => {
        if (leagueId === 'league_2025_afc') {
          return [{ roster_id: 3, owner_id: OWNER_ID, owner: { display_name: 'Newest Name' } }];
        }
        return []; // manager not in this league
      }),
      fetchMatchups: vi.fn().mockResolvedValue([]),
    });

    const result = await getManagerHistory(OWNER_ID, client, 1);

    expect(result).not.toBeNull();
    expect(result!.seasons).toHaveLength(1);
    expect(result!.seasons[0]!.leagueId).toBe('league_2025_afc');
  });

  it('gives a co-manager the history of their shared roster', async () => {
    const client = makeClient({
      fetchRostersWithOwners: vi.fn().mockImplementation(async (leagueId: string) => {
        if (leagueId === 'league_2025_afc') {
          return [
            {
              roster_id: 3,
              owner_id: 'primary-owner',
              co_owners: [OWNER_ID],
              owner: { display_name: 'Shared Team' },
            },
          ];
        }
        return [];
      }),
      fetchMatchups: vi.fn().mockResolvedValue([]),
    });

    const result = await getManagerHistory(OWNER_ID, client, 1);

    expect(result?.ownerId).toBe(OWNER_ID);
    expect(result?.seasons).toHaveLength(1);
    expect(result?.seasons[0]?.rosterId).toBe(3);
  });

  it('uses the most recently seen name across seasons (newest season first)', async () => {
    const client = makeClient({
      fetchRostersWithOwners: vi.fn().mockImplementation(async (leagueId: string) => {
        if (leagueId === 'league_2025_afc') {
          return [{ roster_id: 1, owner_id: OWNER_ID, owner: { display_name: 'New Name' } }];
        }
        if (leagueId === 'league_2024_afc') {
          return [{ roster_id: 1, owner_id: OWNER_ID, owner: { display_name: 'Old Name' } }];
        }
        return [];
      }),
      fetchMatchups: vi.fn().mockResolvedValue([]),
    });

    const result = await getManagerHistory(OWNER_ID, client, 1);

    expect(result!.displayName).toBe('New Name');
    expect(result!.seasons.map(s => s.season)).toEqual(['2025', '2024']);
  });

  it('aggregates wins/losses/points across leagues correctly', async () => {
    const client = makeClient({
      fetchRostersWithOwners: vi.fn().mockImplementation(async (leagueId: string) => {
        if (leagueId === 'league_2025_afc') {
          return [{ roster_id: 1, owner_id: OWNER_ID, owner: { display_name: 'Manager' } }];
        }
        return [];
      }),
      fetchMatchups: vi.fn().mockImplementation(async (leagueId: string, week: number) => {
        if (leagueId !== 'league_2025_afc') return [];
        // Week 1: manager (roster 1) wins 100-90. Week 2: manager loses 80-95.
        if (week === 1) {
          return [
            { roster_id: 1, matchup_id: 1, points: 100 },
            { roster_id: 2, matchup_id: 1, points: 90 },
          ];
        }
        if (week === 2) {
          return [
            { roster_id: 1, matchup_id: 1, points: 80 },
            { roster_id: 2, matchup_id: 1, points: 95 },
          ];
        }
        return [];
      }),
    });

    const result = await getManagerHistory(OWNER_ID, client, 2);

    expect(result!.career.wins).toBe(1);
    expect(result!.career.losses).toBe(1);
    expect(result!.career.pointsFor).toBe(180);
    expect(result!.career.pointsAgainst).toBe(185);
    expect(result!.career.winPct).toBe(0.5);
  });

  it("without an override, stops at each league's playoff cutoff via resolveCompletedWeeks", async () => {
    const fetchMatchups = vi.fn().mockImplementation(async (leagueId: string, week: number) => {
      if (leagueId !== 'league_2025_afc') return [];
      // A playoff-week (week 15) matchup that must NOT count toward the record.
      return [
        { roster_id: 1, matchup_id: week, points: 100 + week },
        { roster_id: 2, matchup_id: week, points: 50 },
      ];
    });

    const client = makeClient({
      fetchRostersWithOwners: vi.fn().mockImplementation(async (leagueId: string) => {
        if (leagueId === 'league_2025_afc') {
          return [{ roster_id: 1, owner_id: OWNER_ID, owner: { display_name: 'Manager' } }];
        }
        return [];
      }),
      fetchMatchups,
      // playoff_week_start: 15 -> regular season is weeks 1-14, matching
      // apps/web/src/lib/constants.ts's REGULAR_SEASON_WEEKS.
      fetchLeague: vi.fn().mockResolvedValue({
        league_id: 'league_2025_afc',
        season: '2025',
        status: 'complete',
        settings: { playoff_week_start: 15 },
      }),
      fetchNFLState: vi.fn().mockResolvedValue({ week: 18, season: '2026', league_season: '2026' }),
    });

    const result = await getManagerHistory(OWNER_ID, client);

    expect(result!.seasons[0]!.wins).toBe(14);
    expect(fetchMatchups).not.toHaveBeenCalledWith('league_2025_afc', 15);
  });

  it('resolves avatarUrl, preferring roster (team) avatar over owner avatar', async () => {
    const client = makeClient({
      fetchRostersWithOwners: vi.fn().mockImplementation(async (leagueId: string) => {
        if (leagueId === 'league_2025_afc') {
          return [
            {
              roster_id: 1,
              owner_id: OWNER_ID,
              owner: { display_name: 'Manager', avatar: 'user_avatar_hash' },
              metadata: { avatar: 'team_avatar_hash' },
            },
          ];
        }
        return [];
      }),
    });

    const result = await getManagerHistory(OWNER_ID, client, 0);

    expect(result!.avatarUrl).toBe('https://sleepercdn.com/avatars/team_avatar_hash');
  });

  it('falls back to owner avatar, passed through unmodified if already a full URL', async () => {
    const client = makeClient({
      fetchRostersWithOwners: vi.fn().mockImplementation(async (leagueId: string) => {
        if (leagueId === 'league_2025_afc') {
          return [
            {
              roster_id: 1,
              owner_id: OWNER_ID,
              owner: { display_name: 'Manager', avatar: 'https://example.com/avatar.png' },
            },
          ];
        }
        return [];
      }),
    });

    const result = await getManagerHistory(OWNER_ID, client, 0);

    expect(result!.avatarUrl).toBe('https://example.com/avatar.png');
  });
});

describe('listManagers', () => {
  it('returns one summary per distinct owner_id, deduped across leagues/seasons', async () => {
    const client = makeClient({
      fetchRostersWithOwners: vi.fn().mockImplementation(async (leagueId: string) => {
        if (leagueId === 'league_2025_afc') {
          return [
            { roster_id: 1, owner_id: 'owner_a', owner: { display_name: 'Alice' } },
            { roster_id: 2, owner_id: 'owner_b', owner: { display_name: 'Bob' } },
          ];
        }
        if (leagueId === 'league_2025_nfc') {
          return [{ roster_id: 3, owner_id: 'owner_a', owner: { display_name: 'Alice' } }];
        }
        if (leagueId === 'league_2024_afc') {
          return [{ roster_id: 1, owner_id: 'owner_a', owner: { display_name: 'Old Alice' } }];
        }
        return [];
      }),
    });

    const result = await listManagers(client);

    expect(result).toHaveLength(2);
    const alice = result.find(m => m.ownerId === 'owner_a');
    expect(alice).toEqual({
      ownerId: 'owner_a',
      displayName: 'Alice',
      avatarUrl: null,
      seasonsPlayed: 3,
      firstSeason: '2024',
      lastSeason: '2025',
    });
  });

  it('sorts managers alphabetically by display name', async () => {
    const client = makeClient({
      fetchRostersWithOwners: vi.fn().mockImplementation(async (leagueId: string) => {
        if (leagueId === 'league_2025_afc') {
          return [
            { roster_id: 1, owner_id: 'owner_z', owner: { display_name: 'Zeke' } },
            { roster_id: 2, owner_id: 'owner_a', owner: { display_name: 'Amy' } },
          ];
        }
        return [];
      }),
    });

    const result = await listManagers(client);

    expect(result.map(m => m.displayName)).toEqual(['Amy', 'Zeke']);
  });

  it('lists primary owners and co-managers as distinct people on the same roster', async () => {
    const client = makeClient({
      fetchRostersWithOwners: vi.fn().mockImplementation(async (leagueId: string) => {
        if (leagueId === 'league_2025_afc') {
          return [
            {
              roster_id: 1,
              owner_id: 'owner_a',
              co_owners: ['owner_b'],
              owner: { display_name: 'Shared Team' },
              coOwners: [{ user_id: 'owner_b', display_name: 'Co-manager Bob' }],
            },
          ];
        }
        return [];
      }),
    });

    const result = await listManagers(client);

    expect(result.map(manager => manager.ownerId).sort()).toEqual(['owner_a', 'owner_b']);
    expect(result.find(manager => manager.ownerId === 'owner_b')?.displayName).toBe(
      'Co-manager Bob',
    );
    expect(result.every(manager => manager.seasonsPlayed === 1)).toBe(true);
  });
});
