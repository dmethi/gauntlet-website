#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import prisma from '../../lib/prisma.js';

async function main() {
  const week = Number(process.env.WEEK || 1);
  const season = '2025';
  const leagues = [
    { id: '1263744209295245312', name: 'Gauntlet AFC' },
    { id: '1263740549504962561', name: 'Gauntlet NFC' },
  ];

  // Load cached player stats/projections
  const dataDir = path.join(process.cwd(), 'apps/web/data');
  const statsPath = path.join(dataDir, `playerstats-${season}-week${week}-stats.json`);
  const projPath = path.join(dataDir, `playerstats-${season}-week${week}-projections.json`);
  const winprobPath = path.join(dataDir, 'winprob-timeseries-week1.json');

  const stats = fs.existsSync(statsPath) ? JSON.parse(fs.readFileSync(statsPath, 'utf8')) : {};
  const projections = fs.existsSync(projPath) ? JSON.parse(fs.readFileSync(projPath, 'utf8')) : [];
  const winprob = fs.existsSync(winprobPath)
    ? JSON.parse(fs.readFileSync(winprobPath, 'utf8'))
    : {};

  // Pull DB data for week 1
  const leagueData: any[] = [];
  for (const lg of leagues) {
    const [league, matchups, summaries, aggregates, oddsHistory] = await Promise.all([
      prisma.league.findUnique({
        where: { id: lg.id },
        include: { rosters: { include: { owner: true } } },
      }),
      prisma.matchup.findMany({
        where: { leagueId: lg.id, week },
        orderBy: [{ matchupId: 'asc' }, { rosterId: 'asc' }],
      }),
      (prisma as any).matchupSummary.findMany({
        where: { leagueId: lg.id, week },
        orderBy: { matchupId: 'asc' },
      }),
      (prisma as any).rosterWeekAggregate.findMany({
        where: { leagueId: lg.id, week },
        orderBy: { rosterId: 'asc' },
      }),
      (prisma as any).matchupOddsHistory.findMany({
        where: { leagueId: lg.id, week },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    leagueData.push({ league, matchups, summaries, aggregates, oddsHistory });
  }

  // Compose unified JSON
  const out = {
    meta: {
      season,
      week,
      generatedAt: new Date().toISOString(),
    },
    leagues: leagueData.map(ld => ({
      leagueId: ld.league.id,
      leagueName: ld.league.name,
      scoringSettings: ld.league.scoringSettings,
      rosterPositions: ld.league.rosterPositions,
      rosters: ld.league.rosters.map((r: any) => ({
        rosterId: r.id,
        owner: r.owner?.displayName || r.owner?.username || null,
        teamName: r.owner?.metadata?.team_name || null,
        starters: r.starters,
        players: r.players,
      })),
      matchups: ld.matchups,
      matchupSummaries: ld.summaries,
      rosterWeekAggregates: ld.aggregates,
      winProbSnapshots: ld.oddsHistory,
      winProbSeries: winprob[ld.league.id] || {},
    })),
    playerData: {
      projections,
      stats,
    },
  };

  const outDir = path.join(process.cwd(), 'apps/web/data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `report-week${week}.json`);
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`Wrote ${outPath}`);
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
