'use client';

/* eslint-disable no-console */

import { Suspense, useEffect, useMemo, useState } from 'react';
import { Container, PageHeader } from '@gauntlet/ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLeagueData, useLeagueDataById } from '@/lib/hooks';
import { useSearchParams } from 'next/navigation';
import { buildFacts, Facts, firstOwnedWeek, lastOwnedWeek } from '@/features/transactions/utils';
import { playoffWeight } from '@/shared/utils/calculations';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { GradeTxn, RawTxn } from '@/features/transactions/types';

const LeagueTransactionsContent = () => {
  const searchParams = useSearchParams();
  const leagueIdParam = searchParams.get('leagueId');

  // Use league-specific hook if leagueId is provided, otherwise use default
  const leagueDataById = useLeagueDataById(leagueIdParam || undefined);
  const leagueDataDefault = useLeagueData();

  const { league } = leagueIdParam ? leagueDataById : leagueDataDefault;
  const leagueId = league?.id ? String(league.id) : undefined;
  const [allData, setAllData] = useState<GradeTxn[]>([]);
  const [rawTransactions, setRawTransactions] = useState<RawTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [pos, setPos] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [team, setTeam] = useState<number | 'ALL'>('ALL');
  const [sort, setSort] = useState<'date_desc' | 'score_desc' | 'score_asc'>('date_desc');
  const [selected, setSelected] = useState<GradeTxn | null>(null);
  const [view, setView] = useState<'paged' | 'all'>('paged');
  const [pageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(0);
  const [facts, setFacts] = useState<Facts | null>(null);
  const [factsLoading, setFactsLoading] = useState(true);
  const [factsError, setFactsError] = useState<string | null>(null);

  // Fetch ALL transactions once and compute grades from local facts
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!leagueId || !facts || factsLoading) return;
        setLoading(true);
        const params = new URLSearchParams();
        if (type !== 'ALL') params.set('type', type);

        const collectAllRaw = async (): Promise<RawTxn[]> => {
          const pageSize = 300;
          let off = 0;
          let all: RawTxn[] = [];
          while (!cancelled) {
            params.set('limit', String(pageSize));
            params.set('offset', String(off));
            const res = await fetch(`/api/league/${leagueId}/transactions?${params.toString()}`);
            if (!res.ok) {
              break;
            }
            const json = (await res.json()) as { ok: boolean; data?: RawTxn[] };

            const page = json.data || [];
            all = all.concat(page);
            if (page.length < pageSize) break;
            off += pageSize;
          }
          return all;
        };

        const raw = await collectAllRaw();

        // Filter out failed transactions
        const validTransactions = raw.filter(t => t.status !== 'failed');

        // Store raw transactions for trade parsing
        setRawTransactions(validTransactions);

        // Build quick lookup for positions/names
        const idToPlayer = new Map<string, { name: string; position: string }>();
        validTransactions.forEach(t => {
          if (t.adds && Array.isArray(t.adds)) {
            t.adds.forEach(a =>
              a.players?.forEach(p =>
                idToPlayer.set(p.id, { name: p.fullName, position: p.position }),
              ),
            );
          }
          if (t.drops && Array.isArray(t.drops)) {
            t.drops.forEach(d =>
              d.players?.forEach(p =>
                idToPlayer.set(p.id, { name: p.fullName, position: p.position }),
              ),
            );
          }
        });

        const filterByTeam = (t: RawTxn) =>
          team === 'ALL' ? true : (t.rosterIds || []).includes(Number(team));
        const filterByPos = (pid: string) =>
          pos === 'ALL'
            ? true
            : (idToPlayer.get(pid)?.position || '').toUpperCase() === pos.toUpperCase();

        const compute = (txns: RawTxn[]): GradeTxn[] => {
          if (!facts) return [];
          const f = facts;
          const graded: GradeTxn[] = [];

          // Calculate position-specific replacement levels
          const positionReplacementLevels = new Map<string, number>(); // `${week}:${position}`

          for (const week of f.weeks) {
            const weekPositionPoints: Record<string, number[]> = {};

            // Collect all starter points by position for this week
            for (const [weekRosterKey, starters] of f.weekRosterStarters.entries()) {
              const [weekStr] = weekRosterKey.split(':');
              if (Number(weekStr) !== week) continue;

              for (const playerId of starters) {
                const playerInfo = idToPlayer.get(playerId);
                if (!playerInfo) continue;

                const points = f.playerWeekPoints.get(`${week}:${playerId}`) || 0;
                const position = playerInfo.position.toUpperCase();

                if (!weekPositionPoints[position]) weekPositionPoints[position] = [];
                weekPositionPoints[position].push(points);
              }
            }

            // Calculate median (replacement level) for each position
            for (const [position, pointsArray] of Object.entries(weekPositionPoints)) {
              if (pointsArray.length > 0) {
                pointsArray.sort((a, b) => a - b);
                const median = pointsArray[Math.floor(pointsArray.length / 2)];
                positionReplacementLevels.set(`${week}:${position}`, median);
              }
            }

            // Calculate FLEX replacement as average of RB and WR medians
            const rbRepl = positionReplacementLevels.get(`${week}:RB`) || 0;
            const wrRepl = positionReplacementLevels.get(`${week}:WR`) || 0;
            const flexRepl = (rbRepl + wrRepl) / 2;
            positionReplacementLevels.set(`${week}:FLEX`, flexRepl);
          }

          const weekHintFromDate = (iso: string) => {
            const d = new Date(iso);
            const m = d.getMonth() + 1; // 1-12
            if (m <= 8) return 0; // preseason
            if (m === 9) return 1;
            if (m === 10) return 5;
            if (m === 11) return 10;
            if (m === 12) return 14;
            // January postseason spillover
            return 18;
          };
          const filteredTxns = txns.filter(filterByTeam);

          for (const t of filteredTxns) {
            const createdAt = new Date(t.createdAt).toISOString();
            const txnWeekHint = weekHintFromDate(createdAt);
            const playersOut: GradeTxn['players'] = [];

            const addPairs: Array<{ rosterId: number; playerId: string }> = [];
            if (t.adds && Array.isArray(t.adds)) {
              t.adds.forEach(a =>
                a.players?.forEach(p => addPairs.push({ rosterId: a.rosterId, playerId: p.id })),
              );
            }

            const dropPairs: Array<{ rosterId: number; playerId: string }> = [];
            if (t.drops && Array.isArray(t.drops)) {
              t.drops.forEach(d =>
                d.players?.forEach(p => dropPairs.push({ rosterId: d.rosterId, playerId: p.id })),
              );
            }

            console.log('Transaction pairs - adds:', addPairs.length, 'drops:', dropPairs.length);

            // Adds
            console.log('Processing', addPairs.length, 'add pairs');
            for (const { rosterId, playerId } of addPairs) {
              console.log('Processing add:', playerId, 'for roster:', rosterId);
              if (!filterByPos(playerId)) {
                console.log('Add filtered out by position:', playerId);
                continue;
              }
              const info = idToPlayer.get(playerId);
              console.log('Player info:', info);
              const w0 = firstOwnedWeek(f, rosterId, playerId);
              console.log('First owned week for', playerId, 'on roster', rosterId, ':', w0);
              const forYou = { starts: 0, points: 0, weightedPoints: 0 } as NonNullable<
                GradeTxn['players'][number]['forYou']
              >;
              if (w0 != null) {
                console.log('Processing weeks for add, w0:', w0, 'txnWeekHint:', txnWeekHint);
                for (const w of f.weeks) {
                  console.log('Checking week', w, 'against threshold', Math.max(w0, txnWeekHint));
                  if (w < Math.max(w0, txnWeekHint)) continue;
                  console.log('Processing week', w, 'for player', playerId, 'on roster', rosterId);
                  const starters = f.weekRosterStarters.get(`${w}:${rosterId}`);
                  console.log(
                    'Starters for week',
                    w,
                    'roster',
                    rosterId,
                    ':',
                    starters?.size || 0,
                    'players',
                  );
                  if (starters && starters.has(playerId)) {
                    const pts = f.playerWeekPoints.get(`${w}:${playerId}`) || 0;
                    const playerPos = info?.position?.toUpperCase() || 'FLEX';
                    const replLevel = positionReplacementLevels.get(`${w}:${playerPos}`) || 0;
                    const vorp = pts - replLevel; // Value Over Replacement Player

                    forYou.starts += 1;
                    forYou.points += pts; // Keep raw points for display
                    forYou.weightedPoints += playoffWeight(w) * vorp; // Use VORP for scoring
                  }
                }
              }
              // Build weekly points breakdown for added player
              const weeklyPoints: Array<{
                week: number;
                points: number;
                started: boolean;
                weight: number;
              }> = [];
              const firstW = w0; // Use the same w0 we calculated above
              console.log('Weekly points bounds: firstW:', firstW, 'txnWeekHint:', txnWeekHint);
              for (const w of f.weeks) {
                console.log('Building weekly point for week', w);
                if (firstW != null && w < firstW) {
                  console.log('Week', w, 'skipped - before firstW', firstW);
                  continue;
                }
                if (w < txnWeekHint) {
                  console.log('Week', w, 'skipped - before txnWeekHint', txnWeekHint);
                  continue;
                }
                const points = f.playerWeekPoints.get(`${w}:${playerId}`) || 0;
                const started =
                  f.weekRosterStarters.get(`${w}:${rosterId}`)?.has(playerId) || false;
                const weight = playoffWeight(w);
                console.log('Week', w, '- points:', points, 'started:', started, 'weight:', weight);
                weeklyPoints.push({ week: w, points, started, weight });
              }

              console.log('Built weekly points for add:', weeklyPoints.length, 'weeks');
              const playerOut = {
                playerId,
                name: info?.name || playerId,
                position: info?.position || 'UNK',
                role: 'add' as const,
                pre: { ppg: 0, pps: 0, total: 0 },
                post: { poPts: 0 },
                forYou,
                weeklyPoints,
              };
              console.log('Adding player to playersOut:', playerOut.playerId, playerOut.name);
              playersOut.push(playerOut);
            }

            // Drops
            console.log('Processing', dropPairs.length, 'drop pairs');
            for (const { rosterId, playerId } of dropPairs) {
              console.log('Processing drop:', playerId, 'for roster:', rosterId);
              if (!filterByPos(playerId)) {
                console.log('Drop filtered out by position:', playerId);
                continue;
              }
              const info = idToPlayer.get(playerId);
              const lastW = lastOwnedWeek(f, rosterId, playerId);
              const afterDrop = {
                selfHarm: 0,
                oppHarm: 0,
                selfHarmWeighted: 0,
                oppHarmWeighted: 0,
              } as NonNullable<GradeTxn['players'][number]['afterDrop']>;
              const posUp = (info?.position || 'UNK').toUpperCase();
              for (const w of f.weeks) {
                if (lastW != null && w <= lastW) continue;
                if (w < txnWeekHint) continue;
                // self-harm: only count if dropped player would have displaced worst starter
                const yourStarters = f.weekRosterStarters.get(`${w}:${rosterId}`);
                if (yourStarters && yourStarters.size) {
                  // Get all same-position players you started that week
                  const samePositionStarters: Array<{ playerId: string; points: number }> = [];
                  for (const pid of yourStarters) {
                    const ppos = idToPlayer.get(pid)?.position?.toUpperCase();
                    if (ppos === posUp) {
                      const pts = f.playerWeekPoints.get(`${w}:${pid}`) || 0;
                      samePositionStarters.push({ playerId: pid, points: pts });
                    }
                  }

                  if (samePositionStarters.length > 0) {
                    // Sort by points to find worst starter
                    samePositionStarters.sort((a, b) => a.points - b.points);
                    const worstStarterPoints = samePositionStarters[0].points;
                    const droppedPts = f.playerWeekPoints.get(`${w}:${playerId}`) || 0;

                    // Only count self-harm if dropped player would have displaced worst starter
                    if (droppedPts > worstStarterPoints) {
                      const delta = droppedPts - worstStarterPoints;
                      afterDrop.selfHarm += delta;
                      afterDrop.selfHarmWeighted += playoffWeight(w) * delta;
                    }
                  }
                }
                // opponent harm: check if ANY opponent (not just direct opponent) started the player
                let anyOpponentStarted = false;
                for (const [weekRosterKey, starters] of f.weekRosterStarters.entries()) {
                  const [weekStr, rosterIdStr] = weekRosterKey.split(':');
                  if (Number(weekStr) !== w) continue;
                  const checkRosterId = Number(rosterIdStr);
                  if (checkRosterId === rosterId) continue; // Skip the roster that dropped the player

                  if (starters.has(playerId)) {
                    anyOpponentStarted = true;
                    break;
                  }
                }

                if (anyOpponentStarted) {
                  const oppPts = f.playerWeekPoints.get(`${w}:${playerId}`) || 0;
                  const repl = positionReplacementLevels.get(`${w}:${posUp}`) || 0;
                  const harm = Math.max(0, oppPts - repl);
                  afterDrop.oppHarm += harm;
                  afterDrop.oppHarmWeighted += playoffWeight(w) * harm;
                }
              }
              // Build weekly points breakdown for dropped player
              const weeklyPoints: Array<{
                week: number;
                points: number;
                started: boolean;
                weight: number;
              }> = [];
              for (const w of f.weeks) {
                if (lastW != null && w <= lastW) continue;
                if (w < txnWeekHint) continue;
                const points = f.playerWeekPoints.get(`${w}:${playerId}`) || 0;
                // Check if any opponent started this player
                let anyOpponentStarted = false;
                for (const [weekRosterKey, starters] of f.weekRosterStarters.entries()) {
                  const [weekStr, rosterIdStr] = weekRosterKey.split(':');
                  if (Number(weekStr) !== w) continue;
                  const checkRosterId = Number(rosterIdStr);
                  if (checkRosterId === rosterId) continue;
                  if (starters.has(playerId)) {
                    anyOpponentStarted = true;
                    break;
                  }
                }
                const weight = playoffWeight(w);
                weeklyPoints.push({ week: w, points, started: anyOpponentStarted, weight });
              }

              playersOut.push({
                playerId,
                name: info?.name || playerId,
                position: info?.position || 'UNK',
                role: 'drop',
                pre: { ppg: 0, pps: 0, total: 0 },
                post: { poPts: 0 },
                afterDrop,
                weeklyPoints,
              });
            }

            console.log('Final transaction processing - playersOut:', playersOut.length);
            const contribution = playersOut
              .filter(p => p.role === 'add' && p.forYou)
              .reduce((s, p) => s + (p.forYou?.weightedPoints || 0), 0);
            const penalties = playersOut
              .filter(p => p.role === 'drop' && p.afterDrop)
              .reduce(
                (s, p) =>
                  s + (p.afterDrop?.selfHarmWeighted || 0) + (p.afterDrop?.oppHarmWeighted || 0),
                0,
              );
            const score = contribution - penalties;
            console.log('Transaction scoring:', { contribution, penalties, score });
            const gradedTxn = {
              id: t.id,
              type: t.type,
              createdAt,
              rosterIds: t.rosterIds,
              players: playersOut,
              score,
              grade: 'N/A',
            };
            console.log(
              'Created graded transaction:',
              gradedTxn.id,
              'players:',
              playersOut.length,
              'score:',
              score,
            );
            graded.push(gradedTxn);
          }

          // Letter grades by z-score
          const vals = graded.map(g => g.score);
          const n = vals.length || 1;
          const mean = vals.reduce((a, b) => a + b, 0) / n;
          const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1);
          const std = Math.sqrt(variance);
          graded.forEach(g => {
            const z = std > 0 ? (g.score - mean) / std : 0;
            const pct = 50 + 40 * Math.tanh(z);
            g.grade =
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
          });
          return graded;
        };

        const graded = compute(validTransactions);
        if (!cancelled) {
          setAllData(graded);
          setCurrentPage(0);
        }
      } catch {
        if (!cancelled) {
          setAllData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [leagueId, type, facts, factsLoading, team, pos]);

  const filteredAndSorted = useMemo(() => {
    const filtered = allData.filter(t => {
      // Team filter
      if (team !== 'ALL' && !(t.rosterIds || []).includes(Number(team))) return false;
      // Position filter
      if (pos !== 'ALL') {
        const hasMatchingPos = t.players.some(p => p.position.toUpperCase() === pos.toUpperCase());
        if (!hasMatchingPos) return false;
      }
      return true;
    });

    // Sort
    if (sort === 'score_desc') filtered.sort((a, b) => b.score - a.score);
    if (sort === 'score_asc') filtered.sort((a, b) => a.score - b.score);
    if (sort === 'date_desc')
      filtered.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    return filtered;
  }, [allData, sort, team, pos]);

  // Create roster map once for team name lookups
  const rosterMap = useMemo(() => {
    const map = new Map<number, string>();
    (league?.rosters || []).forEach((r: any) => {
      const name =
        r?.owner?.metadata?.team_name ||
        r?.owner?.displayName ||
        r?.owner?.username ||
        `Team ${r.id}`;
      // Map unique roster ID
      map.set(Number(r.id), name);

      // Map original Sleeper ID: AFC 1001-1012 -> 1-12, NFC 2001-2012 -> 1-12
      const rosterId = Number(r.id);
      let originalId: number;
      if (rosterId >= 2000) {
        originalId = rosterId - 2000; // NFC: 2001 -> 1, 2012 -> 12
      } else if (rosterId >= 1000) {
        originalId = rosterId - 1000; // AFC: 1001 -> 1, 1012 -> 12
      } else {
        originalId = rosterId; // Fallback for old IDs
      }
      map.set(originalId, name);
    });
    return map;
  }, [league?.rosters]);

  const rows = useMemo(() => {
    if (view === 'all') return filteredAndSorted;
    const start = currentPage * pageSize;
    return filteredAndSorted.slice(0, start + pageSize);
  }, [filteredAndSorted, view, currentPage, pageSize]);

  const hasMorePages = useMemo(() => {
    return view === 'paged' && (currentPage + 1) * pageSize < filteredAndSorted.length;
  }, [view, currentPage, pageSize, filteredAndSorted]);

  // RdYlGn background helpers (local)
  const hexToRgb = (hex: string) => {
    const h = hex.replace('#', '');
    const bigint = parseInt(
      h.length === 3
        ? h
            .split('')
            .map(x => x + x)
            .join('')
        : h,
      16,
    );
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  };
  const mixHex = (a: string, b: string, t: number) => {
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    const rr = Math.round(ca.r + (cb.r - ca.r) * t);
    const rg = Math.round(ca.g + (cb.g - ca.g) * t);
    const rb = Math.round(ca.b + (cb.b - ca.b) * t);
    const toHex = (v: number) => v.toString(16).padStart(2, '0');
    return `#${toHex(rr)}${toHex(rg)}${toHex(rb)}`;
  };
  const RDYLGN = [
    '#a50026',
    '#d73027',
    '#f46d43',
    '#fdae61',
    '#fee08b',
    '#ffffbf',
    '#d9ef8b',
    '#a6d96a',
    '#66bd63',
    '#1a9850',
    '#006837',
  ];
  const getDivergingBg = (normalized: number) => {
    const t = Math.max(-1, Math.min(1, normalized));
    const u = (t + 1) / 2;
    const n = RDYLGN.length - 1;
    const idx = Math.max(0, Math.min(n - 1, Math.floor(u * n)));
    const frac = u * n - idx;
    const from = RDYLGN[idx];
    const to = RDYLGN[idx + 1] ?? RDYLGN[idx];
    return mixHex(from, to, frac);
  };
  const getTextColorForBg = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const srgb = [r, g, b].map(v => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    return L > 0.5 ? '#111827' : '#ffffff';
  };
  const scoreRange = useMemo(() => {
    const values = rows.map(r => r.score);
    const maxAbs = Math.max(1, ...values.map(v => Math.abs(v)));
    return maxAbs;
  }, [rows]);

  // Build local facts store once per page load for current season weeks
  useEffect(() => {
    (async () => {
      if (!leagueId) return;
      setFactsLoading(true);
      setFactsError(null);
      try {
        // Include playoff weeks for complete scoring
        const weeks = Array.from({ length: 17 }, (_, i) => i + 1);
        const f = await buildFacts(leagueId, weeks);
        setFacts(f);
      } catch (error) {
        setFactsError(error instanceof Error ? error.message : 'Failed to load matchup data');
        setFacts(null);
      } finally {
        setFactsLoading(false);
      }
    })();
  }, [leagueId]);

  return (
    <TooltipProvider>
      <Container className="py-8">
        <div className="flex items-start justify-between mb-6">
          <PageHeader
            title="Transactions"
            subtitle={`${league?.name || 'League'} - Transaction feed with grades`}
          />
        </div>

        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <div className="text-sm text-muted-foreground">Position:</div>
          {['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map(p => (
            <Button
              key={p}
              size="sm"
              variant={pos === p ? 'default' : 'outline'}
              onClick={() => {
                setPos(p);
                setCurrentPage(0);
              }}
              className="h-7 px-2"
            >
              {p}
            </Button>
          ))}
          <label className="ml-4 text-sm text-muted-foreground" htmlFor="team-filter">
            Team:
          </label>
          <select
            id="team-filter"
            className="border border-border rounded px-2 py-1 bg-background text-sm max-w-xs"
            value={team === 'ALL' ? 'ALL' : String(team)}
            onChange={e => {
              const v = e.target.value;
              setTeam(v === 'ALL' ? 'ALL' : Number(v));
              setCurrentPage(0);
            }}
          >
            <option value="ALL">ALL</option>
            {(league?.rosters || []).map(r => (
              <option key={r.id} value={String(r.id)}>
                {r.owner?.metadata?.team_name ||
                  r.owner?.displayName ||
                  r.owner?.username ||
                  `Team ${r.id}`}
              </option>
            ))}
          </select>
          <div className="ml-4 text-sm text-muted-foreground">Type:</div>
          {['ALL', 'free_agent', 'waiver', 'trade'].map(t => (
            <Button
              key={t}
              size="sm"
              variant={type === t ? 'default' : 'outline'}
              onClick={() => {
                setType(t);
                setCurrentPage(0);
              }}
              className="h-7 px-2"
            >
              {t === 'ALL' ? 'ALL' : t.replace('_', ' ')}
            </Button>
          ))}
          <label className="ml-4 text-sm text-muted-foreground" htmlFor="txn-sort">
            Sort:
          </label>
          <select
            id="txn-sort"
            className="border border-border rounded px-2 py-1 bg-background text-sm"
            value={sort}
            onChange={e => setSort(e.target.value as any)}
          >
            <option value="date_desc">Most Recent</option>
            <option value="score_desc">Score (best)</option>
            <option value="score_asc">Score (worst)</option>
          </select>
          <div className="ml-4 text-sm text-muted-foreground">View:</div>
          {(['paged', 'all'] as const).map(v => (
            <Button
              key={v}
              size="sm"
              variant={view === v ? 'default' : 'outline'}
              onClick={() => {
                setView(v);
                setCurrentPage(0);
              }}
              className="h-7 px-2"
            >
              {v === 'paged' ? 'Paged' : 'Show all'}
            </Button>
          ))}
        </div>

        {factsLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <div className="text-sm text-muted-foreground">Loading matchup data...</div>
            <div className="text-xs text-muted-foreground mt-1">
              Fetching 17 weeks of lineup data
            </div>
          </div>
        ) : factsError ? (
          <div className="text-sm text-red-500">Error loading matchup data: {factsError}</div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <div className="text-sm text-muted-foreground">Computing transaction grades...</div>
            <div className="text-xs text-muted-foreground mt-1">
              Calculating VORP for all transactions
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead className="text-right">Grade</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div>{t.type.replace('_', ' ')}</div>
                        {!!(t.rosterIds && t.rosterIds.length) && (
                          <div className="text-xs text-muted-foreground">
                            {(t.rosterIds || [])
                              .map(rid => rosterMap.get(Number(rid)) || `Team ${rid}`)
                              .join(' • ')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {t.type === 'trade'
                          ? // For trades, show which team got which player with unidirectional arrows
                            (() => {
                              // Find the corresponding raw transaction for trade details
                              const rawTxn = rawTransactions.find(rt => rt.id === t.id);
                              if (!rawTxn) {
                                // Fallback to old logic if raw transaction not found
                                const addedPlayers = t.players.filter(p => p.role === 'add');
                                return addedPlayers.map(p => (
                                  <div key={p.playerId} className="text-sm text-muted-foreground">
                                    {p.name} ({p.position}) • Trade
                                  </div>
                                ));
                              }

                              // Use raw transaction data to show specific destinations
                              return (rawTxn.adds || []).flatMap(addGroup =>
                                (addGroup.players || []).map(player => {
                                  const teamName =
                                    rosterMap.get(Number(addGroup.rosterId)) ||
                                    `Team ${addGroup.rosterId}`;
                                  return (
                                    <div key={player.id} className="text-sm text-muted-foreground">
                                      {player.fullName} ({player.position}) → {teamName}
                                    </div>
                                  );
                                }),
                              );
                            })()
                          : // For non-trades, show traditional format with team context
                            t.players.map(p => (
                              <div key={p.playerId} className="text-sm text-muted-foreground">
                                {p.name} ({p.position}) • {p.role === 'add' ? 'Added' : 'Dropped'}
                              </div>
                            ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => setSelected(t)}
                      >
                        <Badge>{t.grade}</Badge>
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      {(() => {
                        const bg = getDivergingBg(t.score / (scoreRange || 1));
                        const fg = getTextColorForBg(bg);
                        return (
                          <span
                            className="px-2 py-0.5 rounded"
                            style={{ backgroundColor: bg, color: fg }}
                          >
                            {t.score.toFixed(2)}
                          </span>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {view === 'paged' && hasMorePages && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={loading || !leagueId}
            >
              Load more
            </Button>
          </div>
        )}
      </Container>

      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="text-sm space-y-4">
              <div className="flex items-center gap-2">
                <Badge>{selected.grade}</Badge>
                {(() => {
                  const bg = getDivergingBg(selected.score / (scoreRange || 1));
                  const fg = getTextColorForBg(bg);
                  return (
                    <span className="px-1.5 rounded" style={{ backgroundColor: bg, color: fg }}>
                      Score: {selected.score.toFixed(2)}
                    </span>
                  );
                })()}
              </div>
              <div className="text-muted-foreground">
                <div className="flex flex-col gap-1">
                  <div>
                    {new Date(selected.createdAt).toLocaleString()} •{' '}
                    {selected.type.replace('_', ' ')}
                  </div>
                  {(() => {
                    const d = new Date(selected.createdAt);
                    const m = d.getMonth() + 1;
                    let weekLabel = 'Preseason';
                    if (m === 9) weekLabel = 'Week 1-4';
                    else if (m === 10) weekLabel = 'Week 5-8';
                    else if (m === 11) weekLabel = 'Week 9-13';
                    else if (m === 12) weekLabel = 'Week 14-17 (Playoffs)';
                    else if (m === 1) weekLabel = 'Week 18+ (Postseason)';
                    return <div className="text-xs">Transaction timing: {weekLabel}</div>;
                  })()}
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <h3 className="font-semibold text-base">Score Breakdown</h3>
                {(() => {
                  const contribution = selected.players
                    .filter(p => p.role === 'add' && p.forYou)
                    .reduce((s, p) => s + (p.forYou?.weightedPoints || 0), 0);
                  const selfHarm = selected.players
                    .filter(p => p.role === 'drop' && p.afterDrop)
                    .reduce((s, p) => s + (p.afterDrop?.selfHarmWeighted || 0), 0);
                  const oppHarm = selected.players
                    .filter(p => p.role === 'drop' && p.afterDrop)
                    .reduce((s, p) => s + (p.afterDrop?.oppHarmWeighted || 0), 0);
                  const totalPenalties = selfHarm + oppHarm;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-green-600">Contribution</div>
                        <div className="text-lg font-bold">+{contribution.toFixed(1)}</div>
                        <div className="text-muted-foreground">
                          Playoff-weighted VORP when started
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-red-600">Self-Harm</div>
                        <div className="text-lg font-bold">-{selfHarm.toFixed(1)}</div>
                        <div className="text-muted-foreground">
                          Points lost vs your best starter
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-orange-600">Opponent-Harm</div>
                        <div className="text-lg font-bold">-{oppHarm.toFixed(1)}</div>
                        <div className="text-muted-foreground">
                          Points above replacement by any opponent
                        </div>
                      </div>
                      <div className="text-center border-l border-border pl-3">
                        <div className="font-medium">Final Score</div>
                        <div className="text-lg font-bold">{selected.score.toFixed(1)}</div>
                        <div className="text-muted-foreground">
                          {contribution.toFixed(1)} - {totalPenalties.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Player Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-base">Player Details</h3>
                {selected.players.map(p => (
                  <div key={p.playerId} className="border border-border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">
                        {p.name} ({p.position})
                      </div>
                      <Badge variant={p.role === 'add' ? 'default' : 'secondary'}>
                        {p.role === 'add' ? 'Added' : 'Dropped'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          For You (Contribution)
                        </div>
                        <div className="space-y-1 text-muted-foreground">
                          {p.role === 'add' && p.forYou ? (
                            <>
                              <div className="flex justify-between">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help underline decoration-dotted">
                                      Starts
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    No. of starts for you after transaction
                                  </TooltipContent>
                                </Tooltip>
                                <span>{p.forYou.starts}</span>
                              </div>
                              <div className="flex justify-between">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help underline decoration-dotted">
                                      Raw Points
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Total unweighted points when started by you
                                  </TooltipContent>
                                </Tooltip>
                                <span>{p.forYou.points.toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help underline decoration-dotted">
                                      Weighted Points
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Playoff-weighted VORP (points minus position replacement level)
                                  </TooltipContent>
                                </Tooltip>
                                <span className="text-green-600">
                                  +{p.forYou.weightedPoints.toFixed(1)}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-muted-foreground italic">
                              No starts for you
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          After Drop (Penalties)
                        </div>
                        <div className="space-y-1 text-muted-foreground">
                          {p.role === 'drop' && p.afterDrop ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-xs">Raw self-harm</span>
                                <span>{p.afterDrop.selfHarm.toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help underline decoration-dotted text-xs">
                                      Weighted self-harm
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Playoff-weighted points you gave up by dropping a player who
                                    would have displaced your worst starter
                                  </TooltipContent>
                                </Tooltip>
                                <span className="text-red-600">
                                  -{p.afterDrop.selfHarmWeighted.toFixed(1)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs">Raw opp-harm</span>
                                <span>{p.afterDrop.oppHarm.toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help underline decoration-dotted text-xs">
                                      Weighted opp-harm
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Playoff-weighted points above replacement when any opponent
                                    started this player
                                  </TooltipContent>
                                </Tooltip>
                                <span className="text-orange-600">
                                  -{p.afterDrop.oppHarmWeighted.toFixed(1)}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-muted-foreground italic">
                              No harm counted
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Weekly Points Breakdown */}
                    {p.weeklyPoints && p.weeklyPoints.length > 0 && (
                      <div className="mt-3 border-t pt-3">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          Weekly Points After Transaction
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {p.weeklyPoints.map(wp => (
                            <div
                              key={wp.week}
                              className={`p-2 rounded border ${wp.started ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : 'bg-muted/20'}`}
                            >
                              <div className="font-medium">Week {wp.week}</div>
                              <div className="flex justify-between">
                                <span>Points:</span>
                                <span>{wp.points.toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Weight:</span>
                                <span>{wp.weight}x</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{p.role === 'add' ? 'Started:' : 'Opp started:'}:</span>
                                <span>{wp.started ? '✓' : '✗'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Methodology */}
              <div className="bg-muted/20 rounded-lg p-3 text-xs space-y-2">
                <h4 className="font-semibold">Scoring Methodology</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    • <strong>Contribution:</strong> VORP (Value Over Replacement Player) when you
                    started the added player, with playoff weights (1.3x wk15, 1.6x wk16, 2.0x wk17)
                  </li>
                  <li>
                    • <strong>Self-harm:</strong> Points you lost by dropping a player who would
                    have displaced your worst same-position starter
                  </li>
                  <li>
                    • <strong>Opponent-harm:</strong> Points above position-specific replacement
                    level when any opponent started the dropped player (VORP-style)
                  </li>
                  <li>
                    • <strong>Final Score:</strong> Contribution - Self-harm - Opponent-harm
                  </li>
                  <li>
                    • <strong>Grade:</strong> Letter grade based on z-score across all transactions
                    in the current view
                  </li>
                </ul>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default function LeagueTransactionsPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-8">
          <PageHeader title="Loading..." subtitle="Fetching transactions..." />
        </Container>
      }
    >
      <LeagueTransactionsContent />
    </Suspense>
  );
}
