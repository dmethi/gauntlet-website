/**
 * Player Price Comparison Table
 *
 * Shows side-by-side AFC vs NFC waiver prices for players acquired in both leagues
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { ArrowUpDown, Search } from 'lucide-react';
import { leagueBadgeClass, neutralBadgeClass } from '@/lib/stat-colors';
import type { CrossLeaguePlayerComparison } from '../../types';

interface PlayerPriceComparisonTableProps {
  readonly comparisons: CrossLeaguePlayerComparison[];
}

type SortField = 'playerName' | 'priceDifference' | 'afcAvg' | 'nfcAvg';

export const PlayerPriceComparisonTable = memo<PlayerPriceComparisonTableProps>(props => {
  const { comparisons } = props;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('priceDifference');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter players acquired in BOTH leagues
  const bothLeaguesPlayers = useMemo(
    () => comparisons.filter(p => p.afcStats !== null && p.nfcStats !== null),
    [comparisons],
  );

  // Filter and sort
  const filteredPlayers = useMemo(() => {
    let filtered = bothLeaguesPlayers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.playerName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      switch (sortField) {
        case 'playerName':
          return sortAsc
            ? a.playerName.localeCompare(b.playerName)
            : b.playerName.localeCompare(a.playerName);
        case 'priceDifference':
          aVal = Math.abs(a.priceDifference);
          bVal = Math.abs(b.priceDifference);
          break;
        case 'afcAvg':
          aVal = a.afcStats?.avgCost ?? 0;
          bVal = b.afcStats?.avgCost ?? 0;
          break;
        case 'nfcAvg':
          aVal = a.nfcStats?.avgCost ?? 0;
          bVal = b.nfcStats?.avgCost ?? 0;
          break;
        default:
          return 0;
      }

      return sortAsc ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [bothLeaguesPlayers, searchTerm, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <Card mobileFlat>
      <CardHeader>
        <CardTitle>Player Price Comparison (Both Leagues)</CardTitle>
        <CardDescription>
          Players acquired via waivers in both AFC and NFC - {filteredPlayers.length} players
        </CardDescription>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search player price comparisons"
            className="h-11 pl-9"
          />
        </div>
        <div className="mt-3 grid grid-cols-[1fr_44px] gap-2 sm:hidden">
          <Select value={sortField} onValueChange={value => setSortField(value as SortField)}>
            <SelectTrigger className="h-11" aria-label="Sort player price comparisons">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priceDifference">Sort: Price Difference</SelectItem>
              <SelectItem value="afcAvg">Sort: AFC Average</SelectItem>
              <SelectItem value="nfcAvg">Sort: NFC Average</SelectItem>
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
      </CardHeader>

      <CardContent>
        <DataList className="sm:hidden">
          {filteredPlayers.length === 0 ? (
            <DataListItem className="text-center text-sm text-muted-foreground">
              No players match your search
            </DataListItem>
          ) : (
            filteredPlayers.map(player => {
              const afcAvg = player.afcStats?.avgCost ?? 0;
              const nfcAvg = player.nfcStats?.avgCost ?? 0;

              return (
                <DataListItem key={player.playerId}>
                  <DataListHeader>
                    <div className="min-w-0">
                      <DataListTitle className="truncate">{player.playerName}</DataListTitle>
                      <DataListDescription>
                        {player.position} ·{' '}
                        {player.whichLeagueValuesMore === 'EQUAL'
                          ? 'Equal spending'
                          : `${player.whichLeagueValuesMore} higher`}
                      </DataListDescription>
                    </div>
                  </DataListHeader>
                  <DataListMetrics>
                    <DataListMetric>
                      <DataListMetricLabel className="text-xs">AFC avg</DataListMetricLabel>
                      <DataListMetricValue>${afcAvg.toFixed(1)}</DataListMetricValue>
                    </DataListMetric>
                    <DataListMetric>
                      <DataListMetricLabel className="text-xs">NFC avg</DataListMetricLabel>
                      <DataListMetricValue>${nfcAvg.toFixed(1)}</DataListMetricValue>
                    </DataListMetric>
                    <DataListMetric className="text-right">
                      <DataListMetricLabel className="text-xs">Difference</DataListMetricLabel>
                      <DataListMetricValue>
                        {player.priceDifference > 0 ? '+' : ''}${player.priceDifference.toFixed(1)}
                      </DataListMetricValue>
                    </DataListMetric>
                  </DataListMetrics>
                </DataListItem>
              );
            })
          )}
        </DataList>

        <Table
          surface="responsive"
          scrollLabel="Player price comparison table"
          containerClassName="hidden sm:block"
        >
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => handleSort('playerName')}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Player <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort('afcAvg')}
                  className="flex items-center gap-1 hover:text-foreground ml-auto"
                >
                  AFC Avg <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort('nfcAvg')}
                  className="flex items-center gap-1 hover:text-foreground ml-auto"
                >
                  NFC Avg <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort('priceDifference')}
                  className="flex items-center gap-1 hover:text-foreground ml-auto"
                >
                  Difference <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Higher Spender</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No players match your search
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map(player => {
                const afcAvg = player.afcStats?.avgCost ?? 0;
                const nfcAvg = player.nfcStats?.avgCost ?? 0;
                const diff = player.priceDifference;
                const absDiff = Math.abs(diff);

                return (
                  <TableRow key={player.playerId}>
                    <TableCell className="font-medium">{player.playerName}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${neutralBadgeClass}`}
                      >
                        {player.position}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">${afcAvg.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-mono">${nfcAvg.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-mono">
                      <span
                        className={
                          absDiff > 10
                            ? 'text-destructive font-semibold'
                            : absDiff > 5
                              ? 'text-secondary'
                              : 'text-muted-foreground'
                        }
                      >
                        {diff > 0 ? '+' : ''}${diff.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {player.whichLeagueValuesMore === 'EQUAL' ? (
                        <span className="text-muted-foreground text-sm">Equal</span>
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${leagueBadgeClass(
                            player.whichLeagueValuesMore,
                          )}`}
                        >
                          {player.whichLeagueValuesMore}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {filteredPlayers.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredPlayers.length} of {bothLeaguesPlayers.length} players
          </div>
        )}
      </CardContent>
    </Card>
  );
});

PlayerPriceComparisonTable.displayName = 'PlayerPriceComparisonTable';
