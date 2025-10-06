// Re-export all matchup simulation functions
export { simulateMatchupProbabilityFromPlayers, simulateMatchupProbability } from './matchup';

// Re-export all variance functions
export {
  simulatePlayerScore,
  simulatePlayerRange,
  getVarianceModel,
  buildSamplingContext,
  samplePlayerScoreFromContext,
} from './variance';

// Re-export types from central package
export type {
  LineupPlayer,
  Lineup,
  MatchupResult,
  MatchupSimulationResult,
  SamplingContext,
} from '@gauntlet/types';
