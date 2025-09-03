import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const prisma = await getPrisma();
    const url = new URL(request.url);
    const debug = url.searchParams.has('debug');

    // Get a league context (same approach as overview: first league)
    const league = await prisma.league.findFirst({
      include: {
        rosters: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!league) {
      return NextResponse.json({ ok: false, error: 'No league found' }, { status: 404 });
    }

    // Fetch draft and picks for this league
    const draft = await prisma.draft.findFirst({
      where: { leagueId: String(league.id) },
      include: {
        picks: {
          orderBy: { pickNo: 'asc' },
        },
      },
    });

    if (!draft) {
      return NextResponse.json(
        {
          ok: true,
          data: {
            league: { id: league.id, name: league.name, season: league.season },
            draft: null,
            picks: [],
          },
        },
        { status: 200 }
      );
    }

    const rosterIdToTeam = new Map<number, { name: string; owner: string }>();
    (league.rosters || []).forEach(r => {
      type OwnerLike = {
        metadata?: Record<string, unknown> | null;
        displayName?: string | null;
        username?: string | null;
      };
      const ownerLike = (r.owner ?? {}) as OwnerLike;
      const teamName =
        ownerLike?.metadata &&
        typeof (ownerLike.metadata as Record<string, unknown>)['team_name'] === 'string'
          ? String((ownerLike.metadata as Record<string, unknown>)['team_name'])
          : null;
      const displayName = typeof ownerLike?.displayName === 'string' ? ownerLike.displayName : null;
      const username = typeof ownerLike?.username === 'string' ? ownerLike.username : null;
      const name = teamName || displayName || username || `Team ${r.id}`;
      const owner = displayName || username || 'Unknown';
      rosterIdToTeam.set(Number(r.id), { name, owner });
    });

    // Enrich with player details
    const playerIds = Array.from(new Set(draft.picks.map(p => p.playerId)));
    const players = await prisma.player.findMany({
      where: { id: { in: playerIds } },
      select: { id: true, fullName: true, position: true, team: true },
    });
    const playerMap = new Map(players.map(p => [p.id, p] as const));

    // Fetch league transactions and build per-player lists
    const transactions = await prisma.transaction.findMany({
      where: { leagueId: String(league.id) },
      orderBy: [{ transactionAt: 'asc' }, { createdAt: 'asc' }],
      take: 1000,
    });

    const mappingIncludesPlayer = (mapping: unknown, playerId: string): boolean => {
      if (!mapping) return false;
      if (Array.isArray(mapping)) {
        return (mapping as Array<string | number>).map(String).includes(String(playerId));
      }
      if (typeof mapping === 'object') {
        return Object.prototype.hasOwnProperty.call(
          mapping as Record<string, unknown>,
          String(playerId)
        );
      }
      return false;
    };

    const mappingRosterIdsForPlayer = (mapping: unknown, playerId: string): number[] => {
      if (!mapping) return [];
      if (Array.isArray(mapping)) {
        // Array form does not encode roster, use first rosterIds as fallback is ambiguous; return involved rosterIds if present on txn
        return [];
      }
      if (typeof mapping === 'object') {
        const rid = (mapping as Record<string, unknown>)[String(playerId)];
        return typeof rid === 'number' ? [rid] : rid ? [Number(rid)] : [];
      }
      return [];
    };

    const playerIdToTransactions = new Map<
      string,
      Array<{
        id: string;
        type: string;
        status: string;
        createdAt: string;
        addedTo: Array<{ id: number; name: string }>;
        droppedFrom: Array<{ id: number; name: string }>;
        waiver?: unknown;
      }>
    >();
    for (const t of transactions) {
      for (const pid of playerIds) {
        const isAdd = mappingIncludesPlayer((t as unknown as { adds?: unknown }).adds, pid);
        const isDrop = mappingIncludesPlayer((t as unknown as { drops?: unknown }).drops, pid);
        if (!isAdd && !isDrop) continue;
        const list = playerIdToTransactions.get(pid) || [];
        const created = (t as unknown as { transactionAt?: Date }).transactionAt || t.createdAt;
        const addedIds = isAdd
          ? mappingRosterIdsForPlayer((t as unknown as { adds?: unknown }).adds, pid)
          : [];
        const droppedIds = isDrop
          ? mappingRosterIdsForPlayer((t as unknown as { drops?: unknown }).drops, pid)
          : [];
        list.push({
          id: t.id,
          type: t.type,
          status: t.status,
          createdAt: created.toISOString(),
          addedTo: addedIds.map(rid => ({
            id: rid,
            name: rosterIdToTeam.get(Number(rid))?.name || `Team ${rid}`,
          })),
          droppedFrom: droppedIds.map(rid => ({
            id: rid,
            name: rosterIdToTeam.get(Number(rid))?.name || `Team ${rid}`,
          })),
          waiver: (t as unknown as { waiver?: unknown }).waiver,
        });
        playerIdToTransactions.set(pid, list);
      }
    }

    // Compute contribution metrics from matchups (regular season vs playoffs)
    const matchups = await prisma.matchup.findMany({ where: { leagueId: String(league.id) } });
    const playoffWeeks: number[] = [15, 16, 17];
    // Also pull player stats directly to ensure playoffs data is complete
    const season = String(league.season);
    const ps = await prisma.playerStats.findMany({
      where: {
        season,
        week: { in: playoffWeeks },
        statsType: 'stats',
        playerId: { in: playerIds },
      },
      select: { playerId: true, week: true, stats: true },
    });
    const playoffStatsByPlayer = new Map<string, number>();
    for (const row of ps) {
      const s = row.stats as unknown as {
        pts_ppr?: number;
        pts_half_ppr?: number;
        pts_std?: number;
      };
      const pts = (s?.pts_half_ppr ?? s?.pts_ppr ?? s?.pts_std ?? 0) as number;
      playoffStatsByPlayer.set(
        row.playerId,
        (playoffStatsByPlayer.get(row.playerId) || 0) + Number(pts || 0)
      );
    }
    // playoffWeeks defined above
    type Contribution = { starts: number; startPoints: number; totalLeaguePoints: number };
    const playerContrib: Record<string, Contribution> = {};
    const playerContribPO: Record<string, Contribution> = {};
    const appearances: Record<string, number> = {};
    const appearancesPO: Record<string, number> = {};
    for (const m of matchups) {
      const starters = (m.starters as unknown as string[]) || [];
      const startersPoints = (m.startersPoints as unknown as number[]) || [];
      const playersPoints = (m.playersPoints as unknown as Record<string, number>) || {};
      const isPlayoffWeek = playoffWeeks.includes(m.week);
      const target = isPlayoffWeek ? playerContribPO : playerContrib;
      // Total league points regardless of start (bench + starts)
      for (const [pid, pts] of Object.entries(playersPoints)) {
        if (!playerIds.includes(pid)) continue;
        if (!target[pid]) target[pid] = { starts: 0, startPoints: 0, totalLeaguePoints: 0 };
        target[pid].totalLeaguePoints += Number(pts || 0);
        if (isPlayoffWeek) appearancesPO[pid] = (appearancesPO[pid] || 0) + 1;
        else appearances[pid] = (appearances[pid] || 0) + 1;
      }
      // Starting appearances and points — align starters with startersPoints by index
      for (let i = 0; i < starters.length; i++) {
        const pid = String(starters[i]);
        if (!playerIds.includes(pid)) continue;
        if (!target[pid]) target[pid] = { starts: 0, startPoints: 0, totalLeaguePoints: 0 };
        target[pid].starts += 1;
        const pts = Number((startersPoints[i] ?? 0) as number);
        target[pid].startPoints += pts;
      }
    }

    // Compute simple positional ranks based on totalLeaguePoints (regular season only)
    const totalsByPos = new Map<string, Array<{ playerId: string; points: number }>>();
    for (const pid of playerIds) {
      const player = playerMap.get(pid);
      if (!player) continue;
      const pos = player.position || 'UNK';
      const points = playerContrib[pid]?.totalLeaguePoints || 0;
      const arr = totalsByPos.get(pos) || [];
      arr.push({ playerId: pid, points });
      totalsByPos.set(pos, arr);
    }
    const posRank: Record<string, number> = {};
    for (const [pos, arr] of totalsByPos.entries()) {
      arr.sort((a, b) => b.points - a.points);
      arr.forEach((entry, idx) => {
        posRank[`${pos}:${entry.playerId}`] = idx + 1;
      });
    }

    // Compute VORP baselines by position using league rosterPositions
    const normalizePos = (p?: string | null) => (p ? p.toUpperCase() : 'UNK');
    const rosterPositions = (league.rosterPositions as string[] | null) || [];
    // Count actual occurrences from rosterPositions array
    const countOcc = (target: string) =>
      rosterPositions.map(normalizePos).filter(p => p === target).length;
    const known = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
    const slotsPerTeam: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0 };
    // Exact position counts
    known.forEach(k => {
      slotsPerTeam[k] += countOcc(k);
    });
    // FLEX-like positions: split evenly between RB and WR
    const flexSlots = rosterPositions.filter(rp => /FLEX|RB\/?WR|WR\/?RB/i.test(String(rp))).length;
    slotsPerTeam.RB += flexSlots * 0.5;
    slotsPerTeam.WR += flexSlots * 0.5;
    // Sensible defaults if no explicit slots found
    if (slotsPerTeam.RB === 0) slotsPerTeam.RB = 2;
    if (slotsPerTeam.WR === 0) slotsPerTeam.WR = 2;
    if (slotsPerTeam.QB === 0) slotsPerTeam.QB = 1;
    if (slotsPerTeam.TE === 0) slotsPerTeam.TE = 1;
    if (slotsPerTeam.K === 0) slotsPerTeam.K = 1;
    if (slotsPerTeam.DEF === 0) slotsPerTeam.DEF = 1;
    const totalTeams = Number(
      (draft.slotToRosterId && draft.slotToRosterId.length) ||
        league.totalRosters ||
        (league.rosters || []).length ||
        12
    );
    const baselineByPos: Record<string, { rank: number; points: number }> = {};
    for (const pos of known) {
      const starters = Math.max(1, slotsPerTeam[pos] || 1);
      const baselineRank = Math.max(1, Math.round(totalTeams * starters));
      const arr = (totalsByPos.get(pos) || []).slice().sort((a, b) => b.points - a.points);
      const idx = Math.min(arr.length - 1, baselineRank - 1);
      const points = arr.length > 0 ? Number(arr[idx]?.points ?? 0) : 0;
      baselineByPos[pos] = { rank: baselineRank, points };
    }

    const basePicks = draft.picks.map(p => {
      const team = rosterIdToTeam.get(Number(p.rosterId));
      const player = playerMap.get(p.playerId);
      const contrib = playerContrib[p.playerId] || {
        starts: 0,
        startPoints: 0,
        totalLeaguePoints: 0,
      };
      const position = player?.position || null;
      const rankKey = position ? `${position}:${p.playerId}` : undefined;
      const positionalRank = rankKey ? posRank[rankKey] || null : null;
      return {
        pickNo: p.pickNo,
        round: p.round,
        rosterId: p.rosterId,
        rosterName: team?.name || `Team ${p.rosterId}`,
        ownerName: team?.owner || 'Unknown',
        player: player
          ? { id: player.id, name: player.fullName, position: player.position, team: player.team }
          : { id: p.playerId, name: 'Unknown', position: null, team: null },
        isKeeper: p.isKeeper,
        contribution: {
          starts: contrib.starts,
          startPoints: Number(contrib.startPoints.toFixed(2)),
          totalLeaguePoints: Number(contrib.totalLeaguePoints.toFixed(2)),
          positionalRank,
        },
        playoffsContribution: {
          starts: playerContribPO[p.playerId]?.starts || 0,
          startPoints: Number((playerContribPO[p.playerId]?.startPoints || 0).toFixed(2)),
          totalLeaguePoints: Number(
            // Prefer PlayerStats box scores for playoffs; fall back to matchup totals if absent
            (playoffStatsByPlayer.has(p.playerId)
              ? playoffStatsByPlayer.get(p.playerId) || 0
              : playerContribPO[p.playerId]?.totalLeaguePoints || 0
            ).toFixed(2)
          ),
        },
        transactions: playerIdToTransactions.get(p.playerId) || [],
        position,
      };
    });

    // League-relative grading (neighbor window around pick number, position-aware)
    const window = 12; // one round comparables in 12-team; adjust later for league size
    const meanStd = (values: number[]) => {
      const n = values.length;
      if (n === 0) return { mean: 0, std: 0 };
      const mean = values.reduce((a, b) => a + b, 0) / n;
      const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1);
      return { mean, std: Math.sqrt(variance) };
    };
    const z = (v: number, mean: number, std: number) => (std > 0 ? (v - mean) / std : 0);

    const graded = basePicks.map(p => {
      const neighbors = basePicks.filter(
        q => q.position === p.position && Math.abs(q.pickNo - p.pickNo) <= window
      );
      const cohort =
        neighbors.length >= 6
          ? neighbors
          : basePicks.filter(q => Math.abs(q.pickNo - p.pickNo) <= window);
      // Use unrounded values from the raw aggregation where possible to avoid rounding artifacts
      const rawContrib = playerContrib[p.player.id];
      const sp = rawContrib?.startPoints ?? p.contribution.startPoints;
      const tp = p.contribution.totalLeaguePoints;
      const st = rawContrib?.starts ?? p.contribution.starts;
      const pos = normalizePos(p.position);
      const baseline = baselineByPos[pos]?.points ?? 0;
      const vorp = tp - baseline;
      const apps = Math.max(appearances[p.player.id] || 0, 1);
      const ppg = tp / apps;
      const pps = st > 0 ? sp / st : 0;
      const poPts = p.playoffsContribution.totalLeaguePoints || 0;
      const spStats = meanStd(cohort.map(c => c.contribution.startPoints));
      const tpStats = meanStd(cohort.map(c => c.contribution.totalLeaguePoints));
      const stStats = meanStd(cohort.map(c => c.contribution.starts));
      const ppgStats = meanStd(
        cohort.map(c => {
          const a = Math.max(appearances[c.player.id] || 0, 1);
          return c.contribution.totalLeaguePoints / a;
        })
      );
      const ppsStats = meanStd(
        cohort.map(c =>
          c.contribution.starts > 0 ? c.contribution.startPoints / c.contribution.starts : 0
        )
      );
      const vorpStats = meanStd(
        cohort.map(
          c =>
            c.contribution.totalLeaguePoints -
            (baselineByPos[normalizePos(c.position)]?.points ?? 0)
        )
      );
      const poStats = meanStd(cohort.map(c => c.playoffsContribution.totalLeaguePoints || 0));
      const zSp = z(sp, spStats.mean, spStats.std);
      const zTp = z(tp, tpStats.mean, tpStats.std);
      const zSt = z(st, stStats.mean, stStats.std);
      const zVorp = z(vorp, vorpStats.mean, vorpStats.std);
      const zPpg = z(ppg, ppgStats.mean, ppgStats.std);
      const zPps = z(pps, ppsStats.mean, ppsStats.std);
      const zPO = z(poPts, poStats.mean, poStats.std);
      // Foundational version: equal weighting across components
      let neighborScore = (zVorp + zPpg + zPps + zPO) / 4;
      // Transaction-informed penalty: small penalty per drop event
      const dropEvents = (p.transactions || []).reduce(
        (acc, t) => acc + (t.droppedFrom && t.droppedFrom.length > 0 ? 1 : 0),
        0
      );
      neighborScore -= 0.1 * dropEvents;
      return {
        ...p,
        neighborScore,
        vorp: Number(vorp.toFixed(2)),
        ppg: Number(ppg.toFixed(2)),
        pps: Number(pps.toFixed(2)),
        playoffPoints: Number(poPts.toFixed(2)),
        breakdown: {
          baselinePoints: Number(baseline.toFixed(2)),
          zStartPoints: Number(zSp.toFixed(2)),
          zTotalPoints: Number(zTp.toFixed(2)),
          zStarts: Number(zSt.toFixed(2)),
          zVorp: Number(zVorp.toFixed(2)),
          zPpg: Number(zPpg.toFixed(2)),
          zPps: Number(zPps.toFixed(2)),
          zPlayoffs: Number(zPO.toFixed(2)),
          dropPenalty: Number((0.1 * dropEvents).toFixed(2)),
        },
      };
    });

    // Normalize across league and map to letter grades
    const scoreStats = meanStd(graded.map(g => g.neighborScore));
    const withScore = graded.map(g => ({
      ...g,
      gradeScore: z(g.neighborScore, scoreStats.mean, scoreStats.std),
    }));
    const sortedScores = [...withScore.map(w => w.gradeScore)].sort((a, b) => a - b);
    const percentile = (val: number) => {
      if (!sortedScores.length) return 50;
      const idx = sortedScores.findIndex(s => s >= val);
      const rank = idx === -1 ? sortedScores.length : idx;
      return (rank / sortedScores.length) * 100;
    };
    const toLetter = (val: number) => {
      const pctl = percentile(val);
      // Soften thresholds and add +/- modifiers
      let base: 'A' | 'B' | 'C' | 'D' | 'F';
      if (pctl >= 88) base = 'A';
      else if (pctl >= 70) base = 'B';
      else if (pctl >= 45) base = 'C';
      else if (pctl >= 25) base = 'D';
      else base = 'F';
      // +/- based on distance within band
      const addMod = (bottom: number, top: number) => {
        const span = top - bottom;
        const rel = span > 0 ? (pctl - bottom) / span : 0.5;
        if (rel >= 0.66) return '+';
        if (rel <= 0.33) return '-';
        return '';
      };
      if (base === 'A') return 'A' + addMod(88, 100);
      if (base === 'B') return 'B' + addMod(70, 88);
      if (base === 'C') return 'C' + addMod(45, 70);
      if (base === 'D') return 'D' + addMod(25, 45);
      return 'F';
    };
    if (debug) {
      // eslint-disable-next-line no-console
      console.log('draft: VORP baselines', baselineByPos);
      // eslint-disable-next-line no-console
      console.log('draft: sample graded', graded.slice(0, 3));
      // eslint-disable-next-line no-console
      console.log('draft: score stats', scoreStats);
    }

    const picks = withScore.map(w => ({
      pickNo: w.pickNo,
      round: w.round,
      rosterId: w.rosterId,
      rosterName: w.rosterName,
      ownerName: w.ownerName,
      player: w.player,
      isKeeper: w.isKeeper,
      contribution: w.contribution,
      playoffsContribution: w.playoffsContribution,
      transactions: w.transactions,
      grade: toLetter(w.gradeScore),
      gradeScore: Number(w.gradeScore.toFixed(2)),
      vorp: w.vorp,
      ppg: (w as any).ppg,
      pps: (w as any).pps,
      playoffPoints: (w as any).playoffPoints,
      breakdown: w.breakdown,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        league: { id: league.id, name: league.name, season: league.season },
        draft: {
          id: draft.id,
          status: draft.status,
          type: draft.type,
          season: draft.season,
          settings: draft.settings,
          metadata: draft.metadata,
          slotToRosterId: draft.slotToRosterId,
        },
        picks,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('league:draft error', {
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
