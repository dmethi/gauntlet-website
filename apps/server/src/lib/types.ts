/**
 * Internal types for apps/server lib utilities
 *
 * Note: Most types are imported from @gauntlet/types (centralized)
 * This file contains only server-lib-specific internal types
 */

// Re-export commonly used types from @gauntlet/types for convenience
export type {
  GauntletAPIOptions,
  LeagueOddsResponse,
  MatchupSimulationResponse,
  CompleteSnapshot,
  ValidationResult,
  PreviousSnapshot,
  Metrics,
  MetricsSummary,
} from '@gauntlet/types';

// Re-export Prisma types
export type {
  LiveWinProbSample,
  MatchupOddsHistory,
  LeagueOddsHistory,
} from '../generated/prisma-historical';

// Re-export local types
export type { RetryOptions } from './retry.js';
