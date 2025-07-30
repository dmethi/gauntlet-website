import { PrismaClient } from '@gauntlet/api/src/generated/prisma';
import { calculateNormalizedError } from '@gauntlet/lib';

const prisma = new PrismaClient();

interface PlayerProjection {
  playerId: string;
  position: string;
  projectedPoints: number;
}

interface SimulationResult {
  team1Score: number;
  team2Score: number;
  team1WinProbability: number;
  confidenceInterval: {
    team1: [number, number];
    team2: [number, number];
  };
}

async function getPlayerVariance(playerId: string, season: string): Promise<number | null> {
  const variance = await prisma.playerVariance.findUnique({
    where: {
      playerId_season: {
        playerId,
        season,
      },
    },
  });

  return variance?.stdDev || null;
}

async function getPositionVariance(position: string, season: string): Promise<number> {
  const variance = await prisma.positionVariance.findUnique({
    where: {
      position_season: {
        position,
        season,
      },
    },
  });

  // Fallback values based on historical analysis if no data exists
  const fallbackStdDev: Record<string, number> = {
    QB: 0.8,
    RB: 0.98,
    WR: 0.98,
    TE: 0.99,
    K: 0.5,
    DEF: 0.75,
  };

  return variance?.stdDev || fallbackStdDev[position] || 0.9;
}

function gaussianSample(mean: number, stdDev: number): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return Math.max(0, mean + stdDev * z);
}

function calculateConfidenceInterval(scores: number[]): [number, number] {
  const sorted = scores.sort((a, b) => a - b);
  const lower = sorted[Math.floor(sorted.length * 0.025)]; // 2.5th percentile
  const upper = sorted[Math.floor(sorted.length * 0.975)]; // 97.5th percentile
  return [lower, upper];
}

export async function simulateMatchup(
  team1Players: PlayerProjection[],
  team2Players: PlayerProjection[],
  options: {
    season: string;
    iterations?: number;
    gameProgress?: number; // 0-1, where 1 means game is complete
  }
): Promise<SimulationResult> {
  const iterations = options.iterations || 10000;
  const gameProgress = options.gameProgress || 0;
  const season = options.season;

  const team1Scores: number[] = [];
  const team2Scores: number[] = [];
  let team1Wins = 0;

  // Pre-fetch all variances to avoid N+1 queries
  const playerVariances = new Map<string, number>();
  const positionVariances = new Map<string, number>();

  // Fetch player-specific variances
  await Promise.all([
    ...team1Players.map(async p => {
      const variance = await getPlayerVariance(p.playerId, season);
      if (variance) playerVariances.set(p.playerId, variance);
    }),
    ...team2Players.map(async p => {
      const variance = await getPlayerVariance(p.playerId, season);
      if (variance) playerVariances.set(p.playerId, variance);
    }),
  ]);

  // Fetch position-level variances
  const uniquePositions = new Set([
    ...team1Players.map(p => p.position),
    ...team2Players.map(p => p.position),
  ]);
  await Promise.all(
    Array.from(uniquePositions).map(async pos => {
      const variance = await getPositionVariance(pos, season);
      positionVariances.set(pos, variance);
    })
  );

  // Run simulations
  for (let i = 0; i < iterations; i++) {
    let team1Score = 0;
    let team2Score = 0;

    // Simulate team 1
    for (const player of team1Players) {
      const remainingProjection = player.projectedPoints * (1 - gameProgress);
      const playerStdDev = playerVariances.get(player.playerId);
      const positionStdDev = positionVariances.get(player.position)!;

      // Use player-specific variance if available, otherwise fall back to position
      const finalStdDev = remainingProjection * (playerStdDev || positionStdDev);
      team1Score += gaussianSample(remainingProjection, finalStdDev);
    }

    // Simulate team 2
    for (const player of team2Players) {
      const remainingProjection = player.projectedPoints * (1 - gameProgress);
      const playerStdDev = playerVariances.get(player.playerId);
      const positionStdDev = positionVariances.get(player.position)!;

      const finalStdDev = remainingProjection * (playerStdDev || positionStdDev);
      team2Score += gaussianSample(remainingProjection, finalStdDev);
    }

    team1Scores.push(team1Score);
    team2Scores.push(team2Score);
    if (team1Score > team2Score) team1Wins++;
  }

  return {
    team1Score: team1Scores.reduce((a, b) => a + b, 0) / iterations,
    team2Score: team2Scores.reduce((a, b) => a + b, 0) / iterations,
    team1WinProbability: team1Wins / iterations,
    confidenceInterval: {
      team1: calculateConfidenceInterval(team1Scores),
      team2: calculateConfidenceInterval(team2Scores),
    },
  };
}
