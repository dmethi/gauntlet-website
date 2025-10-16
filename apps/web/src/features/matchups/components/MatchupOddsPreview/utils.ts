/**
 * Get color class based on win probability
 *
 * @param prob - Win probability as a decimal (0-1)
 * @returns Tailwind color class string
 *
 * @example
 * ```ts
 * getWinProbColor(0.75) // 'text-green-600 dark:text-green-400'
 * getWinProbColor(0.50) // 'text-yellow-500 dark:text-yellow-500'
 * ```
 */
export const getWinProbColor = (prob: number): string => {
  if (prob > 0.65) return 'text-green-600 dark:text-green-400';
  if (prob > 0.55) return 'text-yellow-600 dark:text-yellow-400';
  if (prob > 0.45) return 'text-yellow-500 dark:text-yellow-500';
  if (prob > 0.35) return 'text-orange-500 dark:text-orange-400';
  return 'text-red-500 dark:text-red-400';
};

/**
 * Format win probability as percentage
 *
 * @param prob - Win probability as a decimal (0-1)
 * @returns Formatted percentage string
 *
 * @example
 * ```ts
 * formatWinProbability(0.753) // '75%'
 * formatWinProbability(0.500) // '50%'
 * ```
 */
export const formatWinProbability = (prob: number): string => {
  return `${(prob * 100).toFixed(0)}%`;
};

/**
 * Format spread display with team name
 *
 * @param spread - Point spread value (positive favors team1)
 * @param team1Name - Name of first team
 * @param team2Name - Name of second team
 * @returns Formatted spread string
 *
 * @example
 * ```ts
 * formatSpreadDisplay(3.5, 'Chiefs', 'Bills') // 'Chiefs 3.5'
 * formatSpreadDisplay(-2.5, 'Chiefs', 'Bills') // 'Bills 2.5'
 * formatSpreadDisplay(0, 'Chiefs', 'Bills') // 'PK'
 * ```
 */
export const formatSpreadDisplay = (
  spread: number,
  team1Name: string,
  team2Name: string,
): string => {
  if (Math.abs(spread) < 0.5) {
    return 'PK';
  }
  const favoredTeam = spread > 0 ? team1Name : team2Name;
  return `${favoredTeam} ${Math.abs(spread)}`;
};

/**
 * Format over/under total
 *
 * @param total - Total points line
 * @returns Formatted total string
 *
 * @example
 * ```ts
 * formatTotalDisplay(45.5) // '45.5'
 * formatTotalDisplay(50) // '50'
 * ```
 */
export const formatTotalDisplay = (total: number): string => {
  return total.toString();
};
