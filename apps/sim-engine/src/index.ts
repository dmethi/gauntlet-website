export * from './models/matchup';
export * from './models/variance';
export * from './simulations/matchup-sim';
export * from './simulations/season-sim';

// Explicit exports for tree-shaking-friendly named imports
export { simulateMatchupProbabilityFromPlayers } from './models/matchup';

// Import types from central package and re-export
import type { MatchupResult, MatchupSimulationResult } from '@gauntlet/types';
export type { MatchupResult, MatchupSimulationResult };
