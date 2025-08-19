import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET(request: Request, { params }: { params: { leagueId: string } }) {
  const { leagueId } = params;
  try {
    const prisma = await getPrisma();
    const url = new URL(request.url);
    const limit = Math.min(1000, Math.max(1, Number(url.searchParams.get('limit') || 200)));
    const offset = Math.max(0, Number(url.searchParams.get('offset') || 0));
    const typeFilter = url.searchParams.get('type');

    const where: any = { leagueId };
    if (typeFilter && typeFilter !== 'ALL') where.type = typeFilter;
    const txns = await prisma.transaction.findMany({
      where,
      orderBy: [{ transactionAt: 'desc' }, { createdAt: 'desc' }],
      skip: offset,
      take: limit,
    });

    type PlayerLite = { id: string; fullName: string; position: string; team: string | null };

    const playerIds = new Set<string>();
    const collectFromMapping = (mapping: Prisma.JsonValue | null) => {
      if (!mapping) return;
      if (Array.isArray(mapping)) {
        for (const pid of mapping as Array<string | number>) playerIds.add(String(pid));
      } else if (typeof mapping === 'object') {
        for (const pid of Object.keys(mapping as Prisma.JsonObject)) playerIds.add(String(pid));
      }
    };
    for (const t of txns) {
      collectFromMapping(t.adds as Prisma.JsonValue | null);
      collectFromMapping(t.drops as Prisma.JsonValue | null);
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
    const ensureDst = (pid: string) => {
      if (/^[A-Z]{2,3}$/.test(pid) && !idToPlayer[pid]) {
        idToPlayer[pid] = { id: pid, fullName: `${pid} D/ST`, position: 'DEF', team: pid };
      }
    };
    playerIds.forEach(pid => ensureDst(pid));

    const toRosterPlayerGroups = (
      mapping: Prisma.JsonValue | null,
      fallbackRosterIds: number[]
    ): Array<{ rosterId: number; players: PlayerLite[] }> => {
      const grouped: Record<number, PlayerLite[]> = {};
      if (mapping && typeof mapping === 'object' && !Array.isArray(mapping)) {
        for (const [playerId, rid] of Object.entries(mapping as Prisma.JsonObject)) {
          const rosterId = Number(rid);
          if (!grouped[rosterId]) grouped[rosterId] = [];
          const p = idToPlayer[String(playerId)];
          if (p) grouped[rosterId].push(p);
        }
      } else if (Array.isArray(mapping)) {
        const rid = Number(fallbackRosterIds?.[0]);
        grouped[rid] = (mapping as Array<string | number>)
          .map(pid => idToPlayer[String(pid)])
          .filter((p): p is PlayerLite => Boolean(p));
      }
      return Object.entries(grouped).map(([rid, playersArr]) => ({
        rosterId: Number(rid),
        players: playersArr,
      }));
    };

    const data = txns.map(t => {
      const adds = toRosterPlayerGroups(t.adds as Prisma.JsonValue | null, t.rosterIds || []);
      const drops = toRosterPlayerGroups(t.drops as Prisma.JsonValue | null, t.rosterIds || []);
      const created = (t as unknown as { transactionAt?: Date }).transactionAt || t.createdAt;
      return {
        id: t.id,
        type: t.type,
        status: t.status,
        createdAt: created.toISOString(),
        rosterIds: t.rosterIds,
        adds,
        drops,
        waiver: (t as unknown as { waiver?: Prisma.JsonValue }).waiver ?? null,
        settings: (t.settings as Prisma.JsonValue) ?? undefined,
      };
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('league:[leagueId]:transactions error', {
      leagueId,
      message: (error as Error).message,
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Grades endpoint: /api/league/[leagueId]/transactions/grades
export async function POST(request: Request, { params }: { params: { leagueId: string } }) {
  const { leagueId } = params;
  try {
    const prisma = await getPrisma();
    const url = new URL(request.url);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 5)));
    const offset = Math.max(0, Number(url.searchParams.get('offset') || 0));
    const teamFilter = url.searchParams.get('team');
    const posFilter = url.searchParams.get('pos');
    const typeFilter = url.searchParams.get('type');

    const where: any = { leagueId };
    if (typeFilter) where.type = typeFilter;
    const txns = await prisma.transaction.findMany({
      where,
      orderBy: [{ transactionAt: 'desc' }, { createdAt: 'desc' }],
      skip: offset,
      take: limit,
    });

    // Collect players involved
    type PlayerLite = { id: string; fullName: string; position: string; team: string | null };
    const playerIds = new Set<string>();
    const rosterIds = new Set<number>();
    const collect = (mapping: Prisma.JsonValue | null, rids?: number[] | null) => {
      if (Array.isArray(mapping)) {
        for (const pid of mapping as Array<string | number>) playerIds.add(String(pid));
        (rids || []).forEach(r => rosterIds.add(Number(r)));
      } else if (mapping && typeof mapping === 'object') {
        for (const [pid, rid] of Object.entries(mapping as Prisma.JsonObject)) {
          playerIds.add(String(pid));
          rosterIds.add(Number(rid));
        }
      }
    };
    for (const t of txns) {
      collect(t.adds as Prisma.JsonValue | null, t.rosterIds);
      collect(t.drops as Prisma.JsonValue | null, t.rosterIds);
    }

    // Optional team filter
    const teamFilterNum = teamFilter ? Number(teamFilter) : null;
    const filteredTxns = teamFilterNum
      ? txns.filter(t => (t.rosterIds || []).includes(teamFilterNum))
      : txns;

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

    // Build simple pre/post windows using Matchup and PlayerStats for playoffs
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

    type Agg = { starts: number; startPoints: number; totalPoints: number; apps: number };
    const perPlayerSeason: Record<string, Agg> = {};
    const perPlayerReg: Record<string, Agg> = {};
    for (const m of matchups) {
      const starters = (m.starters as unknown as string[]) || [];
      const startersPoints = (m.startersPoints as unknown as number[]) || [];
      const playersPoints = (m.playersPoints as unknown as Record<string, number>) || {};
      const isPO = playoffWeeks.includes(m.week);
      for (const [pid, pts] of Object.entries(playersPoints)) {
        if (!playerIds.has(String(pid))) continue;
        const base = perPlayerSeason[pid] || { starts: 0, startPoints: 0, totalPoints: 0, apps: 0 };
        perPlayerSeason[pid] = {
          ...base,
          totalPoints: base.totalPoints + Number(pts || 0),
          apps: base.apps + 1,
        };
        if (!isPO) {
          const baseR = perPlayerReg[pid] || { starts: 0, startPoints: 0, totalPoints: 0, apps: 0 };
          perPlayerReg[pid] = {
            ...baseR,
            totalPoints: baseR.totalPoints + Number(pts || 0),
            apps: baseR.apps + 1,
          };
        }
      }
      for (let i = 0; i < starters.length; i++) {
        const pid = String(starters[i]);
        if (!playerIds.has(pid)) continue;
        const pts = Number((startersPoints[i] ?? 0) as number);
        const base = perPlayerSeason[pid] || { starts: 0, startPoints: 0, totalPoints: 0, apps: 0 };
        perPlayerSeason[pid] = {
          ...base,
          starts: base.starts + 1,
          startPoints: base.startPoints + pts,
        };
        if (!playoffWeeks.includes(m.week)) {
          const baseR = perPlayerReg[pid] || { starts: 0, startPoints: 0, totalPoints: 0, apps: 0 };
          perPlayerReg[pid] = {
            ...baseR,
            starts: baseR.starts + 1,
            startPoints: baseR.startPoints + pts,
          };
        }
      }
    }

    // Helper stats
    const meanStd = (values: number[]) => {
      const n = values.length;
      if (!n) return { mean: 0, std: 0 };
      const mean = values.reduce((a, b) => a + b, 0) / n;
      const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1);
      return { mean, std: Math.sqrt(variance) };
    };
    const z = (v: number, m: number, s: number) => (s > 0 ? (v - m) / s : 0);

    const graded = filteredTxns
      .map(t => {
        const created = (t as any).transactionAt || t.createdAt;
        const adds = t.adds as any;
        const drops = t.drops as any;
        const involved: string[] = [];
        if (Array.isArray(adds)) involved.push(...adds.map((x: any) => String(x)));
        else if (adds && typeof adds === 'object') involved.push(...Object.keys(adds as any));
        if (Array.isArray(drops)) involved.push(...drops.map((x: any) => String(x)));
        else if (drops && typeof drops === 'object') involved.push(...Object.keys(drops as any));

        // Filter by position if requested
        const involvedWithPos = involved.filter(pid =>
          posFilter
            ? (idToPlayer[pid]?.position || '').toUpperCase() === posFilter.toUpperCase()
            : true
        );
        if (posFilter && involvedWithPos.length === 0) return null;

        // naive pre/post split: use regular season aggregate (weeks 1-13) as "pre"; playoffs as "post"
        // This approximates contribution change toward the clutch period.
        const perPlayer = involvedWithPos.map(pid => {
          const p = idToPlayer[pid];
          const reg = perPlayerReg[pid] || { starts: 0, startPoints: 0, totalPoints: 0, apps: 0 };
          const poPts = playoffStatsByPlayer.get(pid) || 0;
          const ppgReg = reg.apps > 0 ? reg.totalPoints / reg.apps : 0;
          const ppsReg = reg.starts > 0 ? reg.startPoints / reg.starts : 0;
          return {
            playerId: pid,
            name: p?.fullName || pid,
            position: p?.position || 'UNK',
            pre: { ppg: ppgReg, pps: ppsReg, total: reg.totalPoints },
            post: { poPts },
          };
        });

        // Build deltas and z-scores across the transaction's players
        const deltasPPG = perPlayer.map(x => x.post.poPts - x.pre.ppg);
        const deltasPPS = perPlayer.map(x => x.post.poPts - x.pre.pps);
        const { mean: m1, std: s1 } = meanStd(deltasPPG);
        const { mean: m2, std: s2 } = meanStd(deltasPPS);
        const zPPG = deltasPPG.map(v => z(v, m1, s1));
        const zPPS = deltasPPS.map(v => z(v, m2, s2));
        const score =
          (zPPG.reduce((a, b) => a + b, 0) + zPPS.reduce((a, b) => a + b, 0)) /
          Math.max(1, perPlayer.length * 2);

        // Letter grade like draft
        const grade = (() => {
          // crude percentiles per transaction using a sigmoid around 0
          const pct = 50 + 40 * Math.tanh(score);
          if (pct >= 88) return 'A+';
          if (pct >= 82) return 'A';
          if (pct >= 70) return 'B';
          if (pct >= 55) return 'C';
          if (pct >= 40) return 'D';
          return 'F';
        })();

        return {
          id: t.id,
          type: t.type,
          createdAt: new Date(created).toISOString(),
          rosterIds: t.rosterIds,
          players: perPlayer,
          score,
          grade,
        };
      })
      .filter(Boolean);

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
