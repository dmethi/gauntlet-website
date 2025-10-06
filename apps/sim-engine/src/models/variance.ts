// Import static variance data loader instead of Prisma
import {
  getPlayerOutcomes as getPlayerOutcomesStatic,
  getPositionDistribution as getPositionDistributionStatic,
} from '../data/variance-loader';
import { logger } from '../lib/logger';
import type { Metrics } from '@gauntlet/types';
import { Result, err, ok } from '../lib/result';
import { SimulationError } from './matchup';
import {
  ValidationError,
  validateGameProgress,
  validatePosition,
  validateProjection,
} from '../lib/validation';

/**
 * Position-specific standard deviation values based on fantasy football research
 * QB: Most consistent due to high volume and predictable usage
 * RB: Highest variance due to game script, injury, touchdown variance
 * WR: High variance due to target volatility and big play dependency
 * TE: More consistent than WR, less target competition
 * K: Moderate variance, weather/game script dependent
 * DST: High variance due to turnover and TD randomness
 */
const getPositionStdDev = (position: string): number => {
  const positionVariance: Record<string, number> = {
    QB: 0.28, // Most consistent - high volume, predictable usage
    RB: 0.48, // Highest variance - game script, injury, TD dependent
    WR: 0.42, // High variance - target volatility, big plays
    TE: 0.36, // More consistent than WR - less competition
    K: 0.32, // Moderate - weather and game script dependent
    DEF: 0.52, // Very high - turnovers and TDs are random
    DST: 0.52, // Same as DEF
  };

  return positionVariance[position] || 0.4; // Default fallback
};

// Cache historical distributions to avoid repeated DB hits
const positionDistributionCache = new Map<
  string,
  {
    outcomes: number[]; // Relative outcomes (actual/projected)
    sampleSize: number;
    lastUpdated: Date;
  }
>();

// Cache player-specific outcomes
const playerOutcomeCache = new Map<
  string,
  {
    outcomes: number[]; // Relative outcomes (actual/projected)
    sampleSize: number;
    lastUpdated: Date;
  }
>();

/**
 * Get historical distribution of outcomes for a position
 */
const getPositionDistribution = async (
  position: string,
  metrics?: Metrics
): Promise<{
  outcomes: number[]; // Relative outcomes (actual/projected)
  sampleSize: number;
}> => {
  // Check cache first (expire after 1 hour)
  const cached = positionDistributionCache.get(position);
  if (cached && Date.now() - cached.lastUpdated.getTime() < 60 * 60 * 1000) {
    if (metrics) {
      metrics.increment('variance.position_distribution.cache_hit');
    }
    return cached;
  }

  if (metrics) {
    metrics.increment('variance.position_distribution.cache_miss');
  }

  try {
    // Use static data loader
    const result = await getPositionDistributionStatic(position);

    // Cache the result
    const cachedResult = {
      ...result,
      lastUpdated: new Date(),
    };
    positionDistributionCache.set(position, cachedResult);

    return result;
  } catch (error) {
    logger.error(
      {
        event: 'position_distribution_error',
        position,
        error: error instanceof Error ? error.message : String(error),
      },
      `Failed to get ${position} distribution, using defaults`
    );
    // Return position-specific distribution with realistic variance
    const positionStdDev = getPositionStdDev(position);
    const outcomes = [];
    for (let i = 0; i < 1000; i++) {
      // Generate normal distribution with mean=1.0, position-specific std dev
      let u = 0,
        v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      const outcome = Math.max(0, 1.0 + z * positionStdDev);
      outcomes.push(outcome);
    }
    return {
      outcomes: outcomes.sort((a, b) => a - b),
      sampleSize: 0,
    };
  }
};

/**
 * Get historical outcomes for a specific player
 */
const getPlayerOutcomes = async (
  playerId: string,
  metrics?: Metrics
): Promise<{
  outcomes: number[]; // Relative outcomes (actual/projected)
  sampleSize: number;
}> => {
  // Check cache first (expire after 1 hour)
  const cached = playerOutcomeCache.get(playerId);
  if (cached && Date.now() - cached.lastUpdated.getTime() < 60 * 60 * 1000) {
    if (metrics) {
      metrics.increment('variance.player_outcomes.cache_hit');
    }
    return cached;
  }

  if (metrics) {
    metrics.increment('variance.player_outcomes.cache_miss');
  }

  try {
    // Use static data loader
    const result = await getPlayerOutcomesStatic(playerId);

    // Cache the result
    const cachedResult = {
      ...result,
      lastUpdated: new Date(),
    };
    playerOutcomeCache.set(playerId, cachedResult);

    return result;
  } catch (error) {
    logger.error(
      {
        event: 'player_outcomes_error',
        playerId: playerId.slice(0, 8), // Truncate for log brevity
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to get player outcomes, returning empty'
    );
    return { outcomes: [], sampleSize: 0 };
  }
};

/**
 * Sample randomly from an array of values
 */
const randomSample = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Simulate a single score for a player using Monte Carlo sampling.
 *
 * Samples from historical variance distributions (position-level only, player-specific
 * data temporarily disabled due to outliers). Uses async operations to fetch
 * distributions on each call.
 *
 * @param playerId - Sleeper player ID to sample for
 * @param position - NFL position (QB, RB, WR, TE, K, DEF)
 * @param projection - Fantasy point projection for the player
 * @param gameProgress - Game completion 0-1, reduces variance for live games (default: 0)
 *
 * @returns Promise<number> - Simulated fantasy score for this player
 *
 * @throws Error if projection < 0 or gameProgress not in [0, 1]
 *
 * @example
 * // Pre-game simulation
 * const score = await simulatePlayerScore('4866', 'QB', 24.5, 0);
 * console.log(`Simulated QB score: ${score.toFixed(1)}`);
 *
 * @example
 * // Live game simulation (75% complete)
 * const score = await simulatePlayerScore('4866', 'QB', 24.5, 0.75);
 * console.log(`Updated score with reduced variance: ${score.toFixed(1)}`);
 */
export const simulatePlayerScore = async (
  playerId: string,
  position: string,
  projection: number,
  gameProgress: number = 0
): Promise<number> => {
  // Validate inputs
  if (projection < 0) {
    throw new Error(`Invalid projection: ${projection}`);
  }
  if (gameProgress < 0 || gameProgress > 1) {
    throw new Error(`Invalid game progress: ${gameProgress}`);
  }

  // Get historical distributions
  const [positionDist, playerOutcomes] = await Promise.all([
    getPositionDistribution(position),
    getPlayerOutcomes(playerId),
  ]);

  // TEMPORARY FIX: Disable player-specific data since it contains outliers
  // Always use position distribution for now until we clean historical data
  const usePlayerData = false; // was: playerOutcomes.sampleSize >= 8;

  // Sample from the appropriate distribution
  let relativeOutcome: number;
  if (usePlayerData) {
    // 70% weight to player-specific outcomes if we have enough data
    relativeOutcome =
      Math.random() < 0.7
        ? randomSample(playerOutcomes.outcomes)
        : randomSample(positionDist.outcomes);
  } else {
    // Use clean position distribution only
    relativeOutcome = randomSample(positionDist.outcomes);
  }

  // If game in progress, reduce variance
  if (gameProgress > 0) {
    const remainingVariance = 1 - gameProgress;
    relativeOutcome = 1 + (relativeOutcome - 1) * remainingVariance;
  }

  // Apply the sampled relative outcome to the projection
  return projection * relativeOutcome;
};

/**
 * Simulate multiple scores for a player to generate outcome distribution.
 *
 * Runs 1,000 Monte Carlo iterations to produce percentile-based score ranges.
 * Useful for displaying player projections with uncertainty bounds.
 *
 * @param playerId - Sleeper player ID to simulate
 * @param position - NFL position (QB, RB, WR, TE, K, DEF)
 * @param projection - Fantasy point projection for the player
 * @param iterations - Number of simulations to run (default: 1000)
 *
 * @returns Promise containing score distribution:
 *   - p10, p25, median, p75, p90: Percentile values
 *   - mean: Average simulated score
 *   - positionDist: Sample size of position-level data
 *   - playerOutcomes: Sample size of player-specific data
 *
 * @example
 * const distribution = await simulatePlayerRange('4866', 'QB', 24.5);
 * console.log(`Projection: ${distribution.median.toFixed(1)} pts`);
 * console.log(`Range: ${distribution.p10.toFixed(1)} - ${distribution.p90.toFixed(1)} pts`);
 */
export const simulatePlayerRange = async (
  playerId: string,
  position: string,
  projection: number,
  iterations: number = 1000
): Promise<{
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  mean: number;
  positionDist: { sampleSize: number };
  playerOutcomes: { sampleSize: number };
}> => {
  const scores: number[] = [];

  // Get distributions for reporting
  const [positionDist, playerOutcomes] = await Promise.all([
    getPositionDistribution(position),
    getPlayerOutcomes(playerId),
  ]);

  for (let i = 0; i < iterations; i++) {
    scores.push(await simulatePlayerScore(playerId, position, projection));
  }

  scores.sort((a, b) => a - b);

  return {
    p10: scores[Math.floor(scores.length * 0.1)],
    p25: scores[Math.floor(scores.length * 0.25)],
    median: scores[Math.floor(scores.length * 0.5)],
    p75: scores[Math.floor(scores.length * 0.75)],
    p90: scores[Math.floor(scores.length * 0.9)],
    mean: scores.reduce((a, b) => a + b, 0) / scores.length,
    positionDist: { sampleSize: positionDist.sampleSize },
    playerOutcomes: { sampleSize: playerOutcomes.sampleSize },
  };
};

/**
 * Get variance model for a player using optimized synchronous sampling.
 *
 * Similar to simulatePlayerRange but uses buildSamplingContext for much faster
 * performance (no repeated async calls). Recommended for API endpoints and
 * batch operations.
 *
 * @param playerId - Sleeper player ID to simulate
 * @param position - NFL position (QB, RB, WR, TE, K, DEF)
 * @param projection - Fantasy point projection for the player
 *
 * @returns Promise containing score distribution:
 *   - p10, p25, median, p75, p90: Percentile values
 *   - mean: Average simulated score
 *   - positionDist: Sample size of position-level data
 *   - playerOutcomes: Sample size of player-specific data
 *
 * @example
 * const variance = await getVarianceModel('4866', 'QB', 24.5);
 * console.log(`QB Mahomes variance model:`);
 * console.log(`  Median: ${variance.median.toFixed(1)} pts`);
 * console.log(`  10th-90th: ${variance.p10.toFixed(1)} - ${variance.p90.toFixed(1)} pts`);
 */
export const getVarianceModel = async (
  playerId: string,
  position: string,
  projection: number
): Promise<{
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  mean: number;
  positionDist: { sampleSize: number };
  playerOutcomes: { sampleSize: number };
}> => {
  const scores: number[] = [];

  // Get distributions for reporting
  const [positionDist, playerOutcomes] = await Promise.all([
    getPositionDistribution(position),
    getPlayerOutcomes(playerId),
  ]);

  // Create proper sampling context once (much faster!)
  const ctx = await buildSamplingContext([playerId], [position]);

  // Use synchronous sampling (no more database calls)
  for (let i = 0; i < 1000; i++) {
    scores.push(samplePlayerScoreFromContext(ctx, playerId, position, projection));
  }

  scores.sort((a, b) => a - b);

  return {
    p10: scores[Math.floor(scores.length * 0.1)],
    p25: scores[Math.floor(scores.length * 0.25)],
    median: scores[Math.floor(scores.length * 0.5)],
    p75: scores[Math.floor(scores.length * 0.75)],
    p90: scores[Math.floor(scores.length * 0.9)],
    mean: scores.reduce((a, b) => a + b, 0) / scores.length,
    positionDist: { sampleSize: positionDist.sampleSize },
    playerOutcomes: { sampleSize: playerOutcomes.sampleSize },
  };
};

// Clean up caches periodically
setInterval(
  () => {
    positionDistributionCache.clear();
    playerOutcomeCache.clear();
  },
  60 * 60 * 1000
); // Every hour

/**
 * Prefetched sampling context for fast synchronous Monte Carlo loops
 */
import type { SamplingContext } from '@gauntlet/types';
export type { SamplingContext };

/**
 * Build a sampling context for fast synchronous Monte Carlo simulations.
 *
 * Pre-fetches historical variance distributions for all players and positions,
 * enabling 10,000+ iterations without repeated database/data lookups. This is
 * a critical performance optimization for real-time simulations.
 *
 * @param playerIds - Array of Sleeper player IDs to fetch variance data for
 * @param positions - Array of NFL positions (QB, RB, WR, TE, K, DEF)
 * @param metrics - Optional Metrics instance for tracking cache performance
 *
 * @returns Promise<SamplingContext> containing Maps of variance distributions:
 *   - positionToOutcomes: Position-level variance distributions
 *   - playerToOutcomes: Player-specific variance distributions
 *   - playerSampleCounts: Number of historical games per player
 *   - positionSampleCounts: Number of historical games per position
 *
 * @example
 * const playerIds = ['4866', '7564', '8110']; // Mahomes, McCaffrey, Jefferson
 * const positions = ['QB', 'RB', 'WR'];
 * const ctx = await buildSamplingContext(playerIds, positions);
 *
 * // Now use ctx for 10,000 fast synchronous samples
 * for (let i = 0; i < 10000; i++) {
 *   const score = samplePlayerScoreFromContext(ctx, '4866', 'QB', 24.5);
 * }
 */
export const buildSamplingContext = async (
  playerIds: string[],
  positions: string[],
  metrics?: Metrics
): Promise<SamplingContext> => {
  // Validate inputs
  if (!Array.isArray(playerIds) || playerIds.length === 0) {
    throw new ValidationError('playerIds must be non-empty array', 'playerIds', playerIds);
  }

  if (!Array.isArray(positions) || positions.length === 0) {
    throw new ValidationError('positions must be non-empty array', 'positions', positions);
  }

  // Validate all positions
  positions.forEach(pos => validatePosition(pos));

  const startTime = Date.now();

  const uniquePlayerIds = Array.from(new Set(playerIds));
  const uniquePositions = Array.from(new Set(positions));

  const positionToOutcomes = new Map<string, number[]>();
  const playerToOutcomes = new Map<string, number[]>();
  const playerSampleCounts = new Map<string, number>();
  const positionSampleCounts = new Map<string, number>();

  // Fetch position distributions with metrics
  await Promise.all(
    uniquePositions.map(async pos => {
      const dist = await getPositionDistribution(pos, metrics);
      positionToOutcomes.set(pos, dist.outcomes);
      positionSampleCounts.set(pos, dist.sampleSize);
    })
  );

  // Fetch player outcomes with metrics
  await Promise.all(
    uniquePlayerIds.map(async id => {
      const out = await getPlayerOutcomes(id, metrics);
      playerToOutcomes.set(id, out.outcomes);
      playerSampleCounts.set(id, out.sampleSize);
    })
  );

  // Track context build completion
  if (metrics) {
    metrics.recordDuration('sampling.context.build_duration', Date.now() - startTime);
    metrics.increment('sampling.context.players_fetched', uniquePlayerIds.length);
    metrics.increment('sampling.context.positions_fetched', uniquePositions.length);
  }

  return {
    positionToOutcomes,
    playerToOutcomes,
    playerSampleCounts,
    positionSampleCounts,
  };
};

/**
 * Fast synchronous player score sampling using pre-fetched variance context.
 *
 * Samples from historical variance distributions without async operations,
 * enabling high-performance Monte Carlo loops. Uses 70% player-specific
 * variance when available (≥8 games), otherwise falls back to position variance.
 *
 * @param ctx - Pre-built SamplingContext from buildSamplingContext()
 * @param playerId - Sleeper player ID to sample for
 * @param position - NFL position (QB, RB, WR, TE, K, DEF)
 * @param projection - Fantasy point projection for the player
 * @param gameProgress - Game completion 0-1, reduces variance for live games (default: 0)
 *
 * @returns number - Simulated fantasy score for this iteration
 *
 * @throws Error if projection < 0 or gameProgress not in [0, 1]
 *
 * @example
 * const ctx = await buildSamplingContext(['4866'], ['QB']);
 *
 * // Pre-game simulation (full variance)
 * const score1 = samplePlayerScoreFromContext(ctx, '4866', 'QB', 24.5, 0);
 *
 * // Live game simulation (65% complete, reduced variance)
 * const score2 = samplePlayerScoreFromContext(ctx, '4866', 'QB', 24.5, 0.65);
 */
export const samplePlayerScoreFromContext = (
  ctx: SamplingContext,
  playerId: string,
  position: string,
  projection: number,
  gameProgress: number = 0
): number => {
  // Use centralized validation
  validateProjection(projection, playerId);
  validateGameProgress(gameProgress);
  validatePosition(position);

  const positionOutcomes = ctx.positionToOutcomes.get(position) || [];
  const playerOutcomes = ctx.playerToOutcomes.get(playerId) || [];
  const _playerN = ctx.playerSampleCounts.get(playerId) || 0;

  // TEMPORARY FIX: Disable player-specific data since it contains outliers
  const usePlayerData = false; // was: _playerN >= 8 && playerOutcomes.length > 0;

  // Sample a relative outcome
  let relativeOutcome: number;
  if (usePlayerData) {
    // 70% weight player-specific
    const pickFromPlayer = Math.random() < 0.7 && playerOutcomes.length > 0;
    const src = pickFromPlayer && playerOutcomes.length > 0 ? playerOutcomes : positionOutcomes;
    const idx = Math.floor(Math.random() * src.length);
    relativeOutcome = src.length ? src[idx] : 1;
  } else {
    // Use clean position distribution only
    const idx = Math.floor(Math.random() * positionOutcomes.length);
    relativeOutcome = positionOutcomes.length ? positionOutcomes[idx] : 1;
  }

  if (gameProgress > 0) {
    const remainingVariance = 1 - gameProgress;
    relativeOutcome = 1 + (relativeOutcome - 1) * remainingVariance;
  }

  return projection * relativeOutcome;
};

/**
 * Safe version of buildSamplingContext.
 * Returns Result instead of throwing exceptions.
 *
 * @param playerIds - Array of Sleeper player IDs to fetch variance data for
 * @param positions - Array of NFL positions (QB, RB, WR, TE, K, DEF)
 * @param metrics - Optional Metrics instance for tracking cache performance
 *
 * @returns Promise<Result<SamplingContext, SimulationError>>
 *
 * @example
 * const result = await buildSamplingContextSafe(['4866'], ['QB']);
 * if (result.ok) {
 *   const ctx = result.value;
 *   // Use ctx for sampling
 * } else {
 *   console.error('Context build failed:', result.error.message);
 * }
 */
export const buildSamplingContextSafe = async (
  playerIds: string[],
  positions: string[],
  metrics?: Metrics
): Promise<Result<SamplingContext, SimulationError>> => {
  try {
    const context = await buildSamplingContext(playerIds, positions, metrics);
    return ok(context);
  } catch (error) {
    return err(new SimulationError('Failed to build sampling context', error));
  }
};
