/**
 * Matchup data structure
 */
export interface TestMatchup {
  matchup_id: number;
  roster_id: number;
  points: number;
  players_points: Record<string, number>;
  starters_points: number[];
}

/**
 * Factory for generating test matchup data
 */
export const MatchupFactory = {
  /**
   * Generate a test matchup with default or custom values
   *
   * @example
   * ```typescript
   * import { MatchupFactory } from '@/test';
   *
   * it('should process matchup data', () => {
   *   const matchup = MatchupFactory.generateMatchup({ points: 150.0 });
   *   expect(matchup.points).toBe(150.0);
   * });
   * ```
   */
  generateMatchup: (overrides: Partial<TestMatchup> = {}): TestMatchup => ({
    matchup_id: 1,
    roster_id: 1,
    points: 125.5,
    players_points: {
      player_1: 25.5,
      player_2: 18.0,
      player_3: 12.5,
    },
    starters_points: [25.5, 18.0, 12.5, 20.0, 15.0, 10.0, 8.0, 5.0, 4.0],
    ...overrides,
  }),

  /**
   * Generate a complete matchup (both teams)
   *
   * @example
   * ```typescript
   * import { MatchupFactory } from '@/test';
   *
   * it('should handle matchup pairs', () => {
   *   const [team1, team2] = MatchupFactory.generateMatchupPair();
   *   expect(team1.matchup_id).toBe(team2.matchup_id);
   *   expect(team1.roster_id).not.toBe(team2.roster_id);
   * });
   * ```
   */
  generateMatchupPair: (overrides?: {
    team1?: Partial<TestMatchup>;
    team2?: Partial<TestMatchup>;
  }): TestMatchup[] => {
    const matchup_id = 1;
    return [
      MatchupFactory.generateMatchup({
        matchup_id,
        roster_id: 1,
        points: 125.5,
        ...overrides?.team1,
      }),
      MatchupFactory.generateMatchup({
        matchup_id,
        roster_id: 2,
        points: 118.0,
        ...overrides?.team2,
      }),
    ];
  },
};
