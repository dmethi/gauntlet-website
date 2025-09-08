import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearBadSimulations() {
  console.log('🗑️ Clearing bad simulation data...');

  // Delete ALL matchup simulations for week 1 (fresh start)
  const deletedMatchups = await prisma.matchupSimulation.deleteMany({
    where: { week: 1 },
  });

  console.log(`   ✅ Deleted ${deletedMatchups.count} bad matchup simulations`);

  // Delete all player simulations for week 1 (they'll be regenerated with fresh matchup sims)
  const deletedPlayers = await prisma.playerSimulation.deleteMany({
    where: {
      matchupSimulation: {
        week: 1,
      },
    },
  });

  console.log(`   ✅ Deleted ${deletedPlayers.count} player simulations`);

  // Delete ALL historical odds for week 1 (fresh start)
  const deletedHistory = await prisma.matchupOddsHistory.deleteMany({
    where: { week: 1 },
  });

  console.log(`   ✅ Deleted ${deletedHistory.count} bad historical odds records`);

  console.log('🎉 Bad data cleared! Ready for fresh simulations.');

  await prisma.$disconnect();
}

clearBadSimulations().catch(console.error);
