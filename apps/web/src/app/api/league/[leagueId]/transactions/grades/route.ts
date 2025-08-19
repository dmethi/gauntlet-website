import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function POST(request: Request, { params }: { params: { leagueId: string } }) {
  const { leagueId } = params;
  try {
    const prisma = await getPrisma();
    const url = new URL(request.url);
    const limit = Math.min(10000, Math.max(1, Number(url.searchParams.get('limit') || 5)));
    const offset = Math.max(0, Number(url.searchParams.get('offset') || 0));
    const teamFilter = url.searchParams.get('team');
    const posFilter = url.searchParams.get('pos');
    const typeFilter = url.searchParams.get('type');

    const where: any = { leagueId, NOT: { status: 'failed' } };
    if (typeFilter && typeFilter !== 'ALL') where.type = typeFilter;
    const txns = await prisma.transaction.findMany({
      where,
      orderBy: [{ transactionAt: 'desc' }, { createdAt: 'desc' }],
      skip: offset,
      take: limit,
    });

    type PlayerLite = { id: string; fullName: string; position: string; team: string | null };
    const playerIds = new Set<string>();
    const collect = (mapping: Prisma.JsonValue | null, _rids?: number[] | null) => {
      if (Array.isArray(mapping)) {
        for (const pid of mapping as Array<string | number>) playerIds.add(String(pid));
      } else if (mapping && typeof mapping === 'object') {
        for (const pid of Object.keys(mapping as Prisma.JsonObject)) playerIds.add(String(pid));
      }
    };
    for (const t of txns) {
      collect(t.adds as Prisma.JsonValue | null, t.rosterIds);
      collect(t.drops as Prisma.JsonValue | null, t.rosterIds);
    }

    const players = playerIds.size
      ? await prisma.player.findMany({ where: { id: { in: Array.from(playerIds) } } })
      : [];
    const idToPlayer: Record<string, PlayerLite> = Object.fromEntries(
      players.map(p => [
        String(p.id),
        { id: p.id, fullName: p.fullName, position: p.position, team: p.team },
      ])
    );
    // DEF placeholders
    playerIds.forEach(pid => {
      if (/^[A-Z]{2,3}$/.test(pid) && !idToPlayer[pid]) {
        idToPlayer[pid] = { id: pid, fullName: `${pid} D/ST`, position: 'DEF', team: pid };
      }
    });

    const matchups = await prisma.matchup.findMany({ where: { leagueId: String(leagueId) } });
    const playoffWeeks = [15, 16, 17];
    const season = String(
      (await prisma.league.findFirst({ where: { id: String(leagueId) }, select: { season: true } }))
        ?.season || ''
    );
    const ps = await prisma.playerStats.findMany({
      where: {
        season,
        week: { in: playoffWeeks },
        statsType: 'stats',
        playerId: { in: Array.from(playerIds) },
      },
      select: { playerId: true, week: true, stats: true },
    });
    const playoffStatsByPlayer = new Map<string, number>();
    for (const row of ps) {
      const s = row.stats as any;
      const pts = (s?.pts_half_ppr ?? s?.pts_ppr ?? s?.pts_std ?? 0) as number;
      playoffStatsByPlayer.set(
        row.playerId,
        (playoffStatsByPlayer.get(row.playerId) || 0) + Number(pts || 0)
      );
    }

    // New outcome-only grading implementation per spec
    // Build starters and points indexes per (week, roster)
    const startersByWeekRoster = new Map<string, Set<string>>();
    const pointsByWeekRosterPlayer = new Map<string, number>();
    const rosterPlayerWeeks = new Map<string, Set<number>>();
    const groupByWeekMatchup: Record<string, number[]> = {};
    for (const m of matchups) {
      const key = `${m.week}:${m.rosterId}`;
      const starters = ((m.starters as unknown as string[]) || []).map(String);
      startersByWeekRoster.set(key, new Set(starters));
      const playersPoints = (m.playersPoints as unknown as Record<string, number>) || {};
      for (const [pid, pts] of Object.entries(playersPoints)) {
        pointsByWeekRosterPlayer.set(`${m.week}:${m.rosterId}:${String(pid)}`, Number(pts || 0));
      }
      const rosterPlayers = ((m.players as unknown as string[]) || []).map(String);
      for (const pid of rosterPlayers) {
        const k = `${m.rosterId}:${pid}`;
        if (!rosterPlayerWeeks.has(k)) rosterPlayerWeeks.set(k, new Set<number>());
        rosterPlayerWeeks.get(k)!.add(m.week);
      }
      const gkey = `${m.week}:${m.matchupId ?? -1}`;
      if (!groupByWeekMatchup[gkey]) groupByWeekMatchup[gkey] = [];
      groupByWeekMatchup[gkey].push(m.rosterId);
    }
    const opponentByWeekRoster = new Map<string, number>();
    for (const [gkey, rosters] of Object.entries(groupByWeekMatchup)) {
      const [weekStr] = gkey.split(':');
      const week = Number(weekStr);
      if (rosters.length === 2) {
        opponentByWeekRoster.set(`${week}:${rosters[0]}`, rosters[1]);
        opponentByWeekRoster.set(`${week}:${rosters[1]}`, rosters[0]);
      }
    }
    // Replacement level per week/position: median of starters' actual points
    const startersPointsByWeekPos: Record<string, number[]> = {};
    for (const m of matchups) {
      const starters = ((m.starters as unknown as string[]) || []).map(String);
      const playersPoints = (m.playersPoints as unknown as Record<string, number>) || {};
      for (const pid of starters) {
        const p = idToPlayer[pid];
        if (!p) continue;
        const pos = (p.position || 'UNK').toUpperCase();
        const pts = Number(playersPoints[pid] || 0);
        const k = `${m.week}:${pos}`;
        if (!startersPointsByWeekPos[k]) startersPointsByWeekPos[k] = [];
        startersPointsByWeekPos[k].push(pts);
      }
    }
    const median = (arr: number[]) => {
      if (!arr.length) return 0;
      const a = [...arr].sort((x, y) => x - y);
      const mid = Math.floor(a.length / 2);
      return a.length % 2 === 0 ? (a[mid - 1] + a[mid]) / 2 : a[mid];
    };
    const replacementByWeekPos = new Map<string, number>(
      Object.entries(startersPointsByWeekPos).map(([k, vals]) => [k, median(vals)])
    );
    const fWeight = (w: number) => (w === 15 ? 1.3 : w === 16 ? 1.6 : w === 17 ? 2.0 : 1.0);

    // For display-only PPG/PPS (regular season)
    type Agg = { apps: number; totalPoints: number; starts: number; startPoints: number };
    const perPlayerReg: Record<string, Agg> = {};
    for (const m of matchups) {
      if (playoffWeeks.includes(m.week)) continue;
      const starters = ((m.starters as unknown as string[]) || []).map(String);
      const playersPoints = (m.playersPoints as unknown as Record<string, number>) || {};
      for (const [pid, ptsRaw] of Object.entries(playersPoints)) {
        if (!playerIds.has(String(pid))) continue;
        const pts = Number(ptsRaw || 0);
        const base = perPlayerReg[pid] || { apps: 0, totalPoints: 0, starts: 0, startPoints: 0 };
        perPlayerReg[pid] = { ...base, apps: base.apps + 1, totalPoints: base.totalPoints + pts };
      }
      for (const pid of starters) {
        if (!playerIds.has(String(pid))) continue;
        const pts = Number((m.playersPoints as any)?.[pid] || 0);
        const base = perPlayerReg[pid] || { apps: 0, totalPoints: 0, starts: 0, startPoints: 0 };
        perPlayerReg[pid] = {
          ...base,
          starts: base.starts + 1,
          startPoints: base.startPoints + pts,
        };
      }
    }

    const base = txns.filter(t =>
      teamFilter ? (t.rosterIds || []).includes(Number(teamFilter)) : true
    );

    const gradedRaw = base.map(t => {
      const created = (t as any).transactionAt || t.createdAt;
      const adds = (t.adds as any) || {};
      const drops = (t.drops as any) || {};

      type PlayerOut = {
        playerId: string;
        name: string;
        position: string;
        role: 'add' | 'drop';
        pre: { ppg: number; pps: number; total: number };
        post: { poPts: number };
        forYou?: { starts: number; points: number; weightedPoints: number };
        afterDrop?: {
          selfHarm: number;
          oppHarm: number;
          selfHarmWeighted: number;
          oppHarmWeighted: number;
        };
      };
      const playersOut: PlayerOut[] = [];

      const addEntries: Array<{ rosterId: number; playerId: string }> = [];
      if (Array.isArray(adds)) {
        (t.rosterIds || []).forEach(rid => {
          (adds as any[]).forEach(pid =>
            addEntries.push({ rosterId: Number(rid), playerId: String(pid) })
          );
        });
      } else {
        for (const [pid, rid] of Object.entries(adds as Record<string, number>)) {
          addEntries.push({ rosterId: Number(rid), playerId: String(pid) });
        }
      }
      const dropEntries: Array<{ rosterId: number; playerId: string }> = [];
      if (Array.isArray(drops)) {
        (t.rosterIds || []).forEach(rid => {
          (drops as any[]).forEach(pid =>
            dropEntries.push({ rosterId: Number(rid), playerId: String(pid) })
          );
        });
      } else {
        for (const [pid, rid] of Object.entries(drops as Record<string, number>)) {
          dropEntries.push({ rosterId: Number(rid), playerId: String(pid) });
        }
      }

      const matchesPos = (pid: string) =>
        posFilter && posFilter !== 'ALL'
          ? (idToPlayer[pid]?.position || '').toUpperCase() === posFilter.toUpperCase()
          : true;

      // Helpers to bound weeks to after t0 using roster ownership appearance
      const firstOwnedWeek = (rid: number, pid: string): number | null => {
        const set = rosterPlayerWeeks.get(`${rid}:${pid}`);
        if (!set || set.size === 0) return null;
        return Math.min(...Array.from(set.values()));
      };
      const lastOwnedWeek = (rid: number, pid: string): number | null => {
        const set = rosterPlayerWeeks.get(`${rid}:${pid}`);
        if (!set || set.size === 0) return null;
        return Math.max(...Array.from(set.values()));
      };

      // Adds: forYou contribution only when started, weeks >= firstOwnedWeek
      for (const { rosterId, playerId } of addEntries) {
        if (!matchesPos(playerId)) continue;
        const p = idToPlayer[playerId];
        const reg = perPlayerReg[playerId] || {
          apps: 0,
          totalPoints: 0,
          starts: 0,
          startPoints: 0,
        };
        const pre = {
          ppg: reg.apps > 0 ? reg.totalPoints / reg.apps : 0,
          pps: reg.starts > 0 ? reg.startPoints / reg.starts : 0,
          total: reg.totalPoints,
        };
        const post = { poPts: playoffStatsByPlayer.get(playerId) || 0 };
        const forYou = { starts: 0, points: 0, weightedPoints: 0 };
        const w0 = firstOwnedWeek(rosterId, playerId);
        for (const m of matchups) {
          if (w0 != null && m.week < w0) continue;
          const wkKey = `${m.week}:${rosterId}`;
          const starters = startersByWeekRoster.get(wkKey);
          if (!starters) continue;
          if (starters.has(playerId)) {
            const pts = pointsByWeekRosterPlayer.get(`${m.week}:${rosterId}:${playerId}`) || 0;
            const w = fWeight(m.week);
            forYou.starts += 1;
            forYou.points += pts;
            forYou.weightedPoints += w * pts;
          }
        }
        playersOut.push({
          playerId,
          name: p?.fullName || playerId,
          position: p?.position || 'UNK',
          role: 'add',
          pre,
          post,
          forYou,
        });
      }

      // Drops: penalties counted only after player is no longer owned by you
      for (const { rosterId, playerId } of dropEntries) {
        if (!matchesPos(playerId)) continue;
        const p = idToPlayer[playerId];
        const reg = perPlayerReg[playerId] || {
          apps: 0,
          totalPoints: 0,
          starts: 0,
          startPoints: 0,
        };
        const pre = {
          ppg: reg.apps > 0 ? reg.totalPoints / reg.apps : 0,
          pps: reg.starts > 0 ? reg.startPoints / reg.starts : 0,
          total: reg.totalPoints,
        };
        const post = { poPts: playoffStatsByPlayer.get(playerId) || 0 };
        const afterDrop = { selfHarm: 0, oppHarm: 0, selfHarmWeighted: 0, oppHarmWeighted: 0 };
        const pos = (p?.position || 'UNK').toUpperCase();
        const lastW = lastOwnedWeek(rosterId, playerId);
        for (const m of matchups) {
          if (lastW != null && m.week <= lastW) continue;
          const wk = m.week;
          const youKey = `${wk}:${rosterId}`;
          const yourStarters = startersByWeekRoster.get(youKey);
          const yourPoints = (pid: string) =>
            pointsByWeekRosterPlayer.get(`${wk}:${rosterId}:${pid}`) || 0;
          if (yourStarters) {
            let bestSamePos = 0;
            for (const pid of yourStarters) {
              const pp = idToPlayer[pid];
              if ((pp?.position || '').toUpperCase() === pos) {
                bestSamePos = Math.max(bestSamePos, yourPoints(pid));
              }
            }
            const droppedPts = pointsByWeekRosterPlayer.get(`${wk}:${rosterId}:${playerId}`) || 0;
            const delta = Math.max(0, droppedPts - bestSamePos);
            const w = fWeight(wk);
            afterDrop.selfHarm += delta;
            afterDrop.selfHarmWeighted += w * delta;
          }
          const oppId = opponentByWeekRoster.get(youKey);
          if (typeof oppId === 'number') {
            const oppKey = `${wk}:${oppId}`;
            const oppStarters = startersByWeekRoster.get(oppKey);
            if (oppStarters && oppStarters.has(playerId)) {
              const oppPts = pointsByWeekRosterPlayer.get(`${wk}:${oppId}:${playerId}`) || 0;
              const repl = replacementByWeekPos.get(`${wk}:${pos}`) || 0;
              const harm = Math.max(0, oppPts - repl);
              const w = fWeight(wk);
              afterDrop.oppHarm += harm;
              afterDrop.oppHarmWeighted += w * harm;
            }
          }
        }
        playersOut.push({
          playerId,
          name: p?.fullName || playerId,
          position: p?.position || 'UNK',
          role: 'drop',
          pre,
          post,
          afterDrop,
        });
      }

      const contribution = playersOut
        .filter(p => p.role === 'add' && p.forYou)
        .reduce((s, p) => s + (p.forYou?.weightedPoints || 0), 0);
      const penalties = playersOut
        .filter(p => p.role === 'drop' && p.afterDrop)
        .reduce(
          (s, p) => s + (p.afterDrop?.selfHarmWeighted || 0) + (p.afterDrop?.oppHarmWeighted || 0),
          0
        );
      const score = contribution - penalties;

      return {
        id: t.id,
        type: t.type,
        createdAt: new Date(created).toISOString(),
        rosterIds: t.rosterIds,
        players: playersOut,
        score,
      };
    });

    // Convert to letter grades using z-score across this set
    const meanStd = (values: number[]) => {
      const n = values.length;
      if (!n) return { mean: 0, std: 0 };
      const mean = values.reduce((a, b) => a + b, 0) / n;
      const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1);
      return { mean, std: Math.sqrt(variance) };
    };
    const { mean, std } = meanStd(gradedRaw.map(g => g.score));
    const graded = gradedRaw.map(g => {
      const z = std > 0 ? (g.score - mean) / std : 0;
      const pct = 50 + 40 * Math.tanh(z);
      const grade =
        pct >= 88
          ? 'A+'
          : pct >= 82
            ? 'A'
            : pct >= 70
              ? 'B'
              : pct >= 55
                ? 'C'
                : pct >= 40
                  ? 'D'
                  : 'F';
      return { ...g, grade };
    });

    return NextResponse.json({ ok: true, data: graded });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('league:[leagueId]:transactions grades error', {
      leagueId,
      message: (error as Error).message,
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
