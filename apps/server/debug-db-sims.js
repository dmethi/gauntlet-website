import prisma from './src/lib/prisma.ts';

async function main() {
  const sims = await prisma.matchupSimulation.findMany({
    where: { week: 1 },
    select: {
      leagueId: true,
      matchupId: true,
      teamAWinPct: true,
      teamBWinPct: true,
      teamAMean: true,
      teamBMean: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
  });

  console.log('🔍 Database stored simulation results:');
  sims.forEach(s => {
    const leagueName = s.leagueId.includes('3245') ? 'AFC' : 'NFC';
    console.log(
      `${leagueName} Matchup ${s.matchupId}: Team A ${(s.teamAWinPct * 100).toFixed(1)}% (${s.teamAMean.toFixed(1)} pts) vs Team B ${(s.teamBWinPct * 100).toFixed(1)}% (${s.teamBMean.toFixed(1)} pts)`
    );
  });

  await prisma.$disconnect();
}

main().catch(console.error);
