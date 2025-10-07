/**
 * Simulation & Variance Type Definitions
 *
 * Types for Monte Carlo simulations, variance models, and matchup probability calculations.
 * Used by sim-engine and web app for win probability simulations.
 */

// ============================================================================
// Lineup & Player Types
// ============================================================================

/**
 * Player in a fantasy lineup with projection and optional live scoring data
 */
export interface LineupPlayer {
  id: string;
  name: string;
  position: string;
  projection: number;
  currentScore?: number; // Actual points scored so far (for live simulations)
  nflTeam?: string; // NFL team abbreviation (for selective game progress)
}

/**
 * Standard fantasy lineup structure (8 starters)
 * Note: Some leagues may use different structures (SUPER_FLEX, etc.)
 */
export interface Lineup {
  qb: LineupPlayer;
  rb1: LineupPlayer;
  rb2: LineupPlayer;
  wr1: LineupPlayer;
  wr2: LineupPlayer;
  wr3: LineupPlayer;
  te: LineupPlayer;
  flex: LineupPlayer; // RB/WR/TE
}

// ============================================================================
// Simulation Results
// ============================================================================

/**
 * Result of a single simulated matchup
 */
export interface MatchupResult {
  team1Score: number;
  team2Score: number;
  winner: 1 | 2;
  margin: number;
}

/**
 * Score distribution statistics for a team
 */
export interface ScoreDistribution {
  mean: number;
  median: number;
  p10: number; // 10th percentile
  p90: number; // 90th percentile
}

/**
 * Betting odds implied by simulation results
 */
export interface ImpliedOdds {
  team1MoneyLine: number; // e.g. -150 or +130
  team2MoneyLine: number;
  spread: number; // e.g. -3.5 or +3.5
  total: number; // over/under
}

/**
 * Complete simulation results for a matchup
 * Based on 10,000+ iterations for statistical significance
 */
export interface MatchupSimulationResult {
  team1WinPct: number;
  team2WinPct: number;
  medianMargin: number;
  team1Scores: ScoreDistribution;
  team2Scores: ScoreDistribution;
  impliedOdds: ImpliedOdds;
}

// ============================================================================
// Variance & Projection Error Types
// ============================================================================

/**
 * Position-level variance statistics
 * Derived from historical projection vs actual performance (2022-2024)
 */
export interface PositionVarianceRecord {
  id: string;
  position: string; // QB, RB, WR, TE, K, DEF
  season: string;
  sampleSize: number; // Number of player-weeks analyzed
  meanError: number; // Average projection error
  stdDev: number; // Standard deviation of errors
  lastUpdated: string;
  createdAt: string;
}

/**
 * Player-specific variance statistics
 * Used for 70% player-specific, 30% position-level weighting
 */
export interface PlayerVarianceRecord {
  id: string;
  playerId: string; // Sleeper player ID
  season: string;
  sampleSize: number; // Number of weeks analyzed
  meanError: number; // Player-specific bias
  stdDev: number; // Player-specific volatility
  lastUpdated: string;
  createdAt: string;
}

/**
 * Individual projection error data point
 * Raw data used to calculate variance statistics
 */
export interface ProjectionErrorRecord {
  id: string;
  playerId: string; // Sleeper player ID
  week: number;
  season: string;
  projectedPoints: number;
  actualPoints: number;
  normalizedError: number; // (actual - projected) / projected
  createdAt: string;
}

/**
 * Data quality metrics for variance data export.
 */
export interface DataQualityMetrics {
  /** Total number of players in variance data */
  totalPlayers: number;
  /** Players with sufficient data (≥4 games) */
  playersWithVariance: number;
  /** Outliers removed during export */
  outlierRemovalCount: number;
  /** Positions with variance data */
  positionsWithVariance: string[];
}

/**
 * Complete variance dataset with versioning
 * Exported from historical analysis for use in simulations
 */
export interface VarianceData {
  /** Semantic version of data format (e.g., "1.0.0") */
  version: string;

  /** Schema version number for breaking changes */
  schemaVersion: number;

  /** ISO 8601 timestamp of export */
  exportedAt: string;

  /** NFL season (e.g., 2025) */
  season: number;

  /** NFL weeks covered in this export */
  weeksCovered: number[];

  /** Data quality and statistics */
  dataQuality: DataQualityMetrics;

  /** Position-level variance distributions */
  positionVariance: PositionVarianceRecord[];

  /** Player-specific variance distributions */
  playerVariance: PlayerVarianceRecord[];

  /** Individual projection error records */
  projectionErrors: ProjectionErrorRecord[];
}

/**
 * Sampling context for Monte Carlo simulation
 * Pre-computed outcome distributions for efficient synchronous sampling
 */
export interface SamplingContext {
  positionToOutcomes: Map<string, number[]>; // Position -> array of sampled outcomes
  playerToOutcomes: Map<string, number[]>; // Player ID -> array of sampled outcomes
  playerSampleCounts: Map<string, number>; // Player ID -> number of samples
  positionSampleCounts: Map<string, number>; // Position -> number of samples
}

// ============================================================================
// Legacy/Deprecated Types (for backwards compatibility)
// ============================================================================

/**
 * @deprecated Use MatchupSimulationResult instead
 * Kept for backwards compatibility with old generic types
 */
export interface SimulationResult {
  matchupId: string;
  week: number;
  team1Score: number;
  team2Score: number;
  winner: string;
  confidence: number;
  playerProjections?: Array<{
    playerId: string;
    projectedPoints: number;
    floor: number;
    ceiling: number;
    confidence: number;
  }>;
}
