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
  readonly conditions: readonly ScenarioCondition[]; // Legacy - single representative condition set
  readonly paths?: readonly SeedPath[]; // All deterministic paths to this seed
  readonly summary?: PathSummary; // Simplified summary for display
}

/**
 * Individual condition in a scenario (legacy - kept for backwards compatibility)
 */
export interface ScenarioCondition {
  readonly type: 'win' | 'lose' | 'other_team_wins' | 'other_team_loses' | 'points_margin';
  readonly teamName: string;
  readonly rosterId: number;
  readonly marginRequired?: number; // For points_margin type
}

/**
 * Individual condition in a deterministic path to a seed
 */
export interface PathCondition {
  readonly type: 'win' | 'lose' | 'other_result' | 'points_margin';
  readonly teamName: string;
  readonly rosterId: number;
  readonly opponentName?: string; // For other_result type, the team they play against
  readonly opponentRosterId?: number;
  readonly wins?: boolean; // For other_result type, true if this team needs to win
  readonly marginRequired?: number; // Exact points needed for tiebreaker
  readonly vsTeamName?: string; // For points_margin, who they need to outscore
}

/**
 * A specific path (combination of outcomes) that leads to a seed
 */
export interface SeedPath {
  readonly outcomeId: number; // Which of 64 outcomes (0-63)
  readonly conditions: readonly PathCondition[];
}

/**
 * Summarized path information for cleaner display
 * Instead of showing 32 individual paths, summarize the key requirements
 */
export interface PathSummary {
  readonly type: 'guaranteed' | 'conditional' | 'impossible';
  readonly requiresWin: boolean | null; // null = either works, true = must win, false = must lose
  readonly description: string; // Human-readable summary like "WIN and in" or "LOSE + Team A wins"
  readonly additionalConditions?: readonly string[]; // Key differentiating conditions
  readonly pathCount: number; // How many of the 64 outcomes lead here
  readonly winPathCount: number; // How many require winning
  readonly losePathCount: number; // How many require losing
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
 * Point constraints for deterministic path calculations
 * Teams can realistically score between MIN and MAX points in a week
 */
export const POINTS_CONSTRAINTS = {
  MIN_SCORE: 50,
  MAX_SCORE: 200,
  // Maximum possible points differential in a single matchup
  // If winner scores MAX and loser scores MIN
  MAX_MARGIN: 150, // 200 - 50
} as const;

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
