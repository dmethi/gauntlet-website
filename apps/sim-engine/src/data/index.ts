// Re-export variance data loader functions
export { getDataInfo, getPlayerOutcomes, getPositionDistribution } from './variance-loader';

// Re-export player metadata utility
export { getPlayerMetadata } from './player-metadata';

// Re-export variance updater functions
export {
  calculateProjectionError,
  getSeasonWeight,
  removeOutliers,
  updatePlayerVariance,
  updatePositionVariance,
  updateProjectionErrors,
} from './variance-updater';

// Re-export variance validator functions
export { capVarianceChanges, validateVarianceChanges } from './variance-validator';

// Re-export variance data types from central package
export type {
  PlayerVarianceRecord,
  PositionVarianceRecord,
  ProjectionErrorRecord,
  VarianceData,
} from '@gauntlet/types';
