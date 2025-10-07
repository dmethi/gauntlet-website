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
import { TrendingUp } from 'lucide-react';
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
        <Card>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cross-League Price Differences
          </CardTitle>
          <CardDescription>
            All drafted players with price comparison and draft pick numbers. Cross-league players
            show price differences with heatmap background.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <div className="max-h-96 overflow-auto">
              <Table>
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
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
);

CrossLeaguePriceDiff.displayName = 'CrossLeaguePriceDiff';
