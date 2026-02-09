/**
 * Weight calculations for playoff and championship weeks
 * Used to give extra importance to late-season performance
 */

/**
 * Calculate the weight multiplier for a given week
 * Playoff weeks (15-17) get progressively higher weights
 * @param week - The week number (1-18)
 * @returns Weight multiplier (1.0 for regular season, 1.3-2.0 for playoffs)
 */
export const playoffWeight = (week: number): number => {
  if (week === 15) return 1.3;
  if (week === 16) return 1.6;
  if (week === 17) return 2.0;
  return 1.0;
};
