import { colors } from '@/lib/colors';

/**
 * Get color based on rank position within a total set
 * Uses green for top performers, red for bottom performers
 *
 * @param rank - Current rank (1-indexed, where 1 is best)
 * @param total - Total number of items being ranked
 * @returns Hex color string
 *
 * @example
 * ```typescript
 * const topColor = getRankColor(1, 10);    // Dark green (top 10%)
 * const midColor = getRankColor(5, 10);    // Yellow (middle 50%)
 * const bottomColor = getRankColor(10, 10); // Red (bottom 10%)
 * ```
 */
export const getRankColor = (rank: number, total: number): string => {
  const percentile = (total - rank + 1) / total;
  if (percentile >= 0.9) return colors.rdylgn[9]; // top 10% - dark green
  if (percentile >= 0.75) return colors.rdylgn[8]; // top 25% - green
  if (percentile >= 0.5) return colors.rdylgn[7]; // top 50% - light green
  if (percentile >= 0.25) return colors.rdylgn[5]; // middle 50% - yellow
  if (percentile >= 0.1) return colors.rdylgn[3]; // bottom 25% - orange
  return colors.rdylgn[1]; // bottom 10% - red
};
