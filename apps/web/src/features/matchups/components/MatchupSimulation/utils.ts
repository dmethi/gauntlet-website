import type { SimulationData } from '@/features/matchups/types';

/**
 * Formats a win probability as a percentage string
 * @param probability - Win probability (0-1)
 * @returns Formatted percentage string (e.g., "65.2%")
 *
 * @example
 * formatWinProbability(0.652) // "65.2%"
 */
export const formatWinProbability = (probability: number): string => {
  return `${(probability * 100).toFixed(1)}%`;
};

/**
 * Calculate win probability based on a spread margin
 * @param spread - Point spread (positive = team1 favored, negative = team2 favored)
 * @param simulationData - Simulation results
 * @returns Win probabilities for both teams
 *
 * @example
 * calculateWinProbFromSpread(3.5, simulationData)
 * // { team1: 0.65, team2: 0.35 }
 */
export const calculateWinProbFromSpread = (
  spread: number,
  simulationData: SimulationData | null,
): { team1: number; team2: number } => {
  if (!simulationData) return { team1: 0.5, team2: 0.5 };

  // Calculate probability of winning by the specified margin or more
  const meanMargin = simulationData.team1Scores.mean - simulationData.team2Scores.mean;
  const marginStdDev = (simulationData.team1Scores.p90 - simulationData.team1Scores.p10) / 2.56; // Approximate std dev

  if (spread === 0) {
    // At push, return overall win probabilities
    return {
      team1: simulationData.team1WinPct,
      team2: simulationData.team2WinPct,
    };
  }

  // Calculate z-score for the margin
  let team1Prob, team2Prob;

  if (spread > 0) {
    // Team1 winning by 'spread' points or more
    const zScore = (spread - meanMargin) / marginStdDev;
    team1Prob = Math.max(0.01, 0.5 - zScore * 0.34); // Normal distribution approximation
    team2Prob = Math.max(0.01, 1 - team1Prob - 0.02); // Leave small gap for ties
  } else {
    // Team2 winning by abs(spread) points or more
    const absSpread = Math.abs(spread);
    const zScore = (absSpread + meanMargin) / marginStdDev;
    team2Prob = Math.max(0.01, 0.5 - zScore * 0.34);
    team1Prob = Math.max(0.01, 1 - team2Prob - 0.02);
  }

  // Normalize to ensure they sum close to 1
  const total = team1Prob + team2Prob;
  team1Prob = team1Prob / total;
  team2Prob = team2Prob / total;

  return {
    team1: Math.min(0.99, Math.max(0.01, team1Prob)),
    team2: Math.min(0.99, Math.max(0.01, team2Prob)),
  };
};

/**
 * Calculate over/under probabilities
 * @param simulationData - Simulation results
 * @returns Over/under probabilities and total line
 *
 * @example
 * getOverUnderDisplay(simulationData)
 * // { over: 0.55, under: 0.45, total: 245.5 }
 */
export const getOverUnderDisplay = (
  simulationData: SimulationData | null,
): { over: number; under: number; total: number } => {
  if (!simulationData) return { over: 0.5, under: 0.5, total: 250 };

  const projectedTotal = simulationData.team1Scores.mean + simulationData.team2Scores.mean;
  const lineTotal = simulationData.impliedOdds.total;

  // Simple linear model based on difference from line
  const diff = projectedTotal - lineTotal;
  let overPct = 0.5 + diff * 0.01; // ~1% per point difference
  overPct = Math.min(0.95, Math.max(0.05, overPct));

  return { over: overPct, under: 1 - overPct, total: lineTotal };
};

/**
 * Get color class for win probability display
 * @param prob - Win probability (0-1)
 * @returns Tailwind color class string
 *
 * @example
 * getWinProbColor(0.75) // "text-green-600 dark:text-green-400"
 */
export const getWinProbColor = (prob: number): string => {
  if (prob > 0.65) return 'text-green-600 dark:text-green-400';
  if (prob > 0.55) return 'text-yellow-600 dark:text-yellow-400';
  if (prob > 0.45) return 'text-yellow-500 dark:text-yellow-500';
  if (prob > 0.35) return 'text-orange-500 dark:text-orange-400';
  return 'text-red-500 dark:text-red-400';
};

/**
 * Format margin for display
 * @param margin - Point margin
 * @param team1Name - Team 1 name
 * @param team2Name - Team 2 name
 * @returns Formatted margin string
 *
 * @example
 * formatMargin(0, "Team A", "Team B") // "Win Outright"
 * formatMargin(3.5, "Team A", "Team B") // "Team A by 3.5+"
 */
export const formatMargin = (margin: number, team1Name: string, team2Name: string): string => {
  if (margin === 0) return 'Win Outright';
  if (margin > 0) return `${team1Name} by ${margin}+`;
  return `${team2Name} by ${Math.abs(margin)}+`;
};

/**
 * Convert probability to moneyline odds
 * @param probability - Win probability (0-1)
 * @returns Moneyline odds (e.g., -150, +200)
 *
 * @example
 * probToMoneyline(0.65) // -186
 * probToMoneyline(0.35) // +186
 */
export const probToMoneyline = (probability: number): number => {
  if (probability > 0.5) {
    return -Math.round((probability / (1 - probability)) * 100);
  }
  return Math.round(((1 - probability) / probability) * 100);
};
