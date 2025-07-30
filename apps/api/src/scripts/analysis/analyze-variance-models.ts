import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function analyzePositionVariance() {
  console.log('\n=== Position-Level Variance Analysis ===');

  const positions = ['QB', 'RB', 'WR', 'TE'];
  const seasons = ['2022', '2023', '2024'];

  for (const position of positions) {
    console.log(`\n${position} Variance:`);

    for (const season of seasons) {
      const variance = await prisma.positionVariance.findUnique({
        where: {
          position_season: {
            position,
            season,
          },
        },
      });

      if (variance) {
        console.log(`  ${season}:`);
        console.log(`    Sample Size: ${variance.sampleSize} weeks`);
        console.log(`    Mean Error: ${(variance.meanError * 100).toFixed(1)}%`);
        console.log(`    Std Dev: ${(variance.stdDev * 100).toFixed(1)}%`);
      }
    }
  }
}

async function analyzePlayerVariance() {
  console.log('\n=== Player-Level Variance Analysis ===');

  // Get top 10 players by sample size for each position
  const positions = ['QB', 'RB', 'WR', 'TE'];
  const season = '2023'; // Focus on most recent full season

  for (const position of positions) {
    console.log(`\n${position} Players:`);

    // First get players of this position
    const players = await prisma.player.findMany({
      where: { position },
      select: { id: true, fullName: true },
    });

    // Then get their variance data
    const playerIds = players.map(p => p.id);
    const variances = await prisma.playerVariance.findMany({
      where: {
        playerId: { in: playerIds },
        season,
      },
      orderBy: {
        sampleSize: 'desc',
      },
      take: 10,
    });

    // Join with player data
    for (const variance of variances) {
      const player = players.find(p => p.id === variance.playerId);
      console.log(`  ${player?.fullName || variance.playerId}:`);
      console.log(`    Sample Size: ${variance.sampleSize} weeks`);
      console.log(`    Mean Error: ${(variance.meanError * 100).toFixed(1)}%`);
      console.log(`    Std Dev: ${(variance.stdDev * 100).toFixed(1)}%`);
    }
  }
}

async function analyzeProjectionErrors() {
  console.log('\n=== Projection Error Analysis ===');

  // Get error distribution stats
  const errors = await prisma.projectionError.findMany();

  const normalizedErrors = errors.map(e => e.normalizedError);
  const sortedErrors = normalizedErrors.sort((a, b) => a - b);

  const mean = normalizedErrors.reduce((sum, err) => sum + err, 0) / normalizedErrors.length;
  const median = sortedErrors[Math.floor(sortedErrors.length / 2)];

  // Calculate percentiles
  const p10 = sortedErrors[Math.floor(sortedErrors.length * 0.1)];
  const p25 = sortedErrors[Math.floor(sortedErrors.length * 0.25)];
  const p75 = sortedErrors[Math.floor(sortedErrors.length * 0.75)];
  const p90 = sortedErrors[Math.floor(sortedErrors.length * 0.9)];

  console.log('\nError Distribution:');
  console.log(`  Total Samples: ${errors.length}`);
  console.log(`  Mean Error: ${(mean * 100).toFixed(1)}%`);
  console.log(`  Median Error: ${(median * 100).toFixed(1)}%`);
  console.log('\nPercentiles:');
  console.log(`  10th: ${(p10 * 100).toFixed(1)}%`);
  console.log(`  25th: ${(p25 * 100).toFixed(1)}%`);
  console.log(`  75th: ${(p75 * 100).toFixed(1)}%`);
  console.log(`  90th: ${(p90 * 100).toFixed(1)}%`);

  // Analyze by week to see if accuracy changes during season
  console.log('\nAccuracy by Week:');
  const weeklyStats = await prisma.$queryRaw<any[]>`
    SELECT 
      week,
      COUNT(*) as count,
      AVG(ABS(normalized_error)) as mean_abs_error,
      STDDEV(normalized_error) as std_dev
    FROM "ProjectionError"
    WHERE season = '2023'
    GROUP BY week
    ORDER BY week;
  `;

  for (const stat of weeklyStats) {
    console.log(`  Week ${stat.week}:`);
    console.log(`    Sample Size: ${stat.count}`);
    console.log(`    Mean Abs Error: ${(stat.mean_abs_error * 100).toFixed(1)}%`);
    console.log(`    Std Dev: ${(stat.std_dev * 100).toFixed(1)}%`);
  }
}

async function main() {
  try {
    await analyzePositionVariance();
    await analyzePlayerVariance();
    await analyzeProjectionErrors();
  } catch (error) {
    console.error('Error analyzing variance models:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
