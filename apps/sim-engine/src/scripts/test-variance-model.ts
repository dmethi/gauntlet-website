import { PrismaClient } from '@prisma/client';
import { getVarianceModel } from '../models/variance';

const prisma = new PrismaClient();

async function testPlayer(name: string) {
  // Find player
  const player = await prisma.player.findFirst({
    where: { fullName: name },
  });
  if (!player) {
    console.log(`Player not found: ${name}`);
    return;
  }

  // Get their recent projections
  const recentProjections = await prisma.projectionError.findMany({
    where: { playerId: player.id },
    orderBy: { week: 'desc' },
    take: 8,
  });

  if (recentProjections.length === 0) {
    console.log(`No recent projections for ${name}`);
    return;
  }

  // Get average projection
  const avgProjection =
    recentProjections.reduce((sum: number, p: any) => sum + p.projectedPoints, 0) /
    recentProjections.length;

  // Test different projection levels
  const projections = [
    avgProjection * 0.8, // Below average
    avgProjection, // Average
    avgProjection * 1.2, // Above average
  ];

  console.log(`\n=== ${name} (${player.position}) ===`);

  // Show data sources being used
  const range = await getVarianceModel(player.id, player.position, avgProjection);
  console.log(`Position Data: ${range.positionDist.sampleSize} historical samples`);
  console.log(`Player Data: ${range.playerOutcomes.sampleSize} recent games`);

  console.log('\nRecent Actual Scores:');
  for (const proj of recentProjections) {
    const relOutcome = (proj.actualPoints / proj.projectedPoints).toFixed(2);
    console.log(
      `  Week ${proj.week}: Proj ${proj.projectedPoints.toFixed(1)} → Act ${proj.actualPoints.toFixed(1)} (${relOutcome}x)`
    );
  }

  console.log('\nMonte Carlo Simulations (1000 runs each):');
  for (const projection of projections) {
    const range = await getVarianceModel(player.id, player.position, projection);

    console.log(`\nProjected ${projection.toFixed(1)} points:`);
    console.log(
      `  10th percentile: ${range.p10.toFixed(1)} (${(range.p10 / projection).toFixed(2)}x)`
    );
    console.log(
      `  25th percentile: ${range.p25.toFixed(1)} (${(range.p25 / projection).toFixed(2)}x)`
    );
    console.log(
      `  Median: ${range.median.toFixed(1)} (${(range.median / projection).toFixed(2)}x)`
    );
    console.log(
      `  75th percentile: ${range.p75.toFixed(1)} (${(range.p75 / projection).toFixed(2)}x)`
    );
    console.log(
      `  90th percentile: ${range.p90.toFixed(1)} (${(range.p90 / projection).toFixed(2)}x)`
    );
    console.log(`  Mean: ${range.mean.toFixed(1)} (${(range.mean / projection).toFixed(2)}x)`);
  }
}

async function main() {
  try {
    // Test a mix of players
    const players = [
      // QBs - mix of consistent and volatile
      'Josh Allen',
      'Patrick Mahomes',
      'Justin Fields',
      'Geno Smith',

      // RBs - different projection levels
      'Christian McCaffrey',
      'Breece Hall',
      'Javonte Williams',

      // WRs - mix of profiles
      'Tyreek Hill',
      'Justin Jefferson',
      'Chris Olave',

      // TEs - different tiers
      'Travis Kelce',
      'Sam LaPorta',
      'Dalton Kincaid',
    ];

    for (const name of players) {
      await testPlayer(name);
    }
  } catch (error) {
    console.error('Error testing variance model:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
