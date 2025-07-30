import { PrismaClient } from '../generated/prisma';
import { calculateNormalizedError, calculateStdDev } from '@gauntlet/lib';

const prisma = new PrismaClient();

interface WeeklyStats {
  playerId: string;
  position: string;
  projectedPoints: number;
  actualPoints: number;
  normalizedError: number;
}

async function getHistoricalStats(season: string, week?: number): Promise<WeeklyStats[]> {
  const players = await prisma.player.findMany();
  const stats = await prisma.playerStats.findMany({
    where: week ? { season, week } : { season },
  });

  const weeklyStats: WeeklyStats[] = [];

  for (const player of players) {
    // Get all weeks for this player
    const playerStats = stats.filter(s => s.playerId === player.id);
    const projections = playerStats.filter(s => s.statsType === 'projections');
    const actuals = playerStats.filter(s => s.statsType === 'stats');

    // Match projections with actuals
    for (const proj of projections) {
      const actual = actuals.find(a => a.week === proj.week);
      if (!actual) continue;

      const projectedPoints = (proj.stats as any).pts_ppr || 0;
      const actualPoints = (actual.stats as any).pts_ppr || 0;

      if (projectedPoints > 0) {
        weeklyStats.push({
          playerId: player.id,
          position: player.position,
          projectedPoints,
          actualPoints,
          normalizedError: (actualPoints - projectedPoints) / projectedPoints,
        });
      }
    }
  }

  return weeklyStats;
}

async function updateProjectionErrors(stats: WeeklyStats[], season: string, week: number) {
  for (const stat of stats) {
    await prisma.projectionError.upsert({
      where: {
        playerId_week_season: {
          playerId: stat.playerId,
          week,
          season,
        },
      },
      update: {
        projectedPoints: stat.projectedPoints,
        actualPoints: stat.actualPoints,
        normalizedError: stat.normalizedError,
      },
      create: {
        playerId: stat.playerId,
        week,
        season,
        projectedPoints: stat.projectedPoints,
        actualPoints: stat.actualPoints,
        normalizedError: stat.normalizedError,
      },
    });
  }
}

async function updatePositionVariances(stats: WeeklyStats[], season: string) {
  const errorsByPosition: Record<string, number[]> = {};

  // Group errors by position
  for (const stat of stats) {
    if (!errorsByPosition[stat.position]) {
      errorsByPosition[stat.position] = [];
    }
    errorsByPosition[stat.position].push(stat.normalizedError);
  }

  // Calculate and store position-level variances
  for (const [position, errors] of Object.entries(errorsByPosition)) {
    // Need enough samples for meaningful variance
    if (errors.length < 10) continue;

    const meanError = errors.reduce((a, b) => a + b, 0) / errors.length;
    const stdDev = calculateStdDev(errors);

    await prisma.positionVariance.upsert({
      where: {
        position_season: {
          position,
          season,
        },
      },
      update: {
        sampleSize: errors.length,
        meanError,
        stdDev,
        lastUpdated: new Date(),
      },
      create: {
        position,
        season,
        sampleSize: errors.length,
        meanError,
        stdDev,
      },
    });
  }
}

async function updatePlayerVariances(stats: WeeklyStats[], season: string) {
  const errorsByPlayer: Record<string, number[]> = {};

  // Group errors by player
  for (const stat of stats) {
    if (!errorsByPlayer[stat.playerId]) {
      errorsByPlayer[stat.playerId] = [];
    }
    errorsByPlayer[stat.playerId].push(stat.normalizedError);
  }

  // Calculate and store player-level variances
  for (const [playerId, errors] of Object.entries(errorsByPlayer)) {
    // Need enough samples for meaningful variance
    if (errors.length < 4) continue;

    const meanError = errors.reduce((a, b) => a + b, 0) / errors.length;
    const stdDev = calculateStdDev(errors);

    await prisma.playerVariance.upsert({
      where: {
        playerId_season: {
          playerId,
          season,
        },
      },
      update: {
        sampleSize: errors.length,
        meanError,
        stdDev,
        lastUpdated: new Date(),
      },
      create: {
        playerId,
        season,
        sampleSize: errors.length,
        meanError,
        stdDev,
      },
    });
  }
}

export async function calculateVarianceMetrics(options: { season: string; week?: number }) {
  const { season, week } = options;

  try {
    // Get all historical stats up to this point
    const weeklyStats = await getHistoricalStats(season, week);

    // If processing a specific week, just store those projection errors
    if (week) {
      console.log(`Processing variance metrics for ${season} week ${week}...`);
      const weekStats = weeklyStats.filter(s => s.projectedPoints > 0);
      await updateProjectionErrors(weekStats, season, week);
    }

    // Always update variance models with all available data
    await updatePositionVariances(weeklyStats, season);
    await updatePlayerVariances(weeklyStats, season);

    if (!week) {
      console.log(`Completed variance calculations for season ${season}`);
    }
  } catch (error) {
    console.error('Error calculating variance metrics:', error);
    throw error;
  }
}

// For CLI usage
if (require.main === module) {
  const season = process.argv[2];
  const week = process.argv[3] ? parseInt(process.argv[3]) : undefined;

  if (!season) {
    console.error('Please provide a season (e.g., "2023")');
    process.exit(1);
  }

  calculateVarianceMetrics({ season, week })
    .then(() => {
      console.log('Variance metrics calculation complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to calculate variance metrics:', error);
      process.exit(1);
    });
}
