/**
 * Server-Specific Types
 *
 * Types used by the server package (background jobs, API clients, database operations)
 */

import type { ImpliedOdds, ScoreDistribution } from './simulation';

// ============================================================================
// Gauntlet API Client Types
// ============================================================================

/**
 * Game state information for a player
 */
export interface GameState {
  state: string;
  gameDescription?: string;
  minutesRemaining?: number;
}

/**
 * Team snapshot data for matchup tracking
 */
export interface TeamSnapshot {
  rosterId: number;
  rawProjectionTotal: number;
  simulatedMean: number;
  currentScore: number;
  winProbability: number;
}

/**
 * Debug player information for detailed tracking
 */
export interface DebugPlayer {
  name: string;
  position: string;
  nflTeam?: string;
  currentScore: number;
  remainingProjection: number;
  fullProjection: number;
  gameState?: GameState;
}

/**
 * Player data from simulation API responses
 */
export interface SimulationPlayer {
  id: string;
  name?: string;
  playerName?: string;
  position?: string;
  nflTeam?: string;
  currentScore: number;
  projection: number;
  fullProjection?: number;
  gameState?: GameState;
}

/**
 * Configuration options for GauntletAPIClient
 */
export interface GauntletAPIOptions {
  /**
   * Base URL for the Gauntlet web app
   * @default 'https://gauntlet-website.vercel.app'
   */
  baseUrl?: string;
  /**
   * Request timeout in milliseconds
   * @default 30000 (30 seconds)
   */
  timeout?: number;
}

/**
 * League-wide odds response from /api/matchups/league-odds/{week}
 */
export interface LeagueOddsResponse {
  highestScorer?: Array<{
    leagueId: string;
    rosterId: number;
    projectedScore: number;
    rank: number;
  }>;
  [key: string]: unknown; // Allow additional fields
}

/**
 * Individual matchup simulation response from /api/matchups/{leagueId}/{week}/{matchupId}/simulate
 */
export interface MatchupSimulationResponse {
  success: boolean;
  simulation: {
    team1WinPct: number;
    team2WinPct: number;
    team1Scores: ScoreDistribution;
    team2Scores: ScoreDistribution;
    teams: Array<{
      rosterId: number;
      players: SimulationPlayer[];
    }>;
    impliedOdds: ImpliedOdds;
  };
}

// ============================================================================
// Live Snapshot Types
// ============================================================================

/**
 * Complete snapshot data combining league odds and individual matchup simulations
 * Used by comprehensive-live-snapshot.ts for capturing time-series data
 */
export interface CompleteSnapshot {
  week: number;
  leagueId: string;
  matchupId: number;

  // From Individual Matchup API (detailed data)
  team1: TeamSnapshot;
  team2: TeamSnapshot;

  // From League Odds API (team rankings)
  team1LeagueRank?: number;
  team2LeagueRank?: number;

  // Betting data
  spread: number;
  total: number;
  moneyLineA: number;
  moneyLineB: number;

  capturedAt: string;
  // Optional team names for better logging
  team1Name?: string;
  team2Name?: string;

  // Enhanced debug fields (not persisted): per-player breakdowns
  team1Players?: DebugPlayer[];
  team2Players?: DebugPlayer[];
}

// ============================================================================
// Database Audit Types
// ============================================================================

/**
 * Statistics for a Prisma model during database audit
 */
export interface ModelStats {
  name: string;
  count: number;
  hasData: boolean;
  latestRecord?: Date | null;
  oldestRecord?: Date | null;
}

// ============================================================================
// Snapshot Validation Types
// ============================================================================

/**
 * Result of snapshot validation and save operation
 */
export interface ValidationResult {
  /**
   * Whether the snapshot was saved to the database
   */
  saved: boolean;
  /**
   * Reason for the result (e.g., 'unchanged', 'saved', 'error')
   */
  reason?: string;
}

/**
 * Previous snapshot data used for comparison during validation
 */
export interface PreviousSnapshot {
  currentScoreA: number;
  currentScoreB: number;
  projectedFinalA: number;
  projectedFinalB: number;
  winProbA: number;
  winProbB: number;
  spread: number;
  total: number;
}

// ============================================================================
// Metrics Collection Types
// ============================================================================

/**
 * Timer statistics for a metric
 */
export interface TimerStats {
  /** Number of measurements */
  count: number;
  /** Total time across all measurements (ms) */
  total: number;
  /** Average time per measurement (ms) */
  avg: number;
  /** Minimum time recorded (ms) */
  min: number;
  /** Maximum time recorded (ms) */
  max: number;
}

/**
 * Summary of all collected metrics including counters and timers
 */
export interface MetricsSummary {
  /**
   * Counter metrics (e.g., snapshot.saved, snapshot.skipped)
   */
  counters: Record<string, number>;
  /**
   * Timer metrics with statistical aggregations
   */
  timers: Record<string, TimerStats>;
}

/**
 * Metrics collection instance for tracking job performance
 */
export interface Metrics {
  /**
   * Increment a counter metric
   */
  increment: (metric: string, value?: number) => void;
  /**
   * Record a duration metric in milliseconds
   */
  recordDuration: (metric: string, durationMs: number) => void;
  /**
   * Get summary of all metrics
   */
  getSummary: () => MetricsSummary;
  /**
   * Reset all metrics
   */
  reset: () => void;
}
