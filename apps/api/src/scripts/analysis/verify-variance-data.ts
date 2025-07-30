import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function analyzeRawData() {
  console.log('\n=== Raw Data Analysis ===');

  // First get all players to have position info
  const allPlayers = await prisma.player.findMany();
  const playerMap = new Map(allPlayers.map(p => [p.id, p]));

  // Get all projection errors
  const errors = await prisma.projectionError.findMany();

  // Group by position
  const positionStats: Record<
    string,
    {
      errors: number[];
      actualPoints: number[];
      projectedPoints: number[];
    }
  > = {};

  for (const error of errors) {
    const player = playerMap.get(error.playerId);
    const position = player?.position;
    if (!position) continue;

    if (!positionStats[position]) {
      positionStats[position] = {
        errors: [],
        actualPoints: [],
        projectedPoints: [],
      };
    }

    positionStats[position].errors.push(error.normalizedError);
    positionStats[position].actualPoints.push(error.actualPoints);
    positionStats[position].projectedPoints.push(error.projectedPoints);
  }

  // Analyze each position
  for (const [position, stats] of Object.entries(positionStats)) {
    console.log(`\n${position}:`);

    // Sort points for percentiles
    const sortedActual = stats.actualPoints.sort((a, b) => a - b);
    const sortedProjected = stats.projectedPoints.sort((a, b) => a - b);
    const sortedErrors = stats.errors.sort((a, b) => a - b);

    // Calculate percentiles
    const p95actual = sortedActual[Math.floor(sortedActual.length * 0.95)];
    const p95proj = sortedProjected[Math.floor(sortedProjected.length * 0.95)];
    const p5actual = sortedActual[Math.floor(sortedActual.length * 0.05)];
    const p5proj = sortedProjected[Math.floor(sortedProjected.length * 0.05)];

    // Error percentiles
    const p95error = sortedErrors[Math.floor(sortedErrors.length * 0.95)];
    const p5error = sortedErrors[Math.floor(sortedErrors.length * 0.05)];

    console.log('Points Range:');
    console.log(`  Actual: 5th-95th percentile: ${p5actual.toFixed(1)} to ${p95actual.toFixed(1)}`);
    console.log(`  Projected: 5th-95th percentile: ${p5proj.toFixed(1)} to ${p95proj.toFixed(1)}`);

    console.log('Normalized Error Distribution:');
    console.log(
      `  5th-95th percentile: ${(p5error * 100).toFixed(1)}% to ${(p95error * 100).toFixed(1)}%`
    );

    // Find extreme cases
    const extremes = errors
      .filter(e => {
        const player = playerMap.get(e.playerId);
        return player?.position === position;
      })
      .sort((a, b) => Math.abs(b.normalizedError) - Math.abs(a.normalizedError))
      .slice(0, 5);

    console.log('\nMost Extreme Cases:');
    for (const e of extremes) {
      const player = playerMap.get(e.playerId);
      console.log(`  ${player?.fullName || e.playerId}:`);
      console.log(`    Week ${e.week}, ${e.season}`);
      console.log(`    Projected: ${e.projectedPoints.toFixed(1)}`);
      console.log(`    Actual: ${e.actualPoints.toFixed(1)}`);
      console.log(`    Error: ${(e.normalizedError * 100).toFixed(1)}%`);
    }
  }

  // Look at specific players
  const targetPlayers = [
    'Josh Allen',
    'Patrick Mahomes',
    'Christian McCaffrey',
    'Tyreek Hill',
    'Travis Kelce',
  ];

  console.log('\n=== Top Player Analysis ===');
  for (const name of targetPlayers) {
    const player = allPlayers.find(p => p.fullName === name);
    if (!player) continue;

    const errors = await prisma.projectionError.findMany({
      where: { playerId: player.id },
    });

    if (errors.length === 0) continue;

    console.log(`\n${name} (${player.position}):`);
    const sortedActual = errors.map(e => e.actualPoints).sort((a, b) => a - b);
    const sortedProj = errors.map(e => e.projectedPoints).sort((a, b) => a - b);

    console.log('Points Range:');
    console.log(
      `  Actual: ${Math.min(...sortedActual).toFixed(1)} to ${Math.max(...sortedActual).toFixed(1)}`
    );
    console.log(
      `  Projected: ${Math.min(...sortedProj).toFixed(1)} to ${Math.max(...sortedProj).toFixed(1)}`
    );

    // Show all weeks
    console.log('\nWeek by Week:');
    const byWeek = errors.sort((a, b) => a.week - b.week);
    for (const week of byWeek) {
      console.log(
        `  Week ${week.week}: Proj ${week.projectedPoints.toFixed(1)} → Act ${week.actualPoints.toFixed(1)} (${(week.normalizedError * 100).toFixed(1)}%)`
      );
    }
  }
}

async function main() {
  try {
    await analyzeRawData();
  } catch (error) {
    console.error('Error analyzing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
