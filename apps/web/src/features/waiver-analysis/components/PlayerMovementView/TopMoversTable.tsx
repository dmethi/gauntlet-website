/**
 * Top Movers Table
 *
 * Shows players with highest transaction volume
 */

'use client';

import { memo, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
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
import { neutralBadgeClass } from '@/lib/stat-colors';
import type { PlayerMovement } from '../../types';

interface TopMoversTableProps {
  readonly topMovers: PlayerMovement[];
  readonly leagueMovers: Array<{
    leagueId: string;
    leagueName: string;
    players: PlayerMovement[];
  }>;
}

type SortField = 'playerName' | 'totalTransactions' | 'addCount' | 'avgFAABCost';

export const TopMoversTable = memo<TopMoversTableProps>(props => {
  const { topMovers, leagueMovers } = props;
  const [view, setView] = useState('all');
  const [sortField, setSortField] = useState<SortField>('totalTransactions');
  const [sortAsc, setSortAsc] = useState(false);

  const sortPlayers = (players: PlayerMovement[]) => {
    return [...players].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case 'playerName':
          return sortAsc
            ? a.playerName.localeCompare(b.playerName)
            : b.playerName.localeCompare(a.playerName);
        case 'totalTransactions':
          aVal = a.totalTransactions;
          bVal = b.totalTransactions;
          break;
        case 'addCount':
          aVal = a.addCount;
          bVal = b.addCount;
          break;
        case 'avgFAABCost':
          aVal = a.avgFAABCost;
          bVal = b.avgFAABCost;
          break;
        default:
          return 0;
      }

      return sortAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
  };

  const sortedTopMovers = useMemo(() => sortPlayers(topMovers), [topMovers, sortField, sortAsc]);
  const sortedLeagueMovers = useMemo(
    () =>
      leagueMovers.map(league => ({
        ...league,
        players: sortPlayers(league.players),
      })),
    [leagueMovers, sortField, sortAsc],
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const renderTable = (players: PlayerMovement[]) => (
    <>
      <div className="mb-3 grid grid-cols-[1fr_44px] gap-2 sm:hidden">
        <Select value={sortField} onValueChange={value => setSortField(value as SortField)}>
          <SelectTrigger className="h-11" aria-label="Sort player movement">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="totalTransactions">Sort: Total Transactions</SelectItem>
            <SelectItem value="addCount">Sort: Adds</SelectItem>
            <SelectItem value="avgFAABCost">Sort: Average FAAB</SelectItem>
            <SelectItem value="playerName">Sort: Player</SelectItem>
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={() => setSortAsc(current => !current)}
          aria-label={sortAsc ? 'Sort descending' : 'Sort ascending'}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-input hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>

      <DataList className="sm:hidden">
        {players.length === 0 ? (
          <DataListItem className="text-center text-sm text-muted-foreground">
            No player movement data
          </DataListItem>
        ) : (
          players.map((player, index) => {
            const currentOwner = player.ownershipHistory[player.ownershipHistory.length - 1];

            return (
              <DataListItem key={player.playerId}>
                <DataListHeader>
                  <div className="min-w-0">
                    <DataListTitle className="truncate">
                      <span className="mr-2 text-sm text-muted-foreground">#{index + 1}</span>
                      {player.playerName}
                    </DataListTitle>
                    <DataListDescription>
                      {player.position} ·{' '}
                      {currentOwner && currentOwner.weekDropped === null
                        ? `${currentOwner.teamName}, since Week ${currentOwner.weekAcquired}`
                        : 'Free Agent'}
                    </DataListDescription>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-base font-semibold">{player.totalTransactions}</div>
                    <div className="text-xs text-muted-foreground">transactions</div>
                  </div>
                </DataListHeader>

                <details className="group mt-2">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                    <span>More metrics</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <DataListMetrics className="mt-1 grid-cols-2">
                    <DataListMetric>
                      <DataListMetricLabel className="text-xs">Adds / Drops</DataListMetricLabel>
                      <DataListMetricValue>
                        {player.addCount} / {player.dropCount}
                      </DataListMetricValue>
                    </DataListMetric>
                    <DataListMetric className="text-right">
                      <DataListMetricLabel className="text-xs">Average FAAB</DataListMetricLabel>
                      <DataListMetricValue>
                        {player.avgFAABCost > 0 ? `$${player.avgFAABCost.toFixed(1)}` : '—'}
                      </DataListMetricValue>
                    </DataListMetric>
                    <DataListMetric className="col-span-2">
                      <DataListMetricLabel className="text-xs">Highest bid</DataListMetricLabel>
                      <DataListMetricValue>
                        {player.highestAcquisitionCost > 0
                          ? `$${player.highestAcquisitionCost}`
                          : '—'}
                      </DataListMetricValue>
                    </DataListMetric>
                  </DataListMetrics>
                </details>
              </DataListItem>
            );
          })
        )}
      </DataList>

      <Table
        surface="responsive"
        scrollLabel="Player movement table"
        containerClassName="hidden sm:block"
      >
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Rank</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('playerName')}
                className="flex min-h-11 items-center gap-1 hover:text-foreground"
              >
                Player <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead>Position</TableHead>
            <TableHead className="text-right">
              <button
                onClick={() => handleSort('totalTransactions')}
                className="ml-auto flex min-h-11 items-center gap-1 hover:text-foreground"
              >
                Total Txns <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                onClick={() => handleSort('addCount')}
                className="ml-auto flex min-h-11 items-center gap-1 hover:text-foreground"
              >
                Adds <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead className="text-right">Drops</TableHead>
            <TableHead className="text-right">
              <button
                onClick={() => handleSort('avgFAABCost')}
                className="ml-auto flex min-h-11 items-center gap-1 hover:text-foreground"
              >
                Avg FAAB <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead className="text-right">Highest Bid</TableHead>
            <TableHead>Current Owner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No player movement data
              </TableCell>
            </TableRow>
          ) : (
            players.map((player, index) => {
              const currentOwner = player.ownershipHistory[player.ownershipHistory.length - 1];

              return (
                <TableRow key={player.playerId}>
                  <TableCell className="text-center font-semibold text-muted-foreground">
                    #{index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{player.playerName}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${neutralBadgeClass}`}
                    >
                      {player.position}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {player.totalTransactions}
                  </TableCell>
                  <TableCell className="text-right">{player.addCount}</TableCell>
                  <TableCell className="text-right">{player.dropCount}</TableCell>
                  <TableCell className="text-right font-mono">
                    {player.avgFAABCost > 0 ? `$${player.avgFAABCost.toFixed(1)}` : '-'}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {player.highestAcquisitionCost > 0 ? `$${player.highestAcquisitionCost}` : '-'}
                  </TableCell>
                  <TableCell>
                    {currentOwner && currentOwner.weekDropped === null ? (
                      <div className="text-sm">
                        <div className="font-medium truncate max-w-[150px]">
                          {currentOwner.teamName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Since Week {currentOwner.weekAcquired}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Free Agent</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </>
  );

  return (
    <Card mobileFlat>
      <CardHeader>
        <CardTitle>Highest Volume Movers</CardTitle>
        <CardDescription>
          Players involved in the most transactions (adds, drops, waivers)
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={view} onValueChange={setView} className="w-full">
          <TabsList className="flex h-auto w-full max-w-4xl overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsTrigger className="min-h-11 shrink-0" value="all">
              All Leagues
            </TabsTrigger>
            {leagueMovers.map(league => (
              <TabsTrigger
                className="min-h-11 shrink-0"
                key={league.leagueId}
                value={league.leagueId}
              >
                {league.leagueName}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {renderTable(sortedTopMovers)}
          </TabsContent>

          {sortedLeagueMovers.map(league => (
            <TabsContent key={league.leagueId} value={league.leagueId} className="mt-4">
              {renderTable(league.players)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
});

TopMoversTable.displayName = 'TopMoversTable';
