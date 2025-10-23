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
import { ArrowUpDown, Search } from 'lucide-react';
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
    <Card>
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
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
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
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                          {player.position}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono">${afcAvg.toFixed(1)}</TableCell>
                      <TableCell className="text-right font-mono">${nfcAvg.toFixed(1)}</TableCell>
                      <TableCell className="text-right font-mono">
                        <span
                          className={
                            absDiff > 10
                              ? 'text-red-600 font-semibold'
                              : absDiff > 5
                                ? 'text-orange-600'
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
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                              player.whichLeagueValuesMore === 'AFC'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}
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
        </div>

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
