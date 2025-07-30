import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allPlayers: any[] = await prisma.player.findMany();
  const playerMap = new Map(allPlayers.map((p: any) => [p.id, p]));

  const errors: any[] = await prisma.projectionError.findMany({
    where: {
      season: '2023',
    },
  });

  console.log('Variance Data Verification');
  console.log('==========================');
  console.log(`Analyzing ${errors.length} projection errors...`);

  const positions = ['QB', 'RB', 'WR', 'TE'];
  for (const position of positions) {
    console.log(`\n--- ${position} ---`);
    const positionErrors = errors
      .filter((e: any) => {
        const player = playerMap.get(e.playerId);
        return player?.position === position;
      })
      .sort((a: any, b: any) => Math.abs(b.normalizedError) - Math.abs(a.normalizedError));

    console.log('Top 5 Biggest Upsets (Normalized):');
    for (let i = 0; i < 5 && i < positionErrors.length; i++) {
      const e = positionErrors[i];
      const player = playerMap.get(e.playerId);
      console.log(`  ${player?.fullName || e.playerId}:`);
      console.log(
        `    Proj: ${e.projectedPoints.toFixed(1)}, Actual: ${e.actualPoints.toFixed(
          1
        )}, Norm Err: ${e.normalizedError.toFixed(2)}`
      );
    }
  }

  // Verify a specific player
  const playerName = 'Christian McCaffrey';
  console.log(`\n--- Verification for ${playerName} ---`);
  const player = allPlayers.find((p: any) => p.fullName === playerName);
  if (player) {
    const playerErrors = errors.filter((e: any) => e.playerId === player.id);
    console.log(`Found ${playerErrors.length} games for ${playerName}`);

    const sortedActual = playerErrors
      .map((e: any) => e.actualPoints)
      .sort((a: number, b: number) => a - b);
    const sortedProj = playerErrors
      .map((e: any) => e.projectedPoints)
      .sort((a: number, b: number) => a - b);

    console.log('\nActual Score Distribution:');
    console.log(`  Min: ${sortedActual[0].toFixed(1)}`);
    console.log(`  Median: ${sortedActual[Math.floor(sortedActual.length / 2)].toFixed(1)}`);
    console.log(`  Max: ${sortedActual[sortedActual.length - 1].toFixed(1)}`);

    console.log('\nProjected Score Distribution:');
    console.log(`  Min: ${sortedProj[0].toFixed(1)}`);
    console.log(`  Median: ${sortedProj[Math.floor(sortedProj.length / 2)].toFixed(1)}`);
    console.log(`  Max: ${sortedProj[sortedProj.length - 1].toFixed(1)}`);

    console.log('\nWeekly Breakdown:');
    const byWeek = playerErrors.sort((a: any, b: any) => a.week - b.week);
    for (const e of byWeek) {
      console.log(
        `  Week ${e.week}: Proj ${e.projectedPoints.toFixed(1)}, Actual ${e.actualPoints.toFixed(
          1
        )}, Error: ${(e.error * 100).toFixed(1)}%`
      );
    }
  } else {
    console.log(`Player ${playerName} not found.`);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
