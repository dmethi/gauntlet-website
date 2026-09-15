'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeaderHero, WarRoomLoader } from '@gauntlet/ui';
import { GauntletLogo } from '@/components/gauntlet-logo';
import {
  DataList,
  DataListDescription,
  DataListHeader,
  DataListItem,
  DataListMetric,
  DataListMetricLabel,
  DataListMetrics,
  DataListMetricValue,
  DataListTitle,
} from '@/components/ui/data-list';
import { ChevronDown } from 'lucide-react';

type ApiResponse = {
  ok: boolean;
  data?: {
    league: { id: string; name: string; season: string };
    draft: {
      id: string;
      status: string;
      type: string;
      slotToRosterId: number[];
    } | null;
    picks: Array<{
      pickNo: number;
      round: number;
      rosterId: number;
      rosterName: string;
      ownerName: string;
      isKeeper: boolean;
      player: { id: string; name: string; position: string | null; team: string | null };
    }>;
  };
  error?: string;
};

const POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

const DRAFT_VIEWS = [
  { key: 'by-round', label: 'Pick by Pick' },
  { key: 'by-team', label: 'Team by Team' },
  { key: 'all-picks', label: 'All Picks' },
] as const;
type DraftView = (typeof DRAFT_VIEWS)[number]['key'];
type DraftPick = NonNullable<ApiResponse['data']>['picks'][number];

const DraftViewPills = ({
  value,
  onChange,
}: {
  value: DraftView;
  onChange: (view: DraftView) => void;
}) => (
  <div
    className="flex items-center gap-1 overflow-x-auto pb-2"
    role="tablist"
    aria-label="Draft view"
  >
    {DRAFT_VIEWS.map(v => (
      <button
        key={v.key}
        role="tab"
        aria-selected={value === v.key}
        onClick={() => onChange(v.key)}
        className={`min-h-11 shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          value === v.key
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        }`}
      >
        {v.label}
      </button>
    ))}
  </div>
);

const PositionFilterButtons = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (position: string) => void;
}) => (
  <div
    className="flex max-w-full items-center gap-1 overflow-x-auto pb-2"
    aria-label="Position filter"
  >
    {POSITIONS.map(p => (
      <Button
        key={p}
        size="sm"
        variant={value === p ? 'default' : 'outline'}
        onClick={() => onChange(p)}
        aria-pressed={value === p}
        className="h-11 min-w-11 px-3"
      >
        {p}
      </Button>
    ))}
  </div>
);

const DraftPicksLedger = ({
  picks,
  pickInRound,
  scrollLabel,
  showTeam = true,
  showOwner = true,
}: {
  picks: DraftPick[];
  pickInRound: (pickNo: number) => number;
  scrollLabel: string;
  showTeam?: boolean;
  showOwner?: boolean;
}) => (
  <>
    <DataList className="sm:hidden">
      {picks.map(pick => (
        <DataListItem key={`mobile-${pick.rosterId}-${pick.pickNo}-${pick.player.id}`}>
          <DataListHeader>
            <div className="min-w-0">
              <DataListTitle className="truncate">{pick.player.name}</DataListTitle>
              <DataListDescription>
                {pick.player.position || '—'} · {pick.player.team || 'No NFL team'}
                {showTeam ? ` · ${pick.rosterName}` : ''}
              </DataListDescription>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-base font-semibold">
                {pick.round}.{pickInRound(pick.pickNo)}
              </div>
              <div className="text-xs text-muted-foreground">round.pick</div>
            </div>
          </DataListHeader>
          <details className="group mt-2">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <span>Pick details</span>
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <DataListMetrics className="mt-1 grid-cols-2">
              <DataListMetric>
                <DataListMetricLabel className="text-xs">Overall</DataListMetricLabel>
                <DataListMetricValue>#{pick.pickNo}</DataListMetricValue>
              </DataListMetric>
              {showOwner && (
                <DataListMetric className="text-right">
                  <DataListMetricLabel className="text-xs">Owner</DataListMetricLabel>
                  <DataListMetricValue>{pick.ownerName}</DataListMetricValue>
                </DataListMetric>
              )}
              <DataListMetric className="col-span-2">
                <DataListMetricLabel className="text-xs">Notes</DataListMetricLabel>
                <DataListMetricValue>
                  {pick.isKeeper ? 'Keeper' : 'Standard pick'}
                </DataListMetricValue>
              </DataListMetric>
            </DataListMetrics>
          </details>
        </DataListItem>
      ))}
    </DataList>

    <Table surface="responsive" scrollLabel={scrollLabel} containerClassName="hidden sm:block">
      <TableHeader>
        <TableRow>
          <TableHead>Overall</TableHead>
          <TableHead>Round.Pick</TableHead>
          {showTeam && <TableHead>Team</TableHead>}
          <TableHead>Player</TableHead>
          <TableHead>Pos</TableHead>
          <TableHead>NFL</TableHead>
          {showOwner && <TableHead>Owner</TableHead>}
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {picks.map(pick => (
          <TableRow
            key={`desktop-${pick.rosterId}-${pick.pickNo}-${pick.player.id}`}
            className="hover:bg-muted/50"
          >
            <TableCell>{pick.pickNo}</TableCell>
            <TableCell>
              {pick.round}.{pickInRound(pick.pickNo)}
            </TableCell>
            {showTeam && <TableCell className="font-medium">{pick.rosterName}</TableCell>}
            <TableCell>{pick.player.name}</TableCell>
            <TableCell>{pick.player.position || '-'}</TableCell>
            <TableCell>{pick.player.team || '-'}</TableCell>
            {showOwner && <TableCell>{pick.ownerName}</TableCell>}
            <TableCell>{pick.isKeeper ? <Badge variant="outline">Keeper</Badge> : null}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </>
);

const DraftPageContent = () => {
  const searchParams = useSearchParams();
  const leagueIdParam = searchParams.get('leagueId');

  const [resp, setResp] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const url = leagueIdParam
          ? `/api/league/draft?leagueId=${leagueIdParam}`
          : '/api/league/draft';
        const res = await fetch(url);
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
  }, [leagueIdParam]);

  const league = resp?.data?.league;
  const draft = resp?.data?.draft;
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [activeView, setActiveView] = useState<DraftView>('by-round');

  const picks = useMemo(() => {
    const src = resp?.data?.picks ?? [];
    if (positionFilter === 'ALL') return src;
    return src.filter(p => (p.player.position || '') === positionFilter);
  }, [resp?.data?.picks, positionFilter]);

  const rounds = useMemo(() => {
    if (!picks.length) return [] as number[];
    const maxRound = picks.reduce((m, p) => Math.max(m, p.round), 1);
    return Array.from({ length: maxRound }, (_, i) => i + 1);
  }, [picks]);

  const teamsByRoster = useMemo(() => {
    const map = new Map<number, { name: string; owner: string }>();
    for (const p of picks) {
      map.set(p.rosterId, { name: p.rosterName, owner: p.ownerName });
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [picks]);

  const teamsCount = draft?.slotToRosterId?.length || 0;
  const pickInRound = (pickNo: number) =>
    teamsCount > 0 ? ((pickNo - 1) % teamsCount) + 1 : pickNo;

  if (loading) {
    return <WarRoomLoader show logo={<GauntletLogo size="lg" />} />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeaderHero
        title={league ? `${league.name} — Draft` : 'Draft'}
        subtitle={league ? `Season ${league.season}` : ''}
        crestSrc="/gauntlet_logo.svg"
        actions={
          <div className="flex gap-2">
            <Link href="/archive/2025/draft-analysis">
              <Button variant="default" size="sm" className="min-h-11">
                Mock Draft Analysis
              </Button>
            </Link>
            <Link href="/league/overview">
              <Button variant="outline" size="sm" className="min-h-11">
                Back to Overview
              </Button>
            </Link>
          </div>
        }
      />
      <div className="py-5 md:px-6 md:py-8">
        <Card mobileFlat className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">
              {draft ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span>Draft Type: {draft.type.toUpperCase()}</span>
                  <Badge variant="secondary">{draft.status}</Badge>
                  {teamsCount ? <Badge variant="outline">{teamsCount} Teams</Badge> : null}
                </div>
              ) : (
                'No draft data available'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <DraftViewPills value={activeView} onChange={setActiveView} />

              {activeView === 'by-round' && (
                <div className="pt-4">
                  <div className="mb-3 flex items-center gap-4 flex-wrap">
                    <div className="text-sm text-muted-foreground">Position:</div>
                    <PositionFilterButtons value={positionFilter} onChange={setPositionFilter} />
                  </div>
                  {!picks.length ? (
                    <div className="text-sm text-muted-foreground">No picks found.</div>
                  ) : (
                    <div className="space-y-6">
                      {rounds.map(round => {
                        const roundPicks = picks.filter(p => p.round === round);
                        return (
                          <div key={round} className="space-y-2">
                            <h3 className="text-lg font-semibold">Round {round}</h3>
                            <DraftPicksLedger
                              picks={roundPicks}
                              pickInRound={pickInRound}
                              scrollLabel={`Round ${round} draft picks`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeView === 'all-picks' && (
                <div className="pt-4">
                  <div className="mb-3 flex items-center gap-4 flex-wrap">
                    <div className="text-sm text-muted-foreground">Position:</div>
                    <PositionFilterButtons value={positionFilter} onChange={setPositionFilter} />
                  </div>
                  {!picks.length ? (
                    <div className="text-sm text-muted-foreground">No picks found.</div>
                  ) : (
                    <DraftPicksLedger
                      picks={picks}
                      pickInRound={pickInRound}
                      scrollLabel="All draft picks"
                    />
                  )}
                </div>
              )}

              {activeView === 'by-team' && (
                <div className="pt-4">
                  <div className="mb-3 flex items-center gap-4 flex-wrap">
                    <div className="text-sm text-muted-foreground">Position:</div>
                    <PositionFilterButtons value={positionFilter} onChange={setPositionFilter} />
                  </div>
                  {!picks.length ? (
                    <div className="text-sm text-muted-foreground">No picks found.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {teamsByRoster.map(([rosterId, team]) => {
                        const teamPicks = picks.filter(p => p.rosterId === rosterId);
                        return (
                          <Card key={rosterId} mobileFlat>
                            <CardHeader>
                              <CardTitle className="text-base">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{team.name}</span>
                                  <Badge variant="secondary">{team.owner}</Badge>
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <DraftPicksLedger
                                picks={teamPicks}
                                pickInRound={pickInRound}
                                scrollLabel={`${team.name} draft picks`}
                                showTeam={false}
                                showOwner={false}
                              />
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function DraftPage() {
  return (
    <Suspense fallback={<WarRoomLoader show logo={<GauntletLogo size="lg" />} />}>
      <DraftPageContent />
    </Suspense>
  );
}
