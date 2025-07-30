import { PrismaClient } from '@gauntlet/api/src/generated/prisma';

const prisma = new PrismaClient();

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
    // Get all outcomes for this position
    const errors = await prisma.projectionError.findMany({
      where: {
        playerId: {
          in: (
            await prisma.player.findMany({
              where: { position },
              select: { id: true },
            })
          ).map(p => p.id),
        },
      },
    });

    if (errors.length < 100) {
      console.warn(`Limited data for ${position}: ${errors.length} samples`);
      // Return conservative distribution centered around 1.0
      return {
        outcomes: Array(100)
          .fill(0)
          .map(() => 0.7 + Math.random() * 0.6),
        sampleSize: 0,
      };
    }

    // Calculate relative outcomes (actual/projected)
    const outcomes = errors
      .filter(e => e.projectedPoints > 0) // Avoid division by zero
      .map(e => e.actualPoints / e.projectedPoints)
      .sort((a, b) => a - b);

    // Cache the result
    const result = {
      outcomes,
      sampleSize: outcomes.length,
      lastUpdated: new Date(),
    };
    positionDistributionCache.set(position, result);

    return result;
  } catch (error) {
    console.error(`Error getting ${position} distribution:`, error);
    return {
      outcomes: Array(100)
        .fill(0)
        .map(() => 0.7 + Math.random() * 0.6),
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
    const outcomes = errors
      .filter(e => e.projectedPoints > 0)
      .map(e => e.actualPoints / e.projectedPoints)
      .sort((a, b) => a - b);

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

  // If we have enough player-specific data, weight it more heavily
  const usePlayerData = playerOutcomes.sampleSize >= 8;

  // Sample from the appropriate distribution
  let relativeOutcome: number;
  if (usePlayerData) {
    // 70% weight to player-specific outcomes if we have enough data
    relativeOutcome =
      Math.random() < 0.7
        ? randomSample(playerOutcomes.outcomes)
        : randomSample(positionDist.outcomes);
  } else {
    // Otherwise use position distribution
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

// Clean up caches periodically
setInterval(
  () => {
    positionDistributionCache.clear();
    playerOutcomeCache.clear();
  },
  60 * 60 * 1000
); // Every hour
