import prisma from '../../lib/prisma.js';
import { createAPI } from '../data-ingestion/api.js';
import { createLogger } from '../data-ingestion/logger.js';

type ComputeOptions = {
  leagueId: string;
  season: number;
  week: number;
};

export async function computeWeeklyRollups({ leagueId, season, week }: ComputeOptions) {
  const logger = createLogger();
  const api = createAPI(logger);
  const db = prisma as any;

  // Load matchups and projections (best-effort for projections) and league settings
  const [matchups, projections, league] = await Promise.all([
    api.getMatchups(leagueId, week),
    api.getWeeklyProjections('regular', season, week).catch(() => ({}) as Record<string, unknown>),
    prisma.league.findUnique({ where: { id: leagueId } }),
  ]);

  // LeagueWeekSummary
  const rosterPoints = matchups.map(m => m.points || 0);
  const sorted = [...rosterPoints].sort((a, b) => a - b);
  const n = rosterPoints.length;
  const median =
    n === 0 ? 0 : n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const avg = n === 0 ? 0 : rosterPoints.reduce((a, b) => a + b, 0) / (n || 1);
  const variance =
    n <= 1 ? 0 : rosterPoints.reduce((acc, p) => acc + Math.pow(p - avg, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  const maxPoints = n === 0 ? 0 : Math.max(...rosterPoints);
  const minPoints = n === 0 ? 0 : Math.min(...rosterPoints);

  await db.leagueWeekSummary.upsert({
    where: { leagueId_week: { leagueId, week } },
    update: { medianPoints: median, averagePoints: avg, maxPoints, minPoints, stdDev },
    create: {
      leagueId,
      week,
      medianPoints: median,
      averagePoints: avg,
      maxPoints,
      minPoints,
      stdDev,
    },
  });

  // MatchupSummary: pair by matchup_id
  const groups = new Map<number, any[]>();
  for (const m of matchups as any[]) {
    if (m.matchup_id == null) continue;
    const g = groups.get(m.matchup_id) || [];
    g.push(m);
    groups.set(m.matchup_id, g);
  }

  for (const [matchupId, group] of groups) {
    const a: any = group[0];
    const b: any = group[1];
    if (!a || !b) continue;
    const pointsA = a.points || 0;
    const pointsB = b.points || 0;
    const winnerRosterId =
      pointsA === pointsB ? null : pointsA > pointsB ? a.roster_id : b.roster_id;
    const margin = Math.abs(pointsA - pointsB);
    await db.matchupSummary.upsert({
      where: { leagueId_week_matchupId: { leagueId, week, matchupId } },
      update: {
        rosterAId: a.roster_id,
        rosterBId: b.roster_id,
        pointsA,
        pointsB,
        winnerRosterId,
        margin,
      },
      create: {
        leagueId,
        week,
        matchupId,
        rosterAId: a.roster_id,
        rosterBId: b.roster_id,
        pointsA,
        pointsB,
        winnerRosterId,
        margin,
      },
    });
  }

  // RosterWeekAggregate: computed fields
  type RosterAgg = {
    points: number;
    opponentRosterId?: number;
    opponentPoints?: number;
    projectedPoints?: number | null;
    optimalPoints?: number | null;
    managerDelta?: number | null;
    managerScore?: number | null;
    positionalPoints?: Record<string, number> | null;
    opponentPositionalPoints?: Record<string, number> | null;
    mvpPlayerId?: string | null;
    mvpValue?: number | null;
    injuryPoints?: number | null;
    expectedWins?: number | null;
    luck?: number | null;
    rollingAvg3?: number | null;
  };

  const byRoster = new Map<number, RosterAgg>();

  // Helpers
  const getProjectedFantasyPoints = (proj: any): number => {
    if (!proj) return 0;
    if (typeof proj.pts_ppr === 'number') return proj.pts_ppr;
    if (typeof proj.fp === 'number') return proj.fp;
    return 0;
  };

  const projectionsAny = projections as Record<string, any>;

  for (const [, group] of groups) {
    const a: any = group[0];
    const b: any = group[1];
    if (!a || !b) continue;

    const initA: RosterAgg = {
      points: a.points || 0,
      opponentRosterId: b.roster_id,
      opponentPoints: b.points || 0,
    };
    const initB: RosterAgg = {
      points: b.points || 0,
      opponentRosterId: a.roster_id,
      opponentPoints: a.points || 0,
    };

    // Starter sets and player meta lookup
    const startersA = new Set<string>((a.starters || []).map(String));
    const startersB = new Set<string>((b.starters || []).map(String));
    const allIds = Array.from(
      new Set<string>([...(a.players || []), ...(b.players || [])].map(String))
    );
    const playersMeta = await prisma.player.findMany({
      where: { id: { in: allIds } },
      select: { id: true, position: true, injuryStatus: true },
    });
    const idToPos = new Map(playersMeta.map(p => [p.id, p.position]));
    const idToInjury = new Map(playersMeta.map(p => [p.id, p.injuryStatus ?? null]));

    const getPlayersPoints = (m: any): Record<string, number> =>
      (m.players_points || m.playersPoints || {}) as Record<string, number>;
    const ppA = getPlayersPoints(a);
    const ppB = getPlayersPoints(b);

    const groupPositional = (
      startersSet: Set<string>,
      playersPoints: Record<string, number>
    ): Record<string, number> => {
      const out: Record<string, number> = {};
      for (const [pid, ptsRaw] of Object.entries(playersPoints)) {
        if (!startersSet.has(String(pid))) continue;
        const pts = typeof ptsRaw === 'number' ? ptsRaw : 0;
        const pos = idToPos.get(String(pid)) || 'UNK';
        out[pos] = (out[pos] || 0) + pts;
      }
      return out;
    };

    initA.positionalPoints = groupPositional(startersA, ppA);
    initB.positionalPoints = groupPositional(startersB, ppB);
    initA.opponentPositionalPoints = initB.positionalPoints;
    initB.opponentPositionalPoints = initA.positionalPoints;

    // Projected starter totals
    const sumProjections = (startersSet: Set<string>): number => {
      let total = 0;
      for (const pid of startersSet) total += getProjectedFantasyPoints(projectionsAny[pid]);
      return total;
    };
    initA.projectedPoints = sumProjections(startersA);
    initB.projectedPoints = sumProjections(startersB);

    // MVP among starters by (actual - projected)
    const pickMvp = (
      startersSet: Set<string>,
      playersPoints: Record<string, number>
    ): { id: string | null; val: number | null } => {
      let bestId: string | null = null;
      let bestVal = -Infinity;
      for (const pid of startersSet) {
        const actual = typeof playersPoints[pid] === 'number' ? playersPoints[pid] : 0;
        const proj = getProjectedFantasyPoints(projectionsAny[pid]);
        const val = actual - proj;
        if (val > bestVal) {
          bestVal = val;
          bestId = pid;
        }
      }
      return { id: bestId, val: isFinite(bestVal) ? bestVal : null };
    };
    const mvpA = pickMvp(startersA, ppA);
    const mvpB = pickMvp(startersB, ppB);
    initA.mvpPlayerId = mvpA.id;
    initA.mvpValue = mvpA.val;
    initB.mvpPlayerId = mvpB.id;
    initB.mvpValue = mvpB.val;

    // Injury heuristic: injured or zero-actual starters → sum of max(0, proj - actual)
    const injuredFlags = new Set(['IR', 'Out', 'O', 'Inactive']);
    const injuryPoints = (
      startersSet: Set<string>,
      playersPoints: Record<string, number>
    ): number => {
      let total = 0;
      for (const pid of startersSet) {
        const actual = typeof playersPoints[pid] === 'number' ? playersPoints[pid] : 0;
        const proj = getProjectedFantasyPoints(projectionsAny[pid]);
        const status = (idToInjury.get(pid) || '').toString();
        if (injuredFlags.has(status) || actual === 0) total += Math.max(0, proj - actual);
      }
      return total;
    };
    initA.injuryPoints = injuryPoints(startersA, ppA);
    initB.injuryPoints = injuryPoints(startersB, ppB);

    // Optimal lineup using greedy fill across rosterPositions
    const rosterPositions = league?.rosterPositions || [];
    const computeOptimal = (
      allPlayers: string[],
      startersSet: Set<string>,
      playersPoints: Record<string, number>
    ): number => {
      const candidates = Array.from(new Set<string>(allPlayers.map(String)))
        .map(pid => ({
          pid,
          pos: idToPos.get(pid) || 'UNK',
          pts: typeof playersPoints[pid] === 'number' ? playersPoints[pid] : 0,
        }))
        .sort((x, y) => y.pts - x.pts);

      const flexPositions = new Set(['RB', 'WR', 'TE']);
      const dedicated: string[] = [];
      const flexSlots: number = rosterPositions.filter(p => p === 'FLEX').length;
      for (const p of rosterPositions) if (p !== 'FLEX') dedicated.push(p);

      const used = new Set<string>();
      let total = 0;
      const fillDedicated = (need: string) => {
        for (const c of candidates) {
          if (used.has(c.pid)) continue;
          if (c.pos !== need) continue;
          used.add(c.pid);
          total += c.pts;
          return true;
        }
        return false;
      };
      const fillFlex = () => {
        for (const c of candidates) {
          if (used.has(c.pid)) continue;
          if (!flexPositions.has(c.pos)) continue;
          used.add(c.pid);
          total += c.pts;
          return true;
        }
        return false;
      };

      for (const need of dedicated) fillDedicated(need);
      for (let i = 0; i < flexSlots; i++) fillFlex();
      return total;
    };
    initA.optimalPoints = computeOptimal((a.players || []).map(String), new Set<string>(), ppA);
    initB.optimalPoints = computeOptimal((b.players || []).map(String), new Set<string>(), ppB);

    // Manager metrics
    // Clamp to 0 to avoid negative deltas; lower delta is better
    initA.managerDelta = Math.max(0, (initA.optimalPoints || 0) - (initA.points || 0));
    initB.managerDelta = Math.max(0, (initB.optimalPoints || 0) - (initB.points || 0));
    const safeDiv = (num: number, den: number) => (den > 0 ? Math.min(1, num / den) : null);
    initA.managerScore = safeDiv(initA.points || 0, (initA.optimalPoints as number) || 0);
    initB.managerScore = safeDiv(initB.points || 0, (initB.optimalPoints as number) || 0);

    byRoster.set(a.roster_id, initA);
    byRoster.set(b.roster_id, initB);
  }

  // Compute expected wins (fractional), luck, rollingAvg3, streaks, and upsert
  const allPoints = Array.from(byRoster.values()).map((v: RosterAgg) => v.points || 0);
  for (const [rosterId, agg] of byRoster) {
    const won = (agg.points || 0) > (agg.opponentPoints || 0);
    let better = 0,
      ties = 0;
    for (const p of allPoints) {
      if (p < (agg.points || 0)) better++;
      else if (p === (agg.points || 0)) ties++;
    }
    const denom = Math.max(1, allPoints.length - 1);
    const expectedWins = (better + 0.5 * Math.max(0, ties - 1)) / denom;
    const luck = (won ? 1 : 0) - expectedWins;

    const prev = await db.rosterWeekAggregate.findMany({
      where: { leagueId, rosterId, week: { lt: week } },
      orderBy: { week: 'desc' },
      take: 2,
      select: { points: true },
    });
    const window = [agg.points || 0, ...prev.map((r: any) => r.points || 0)];
    const rollingAvg3 = window.reduce((a, b) => a + b, 0) / window.length;

    // Streaks: signed length
    const prevLast = await db.rosterWeekAggregate.findFirst({
      where: { leagueId, rosterId, week: { lt: week } },
      orderBy: { week: 'desc' },
      select: { streak: true, won: true },
    });
    let streak: number | null = null;
    if (won) {
      if (prevLast?.streak && prevLast.streak > 0) streak = prevLast.streak + 1;
      else streak = 1;
    } else {
      if (prevLast?.streak && prevLast.streak < 0) streak = prevLast.streak - 1;
      else streak = -1;
    }

    await db.rosterWeekAggregate.upsert({
      where: { leagueId_rosterId_week: { leagueId, rosterId, week } },
      update: {
        points: agg.points,
        opponentRosterId: agg.opponentRosterId,
        opponentPoints: agg.opponentPoints,
        won,
        streak,
        projectedPoints: agg.projectedPoints ?? null,
        optimalPoints: agg.optimalPoints ?? null,
        managerDelta: agg.managerDelta ?? null,
        managerScore: agg.managerScore ?? null,
        positionalPoints: (agg.positionalPoints as any) ?? null,
        opponentPositionalPoints: (agg.opponentPositionalPoints as any) ?? null,
        mvpPlayerId: agg.mvpPlayerId ?? null,
        mvpValue: agg.mvpValue ?? null,
        injuryPoints: agg.injuryPoints ?? null,
        expectedWins,
        luck,
        rollingAvg3,
      },
      create: {
        leagueId,
        rosterId,
        week,
        points: agg.points,
        opponentRosterId: agg.opponentRosterId,
        opponentPoints: agg.opponentPoints,
        won,
        streak,
        projectedPoints: agg.projectedPoints ?? null,
        optimalPoints: agg.optimalPoints ?? null,
        managerDelta: agg.managerDelta ?? null,
        managerScore: agg.managerScore ?? null,
        positionalPoints: (agg.positionalPoints as any) ?? null,
        opponentPositionalPoints: (agg.opponentPositionalPoints as any) ?? null,
        mvpPlayerId: agg.mvpPlayerId ?? null,
        mvpValue: agg.mvpValue ?? null,
        injuryPoints: agg.injuryPoints ?? null,
        expectedWins,
        luck,
        rollingAvg3,
      },
    });
  }

  // Power rank: z(AvgPtsToDate)*0.5 + z(ExpectedWinsCum)*0.3 + z(RollingAvg3)*0.2
  const thisWeek = await db.rosterWeekAggregate.findMany({
    where: { leagueId, week },
    select: { rosterId: true, rollingAvg3: true },
  });
  const metrics: { rosterId: number; avgPts: number; expCum: number; roll3: number }[] = [];
  for (const row of thisWeek) {
    const hist = await db.rosterWeekAggregate.findMany({
      where: { leagueId, rosterId: row.rosterId, week: { lte: week } },
      select: { points: true, expectedWins: true },
    });
    const avgPts = hist.length
      ? hist.reduce((a: number, r: any) => a + (r.points || 0), 0) / hist.length
      : 0;
    const expCum = hist.reduce((a: number, r: any) => a + (r.expectedWins || 0), 0);
    metrics.push({ rosterId: row.rosterId, avgPts, expCum, roll3: row.rollingAvg3 || 0 });
  }
  const zscore = (arr: number[]) => {
    const mu = arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
    const sd = Math.sqrt(
      arr.reduce((a, b) => a + Math.pow(b - mu, 2), 0) / Math.max(1, arr.length - 1) || 0
    );
    return arr.map(v => (sd === 0 ? 0 : (v - mu) / sd));
  };
  const zA = zscore(metrics.map(m => m.avgPts));
  const zE = zscore(metrics.map(m => m.expCum));
  const zR = zscore(metrics.map(m => m.roll3));
  for (let i = 0; i < metrics.length; i++) {
    const power = 0.5 * zA[i] + 0.3 * zE[i] + 0.2 * zR[i];
    await db.rosterWeekAggregate.update({
      where: { leagueId_rosterId_week: { leagueId, rosterId: metrics[i].rosterId, week } },
      data: { powerRank: power },
    });
  }
}

// Add CLI main for convenience
if (import.meta.url === `file://${process.argv[1]}`) {
  const leagueIds = ['1263744209295245312', '1263740549504962561'];
  const season = 2025;
  const week = Number(process.env.WEEK || 1);
  (async () => {
    for (const leagueId of leagueIds) {
      await computeWeeklyRollups({ leagueId, season, week });
      console.log(`Computed rollups for ${leagueId}, week ${week}`);
    }
    process.exit(0);
  })().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
