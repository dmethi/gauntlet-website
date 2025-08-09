import 'dotenv/config';
import prisma from '../../lib/prisma.js';

type Options = { leagueId: string; season: string };

export async function computeSeasonSuperlatives({ leagueId, season }: Options) {
  const db = prisma as any;

  // Clear existing for idempotency (optional)
  await db.seasonSuperlatives.deleteMany({ where: { leagueId, season } });

  const weeks = await db.leagueWeekSummary.findMany({
    where: { leagueId },
    select: { week: true },
  });
  const maxWeek = weeks.length ? Math.max(...weeks.map((w: any) => w.week)) : 18;

  // Load all roster-week aggregates
  const rows = await db.rosterWeekAggregate.findMany({
    where: { leagueId, week: { lte: maxWeek } },
  });

  const insert = async (category: string, payload: any) => {
    await db.seasonSuperlatives.create({ data: { leagueId, season, category, ...payload } });
  };

  // Highest/lowest single-week score
  const highest = rows.reduce(
    (a: any, r: any) => (r.points > (a?.points ?? -Infinity) ? r : a),
    null
  );
  const lowest = rows.reduce(
    (a: any, r: any) => (r.points < (a?.points ?? Infinity) ? r : a),
    null
  );
  if (highest)
    await insert('highest_single_week', {
      week: highest.week,
      rosterId: highest.rosterId,
      value: highest.points,
    });
  if (lowest)
    await insert('lowest_single_week', {
      week: lowest.week,
      rosterId: lowest.rosterId,
      value: lowest.points,
    });

  // Most points in loss / least points in win
  const losses = rows.filter((r: any) => r.won === false);
  const wins = rows.filter((r: any) => r.won === true);
  const mostInLoss = losses.reduce(
    (a: any, r: any) => (r.points > (a?.points ?? -Infinity) ? r : a),
    null
  );
  const leastInWin = wins.reduce(
    (a: any, r: any) => (r.points < (a?.points ?? Infinity) ? r : a),
    null
  );
  if (mostInLoss)
    await insert('most_points_in_loss', {
      week: mostInLoss.week,
      rosterId: mostInLoss.rosterId,
      value: mostInLoss.points,
    });
  if (leastInWin)
    await insert('least_points_in_win', {
      week: leastInWin.week,
      rosterId: leastInWin.rosterId,
      value: leastInWin.points,
    });

  // Largest blowout and closest win (from MatchupSummary)
  const matchups = await db.matchupSummary.findMany({
    where: { leagueId },
    select: {
      week: true,
      margin: true,
      rosterAId: true,
      rosterBId: true,
      pointsA: true,
      pointsB: true,
      winnerRosterId: true,
    },
  });
  const largest = matchups.reduce(
    (a: any, m: any) => (m.margin > (a?.margin ?? -Infinity) ? m : a),
    null
  );
  const closest = matchups
    .filter((m: any) => m.margin > 0)
    .reduce((a: any, m: any) => (m.margin < (a?.margin ?? Infinity) ? m : a), null);
  if (largest)
    await insert('largest_blowout', {
      week: largest.week,
      matchupId: 0,
      rosterId: largest.winnerRosterId,
      value: largest.margin,
    });
  if (closest)
    await insert('closest_win', {
      week: closest.week,
      matchupId: 0,
      rosterId: closest.winnerRosterId,
      value: closest.margin,
    });

  // Rolling windows: highest 3-week and 5-week totals per roster
  const byRoster = new Map<number, any[]>();
  for (const r of rows) {
    const arr = byRoster.get(r.rosterId) || [];
    arr.push(r);
    byRoster.set(r.rosterId, arr);
  }
  let best3: any = null,
    best5: any = null;
  for (const [rosterId, arr] of byRoster) {
    arr.sort((a, b) => a.week - b.week);
    for (let i = 0; i < arr.length; i++) {
      const w3 = arr.slice(i, i + 3);
      if (w3.length === 3) {
        const sum3 = w3.reduce((s, r) => s + (r.points || 0), 0);
        if (!best3 || sum3 > best3.value) best3 = { rosterId, week: w3[2].week, value: sum3 };
      }
      const w5 = arr.slice(i, i + 5);
      if (w5.length === 5) {
        const sum5 = w5.reduce((s, r) => s + (r.points || 0), 0);
        if (!best5 || sum5 > best5.value) best5 = { rosterId, week: w5[4].week, value: sum5 };
      }
    }
  }
  if (best3) await insert('highest_3_week_total', best3);
  if (best5) await insert('highest_5_week_total', best5);

  // Bench blunders: max (optimalPoints - points)
  const withOptimal = rows.filter((r: any) => r.optimalPoints != null && r.points != null);
  const worstBench = withOptimal.reduce(
    (a: any, r: any) =>
      r.optimalPoints - r.points > (a?.optimalPoints - a?.points || -Infinity) ? r : a,
    null
  );
  if (worstBench)
    await insert('biggest_bench_blunder', {
      rosterId: worstBench.rosterId,
      week: worstBench.week,
      value: worstBench.optimalPoints - worstBench.points,
    });

  // Positional highs/lows in a week (based on positionalPoints)
  const positions = ['QB', 'RB', 'WR', 'TE', 'DEF'];
  for (const pos of positions) {
    const bestPosWeek = rows.reduce((a: any, r: any) => {
      const pts = (r.positionalPoints && r.positionalPoints[pos]) || 0;
      if (a == null) return { r, pts };
      return pts > a.pts ? { r, pts } : a;
    }, null);
    if (bestPosWeek && bestPosWeek.pts > 0)
      await insert(`highest_single_week_${pos.toLowerCase()}`, {
        rosterId: bestPosWeek.r.rosterId,
        week: bestPosWeek.r.week,
        value: bestPosWeek.pts,
      });

    const worstPosWeek = rows.reduce((a: any, r: any) => {
      const pts = (r.positionalPoints && r.positionalPoints[pos]) || 0;
      if (a == null) return { r, pts };
      return pts < a.pts ? { r, pts } : a;
    }, null);
    if (worstPosWeek)
      await insert(`lowest_single_week_${pos.toLowerCase()}`, {
        rosterId: worstPosWeek.r.rosterId,
        week: worstPosWeek.r.week,
        value: worstPosWeek.pts,
      });
  }

  // Positional season totals (sum across all weeks)
  const totalsByRoster: Map<number, Record<string, number>> = new Map();
  for (const r of rows) {
    const agg = totalsByRoster.get(r.rosterId) || {};
    const pp = (r as any).positionalPoints || {};
    for (const pos of positions) {
      const v = Number(pp[pos] || 0);
      if (!Number.isFinite(v)) continue;
      agg[pos] = (agg[pos] || 0) + v;
    }
    totalsByRoster.set(r.rosterId, agg);
  }
  for (const pos of positions) {
    let best: { rosterId: number; value: number } | null = null;
    let worst: { rosterId: number; value: number } | null = null;
    for (const [rosterId, totals] of totalsByRoster) {
      const val = totals[pos] || 0;
      if (best == null || val > best.value) best = { rosterId, value: val };
      if (worst == null || val < worst.value) worst = { rosterId, value: val };
    }
    if (best)
      await insert(`highest_season_total_${pos.toLowerCase()}`, {
        rosterId: best.rosterId,
        value: best.value,
      });
    if (worst)
      await insert(`lowest_season_total_${pos.toLowerCase()}`, {
        rosterId: worst.rosterId,
        value: worst.value,
      });
  }

  // Streaks
  const longestWin = rows.reduce(
    (a: any, r: any) => (r.streak && r.streak > (a?.streak ?? -Infinity) ? r : a),
    null
  );
  const longestLose = rows.reduce(
    (a: any, r: any) => (r.streak && r.streak < (a?.streak ?? Infinity) ? r : a),
    null
  );
  if (longestWin)
    await insert('longest_win_streak', {
      rosterId: longestWin.rosterId,
      week: longestWin.week,
      value: longestWin.streak,
    });
  if (longestLose)
    await insert('longest_lose_streak', {
      rosterId: longestLose.rosterId,
      week: longestLose.week,
      value: longestLose.streak,
    });

  // Managerial
  // With managerDelta clamped to >= 0, smaller is better
  const bestManager = rows.reduce((a: any, r: any) => {
    if (r.managerDelta == null) return a;
    if (a == null) return r;
    return r.managerDelta < a.managerDelta ? r : a;
  }, null);
  const worstManager = rows.reduce((a: any, r: any) => {
    if (r.managerDelta == null) return a;
    if (a == null) return r;
    return r.managerDelta > a.managerDelta ? r : a;
  }, null);
  if (bestManager)
    await insert('best_manager_week', {
      rosterId: bestManager.rosterId,
      week: bestManager.week,
      value: bestManager.managerDelta,
    });
  if (worstManager)
    await insert('worst_manager_week', {
      rosterId: worstManager.rosterId,
      week: worstManager.week,
      value: worstManager.managerDelta,
    });

  // Luck
  const luckiest = rows.reduce(
    (a: any, r: any) => ((r.luck ?? -Infinity) > (a?.luck ?? -Infinity) ? r : a),
    null
  );
  const unluckiest = rows.reduce(
    (a: any, r: any) => ((r.luck ?? Infinity) < (a?.luck ?? Infinity) ? r : a),
    null
  );
  if (luckiest)
    await insert('luckiest_week', {
      rosterId: luckiest.rosterId,
      week: luckiest.week,
      value: luckiest.luck,
    });
  if (unluckiest)
    await insert('unluckiest_week', {
      rosterId: unluckiest.rosterId,
      week: unluckiest.week,
      value: unluckiest.luck,
    });
}

if (process.env.SUPER_LEAGUE_ID && process.env.SUPER_SEASON) {
  computeSeasonSuperlatives({
    leagueId: process.env.SUPER_LEAGUE_ID,
    season: process.env.SUPER_SEASON,
  })
    .then(() => {
      console.log('Season superlatives computed.');
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
