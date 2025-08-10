import 'dotenv/config';
import prisma from '../lib/prisma.js';

type Range = number[];

function parseWeeks(input: string | undefined): Range | null {
  if (!input) return null;
  const s = input.trim();
  if (s.includes('-')) {
    const [a, b] = s.split('-').map(v => Number(v.trim()));
    if (Number.isFinite(a) && Number.isFinite(b)) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    }
  } else if (s.includes(',')) {
    return s
      .split(',')
      .map(v => Number(v.trim()))
      .filter(v => Number.isFinite(v));
  } else if (/^\d+$/.test(s)) {
    return [Number(s)];
  }
  return null;
}

async function hydrateWeeklyMetrics() {
  const leagueIdFilter = process.env.HYDRATE_LEAGUE_ID || process.env.LEAGUE_ID;
  const seasonFilter = process.env.HYDRATE_SEASON || process.env.SEASON;
  const weekRange = parseWeeks(process.env.HYDRATE_WEEKS || process.env.WEEKS);

  // Select leagues
  const leagues = await prisma.league.findMany({
    where: {
      id: leagueIdFilter || undefined,
      season: seasonFilter || undefined,
    },
    select: { id: true, season: true, name: true },
    orderBy: [{ season: 'desc' }, { name: 'asc' }],
  });

  if (leagues.length === 0) {
    console.log('No leagues found for filters.');
    return;
  }

  let totalUpserts = 0;

  for (const lg of leagues) {
    console.log(`\nHydrating WeeklyMetrics for league ${lg.name} (${lg.season}) [${lg.id}]`);

    // Determine weeks to process
    let weeks: number[];
    if (weekRange && weekRange.length > 0) {
      weeks = weekRange;
    } else {
      const distinctWeeks = await (prisma as any).rosterWeekAggregate.findMany({
        where: { leagueId: lg.id },
        select: { week: true },
        distinct: ['week'],
        orderBy: { week: 'asc' },
      });
      weeks = distinctWeeks.map((w: any) => w.week);
    }

    console.log('Weeks:', weeks);

    for (const w of weeks) {
      const rows = await (prisma as any).rosterWeekAggregate.findMany({
        where: { leagueId: lg.id, week: w },
        select: {
          rosterId: true,
          points: true,
          expectedWins: true,
          luck: true,
          opponentPoints: true,
        },
      });

      for (const r of rows) {
        await prisma.weeklyMetrics.upsert({
          where: { leagueId_rosterId_week: { leagueId: lg.id, rosterId: r.rosterId, week: w } },
          update: {
            totalPoints: r.points ?? 0,
            expectedWins: r.expectedWins ?? 0,
            luckRating: r.luck ?? 0,
            opponentPoints: r.opponentPoints ?? 0,
          },
          create: {
            leagueId: lg.id,
            rosterId: r.rosterId,
            week: w,
            totalPoints: r.points ?? 0,
            expectedWins: r.expectedWins ?? 0,
            luckRating: r.luck ?? 0,
            opponentPoints: r.opponentPoints ?? 0,
          },
        });
        totalUpserts++;
      }
      console.log(`Week ${w}: upserted ${rows.length} WeeklyMetrics rows`);
    }
  }

  console.log(`\nHydration complete. Total upserts: ${totalUpserts}`);
}

hydrateWeeklyMetrics()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
