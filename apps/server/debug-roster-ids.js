import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking roster ID collision issue...\n');
  
  // Check total rosters
  const totalRosters = await prisma.roster.count();
  console.log(`Total rosters in database: ${totalRosters}`);
  
  // Check rosters by league
  const rostersByLeague = await prisma.roster.groupBy({
    by: ['leagueId'],
    _count: { id: true },
    _min: { id: true },
    _max: { id: true }
  });
  
  console.log('\nRoster counts by league:');
  rostersByLeague.forEach(league => {
    const leagueName = league.leagueId === '1263740549504962561' ? 'NFC' : 'AFC';
    console.log(`  ${leagueName} (${league.leagueId}): ${league._count.id} rosters, IDs ${league._min.id} - ${league._max.id}`);
  });
  
  // Check specific roster IDs for each league
  console.log('\nDetailed roster IDs:');
  
  const nfcRosters = await prisma.roster.findMany({
    where: { leagueId: '1263740549504962561' },
    select: { id: true },
    orderBy: { id: 'asc' }
  });
  console.log(`NFC roster IDs: ${nfcRosters.map(r => r.id).join(', ')}`);
  
  const afcRosters = await prisma.roster.findMany({
    where: { leagueId: '1263744209295245312' },
    select: { id: true },
    orderBy: { id: 'asc' }
  });
  console.log(`AFC roster IDs: ${afcRosters.map(r => r.id).join(', ')}`);
  
  // Check for collisions
  const nfcIds = new Set(nfcRosters.map(r => r.id));
  const afcIds = new Set(afcRosters.map(r => r.id));
  const collisions = [...nfcIds].filter(id => afcIds.has(id));
  
  if (collisions.length > 0) {
    console.log(`\n❌ COLLISION DETECTED! ${collisions.length} roster IDs overlap: ${collisions.join(', ')}`);
  } else {
    console.log('\n✅ No roster ID collisions detected');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
