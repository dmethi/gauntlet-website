'use client';

import { LeagueChart } from '@/components/league-chart';
import { useLeagueData, useLeagueDataById } from '@/lib/hooks';
import { useLeagueOverviewClient } from '@/hooks/useLeagueOverviewClient';
import type { LeagueData } from '@/shared/types';
import { PageHeaderHero, WarRoomLoader } from '@gauntlet/ui';
import { GauntletLogo } from '@/components/gauntlet-logo';
import { Suspense, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLeagueConfig } from '@/config/leagues';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TransactionList } from '@/components/transactions';
import { useSearchParams } from 'next/navigation';

const LeagueOverviewContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const leagueIdParam = searchParams.get('leagueId');

  // Use the new client-side calculation hook
  const { league, loading, teamStats, weeklyAverages } = useLeagueOverviewClient(
    leagueIdParam || undefined,
  );
  const [sortKey, setSortKey] = useState<'team' | 'record' | 'points' | 'expectedWins' | 'luck'>(
    'points',
  );
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sortedTeamStats = useMemo(() => {
    const data = [...teamStats];
    const winPct = (t: (typeof teamStats)[number]) =>
      t.wins + t.losses > 0 ? t.wins / (t.wins + t.losses) : 0;
    data.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      switch (sortKey) {
        case 'team':
          av = a.name;
          bv = b.name;
          break;
        case 'record':
          av = winPct(a);
          bv = winPct(b);
          break;
        case 'points':
          av = a.totalPoints;
          bv = b.totalPoints;
          break;
        case 'expectedWins':
          av = a.expectedWins;
          bv = b.expectedWins;
          break;
        case 'luck':
          av = a.luckRating;
          bv = b.luckRating;
          break;
        default:
          av = a.totalPoints;
          bv = b.totalPoints;
      }
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const diff = Number(av) - Number(bv);
      return sortDir === 'asc' ? diff : -diff;
    });
    return data;
  }, [teamStats, sortKey, sortDir]);

  const onSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'team' ? 'asc' : 'desc');
    }
  };

  if (loading) {
    return <WarRoomLoader show logo={<GauntletLogo size="lg" />} />;
  }

  if (!league) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-card-foreground mb-2">League Not Found</h2>
          <p className="text-muted-foreground">No league data available for the 2023 season.</p>
        </div>
      </div>
    );
  }

  const leagueConfig = getLeagueConfig(league.id);
  const divisionConfig = leagueConfig?.divisions ?? [];

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeaderHero
        title={league.name}
        subtitle={`Season ${league.season}`}
        crestSrc={leagueConfig?.logo ?? '/gauntlet_logo.svg'}
      />
      <div className="px-6 py-8">
        <div className="mb-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl font-bold">Team Rankings</h2>
            {divisionConfig.length > 0 ? (
              <div className="flex flex-wrap gap-2" aria-label="League divisions">
                {divisionConfig.map(division => (
                  <div
                    key={division.id}
                    className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium"
                  >
                    {division.logo ? (
                      <Image src={division.logo} alt="" width={28} height={28} />
                    ) : null}
                    <span>{division.name}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="overflow-x-auto rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Rank</TableHead>
                  <TableHead>
                    <button
                      className="flex items-center gap-1 px-1 py-0.5 -mx-1 -my-0.5 rounded hover:text-card-foreground hover:bg-muted/50 active:bg-muted/70 transition-all duration-200 ease-out motion-reduce:transition-none"
                      onClick={() => onSort('team')}
                      aria-label="Sort by Team"
                    >
                      <span>Team</span>
                      {sortKey === 'team' &&
                        (sortDir === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </button>
                  </TableHead>
                  <TableHead className="w-[80px]">Division</TableHead>
                  <TableHead>
                    <button
                      className="flex items-center gap-1 px-1 py-0.5 -mx-1 -my-0.5 rounded hover:text-card-foreground hover:bg-muted/50 active:bg-muted/70 transition-all duration-200 ease-out motion-reduce:transition-none"
                      onClick={() => onSort('record')}
                      aria-label="Sort by Record"
                    >
                      <span>Record</span>
                      {sortKey === 'record' &&
                        (sortDir === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="flex items-center gap-1 px-1 py-0.5 -mx-1 -my-0.5 rounded hover:text-card-foreground hover:bg-muted/50 active:bg-muted/70 transition-all duration-200 ease-out motion-reduce:transition-none"
                      onClick={() => onSort('points')}
                      aria-label="Sort by Points For"
                    >
                      <span>Points For</span>
                      {sortKey === 'points' &&
                        (sortDir === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="flex items-center gap-1 px-1 py-0.5 -mx-1 -my-0.5 rounded hover:text-card-foreground hover:bg-muted/50 active:bg-muted/70 transition-all duration-200 ease-out motion-reduce:transition-none"
                      onClick={() => onSort('expectedWins')}
                      aria-label="Sort by Expected Wins"
                    >
                      <span>Expected Wins</span>
                      {sortKey === 'expectedWins' &&
                        (sortDir === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="flex items-center gap-1 px-1 py-0.5 -mx-1 -my-0.5 rounded hover:text-card-foreground hover:bg-muted/50 active:bg-muted/70 transition-all duration-200 ease-out motion-reduce:transition-none"
                      onClick={() => onSort('luck')}
                      aria-label="Sort by Luck"
                    >
                      <span>Luck</span>
                      {sortKey === 'luck' &&
                        (sortDir === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTeamStats.map(team => {
                  const division = divisionConfig.find(item => item.id === team.division);

                  return (
                    <TableRow
                      key={team.id}
                      className="group cursor-pointer hover:bg-muted/50 active:bg-muted/70 transition-colors duration-200 ease-out motion-reduce:transition-none"
                      onClick={() => {
                        router.push(`/team/${team.id}`);
                      }}
                    >
                      <TableCell>{team.canonicalRank}</TableCell>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1.5 pl-1 text-xs">
                          {division?.logo ? (
                            <Image src={division.logo} alt="" width={20} height={20} />
                          ) : null}
                          {division?.name ?? (team.division ? `Division ${team.division}` : 'N/A')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {team.wins}-{team.losses}
                        </Badge>
                      </TableCell>
                      <TableCell>{team.totalPoints.toFixed(2)}</TableCell>
                      <TableCell>{team.expectedWins.toFixed(2)}</TableCell>
                      <TableCell>{team.luckRating.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-12">
          <LeagueChart data={weeklyAverages} />
        </div>

        {/* Recent Transactions */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold">Recent Transactions</h2>
            <Link href={`/league/transactions?leagueId=${league.id}`}>
              <Button size="sm" variant="outline">
                View All
              </Button>
            </Link>
          </div>
          <RecentTransactionsWidget league={league} />
        </div>
      </div>
    </div>
  );
};

export default function LeagueOverview() {
  return (
    <Suspense fallback={<WarRoomLoader show logo={<GauntletLogo size="lg" />} />}>
      <LeagueOverviewContent />
    </Suspense>
  );
}

interface TransactionPlayer {
  fullName: string;
}

interface TransactionRosterData {
  rosterId: number;
  players: TransactionPlayer[];
}

interface TransactionData {
  id: string;
  type: string;
  status?: string;
  createdAt: string;
  adds?: TransactionRosterData[];
  drops?: TransactionRosterData[];
  settings?: {
    waiver_bid?: number;
  };
}

interface TransactionPlayerDetail {
  player: string;
  rosterId: number;
  label: string;
}

const RecentTransactionsWidget = ({
  league,
}: {
  league: {
    id: string;
    rosters?: Array<{
      id: string | number;
      owner?: {
        metadata?: { team_name?: string };
        displayName?: string;
        username?: string;
      };
    }>;
  };
}) => {
  const [items, setItems] = useState<TransactionData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const INITIAL_DISPLAY_COUNT = 10; // Show more transactions by default

  useMemo(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/league/${String(league.id)}/transactions`);
        const json = (await res.json()) as { ok: boolean; data?: TransactionData[] };
        if (!cancelled && json.ok) setItems(json.data || []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [league?.id]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  // Create mapping from both unique roster IDs and original Sleeper IDs (1-12)
  const rosterMap = new Map<number, string>();
  (league?.rosters || []).forEach(r => {
    const name =
      r?.owner?.metadata?.team_name ||
      r?.owner?.displayName ||
      r?.owner?.username ||
      `Team ${r.id}`;
    // Map unique roster ID (e.g., 1001, 2001)
    rosterMap.set(Number(r.id), name);

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
    rosterMap.set(originalId, name);
  });
  const rosterName = (rid: number) => rosterMap.get(Number(rid)) || `Team ${rid}`;

  const adapted = (items || []).map(t => {
    // Get raw adds and drops
    const rawAdds: TransactionPlayerDetail[] = (t.adds || []).flatMap(a =>
      a.players.map(p => ({
        player: p.fullName,
        rosterId: a.rosterId,
        label: `${p.fullName} to ${rosterName(a.rosterId)}`,
      })),
    );
    const rawDrops: TransactionPlayerDetail[] = (t.drops || []).flatMap(d =>
      d.players.map(p => ({
        player: p.fullName,
        rosterId: d.rosterId,
        label: `${p.fullName} from ${rosterName(d.rosterId)}`,
      })),
    );

    // For trades, detect and fix duplicate players appearing on both sides
    let cleanedAdds = rawAdds;
    let cleanedDrops = rawDrops;

    if (t.type === 'trade' && rawAdds.length > 0 && rawDrops.length > 0) {
      const addPlayerNames = new Set(rawAdds.map(a => a.player));
      const dropPlayerNames = new Set(rawDrops.map(d => d.player));
      const duplicatePlayerNames = [...addPlayerNames].filter(name => dropPlayerNames.has(name));

      // If we have duplicates, this suggests malformed trade data
      if (duplicatePlayerNames.length > 0) {
        // For malformed trades, group players by roster and show as separate trade legs
        const playersByRoster = new Map<
          number,
          { adds: TransactionPlayerDetail[]; drops: TransactionPlayerDetail[] }
        >();

        rawAdds.forEach(add => {
          if (!playersByRoster.has(add.rosterId)) {
            playersByRoster.set(add.rosterId, { adds: [], drops: [] });
          }
          playersByRoster.get(add.rosterId)!.adds.push(add);
        });

        rawDrops.forEach(drop => {
          if (!playersByRoster.has(drop.rosterId)) {
            playersByRoster.set(drop.rosterId, { adds: [], drops: [] });
          }
          playersByRoster.get(drop.rosterId)!.drops.push(drop);
        });

        // Reconstruct trade: if a player appears in both adds/drops for same roster, it's likely incorrect
        // Keep only the logical direction (typically drops = giving away, adds = receiving)
        cleanedAdds = [];
        cleanedDrops = [];

        playersByRoster.forEach((data, _rosterId) => {
          data.adds.forEach(add => {
            const isAlsoDropped = data.drops.some(drop => drop.player === add.player);
            if (!isAlsoDropped) {
              cleanedAdds.push(add);
            }
          });

          data.drops.forEach(drop => {
            const isAlsoAdded = data.adds.some(add => add.player === drop.player);
            if (!isAlsoAdded) {
              cleanedDrops.push(drop);
            }
          });
        });
      }
    }

    return {
      id: t.id,
      type: t.type,
      status: t.status,
      createdAt: t.createdAt,
      adds: cleanedAdds.map(a => ({ label: a.label })),
      drops: cleanedDrops.map(d => ({ label: d.label })),
      waiverBid: t.settings?.waiver_bid ?? null,
    };
  });

  const displayedItems = showAll ? adapted : adapted.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = adapted.length > INITIAL_DISPLAY_COUNT;

  return (
    <div>
      <TransactionList items={displayedItems} />
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          Show all {adapted.length} transactions
        </button>
      )}
      {showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full mt-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          Show less
        </button>
      )}
    </div>
  );
};
