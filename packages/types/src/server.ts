/**
 * Server-Specific Types
 *
 * Types used by the server package (background jobs, API clients, database operations)
 */

// ============================================================================
// Gauntlet API Client Types
// ============================================================================

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
  [key: string]: any; // Allow additional fields
}

/**
 * Individual matchup simulation response from /api/matchups/{leagueId}/{week}/{matchupId}/simulate
 */
export interface MatchupSimulationResponse {
  success: boolean;
  simulation: {
    team1WinPct: number;
    team2WinPct: number;
    team1Scores: {
      mean: number;
      median: number;
      p25: number;
      p75: number;
    };
    team2Scores: {
      mean: number;
      median: number;
      p25: number;
      p75: number;
    };
    teams: Array<{
      rosterId: number;
      players: Array<{
        id: string;
        name?: string;
        playerName?: string;
        position?: string;
        nflTeam?: string;
        currentScore: number;
        projection: number;
        fullProjection?: number;
        gameState?: {
          state: string;
          gameDescription?: string;
          minutesRemaining?: number;
        };
      }>;
    }>;
    impliedOdds: {
      spread: number;
      total: number;
    };
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
  team1: {
    rosterId: number;
    rawProjectionTotal: number;
    simulatedMean: number; // This is what shows in your screenshot as "Proj:"
    currentScore: number;
    winProbability: number;
  };
  team2: {
    rosterId: number;
    rawProjectionTotal: number;
    simulatedMean: number; // This is what shows in your screenshot as "Proj:"
    currentScore: number;
    winProbability: number;
  };

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
  team1Players?: Array<{
    name: string;
    position: string;
    nflTeam?: string;
    currentScore: number;
    remainingProjection: number;
    fullProjection: number;
    gameState?: { state: string; desc?: string; minutesRemaining?: number };
  }>;
  team2Players?: Array<{
    name: string;
    position: string;
    nflTeam?: string;
    currentScore: number;
    remainingProjection: number;
    fullProjection: number;
    gameState?: { state: string; desc?: string; minutesRemaining?: number };
  }>;
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
  timers: Record<
    string,
    {
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
  >;
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
