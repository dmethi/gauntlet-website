import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'node:fs';
import path from 'node:path';
// fines/curses generation disabled for now

const GAUNTLET_LEAGUES = [
  { id: '1263744209295245312', name: 'Gauntlet AFC' },
  { id: '1263740549504962561', name: 'Gauntlet NFC' },
];

function sumExcitement(samples: Array<{ winProbA: number; timestamp: Date }>): number {
  if (!samples || samples.length < 2) return 0;
  const sorted = [...samples].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  let total = 0;
  for (let i = 1; i < sorted.length; i++) {
    total += Math.abs(sorted[i].winProbA - sorted[i - 1].winProbA);
  }
  return total;
}

function resolveDivisionName(r: any): string {
  const fromRosterMeta = ((r.metadata as any) || {})?.division;
  const fromOwnerMeta = ((r.owner?.metadata as any) || {})?.division;
  const fromSettings = ((r.settings as any) || {})?.division;
  const raw = fromRosterMeta ?? fromOwnerMeta ?? fromSettings ?? null;
  if (raw == null) return 'No Division';
  const s = String(raw).trim();
  if (/^\d+$/.test(s)) return `Division ${s}`;
  return s;
}

function isGenericTeamName(val?: string | null): boolean {
  if (!val) return true;
  const s = String(val).trim();
  return /^team\s+\d+$/i.test(s);
}

function resolveTeamName(r: any): string {
  const rosterMetaName = ((r.metadata as any) || {})?.team_name as string | undefined;
  const ownerMetaName = ((r.owner?.metadata as any) || {})?.team_name as string | undefined;
  const ownerDisplay = r.owner?.displayName as string | undefined;
  const ownerUser = r.owner?.username as string | undefined;
  if (rosterMetaName && !isGenericTeamName(rosterMetaName)) return rosterMetaName;
  if (ownerMetaName && !isGenericTeamName(ownerMetaName)) return ownerMetaName;
  if (ownerDisplay && !isGenericTeamName(ownerDisplay)) return ownerDisplay;
  if (ownerUser && !isGenericTeamName(ownerUser)) return ownerUser;
  return `Team ${r.id}`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { season: string; week: string } }
) {
  const week = parseInt(params.week, 10);
  const season = params.season;
  if (!Number.isFinite(week) || week < 1 || week > 18) {
    return NextResponse.json({ ok: false, error: 'Invalid week' }, { status: 400 });
  }

  try {
    // --- Load and parse week1 report template for narratives ---
    const templatePath = path.join(process.cwd(), 'week1_report_template.md');
    const template = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf8') : '';

    // Optional JSON override for Week 1 narratives (authoritative if present)
    const jsonOverridePath = path.join(process.cwd(), 'apps/web/data/report-week1.json');
    const jsonOverrideExists = fs.existsSync(jsonOverridePath);

    function parseTemplate(md: string) {
      const lines = md.split(/\r?\n/);
      let scribeIntro = '';
      let nfcOverview = '';
      let afcOverview = '';
      type TItem = { a: string; b: string; recap: string; odds: string[] };
      const itemsNFC: TItem[] = [];
      const itemsAFC: TItem[] = [];

      let i = 0;
      const readPara = () => {
        const out: string[] = [];
        while (i < lines.length && lines[i].trim() !== '') {
          out.push(lines[i]);
          i++;
        }
        while (i < lines.length && lines[i].trim() === '') i++;
        return out.join('\n').trim();
      };
      const readBullets = () => {
        const out: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('-')) {
          out.push(lines[i].replace(/^\-\s*/, '').trim());
          i++;
        }
        while (i < lines.length && lines[i].trim() === '') i++;
        return out;
      };

      // Scribe Intro after heading "Assistant’s Intro"
      for (; i < lines.length; i++)
        if (/Assistant’s Intro/i.test(lines[i])) {
          i += 1;
          break;
        }
      scribeIntro = readPara();

      // NFC Overview
      for (; i < lines.length; i++)
        if (/Gauntlet NFC/i.test(lines[i])) {
          break;
        }
      for (; i < lines.length; i++)
        if (/League Overview/i.test(lines[i])) {
          i += 1;
          break;
        }
      nfcOverview = readPara();

      // NFC matchups until AFC section
      const parseMatchupsInto = (collector: TItem[]) => {
        while (i < lines.length) {
          const header = lines[i] || '';
          if (/^Gauntlet\s+AFC/i.test(header)) break;
          if (/^\s*$/.test(header)) {
            i++;
            continue;
          }
          const mh = header.match(/^(.*?)\s*\(.*?\)\s*vs\s*(.*?)\s*\(.*?\)/i);
          if (!mh) {
            i++;
            continue;
          }
          const a = (mh[1] || '').trim();
          const b = (mh[2] || '').trim();
          i++;
          const recap = readPara();
          // Look for Odds & Ends
          let odds: string[] = [];
          if (/^Odds\s*&\s*Ends/i.test(lines[i] || '')) {
            i++;
            odds = readBullets();
          }
          collector.push({ a, b, recap, odds });
        }
      };
      parseMatchupsInto(itemsNFC);

      // AFC Overview
      for (; i < lines.length; i++)
        if (/League Overview/i.test(lines[i])) {
          i += 1;
          break;
        }
      afcOverview = readPara();

      // AFC matchups to end
      parseMatchupsInto(itemsAFC);

      return { scribeIntro, nfcOverview, afcOverview, itemsNFC, itemsAFC };
    }

    type JsonMatchup = { matchup: string; recap: string; odds_and_ends?: string[] };
    type JsonNarratives = {
      assistant_intro?: string;
      nfc?: { league_overview?: string; matchups?: JsonMatchup[] };
      afc?: { league_overview?: string; matchups?: JsonMatchup[] };
      closing_note?: string;
      my_intro?: string;
      callouts?: Record<string, string>;
    };

    function parseJsonOverride(obj: JsonNarratives) {
      const extractTeams = (line: string) => {
        // e.g. "vayyala (94.9) vs lurski (134.7) — lurski wins"
        const vsIdx = line.toLowerCase().indexOf(' vs ');
        if (vsIdx === -1) return { a: line.trim(), b: '' };
        const left = line.slice(0, vsIdx).trim();
        const rightRaw = line.slice(vsIdx + 4).trim();
        // strip after scores and dashes
        const right = rightRaw.split('—')[0].split(' - ')[0].trim();
        const clean = (s: string) => s.replace(/\(.*?\)/g, '').trim();
        return { a: clean(left), b: clean(right) };
      };
      const toItems = (arr: JsonMatchup[] | undefined) =>
        (arr || []).map(m => {
          const { a, b } = extractTeams(m.matchup || '');
          return { a, b, recap: m.recap || '', odds: (m.odds_and_ends || []) as string[] };
        });

      return {
        scribeIntro:
          (obj.assistant_intro || '').trim() ||
          "I am the Gauntlet Scribe — Dhruv brings the raw takes, I weaponize them. Expect receipts, rivalry, and the occasional fine. If you love a line, he'll say it was his. If you hate one, that was me.",
        nfcOverview: (obj.nfc?.league_overview || '').trim(),
        afcOverview: (obj.afc?.league_overview || '').trim(),
        itemsNFC: toItems(obj.nfc?.matchups),
        itemsAFC: toItems(obj.afc?.matchups),
        closingNote: (obj.closing_note || '').trim(),
        myIntro: (obj.my_intro || '').trim(),
        callouts: obj.callouts || {},
      } as any;
    }

    const parsed = jsonOverrideExists
      ? parseJsonOverride(JSON.parse(fs.readFileSync(jsonOverridePath, 'utf8')) as JsonNarratives)
      : template
        ? parseTemplate(template)
        : ({
            scribeIntro:
              "I am the Gauntlet Scribe — Dhruv brings the raw takes, I weaponize them. Expect receipts, rivalry, and the occasional fine. If you love a line, he'll say it was his. If you hate one, that was me.",
            nfcOverview: '',
            afcOverview: '',
            itemsNFC: [],
            itemsAFC: [],
            closingNote: '',
          } as any);

    const leaguesMeta = await prisma.league.findMany({
      where: { id: { in: GAUNTLET_LEAGUES.map(l => l.id) } },
      select: { id: true, name: true },
    });

    const perLeague = await Promise.all(
      GAUNTLET_LEAGUES.map(async l => {
        const [summaries, live, aggregates, rosters, rawMatchups, oddsHistory] = await Promise.all([
          prisma.matchupSummary.findMany({ where: { leagueId: l.id, week } }),
          prisma.liveWinProbSample.findMany({ where: { leagueId: l.id, week } }),
          prisma.rosterWeekAggregate.findMany({ where: { leagueId: l.id, week: { lte: week } } }),
          prisma.roster.findMany({ where: { leagueId: l.id }, include: { owner: true } }),
          prisma.matchup.findMany({ where: { leagueId: l.id, week } }),
          prisma.matchupOddsHistory.findMany({
            where: { leagueId: l.id, week },
            orderBy: { createdAt: 'asc' },
          }),
        ]);

        const nameByRoster = new Map<number, string>();
        const divisionByRoster = new Map<number, string>();
        for (const r of rosters) {
          const name = resolveTeamName(r);
          nameByRoster.set(r.id, name);
          divisionByRoster.set(r.id, resolveDivisionName(r));
        }

        const samplesByMatchup = new Map<number, Array<{ winProbA: number; timestamp: Date }>>();
        for (const s of live) {
          const arr = samplesByMatchup.get(s.matchupId) || [];
          arr.push({ winProbA: s.winProbA, timestamp: s.timestamp });
          samplesByMatchup.set(s.matchupId, arr);
        }

        const starterIds = Array.from(
          new Set(rawMatchups.flatMap(m => m.starters || []).filter(Boolean) as string[])
        );
        const starterPlayers = starterIds.length
          ? await prisma.player.findMany({ where: { id: { in: starterIds } } })
          : [];
        const playerById = new Map(starterPlayers.map(p => [p.id, p]));

        const rawByMatchup = new Map<number, any[]>();
        for (const rm of rawMatchups) {
          if (rm.matchupId == null) continue;
          const g = (rawByMatchup.get(rm.matchupId) || []) as any[];
          g.push(rm);
          rawByMatchup.set(rm.matchupId, g as any);
        }
        const oddsByMatchup = new Map<
          number,
          Array<{
            timestamp: string;
            winProbA: number;
            winProbB: number;
            gameProgress: number;
            team1Score?: number | null;
            team2Score?: number | null;
          }>
        >();
        for (const oh of oddsHistory as any[]) {
          const arr = oddsByMatchup.get(oh.matchupId) || [];
          arr.push({
            timestamp: (oh.createdAt as Date).toISOString(),
            winProbA: oh.team1WinPct,
            winProbB: oh.team2WinPct,
            gameProgress: oh.gameProgress,
            team1Score: (oh as any).team1Score ?? null,
            team2Score: (oh as any).team2Score ?? null,
          });
          oddsByMatchup.set(oh.matchupId, arr);
        }

        function buildBoxscore(
          raw: any
        ): Array<{ playerId: string; name: string; position: string | null; points: number }> {
          const starters = (raw?.starters || []) as string[];
          const pp = (raw?.playersPoints as Record<string, number>) || {};
          return starters.map(pid => {
            const p = playerById.get(pid);
            return {
              playerId: pid,
              name: p?.fullName || pid,
              position: p?.position || null,
              points: Number(pp[pid] || 0),
            };
          });
        }

        function computeSeriesMetrics(series: Array<{ winProbA: number }>) {
          let maxSwing = 0;
          for (let i = 1; i < series.length; i++) {
            maxSwing = Math.max(maxSwing, Math.abs(series[i].winProbA - series[i - 1].winProbA));
          }
          return { maxSwingPct: maxSwing * 100 };
        }

        function computeLineupGaps(aRaw: any, bRaw: any) {
          const ppA: Record<string, number> = (aRaw?.playersPoints as any) || {};
          const ppB: Record<string, number> = (bRaw?.playersPoints as any) || {};
          const startersA: string[] = (aRaw?.starters || []) as string[];
          const startersB: string[] = (bRaw?.starters || []) as string[];
          const starterSetA = new Set(startersA);
          const starterSetB = new Set(startersB);

          const sum = (ids: string[], map: Record<string, number>) =>
            ids.reduce((s, id) => s + Number(map[id] || 0), 0);
          const startersSumA = sum(startersA, ppA);
          const startersSumB = sum(startersB, ppB);
          const benchSumA = Object.entries(ppA).reduce(
            (s, [id, v]) => s + (starterSetA.has(id) ? 0 : Number(v || 0)),
            0
          );
          const benchSumB = Object.entries(ppB).reduce(
            (s, [id, v]) => s + (starterSetB.has(id) ? 0 : Number(v || 0)),
            0
          );

          const posSum = (ids: string[], map: Record<string, number>, pos: string) =>
            ids.reduce((s, id) => {
              const p = playerById.get(id);
              if ((p?.position || '') === pos) return s + Number(map[id] || 0);
              return s;
            }, 0);

          const qbA = posSum(startersA, ppA, 'QB');
          const qbB = posSum(startersB, ppB, 'QB');
          const defA = posSum(startersA, ppA, 'DEF');
          const defB = posSum(startersB, ppB, 'DEF');

          return {
            startersSumA,
            startersSumB,
            benchSumA,
            benchSumB,
            qbGap: Math.abs(qbA - qbB),
            dstGap: Math.abs(defA - defB),
          };
        }

        let matchups = summaries.map(s => {
          const combined = (s.pointsA || 0) + (s.pointsB || 0);
          const excitement = sumExcitement(samplesByMatchup.get(s.matchupId) || []);
          const rawPair = rawByMatchup.get(s.matchupId) || [];
          const rosterOffset = l.id === '1263740549504962561' ? 2000 : 0;
          const rosterAIdDb = s.rosterAId + rosterOffset;
          const rosterBIdDb = s.rosterBId + rosterOffset;
          const aRaw = rawPair.find(r => r.rosterId === rosterAIdDb);
          const bRaw = rawPair.find(r => r.rosterId === rosterBIdDb);
          const series = (oddsByMatchup.get(s.matchupId) || []) as Array<{
            timestamp: string;
            winProbA: number;
            winProbB: number;
            gameProgress: number;
            team1Score?: number | null;
            team2Score?: number | null;
          }>;
          const seriesExtras = computeSeriesMetrics(series);
          const lineupExtras =
            aRaw && bRaw
              ? computeLineupGaps(aRaw, bRaw)
              : {
                  startersSumA: 0,
                  startersSumB: 0,
                  benchSumA: 0,
                  benchSumB: 0,
                  qbGap: 0,
                  dstGap: 0,
                };
          return {
            leagueId: l.id,
            matchupId: s.matchupId,
            rosterAId: rosterAIdDb,
            rosterBId: rosterBIdDb,
            teamAName: nameByRoster.get(rosterAIdDb) || `Team ${rosterAIdDb}`,
            teamBName: nameByRoster.get(rosterBIdDb) || `Team ${rosterBIdDb}`,
            pointsA: s.pointsA,
            pointsB: s.pointsB,
            margin: Math.abs(s.margin || (s.pointsA || 0) - (s.pointsB || 0)),
            combinedPoints: combined,
            excitement,
            startersA: (aRaw?.starters || []) as string[],
            startersB: (bRaw?.starters || []) as string[],
            startersPointsA: ((aRaw?.playersPoints as any) || {}) as Record<string, number>,
            startersPointsB: ((bRaw?.playersPoints as any) || {}) as Record<string, number>,
            series,
            boxscoreA: aRaw ? buildBoxscore(aRaw) : [],
            boxscoreB: bRaw ? buildBoxscore(bRaw) : [],
            excitementMetrics: (() => {
              const ser = oddsByMatchup.get(s.matchupId) || [];
              let leadChanges = 0;
              let prevSide: 'A' | 'B' | null = null;
              let deltas: number[] = [];
              for (let i = 0; i < ser.length; i++) {
                const currSide = ser[i].winProbA >= 0.5 ? 'A' : 'B';
                if (prevSide && currSide !== prevSide) leadChanges++;
                if (i > 0) deltas.push(Math.abs(ser[i].winProbA - ser[i - 1].winProbA));
                prevSide = currSide;
              }
              const avgDeltaPct = deltas.length
                ? (deltas.reduce((a, b) => a + b, 0) / deltas.length) * 100
                : 0;
              return { leadChanges, avgDeltaPct, ...seriesExtras, ...lineupExtras } as any;
            })(),
          };
        });

        const allZero =
          matchups.length === 0 || matchups.every(m => (m.pointsA || 0) + (m.pointsB || 0) === 0);
        if (allZero && rawMatchups.length > 0) {
          matchups = [];
          for (const [mid, g] of rawByMatchup) {
            if (g.length !== 2) continue;
            const sorted = [...g].sort((x, y) => x.rosterId - y.rosterId);
            const a = sorted[0];
            const b = sorted[1];
            const rosterAIdDb = Number(a.rosterId);
            const rosterBIdDb = Number(b.rosterId);
            const series = (oddsByMatchup.get(mid) || []) as Array<{
              timestamp: string;
              winProbA: number;
              winProbB: number;
              gameProgress: number;
              team1Score?: number | null;
              team2Score?: number | null;
            }>;
            const seriesExtras = computeSeriesMetrics(series);
            const lineupExtras = computeLineupGaps(a, b);
            matchups.push({
              leagueId: l.id,
              matchupId: mid,
              rosterAId: rosterAIdDb,
              rosterBId: rosterBIdDb,
              teamAName: nameByRoster.get(rosterAIdDb) || `Team ${rosterAIdDb}`,
              teamBName: nameByRoster.get(rosterBIdDb) || `Team ${rosterBIdDb}`,
              pointsA: a.points || 0,
              pointsB: b.points || 0,
              margin: Math.abs((a.points || 0) - (b.points || 0)),
              combinedPoints: (a.points || 0) + (b.points || 0),
              excitement: sumExcitement(samplesByMatchup.get(mid) || []),
              startersA: (a.starters || []) as string[],
              startersB: (b.starters || []) as string[],
              startersPointsA: ((a.playersPoints as any) || {}) as Record<string, number>,
              startersPointsB: ((b.playersPoints as any) || {}) as Record<string, number>,
              series,
              boxscoreA: buildBoxscore(a),
              boxscoreB: buildBoxscore(b),
              excitementMetrics: (() => {
                const ser = oddsByMatchup.get(mid) || [];
                let leadChanges = 0;
                let prevSide: 'A' | 'B' | null = null;
                let deltas: number[] = [];
                for (let i = 0; i < ser.length; i++) {
                  const currSide = ser[i].winProbA >= 0.5 ? 'A' : 'B';
                  if (prevSide && currSide !== prevSide) leadChanges++;
                  if (i > 0) deltas.push(Math.abs(ser[i].winProbA - ser[i - 1].winProbA));
                  prevSide = currSide;
                }
                const avgDeltaPct = deltas.length
                  ? (deltas.reduce((a, b) => a + b, 0) / deltas.length) * 100
                  : 0;
                return { leadChanges, avgDeltaPct, ...seriesExtras, ...lineupExtras } as any;
              })(),
            });
          }
        }

        const standingsByDivision: Record<
          string,
          Array<{ rosterId: number; name: string; wins: number; losses: number; points: number }>
        > = {};
        const byRosterAgg = new Map<number, { wins: number; losses: number; points: number }>();
        for (const r of aggregates) {
          const rec = byRosterAgg.get(r.rosterId) || { wins: 0, losses: 0, points: 0 };
          rec.points += r.points || 0;
          if (r.won) rec.wins += 1;
          else rec.losses += 1;
          byRosterAgg.set(r.rosterId, rec);
        }
        for (const [rawRosterId, rec] of byRosterAgg.entries()) {
          const rosterId =
            l.id === '1263740549504962561' && rawRosterId < 1000 ? rawRosterId + 2000 : rawRosterId;
          const division = divisionByRoster.get(rosterId) || 'No Division';
          const name = nameByRoster.get(rosterId) || `Team ${rosterId}`;
          const list = standingsByDivision[division] || [];
          list.push({
            rosterId,
            name,
            wins: rec.wins,
            losses: rec.losses,
            points: Number(rec.points.toFixed(2)),
          });
          standingsByDivision[division] = list;
        }
        for (const div of Object.keys(standingsByDivision)) {
          standingsByDivision[div].sort((a, b) => b.wins - a.wins || b.points - a.points);
        }

        // League-level overview narratives (Week 1 template tone)
        const leagueOverview =
          l.id === '1263740549504962561' ? parsed.nfcOverview : parsed.afcOverview;

        // Build flexible name index for template matching
        const altNamesByRoster = new Map<number, string[]>();
        for (const r of rosters) {
          const names: string[] = [];
          const teamName = resolveTeamName(r);
          if (teamName) names.push(String(teamName));
          if (r.owner?.displayName) names.push(String(r.owner.displayName));
          if (r.owner?.username) names.push(String(r.owner.username));
          altNamesByRoster.set(
            r.id,
            names.map(s => s.toLowerCase())
          );
        }

        function attachNarrative(m: any): any {
          const isNFC = l.id === '1263740549504962561';
          const items = isNFC ? parsed.itemsNFC : parsed.itemsAFC;
          const aAlts = altNamesByRoster.get(m.rosterAId) || [];
          const bAlts = altNamesByRoster.get(m.rosterBId) || [];
          const aName = (m.teamAName || '').toLowerCase();
          const bName = (m.teamBName || '').toLowerCase();
          const allA = new Set([...aAlts, aName]);
          const allB = new Set([...bAlts, bName]);
          const hit = items.find(it => {
            const na = it.a.toLowerCase();
            const nb = it.b.toLowerCase();
            const aMatches = Array.from(allA).some(n => n.includes(na));
            const bMatches = Array.from(allB).some(n => n.includes(nb));
            const aMatchesSwap = Array.from(allA).some(n => n.includes(nb));
            const bMatchesSwap = Array.from(allB).some(n => n.includes(na));
            return (aMatches && bMatches) || (aMatchesSwap && bMatchesSwap);
          });
          if (hit) {
            m.recap = hit.recap;
            m.odds = hit.odds;
          }
          return m;
        }

        return {
          leagueId: l.id,
          leagueName: leaguesMeta.find(x => x.id === l.id)?.name || l.name,
          overview: leagueOverview,
          matchups: matchups.map(attachNarrative),
          detectors: {},
          teams: aggregates.map(a => ({
            leagueId: l.id,
            rosterId: a.rosterId,
            wins: a.won ? 1 : 0,
            losses: a.won ? 0 : 1,
            totalPoints: a.points || 0,
            expectedWins: a.expectedWins || 0,
            luckRating: a.luck || 0,
          })),
          standingsByDivision,
        };
      })
    );

    const history = await prisma.rosterWeekAggregate.findMany({
      where: { leagueId: { in: GAUNTLET_LEAGUES.map(l => l.id) }, week: { lte: week } },
      orderBy: [{ leagueId: 'asc' }, { rosterId: 'asc' }, { week: 'asc' }],
    });
    type Hist = {
      leagueId: string;
      rosterId: number;
      week: number;
      points: number;
      expectedWins: number;
      rollingAvg3: number | null;
    };
    const histByRoster = new Map<string, Hist[]>();
    for (const h of history) {
      const key = `${h.leagueId}:${h.rosterId}`;
      const arr = histByRoster.get(key) || [];
      arr.push({
        leagueId: h.leagueId,
        rosterId: h.rosterId,
        week: h.week,
        points: h.points || 0,
        expectedWins: h.expectedWins || 0,
        rollingAvg3: (h as any).rollingAvg3 || 0,
      });
      histByRoster.set(key, arr);
    }
    // Build win/loss record by roster up to this week (apply NFC rosterId offset like elsewhere)
    const recordByRoster = new Map<string, { wins: number; losses: number }>();
    for (const h of history as any[]) {
      const isNFC = h.leagueId === '1263740549504962561';
      const rosterId = isNFC && h.rosterId < 1000 ? h.rosterId + 2000 : h.rosterId;
      const key = `${h.leagueId}:${rosterId}`;
      const rec = recordByRoster.get(key) || { wins: 0, losses: 0 };
      if (h.won) rec.wins += 1;
      else rec.losses += 1;
      recordByRoster.set(key, rec);
    }
    const metrics: Array<{
      leagueId: string;
      rosterId: number;
      avgPts: number;
      expCum: number;
      roll3: number;
    }> = [];
    for (const [key, rows] of histByRoster) {
      const leagueId = key.split(':')[0];
      const rawRosterId = Number(key.split(':')[1]);
      const rosterId =
        leagueId === '1263740549504962561' && rawRosterId < 1000 ? rawRosterId + 2000 : rawRosterId;
      const avgPts = rows.length ? rows.reduce((a, r) => a + (r.points || 0), 0) / rows.length : 0;
      const expCum = rows.reduce((a, r) => a + (r.expectedWins || 0), 0);
      const last = rows[rows.length - 1];
      const roll3 = last?.rollingAvg3 || 0;
      metrics.push({ leagueId, rosterId, avgPts, expCum, roll3 });
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
    const powerList = metrics.map((m, i) => ({
      leagueId: m.leagueId,
      rosterId: m.rosterId,
      z: 0.5 * zA[i] + 0.3 * zE[i] + 0.2 * zR[i],
    }));
    powerList.sort((a, b) => b.z - a.z);

    const allRosters = await prisma.roster.findMany({
      where: { leagueId: { in: GAUNTLET_LEAGUES.map(l => l.id) } },
      include: { owner: true },
    });
    const nameByRosterGlobal = new Map<string, string>();
    for (const r of allRosters) {
      const nm = resolveTeamName(r);
      nameByRosterGlobal.set(`${r.leagueId}:${r.id}`, nm);
    }
    const powerRankings = powerList.map((p, idx) => ({
      rank: idx + 1,
      leagueId: p.leagueId,
      rosterId: p.rosterId,
      name: nameByRosterGlobal.get(`${p.leagueId}:${p.rosterId}`) || `Team ${p.rosterId}`,
      score: Number(p.z.toFixed(3)),
      normalized: Math.round(100 + 10 * p.z),
      ...(recordByRoster.get(`${p.leagueId}:${p.rosterId}`) || { wins: 0, losses: 0 }),
    }));

    const nextWeek = week + 1;
    const upcomingByLeague: Record<
      string,
      Array<{
        matchupId: number;
        rosterAId: number;
        rosterBId: number;
        teamAName: string;
        teamBName: string;
      }>
    > = {};
    for (const l of GAUNTLET_LEAGUES) {
      const rows = await prisma.matchup.findMany({ where: { leagueId: l.id, week: nextWeek } });
      const grouped = new Map<number, any[]>();
      for (const r of rows) {
        if (r.matchupId == null) continue;
        const g = grouped.get(r.matchupId) || [];
        g.push(r);
        grouped.set(r.matchupId, g);
      }
      const pairs: Array<{
        matchupId: number;
        rosterAId: number;
        rosterBId: number;
        teamAName: string;
        teamBName: string;
      }> = [];
      const nameByRosterLocal = new Map<number, string>();
      const leagueRosters = allRosters.filter(ar => ar.leagueId === l.id);
      for (const rr of leagueRosters) {
        const nm = resolveTeamName(rr);
        nameByRosterLocal.set(rr.id, nm);
      }
      for (const [mid, g] of grouped) {
        if (g.length !== 2) continue;
        const a = g[0];
        const b = g[1];
        pairs.push({
          matchupId: mid,
          rosterAId: a.rosterId,
          rosterBId: b.rosterId,
          teamAName: nameByRosterLocal.get(a.rosterId) || `Team ${a.rosterId}`,
          teamBName: nameByRosterLocal.get(b.rosterId) || `Team ${b.rosterId}`,
        });
      }
      upcomingByLeague[l.id] = pairs;
    }

    return NextResponse.json({
      ok: true,
      data: {
        season,
        week,
        scribeIntro: parsed.scribeIntro,
        myIntro: (parsed as any).myIntro || undefined,
        leagues: perLeague,
        standings: perLeague.map(l => ({
          leagueId: l.leagueId,
          leagueName: l.leagueName,
          divisions: l.standingsByDivision,
        })),
        powerRankings,
        upcoming: upcomingByLeague,
        closingNote: (parsed as any).closingNote || undefined,
        callouts: (parsed as any).callouts || {},
      },
    });
  } catch (error: any) {
    console.error('Error building report data:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
