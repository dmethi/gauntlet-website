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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Container, PageHeader } from '@gauntlet/ui';

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

const PositionFilterButtons = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (position: string) => void;
}) => (
  <div className="flex items-center gap-1" aria-label="Position filter">
    {POSITIONS.map(p => (
      <Button
        key={p}
        size="sm"
        variant={value === p ? 'default' : 'outline'}
        onClick={() => onChange(p)}
        aria-pressed={value === p}
        className="h-7 px-2"
      >
        {p}
      </Button>
    ))}
  </div>
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
    return (
      <Container className="py-8">
        <PageHeader title="Draft" subtitle="Loading…" />
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title={league ? `${league.name} — Draft` : 'Draft'}
          subtitle={league ? `Season ${league.season}` : ''}
        />
        <div className="flex gap-2">
          <Link href="/archive/2025/draft-analysis">
            <Button variant="default" size="sm">
              Mock Draft Analysis
            </Button>
          </Link>
          <Link href="/league/overview">
            <Button variant="outline" size="sm">
              Back to Overview
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            {draft ? (
              <div className="flex items-center gap-3">
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
          <Tabs defaultValue="by-round" className="w-full">
            <TabsList>
              <TabsTrigger value="by-round">Pick by Pick</TabsTrigger>
              <TabsTrigger value="by-team">Team by Team</TabsTrigger>
              <TabsTrigger value="all-picks">All Picks</TabsTrigger>
            </TabsList>

            <TabsContent value="by-round" className="pt-4">
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
                        <div className="overflow-x-auto rounded-md border border-border bg-card">
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
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {roundPicks.map(p => (
                                <TableRow
                                  key={`${round}-${p.pickNo}-${p.player.id}`}
                                  className="hover:bg-muted/50"
                                >
                                  <TableCell>{p.pickNo}</TableCell>
                                  <TableCell>
                                    {round}.{pickInRound(p.pickNo)}
                                  </TableCell>
                                  <TableCell className="font-medium">{p.rosterName}</TableCell>
                                  <TableCell>{p.player.name}</TableCell>
                                  <TableCell>{p.player.position || '-'}</TableCell>
                                  <TableCell>{p.player.team || '-'}</TableCell>
                                  <TableCell>{p.ownerName}</TableCell>
                                  <TableCell>
                                    {p.isKeeper ? <Badge variant="outline">Keeper</Badge> : null}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all-picks" className="pt-4">
              <div className="mb-3 flex items-center gap-4 flex-wrap">
                <div className="text-sm text-muted-foreground">Position:</div>
                <PositionFilterButtons value={positionFilter} onChange={setPositionFilter} />
              </div>
              {!picks.length ? (
                <div className="text-sm text-muted-foreground">No picks found.</div>
              ) : (
                <div className="overflow-x-auto rounded-md border border-border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Overall</TableHead>
                        <TableHead>Round.Pick</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead>Pos</TableHead>
                        <TableHead>NFL</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {picks.map(p => (
                        <TableRow
                          key={`all-${p.pickNo}-${p.player.id}`}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>{p.pickNo}</TableCell>
                          <TableCell>
                            {p.round}.{pickInRound(p.pickNo)}
                          </TableCell>
                          <TableCell className="font-medium">{p.rosterName}</TableCell>
                          <TableCell>{p.player.name}</TableCell>
                          <TableCell>{p.player.position || '-'}</TableCell>
                          <TableCell>{p.player.team || '-'}</TableCell>
                          <TableCell>{p.ownerName}</TableCell>
                          <TableCell>
                            {p.isKeeper ? <Badge variant="outline">Keeper</Badge> : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="by-team" className="pt-4">
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
                      <Card key={rosterId}>
                        <CardHeader>
                          <CardTitle className="text-base">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{team.name}</span>
                              <Badge variant="secondary">{team.owner}</Badge>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto rounded-md border border-border bg-card">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Round.Pick</TableHead>
                                  <TableHead>Overall</TableHead>
                                  <TableHead>Player</TableHead>
                                  <TableHead>Pos</TableHead>
                                  <TableHead>NFL</TableHead>
                                  <TableHead>Notes</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {teamPicks.map(p => (
                                  <TableRow
                                    key={`${p.rosterId}-${p.pickNo}`}
                                    className="hover:bg-muted/50"
                                  >
                                    <TableCell>
                                      {p.round}.{pickInRound(p.pickNo)}
                                    </TableCell>
                                    <TableCell>{p.pickNo}</TableCell>
                                    <TableCell>{p.player.name}</TableCell>
                                    <TableCell>{p.player.position || '-'}</TableCell>
                                    <TableCell>{p.player.team || '-'}</TableCell>
                                    <TableCell>
                                      {p.isKeeper ? <Badge variant="outline">Keeper</Badge> : null}
                                    </TableCell>
                                  </TableRow>
                                ))}
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
    </Container>
  );
};

export default function DraftPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-8">
          <PageHeader title="Draft" subtitle="Loading…" />
        </Container>
      }
    >
      <DraftPageContent />
    </Suspense>
  );
}
