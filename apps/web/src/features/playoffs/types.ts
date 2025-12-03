/**
 * Playoff bracket types
 * Types for playoff bracket visualization and management
 */

import type { TeamStats } from '@/lib/hooks';

export interface Matchup {
  week: number;
  points: number;
  projected: number;
  result: 'W' | 'L' | 'T';
}

export interface Roster {
  id: string;
  matchups: Matchup[];
}

export interface LeagueData {
  rosters: Roster[];
}

export interface PlayoffMatchup {
  r: number; // round
  m: number; // matchup id
  t1: number; // team 1 roster id
  t2: number; // team 2 roster id
  t1_from?: { w: number; m: number } | { l: number; m: number }; // where team 1 comes from
  t2_from?: { w: number; m: number } | { l: number; m: number }; // where team 2 comes from
}

export interface PlayoffBracket {
  winners_bracket?: PlayoffMatchup[];
  losers_bracket?: PlayoffMatchup[];
}

export interface BracketTeam {
  id: string;
  name: string;
  seed: number;
  record: string;
  points?: number;
  isWinner?: boolean;
  isEliminated?: boolean;
}

export interface MatchupResult {
  team1Score?: number;
  team2Score?: number;
  winnerId?: string;
  isComplete?: boolean;
}

export interface MatchupProps {
  team1?: BracketTeam;
  team2?: BracketTeam;
  matchupLabel: string;
  isBye?: boolean;
  result?: MatchupResult;
  isToiletBowl?: boolean;
}

export interface PlayoffBracketProps {
  teams: TeamStats[];
  league?: LeagueData;
  playoffBracket?: PlayoffBracket;
}

// ============================================================================
// PLAYOFF SCENARIOS TYPES
// ============================================================================

/**
 * Team standing information for playoff calculations
 */
export interface TeamStanding {
  readonly rosterId: number;
  readonly teamName: string;
  readonly ownerName: string;
  readonly division: number;
  readonly wins: number;
  readonly losses: number;
  readonly pointsFor: number;
  readonly leagueId: string;
}

/**
 * Week 14 matchup pairing
 */
export interface Week14Matchup {
  readonly matchupId: number;
  readonly team1RosterId: number;
  readonly team2RosterId: number;
  readonly team1Name: string;
  readonly team2Name: string;
}

/**
 * Historical scoring distribution for a team
 */
export interface TeamScoringDistribution {
  readonly rosterId: number;
  readonly teamName: string;
  readonly weeklyScores: readonly number[];
  readonly mean: number;
  readonly stdDev: number;
  readonly min: number;
  readonly max: number;
}

/**
 * Result of a single simulation iteration for seeding
 */
export interface SeedingSimulationResult {
  readonly rosterId: number;
  readonly seed: number; // 1-12 (1-6 for playoffs, 7-12 for non-playoff)
  readonly madePlayoffs: boolean;
  readonly finalWins: number;
  readonly finalPoints: number;
}

/**
 * Scenario conditions required for a specific seed
 */
export interface SeedScenario {
  readonly seed: number;
  readonly probability: number;
  readonly conditions: readonly ScenarioCondition[];
}

/**
 * Individual condition in a scenario
 */
export interface ScenarioCondition {
  readonly type: 'win' | 'lose' | 'other_team_wins' | 'other_team_loses' | 'points_margin';
  readonly teamName: string;
  readonly rosterId: number;
  readonly marginRequired?: number; // For points_margin type
}

/**
 * Aggregated seeding probabilities for a team
 */
export interface TeamSeedingProbabilities {
  readonly rosterId: number;
  readonly teamName: string;
  readonly ownerName: string;
  readonly currentRecord: string;
  readonly currentPoints: number;
  readonly division: number;
  readonly seedProbabilities: Record<number, number>; // seed -> probability (0-1)
  readonly playoffProbability: number;
  readonly bestPossibleSeed: number;
  readonly worstPossibleSeed: number;
  readonly scenarios: readonly SeedScenario[]; // Detailed scenarios for each achievable seed
}

/**
 * Full seeding simulation results for a league
 */
export interface LeagueSeedingResults {
  readonly leagueId: string;
  readonly leagueName: 'AFC' | 'NFC';
  readonly teams: readonly TeamSeedingProbabilities[];
  readonly week14Matchups: readonly Week14Matchup[];
  readonly simulationCount: number;
  readonly generatedAt: string;
}

// ============================================================================
// CROSS-LEAGUE BATTLE TYPES
// ============================================================================

/**
 * Player info for cross-league roster display
 */
export interface CrossLeaguePlayer {
  readonly playerId: string;
  readonly name: string;
  readonly position: string;
  readonly team: string | null;
  readonly projection: number;
  readonly currentScore: number;
}

/**
 * Individual cross-league matchup between corresponding seeds
 */
export interface CrossLeagueMatchup {
  readonly seed: number; // 1-12
  readonly afcTeam: {
    readonly rosterId: number;
    readonly teamName: string;
    readonly ownerName: string;
    readonly roster?: readonly CrossLeaguePlayer[];
  };
  readonly nfcTeam: {
    readonly rosterId: number;
    readonly teamName: string;
    readonly ownerName: string;
    readonly roster?: readonly CrossLeaguePlayer[];
  };
  readonly afcWinProbability: number;
  readonly nfcWinProbability: number;
  readonly projectedAfcScore: number;
  readonly projectedNfcScore: number;
}

/**
 * Full cross-league battle simulation results
 */
export interface CrossLeagueBattleResults {
  readonly afcWinProbability: number;
  readonly nfcWinProbability: number;
  readonly expectedAfcWins: number; // Out of 12
  readonly expectedNfcWins: number;
  readonly expectedAfcTotalPoints: number;
  readonly expectedNfcTotalPoints: number;
  readonly matchups: readonly CrossLeagueMatchup[];
  readonly simulationCount: number;
  readonly generatedAt: string;
}

// ============================================================================
// SCENARIO BUILDER TYPES
// ============================================================================

/**
 * Locked outcome for a matchup in the scenario builder
 */
export interface LockedOutcome {
  readonly matchupId: number;
  readonly winner: 'team1' | 'team2' | null; // null = simulate
}

/**
 * Scenario builder state
 */
export interface ScenarioBuilderState {
  readonly lockedOutcomes: Record<number, LockedOutcome>;
  readonly isSimulating: boolean;
}

// ============================================================================
// SIMULATION CONFIG TYPES
// ============================================================================

/**
 * Configuration for seeding simulation
 */
export interface SeedingSimulationConfig {
  readonly iterations: number;
  readonly lockedOutcomes?: Record<number, 'team1' | 'team2'>;
}

/**
 * Configuration for cross-league battle simulation
 */
export interface CrossLeagueSimulationConfig {
  readonly iterations: number;
  readonly useProjections: boolean; // true = use week 14 projections, false = use historical only
}
