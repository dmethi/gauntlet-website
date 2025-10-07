import type { SleeperRoster } from '@gauntlet/types';

/**
 * Factory for generating test team data
 */
export const TeamFactory = {
  /**
   * Generate a test team with default or custom values
   *
   * @example
   * ```typescript
   * import { TeamFactory } from '@/test';
   *
   * it('should calculate team score', () => {
   *   const team = TeamFactory.generateTeam({ roster_id: 5 });
   *   expect(team.roster_id).toBe(5);
   * });
   * ```
   */
  generateTeam: (overrides: Partial<SleeperRoster> = {}): SleeperRoster => ({
    roster_id: 1,
    owner_id: 'user_123',
    league_id: 'league_123',
    players: ['player_1', 'player_2', 'player_3'],
    starters: ['player_1', 'player_2'],
    settings: {
      wins: 5,
      losses: 3,
      ties: 0,
      waiver_position: 1,
      waiver_budget_used: 50,
      total_moves: 10,
      fpts: 1250.5,
      fpts_decimal: 1250.5,
      fpts_against: 1150.0,
      fpts_against_decimal: 1150.0,
    },
    metadata: {
      team_name: 'Test Team',
    },
    ...overrides,
  }),

  /**
   * Generate multiple teams
   *
   * @example
   * ```typescript
   * import { TeamFactory } from '@/test';
   *
   * it('should handle multiple teams', () => {
   *   const teams = TeamFactory.generateMultiple(3);
   *   expect(teams).toHaveLength(3);
   *   expect(teams[0].roster_id).toBe(1);
   * });
   * ```
   */
  generateMultiple: (count: number, overrides: Partial<SleeperRoster> = {}): SleeperRoster[] => {
    return Array.from({ length: count }, (_, i) =>
      TeamFactory.generateTeam({
        roster_id: i + 1,
        owner_id: `user_${i + 1}`,
        metadata: {
          team_name: `Team ${i + 1}`,
        },
        ...overrides,
      }),
    );
  },
};
