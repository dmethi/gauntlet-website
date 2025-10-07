/**
 * Static variance data loader - replaces database queries
 * Uses pre-exported variance data stored in the repo
 */

import varianceData from './variance-data.json';
import type {
  DataQualityMetrics,
  PlayerVarianceRecord,
  PositionVarianceRecord,
  ProjectionErrorRecord,
  VarianceData,
} from './variance-data.types';
import { logger } from '../lib/logger';
import { Result, err, ok } from '../lib/result';
import { SimulationError } from '../models/matchup';
import {
  CURRENT_SCHEMA_VERSION,
  type SchemaValidation,
  validateSchemaVersion,
} from './schema-version';

// Type assertion for imported JSON
const data = varianceData as VarianceData;

// Validate schema version on module load
const validation: SchemaValidation = validateSchemaVersion(data.schemaVersion || 1);

if (!validation.valid) {
  throw new Error(`Incompatible variance data schema: ${validation.message}`);
}

if (validation.requiresMigration) {
  throw new Error(`Variance data requires migration: ${validation.message}`);
}

// In-memory caches
const positionVarianceCache = new Map<string, PositionVarianceRecord>();
const playerVarianceCache = new Map<string, PlayerVarianceRecord>();
const playerOutcomeCache = new Map<
  string,
  { outcomes: number[]; sampleSize: number; lastUpdated: Date }
>();
let projectionErrorIndex: Map<string, ProjectionErrorRecord[]> | null = null;

// Module-level state for lazy initialization
let initialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Build optimized lookup index for projection errors.
 * Groups by player ID for O(1) access.
 */
const buildProjectionErrorIndex = (): Map<string, ProjectionErrorRecord[]> => {
  const index = new Map<string, ProjectionErrorRecord[]>();

  for (const error of data.projectionErrors) {
    if (!index.has(error.playerId)) {
      index.set(error.playerId, []);
    }
    index.get(error.playerId)!.push(error);
  }

  // Sort each player's errors by season/week desc
  for (const [, errors] of index) {
    errors.sort((a, b) => {
      if (a.season !== b.season) {
        return b.season.localeCompare(a.season);
      }
      return b.week - a.week;
    });
  }

  return index;
};

/**
 * Async version of initializeCaches with parallel loading.
 */
const initializeCachesAsync = async (): Promise<void> => {
  // Load position, player variance, and projection errors in parallel
  await Promise.all([
    // Position variance indexing
    Promise.resolve().then(() => {
      for (const record of data.positionVariance) {
        const key = `${record.position}-${record.season}`;
        positionVarianceCache.set(key, record);
      }
    }),

    // Player variance indexing
    Promise.resolve().then(() => {
      for (const record of data.playerVariance) {
        const key = `${record.playerId}-${record.season}`;
        playerVarianceCache.set(key, record);
      }
    }),

    // Projection error indexing
    Promise.resolve().then(() => {
      projectionErrorIndex = buildProjectionErrorIndex();
    }),
  ]);

  logger.debug(
    {
      event: 'variance_caches_built',
      positionRecords: data.positionVariance.length,
      playerRecords: data.playerVariance.length,
      projectionErrors: data.projectionErrors.length,
      projectionErrorIndexSize: projectionErrorIndex?.size || 0,
    },
    'Variance caches built with indexes'
  );
};

/**
 * Lazy initialize variance data caches.
 * Only loads data on first use, not on module import.
 */
const ensureInitialized = async (): Promise<void> => {
  // Already initialized
  if (initialized) {
    return;
  }

  // Initialization in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = (async (): Promise<void> => {
    const startTime = Date.now();

    try {
      await initializeCachesAsync();
      initialized = true;

      const duration = Date.now() - startTime;
      logger.info(
        {
          event: 'variance_data_initialized',
          duration,
          version: data.version,
          schemaVersion: data.schemaVersion,
          currentSchemaVersion: CURRENT_SCHEMA_VERSION,
          exportedAt: data.exportedAt,
          season: data.season,
          weeksCovered: data.weeksCovered,
          positionVarianceCount: positionVarianceCache.size,
          playerVarianceCount: playerVarianceCache.size,
          projectionErrorIndexSize: projectionErrorIndex?.size || 0,
          memoryUsageMB: process.memoryUsage().heapUsed / 1024 / 1024,
          dataQuality: data.dataQuality,
        },
        `Variance data initialized in ${duration}ms`
      );
    } catch (error) {
      initialized = false;
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
};

/**
 * Get historical variance distribution for an NFL position.
 *
 * Loads position-level variance from static JSON data with season fallback
 * (tries 2025 → 2024 → 2023). Returns synthetic normal distribution based on
 * historical mean error and standard deviation.
 *
 * @param position - NFL position code (QB, RB, WR, TE, K, DEF)
 *
 * @returns Promise<{ outcomes: number[], sampleSize: number }> where:
 *   - outcomes: Array of relative outcome multipliers (actual/projected)
 *   - sampleSize: Number of historical games this distribution is based on
 *
 * @example
 * const qbVariance = await getPositionDistribution('QB');
 * console.log(`QB variance based on ${qbVariance.sampleSize} games`);
 * console.log(`Sample outcome: ${qbVariance.outcomes[0]}`); // e.g., 0.85 (15% under)
 */
export const getPositionDistribution = async (
  position: string
): Promise<{
  outcomes: number[];
  sampleSize: number;
}> => {
  // Ensure data is loaded
  await ensureInitialized();

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
  logger.warn(
    {
      event: 'position_distribution_fallback',
      position,
      seasonsAttempted: seasons,
    },
    `No variance data found for ${position}, using default distribution`
  );
  return getDefaultPositionVariance(position);
};

/**
 * Get historical outcome distribution for a specific player.
 *
 * Loads player-specific variance from last 16 weeks of projection error data.
 * Normalizes outcomes around median to preserve variance while removing mean bias.
 * Returns empty if fewer than 4 games available.
 *
 * @param playerId - Sleeper player ID
 *
 * @returns Promise<{ outcomes: number[], sampleSize: number }> where:
 *   - outcomes: Array of normalized relative outcome multipliers
 *   - sampleSize: Number of recent games in distribution (0 if insufficient data)
 *
 * @example
 * const mahomesData = await getPlayerOutcomes('4866');
 * if (mahomesData.sampleSize >= 8) {
 *   console.log(`Mahomes has ${mahomesData.sampleSize} games of history`);
 *   console.log(`Sample outcomes: ${mahomesData.outcomes.slice(0, 3)}`);
 * }
 */
export const getPlayerOutcomes = async (
  playerId: string
): Promise<{
  outcomes: number[];
  sampleSize: number;
}> => {
  // Ensure data is loaded
  await ensureInitialized();

  // Check cache first (expire after 1 hour)
  const cached = playerOutcomeCache.get(playerId);
  if (cached && Date.now() - cached.lastUpdated.getTime() < 60 * 60 * 1000) {
    return cached;
  }

  try {
    // Use pre-built index for O(1) lookup instead of filter
    const errors = projectionErrorIndex?.get(playerId)?.slice(0, 16) || [];

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
    logger.error(
      {
        event: 'player_outcomes_error',
        playerId: playerId.slice(0, 8),
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to get player outcomes'
    );
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
 * Get metadata about the loaded variance data.
 *
 * Returns information about when the variance data was exported, version information,
 * and how many records are available for each data type.
 *
 * @returns Object containing:
 *   - version: Semantic version of data format
 *   - schemaVersion: Schema version number
 *   - exportedAt: ISO timestamp of when data was last exported
 *   - season: NFL season
 *   - weeksCovered: Array of weeks included in this export
 *   - positionVarianceCount: Number of position variance records loaded
 *   - playerVarianceCount: Number of player variance records loaded
 *   - projectionErrorCount: Number of projection error records loaded
 *   - dataQuality: Quality metrics for the variance data
 *
 * @example
 * const info = getDataInfo();
 * console.log(`Variance data v${info.version} (schema v${info.schemaVersion})`);
 * console.log(`Season ${info.season}, weeks: ${info.weeksCovered.join(', ')}`);
 * console.log(`Exported: ${info.exportedAt}`);
 * console.log(`Positions: ${info.positionVarianceCount}`);
 * console.log(`Players: ${info.playerVarianceCount}`);
 * console.log(`Data quality: ${info.dataQuality.playersWithVariance}/${info.dataQuality.totalPlayers} players with variance`);
 */
export const getDataInfo = (): {
  version: string;
  schemaVersion: number;
  exportedAt: string;
  season: number;
  weeksCovered: number[];
  positionVarianceCount: number;
  playerVarianceCount: number;
  projectionErrorCount: number;
  dataQuality: DataQualityMetrics;
  initialized: boolean;
} => {
  return {
    version: data.version,
    schemaVersion: data.schemaVersion,
    exportedAt: data.exportedAt,
    season: data.season,
    weeksCovered: data.weeksCovered,
    positionVarianceCount: data.positionVariance.length,
    playerVarianceCount: data.playerVariance.length,
    projectionErrorCount: data.projectionErrors.length,
    dataQuality: data.dataQuality,
    initialized, // Add initialization status
  };
};

/**
 * Pre-warm variance data caches for optimal performance.
 *
 * Call during application startup to avoid first-request latency.
 * Loads and indexes all variance data in parallel.
 *
 * Performance characteristics:
 * - Cold start: <100ms
 * - Memory usage: <50MB
 * - Subsequent lookups: <10ms
 *
 * @example
 * // Server startup
 * import { prewarmVarianceData } from '@gauntlet/sim-engine';
 *
 * async function startServer() {
 *   console.log('Warming variance data...');
 *   await prewarmVarianceData();
 *   console.log('✅ Variance data ready');
 *
 *   // Start server
 *   app.listen(3000);
 * }
 */
export const prewarmVarianceData = async (): Promise<void> => {
  await ensureInitialized();
};

/**
 * Safe version of getPositionDistribution.
 * Returns Result instead of throwing exceptions.
 *
 * @param position - NFL position code (QB, RB, WR, TE, K, DEF)
 *
 * @returns Promise<Result<{ outcomes: number[], sampleSize: number }, SimulationError>>
 *
 * @example
 * const result = await getPositionDistributionSafe('QB');
 * if (result.ok) {
 *   console.log(`QB variance: ${result.value.sampleSize} games`);
 * } else {
 *   console.error('Failed to load distribution:', result.error.message);
 * }
 */
export const getPositionDistributionSafe = async (
  position: string
): Promise<Result<{ outcomes: number[]; sampleSize: number }, SimulationError>> => {
  try {
    const distribution = await getPositionDistribution(position);
    return ok(distribution);
  } catch (error) {
    return err(new SimulationError(`Failed to get position distribution for ${position}`, error));
  }
};

/**
 * Safe version of getPlayerOutcomes.
 * Returns Result instead of throwing exceptions.
 *
 * @param playerId - Sleeper player ID
 *
 * @returns Promise<Result<{ outcomes: number[], sampleSize: number }, SimulationError>>
 *
 * @example
 * const result = await getPlayerOutcomesSafe('4866');
 * if (result.ok) {
 *   console.log(`Player outcomes: ${result.value.sampleSize} games`);
 * } else {
 *   console.error('Failed to load outcomes:', result.error.message);
 * }
 */
export const getPlayerOutcomesSafe = async (
  playerId: string
): Promise<Result<{ outcomes: number[]; sampleSize: number }, SimulationError>> => {
  try {
    const outcomes = await getPlayerOutcomes(playerId);
    return ok(outcomes);
  } catch (error) {
    return err(new SimulationError(`Failed to get player outcomes for ${playerId}`, error));
  }
};
