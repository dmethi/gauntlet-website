import prisma from './src/lib/prisma.js';

async function debugSimResults() {
  console.log('🔍 Debugging simulation results...\n');
  
  // Get the most recent simulation
  const sim = await prisma.matchupSimulation.findFirst({
    where: { 
      leagueId: '1263744209295245312',
      week: 1,
      matchupId: 1
    },
    orderBy: { createdAt: 'desc' }
  });
  
  if (!sim) {
    console.log('No simulation found');
    return;
  }
  
  console.log('📊 Stored simulation results:');
  console.log(`  Team A Mean: ${sim.teamAMean?.toFixed(1)} pts`);
  console.log(`  Team B Mean: ${sim.teamBMean?.toFixed(1)} pts`);
  console.log(`  Team A Win %: ${(sim.teamAWinPct * 100)?.toFixed(1)}%`);
  console.log(`  Team B Win %: ${(sim.teamBWinPct * 100)?.toFixed(1)}%\n`);
  
  // Get the actual matchup data
  const matchups = await prisma.matchup.findMany({
    where: {
      leagueId: sim.leagueId,
      week: sim.week,
      matchupId: sim.matchupId
    },
    select: { rosterId: true, points: true },
    orderBy: { rosterId: 'asc' }
  });
  
  console.log('📊 Current live scores:');
  matchups.forEach((team, i) => {
    const simMean = i === 0 ? sim.teamAMean : sim.teamBMean;
    console.log(`  Team ${i+1} (roster ${team.rosterId}): ${team.points} current → ${simMean?.toFixed(1)} expected`);
    
    const diff = team.points - simMean;
    if (Math.abs(diff) > 10) {
      console.log(`    ❌ PROBLEM: ${diff > 0 ? 'Current higher' : 'Expected higher'} by ${Math.abs(diff).toFixed(1)} pts`);
    }
  });
  
  console.log('\n🤔 Expected behavior:');
  console.log('  - Team with 24.9 current should have big advantage');
  console.log('  - With 77% game progress, remaining projection should be ~23% of original');
  console.log('  - Final expected = current + remaining projection');
  
  await prisma.$disconnect();
}

debugSimResults().catch(console.error);
