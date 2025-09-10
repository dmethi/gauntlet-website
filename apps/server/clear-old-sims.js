import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing old Week 2 simulation data with duplicated roster IDs...\n');

  // Check what simulation data exists for Week 2
  const existingSims = await prisma.matchupSimulation.findMany({
    where: { week: 2 },
    select: { leagueId: true, matchupId: true, teamAMean: true, teamBMean: true },
  });

  console.log(`Found ${existingSims.length} existing Week 2 simulations:`);
  existingSims.forEach(sim => {
    const leagueName = sim.leagueId === '1263740549504962561' ? 'NFC' : 'AFC';
    console.log(
      `  ${leagueName} Matchup ${sim.matchupId}: Team A ${sim.teamAMean?.toFixed(1)}, Team B ${sim.teamBMean?.toFixed(1)}`
    );
  });

  if (existingSims.length > 0) {
    console.log(`\n🗑️  Deleting ${existingSims.length} old simulation records...`);
    const result = await prisma.matchupSimulation.deleteMany({
      where: { week: 2 },
    });
    console.log(`✅ Deleted ${result.count} simulation records`);
  } else {
    console.log('No simulation data to clear');
  }

  // Also clear any associated historical odds snapshots
  const historicalOdds = await prisma.historicalOddsSnapshot.findMany({
    where: { week: 2 },
    select: { id: true, leagueId: true },
  });

  if (historicalOdds.length > 0) {
    console.log(`\n🗑️  Clearing ${historicalOdds.length} historical odds snapshots...`);
    const result = await prisma.historicalOddsSnapshot.deleteMany({
      where: { week: 2 },
    });
    console.log(`✅ Deleted ${result.count} historical odds records`);
  }

  console.log('\n✅ Cleanup complete! League-wide odds should now show 24 teams instead of 36.');
  console.log('💡 API will now use projection-based fallbacks with correct roster IDs.');

  await prisma.$disconnect();
}

main().catch(console.error);
