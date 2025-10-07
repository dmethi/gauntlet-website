// ============================================
// SIMULATION FUNCTIONS
// ============================================

// Matchup simulations (primary API)
export {
  simulateMatchupProbabilityFromPlayers,
  simulateMatchupProbability,
  simulateMatchupProbabilitySafe,
} from './models/matchup';

// Player variance simulations
export {
  simulatePlayerScore,
  simulatePlayerRange,
  getVarianceModel,
  buildSamplingContext,
  samplePlayerScoreFromContext,
  buildSamplingContextSafe,
} from './models/variance';

// Season simulations (experimental)
export { runSeasonSimulation } from './simulations/season-sim';

// ============================================
// DATA FUNCTIONS
// ============================================

export {
  getPositionDistribution,
  getPlayerOutcomes,
  getDataInfo,
  getPositionDistributionSafe,
  getPlayerOutcomesSafe,
  prewarmVarianceData,
} from './data/variance-loader';

// Schema versioning
export {
  validateSchemaVersion,
  getSchemaMigrationGuidance,
  CURRENT_SCHEMA_VERSION,
  MIN_SUPPORTED_SCHEMA_VERSION,
} from './data/schema-version';

export type { SchemaValidation } from './data/schema-version';

// ============================================
// ERROR HANDLING
// ============================================

// Result type and utilities
export type { Result } from './lib/result';
export { ok, err, isOk, isErr, unwrap, unwrapOr } from './lib/result';

// Error classes
export { SimulationError } from './models/matchup';
export { ValidationError } from './lib/validation';

// ============================================
// LOGGING
// ============================================

export { logger, createChildLogger } from './lib/logger';

// ============================================
// METRICS
// ============================================

export { createMetrics } from './lib/metrics';

// ============================================
// VALIDATION
// ============================================

export {
  validateLineupPlayer,
  validateLineupPlayers,
  validateIterations,
  validateGameProgress,
  validateProjection,
  validatePosition,
  VALID_POSITIONS,
} from './lib/validation';

// ============================================
// TYPE EXPORTS
// ============================================

export type {
  LineupPlayer,
  Lineup,
  MatchupResult,
  MatchupSimulationResult,
  SamplingContext,
  ScoreDistribution,
  ImpliedOdds,
  Metrics,
  MetricsSummary,
} from '@gauntlet/types';

export type {
  PositionVarianceRecord,
  PlayerVarianceRecord,
  ProjectionErrorRecord,
  VarianceData,
  DataQualityMetrics,
} from '@gauntlet/types';

// ============================================
// BARREL EXPORTS (for sub-module imports)
// ============================================

export * as models from './models';
export * as data from './data';
