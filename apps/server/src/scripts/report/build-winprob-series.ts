#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import prisma from '../../lib/prisma.js';

type SeriesPoint = { timestamp: string; winProbA: number; winProbB: number; gameProgress: number };

async function main() {
  const week = Number(process.env.WEEK || 1);
  const leagueIds = ['1263744209295245312', '1263740549504962561'];

  // For each league, group MatchupOddsHistory by matchupId ordered by createdAt
  const result: Record<string, Record<number, SeriesPoint[]>> = {};
  for (const leagueId of leagueIds) {
    const rows = await (prisma as any).matchupOddsHistory.findMany({
      where: { leagueId, week },
      orderBy: { createdAt: 'asc' },
      select: {
        matchupId: true,
        createdAt: true,
        team1WinPct: true,
        team2WinPct: true,
        gameProgress: true,
      },
    });

    const byMatchup: Record<number, SeriesPoint[]> = {};
    for (const r of rows) {
      const list = byMatchup[r.matchupId] || [];
      list.push({
        timestamp: new Date(r.createdAt).toISOString(),
        winProbA: r.team1WinPct,
        winProbB: r.team2WinPct,
        gameProgress: r.gameProgress,
      });
      byMatchup[r.matchupId] = list;
    }
    result[leagueId] = byMatchup;
  }

  const outDir = path.join(process.cwd(), 'apps/web/data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'winprob-timeseries-week1.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
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
