#!/usr/bin/env tsx
import prisma from '../../lib/prisma';
import { ReportWeekData, MatchupFacts, TeamFacts } from '../../../../packages/lib/src/report/types';

async function main() {
  const leagueId = process.env.LEAGUE_ID as string;
  const season = Number(process.env.SEASON || 2024);
  const week = Number(process.env.WEEK || 1);
  if (!leagueId) {
    console.error('LEAGUE_ID is required');
    process.exit(1);
  }

  // Pull MatchupSummary and RosterWeekAggregate
  const [matchups, aggregates, league] = await Promise.all([
    prisma.matchupSummary.findMany({ where: { leagueId, week } }),
    prisma.rosterWeekAggregate.findMany({ where: { leagueId, week } }),
    prisma.league.findUnique({
      where: { id: leagueId },
      include: { rosters: { include: { owner: true } } },
    }),
  ] as const);

  const rosterIdToName = new Map<number, string>();
  const rosterIdToOwner = new Map<number, string | null>();
  const rosterIdToDivision = new Map<number, string | null>();
  for (const r of league?.rosters || []) {
    rosterIdToName.set(
      Number(r.id),
      r.owner?.metadata?.team_name || r.owner?.displayName || r.owner?.username || `Team ${r.id}`
    );
    rosterIdToOwner.set(Number(r.id), r.owner?.displayName || r.owner?.username || null);
    // @ts-ignore settings may exist
    rosterIdToDivision.set(Number(r.id), (r as any)?.settings?.division || null);
  }

  // Build matchup facts
  const matchupFacts: MatchupFacts[] = matchups.map(m => {
    const teamAName = rosterIdToName.get(m.rosterAId) || `Team ${m.rosterAId}`;
    const teamBName = rosterIdToName.get(m.rosterBId) || `Team ${m.rosterBId}`;
    return {
      leagueId,
      week,
      matchupId: m.matchupId,
      rosterAId: m.rosterAId,
      rosterBId: m.rosterBId,
      teamAName,
      teamBName,
      scoreA: m.pointsA || 0,
      scoreB: m.pointsB || 0,
      winnerRosterId: m.winnerRosterId,
      margin: Math.abs((m.pointsA || 0) - (m.pointsB || 0)),
      // These can be enriched later by specific detectors (kicker/DEF swing, bench deltas)
      decidingFactors: [],
      topPerformers: [],
      duds: [],
      startSitNotes: [],
    };
  });

  // Build team-level facts for season-to-date (up to week)
  const seasonAggs = await prisma.rosterWeekAggregate.findMany({
    where: { leagueId, week: { lte: week } },
    orderBy: { week: 'asc' },
  });
  const byRoster = new Map<number, typeof seasonAggs>();
  for (const a of seasonAggs) {
    const list = (byRoster.get(a.rosterId) || []) as any[];
    list.push(a);
    byRoster.set(a.rosterId, list as any);
  }

  const teamFacts: TeamFacts[] = [];
  for (const [rosterId, rows] of byRoster.entries()) {
    const played = rows.filter(r => r.week >= 1);
    const wins = played.reduce((c, r) => c + (r.won ? 1 : 0), 0);
    const losses = played.length - wins;
    const totalPoints = played.reduce((s, r) => s + (r.points || 0), 0);
    const expectedWins = played.reduce((s, r) => s + (r.expectedWins || 0), 0);
    const luckRating = played.reduce((s, r) => s + (r.luck || 0), 0);
    const pointsArr = played.map(r => r.points || 0);
    const mean = pointsArr.length ? pointsArr.reduce((a, b) => a + b, 0) / pointsArr.length : 0;
    const variance =
      pointsArr.length > 1
        ? pointsArr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (pointsArr.length - 1)
        : 0;
    const volatility = Math.sqrt(variance);
    const rolling3 =
      played.slice(-3).reduce((s, r) => s + (r.points || 0), 0) /
      Math.max(1, Math.min(3, played.length));
    const over110 = played.filter(r => (r.points || 0) >= 110).length;
    const over120 = played.filter(r => (r.points || 0) >= 120).length;
    const under100 = played.filter(r => (r.points || 0) < 100).length;
    teamFacts.push({
      rosterId,
      name: rosterIdToName.get(rosterId) || `Team ${rosterId}`,
      owner: rosterIdToOwner.get(rosterId) || null,
      division: rosterIdToDivision.get(rosterId) || null,
      wins,
      losses,
      totalPoints,
      expectedWins,
      luckRating,
      over110Count: over110,
      over120Count: over120,
      under100Count: under100,
      rollingAvg3: rolling3,
      volatility,
    });
  }

  const data: ReportWeekData = {
    leagueId,
    season,
    week,
    matchups: matchupFacts,
    teams: teamFacts,
    features: {
      matchupOfTheWeek: matchupFacts.length
        ? matchupFacts.reduce(
            (best, cur) =>
              cur.margin < (byIdMargin(best, matchupFacts) ?? Infinity) ? cur.matchupId : best,
            matchupFacts[0].matchupId
          )
        : null,
    },
  };

  // Output to stdout
  process.stdout.write(JSON.stringify(data, null, 2));
}

function byIdMargin(id: number | null | undefined, list: MatchupFacts[]): number | null {
  if (id == null) return null;
  const m = list.find(x => x.matchupId === id);
  return m ? m.margin : null;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
