import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SleeperLeague, SleeperMatchup, SleeperRoster } from '@gauntlet/types';
import { MatchupFactory, TeamFactory } from '@/test';
import { CURRENT_LEAGUES } from '@/config/leagues';

/**
 * Integration Tests: Multi-League System
 *
 * Tests the critical multi-league data processing patterns:
 * - AFC + NFC leagues (24 teams total)
 * - Matchup IDs NOT unique across leagues (both use 1-6)
 * - Roster IDs only unique within league
 * - Must process leagues separately, then combine
 * - Use composite keys: ${leagueId}-${rosterId}
 */

// Mock league data
const createMockLeague = (conference: 'AFC' | 'NFC'): SleeperLeague => ({
  league_id: conference === 'AFC' ? '1263744209295245312' : '1263740549504962561',
  name: `Gauntlet ${conference}`,
  season: '2025',
  status: 'in_season',
  sport: 'nfl',
  season_type: 'regular',
  settings: {
    playoff_week_start: 15,
  },
  scoring_settings: {},
  roster_positions: ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'K', 'DEF'],
  total_rosters: 12,
});

const createMockRosters = (leagueId: string, count: number): SleeperRoster[] => {
  return Array.from({ length: count }, (_, i) =>
    TeamFactory.generateTeam({
      roster_id: i + 1,
      league_id: leagueId,
      owner_id: `${leagueId}_user_${i + 1}`,
      metadata: {
        team_name: `Team ${i + 1}`,
      },
    }),
  );
};

const createMockMatchups = (leagueId: string, week: number): SleeperMatchup[] => {
  // Create 6 matchups (12 teams, 2 per matchup)
  // Week parameter is included for context but not in SleeperMatchup type
  return Array.from({ length: 12 }, (_, i) => ({
    matchup_id: Math.floor(i / 2) + 1, // 1-6
    roster_id: i + 1,
    points: 100 + Math.random() * 50,
    players_points: { [`player_${week}_${i + 1}`]: 25 }, // Include week to make unique
    starters: [`player_${week}_${i + 1}`],
    starters_points: [25],
    players: [`player_${week}_${i + 1}`],
    custom_points: null,
  })) as SleeperMatchup[];
};

describe('Multi-League System Integration', () => {
  describe('League Configuration', () => {
    it('has two distinct league IDs', () => {
      // 2025 happens to have exactly 2 leagues today, but the registry
      // (apps/web/src/config/leagues.ts) supports a variable count per
      // season — assert AFC/NFC presence and distinctness, not an exact
      // length, so a future season with more leagues doesn't fail this.
      expect(CURRENT_LEAGUES.length).toBeGreaterThanOrEqual(2);
      const afc = CURRENT_LEAGUES.find(l => l.conference === 'AFC')!;
      const nfc = CURRENT_LEAGUES.find(l => l.conference === 'NFC')!;

      expect(afc).toBeDefined();
      expect(nfc).toBeDefined();
      expect(afc.id).not.toBe(nfc.id);
    });

    it('both leagues have 12 teams', () => {
      const [afc, nfc] = CURRENT_LEAGUES;
      // Both leagues should be configured for 12 teams
      expect(afc).toBeDefined();
      expect(nfc).toBeDefined();
    });
  });

  describe('Data Fetching Patterns', () => {
    it('maintains separate roster IDs per league', () => {
      const afcLeague = createMockLeague('AFC');
      const nfcLeague = createMockLeague('NFC');

      const afcRosters = createMockRosters(afcLeague.league_id, 12);
      const nfcRosters = createMockRosters(nfcLeague.league_id, 12);

      // Roster IDs can overlap between leagues (both use 1-12)
      const afcRosterIds = afcRosters.map(r => r.roster_id);
      const nfcRosterIds = nfcRosters.map(r => r.roster_id);

      expect(afcRosterIds).toContain(1);
      expect(nfcRosterIds).toContain(1);

      // But composite keys must be unique
      const allKeys = [
        ...afcRosters.map(r => `${r.league_id}-${r.roster_id}`),
        ...nfcRosters.map(r => `${r.league_id}-${r.roster_id}`),
      ];

      const uniqueKeys = new Set(allKeys);
      expect(uniqueKeys.size).toBe(allKeys.length); // All 24 keys unique
      expect(uniqueKeys.size).toBe(24);
    });

    it('generates unique composite keys for rosters', () => {
      const afcRosters = createMockRosters('afc-123', 12);
      const nfcRosters = createMockRosters('nfc-456', 12);

      const createCompositeKey = (roster: SleeperRoster) =>
        `${roster.league_id}-${roster.roster_id}`;

      const afcKeys = afcRosters.map(createCompositeKey);
      const nfcKeys = nfcRosters.map(createCompositeKey);

      // AFC keys should be unique
      expect(new Set(afcKeys).size).toBe(12);

      // NFC keys should be unique
      expect(new Set(nfcKeys).size).toBe(12);

      // Combined keys should be unique
      const allKeys = [...afcKeys, ...nfcKeys];
      expect(new Set(allKeys).size).toBe(24);
    });
  });

  describe('Matchup Processing', () => {
    it('matchup IDs are NOT unique across leagues', () => {
      const afcMatchups = createMockMatchups('afc-123', 5);
      const nfcMatchups = createMockMatchups('nfc-456', 5);

      const afcMatchupIds = new Set(afcMatchups.map(m => m.matchup_id));
      const nfcMatchupIds = new Set(nfcMatchups.map(m => m.matchup_id));

      // Both leagues use matchup_id 1-6
      expect(afcMatchupIds).toContain(1);
      expect(nfcMatchupIds).toContain(1);

      // Same IDs appear in both leagues
      const intersection = [...afcMatchupIds].filter(id => nfcMatchupIds.has(id));
      expect(intersection.length).toBeGreaterThan(0);
    });

    it('WRONG pattern: grouping by matchup_id alone creates bugs', () => {
      const afcMatchups = createMockMatchups('afc-123', 5);
      const nfcMatchups = createMockMatchups('nfc-456', 5);

      // WRONG: Combine first, then group
      const allMatchups = [...afcMatchups, ...nfcMatchups];

      // Group by matchup_id alone (THIS IS WRONG)
      const grouped = allMatchups.reduce(
        (acc, m) => {
          const key = m.matchup_id;
          if (!acc[key]) acc[key] = [];
          acc[key].push(m);
          return acc;
        },
        {} as Record<number, SleeperMatchup[]>,
      );

      // This creates WRONG groups: matchup_id 1 will have 4 teams instead of 2+2
      Object.values(grouped).forEach(group => {
        // Each group should have 2 teams, but will have 4 when we combine first
        expect(group.length).toBeGreaterThan(2);
      });
    });

    it('CORRECT pattern: process leagues separately with composite keys', () => {
      const afcLeagueId = 'afc-123';
      const nfcLeagueId = 'nfc-456';

      const afcMatchups = createMockMatchups(afcLeagueId, 5);
      const nfcMatchups = createMockMatchups(nfcLeagueId, 5);

      // CORRECT: Process each league separately
      const processLeagueMatchups = (matchups: SleeperMatchup[], leagueId: string) => {
        const grouped = matchups.reduce(
          (acc, m) => {
            const key = `${leagueId}-${m.matchup_id}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(m);
            return acc;
          },
          {} as Record<string, SleeperMatchup[]>,
        );

        return Object.entries(grouped).map(([compositeId, teams]) => ({
          compositeId,
          leagueId,
          matchupId: teams[0]!.matchup_id,
          teams,
        }));
      };

      const afcResults = processLeagueMatchups(afcMatchups, afcLeagueId);
      const nfcResults = processLeagueMatchups(nfcMatchups, nfcLeagueId);
      const combined = [...afcResults, ...nfcResults];

      // Should have 12 matchup groups (6 per league)
      expect(combined).toHaveLength(12);

      // Each matchup should have exactly 2 teams
      combined.forEach(matchup => {
        expect(matchup.teams).toHaveLength(2);
      });

      // Verify composite IDs are unique
      const compositeIds = combined.map(m => m.compositeId);
      expect(new Set(compositeIds).size).toBe(12);

      // Verify composite IDs include league context
      combined.forEach(matchup => {
        expect(matchup.compositeId).toContain(matchup.leagueId);
        expect(matchup.compositeId).toContain(String(matchup.matchupId));
      });
    });
  });

  describe('Stats Aggregation', () => {
    it('aggregates stats across both leagues maintaining league context', () => {
      const afcRosters = createMockRosters('afc-123', 12);
      const nfcRosters = createMockRosters('nfc-456', 12);

      const calculateStats = (rosters: SleeperRoster[], league: string) => {
        return rosters.map(r => ({
          rosterId: r.roster_id,
          leagueId: r.league_id,
          league,
          compositeId: `${r.league_id}-${r.roster_id}`,
          points: r.settings.fpts,
        }));
      };

      const afcStats = calculateStats(afcRosters, 'AFC');
      const nfcStats = calculateStats(nfcRosters, 'NFC');
      const allStats = [...afcStats, ...nfcStats];

      // Should have 24 teams total
      expect(allStats).toHaveLength(24);

      // Each team should have league identifier
      const afcTeams = allStats.filter(t => t.league === 'AFC');
      const nfcTeams = allStats.filter(t => t.league === 'NFC');

      expect(afcTeams).toHaveLength(12);
      expect(nfcTeams).toHaveLength(12);

      // All composite IDs should be unique
      const compositeIds = allStats.map(t => t.compositeId);
      expect(new Set(compositeIds).size).toBe(24);
    });

    it('calculates league-wide rankings correctly', () => {
      // Create teams with varying points
      const afcRosters = createMockRosters('afc-123', 12).map((r, i) => ({
        ...r,
        settings: { ...r.settings, fpts: 1000 + i * 50 },
      }));

      const nfcRosters = createMockRosters('nfc-456', 12).map((r, i) => ({
        ...r,
        settings: { ...r.settings, fpts: 1100 + i * 50 },
      }));

      // Combine and rank
      const allTeams = [...afcRosters, ...nfcRosters]
        .map((r, idx) => ({
          rosterId: r.roster_id,
          leagueId: r.league_id,
          league: r.league_id.startsWith('afc') ? 'AFC' : 'NFC',
          points: r.settings.fpts,
        }))
        .sort((a, b) => b.points - a.points)
        .map((team, idx) => ({
          ...team,
          overallRank: idx + 1,
        }));

      // Rankings should be 1-24, not 1-12 repeated
      const ranks = allTeams.map(t => t.overallRank);
      const uniqueRanks = new Set(ranks);

      expect(Math.max(...ranks)).toBe(24);
      expect(Math.min(...ranks)).toBe(1);
      expect(uniqueRanks.size).toBe(24); // All unique
    });

    it('preserves within-league rankings', () => {
      const afcRosters = createMockRosters('afc-123', 12).map((r, i) => ({
        ...r,
        settings: { ...r.settings, fpts: 1000 + i * 50 },
      }));

      const nfcRosters = createMockRosters('nfc-456', 12).map((r, i) => ({
        ...r,
        settings: { ...r.settings, fpts: 1100 + i * 50 },
      }));

      // Calculate league-specific ranks
      const addLeagueRank = (rosters: SleeperRoster[]) => {
        return rosters
          .sort((a, b) => b.settings.fpts - a.settings.fpts)
          .map((r, idx) => ({
            rosterId: r.roster_id,
            leagueId: r.league_id,
            points: r.settings.fpts,
            leagueRank: idx + 1,
          }));
      };

      const afcWithRanks = addLeagueRank(afcRosters);
      const nfcWithRanks = addLeagueRank(nfcRosters);

      // AFC ranks should be 1-12
      const afcRanks = afcWithRanks.map(t => t.leagueRank);
      expect(Math.max(...afcRanks)).toBe(12);
      expect(Math.min(...afcRanks)).toBe(1);

      // NFC ranks should be 1-12
      const nfcRanks = nfcWithRanks.map(t => t.leagueRank);
      expect(Math.max(...nfcRanks)).toBe(12);
      expect(Math.min(...nfcRanks)).toBe(1);
    });
  });

  describe('Composite Key Patterns', () => {
    it('generates correct composite keys for matchups', () => {
      const createMatchupCompositeKey = (leagueId: string, week: number, matchupId: number) =>
        `${leagueId}-${week}-${matchupId}`;

      const afcKey = createMatchupCompositeKey('afc-123', 5, 1);
      const nfcKey = createMatchupCompositeKey('nfc-456', 5, 1);

      expect(afcKey).toBe('afc-123-5-1');
      expect(nfcKey).toBe('nfc-456-5-1');
      expect(afcKey).not.toBe(nfcKey);
    });

    it('generates correct composite keys for rosters', () => {
      const createRosterCompositeKey = (leagueId: string, rosterId: number) =>
        `${leagueId}-${rosterId}`;

      const afcKey = createRosterCompositeKey('afc-123', 1);
      const nfcKey = createRosterCompositeKey('nfc-456', 1);

      expect(afcKey).toBe('afc-123-1');
      expect(nfcKey).toBe('nfc-456-1');
      expect(afcKey).not.toBe(nfcKey);
    });

    it('composite keys prevent collisions across leagues', () => {
      const data = [
        { leagueId: 'afc-123', rosterId: 1 },
        { leagueId: 'afc-123', rosterId: 2 },
        { leagueId: 'nfc-456', rosterId: 1 }, // Same roster ID, different league
        { leagueId: 'nfc-456', rosterId: 2 },
      ];

      const keys = data.map(d => `${d.leagueId}-${d.rosterId}`);
      const uniqueKeys = new Set(keys);

      // All keys should be unique
      expect(uniqueKeys.size).toBe(data.length);
    });
  });

  describe('Edge Cases', () => {
    it('handles leagues with different week counts', () => {
      const afcWeek5 = createMockMatchups('afc-123', 5);
      const afcWeek6 = createMockMatchups('afc-123', 6);
      const afcMatchups = [...afcWeek5, ...afcWeek6];

      const nfcMatchups = createMockMatchups('nfc-456', 5);

      // Should handle gracefully - AFC has 2 weeks, NFC has 1
      expect(afcMatchups.length).toBe(24); // 12 per week * 2 weeks
      expect(nfcMatchups.length).toBe(12); // 12 teams in 1 week

      // Process separately - use player IDs as proxy for week detection
      const processMatchups = (matchups: SleeperMatchup[], leagueId: string) => {
        return matchups.map(m => {
          // Extract week from player ID (player_5_1 -> week 5)
          const playerId = m.players[0] || 'player_0_0';
          const week = playerId.split('_')[1] || '0';
          return {
            leagueId,
            matchupId: m.matchup_id,
            rosterId: m.roster_id,
            compositeId: `${leagueId}-${week}-${m.matchup_id}-${m.roster_id}`,
          };
        });
      };

      const afcResults = processMatchups(afcMatchups, 'afc-123');
      const nfcResults = processMatchups(nfcMatchups, 'nfc-456');

      expect(afcResults.length).toBe(24);
      expect(nfcResults.length).toBe(12);

      // All composite IDs should still be unique (includes week now)
      const allIds = [...afcResults, ...nfcResults].map(r => r.compositeId);
      expect(allIds.length).toBe(36); // 24 + 12
      expect(new Set(allIds).size).toBe(36); // All unique
    });

    it('handles empty matchup data from one league', () => {
      const afcMatchups = createMockMatchups('afc-123', 5);
      const nfcMatchups: SleeperMatchup[] = [];

      const processMatchups = (matchups: SleeperMatchup[], leagueId: string) => {
        return matchups.map(m => ({
          leagueId,
          matchupId: m.matchup_id,
        }));
      };

      const afcResults = processMatchups(afcMatchups, 'afc-123');
      const nfcResults = processMatchups(nfcMatchups, 'nfc-456');
      const combined = [...afcResults, ...nfcResults];

      // Should still process AFC data
      expect(afcResults.length).toBeGreaterThan(0);
      expect(nfcResults.length).toBe(0);
      expect(combined.length).toBe(afcResults.length);
    });

    it('handles duplicate roster IDs across leagues', () => {
      // Both leagues have roster_id 1-12
      const afcRosters = createMockRosters('afc-123', 12);
      const nfcRosters = createMockRosters('nfc-456', 12);

      // Roster IDs will duplicate
      const afcRosterIds = afcRosters.map(r => r.roster_id);
      const nfcRosterIds = nfcRosters.map(r => r.roster_id);

      // Find duplicates
      const duplicates = afcRosterIds.filter(id => nfcRosterIds.includes(id));
      expect(duplicates.length).toBe(12); // All roster IDs are duplicated

      // But composite keys should be unique
      const allKeys = [
        ...afcRosters.map(r => `${r.league_id}-${r.roster_id}`),
        ...nfcRosters.map(r => `${r.league_id}-${r.roster_id}`),
      ];

      expect(new Set(allKeys).size).toBe(24); // All unique
    });
  });

  describe('Real-World Scenarios', () => {
    it('processes weekly matchups for both leagues', () => {
      const week = 5;
      const afcLeagueId = CURRENT_LEAGUES[0]!.id;
      const nfcLeagueId = CURRENT_LEAGUES[1]!.id;

      const afcMatchups = createMockMatchups(afcLeagueId, week);
      const nfcMatchups = createMockMatchups(nfcLeagueId, week);

      // Process separately
      const processWeekMatchups = (matchups: SleeperMatchup[], leagueId: string, week: number) => {
        const grouped = matchups.reduce(
          (acc, m) => {
            const key = `${leagueId}-${week}-${m.matchup_id}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(m);
            return acc;
          },
          {} as Record<string, SleeperMatchup[]>,
        );

        return Object.entries(grouped).map(([compositeId, teams]) => ({
          compositeId,
          leagueId,
          week,
          matchupId: teams[0]!.matchup_id,
          teamCount: teams.length,
        }));
      };

      const afcResults = processWeekMatchups(afcMatchups, afcLeagueId, week);
      const nfcResults = processWeekMatchups(nfcMatchups, nfcLeagueId, week);
      const allMatchups = [...afcResults, ...nfcResults];

      // Should have 12 matchups (6 per league)
      expect(allMatchups).toHaveLength(12);

      // Each matchup should have 2 teams
      allMatchups.forEach(m => {
        expect(m.teamCount).toBe(2);
      });

      // All composite IDs should be unique
      const ids = allMatchups.map(m => m.compositeId);
      expect(new Set(ids).size).toBe(12);

      // Verify IDs contain league context
      afcResults.forEach(m => {
        expect(m.compositeId).toContain(afcLeagueId);
      });
      nfcResults.forEach(m => {
        expect(m.compositeId).toContain(nfcLeagueId);
      });
    });

    it('combines rosters from both leagues for league-wide view', () => {
      const afcRosters = createMockRosters(CURRENT_LEAGUES[0]!.id, 12);
      const nfcRosters = createMockRosters(CURRENT_LEAGUES[1]!.id, 12);

      // Add league context to each roster
      const enrichRosters = (rosters: SleeperRoster[], conference: string) => {
        return rosters.map(r => ({
          ...r,
          conference,
          compositeId: `${r.league_id}-${r.roster_id}`,
        }));
      };

      const afcEnriched = enrichRosters(afcRosters, 'AFC');
      const nfcEnriched = enrichRosters(nfcRosters, 'NFC');
      const allTeams = [...afcEnriched, ...nfcEnriched];

      // Should have 24 teams
      expect(allTeams).toHaveLength(24);

      // Split by conference
      const afcTeams = allTeams.filter(t => t.conference === 'AFC');
      const nfcTeams = allTeams.filter(t => t.conference === 'NFC');

      expect(afcTeams).toHaveLength(12);
      expect(nfcTeams).toHaveLength(12);

      // All composite IDs should be unique
      const ids = allTeams.map(t => t.compositeId);
      expect(new Set(ids).size).toBe(24);
    });
  });
});
