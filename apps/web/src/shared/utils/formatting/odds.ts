/**
 * Format betting odds (American format)
 * Positive odds: +150, Negative odds: -200
 */
export const formatOdds = (odds: number): string => {
  return odds > 0 ? `+${odds}` : `${odds}`;
};

/**
 * Format moneyline with proper sign
 */
export const formatMoneyline = (value: number): string => {
  return formatOdds(Math.round(value));
};
