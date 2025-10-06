/**
 * Barrel exports for apps/server lib utilities
 */

// API Client
export { createGauntletAPIClient, gauntletAPI } from './gauntlet-api-client.js';

// Historical Data Operations
export {
  saveLiveWinProbSample,
  getLastWinProbSample,
  getMatchupWinProbTimeSeries,
  getWeekWinProbSamples,
  getMatchupExcitementMetrics,
  saveLeagueOddsHistory,
  getLeagueOddsHistory,
  getLatestLeagueOdds,
  disconnect,
} from './historical-data.js';

// Snapshot Validation
export { saveSnapshotIfChanged, hasSignificantChange } from './snapshot-validator.js';

// Logger
export { logger, createChildLogger } from './logger.js';

// Metrics
export { createMetrics, measureDuration } from './metrics.js';

// Retry logic
export { fetchWithRetry, retryAsync } from './retry.js';
export type { RetryOptions } from './retry.js';
