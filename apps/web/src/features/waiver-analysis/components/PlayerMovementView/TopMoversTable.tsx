/**
 * Top Movers Table
 *
 * Shows players with highest transaction volume
 */

'use client';

import { memo, useState, useMemo } from 'react';
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
import { ArrowUpDown } from 'lucide-react';
import type { PlayerMovement } from '../../types';

interface TopMoversTableProps {
  readonly topMovers: PlayerMovement[];
  readonly afcTopMovers: PlayerMovement[];
  readonly nfcTopMovers: PlayerMovement[];
}

type SortField = 'playerName' | 'totalTransactions' | 'addCount' | 'avgFAABCost';

export const TopMoversTable = memo<TopMoversTableProps>(props => {
  const { topMovers, afcTopMovers, nfcTopMovers } = props;
  const [view, setView] = useState<'all' | 'afc' | 'nfc'>('all');
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
  const sortedAfcMovers = useMemo(
    () => sortPlayers(afcTopMovers),
    [afcTopMovers, sortField, sortAsc],
  );
  const sortedNfcMovers = useMemo(
    () => sortPlayers(nfcTopMovers),
    [nfcTopMovers, sortField, sortAsc],
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Rank</TableHead>
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
                onClick={() => handleSort('totalTransactions')}
                className="flex items-center gap-1 hover:text-foreground ml-auto"
              >
                Total Txns <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                onClick={() => handleSort('addCount')}
                className="flex items-center gap-1 hover:text-foreground ml-auto"
              >
                Adds <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead className="text-right">Drops</TableHead>
            <TableHead className="text-right">
              <button
                onClick={() => handleSort('avgFAABCost')}
                className="flex items-center gap-1 hover:text-foreground ml-auto"
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
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
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
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Highest Volume Movers</CardTitle>
        <CardDescription>
          Players involved in the most transactions (adds, drops, waivers)
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={view} onValueChange={v => setView(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">All Leagues</TabsTrigger>
            <TabsTrigger value="afc">AFC Only</TabsTrigger>
            <TabsTrigger value="nfc">NFC Only</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {renderTable(sortedTopMovers)}
          </TabsContent>

          <TabsContent value="afc" className="mt-4">
            {renderTable(sortedAfcMovers)}
          </TabsContent>

          <TabsContent value="nfc" className="mt-4">
            {renderTable(sortedNfcMovers)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

TopMoversTable.displayName = 'TopMoversTable';
