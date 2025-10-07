/**
 * Format a number with fixed decimal places
 */
export const formatNumber = (value: number, decimals = 1): string => {
  return value.toFixed(decimals);
};

/**
 * Format a number as a delta (with + sign for positive values)
 */
export const formatDelta = (value: number, decimals = 1): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}`;
};

/**
 * Format a number in compact notation (K, M, B)
 */
export const formatCompact = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};
