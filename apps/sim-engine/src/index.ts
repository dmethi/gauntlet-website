// ============================================
// SIMULATION FUNCTIONS
// ============================================

// Matchup simulations (primary API)
export {
  simulateMatchupProbabilityFromPlayers,
  simulateMatchupProbability,
} from './models/matchup';

// Player variance simulations
export {
  simulatePlayerScore,
  simulatePlayerRange,
  getVarianceModel,
  buildSamplingContext,
  samplePlayerScoreFromContext,
} from './models/variance';

// Season simulations (experimental)
export { runSeasonSimulation } from './simulations/season-sim';

// ============================================
// DATA FUNCTIONS
// ============================================

export { getPositionDistribution, getPlayerOutcomes, getDataInfo } from './data/variance-loader';

// ============================================
// LOGGING
// ============================================

export { logger, createChildLogger } from './lib/logger';

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
} from '@gauntlet/types';

export type {
  PositionVarianceRecord,
  PlayerVarianceRecord,
  ProjectionErrorRecord,
  VarianceData,
} from '@gauntlet/types';

// ============================================
// BARREL EXPORTS (for sub-module imports)
// ============================================

export * as models from './models';
export * as data from './data';
