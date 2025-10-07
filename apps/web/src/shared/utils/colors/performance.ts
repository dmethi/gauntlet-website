import { colors } from '@/lib/colors';

/**
 * Get performance color based on value and direction
 * Returns green for positive performance, red for negative, yellow for neutral
 *
 * @param value - Numeric performance value
 * @param isPositive - Whether positive values are good (true) or bad (false)
 * @returns Hex color string
 *
 * @example
 * ```typescript
 * const goodColor = getPerformanceColor(10, true);  // Green
 * const badColor = getPerformanceColor(10, false);  // Red
 * const neutralColor = getPerformanceColor(0, true); // Yellow
 * ```
 */
export const getPerformanceColor = (value: number, isPositive: boolean): string => {
  if (value === 0) return colors.rdylgn[5]; // neutral
  return isPositive ? colors.rdylgn[8] : colors.rdylgn[2]; // green or red
};
