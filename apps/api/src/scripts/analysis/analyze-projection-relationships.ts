import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

interface ProjectionBucket {
  min: number;
  max: number;
  actualPoints: number[];
  deviations: number[]; // absolute point differences
  count: number;
}

async function analyzeByProjectionLevel() {
  // Get all players and their positions
  const players = await prisma.player.findMany();
  const playerMap = new Map(players.map(p => [p.id, p]));

  // Get all projection errors
  const errors = await prisma.projectionError.findMany();

  // Group by position and projection level
  const positionStats: Record<string, ProjectionBucket[]> = {};

  for (const error of errors) {
    const player = playerMap.get(error.playerId);
    const position = player?.position;
    if (!position || !['QB', 'RB', 'WR', 'TE'].includes(position)) continue;

    if (!positionStats[position]) {
      positionStats[position] = [];
      // Create buckets: 0-5, 5-10, 10-15, 15-20, 20-25, 25+
      for (let i = 0; i < 6; i++) {
        positionStats[position].push({
          min: i * 5,
          max: i === 5 ? Infinity : (i + 1) * 5,
          actualPoints: [],
          deviations: [],
          count: 0,
        });
      }
    }

    // Find the right bucket
    const bucket = positionStats[position].find(
      b => error.projectedPoints >= b.min && error.projectedPoints < b.max
    );
    if (!bucket) continue;

    bucket.actualPoints.push(error.actualPoints);
    bucket.deviations.push(Math.abs(error.actualPoints - error.projectedPoints));
    bucket.count++;
  }

  // Analyze each position
  for (const [position, buckets] of Object.entries(positionStats)) {
    console.log(`\n${position} Analysis by Projection Level:`);

    for (const bucket of buckets) {
      if (bucket.count < 10) continue; // Skip buckets with too few samples

      const sortedActual = bucket.actualPoints.sort((a, b) => a - b);
      const sortedDevs = bucket.deviations.sort((a, b) => a - b);

      // Calculate percentiles
      const p10 = sortedActual[Math.floor(sortedActual.length * 0.1)];
      const p25 = sortedActual[Math.floor(sortedActual.length * 0.25)];
      const p50 = sortedActual[Math.floor(sortedActual.length * 0.5)];
      const p75 = sortedActual[Math.floor(sortedActual.length * 0.75)];
      const p90 = sortedActual[Math.floor(sortedActual.length * 0.9)];

      // Calculate average absolute deviation
      const avgDev = bucket.deviations.reduce((a, b) => a + b, 0) / bucket.count;
      const medianDev = sortedDevs[Math.floor(sortedDevs.length * 0.5)];

      console.log(
        `\nProjected ${bucket.min}-${bucket.max === Infinity ? '+' : bucket.max} points (${bucket.count} samples):`
      );
      console.log('Actual Points Distribution:');
      console.log(`  10th percentile: ${p10.toFixed(1)}`);
      console.log(`  25th percentile: ${p25.toFixed(1)}`);
      console.log(`  Median: ${p50.toFixed(1)}`);
      console.log(`  75th percentile: ${p75.toFixed(1)}`);
      console.log(`  90th percentile: ${p90.toFixed(1)}`);
      console.log('Point Deviations:');
      console.log(`  Average absolute deviation: ${avgDev.toFixed(1)} points`);
      console.log(`  Median absolute deviation: ${medianDev.toFixed(1)} points`);

      // Calculate relative ranges
      const medianProj = (bucket.min + (bucket.max === Infinity ? 25 : bucket.max)) / 2;
      console.log('Relative to Projection:');
      console.log(`  10th percentile: ${((p10 / medianProj - 1) * 100).toFixed(1)}%`);
      console.log(`  90th percentile: ${((p90 / medianProj - 1) * 100).toFixed(1)}%`);
    }
  }

  // Look at specific high-projection players
  console.log('\n=== Analysis of High-Projected Players ===');
  const highProjections = errors.filter(e => e.projectedPoints >= 20);

  // Group by player
  const playerStats = new Map<
    string,
    {
      position: string;
      projections: number[];
      actuals: number[];
      deviations: number[];
    }
  >();

  for (const error of highProjections) {
    const player = playerMap.get(error.playerId);
    if (!player) continue;

    if (!playerStats.has(player.fullName)) {
      playerStats.set(player.fullName, {
        position: player.position,
        projections: [],
        actuals: [],
        deviations: [],
      });
    }

    const stats = playerStats.get(player.fullName)!;
    stats.projections.push(error.projectedPoints);
    stats.actuals.push(error.actualPoints);
    stats.deviations.push(Math.abs(error.actualPoints - error.projectedPoints));
  }

  // Analyze each high-projected player
  for (const [name, stats] of playerStats) {
    if (stats.projections.length < 5) continue; // Need enough samples

    const avgProj = stats.projections.reduce((a, b) => a + b, 0) / stats.projections.length;
    const avgDev = stats.deviations.reduce((a, b) => a + b, 0) / stats.deviations.length;

    const sortedActuals = stats.actuals.sort((a, b) => a - b);
    const p10 = sortedActuals[Math.floor(sortedActuals.length * 0.1)];
    const p90 = sortedActuals[Math.floor(sortedActuals.length * 0.9)];

    console.log(`\n${name} (${stats.position}):`);
    console.log(`  Average projection: ${avgProj.toFixed(1)}`);
    console.log(`  Average deviation: ${avgDev.toFixed(1)} points`);
    console.log(`  10th-90th percentile: ${p10.toFixed(1)} to ${p90.toFixed(1)}`);
    console.log(
      `  Relative range: ${((p10 / avgProj - 1) * 100).toFixed(1)}% to ${((p90 / avgProj - 1) * 100).toFixed(1)}%`
    );
  }
}

async function main() {
  try {
    await analyzeByProjectionLevel();
  } catch (error) {
    console.error('Error analyzing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
