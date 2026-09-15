'use client';

import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { ArrowUpDown, ChevronDown, TrendingUp } from 'lucide-react';
import { getContrastingTextColor, getHeatmapColor } from './utils';
import type { ManagerAnalytics } from '@/features/draft-analysis/types';
import type { SortConfig } from '@/features/draft-analysis/hooks';

interface CrossLeaguePriceDiffProps {
  analytics: ManagerAnalytics;
  sortConfig: SortConfig | null;
  onSort: (_key: string) => void;
}

export const CrossLeaguePriceDiff = memo<CrossLeaguePriceDiffProps>(
  ({ analytics, sortConfig, onSort }) => {
    const playersWithDiffs = useMemo(() => {
      const allDraftedPlayers = analytics.player_level_analytics.players
        .filter(player => player.prices.LEAGUE_A !== null || player.prices.LEAGUE_B !== null)
        .map(player => ({
          player_id: player.player_id,
          player_name: player.name,
          position: player.position,
          afc_price: player.prices.LEAGUE_A,
          nfc_price: player.prices.LEAGUE_B,
          afc_pick_number: player.price_rank.LEAGUE_A,
          nfc_pick_number: player.price_rank.LEAGUE_B,
          price_diff_abs: player.price_gap_abs || 0,
          higher_in:
            player.prices.LEAGUE_A !== null && player.prices.LEAGUE_B !== null
              ? (player.prices.LEAGUE_A || 0) > (player.prices.LEAGUE_B || 0)
                ? 'AFC'
                : 'NFC'
              : player.prices.LEAGUE_A !== null
                ? 'AFC'
                : 'NFC',
          is_cross_league: player.prices.LEAGUE_A !== null && player.prices.LEAGUE_B !== null,
        }));

      const sorted = [...allDraftedPlayers];

      if (sortConfig) {
        sorted.sort((a, b) => {
          let aValue: string | number;
          let bValue: string | number;

          switch (sortConfig.key) {
            case 'player_name':
              aValue = a.player_name || '';
              bValue = b.player_name || '';
              break;
            case 'afc_price':
              aValue = a.afc_price || 0;
              bValue = b.afc_price || 0;
              break;
            case 'nfc_price':
              aValue = a.nfc_price || 0;
              bValue = b.nfc_price || 0;
              break;
            case 'price_diff':
              aValue = a.price_diff_abs || 0;
              bValue = b.price_diff_abs || 0;
              break;
            default:
              return 0;
          }

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'asc'
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          } else {
            return sortConfig.direction === 'asc'
              ? (aValue as number) - (bValue as number)
              : (bValue as number) - (aValue as number);
          }
        });
      } else {
        sorted.sort((a, b) => {
          if (a.is_cross_league && !b.is_cross_league) return -1;
          if (!a.is_cross_league && b.is_cross_league) return 1;
          if (a.is_cross_league && b.is_cross_league) {
            return (b.price_diff_abs || 0) - (a.price_diff_abs || 0);
          }
          return (b.afc_price || b.nfc_price || 0) - (a.afc_price || a.nfc_price || 0);
        });
      }

      return sorted;
    }, [analytics.player_level_analytics.players, sortConfig]);

    const { maxDiff, minDiff } = useMemo(() => {
      const allPriceDiffs = playersWithDiffs
        .filter(p => p.is_cross_league)
        .map(p => p.price_diff_abs);
      return {
        maxDiff: Math.max(...allPriceDiffs, 0),
        minDiff: Math.min(...allPriceDiffs, 0),
      };
    }, [playersWithDiffs]);

    const getSortIcon = (key: string): string => {
      if (sortConfig?.key !== key) return '';
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    if (playersWithDiffs.length === 0) {
      return (
        <Card mobileFlat>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cross-League Price Differences
            </CardTitle>
            <CardDescription>
              All drafted players with price comparison and draft pick numbers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No players found drafted in both leagues
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card mobileFlat>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cross-League Price Differences
          </CardTitle>
          <CardDescription>
            All drafted players with price comparison and draft pick numbers. Cross-league players
            show price differences with heatmap background.
          </CardDescription>
          <div className="grid grid-cols-[1fr_44px] gap-2 pt-3 sm:hidden">
            <Select value={sortConfig?.key ?? 'price_diff'} onValueChange={onSort}>
              <SelectTrigger className="h-11" aria-label="Sort cross-league prices">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_diff">Sort: Price Gap</SelectItem>
                <SelectItem value="afc_price">Sort: AFC Price</SelectItem>
                <SelectItem value="nfc_price">Sort: NFC Price</SelectItem>
                <SelectItem value="player_name">Sort: Player</SelectItem>
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => onSort(sortConfig?.key ?? 'price_diff')}
              aria-label="Reverse price sort order"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-input hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <DataList className="sm:hidden">
            {playersWithDiffs.slice(0, 100).map((player, index) => (
              <DataListItem key={`price-diff-mobile-${player.player_id}-${index}`}>
                <DataListHeader>
                  <div className="min-w-0">
                    <DataListTitle className="truncate">{player.player_name}</DataListTitle>
                    <DataListDescription>
                      {player.position} ·{' '}
                      {player.is_cross_league
                        ? `${player.higher_in} higher`
                        : `${player.higher_in} only`}
                    </DataListDescription>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-base font-semibold">
                      {player.is_cross_league ? `$${player.price_diff_abs}` : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground">price gap</div>
                  </div>
                </DataListHeader>
                <DataListMetrics>
                  <DataListMetric>
                    <DataListMetricLabel className="text-xs">AFC price</DataListMetricLabel>
                    <DataListMetricValue>
                      {player.afc_price !== null ? `$${player.afc_price}` : '—'}
                    </DataListMetricValue>
                  </DataListMetric>
                  <DataListMetric>
                    <DataListMetricLabel className="text-xs">NFC price</DataListMetricLabel>
                    <DataListMetricValue>
                      {player.nfc_price !== null ? `$${player.nfc_price}` : '—'}
                    </DataListMetricValue>
                  </DataListMetric>
                  <DataListMetric className="text-right">
                    <DataListMetricLabel className="text-xs">Higher in</DataListMetricLabel>
                    <DataListMetricValue>{player.higher_in}</DataListMetricValue>
                  </DataListMetric>
                </DataListMetrics>
                <details className="group mt-2">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                    <span>Draft positions</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <DataListMetrics className="mt-1 grid-cols-2">
                    <DataListMetric>
                      <DataListMetricLabel className="text-xs">AFC pick</DataListMetricLabel>
                      <DataListMetricValue>{player.afc_pick_number || '—'}</DataListMetricValue>
                    </DataListMetric>
                    <DataListMetric className="text-right">
                      <DataListMetricLabel className="text-xs">NFC pick</DataListMetricLabel>
                      <DataListMetricValue>{player.nfc_pick_number || '—'}</DataListMetricValue>
                    </DataListMetric>
                  </DataListMetrics>
                </details>
              </DataListItem>
            ))}
          </DataList>

          <Table
            surface="responsive"
            scrollLabel="Cross-league draft price table"
            containerClassName="hidden max-h-96 sm:block"
          >
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSort('player_name')}
                >
                  Player {getSortIcon('player_name')}
                </TableHead>
                <TableHead className="text-center">Pos</TableHead>
                <TableHead
                  className="text-center cursor-pointer hover:bg-muted/50"
                  onClick={() => onSort('afc_price')}
                >
                  AFC Price {getSortIcon('afc_price')}
                </TableHead>
                <TableHead
                  className="text-center cursor-pointer hover:bg-muted/50"
                  onClick={() => onSort('nfc_price')}
                >
                  NFC Price {getSortIcon('nfc_price')}
                </TableHead>
                <TableHead
                  className="text-center cursor-pointer hover:bg-muted/50"
                  onClick={() => onSort('price_diff')}
                >
                  Price Gap {getSortIcon('price_diff')}
                </TableHead>
                <TableHead className="text-center">Higher In</TableHead>
                <TableHead className="text-center">AFC Pick #</TableHead>
                <TableHead className="text-center">NFC Pick #</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playersWithDiffs.slice(0, 100).map((player, index) => (
                <TableRow key={`price-diff-${player.player_id}-${index}`}>
                  <TableCell className="font-medium">{player.player_name}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {player.position}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {player.afc_price !== null ? `$${player.afc_price}` : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {player.nfc_price !== null ? `$${player.nfc_price}` : '-'}
                  </TableCell>
                  <TableCell
                    className={`text-center font-medium ${
                      player.is_cross_league
                        ? getContrastingTextColor(
                            getHeatmapColor(player.price_diff_abs, maxDiff, minDiff),
                          )
                        : ''
                    }`}
                    style={{
                      backgroundColor: player.is_cross_league
                        ? getHeatmapColor(player.price_diff_abs, maxDiff, minDiff)
                        : 'transparent',
                    }}
                  >
                    {player.is_cross_league ? `$${player.price_diff_abs}` : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {player.is_cross_league ? (
                      <Badge
                        variant={player.higher_in === 'AFC' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {player.higher_in}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {player.higher_in}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {player.afc_pick_number || '-'}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {player.nfc_pick_number || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  },
);

CrossLeaguePriceDiff.displayName = 'CrossLeaguePriceDiff';
