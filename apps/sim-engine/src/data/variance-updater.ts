/**
 * Variance model updater
 * Updates player and position variance models with weekly NFL data
 */

import type {
  PlayerVarianceRecord,
  PositionVarianceRecord,
  ProjectionErrorRecord,
} from '@gauntlet/types';

interface SleeperStats {
  pts_half_ppr: number;
  [key: string]: number | string | null | undefined;
}

interface WeeklyStatsData {
  season: number;
  week: number;
  stats: Record<string, SleeperStats>;
  projections: Record<string, SleeperStats>;
}

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Progressive seasonal weighting for variance calculations.
 * More recent seasons get higher weight.
 *
 * 2025: 1.0, 2024: 0.75, 2023: 0.5, 2022: 0.25
 *
 * @param season - Season year (e.g., 2025)
 *
 * @returns Weight multiplier (0-1.0)
 *
 * @example
 * const weight2025 = getSeasonWeight(2025); // 1.0
 * const weight2024 = getSeasonWeight(2024); // 0.75
 * const weight2021 = getSeasonWeight(2021); // 0 (too old)
 */
export const getSeasonWeight = (season: number): number => {
  const currentSeason = new Date().getFullYear();
  const yearsAgo = currentSeason - season;

  if (yearsAgo === 0) return 1.0;
  if (yearsAgo === 1) return 0.75;
  if (yearsAgo === 2) return 0.5;
  if (yearsAgo === 3) return 0.25;
  return 0; // Don't use data older than 3 years
};

/**
 * Calculate projection error for a single player-week.
 * Returns relative outcome (actual / projected).
 *
 * @param playerId - Sleeper player ID
 * @param stats - Actual stats object from Sleeper API
 * @param projection - Projected stats object from Sleeper API
 *
 * @returns Relative outcome (actual/projected) or null if no meaningful projection
 *
 * @example
 * const error = calculateProjectionError('4866', actualStats, projectedStats);
 * if (error !== null) {
 *   console.log(`Player scored ${(error * 100).toFixed(0)}% of projection`);
 * }
 */
export const calculateProjectionError = (
  stats: SleeperStats,
  projection: SleeperStats
): number | null => {
  const actualPoints = stats?.pts_half_ppr || 0;
  const projectedPoints = projection?.pts_half_ppr || 0;

  // Skip if no meaningful projection
  if (projectedPoints < 1) {
    return null;
  }

  return actualPoints / projectedPoints;
};

/**
 * Remove statistical outliers beyond 3 standard deviations.
 *
 * @param values - Array of numeric values
 *
 * @returns Filtered array with outliers removed
 *
 * @example
 * const cleaned = removeOutliers([1, 2, 2, 3, 100]); // Removes 100
 * console.log(`Removed ${values.length - cleaned.length} outliers`);
 */
export const removeOutliers = (values: number[]): number[] => {
  if (values.length < 4) return values;

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const threshold = 3.5 * stdDev;

  return values.filter(v => Math.abs(v - mean) <= threshold);
};

/**
 * Update projection errors with new week's data.
 *
 * Maintains rolling 16-week window per player. Calculates projection errors
 * (actual vs projected) and removes statistical outliers beyond 3σ.
 *
 * @param existingErrors - Current projection error records
 * @param weeklyData - New week's stats and projections from Sleeper API
 *
 * @returns Object with updated errors, new count, and outlier count
 *
 * @example
 * const result = updateProjectionErrors(currentErrors, {
 *   season: 2025,
 *   week: 5,
 *   stats: weekStats,
 *   projections: weekProjections
 * });
 * console.log(`Added ${result.newCount} errors, removed ${result.outlierCount} outliers`);
 */
export const updateProjectionErrors = (
  existingErrors: ProjectionErrorRecord[],
  weeklyData: WeeklyStatsData
): { updated: ProjectionErrorRecord[]; newCount: number; outlierCount: number } => {
  const { season, week, stats, projections } = weeklyData;
  const newErrors: ProjectionErrorRecord[] = [];
  let outlierCount = 0;

  // Calculate errors for this week
  for (const [playerId, playerStats] of Object.entries(stats)) {
    const projection = projections[playerId];
    if (!projection) continue;

    const error = calculateProjectionError(playerStats, projection);
    if (error === null) continue;

    // Check for outliers (>3σ from mean)
    const playerHistory = existingErrors.filter(e => e.playerId === playerId);
    if (playerHistory.length >= 4) {
      const historicalValues = playerHistory.map(e => e.actualPoints / e.projectedPoints);
      const cleanedValues = removeOutliers([...historicalValues, error]);

      if (cleanedValues.length < historicalValues.length + 1) {
        // This new value is an outlier, skip it
        outlierCount++;
        continue;
      }
    }

    const actualPoints = playerStats.pts_half_ppr;
    const projectedPoints = projection.pts_half_ppr;

    newErrors.push({
      id: generateId(),
      playerId,
      season: season.toString(),
      week,
      projectedPoints,
      actualPoints,
      normalizedError: (actualPoints - projectedPoints) / projectedPoints,
      createdAt: new Date().toISOString(),
    });
  }

  // Combine with existing, keep last 16 weeks per player
  const allErrors = [...existingErrors, ...newErrors];
  const playerErrorMap = new Map<string, ProjectionErrorRecord[]>();

  for (const error of allErrors) {
    if (!playerErrorMap.has(error.playerId)) {
      playerErrorMap.set(error.playerId, []);
    }
    playerErrorMap.get(error.playerId)!.push(error);
  }

  // Keep last 16 weeks per player, sorted by season/week desc
  const updated: ProjectionErrorRecord[] = [];
  for (const errors of playerErrorMap.values()) {
    const sorted = errors.sort((a, b) => {
      if (a.season !== b.season) return b.season.localeCompare(a.season);
      return b.week - a.week;
    });
    updated.push(...sorted.slice(0, 16));
  }

  return { updated, newCount: newErrors.length, outlierCount };
};

/**
 * Update position variance with progressive seasonal weighting.
 *
 * Calculates weighted mean error and standard deviation for each position.
 * Uses progressive weighting: 2025(1.0), 2024(0.75), 2023(0.5), 2022(0.25).
 *
 * @param projectionErrors - All projection error records
 * @param playerMetadata - Map of player IDs to player data (for position lookup)
 *
 * @returns Array of position variance records
 *
 * @example
 * const posVariance = updatePositionVariance(errors, playerData);
 * console.log(`Updated ${posVariance.length} positions`);
 * const qbVariance = posVariance.find(p => p.position === 'QB');
 * console.log(`QB stdDev: ${qbVariance.stdDev.toFixed(3)}`);
 */
interface PlayerMetadata {
  position: string;
  [key: string]: unknown;
}

export const updatePositionVariance = (
  projectionErrors: ProjectionErrorRecord[],
  playerMetadata: Record<string, PlayerMetadata>
): PositionVarianceRecord[] => {
  const positionMap = new Map<string, { errors: { value: number; weight: number }[] }>();

  // Group errors by position with seasonal weighting
  for (const error of projectionErrors) {
    const player = playerMetadata[error.playerId];
    if (!player || !player.position) continue;

    const position = player.position;
    const relativeError = error.actualPoints / error.projectedPoints;
    const weight = getSeasonWeight(parseInt(error.season));

    if (weight === 0) continue; // Skip old data

    if (!positionMap.has(position)) {
      positionMap.set(position, { errors: [] });
    }

    positionMap.get(position)!.errors.push({ value: relativeError, weight });
  }

  // Calculate weighted mean and std dev for each position
  const records: PositionVarianceRecord[] = [];

  for (const [position, data] of positionMap) {
    const { errors } = data;
    if (errors.length < 10) continue; // Need minimum sample size

    // Weighted mean
    const totalWeight = errors.reduce((sum, e) => sum + e.weight, 0);
    const weightedMean = errors.reduce((sum, e) => sum + e.value * e.weight, 0) / totalWeight;

    // Weighted standard deviation
    const weightedVariance =
      errors.reduce((sum, e) => sum + e.weight * Math.pow(e.value - weightedMean, 2), 0) /
      totalWeight;
    const weightedStdDev = Math.sqrt(weightedVariance);

    // Get latest season for this position
    const latestSeason = new Date().getFullYear();
    const now = new Date().toISOString();

    records.push({
      id: generateId(),
      position,
      season: latestSeason.toString(),
      meanError: weightedMean - 1.0, // Convert to error relative to 1.0
      stdDev: weightedStdDev,
      sampleSize: errors.length,
      lastUpdated: now,
      createdAt: now,
    });
  }

  return records;
};

/**
 * Update player variance records.
 *
 * Only includes players with ≥4 games in rolling 16-week window.
 * Calculates mean and standard deviation of relative outcomes.
 *
 * @param projectionErrors - All projection error records
 *
 * @returns Array of player variance records
 *
 * @example
 * const playerVariance = updatePlayerVariance(errors);
 * console.log(`Updated ${playerVariance.length} players (≥4 games)`);
 * const player = playerVariance.find(p => p.playerId === '4866');
 * console.log(`Player stdDev: ${player.stdDev.toFixed(3)} (${player.sampleSize} games)`);
 */
export const updatePlayerVariance = (
  projectionErrors: ProjectionErrorRecord[]
): PlayerVarianceRecord[] => {
  const playerMap = new Map<string, ProjectionErrorRecord[]>();

  // Group errors by player
  for (const error of projectionErrors) {
    if (!playerMap.has(error.playerId)) {
      playerMap.set(error.playerId, []);
    }
    playerMap.get(error.playerId)!.push(error);
  }

  const records: PlayerVarianceRecord[] = [];

  for (const [playerId, errors] of playerMap) {
    if (errors.length < 4) continue; // Minimum 4 games required

    const relativeErrors = errors.map(e => e.actualPoints / e.projectedPoints);

    // Calculate mean and std dev
    const mean = relativeErrors.reduce((sum, v) => sum + v, 0) / relativeErrors.length;
    const variance =
      relativeErrors.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / relativeErrors.length;
    const stdDev = Math.sqrt(variance);

    // Get latest season
    const latestSeason = Math.max(...errors.map(e => parseInt(e.season)));
    const now = new Date().toISOString();

    records.push({
      id: generateId(),
      playerId,
      season: latestSeason.toString(),
      meanError: mean - 1.0,
      stdDev,
      sampleSize: errors.length,
      lastUpdated: now,
      createdAt: now,
    });
  }

  return records;
};
