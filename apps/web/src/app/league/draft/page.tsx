'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Container, PageHeader } from '@gauntlet/ui';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { PlayerTransactionsList } from '@/components/transactions';

type ApiResponse = {
  ok: boolean;
  data?: {
    league: { id: string; name: string; season: string };
    draft: {
      id: string;
      status: string;
      type: string;
      season: string;
      settings: any;
      metadata: any;
      slotToRosterId: number[];
    } | null;
    picks: Array<{
      pickNo: number;
      round: number;
      rosterId: number;
      rosterName: string;
      ownerName: string;
      player: { id: string; name: string; position: string | null; team: string | null };
      isKeeper: boolean;
      contribution: {
        starts: number;
        startPoints: number;
        totalLeaguePoints: number;
        positionalRank: number | null;
      };
      transactions: Array<{
        id: string;
        type: string;
        status: string;
        createdAt: string;
        addedTo: Array<{ id: number; name: string }>;
        droppedFrom: Array<{ id: number; name: string }>;
        waiver?: unknown;
      }>;
      grade: string;
      gradeScore: number;
      vorp: number;
      ppg?: number;
      pps?: number;
      breakdown?: {
        baselinePoints: number;
        zStartPoints: number;
        zTotalPoints: number;
        zStarts: number;
        zVorp: number;
        dropPenalty: number;
      };
    }>;
  };
  error?: string;
};

export default function DraftPage() {
  const [resp, setResp] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/league/draft');
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setResp(json);
      } catch {
        if (!cancelled) setResp({ ok: false, error: 'Failed to fetch draft data' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const league = resp?.data?.league;
  const draft = resp?.data?.draft;
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'regular' | 'playoffs'>('regular');
  type PickRow = NonNullable<NonNullable<ApiResponse['data']>['picks']>[number];
  const [selected, setSelected] = useState<PickRow | null>(null);
  const [sortMode, setSortMode] = useState<
    | 'default'
    | 'score_desc'
    | 'score_asc'
    | 'vorp_desc'
    | 'vorp_asc'
    | 'playoffs_desc'
    | 'playoffs_asc'
    | 'ppg_desc' // raw PPG
    | 'ppg_asc'
    | 'pps_desc' // raw PPS
    | 'pps_asc'
    | 'zppg_desc'
    | 'zppg_asc'
    | 'zpps_desc'
    | 'zpps_asc'
  >('default');
  const picks = useMemo(() => {
    const src = resp?.data?.picks ?? [];
    if (positionFilter === 'ALL') return src;
    return src.filter(p => (p.player.position || '') === positionFilter);
  }, [resp?.data?.picks, positionFilter]);

  // Diverging background helpers
  const hexToRgb = (hex: string) => {
    const h = hex.replace('#', '');
    const bigint = parseInt(
      h.length === 3
        ? h
            .split('')
            .map(x => x + x)
            .join('')
        : h,
      16
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
  // True RdYlGn 11-step palette (matplotlib) from red -> yellow -> green
  // Source: RdYlGn11
  const RDYLGN: string[] = [
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
    // Map [-1, 1] to [0, 1]
    const t = Math.max(-1, Math.min(1, normalized));
    const u = (t + 1) / 2;
    // Interpolate across palette stops
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

  // Ranges for Score and VORP coloring
  const scoreRange = useMemo(() => {
    const values = (resp?.data?.picks ?? []).map(p => p.gradeScore);
    const maxAbs = Math.max(1, ...values.map(v => Math.abs(v)));
    return maxAbs;
  }, [resp?.data?.picks]);
  const vorpRange = useMemo(() => {
    const values = (resp?.data?.picks ?? [])
      .map(p => (typeof p.vorp === 'number' ? p.vorp : 0))
      .filter(v => Number.isFinite(v));
    const maxAbs = Math.max(1, ...values.map(v => Math.abs(v)));
    return maxAbs;
  }, [resp?.data?.picks]);

  const rounds = useMemo(() => {
    if (!picks.length) return [] as number[];
    const maxRound = picks.reduce((m, p) => Math.max(m, p.round), 1);
    return Array.from({ length: maxRound }, (_, i) => i + 1);
  }, [picks]);

  // Compute playoffs positional rank client-side for current data
  const playoffPosRankByPlayerId = useMemo(() => {
    const map = new Map<string, number>();
    const byPos: Record<string, Array<{ playerId: string; pts: number }>> = {};
    for (const p of resp?.data?.picks ?? []) {
      const pos = (p.player.position || 'UNK').toUpperCase();
      const pts = Number(((p as any).playoffsContribution?.totalLeaguePoints ?? 0) as number);
      if (!byPos[pos]) byPos[pos] = [];
      byPos[pos].push({ playerId: p.player.id, pts });
    }
    for (const pos of Object.keys(byPos)) {
      byPos[pos].sort((a, b) => b.pts - a.pts);
      byPos[pos].forEach((row, idx) => {
        map.set(row.playerId, idx + 1);
      });
    }
    return map;
  }, [resp?.data?.picks]);

  const teamsByRoster = useMemo(() => {
    const map = new Map<number, { name: string; owner: string }>();
    for (const p of picks) {
      map.set(p.rosterId, { name: p.rosterName, owner: p.ownerName });
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [picks]);

  if (loading) {
    return (
      <Container className='py-8'>
        <PageHeader title='Draft' subtitle='Loading…' />
      </Container>
    );
  }

  return (
    <Container className='py-8'>
      <div className='flex items-start justify-between mb-6'>
        <PageHeader
          title={league ? `${league.name} — Draft` : 'Draft'}
          subtitle={league ? `Season ${league.season}` : ''}
        />
        <div className='flex gap-2'>
          <Link href='/league/overview'>
            <Button variant='outline' size='sm'>
              Back to Overview
            </Button>
          </Link>
        </div>
      </div>

      <TooltipProvider>
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='text-base'>
              {draft ? (
                <div className='flex items-center gap-3'>
                  <span>Draft Type: {draft.type.toUpperCase()}</span>
                  <Badge variant='secondary'>{draft.status}</Badge>
                  {draft.slotToRosterId?.length ? (
                    <Badge variant='outline'>{draft.slotToRosterId.length} Teams</Badge>
                  ) : null}
                </div>
              ) : (
                'No draft data available'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='by-round' className='w-full'>
              <TabsList>
                <TabsTrigger value='by-round'>Pick by Pick</TabsTrigger>
                <TabsTrigger value='by-team'>Team by Team</TabsTrigger>
                <TabsTrigger value='all-picks'>All Picks</TabsTrigger>
              </TabsList>

              <TabsContent value='by-round' className='pt-4'>
                <div className='mb-3 flex items-center gap-4 flex-wrap'>
                  <div className='text-sm text-muted-foreground'>Position:</div>
                  <div className='flex items-center gap-1' aria-label='Position filter'>
                    {['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map(p => (
                      <Button
                        key={p}
                        size='sm'
                        variant={positionFilter === p ? 'default' : 'outline'}
                        onClick={() => setPositionFilter(p)}
                        aria-pressed={positionFilter === p}
                        className='h-7 px-2'
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                  <label className='text-sm text-muted-foreground' htmlFor='view-mode-1'>
                    View:
                  </label>
                  <select
                    id='view-mode-1'
                    className='border border-border rounded px-2 py-1 bg-background text-sm'
                    value={viewMode}
                    onChange={e => setViewMode(e.target.value as 'regular' | 'playoffs')}
                  >
                    <option value='regular'>Regular Season</option>
                    <option value='playoffs'>Playoffs</option>
                  </select>
                  <label className='text-sm text-muted-foreground' htmlFor='sort-mode-1'>
                    Sort:
                  </label>
                  <select
                    id='sort-mode-1'
                    className='border border-border rounded px-2 py-1 bg-background text-sm'
                    value={sortMode}
                    onChange={e => setSortMode(e.target.value as any)}
                  >
                    <option value='default'>Default</option>
                    <option value='score_desc'>Score (best)</option>
                    <option value='score_asc'>Score (worst)</option>
                    <option value='vorp_desc'>VORP (best)</option>
                    <option value='vorp_asc'>VORP (worst)</option>
                    <option value='playoffs_desc'>Playoff Pts (best)</option>
                    <option value='playoffs_asc'>Playoff Pts (worst)</option>
                    <option value='ppg_desc'>PPG (best)</option>
                    <option value='ppg_asc'>PPG (worst)</option>
                    <option value='pps_desc'>PPS (best)</option>
                    <option value='pps_asc'>PPS (worst)</option>
                    <option value='zppg_desc'>zPPG (best)</option>
                    <option value='zppg_asc'>zPPG (worst)</option>
                    <option value='zpps_desc'>zPPS (best)</option>
                    <option value='zpps_asc'>zPPS (worst)</option>
                  </select>
                </div>
                {!picks.length ? (
                  <div className='text-sm text-muted-foreground'>No picks found.</div>
                ) : (
                  <div className='space-y-6'>
                    {rounds.map(round => {
                      let roundPicks = picks.filter(p => p.round === round);
                      if (sortMode === 'score_desc')
                        roundPicks = [...roundPicks].sort((a, b) => b.gradeScore - a.gradeScore);
                      if (sortMode === 'score_asc')
                        roundPicks = [...roundPicks].sort((a, b) => a.gradeScore - b.gradeScore);
                      if (sortMode === 'vorp_desc')
                        roundPicks = [...roundPicks].sort((a, b) => (b.vorp ?? 0) - (a.vorp ?? 0));
                      if (sortMode === 'vorp_asc')
                        roundPicks = [...roundPicks].sort((a, b) => (a.vorp ?? 0) - (b.vorp ?? 0));
                      if (sortMode === 'playoffs_desc')
                        roundPicks = [...roundPicks].sort(
                          (a: any, b: any) =>
                            (b.playoffsContribution?.totalLeaguePoints ?? 0) -
                            (a.playoffsContribution?.totalLeaguePoints ?? 0)
                        );
                      if (sortMode === 'playoffs_asc')
                        roundPicks = [...roundPicks].sort(
                          (a: any, b: any) =>
                            (a.playoffsContribution?.totalLeaguePoints ?? 0) -
                            (b.playoffsContribution?.totalLeaguePoints ?? 0)
                        );
                      if (sortMode === 'ppg_desc')
                        roundPicks = [...roundPicks].sort(
                          (a: any, b: any) => (b.ppg ?? -Infinity) - (a.ppg ?? -Infinity)
                        );
                      if (sortMode === 'ppg_asc')
                        roundPicks = [...roundPicks].sort(
                          (a: any, b: any) => (a.ppg ?? Infinity) - (b.ppg ?? Infinity)
                        );
                      if (sortMode === 'pps_desc')
                        roundPicks = [...roundPicks].sort(
                          (a: any, b: any) => (b.pps ?? -Infinity) - (a.pps ?? -Infinity)
                        );
                      if (sortMode === 'pps_asc')
                        roundPicks = [...roundPicks].sort(
                          (a: any, b: any) => (a.pps ?? Infinity) - (b.pps ?? Infinity)
                        );
                      if (sortMode === 'zppg_desc')
                        roundPicks = [...roundPicks].sort(
                          (a, b) =>
                            ((b as any).breakdown?.zPpg ?? -Infinity) -
                            ((a as any).breakdown?.zPpg ?? -Infinity)
                        );
                      if (sortMode === 'zppg_asc')
                        roundPicks = [...roundPicks].sort(
                          (a, b) =>
                            ((a as any).breakdown?.zPpg ?? Infinity) -
                            ((b as any).breakdown?.zPpg ?? Infinity)
                        );
                      if (sortMode === 'zpps_desc')
                        roundPicks = [...roundPicks].sort(
                          (a, b) =>
                            ((b as any).breakdown?.zPps ?? -Infinity) -
                            ((a as any).breakdown?.zPps ?? -Infinity)
                        );
                      if (sortMode === 'zpps_asc')
                        roundPicks = [...roundPicks].sort(
                          (a, b) =>
                            ((a as any).breakdown?.zPps ?? Infinity) -
                            ((b as any).breakdown?.zPps ?? Infinity)
                        );
                      return (
                        <div key={round} className='space-y-2'>
                          <h3 className='text-lg font-semibold'>Round {round}</h3>
                          <div className='overflow-x-auto rounded-md border border-border bg-card'>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Overall</TableHead>
                                  <TableHead>Pick</TableHead>
                                  <TableHead>Team</TableHead>
                                  <TableHead>Player</TableHead>
                                  <TableHead>Pos</TableHead>
                                  <TableHead>NFL</TableHead>
                                  <TableHead>Owner</TableHead>
                                  <TableHead>Notes</TableHead>
                                  <TableHead className='text-right'>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>Starts</span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Total starts in the selected view (Regular or Playoffs).
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableHead>
                                  <TableHead className='text-right'>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>Start Pts</span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Points scored while starting in the selected view.
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableHead>
                                  <TableHead className='text-right'>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>Total Pts</span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        All fantasy points in the selected view (includes bench).
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableHead>
                                  <TableHead className='text-right'>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>Pos Rank</span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Rank within position by Total Pts in the selected view.
                                        Lower is better.
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableHead>
                                  <TableHead className='text-right'>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>Grade</span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Letter grade based on league-relative performance (VORP,
                                        PPG, PPS, Playoffs).
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableHead>
                                  <TableHead className='text-right'>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>Score</span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Standardized relative score (z-score). Higher is better.
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableHead>
                                  <TableHead className='text-right'>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>VORP</span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Value Over Replacement Player using regular-season baseline
                                        for this league.
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {roundPicks.map((p, idx) => {
                                  const teamsCount = draft?.slotToRosterId?.length || 0;
                                  const pickInRound =
                                    teamsCount > 0 ? ((p.pickNo - 1) % teamsCount) + 1 : idx + 1;
                                  return (
                                    <TableRow
                                      key={`${round}-${p.pickNo}-${p.player.id}`}
                                      className='hover:bg-muted/50'
                                    >
                                      <TableCell>{p.pickNo}</TableCell>
                                      <TableCell>
                                        {round}.{pickInRound}
                                      </TableCell>
                                      <TableCell className='font-medium'>{p.rosterName}</TableCell>
                                      <TableCell>{p.player.name}</TableCell>
                                      <TableCell>{p.player.position || '-'}</TableCell>
                                      <TableCell>{p.player.team || '-'}</TableCell>
                                      <TableCell>{p.ownerName}</TableCell>
                                      <TableCell>
                                        <div className='flex items-center gap-2'>
                                          {p.isKeeper ? (
                                            <Badge variant='outline'>Keeper</Badge>
                                          ) : null}
                                          {p.transactions.length > 0 ? (
                                            <Dialog>
                                              <DialogTrigger asChild>
                                                <Button
                                                  variant='ghost'
                                                  size='sm'
                                                  className='h-6 px-2 text-xs'
                                                >
                                                  Txns ({p.transactions.length})
                                                </Button>
                                              </DialogTrigger>
                                              <DialogContent className='max-w-2xl'>
                                                <DialogHeader>
                                                  <DialogTitle>
                                                    Transactions for {p.player.name}
                                                  </DialogTitle>
                                                </DialogHeader>
                                                <div className='space-y-2 text-sm'>
                                                  {p.transactions.map(t => (
                                                    <div
                                                      key={t.id}
                                                      className='flex items-start justify-between gap-4 border-b border-border pb-2'
                                                    >
                                                      <div>
                                                        <div className='font-medium'>
                                                          {t.type.replace('_', ' ')}
                                                        </div>
                                                        <div className='text-muted-foreground'>
                                                          {new Date(t.createdAt).toLocaleString()}
                                                        </div>
                                                      </div>
                                                      <div className='text-right'>
                                                        {t.addedTo.length ? (
                                                          <div>
                                                            <span className='text-muted-foreground'>
                                                              Added to:{' '}
                                                            </span>
                                                            {t.addedTo.map(x => x.name).join(', ')}
                                                          </div>
                                                        ) : null}
                                                        {t.droppedFrom.length ? (
                                                          <div>
                                                            <span className='text-muted-foreground'>
                                                              Dropped from:{' '}
                                                            </span>
                                                            {t.droppedFrom
                                                              .map(x => x.name)
                                                              .join(', ')}
                                                          </div>
                                                        ) : null}
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </DialogContent>
                                            </Dialog>
                                          ) : null}
                                        </div>
                                      </TableCell>
                                      {(() => {
                                        const fallback = {
                                          starts: 0,
                                          startPoints: 0,
                                          totalLeaguePoints: 0,
                                        };
                                        const sRaw =
                                          viewMode === 'playoffs'
                                            ? (p as any).playoffsContribution
                                            : p.contribution;
                                        const s = sRaw ?? fallback;
                                        return (
                                          <>
                                            <TableCell className='text-right'>
                                              {Number(s.starts || 0)}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                              {Number(s.startPoints || 0).toFixed(1)}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                              {Number(s.totalLeaguePoints || 0).toFixed(1)}
                                            </TableCell>
                                          </>
                                        );
                                      })()}
                                      {(() => {
                                        const regularRank = p.contribution.positionalRank ?? null;
                                        const playoffRank =
                                          playoffPosRankByPlayerId.get(p.player.id) ?? null;
                                        const rank =
                                          viewMode === 'playoffs' ? playoffRank : regularRank;
                                        const pos = (p.player.position || 'UNK').toUpperCase();
                                        const maxRank = (resp?.data?.picks ?? []).filter(
                                          x => (x.player.position || 'UNK').toUpperCase() === pos
                                        ).length;
                                        if (!rank || !maxRank) {
                                          return <TableCell className='text-right'>-</TableCell>;
                                        }
                                        const goodness = 1 - (rank - 1) / Math.max(1, maxRank - 1);
                                        const bg = getDivergingBg(goodness * 2 - 1);
                                        const fg = getTextColorForBg(bg);
                                        return (
                                          <TableCell className='text-right'>
                                            <span
                                              className='px-2 py-0.5 rounded'
                                              style={{ backgroundColor: bg, color: fg }}
                                            >
                                              #{rank}
                                            </span>
                                          </TableCell>
                                        );
                                      })()}
                                      <TableCell className='text-right'>
                                        <Button
                                          variant='ghost'
                                          size='sm'
                                          className='h-6 px-2'
                                          onClick={() => setSelected(p)}
                                        >
                                          <Badge>{p.grade}</Badge>
                                        </Button>
                                      </TableCell>
                                      {(() => {
                                        const norm = p.gradeScore / (scoreRange || 1);
                                        const bg = getDivergingBg(norm);
                                        const fg = getTextColorForBg(bg);
                                        return (
                                          <TableCell className='text-right'>
                                            <span
                                              className='px-2 py-0.5 rounded'
                                              style={{ backgroundColor: bg, color: fg }}
                                            >
                                              {p.gradeScore.toFixed(2)}
                                            </span>
                                          </TableCell>
                                        );
                                      })()}
                                      {(() => {
                                        const v = typeof p.vorp === 'number' ? p.vorp : 0;
                                        const norm = v / (vorpRange || 1);
                                        const bg = getDivergingBg(norm);
                                        const fg = getTextColorForBg(bg);
                                        return (
                                          <TableCell className='text-right'>
                                            <span
                                              className='px-2 py-0.5 rounded'
                                              style={{ backgroundColor: bg, color: fg }}
                                            >
                                              {typeof p.vorp === 'number' ? p.vorp.toFixed(1) : '—'}
                                            </span>
                                          </TableCell>
                                        );
                                      })()}
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value='all-picks' className='pt-4'>
                <div className='mb-3 flex items-center gap-4 flex-wrap'>
                  <div className='text-sm text-muted-foreground'>Position:</div>
                  <div className='flex items-center gap-1' aria-label='Position filter'>
                    {['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map(p => (
                      <Button
                        key={p}
                        size='sm'
                        variant={positionFilter === p ? 'default' : 'outline'}
                        onClick={() => setPositionFilter(p)}
                        aria-pressed={positionFilter === p}
                        className='h-7 px-2'
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                  <label className='text-sm text-muted-foreground' htmlFor='view-mode-3'>
                    View:
                  </label>
                  <select
                    id='view-mode-3'
                    className='border border-border rounded px-2 py-1 bg-background text-sm'
                    value={viewMode}
                    onChange={e => setViewMode(e.target.value as 'regular' | 'playoffs')}
                  >
                    <option value='regular'>Regular Season</option>
                    <option value='playoffs'>Playoffs</option>
                  </select>
                  <label className='text-sm text-muted-foreground' htmlFor='sort-mode-3'>
                    Sort:
                  </label>
                  <select
                    id='sort-mode-3'
                    className='border border-border rounded px-2 py-1 bg-background text-sm'
                    value={sortMode}
                    onChange={e => setSortMode(e.target.value as any)}
                  >
                    <option value='default'>Default</option>
                    <option value='score_desc'>Score (best)</option>
                    <option value='score_asc'>Score (worst)</option>
                    <option value='vorp_desc'>VORP (best)</option>
                    <option value='vorp_asc'>VORP (worst)</option>
                    <option value='playoffs_desc'>Playoff Pts (best)</option>
                    <option value='playoffs_asc'>Playoff Pts (worst)</option>
                    <option value='ppg_desc'>PPG (best)</option>
                    <option value='ppg_asc'>PPG (worst)</option>
                    <option value='pps_desc'>PPS (best)</option>
                    <option value='pps_asc'>PPS (worst)</option>
                  </select>
                </div>
                {!picks.length ? (
                  <div className='text-sm text-muted-foreground'>No picks found.</div>
                ) : (
                  <div className='overflow-x-auto rounded-md border border-border bg-card'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Overall</TableHead>
                          <TableHead>Round.Pick</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead>Player</TableHead>
                          <TableHead>Pos</TableHead>
                          <TableHead>NFL</TableHead>
                          <TableHead className='text-right'>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>Starts</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                Total starts in the selected view (Regular or Playoffs).
                              </TooltipContent>
                            </Tooltip>
                          </TableHead>
                          <TableHead className='text-right'>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>Start Pts</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                Points scored while starting in the selected view.
                              </TooltipContent>
                            </Tooltip>
                          </TableHead>
                          <TableHead className='text-right'>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>Total Pts</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                All fantasy points in the selected view (includes bench).
                              </TooltipContent>
                            </Tooltip>
                          </TableHead>
                          <TableHead className='text-right'>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>Pos Rank</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                Rank within position by Total Pts in the selected view. Lower is
                                better.
                              </TooltipContent>
                            </Tooltip>
                          </TableHead>
                          <TableHead className='text-right'>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>Grade</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                Letter grade based on league-relative performance (VORP, PPG, PPS,
                                Playoffs).
                              </TooltipContent>
                            </Tooltip>
                          </TableHead>
                          <TableHead className='text-right'>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>Score</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                Standardized relative score (z-score). Higher is better.
                              </TooltipContent>
                            </Tooltip>
                          </TableHead>
                          <TableHead className='text-right'>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>VORP</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                Value Over Replacement Player using regular-season baseline for this
                                league.
                              </TooltipContent>
                            </Tooltip>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const rows = [...picks];
                          if (sortMode === 'score_desc')
                            rows.sort((a, b) => b.gradeScore - a.gradeScore);
                          if (sortMode === 'score_asc')
                            rows.sort((a, b) => a.gradeScore - b.gradeScore);
                          if (sortMode === 'vorp_desc')
                            rows.sort((a, b) => (b.vorp ?? 0) - (a.vorp ?? 0));
                          if (sortMode === 'vorp_asc')
                            rows.sort((a, b) => (a.vorp ?? 0) - (b.vorp ?? 0));
                          if (sortMode === 'playoffs_desc')
                            rows.sort(
                              (a: any, b: any) =>
                                (b.playoffsContribution?.totalLeaguePoints ?? 0) -
                                (a.playoffsContribution?.totalLeaguePoints ?? 0)
                            );
                          if (sortMode === 'playoffs_asc')
                            rows.sort(
                              (a: any, b: any) =>
                                (a.playoffsContribution?.totalLeaguePoints ?? 0) -
                                (b.playoffsContribution?.totalLeaguePoints ?? 0)
                            );
                          if (sortMode === 'ppg_desc')
                            rows.sort(
                              (a: any, b: any) => (b.ppg ?? -Infinity) - (a.ppg ?? -Infinity)
                            );
                          if (sortMode === 'ppg_asc')
                            rows.sort(
                              (a: any, b: any) => (a.ppg ?? Infinity) - (b.ppg ?? Infinity)
                            );
                          if (sortMode === 'pps_desc')
                            rows.sort(
                              (a: any, b: any) => (b.pps ?? -Infinity) - (a.pps ?? -Infinity)
                            );
                          if (sortMode === 'pps_asc')
                            rows.sort(
                              (a: any, b: any) => (a.pps ?? Infinity) - (b.pps ?? Infinity)
                            );
                          if (sortMode === 'zppg_desc')
                            rows.sort(
                              (a, b) =>
                                ((b as any).breakdown?.zPpg ?? -Infinity) -
                                ((a as any).breakdown?.zPpg ?? -Infinity)
                            );
                          if (sortMode === 'zppg_asc')
                            rows.sort(
                              (a, b) =>
                                ((a as any).breakdown?.zPpg ?? Infinity) -
                                ((b as any).breakdown?.zPpg ?? Infinity)
                            );
                          if (sortMode === 'zpps_desc')
                            rows.sort(
                              (a, b) =>
                                ((b as any).breakdown?.zPps ?? -Infinity) -
                                ((a as any).breakdown?.zPps ?? -Infinity)
                            );
                          if (sortMode === 'zpps_asc')
                            rows.sort(
                              (a, b) =>
                                ((a as any).breakdown?.zPps ?? Infinity) -
                                ((b as any).breakdown?.zPps ?? Infinity)
                            );
                          return rows.map(p => {
                            const teamsCount = draft?.slotToRosterId?.length || 0;
                            const pickInRound =
                              teamsCount > 0 ? ((p.pickNo - 1) % teamsCount) + 1 : p.pickNo;
                            const fallback = { starts: 0, startPoints: 0, totalLeaguePoints: 0 };
                            const sRaw =
                              viewMode === 'playoffs'
                                ? (p as any).playoffsContribution
                                : p.contribution;
                            const s = (sRaw ?? fallback) as {
                              starts: number;
                              startPoints: number;
                              totalLeaguePoints: number;
                            };
                            const pos = (p.player.position || 'UNK').toUpperCase();
                            const maxRank = (resp?.data?.picks ?? []).filter(
                              x => (x.player.position || 'UNK').toUpperCase() === pos
                            ).length;
                            const regularRank = p.contribution.positionalRank ?? null;
                            const playoffRank = playoffPosRankByPlayerId.get(p.player.id) ?? null;
                            const rank = viewMode === 'playoffs' ? playoffRank : regularRank;
                            const rankCell = (() => {
                              if (!rank || !maxRank) return '-';
                              const goodness = 1 - (rank - 1) / Math.max(1, maxRank - 1);
                              const bg = getDivergingBg(goodness * 2 - 1);
                              const fg = getTextColorForBg(bg);
                              return (
                                <span
                                  className='px-2 py-0.5 rounded'
                                  style={{ backgroundColor: bg, color: fg }}
                                >
                                  #{rank}
                                </span>
                              );
                            })();
                            const scoreCell = (() => {
                              const bg = getDivergingBg(p.gradeScore / (scoreRange || 1));
                              const fg = getTextColorForBg(bg);
                              return (
                                <span
                                  className='px-2 py-0.5 rounded'
                                  style={{ backgroundColor: bg, color: fg }}
                                >
                                  {p.gradeScore.toFixed(2)}
                                </span>
                              );
                            })();
                            const vorpCell = (() => {
                              const v = typeof p.vorp === 'number' ? p.vorp : 0;
                              const bg = getDivergingBg(v / (vorpRange || 1));
                              const fg = getTextColorForBg(bg);
                              return (
                                <span
                                  className='px-2 py-0.5 rounded'
                                  style={{ backgroundColor: bg, color: fg }}
                                >
                                  {typeof p.vorp === 'number' ? p.vorp.toFixed(1) : '—'}
                                </span>
                              );
                            })();
                            return (
                              <TableRow
                                key={`all-${p.pickNo}-${p.player.id}`}
                                className='hover:bg-muted/50'
                              >
                                <TableCell>{p.pickNo}</TableCell>
                                <TableCell>
                                  {p.round}.{pickInRound}
                                </TableCell>
                                <TableCell className='font-medium'>{p.rosterName}</TableCell>
                                <TableCell>{p.player.name}</TableCell>
                                <TableCell>{p.player.position || '-'}</TableCell>
                                <TableCell>{p.player.team || '-'}</TableCell>
                                <TableCell className='text-right'>
                                  {Number(s.starts || 0)}
                                </TableCell>
                                <TableCell className='text-right'>
                                  {Number(s.startPoints || 0).toFixed(1)}
                                </TableCell>
                                <TableCell className='text-right'>
                                  {Number(s.totalLeaguePoints || 0).toFixed(1)}
                                </TableCell>
                                <TableCell className='text-right'>{rankCell}</TableCell>
                                <TableCell className='text-right'>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-6 px-2'
                                    onClick={() => setSelected(p)}
                                  >
                                    <Badge>{p.grade}</Badge>
                                  </Button>
                                </TableCell>
                                <TableCell className='text-right'>{scoreCell}</TableCell>
                                <TableCell className='text-right'>{vorpCell}</TableCell>
                              </TableRow>
                            );
                          });
                        })()}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value='by-team' className='pt-4'>
                <div className='mb-3 flex items-center gap-4 flex-wrap'>
                  <div className='text-sm text-muted-foreground'>Position:</div>
                  <div className='flex items-center gap-1' aria-label='Position filter'>
                    {['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map(p => (
                      <Button
                        key={p}
                        size='sm'
                        variant={positionFilter === p ? 'default' : 'outline'}
                        onClick={() => setPositionFilter(p)}
                        aria-pressed={positionFilter === p}
                        className='h-7 px-2'
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                  <label className='text-sm text-muted-foreground' htmlFor='view-mode-2'>
                    View:
                  </label>
                  <select
                    id='view-mode-2'
                    className='border border-border rounded px-2 py-1 bg-background text-sm'
                    value={viewMode}
                    onChange={e => setViewMode(e.target.value as 'regular' | 'playoffs')}
                  >
                    <option value='regular'>Regular Season</option>
                    <option value='playoffs'>Playoffs</option>
                  </select>
                  <label className='text-sm text-muted-foreground' htmlFor='sort-mode-2'>
                    Sort:
                  </label>
                  <select
                    id='sort-mode-2'
                    className='border border-border rounded px-2 py-1 bg-background text-sm'
                    value={sortMode}
                    onChange={e => setSortMode(e.target.value as any)}
                  >
                    <option value='default'>Default</option>
                    <option value='score_desc'>Score (best)</option>
                    <option value='score_asc'>Score (worst)</option>
                    <option value='vorp_desc'>VORP (best)</option>
                    <option value='vorp_asc'>VORP (worst)</option>
                    <option value='playoffs_desc'>Playoff Pts (best)</option>
                    <option value='playoffs_asc'>Playoff Pts (worst)</option>
                    <option value='ppg_desc'>PPG (best)</option>
                    <option value='ppg_asc'>PPG (worst)</option>
                    <option value='pps_desc'>PPS (best)</option>
                    <option value='pps_asc'>PPS (worst)</option>
                  </select>
                </div>
                {!picks.length ? (
                  <div className='text-sm text-muted-foreground'>No picks found.</div>
                ) : (
                  <div className='grid grid-cols-1 gap-4'>
                    {teamsByRoster.map(([rosterId, team]) => {
                      let teamPicks = picks.filter(p => p.rosterId === rosterId);
                      if (sortMode === 'score_desc')
                        teamPicks = [...teamPicks].sort((a, b) => b.gradeScore - a.gradeScore);
                      if (sortMode === 'score_asc')
                        teamPicks = [...teamPicks].sort((a, b) => a.gradeScore - b.gradeScore);
                      if (sortMode === 'vorp_desc')
                        teamPicks = [...teamPicks].sort((a, b) => (b.vorp ?? 0) - (a.vorp ?? 0));
                      if (sortMode === 'vorp_asc')
                        teamPicks = [...teamPicks].sort((a, b) => (a.vorp ?? 0) - (b.vorp ?? 0));
                      if (sortMode === 'playoffs_desc')
                        teamPicks = [...teamPicks].sort(
                          (a: any, b: any) =>
                            (b.playoffsContribution?.totalLeaguePoints ?? 0) -
                            (a.playoffsContribution?.totalLeaguePoints ?? 0)
                        );
                      if (sortMode === 'playoffs_asc')
                        teamPicks = [...teamPicks].sort(
                          (a: any, b: any) =>
                            (a.playoffsContribution?.totalLeaguePoints ?? 0) -
                            (b.playoffsContribution?.totalLeaguePoints ?? 0)
                        );
                      if (sortMode === 'ppg_desc')
                        teamPicks = [...teamPicks].sort(
                          (a: any, b: any) => (b.ppg ?? -Infinity) - (a.ppg ?? -Infinity)
                        );
                      if (sortMode === 'ppg_asc')
                        teamPicks = [...teamPicks].sort(
                          (a: any, b: any) => (a.ppg ?? Infinity) - (b.ppg ?? Infinity)
                        );
                      if (sortMode === 'pps_desc')
                        teamPicks = [...teamPicks].sort(
                          (a: any, b: any) => (b.pps ?? -Infinity) - (a.pps ?? -Infinity)
                        );
                      if (sortMode === 'pps_asc')
                        teamPicks = [...teamPicks].sort(
                          (a: any, b: any) => (a.pps ?? Infinity) - (b.pps ?? Infinity)
                        );
                      if (sortMode === 'zppg_desc')
                        teamPicks = [...teamPicks].sort(
                          (a, b) =>
                            ((b as any).breakdown?.zPpg ?? -Infinity) -
                            ((a as any).breakdown?.zPpg ?? -Infinity)
                        );
                      if (sortMode === 'zppg_asc')
                        teamPicks = [...teamPicks].sort(
                          (a, b) =>
                            ((a as any).breakdown?.zPpg ?? Infinity) -
                            ((b as any).breakdown?.zPpg ?? Infinity)
                        );
                      if (sortMode === 'zpps_desc')
                        teamPicks = [...teamPicks].sort(
                          (a, b) =>
                            ((b as any).breakdown?.zPps ?? -Infinity) -
                            ((a as any).breakdown?.zPps ?? -Infinity)
                        );
                      if (sortMode === 'zpps_asc')
                        teamPicks = [...teamPicks].sort(
                          (a, b) =>
                            ((a as any).breakdown?.zPps ?? Infinity) -
                            ((b as any).breakdown?.zPps ?? Infinity)
                        );
                      const teamsCount = draft?.slotToRosterId?.length || 0;
                      return (
                        <Card key={rosterId}>
                          <CardHeader>
                            <CardTitle className='text-base'>
                              <div className='flex items-center justify-between'>
                                <span className='font-medium'>{team.name}</span>
                                <Badge variant='secondary'>{team.owner}</Badge>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className='overflow-x-auto rounded-md border border-border bg-card'>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Round.Pick</TableHead>
                                    <TableHead>Overall</TableHead>
                                    <TableHead>Player</TableHead>
                                    <TableHead>Pos</TableHead>
                                    <TableHead>NFL</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead className='text-right'>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span>Starts</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Total starts in the selected view (Regular or Playoffs).
                                        </TooltipContent>
                                      </Tooltip>
                                    </TableHead>
                                    <TableHead className='text-right'>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span>Start Pts</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Points scored while starting in the selected view.
                                        </TooltipContent>
                                      </Tooltip>
                                    </TableHead>
                                    <TableHead className='text-right'>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span>Total Pts</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          All fantasy points in the selected view (includes bench).
                                        </TooltipContent>
                                      </Tooltip>
                                    </TableHead>
                                    <TableHead className='text-right'>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span>Pos Rank</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Rank within position by Total Pts in the selected view.
                                          Lower is better.
                                        </TooltipContent>
                                      </Tooltip>
                                    </TableHead>
                                    <TableHead className='text-right'>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span>Grade</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Letter grade based on league-relative performance (VORP,
                                          PPG, PPS, Playoffs).
                                        </TooltipContent>
                                      </Tooltip>
                                    </TableHead>
                                    <TableHead className='text-right'>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span>Score</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Standardized relative score (z-score). Higher is better.
                                        </TooltipContent>
                                      </Tooltip>
                                    </TableHead>
                                    <TableHead className='text-right'>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span>VORP</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Value Over Replacement Player using regular-season
                                          baseline for this league.
                                        </TooltipContent>
                                      </Tooltip>
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {teamPicks.map(p => {
                                    const pickInRound =
                                      teamsCount > 0 ? ((p.pickNo - 1) % teamsCount) + 1 : p.pickNo;
                                    return (
                                      <TableRow
                                        key={`${p.rosterId}-${p.pickNo}`}
                                        className='hover:bg-muted/50'
                                      >
                                        <TableCell>
                                          {p.round}.{pickInRound}
                                        </TableCell>
                                        <TableCell>{p.pickNo}</TableCell>
                                        <TableCell>{p.player.name}</TableCell>
                                        <TableCell>{p.player.position || '-'}</TableCell>
                                        <TableCell>{p.player.team || '-'}</TableCell>
                                        <TableCell>
                                          <div className='flex items-center gap-2'>
                                            {p.isKeeper ? (
                                              <Badge variant='outline'>Keeper</Badge>
                                            ) : null}
                                            {p.transactions.length > 0 ? (
                                              <Dialog>
                                                <DialogTrigger asChild>
                                                  <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    className='h-6 px-2 text-xs'
                                                  >
                                                    Txns ({p.transactions.length})
                                                  </Button>
                                                </DialogTrigger>
                                                <DialogContent className='max-w-2xl'>
                                                  <DialogHeader>
                                                    <DialogTitle>
                                                      Transactions for {p.player.name}
                                                    </DialogTitle>
                                                  </DialogHeader>
                                                  <div className='space-y-2 text-sm'>
                                                    {p.transactions.map(t => (
                                                      <div
                                                        key={t.id}
                                                        className='flex items-start justify-between gap-4 border-b border-border pb-2'
                                                      >
                                                        <div>
                                                          <div className='font-medium'>
                                                            {t.type}
                                                          </div>
                                                          <div className='text-muted-foreground'>
                                                            {new Date(t.createdAt).toLocaleString()}
                                                          </div>
                                                        </div>
                                                        <div className='text-right'>
                                                          {t.addedTo.length ? (
                                                            <div>
                                                              <span className='text-muted-foreground'>
                                                                Added to:{' '}
                                                              </span>
                                                              {t.addedTo.join(', ')}
                                                            </div>
                                                          ) : null}
                                                          {t.droppedFrom.length ? (
                                                            <div>
                                                              <span className='text-muted-foreground'>
                                                                Dropped from:{' '}
                                                              </span>
                                                              {t.droppedFrom.join(', ')}
                                                            </div>
                                                          ) : null}
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </DialogContent>
                                              </Dialog>
                                            ) : null}
                                          </div>
                                        </TableCell>
                                        {(() => {
                                          const fallback = {
                                            starts: 0,
                                            startPoints: 0,
                                            totalLeaguePoints: 0,
                                          };
                                          const sRaw =
                                            viewMode === 'playoffs'
                                              ? (p as any).playoffsContribution
                                              : p.contribution;
                                          const s = sRaw ?? fallback;
                                          return (
                                            <>
                                              <TableCell className='text-right'>
                                                {Number(s.starts || 0)}
                                              </TableCell>
                                              <TableCell className='text-right'>
                                                {Number(s.startPoints || 0).toFixed(1)}
                                              </TableCell>
                                              <TableCell className='text-right'>
                                                {Number(s.totalLeaguePoints || 0).toFixed(1)}
                                              </TableCell>
                                            </>
                                          );
                                        })()}
                                        {(() => {
                                          const regularRank = p.contribution.positionalRank ?? null;
                                          const playoffRank =
                                            playoffPosRankByPlayerId.get(p.player.id) ?? null;
                                          const rank =
                                            viewMode === 'playoffs' ? playoffRank : regularRank;
                                          const pos = (p.player.position || 'UNK').toUpperCase();
                                          const maxRank = (resp?.data?.picks ?? []).filter(
                                            x => (x.player.position || 'UNK').toUpperCase() === pos
                                          ).length;
                                          if (!rank || !maxRank) {
                                            return <TableCell className='text-right'>-</TableCell>;
                                          }
                                          const goodness =
                                            1 - (rank - 1) / Math.max(1, maxRank - 1);
                                          const bg = getDivergingBg(goodness * 2 - 1);
                                          const fg = getTextColorForBg(bg);
                                          return (
                                            <TableCell className='text-right'>
                                              <span
                                                className='px-2 py-0.5 rounded'
                                                style={{ backgroundColor: bg, color: fg }}
                                              >
                                                #{rank}
                                              </span>
                                            </TableCell>
                                          );
                                        })()}
                                        <TableCell className='text-right'>
                                          <Button
                                            variant='ghost'
                                            size='sm'
                                            className='h-6 px-2'
                                            onClick={() => setSelected(p)}
                                          >
                                            <Badge>{p.grade}</Badge>
                                          </Button>
                                        </TableCell>
                                        {(() => {
                                          const norm = p.gradeScore / (scoreRange || 1);
                                          const bg = getDivergingBg(norm);
                                          const fg = getTextColorForBg(bg);
                                          return (
                                            <TableCell className='text-right'>
                                              <span
                                                className='px-2 py-0.5 rounded'
                                                style={{ backgroundColor: bg, color: fg }}
                                              >
                                                {p.gradeScore.toFixed(2)}
                                              </span>
                                            </TableCell>
                                          );
                                        })()}
                                        {(() => {
                                          const v = typeof p.vorp === 'number' ? p.vorp : 0;
                                          const norm = v / (vorpRange || 1);
                                          const bg = getDivergingBg(norm);
                                          const fg = getTextColorForBg(bg);
                                          return (
                                            <TableCell className='text-right'>
                                              <span
                                                className='px-2 py-0.5 rounded'
                                                style={{ backgroundColor: bg, color: fg }}
                                              >
                                                {typeof p.vorp === 'number'
                                                  ? p.vorp.toFixed(1)
                                                  : '—'}
                                              </span>
                                            </TableCell>
                                          );
                                        })()}
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </TooltipProvider>

      {/* Pick Details Modal */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className='max-w-xl'>
          <DialogHeader>
            <DialogTitle>
              {selected
                ? `Pick ${selected.round}.${Math.max(1, ((selected.pickNo - 1) % (draft?.slotToRosterId?.length || 12)) + 1)} — ${selected.player.name}`
                : 'Pick Details'}
            </DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className='text-sm space-y-2'>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{selected.rosterName}</span>
                <Badge>{selected.grade}</Badge>
                {(() => {
                  const norm = selected.gradeScore / (scoreRange || 1);
                  const bg = getDivergingBg(norm);
                  const fg = getTextColorForBg(bg);
                  return (
                    <span className='px-1.5 rounded' style={{ backgroundColor: bg, color: fg }}>
                      z={selected.gradeScore.toFixed(2)}
                    </span>
                  );
                })()}
              </div>
              <div>
                VORP:{' '}
                {(() => {
                  const v = selected.vorp;
                  const norm = v / (vorpRange || 1);
                  const bg = getDivergingBg(norm);
                  const fg = getTextColorForBg(bg);
                  return (
                    <span className='px-1.5 rounded' style={{ backgroundColor: bg, color: fg }}>
                      {v.toFixed(2)}
                    </span>
                  );
                })()}
                {selected.breakdown?.baselinePoints != null && (
                  <span className='text-muted-foreground'>
                    {' '}
                    (baseline {selected.breakdown.baselinePoints.toFixed(1)})
                  </span>
                )}
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div>z(VORP): {selected.breakdown?.zVorp?.toFixed(2) ?? '—'}</div>
                <div>z(StartPts): {selected.breakdown?.zStartPoints?.toFixed(2) ?? '—'}</div>
                <div>z(Starts): {selected.breakdown?.zStarts?.toFixed(2) ?? '—'}</div>
                <div>z(PPG): {(selected.breakdown as any)?.zPpg?.toFixed?.(2) ?? '—'}</div>
                <div>z(PPS): {(selected.breakdown as any)?.zPps?.toFixed?.(2) ?? '—'}</div>
                <div>
                  z(Playoffs): {(selected.breakdown as any)?.zPlayoffs?.toFixed?.(2) ?? '—'}
                </div>
                <div>Penalty: {selected.breakdown?.dropPenalty?.toFixed(2) ?? '—'}</div>
              </div>
              <div className='mt-2'>
                Regular season: {selected.contribution.starts} starts •{' '}
                {selected.contribution.startPoints.toFixed(1)} start pts •{' '}
                {selected.contribution.totalLeaguePoints.toFixed(1)} total pts
              </div>
              {(selected as any).playoffsContribution ? (
                <div>
                  Playoffs: {(selected as any).playoffsContribution.starts} starts •{' '}
                  {Number((selected as any).playoffsContribution.startPoints).toFixed(1)} start pts
                  • {Number((selected as any).playoffsContribution.totalLeaguePoints).toFixed(1)}{' '}
                  total pts
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
