/**
 * Format a decimal as a percentage (0.5 → "50%")
 */
export const formatPercentage = (value: number, decimals = 0): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format a decimal with fixed places (no percentage sign)
 */
export const formatDecimal = (value: number, decimals = 2): string => {
  return value.toFixed(decimals);
};
