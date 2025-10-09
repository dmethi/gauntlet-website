/**
 * Statistical calculation utilities
 */

/**
 * Calculate median of an array of numbers
 */
export const median = (values: number[]): number => {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    // Even number of values - average of middle two
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    // Odd number of values - middle value
    return sorted[mid];
  }
};

/**
 * Calculate mean (average) of an array of numbers
 */
export const mean = (values: number[]): number => {
  if (values.length === 0) return 0;

  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

/**
 * Calculate standard deviation
 */
export const standardDeviation = (values: number[]): number => {
  if (values.length === 0) return 0;

  const avg = mean(values);
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
  const avgSquaredDiff = mean(squaredDiffs);

  return Math.sqrt(avgSquaredDiff);
};

/**
 * Calculate percentiles
 */
export const percentile = (values: number[], p: number): number => {
  if (values.length === 0) return 0;
  if (p < 0 || p > 100) throw new Error('Percentile must be between 0 and 100');

  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (lower === upper) {
    return sorted[lower];
  }

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};
