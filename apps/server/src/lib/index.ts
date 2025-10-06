/**
 * Server Library Exports
 *
 * Barrel export file for all server utilities.
 * Enables clean imports: import { gauntletAPI, disconnect } from '@/lib';
 */

// API Client
export { createGauntletAPIClient, gauntletAPI } from './gauntlet-api-client.js';

// Historical Data (Database Operations)
export {
  // Write operations
  saveLiveWinProbSample,
  saveMatchupOddsHistory,
  saveLeagueOddsHistory,

  // Read operations
  getLastWinProbSample,
  getMatchupWinProbTimeSeries,
  getWeekWinProbSamples,
  getMatchupExcitementMetrics,
  getMatchupOddsHistory,
  getLeagueOddsHistory,
  getLatestLeagueOdds,

  // Lifecycle
  disconnect,
} from './historical-data.js';

// Snapshot Validation
export { hasSignificantChange, saveSnapshotIfChanged } from './snapshot-validator.js';

// Logger
export { logger, createChildLogger } from './logger.js';

// Metrics
export { createMetrics, measureDuration } from './metrics.js';

// Retry logic
export { fetchWithRetry, retryAsync } from './retry.js';

// Types
export type * from './types.js';
