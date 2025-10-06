/**
 * Static variance data loader - replaces database queries
 * Uses pre-exported variance data stored in the repo
 */

import varianceData from './variance-data.json';
import type {
  PlayerVarianceRecord,
  PositionVarianceRecord,
  ProjectionErrorRecord,
  VarianceData,
} from './variance-data.types';

// Type assertion for imported JSON
const data = varianceData as VarianceData;

// In-memory caches
const positionVarianceCache = new Map<string, PositionVarianceRecord>();
const playerVarianceCache = new Map<string, PlayerVarianceRecord>();
const playerOutcomeCache = new Map<
  string,
  { outcomes: number[]; sampleSize: number; lastUpdated: Date }
>();

// Initialize caches
const initializeCaches = (): void => {
  // Index position variance by position-season key
  for (const record of data.positionVariance) {
    const key = `${record.position}-${record.season}`;
    positionVarianceCache.set(key, record);
  }

  // Index player variance by playerId-season key
  for (const record of data.playerVariance) {
    const key = `${record.playerId}-${record.season}`;
    playerVarianceCache.set(key, record);
  }

  console.log(`✅ Loaded ${data.positionVariance.length} position variance records`);
  console.log(`✅ Loaded ${data.playerVariance.length} player variance records`);
  console.log(`✅ Loaded ${data.projectionErrors.length} projection error records`);
};

// Initialize on module load
initializeCaches();

/**
 * Get position distribution from static data
 * Replaces: prisma.positionVariance.findUnique()
 */
export const getPositionDistribution = async (
  position: string
): Promise<{
  outcomes: number[];
  sampleSize: number;
}> => {
  // Try current season first, fallback to most recent
  const seasons = ['2025', '2024', '2023'];

  for (const season of seasons) {
    const key = `${position}-${season}`;
    const record = positionVarianceCache.get(key);

    if (record && record.sampleSize > 0) {
      // Generate synthetic outcomes based on mean and stdDev
      const outcomes = generateNormalDistribution(
        record.meanError,
        record.stdDev,
        record.sampleSize
      );
      return { outcomes, sampleSize: record.sampleSize };
    }
  }

  // Fallback to default variance if no data found
  console.warn(`No position variance data found for ${position}, using defaults`);
  return getDefaultPositionVariance(position);
};

/**
 * Get player outcomes from static projection error data
 * Replaces: prisma.projectionError.findMany()
 */
export const getPlayerOutcomes = async (
  playerId: string
): Promise<{
  outcomes: number[];
  sampleSize: number;
}> => {
  // Check cache first (expire after 1 hour)
  const cached = playerOutcomeCache.get(playerId);
  if (cached && Date.now() - cached.lastUpdated.getTime() < 60 * 60 * 1000) {
    return cached;
  }

  try {
    // Get player's recent outcomes from static data
    const errors = data.projectionErrors
      .filter(e => e.playerId === playerId)
      .sort((a, b) => {
        // Sort by season desc, then week desc
        if (a.season !== b.season) {
          return b.season.localeCompare(a.season);
        }
        return b.week - a.week;
      })
      .slice(0, 16); // Take last 16 weeks

    if (errors.length < 4) {
      return { outcomes: [], sampleSize: 0 }; // Not enough data
    }

    // Calculate relative outcomes
    const rawOutcomes = errors
      .filter((e: ProjectionErrorRecord) => e.projectedPoints > 0)
      .map((e: ProjectionErrorRecord) => e.actualPoints / e.projectedPoints);

    // Normalize around 1.0 to preserve variance but remove mean bias
    const sorted = [...rawOutcomes].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const normalizationFactor = 1.0 / median;

    const outcomes = rawOutcomes
      .map((outcome: number) => outcome * normalizationFactor)
      .sort((a: number, b: number) => a - b);

    // Cache the result
    const result = {
      outcomes,
      sampleSize: outcomes.length,
      lastUpdated: new Date(),
    };
    playerOutcomeCache.set(playerId, result);

    return result;
  } catch (error) {
    console.error('Error getting player outcomes:', error);
    return { outcomes: [], sampleSize: 0 };
  }
};

/**
 * Generate synthetic normal distribution outcomes
 */
const generateNormalDistribution = (mean: number, stdDev: number, sampleSize: number): number[] => {
  const outcomes: number[] = [];
  const targetSize = Math.min(sampleSize, 100); // Cap at 100 for performance

  for (let i = 0; i < targetSize; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    // Transform to desired mean and stdDev, then convert to relative outcome
    const value = 1 + mean + z0 * stdDev;
    outcomes.push(Math.max(0.1, value)); // Ensure positive values
  }

  return outcomes.sort((a, b) => a - b);
};

/**
 * Default position variance for fallback
 */
const getDefaultPositionVariance = (
  position: string
): { outcomes: number[]; sampleSize: number } => {
  const defaults: Record<string, { mean: number; stdDev: number; sampleSize: number }> = {
    QB: { mean: 0.05, stdDev: 0.25, sampleSize: 50 },
    RB: { mean: 0.0, stdDev: 0.35, sampleSize: 50 },
    WR: { mean: 0.0, stdDev: 0.4, sampleSize: 50 },
    TE: { mean: 0.0, stdDev: 0.45, sampleSize: 50 },
    K: { mean: 0.0, stdDev: 0.3, sampleSize: 50 },
    DEF: { mean: 0.0, stdDev: 0.5, sampleSize: 50 },
  };

  const config = defaults[position] || defaults['RB'];
  const outcomes = generateNormalDistribution(config.mean, config.stdDev, config.sampleSize);

  return { outcomes, sampleSize: config.sampleSize };
};

/**
 * Get data export info
 */
export const getDataInfo = (): {
  exportedAt: string;
  positionVarianceCount: number;
  playerVarianceCount: number;
  projectionErrorCount: number;
} => {
  return {
    exportedAt: data.exportedAt,
    positionVarianceCount: data.positionVariance.length,
    playerVarianceCount: data.playerVariance.length,
    projectionErrorCount: data.projectionErrors.length,
  };
};
