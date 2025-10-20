import { describe, expect, it } from 'vitest';
import { aggregatePositionPoints, getStarterPositionPoints, TRACKED_POSITIONS } from './positions';
import type { PlayerIndex, SleeperMatchup } from '@gauntlet/types';

describe('Position Stats Utilities', () => {
  const mockPlayersIndex: PlayerIndex = {
    player1: {
      player_id: 'player1',
      full_name: 'QB Player',
      position: 'QB',
      team: 'KC',
    } as any,
    player2: {
      player_id: 'player2',
      full_name: 'RB Player',
      position: 'RB',
      team: 'KC',
    } as any,
    player3: {
      player_id: 'player3',
      full_name: 'WR Player',
      position: 'WR',
      team: 'KC',
    } as any,
    player4: {
      player_id: 'player4',
      full_name: 'TE Player',
      position: 'TE',
      team: 'KC',
    } as any,
    player5: {
      player_id: 'player5',
      full_name: 'DEF Player',
      position: 'DEF',
      team: 'KC',
    } as any,
  };

  describe('TRACKED_POSITIONS', () => {
    it('includes all fantasy positions', () => {
      expect(TRACKED_POSITIONS).toContain('QB');
      expect(TRACKED_POSITIONS).toContain('RB');
      expect(TRACKED_POSITIONS).toContain('WR');
      expect(TRACKED_POSITIONS).toContain('TE');
      expect(TRACKED_POSITIONS).toContain('DEF');
    });

    it('has exactly 5 positions', () => {
      expect(TRACKED_POSITIONS).toHaveLength(5);
    });
  });

  describe('getStarterPositionPoints', () => {
    it('sums points by position for each roster', () => {
      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                {
                  roster_id: 1,
                  matchup_id: 1,
                  points: 100,
                  starters: ['player1', 'player2', 'player3'],
                  players: [],
                  players_points: {
                    player1: 20, // QB
                    player2: 30, // RB
                    player3: 25, // WR
                  },
                } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getStarterPositionPoints({ matchups, playersIndex: mockPlayersIndex });
      const week1 = result.get(1);
      const team1 = week1?.get('afc-1');

      expect(team1?.QB).toBe(20);
      expect(team1?.RB).toBe(30);
      expect(team1?.WR).toBe(25);
      expect(team1?.TE).toBe(0);
      expect(team1?.DEF).toBe(0);
    });

    it('uses composite key for roster identification', () => {
      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                {
                  roster_id: 1,
                  starters: ['player1'],
                  players_points: { player1: 20 },
                } as SleeperMatchup,
              ],
            ],
            [
              'nfc',
              [
                {
                  roster_id: 1,
                  starters: ['player1'],
                  players_points: { player1: 25 },
                } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getStarterPositionPoints({ matchups, playersIndex: mockPlayersIndex });
      const week1 = result.get(1);

      expect(week1?.has('afc-1')).toBe(true);
      expect(week1?.has('nfc-1')).toBe(true);
      expect(week1?.get('afc-1')?.QB).toBe(20);
      expect(week1?.get('nfc-1')?.QB).toBe(25);
    });

    it('initializes all positions to zero', () => {
      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                {
                  roster_id: 1,
                  starters: [],
                  players_points: {},
                } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getStarterPositionPoints({ matchups, playersIndex: mockPlayersIndex });
      const week1 = result.get(1);
      const team1 = week1?.get('afc-1');

      expect(team1?.QB).toBe(0);
      expect(team1?.RB).toBe(0);
      expect(team1?.WR).toBe(0);
      expect(team1?.TE).toBe(0);
      expect(team1?.DEF).toBe(0);
    });

    it('handles players not in index', () => {
      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                {
                  roster_id: 1,
                  starters: ['unknownPlayer'],
                  players_points: { unknownPlayer: 20 },
                } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getStarterPositionPoints({ matchups, playersIndex: mockPlayersIndex });
      const week1 = result.get(1);
      const team1 = week1?.get('afc-1');

      // Unknown player shouldn't contribute to any position
      expect(team1?.QB).toBe(0);
      expect(team1?.RB).toBe(0);
      expect(team1?.WR).toBe(0);
      expect(team1?.TE).toBe(0);
      expect(team1?.DEF).toBe(0);
    });

    it('handles zero points', () => {
      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                {
                  roster_id: 1,
                  starters: ['player1'],
                  players_points: { player1: 0 },
                } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getStarterPositionPoints({ matchups, playersIndex: mockPlayersIndex });
      const week1 = result.get(1);
      const team1 = week1?.get('afc-1');

      expect(team1?.QB).toBe(0);
    });

    it('sums multiple players at same position', () => {
      const playersIndex: PlayerIndex = {
        rb1: { player_id: 'rb1', position: 'RB' } as any,
        rb2: { player_id: 'rb2', position: 'RB' } as any,
        rb3: { player_id: 'rb3', position: 'RB' } as any,
      };

      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                {
                  roster_id: 1,
                  starters: ['rb1', 'rb2', 'rb3'],
                  players_points: { rb1: 20, rb2: 15, rb3: 10 },
                } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getStarterPositionPoints({ matchups, playersIndex });
      const week1 = result.get(1);
      const team1 = week1?.get('afc-1');

      expect(team1?.RB).toBe(45); // 20 + 15 + 10
    });

    it('processes multiple weeks', () => {
      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                {
                  roster_id: 1,
                  starters: ['player1'],
                  players_points: { player1: 20 },
                } as SleeperMatchup,
              ],
            ],
          ]),
        ],
        [
          2,
          new Map([
            [
              'afc',
              [
                {
                  roster_id: 1,
                  starters: ['player1'],
                  players_points: { player1: 25 },
                } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getStarterPositionPoints({ matchups, playersIndex: mockPlayersIndex });

      expect(result.size).toBe(2);
      expect(result.get(1)?.get('afc-1')?.QB).toBe(20);
      expect(result.get(2)?.get('afc-1')?.QB).toBe(25);
    });

    it('ignores players with positions not in tracked positions', () => {
      const playersIndex: PlayerIndex = {
        k1: { player_id: 'k1', position: 'K' } as any, // Kicker not tracked
      };

      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                {
                  roster_id: 1,
                  starters: ['k1'],
                  players_points: { k1: 10 },
                } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getStarterPositionPoints({ matchups, playersIndex });
      const week1 = result.get(1);
      const team1 = week1?.get('afc-1');

      // Kicker points should not be included
      const totalPoints =
        (team1?.QB || 0) +
        (team1?.RB || 0) +
        (team1?.WR || 0) +
        (team1?.TE || 0) +
        (team1?.DEF || 0);
      expect(totalPoints).toBe(0);
    });

    it('handles empty matchups', () => {
      const result = getStarterPositionPoints({
        matchups: new Map(),
        playersIndex: mockPlayersIndex,
      });
      expect(result.size).toBe(0);
    });

    it('handles multiple teams in same league', () => {
      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                {
                  roster_id: 1,
                  starters: ['player1'],
                  players_points: { player1: 20 },
                } as SleeperMatchup,
                {
                  roster_id: 2,
                  starters: ['player2'],
                  players_points: { player2: 30 },
                } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getStarterPositionPoints({ matchups, playersIndex: mockPlayersIndex });
      const week1 = result.get(1);

      expect(week1?.size).toBe(2);
      expect(week1?.get('afc-1')?.QB).toBe(20);
      expect(week1?.get('afc-2')?.RB).toBe(30);
    });
  });

  describe('aggregatePositionPoints', () => {
    it('sums position points across weeks', () => {
      const weeklyPoints = new Map([
        [1, new Map([['afc-1', { QB: 20, RB: 30, WR: 25, TE: 10, DEF: 5 }]])],
        [2, new Map([['afc-1', { QB: 25, RB: 35, WR: 20, TE: 15, DEF: 8 }]])],
      ]);

      const result = aggregatePositionPoints(weeklyPoints, { from: 1, to: 2 });
      const team1 = result.get('afc-1');

      expect(team1?.QB).toBe(45); // 20 + 25
      expect(team1?.RB).toBe(65); // 30 + 35
      expect(team1?.WR).toBe(45); // 25 + 20
      expect(team1?.TE).toBe(25); // 10 + 15
      expect(team1?.DEF).toBe(13); // 5 + 8
    });

    it('handles partial week range', () => {
      const weeklyPoints = new Map([
        [1, new Map([['afc-1', { QB: 20, RB: 30, WR: 25, TE: 10, DEF: 5 }]])],
        [2, new Map([['afc-1', { QB: 25, RB: 35, WR: 20, TE: 15, DEF: 8 }]])],
        [3, new Map([['afc-1', { QB: 30, RB: 40, WR: 22, TE: 12, DEF: 6 }]])],
      ]);

      // Only aggregate weeks 1-2
      const result = aggregatePositionPoints(weeklyPoints, { from: 1, to: 2 });
      const team1 = result.get('afc-1');

      expect(team1?.QB).toBe(45); // Not including week 3
      expect(team1?.RB).toBe(65);
    });

    it('handles missing weeks in range', () => {
      const weeklyPoints = new Map([
        [1, new Map([['afc-1', { QB: 20, RB: 30, WR: 25, TE: 10, DEF: 5 }]])],
        // Week 2 missing
        [3, new Map([['afc-1', { QB: 30, RB: 40, WR: 22, TE: 12, DEF: 6 }]])],
      ]);

      const result = aggregatePositionPoints(weeklyPoints, { from: 1, to: 3 });
      const team1 = result.get('afc-1');

      expect(team1?.QB).toBe(50); // 20 + 30
      expect(team1?.RB).toBe(70); // 30 + 40
    });

    it('handles multiple teams', () => {
      const weeklyPoints = new Map([
        [
          1,
          new Map([
            ['afc-1', { QB: 20, RB: 30, WR: 25, TE: 10, DEF: 5 }],
            ['afc-2', { QB: 22, RB: 28, WR: 30, TE: 12, DEF: 7 }],
          ]),
        ],
      ]);

      const result = aggregatePositionPoints(weeklyPoints, { from: 1, to: 1 });

      expect(result.size).toBe(2);
      expect(result.get('afc-1')?.QB).toBe(20);
      expect(result.get('afc-2')?.QB).toBe(22);
    });

    it('initializes with zeros for new teams', () => {
      const weeklyPoints = new Map([
        [1, new Map([['afc-1', { QB: 20, RB: 30, WR: 25, TE: 10, DEF: 5 }]])],
      ]);

      const result = aggregatePositionPoints(weeklyPoints, { from: 1, to: 1 });
      const team1 = result.get('afc-1');

      expect(team1?.QB).toBe(20);
      expect(team1?.RB).toBe(30);
      expect(team1?.WR).toBe(25);
      expect(team1?.TE).toBe(10);
      expect(team1?.DEF).toBe(5);
    });

    it('handles empty weekly points', () => {
      const result = aggregatePositionPoints(new Map(), { from: 1, to: 1 });
      expect(result.size).toBe(0);
    });

    it('handles week range with no data', () => {
      const weeklyPoints = new Map([
        [1, new Map([['afc-1', { QB: 20, RB: 30, WR: 25, TE: 10, DEF: 5 }]])],
      ]);

      const result = aggregatePositionPoints(weeklyPoints, { from: 5, to: 10 });
      expect(result.size).toBe(0);
    });

    it('accumulates across full season', () => {
      const weeklyPoints = new Map(
        Array.from({ length: 14 }, (_, i) => [
          i + 1,
          new Map([['afc-1', { QB: 20 + i, RB: 30 + i, WR: 25 + i, TE: 10 + i, DEF: 5 + i }]]),
        ]),
      );

      const result = aggregatePositionPoints(weeklyPoints, { from: 1, to: 14 });
      const team1 = result.get('afc-1');

      expect(team1?.QB).toBeGreaterThan(280); // At least 20 * 14
      expect(team1?.RB).toBeGreaterThan(420); // At least 30 * 14
    });

    it('keeps teams from different leagues separate', () => {
      const weeklyPoints = new Map([
        [
          1,
          new Map([
            ['afc-1', { QB: 20, RB: 30, WR: 25, TE: 10, DEF: 5 }],
            ['nfc-1', { QB: 25, RB: 35, WR: 30, TE: 15, DEF: 8 }],
          ]),
        ],
      ]);

      const result = aggregatePositionPoints(weeklyPoints, { from: 1, to: 1 });

      expect(result.get('afc-1')?.QB).toBe(20);
      expect(result.get('nfc-1')?.QB).toBe(25);
    });
  });
});
