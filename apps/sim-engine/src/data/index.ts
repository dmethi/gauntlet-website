// Re-export variance data loader functions
export { getPositionDistribution, getPlayerOutcomes, getDataInfo } from './variance-loader';

// Re-export variance data types from central package
export type {
  PositionVarianceRecord,
  PlayerVarianceRecord,
  ProjectionErrorRecord,
  VarianceData,
} from '@gauntlet/types';
