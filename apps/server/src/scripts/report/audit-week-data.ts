#!/usr/bin/env tsx
import 'dotenv/config';
import prisma from '../../lib/prisma';

const GAUNTLET_LEAGUES = [
  { id: '1263744209295245312', name: 'Gauntlet AFC' },
  { id: '1263740549504962561', name: 'Gauntlet NFC' },
];

async function auditLeague(leagueId: string, week: number) {
  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  if (!league) {
    console.log(`League ${leagueId} not found`);
    return;
  }

  const [matchups, summaries, aggregates, liveSamples, projectionsCount] = await Promise.all([
    prisma.matchup.findMany({ where: { leagueId, week } }),
    prisma.matchupSummary.findMany({ where: { leagueId, week } }),
    prisma.rosterWeekAggregate.findMany({ where: { leagueId, week } }),
    prisma.liveWinProbSample.findMany({ where: { leagueId, week } }),
    prisma.playerStats.count({ where: { season: league.season, week, statsType: 'projections' } }),
  ]);

  console.log(`\n=== ${league.name} (${league.season}) — Week ${week} ===`);
  console.log(`Matchup rows: ${matchups.length}`);
  console.log(`MatchupSummary rows: ${summaries.length}`);
  console.log(`RosterWeekAggregate rows: ${aggregates.length}`);
  console.log(`LiveWinProbSample rows: ${liveSamples.length}`);
  console.log(`Player projections rows: ${projectionsCount}`);

  // Sample: first 3 matchups with basic fields
  console.table(
    matchups.slice(0, 6).map(m => ({
      matchupId: m.matchupId,
      rosterId: m.rosterId,
      week: m.week,
      points: m.points,
      startersCount: (m.starters || []).length,
    }))
  );

  // Sample: first 5 summaries
  console.table(
    summaries.slice(0, 5).map(s => ({
      matchupId: s.matchupId,
      rosterAId: s.rosterAId,
      rosterBId: s.rosterBId,
      pointsA: s.pointsA,
      pointsB: s.pointsB,
      margin: s.margin,
    }))
  );

  // Aggregates: first 8 rows
  console.table(
    aggregates.slice(0, 8).map(a => ({
      rosterId: a.rosterId,
      week: a.week,
      points: a.points,
      projectedPoints: a.projectedPoints,
      expectedWins: a.expectedWins,
      luck: a.luck,
    }))
  );

  // Live samples: first 6 rows
  console.table(
    liveSamples.slice(0, 6).map(s => ({
      matchupId: s.matchupId,
      gameProgress: s.gameProgress,
      winProbA: s.winProbA,
      currentScoreA: s.currentScoreA,
      currentScoreB: s.currentScoreB,
      timestamp: s.timestamp,
    }))
  );
}

async function main() {
  const week = Number(process.env.WEEK || 1);
  console.log('=== Report DB Audit ===');
  for (const l of GAUNTLET_LEAGUES) {
    await auditLeague(l.id, week);
  }
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
