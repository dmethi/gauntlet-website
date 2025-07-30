import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const variances: any[] = await prisma.varianceModel.findMany();
  const players: any[] = await prisma.player.findMany({
    where: {
      id: { in: variances.map((v: any) => v.playerId) },
    },
  });

  console.log('Variance Model Analysis');
  console.log('=======================');
  console.log(`Found ${variances.length} variance models for ${players.length} players.`);

  // Group variances by position
  const byPosition: Record<string, any[]> = {};
  for (const variance of variances) {
    const player = players.find((p: any) => p.id === variance.playerId);
    if (player) {
      if (!byPosition[player.position]) {
        byPosition[player.position] = [];
      }
      byPosition[player.position].push(variance);
    }
  }

  // Analyze each position
  for (const position in byPosition) {
    const models = byPosition[position];
    const errors = models.map((m: any) => m.normalizedError);
    const avgError = errors.reduce((sum: number, e: number) => sum + e, 0) / errors.length;
    console.log(`\nPosition: ${position} (${models.length} models)`);
    console.log(`  Avg Normalized Error: ${avgError.toFixed(3)}`);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
