import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearRecent() {
  const result = await prisma.matchupSimulation.deleteMany({
    where: {
      week: 1,
      createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
    },
  });
  console.log(`🗑️ Cleared ${result.count} recent simulations (last 15 minutes)`);
  await prisma.$disconnect();
}

clearRecent().catch(console.error);
