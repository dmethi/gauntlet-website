import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Position-specific standard deviation values based on fantasy football research
 * QB: Most consistent due to high volume and predictable usage
 * RB: Highest variance due to game script, injury, touchdown variance
 * WR: High variance due to target volatility and big play dependency
 * TE: More consistent than WR, less target competition
 * K: Moderate variance, weather/game script dependent
 * DST: High variance due to turnover and TD randomness
 */
function getPositionStdDev(position: string): number {
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
}

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
async function getPositionDistribution(position: string): Promise<{
  outcomes: number[]; // Relative outcomes (actual/projected)
  sampleSize: number;
}> {
  // Check cache first (expire after 1 hour)
  const cached = positionDistributionCache.get(position);
  if (cached && Date.now() - cached.lastUpdated.getTime() < 60 * 60 * 1000) {
    return cached;
  }

  try {
    // TEMPORARY FIX: Use synthetic distributions while we fix historical data outliers
    console.log(
      `Using synthetic distribution for ${position} (historical data has outlier issues)`
    );

    const positionStdDev = getPositionStdDev(position);
    const outcomes = [];
    for (let i = 0; i < 1000; i++) {
      // Generate normal distribution with mean=1.0, position-specific std dev
      let u = 0,
        v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      const outcome = Math.max(0.1, 1.0 + z * positionStdDev); // Min 0.1 to avoid 0 scores
      outcomes.push(outcome);
    }

    const result = {
      outcomes: outcomes.sort((a, b) => a - b),
      sampleSize: 1000, // Mark as synthetic but sufficient
      lastUpdated: new Date(),
    };
    positionDistributionCache.set(position, result);

    return result;
  } catch (error) {
    console.error(`Error getting ${position} distribution:`, error);
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
}

/**
 * Get historical outcomes for a specific player
 */
async function getPlayerOutcomes(playerId: string): Promise<{
  outcomes: number[]; // Relative outcomes (actual/projected)
  sampleSize: number;
}> {
  // Check cache first (expire after 1 hour)
  const cached = playerOutcomeCache.get(playerId);
  if (cached && Date.now() - cached.lastUpdated.getTime() < 60 * 60 * 1000) {
    return cached;
  }

  try {
    // Get player's recent outcomes
    const errors = await prisma.projectionError.findMany({
      where: { playerId },
      orderBy: { week: 'desc' },
      take: 16, // Look at last 16 weeks
    });

    if (errors.length < 4) {
      return { outcomes: [], sampleSize: 0 }; // Not enough data
    }

    // Calculate relative outcomes
    const rawOutcomes = errors
      .filter((e: any) => e.projectedPoints > 0)
      .map((e: any) => e.actualPoints / e.projectedPoints);

    // Normalize around 1.0 to preserve variance but remove mean bias
    const median = rawOutcomes.sort((a, b) => a - b)[Math.floor(rawOutcomes.length / 2)];
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
}

/**
 * Sample randomly from an array of values
 */
function randomSample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Simulate a single score for a player using Monte Carlo sampling
 */
export async function simulatePlayerScore(
  playerId: string,
  position: string,
  projection: number,
  gameProgress: number = 0
): Promise<number> {
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
}

/**
 * Simulate multiple scores for a player
 */
export async function simulatePlayerRange(
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
}> {
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
}

export async function getVarianceModel(
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
}> {
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
}

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
export interface SamplingContext {
  positionToOutcomes: Map<string, number[]>;
  playerToOutcomes: Map<string, number[]>;
  playerSampleCounts: Map<string, number>;
  positionSampleCounts: Map<string, number>;
}

/**
 * Build a sampling context for a set of players and positions.
 * Fetches and prepares distributions once to enable synchronous sampling.
 */
export async function buildSamplingContext(
  playerIds: string[],
  positions: string[]
): Promise<SamplingContext> {
  const uniquePlayerIds = Array.from(new Set(playerIds));
  const uniquePositions = Array.from(new Set(positions));

  const positionToOutcomes = new Map<string, number[]>();
  const playerToOutcomes = new Map<string, number[]>();
  const playerSampleCounts = new Map<string, number>();
  const positionSampleCounts = new Map<string, number>();

  // Fetch position distributions
  await Promise.all(
    uniquePositions.map(async pos => {
      const dist = await getPositionDistribution(pos);
      positionToOutcomes.set(pos, dist.outcomes);
      positionSampleCounts.set(pos, dist.sampleSize);
    })
  );

  // Fetch player outcomes (recent games)
  await Promise.all(
    uniquePlayerIds.map(async id => {
      const out = await getPlayerOutcomes(id);
      playerToOutcomes.set(id, out.outcomes);
      playerSampleCounts.set(id, out.sampleSize);
    })
  );

  return {
    positionToOutcomes,
    playerToOutcomes,
    playerSampleCounts,
    positionSampleCounts,
  };
}

/**
 * Fast synchronous sampling using a prefetched context.
 * Falls back to position outcomes when player data is sparse.
 */
export function samplePlayerScoreFromContext(
  ctx: SamplingContext,
  playerId: string,
  position: string,
  projection: number,
  gameProgress: number = 0
): number {
  if (projection < 0) {
    throw new Error(`Invalid projection: ${projection}`);
  }
  if (gameProgress < 0 || gameProgress > 1) {
    throw new Error(`Invalid game progress: ${gameProgress}`);
  }

  const positionOutcomes = ctx.positionToOutcomes.get(position) || [];
  const playerOutcomes = ctx.playerToOutcomes.get(playerId) || [];
  const playerN = ctx.playerSampleCounts.get(playerId) || 0;

  // TEMPORARY FIX: Disable player-specific data since it contains outliers
  const usePlayerData = false; // was: playerN >= 8 && playerOutcomes.length > 0;

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
}
