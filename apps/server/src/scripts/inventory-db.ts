import 'dotenv/config';
import prisma from '../lib/prisma.js';

type TableCount = { table: string; rows: number };

async function safeCount(modelKey: string): Promise<number> {
  try {
    const model: any = (prisma as any)[modelKey];
    if (!model || typeof model.count !== 'function') return -1;
    return await model.count();
  } catch {
    return -1;
  }
}

async function safeGetGlobalCounts(): Promise<TableCount[]> {
  const modelKeys = [
    'league',
    'user',
    'roster',
    'matchup',
    'player',
    'playerStats',
    'weeklyMetrics',
    'draft',
    'draftPick',
    'transaction',
    'tradedPick',
    'positionVariance',
    'playerVariance',
    'projectionError',
    'matchupSummary',
    'rosterWeekAggregate',
    'leagueWeekSummary',
    'liveWinProbSample',
    'playerStatusHistory',
    'seasonSuperlatives',
    // Added odds/simulation tables for auditing GitHub Actions outputs
    'matchupSimulation',
    'matchupOddsHistory',
    'leagueOddsHistory',
  ];
  const counts: TableCount[] = [];
  for (const key of modelKeys) {
    const rows = await safeCount(key);
    counts.push({ table: key, rows });
  }
  return counts;
}

async function inventoryByLeague(leagueId: string) {
  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  if (!league) {
    console.log(`League ${leagueId} not found`);
    return;
  }

  const [rosterCount, matchupCount, transactionCount, draftCount] = await Promise.all([
    prisma.roster.count({ where: { leagueId } }),
    prisma.matchup.count({ where: { leagueId } }),
    prisma.transaction.count({ where: { leagueId } }),
    prisma.draft.count({ where: { leagueId } }),
  ]);

  const distinctWeeks = await prisma.matchup.findMany({
    where: { leagueId },
    select: { week: true },
    distinct: ['week'],
    orderBy: { week: 'asc' },
  });

  let leagueWeekSummaries: any[] = [];
  let rosterWeekAggregates: any[] = [];
  let matchupSummaries: any[] = [];
  try {
    [leagueWeekSummaries, rosterWeekAggregates, matchupSummaries] = await Promise.all([
      (prisma as any).leagueWeekSummary?.findMany?.({
        where: { leagueId },
        select: { week: true, averagePoints: true, medianPoints: true },
        orderBy: { week: 'asc' },
      }) ?? [],
      (prisma as any).rosterWeekAggregate?.findMany?.({
        where: { leagueId },
        select: {
          rosterId: true,
          week: true,
          points: true,
          projectedPoints: true,
          expectedWins: true,
        },
        orderBy: [{ rosterId: 'asc' }, { week: 'asc' }],
        take: 20,
      }) ?? [],
      (prisma as any).matchupSummary?.findMany?.({
        where: { leagueId },
        select: { week: true, matchupId: true, pointsA: true, pointsB: true, margin: true },
        orderBy: [{ week: 'asc' }, { matchupId: 'asc' }],
        take: 20,
      }) ?? [],
    ]);
  } catch {
    // ignore missing analytics tables
  }

  const sampleRoster = await prisma.roster.findFirst({
    where: { leagueId },
    include: { owner: true },
  });

  console.log(`\n=== League: ${league.name} (${league.season}) [${league.id}] ===`);
  console.log({ rosterCount, matchupCount, transactionCount, draftCount });
  console.log(
    'Weeks with matchups:',
    distinctWeeks.map(w => w.week)
  );
  console.log(
    'Sample roster:',
    sampleRoster
      ? {
          id: sampleRoster.id,
          owner: sampleRoster.owner?.displayName || sampleRoster.owner?.username,
          startersCount: sampleRoster.starters?.length ?? 0,
          playersCount: sampleRoster.players?.length ?? 0,
        }
      : null
  );
  console.log('\nLeagueWeekSummary (first 10 rows):');
  console.table(leagueWeekSummaries.slice(0, 10));
  console.log('\nRosterWeekAggregate (sample up to 20 rows):');
  console.table(rosterWeekAggregates);
  console.log('\nMatchupSummary (sample up to 20 rows):');
  console.table(matchupSummaries);
}

async function inventoryPlayersAndStats() {
  const playerCount = await prisma.player.count();
  const samplePlayers = await prisma.player.findMany({
    select: { id: true, fullName: true, position: true, team: true },
    take: 10,
  });

  const seasons = await prisma.playerStats.findMany({
    select: { season: true },
    distinct: ['season'],
    orderBy: { season: 'asc' },
  });
  const weeks = await prisma.playerStats.findMany({
    select: { week: true },
    distinct: ['week'],
    orderBy: { week: 'asc' },
  });
  const [statsRows, projRows] = await Promise.all([
    prisma.playerStats.count({ where: { statsType: 'stats' } }),
    prisma.playerStats.count({ where: { statsType: 'projections' } }),
  ]);

  console.log('\n=== Players & PlayerStats ===');
  console.log({ playerCount, playerStats: statsRows + projRows, statsRows, projRows });
  console.log(
    'PlayerStats seasons:',
    seasons.map(s => s.season)
  );
  console.log(
    'PlayerStats weeks:',
    weeks.map(w => w.week)
  );
  console.log('Sample players:');
  console.table(samplePlayers);
}

async function inventoryLiveSamples() {
  try {
    const count = await (prisma as any).liveWinProbSample.count();
    const weeks = await (prisma as any).liveWinProbSample.findMany({
      select: { week: true },
      distinct: ['week'],
      orderBy: { week: 'asc' },
    });
    const sample = await (prisma as any).liveWinProbSample.findMany({
      take: 10,
      orderBy: [{ week: 'asc' }, { timestamp: 'asc' }],
    });

    console.log('\n=== LiveWinProbSample ===');
    console.log({ count, weeks: weeks.map((w: any) => w.week) });
    if (sample.length > 0) {
      console.table(
        sample.map((r: any) => ({
          leagueId: r.leagueId,
          week: r.week,
          matchupId: r.matchupId,
          rosterAId: r.rosterAId,
          rosterBId: r.rosterBId,
          gameProgress: r.gameProgress,
          winProbA: r.winProbA,
          winProbB: r.winProbB,
          currentScoreA: r.currentScoreA,
          currentScoreB: r.currentScoreB,
          timestamp: r.timestamp,
        }))
      );
    }
  } catch {
    console.log('\n=== LiveWinProbSample ===');
    console.log({ count: -1 });
  }
}

async function inventoryOddsAndSims() {
  try {
    const db: any = prisma as any;
    const [simCount, matchupHistCount, leagueHistCount] = await Promise.all([
      db.matchupSimulation?.count?.() ?? Promise.resolve(-1),
      db.matchupOddsHistory?.count?.() ?? Promise.resolve(-1),
      db.leagueOddsHistory?.count?.() ?? Promise.resolve(-1),
    ]);

    const [simWeeks, matchupHistWeeks, leagueHistWeeks] = await Promise.all([
      db.matchupSimulation?.findMany?.({
        select: { week: true },
        distinct: ['week'],
        orderBy: { week: 'asc' },
      }) ?? [],
      db.matchupOddsHistory?.findMany?.({
        select: { week: true },
        distinct: ['week'],
        orderBy: { week: 'asc' },
      }) ?? [],
      db.leagueOddsHistory?.findMany?.({
        select: { week: true },
        distinct: ['week'],
        orderBy: { week: 'asc' },
      }) ?? [],
    ]);

    const week1 = 1;
    const [simWeek1, matchupHistWeek1, leagueHistWeek1] = await Promise.all([
      db.matchupSimulation?.count?.({ where: { week: week1 } }) ?? Promise.resolve(-1),
      db.matchupOddsHistory?.count?.({ where: { week: week1 } }) ?? Promise.resolve(-1),
      db.leagueOddsHistory?.count?.({ where: { week: week1 } }) ?? Promise.resolve(-1),
    ]);

    console.log('\n=== Odds & Simulations ===');
    console.log({ simCount, matchupHistCount, leagueHistCount });
    console.log(
      'Weeks with MatchupSimulation:',
      simWeeks.map((w: any) => w.week)
    );
    console.log(
      'Weeks with MatchupOddsHistory:',
      matchupHistWeeks.map((w: any) => w.week)
    );
    console.log(
      'Weeks with LeagueOddsHistory:',
      leagueHistWeeks.map((w: any) => w.week)
    );
    console.log('Week 1 counts:', { simWeek1, matchupHistWeek1, leagueHistWeek1 });
  } catch {
    console.log('\n=== Odds & Simulations ===');
    console.log({ error: 'tables not available' });
  }
}

async function inventoryDb() {
  try {
    const specificLeagueId = process.env.LEAGUE_ID;

    console.log('--- Database Inventory ---');
    try {
      const tables = (await prisma.$queryRawUnsafe(
        'select table_name from information_schema.tables where table_schema = current_schema() order by table_name'
      )) as Array<{ table_name: string }>;
      console.log('\nTables in DB schema:');
      console.table(tables.map(t => t.table_name));
    } catch {
      // provider may restrict information_schema access
    }
    const counts = await safeGetGlobalCounts();
    console.table(counts);

    const leagues = await prisma.league.findMany({
      select: { id: true, name: true, season: true, totalRosters: true },
      orderBy: [{ season: 'desc' }, { name: 'asc' }],
    });
    console.log('\n=== Leagues ===');
    console.table(leagues);

    if (specificLeagueId) {
      await inventoryByLeague(specificLeagueId);
    } else {
      for (const league of leagues.slice(0, 5)) {
        await inventoryByLeague(league.id);
      }
    }

    await inventoryPlayersAndStats();
    await inventoryLiveSamples();
    await inventoryOddsAndSims();

    console.log('\n--- Inventory Complete ---');
  } catch (error) {
    console.error('Error during inventory:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

inventoryDb();
