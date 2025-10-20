import { describe, expect, it } from 'vitest';
import { buildRosterLeagueMap, buildTeamInfoMap } from './join';
import type { SleeperRoster, SleeperUser } from '@gauntlet/types';

describe('Join Utilities', () => {
  describe('buildTeamInfoMap', () => {
    it('builds team info from rosters and users', () => {
      const leagues = [{ id: 'afc', name: 'AFC League' }];
      const rosters = new Map<string, SleeperRoster[]>([
        [
          'afc',
          [
            {
              roster_id: 1,
              owner_id: 'user1',
              players: [],
            } as SleeperRoster,
          ],
        ],
      ]);
      const users = new Map<string, SleeperUser[]>([
        [
          'afc',
          [
            {
              user_id: 'user1',
              username: 'johndoe',
              display_name: 'John Doe',
              metadata: {
                team_name: 'Team 1',
              },
            } as SleeperUser,
          ],
        ],
      ]);

      const result = buildTeamInfoMap({ leagues, rosters, users });
      const team = result.get('afc-1');

      expect(team).toBeDefined();
      expect(team?.leagueId).toBe('afc');
      expect(team?.leagueName).toBe('AFC League');
      expect(team?.rosterId).toBe(1);
      expect(team?.teamName).toBe('Team 1');
      expect(team?.managerName).toBe('John Doe');
      expect(team?.ownerId).toBe('user1');
    });

    it('uses composite key for team identification', () => {
      const leagues = [
        { id: 'afc', name: 'AFC' },
        { id: 'nfc', name: 'NFC' },
      ];
      const rosters = new Map<string, SleeperRoster[]>([
        ['afc', [{ roster_id: 1, owner_id: 'user1', players: [] } as SleeperRoster]],
        ['nfc', [{ roster_id: 1, owner_id: 'user2', players: [] } as SleeperRoster]],
      ]);
      const users = new Map<string, SleeperUser[]>([
        ['afc', [{ user_id: 'user1', display_name: 'AFC User' } as SleeperUser]],
        ['nfc', [{ user_id: 'user2', display_name: 'NFC User' } as SleeperUser]],
      ]);

      const result = buildTeamInfoMap({ leagues, rosters, users });

      expect(result.has('afc-1')).toBe(true);
      expect(result.has('nfc-1')).toBe(true);
      expect(result.get('afc-1')?.managerName).toBe('AFC User');
      expect(result.get('nfc-1')?.managerName).toBe('NFC User');
    });

    it('falls back to display_name when team_name is missing', () => {
      const leagues = [{ id: 'afc', name: 'AFC' }];
      const rosters = new Map<string, SleeperRoster[]>([
        ['afc', [{ roster_id: 1, owner_id: 'user1', players: [] } as SleeperRoster]],
      ]);
      const users = new Map<string, SleeperUser[]>([
        [
          'afc',
          [
            {
              user_id: 'user1',
              display_name: 'John Doe',
              metadata: {}, // No team_name
            } as SleeperUser,
          ],
        ],
      ]);

      const result = buildTeamInfoMap({ leagues, rosters, users });
      const team = result.get('afc-1');

      expect(team?.teamName).toBe('John Doe');
    });

    it('falls back to username when display_name is missing', () => {
      const leagues = [{ id: 'afc', name: 'AFC' }];
      const rosters = new Map<string, SleeperRoster[]>([
        ['afc', [{ roster_id: 1, owner_id: 'user1', players: [] } as SleeperRoster]],
      ]);
      const users = new Map<string, SleeperUser[]>([
        [
          'afc',
          [
            {
              user_id: 'user1',
              username: 'johndoe',
              // No display_name
            } as SleeperUser,
          ],
        ],
      ]);

      const result = buildTeamInfoMap({ leagues, rosters, users });
      const team = result.get('afc-1');

      expect(team?.managerName).toBe('johndoe');
    });

    it('uses "Unknown Team" when no names are available', () => {
      const leagues = [{ id: 'afc', name: 'AFC' }];
      const rosters = new Map<string, SleeperRoster[]>([
        ['afc', [{ roster_id: 1, owner_id: 'user1', players: [] } as SleeperRoster]],
      ]);
      const users = new Map<string, SleeperUser[]>([
        [
          'afc',
          [
            {
              user_id: 'user1',
              // No names at all
            } as SleeperUser,
          ],
        ],
      ]);

      const result = buildTeamInfoMap({ leagues, rosters, users });
      const team = result.get('afc-1');

      expect(team?.teamName).toBe('Unknown Team');
      expect(team?.managerName).toBe('Unknown Manager');
    });

    it('handles user avatar URLs', () => {
      const leagues = [{ id: 'afc', name: 'AFC' }];
      const rosters = new Map<string, SleeperRoster[]>([
        ['afc', [{ roster_id: 1, owner_id: 'user1', players: [] } as SleeperRoster]],
      ]);
      const users = new Map<string, SleeperUser[]>([
        [
          'afc',
          [
            {
              user_id: 'user1',
              display_name: 'John',
              avatar: 'abc123',
            } as SleeperUser,
          ],
        ],
      ]);

      const result = buildTeamInfoMap({ leagues, rosters, users });
      const team = result.get('afc-1');

      expect(team?.avatar).toBe('https://sleepercdn.com/avatars/abc123');
    });

    it('handles full avatar URLs', () => {
      const leagues = [{ id: 'afc', name: 'AFC' }];
      const rosters = new Map<string, SleeperRoster[]>([
        ['afc', [{ roster_id: 1, owner_id: 'user1', players: [] } as SleeperRoster]],
      ]);
      const users = new Map<string, SleeperUser[]>([
        [
          'afc',
          [
            {
              user_id: 'user1',
              display_name: 'John',
              avatar: 'https://example.com/avatar.png',
            } as SleeperUser,
          ],
        ],
      ]);

      const result = buildTeamInfoMap({ leagues, rosters, users });
      const team = result.get('afc-1');

      expect(team?.avatar).toBe('https://example.com/avatar.png');
    });

    it('handles missing user for roster', () => {
      const leagues = [{ id: 'afc', name: 'AFC' }];
      const rosters = new Map<string, SleeperRoster[]>([
        ['afc', [{ roster_id: 1, owner_id: 'user1', players: [] } as SleeperRoster]],
      ]);
      const users = new Map<string, SleeperUser[]>([['afc', []]]);

      const result = buildTeamInfoMap({ leagues, rosters, users });
      const team = result.get('afc-1');

      expect(team).toBeDefined();
      expect(team?.teamName).toBe('Unknown Team');
      expect(team?.managerName).toBe('Unknown Manager');
    });

    it('handles multiple rosters per league', () => {
      const leagues = [{ id: 'afc', name: 'AFC' }];
      const rosters = new Map<string, SleeperRoster[]>([
        [
          'afc',
          [
            { roster_id: 1, owner_id: 'user1', players: [] } as SleeperRoster,
            { roster_id: 2, owner_id: 'user2', players: [] } as SleeperRoster,
            { roster_id: 3, owner_id: 'user3', players: [] } as SleeperRoster,
          ],
        ],
      ]);
      const users = new Map<string, SleeperUser[]>([
        [
          'afc',
          [
            { user_id: 'user1', display_name: 'User 1' } as SleeperUser,
            { user_id: 'user2', display_name: 'User 2' } as SleeperUser,
            { user_id: 'user3', display_name: 'User 3' } as SleeperUser,
          ],
        ],
      ]);

      const result = buildTeamInfoMap({ leagues, rosters, users });

      expect(result.size).toBe(3);
      expect(result.get('afc-1')?.managerName).toBe('User 1');
      expect(result.get('afc-2')?.managerName).toBe('User 2');
      expect(result.get('afc-3')?.managerName).toBe('User 3');
    });

    it('handles empty rosters', () => {
      const leagues = [{ id: 'afc', name: 'AFC' }];
      const rosters = new Map<string, SleeperRoster[]>([['afc', []]]);
      const users = new Map<string, SleeperUser[]>([['afc', []]]);

      const result = buildTeamInfoMap({ leagues, rosters, users });

      expect(result.size).toBe(0);
    });

    it('handles team avatar from metadata', () => {
      const leagues = [{ id: 'afc', name: 'AFC' }];
      const rosters = new Map<string, SleeperRoster[]>([
        ['afc', [{ roster_id: 1, owner_id: 'user1', players: [] } as SleeperRoster]],
      ]);
      const users = new Map<string, SleeperUser[]>([
        [
          'afc',
          [
            {
              user_id: 'user1',
              display_name: 'John',
              avatar: 'user_avatar',
              metadata: {
                avatar: 'team_avatar',
              },
            } as SleeperUser,
          ],
        ],
      ]);

      const result = buildTeamInfoMap({ leagues, rosters, users });
      const team = result.get('afc-1');

      // Team avatar should take precedence
      expect(team?.avatar).toBe('https://sleepercdn.com/avatars/team_avatar');
    });

    it('handles undefined avatar', () => {
      const leagues = [{ id: 'afc', name: 'AFC' }];
      const rosters = new Map<string, SleeperRoster[]>([
        ['afc', [{ roster_id: 1, owner_id: 'user1', players: [] } as SleeperRoster]],
      ]);
      const users = new Map<string, SleeperUser[]>([
        [
          'afc',
          [
            {
              user_id: 'user1',
              display_name: 'John',
              // No avatar
            } as SleeperUser,
          ],
        ],
      ]);

      const result = buildTeamInfoMap({ leagues, rosters, users });
      const team = result.get('afc-1');

      expect(team?.avatar).toBeUndefined();
    });
  });

  describe('buildRosterLeagueMap', () => {
    it('maps roster IDs to league IDs', () => {
      const leagues = [{ id: 'afc' }, { id: 'nfc' }];
      const rosters = new Map<string, SleeperRoster[]>([
        [
          'afc',
          [
            { roster_id: 1, players: [] } as SleeperRoster,
            { roster_id: 2, players: [] } as SleeperRoster,
          ],
        ],
        [
          'nfc',
          [
            { roster_id: 3, players: [] } as SleeperRoster,
            { roster_id: 4, players: [] } as SleeperRoster,
          ],
        ],
      ]);

      const result = buildRosterLeagueMap(leagues, rosters);

      expect(result.get('1')).toBe('afc');
      expect(result.get('2')).toBe('afc');
      expect(result.get('3')).toBe('nfc');
      expect(result.get('4')).toBe('nfc');
    });

    it('handles empty rosters', () => {
      const leagues = [{ id: 'afc' }];
      const rosters = new Map<string, SleeperRoster[]>([['afc', []]]);

      const result = buildRosterLeagueMap(leagues, rosters);

      expect(result.size).toBe(0);
    });

    it('handles missing league in rosters map', () => {
      const leagues = [{ id: 'afc' }, { id: 'nfc' }];
      const rosters = new Map<string, SleeperRoster[]>([
        ['afc', [{ roster_id: 1, players: [] } as SleeperRoster]],
        // NFC missing
      ]);

      const result = buildRosterLeagueMap(leagues, rosters);

      expect(result.get('1')).toBe('afc');
      expect(result.size).toBe(1);
    });

    it('handles 12-team league', () => {
      const leagues = [{ id: 'afc' }];
      const rosters = new Map<string, SleeperRoster[]>([
        [
          'afc',
          Array.from({ length: 12 }, (_, i) => ({
            roster_id: i + 1,
            players: [],
          })) as SleeperRoster[],
        ],
      ]);

      const result = buildRosterLeagueMap(leagues, rosters);

      expect(result.size).toBe(12);
      expect(result.get('1')).toBe('afc');
      expect(result.get('12')).toBe('afc');
    });

    it('uses string keys for roster IDs', () => {
      const leagues = [{ id: 'afc' }];
      const rosters = new Map<string, SleeperRoster[]>([
        ['afc', [{ roster_id: 1, players: [] } as SleeperRoster]],
      ]);

      const result = buildRosterLeagueMap(leagues, rosters);

      // Keys should be strings
      expect(result.has('1')).toBe(true);
      expect(result.has(1 as any)).toBe(false);
    });
  });
});
