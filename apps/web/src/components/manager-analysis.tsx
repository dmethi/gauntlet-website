'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// Removed tabs - now using scrollable layout
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { ManagerAnalytics, ManagerProfile, PlayerOverlap } from '@/lib/manager-analytics';
import { colors, dataVizColors } from '../../../../brand/colors';

// TODO: When implementing real draft data, make manager names clickable links
// that navigate to individual manager analysis pages showing their full draft history,
// player performance, transaction grades, and season-over-season trends.
import {
  Users,
  TrendingUp,
  Target,
  Clock,
  BarChart3,
  GitMerge,
  AlertTriangle,
  Filter,
  Zap,
} from 'lucide-react';

interface ManagerAnalysisProps {
  analytics: ManagerAnalytics;
}

export const ManagerAnalysis: React.FC<ManagerAnalysisProps> = ({ analytics }) => {
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('concentration');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null
  );

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // Filter profiles by cluster
  const filteredProfiles = useMemo(() => {
    if (selectedCluster === 'all') return analytics.profiles;
    return analytics.profiles.filter(p => p.cluster.cluster_label === selectedCluster);
  }, [analytics.profiles, selectedCluster]);

  // Sort profiles
  const sortedProfiles = useMemo(() => {
    const sorted = [...filteredProfiles];

    if (sortConfig) {
      sorted.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case 'manager':
            aValue = a.manager || 'Unknown Manager';
            bValue = b.manager || 'Unknown Manager';
            break;
          case 'league':
            aValue = a.league || '';
            bValue = b.league || '';
            break;
          case 'gini':
            aValue = a.concentration.giniSpend;
            bValue = b.concentration.giniSpend;
            break;
          case 'top1':
            aValue = a.concentration.top1_share;
            bValue = b.concentration.top1_share;
            break;
          case 'top2':
            aValue = a.concentration.top2_share;
            bValue = b.concentration.top2_share;
            break;
          case 'top3':
            aValue = a.concentration.top3_share;
            bValue = b.concentration.top3_share;
            break;
          case 'top4':
            aValue = a.concentration.top4_share;
            bValue = b.concentration.top4_share;
            break;
          case 'top5':
            aValue = a.concentration.top5_share;
            bValue = b.concentration.top5_share;
            break;
          case 'player_name':
            aValue = (a as any).player_name || '';
            bValue = (b as any).player_name || '';
            break;
          case 'afc_price':
            aValue = (a as any).afc_price || 0;
            bValue = (b as any).afc_price || 0;
            break;
          case 'nfc_price':
            aValue = (a as any).nfc_price || 0;
            bValue = (b as any).nfc_price || 0;
            break;
          case 'price_diff':
            aValue = (a as any).price_diff || 0;
            bValue = (b as any).price_diff || 0;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
      });
    } else {
      // Default sort by concentration (Gini) descending
      sorted.sort((a, b) => b.concentration.giniSpend - a.concentration.giniSpend);
    }

    return sorted;
  }, [filteredProfiles, sortConfig]);

  // Color scale for heatmap values using brand colors
  const getHeatmapColor = (value: number, max: number, min: number) => {
    if (max === min) return dataVizColors.intensity[2]; // Light red if no variation

    const normalized = (value - min) / (max - min);
    const intensity = Math.max(0, Math.min(1, normalized));

    // Use brand sequential reds for better visibility
    const colorIndex = Math.floor(intensity * (dataVizColors.intensity.length - 1));
    return dataVizColors.intensity[colorIndex];
  };

  // RdYlGn diverging color scale for performance metrics
  const getRdYlGnColor = (value: number, max: number, min: number, reverse: boolean = false) => {
    if (max === min) return colors.rdylgn[5]; // Neutral yellow if no variation

    const normalized = (value - min) / (max - min);
    const intensity = reverse ? 1 - normalized : normalized;
    const colorIndex = Math.floor(intensity * (colors.rdylgn.length - 1));
    return colors.rdylgn[colorIndex];
  };

  // Get text color for contrast against RdYlGn backgrounds
  const getContrastTextColor = (backgroundColor: string) => {
    // Red and green colors need white text, yellow needs dark text
    if (
      backgroundColor === colors.rdylgn[0] ||
      backgroundColor === colors.rdylgn[1] ||
      backgroundColor === colors.rdylgn[2] ||
      backgroundColor === colors.rdylgn[8] ||
      backgroundColor === colors.rdylgn[9] ||
      backgroundColor === colors.rdylgn[10]
    ) {
      return 'white';
    }
    return 'inherit';
  };

  // Get cluster badge color
  const getClusterBadgeVariant = (clusterLabel: string) => {
    switch (clusterLabel) {
      case 'Stars & Scrubs':
        return 'destructive';
      case 'Balanced Build':
        return 'default';
      case 'Patience Sniper':
        return 'secondary';
      case 'Hero RB':
      case 'Ground & Pound':
        return 'outline';
      case 'WR Elite':
      case 'Receiver Corps':
        return 'outline';
      case 'Premium QB':
        return 'secondary';
      case 'TE Premium':
        return 'outline';
      case 'Early Bird':
        return 'destructive';
      case 'Depth Builder':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='text-center'>
        <h2 className='text-3xl font-bold mb-2'>Manager Behavior Profiles</h2>
        <p className='text-muted-foreground'>
          Comprehensive analysis of draft strategies, spending patterns, and roster construction
        </p>
      </div>

      {/* Build Types Overview - removed per request */}

      {/* Concentration Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Target className='h-5 w-5' />
            Concentration Metrics
          </CardTitle>
          <CardDescription>
            Spending concentration by manager - click headers to sort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className='cursor-pointer hover:bg-muted/50'
                    onClick={() => handleSort('manager')}
                  >
                    Manager{' '}
                    {sortConfig?.key === 'manager' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className='text-center cursor-pointer hover:bg-muted/50'
                    onClick={() => handleSort('league')}
                  >
                    League{' '}
                    {sortConfig?.key === 'league' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className='text-center cursor-pointer hover:bg-muted/50'
                    onClick={() => handleSort('gini')}
                  >
                    <InfoTooltip
                      title='Gini Coefficient'
                      description='Measures spending inequality. 0 = perfectly equal, 1 = maximum concentration'
                      interpretation='Higher values indicate more top-heavy spending (stars & scrubs approach)'
                    />
                    Gini{' '}
                    {sortConfig?.key === 'gini' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className='text-center cursor-pointer hover:bg-muted/50'
                    onClick={() => handleSort('top1')}
                  >
                    <InfoTooltip
                      title='Top Player %'
                      description='Percentage of budget spent on highest-priced player'
                      interpretation='Stars & Scrubs builds typically show 25%+ on top player'
                    />
                    Top 1%{' '}
                    {sortConfig?.key === 'top1' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className='text-center cursor-pointer hover:bg-muted/50'
                    onClick={() => handleSort('top2')}
                  >
                    <InfoTooltip
                      title='Top 2 Players %'
                      description='Percentage of budget spent on two highest-priced players'
                      interpretation='Elite duo approach typically shows 40%+ on top 2'
                    />
                    Top 2%{' '}
                    {sortConfig?.key === 'top2' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className='text-center cursor-pointer hover:bg-muted/50'
                    onClick={() => handleSort('top3')}
                  >
                    <InfoTooltip
                      title='Top 3 Players %'
                      description='Percentage of budget spent on three highest-priced players'
                      interpretation='Core trio strategy typically shows 55%+ on top 3'
                    />
                    Top 3%{' '}
                    {sortConfig?.key === 'top3' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className='text-center cursor-pointer hover:bg-muted/50'
                    onClick={() => handleSort('top4')}
                  >
                    <InfoTooltip
                      title='Top 4 Players %'
                      description='Percentage of budget spent on four highest-priced players'
                      interpretation='Balanced approach typically shows 60-70% on top 4'
                    />
                    Top 4%{' '}
                    {sortConfig?.key === 'top4' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className='text-center cursor-pointer hover:bg-muted/50'
                    onClick={() => handleSort('top5')}
                  >
                    <InfoTooltip
                      title='Top 5 Players %'
                      description='Percentage of budget spent on five highest-priced players'
                      interpretation='Shows how much remains for depth after core investments'
                    />
                    Top 5%{' '}
                    {sortConfig?.key === 'top5' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  // Calculate ranges for coloring each metric
                  const allGini = sortedProfiles.map(p => p.concentration.giniSpend);
                  const allTop1 = sortedProfiles.map(p => p.concentration.top1_share);
                  const allTop2 = sortedProfiles.map(p => p.concentration.top2_share);
                  const allTop3 = sortedProfiles.map(p => p.concentration.top3_share);
                  const allTop4 = sortedProfiles.map(p => p.concentration.top4_share);
                  const allTop5 = sortedProfiles.map(p => p.concentration.top5_share);

                  const maxGini = Math.max(...allGini);
                  const minGini = Math.min(...allGini);
                  const maxTop1 = Math.max(...allTop1);
                  const minTop1 = Math.min(...allTop1);
                  const maxTop2 = Math.max(...allTop2);
                  const minTop2 = Math.min(...allTop2);
                  const maxTop3 = Math.max(...allTop3);
                  const minTop3 = Math.min(...allTop3);
                  const maxTop4 = Math.max(...allTop4);
                  const minTop4 = Math.min(...allTop4);
                  const maxTop5 = Math.max(...allTop5);
                  const minTop5 = Math.min(...allTop5);

                  return sortedProfiles.slice(0, 100).map((profile, index) => (
                    <TableRow
                      key={`concentration-${profile.manager || 'mgr'}-${profile.league || 'lg'}-${index}`}
                    >
                      <TableCell className='font-medium'>
                        {profile.manager || 'Unknown Manager'}
                      </TableCell>
                      <TableCell className='text-center text-sm'>{profile.league}</TableCell>

                      {/* Gini */}
                      <TableCell
                        className='text-center'
                        style={{
                          backgroundColor: getHeatmapColor(
                            profile.concentration.giniSpend,
                            maxGini,
                            minGini
                          ),
                        }}
                      >
                        {profile.concentration.giniSpend.toFixed(3)}
                      </TableCell>

                      {/* Top 1% */}
                      <TableCell
                        className='text-center'
                        style={{
                          backgroundColor: getHeatmapColor(
                            profile.concentration.top1_share,
                            maxTop1,
                            minTop1
                          ),
                        }}
                      >
                        {(profile.concentration.top1_share * 100).toFixed(1)}%
                      </TableCell>

                      {/* Top 2% */}
                      <TableCell
                        className='text-center'
                        style={{
                          backgroundColor: getHeatmapColor(
                            profile.concentration.top2_share,
                            maxTop2,
                            minTop2
                          ),
                        }}
                      >
                        {(profile.concentration.top2_share * 100).toFixed(1)}%
                      </TableCell>

                      {/* Top 3% */}
                      <TableCell
                        className='text-center'
                        style={{
                          backgroundColor: getHeatmapColor(
                            profile.concentration.top3_share,
                            maxTop3,
                            minTop3
                          ),
                        }}
                      >
                        {(profile.concentration.top3_share * 100).toFixed(1)}%
                      </TableCell>

                      {/* Top 4% */}
                      <TableCell
                        className='text-center'
                        style={{
                          backgroundColor: getHeatmapColor(
                            profile.concentration.top4_share,
                            maxTop4,
                            minTop4
                          ),
                        }}
                      >
                        {(profile.concentration.top4_share * 100).toFixed(1)}%
                      </TableCell>

                      {/* Top 5% */}
                      <TableCell
                        className='text-center'
                        style={{
                          backgroundColor: getHeatmapColor(
                            profile.concentration.top5_share,
                            maxTop5,
                            minTop5
                          ),
                        }}
                      >
                        {(profile.concentration.top5_share * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Player Overlap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <GitMerge className='h-5 w-5' />
            Player Overlap Analysis
          </CardTitle>
          <CardDescription>
            Cross-league player selection patterns and manager similarity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Copycat Pairs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {analytics.player_overlap_analytics.copycat_pairs.length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Manager pairs with 40%+ shared players
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Average Overlap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {analytics.player_overlap_analytics.avg_overlap_percentage.toFixed(1)}%
                </div>
                <p className='text-xs text-muted-foreground'>Mean player overlap between leagues</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Maverick Managers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {analytics.player_overlap_analytics.maverick_managers.length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Managers with &lt;20% player overlap
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Copycat Pairs */}
          {analytics.player_overlap_analytics.copycat_pairs.length > 0 && (
            <div className='mb-6'>
              <h4 className='font-medium mb-3'>High Overlap Pairs (40%+ shared players)</h4>
              <div className='grid gap-2'>
                {analytics.player_overlap_analytics.copycat_pairs
                  .slice(0, 5)
                  .map((pair: any, idx: number) => (
                    <div
                      key={`pair-${pair.manager_a || 'A'}-${pair.manager_b || 'B'}-${idx}`}
                      className='flex justify-between items-center p-3 rounded border'
                    >
                      <div>
                        <span className='font-medium'>{pair.manager_a}</span>
                        <span className='mx-2 text-muted-foreground'>↔</span>
                        <span className='font-medium'>{pair.manager_b}</span>
                      </div>
                      <Badge variant='secondary'>
                        {pair.overlap_percentage.toFixed(1)}% overlap
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Maverick Managers */}
          {analytics.player_overlap_analytics.maverick_managers.length > 0 && (
            <div>
              <h4 className='font-medium mb-3'>Maverick Managers (&lt;20% overlap)</h4>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                {analytics.player_overlap_analytics.maverick_managers.map(
                  (manager: any, idx: number) => (
                    <div
                      key={`maverick-${manager.manager || 'mgr'}-${idx}`}
                      className='p-3 rounded border text-center'
                    >
                      <div className='font-medium'>{manager.manager}</div>
                      <div className='text-sm text-muted-foreground'>{manager.league}</div>
                      <Badge variant='outline' className='mt-1'>
                        {manager.avg_overlap_with_others.toFixed(1)}% avg
                      </Badge>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Overlap by Count */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Player Overlap by Count
          </CardTitle>
          <CardDescription>
            Manager pairs grouped by exact number of shared players (cross-league only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            // Group overlaps by exact shared player count
            const overlapsByCount: { [count: number]: PlayerOverlap[] } = {};

            analytics.player_overlap_analytics.top_overlaps.forEach((overlap: any) => {
              const sharedCount = overlap.shared_players.length;
              if (sharedCount >= 2) {
                // Only show 2+ overlaps
                if (!overlapsByCount[sharedCount]) {
                  overlapsByCount[sharedCount] = [];
                }
                overlapsByCount[sharedCount].push(overlap);
              }
            });

            // Get counts in descending order
            const sortedCounts = Object.keys(overlapsByCount)
              .map(Number)
              .sort((a, b) => b - a);

            if (sortedCounts.length === 0) {
              return (
                <div className='text-center py-8 text-muted-foreground'>
                  No manager pairs with 2+ shared players found
                </div>
              );
            }

            return (
              <div className='space-y-6'>
                {sortedCounts.map(count => (
                  <div key={count}>
                    <h4 className='font-medium mb-3 flex items-center gap-2'>
                      <Badge variant='secondary'>{count} Players</Badge>
                      <span className='text-sm text-muted-foreground'>
                        ({overlapsByCount[count].length} pair
                        {overlapsByCount[count].length !== 1 ? 's' : ''})
                      </span>
                    </h4>
                    <div className='grid gap-3'>
                      {overlapsByCount[count].map((overlap: any, idx: number) => (
                        <div
                          key={`overlap-${count}-${idx}`}
                          className='p-4 rounded border bg-muted/20'
                        >
                          <div className='flex justify-between items-start mb-2'>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium'>{overlap.manager_a}</span>
                              <Badge variant='outline' className='text-xs'>
                                AFC
                              </Badge>
                              <span className='text-muted-foreground'>↔</span>
                              <span className='font-medium'>{overlap.manager_b}</span>
                              <Badge variant='outline' className='text-xs'>
                                NFC
                              </Badge>
                            </div>
                            <Badge variant='secondary'>
                              {overlap.overlap_percentage.toFixed(1)}% total overlap
                            </Badge>
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            <strong>Shared players:</strong>{' '}
                            {overlap.shared_player_names.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Cross-League Price Differences */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Cross-League Price Differences
          </CardTitle>
          <CardDescription>
            All drafted players with price comparison and draft pick numbers. Cross-league players
            show price differences with RdYlGn background.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            // Get ALL players drafted in both leagues from player_level_analytics
            // Each player should only appear once since they can only be drafted in one league
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
                afc_nomination_order: player.nom_index.LEAGUE_A,
                nfc_nomination_order: player.nom_index.LEAGUE_B,
                price_gap: player.price_gap || 0,
                price_gap_abs: player.price_gap_abs || 0,
                tier_shift: player.tier_shift || 0,
                only_in_one_league: player.only_in_one_league,
              }));

            // Separate into cross-league players (drafted in both) and single-league players
            const crossLeaguePlayers = allDraftedPlayers.filter(
              player =>
                player.afc_price !== null && player.nfc_price !== null && !player.only_in_one_league
            );

            const singleLeaguePlayers = allDraftedPlayers.filter(
              player => player.only_in_one_league
            );

            // Calculate differences for cross-league players
            const crossLeagueWithDiffs = crossLeaguePlayers.map(player => ({
              ...player,
              price_diff_abs: Math.abs((player.afc_price || 0) - (player.nfc_price || 0)),
              higher_in: (player.afc_price || 0) > (player.nfc_price || 0) ? 'AFC' : 'NFC',
              higher_price: Math.max(player.afc_price || 0, player.nfc_price || 0),
              lower_price: Math.min(player.afc_price || 0, player.nfc_price || 0),
              pick_diff: (player.afc_pick_number || 0) - (player.nfc_pick_number || 0),
              nom_diff: (player.afc_nomination_order || 0) - (player.nfc_nomination_order || 0),
              is_cross_league: true,
            }));

            // Add single-league players with null values for missing league
            const singleLeagueWithDiffs = singleLeaguePlayers.map(player => ({
              ...player,
              price_diff_abs: 0,
              higher_in: player.afc_price !== null ? 'AFC' : 'NFC',
              higher_price: player.afc_price || player.nfc_price || 0,
              lower_price: 0,
              pick_diff: 0,
              nom_diff: 0,
              is_cross_league: false,
            }));

            // Combine all players
            const allPlayersWithDiffs = [...crossLeagueWithDiffs, ...singleLeagueWithDiffs];

            // Apply sorting based on sortConfig
            let sortedPlayers = [...allPlayersWithDiffs];
            if (sortConfig) {
              sortedPlayers.sort((a, b) => {
                let aValue: any;
                let bValue: any;

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
                  return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                }
              });
            } else {
              // Default sort: cross-league players first by absolute price difference, then single-league
              sortedPlayers.sort((a, b) => {
                if (a.is_cross_league && !b.is_cross_league) return -1;
                if (!a.is_cross_league && b.is_cross_league) return 1;
                if (a.is_cross_league && b.is_cross_league) {
                  return (b.price_diff_abs || 0) - (a.price_diff_abs || 0);
                }
                return (b.afc_price || b.nfc_price || 0) - (a.afc_price || a.nfc_price || 0);
              });
            }

            const playersWithDiffs = sortedPlayers;

            if (playersWithDiffs.length === 0) {
              return (
                <div className='text-center py-8 text-muted-foreground'>
                  No players found drafted in both leagues
                </div>
              );
            }

            return (
              <div className='border rounded-lg'>
                <div className='max-h-96 overflow-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className='cursor-pointer hover:bg-muted/50'
                          onClick={() => handleSort('player_name')}
                        >
                          Player{' '}
                          {sortConfig?.key === 'player_name' &&
                            (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className='text-center'>Pos</TableHead>
                        <TableHead
                          className='text-center cursor-pointer hover:bg-muted/50'
                          onClick={() => handleSort('afc_price')}
                        >
                          AFC Price{' '}
                          {sortConfig?.key === 'afc_price' &&
                            (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className='text-center cursor-pointer hover:bg-muted/50'
                          onClick={() => handleSort('nfc_price')}
                        >
                          NFC Price{' '}
                          {sortConfig?.key === 'nfc_price' &&
                            (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className='text-center cursor-pointer hover:bg-muted/50'
                          onClick={() => handleSort('price_diff')}
                        >
                          Price Gap{' '}
                          {sortConfig?.key === 'price_diff' &&
                            (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className='text-center'>Higher In</TableHead>
                        <TableHead className='text-center'>AFC Pick #</TableHead>
                        <TableHead className='text-center'>NFC Pick #</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        // Calculate heatmap color ranges for price differences (absolute values)
                        const allPriceDiffs = playersWithDiffs
                          .filter(p => p.is_cross_league)
                          .map(p => p.price_diff_abs);
                        const maxDiff = Math.max(...allPriceDiffs, 0);
                        const minDiff = Math.min(...allPriceDiffs, 0);

                        const getHeatmapColor = (value: number, max: number, min: number) => {
                          if (max === min) return 'transparent';
                          const intensity = (value - min) / (max - min);
                          // Use red intensity for larger differences
                          const opacity = 0.1 + intensity * 0.4; // 0.1 to 0.5 opacity
                          return `rgba(239, 68, 68, ${opacity})`; // red with variable opacity
                        };

                        return playersWithDiffs.slice(0, 100).map((player, index) => (
                          <TableRow key={`price-diff-${player.player_id}-${index}`}>
                            <TableCell className='font-medium'>{player.player_name}</TableCell>
                            <TableCell className='text-center'>
                              <Badge variant='outline' className='text-xs'>
                                {player.position}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-center'>
                              {player.afc_price !== null ? `$${player.afc_price}` : '-'}
                            </TableCell>
                            <TableCell className='text-center'>
                              {player.nfc_price !== null ? `$${player.nfc_price}` : '-'}
                            </TableCell>
                            <TableCell
                              className='text-center font-medium'
                              style={{
                                backgroundColor: player.is_cross_league
                                  ? getHeatmapColor(player.price_diff_abs, maxDiff, minDiff)
                                  : 'transparent',
                              }}
                            >
                              {player.is_cross_league ? `$${player.price_diff_abs}` : '-'}
                            </TableCell>
                            <TableCell className='text-center'>
                              {player.is_cross_league ? (
                                <Badge
                                  variant={player.higher_in === 'AFC' ? 'destructive' : 'secondary'}
                                  className='text-xs'
                                >
                                  {player.higher_in}
                                </Badge>
                              ) : (
                                <Badge variant='outline' className='text-xs'>
                                  {player.higher_in}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className='text-center text-sm'>
                              {player.afc_pick_number || '-'}
                            </TableCell>
                            <TableCell className='text-center text-sm'>
                              {player.nfc_pick_number || '-'}
                            </TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Positional Allocation Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 justify-between'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Positional Allocation Heatmap
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='concentration'>Sort by Concentration</SelectItem>
                <SelectItem value='patience'>Sort by Patience</SelectItem>
                <SelectItem value='starters'>Sort by Starter %</SelectItem>
                <SelectItem value='top1'>Sort by Top Player %</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
          <CardDescription>
            Budget allocation by position, compared to league averages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  <TableHead className='text-center'>League</TableHead>
                  <TableHead className='text-center'>
                    <InfoTooltip
                      title='Quarterback %'
                      description='Percentage of budget spent on QB position'
                      interpretation='Elite QB approach typically shows 12%+ allocation'
                    />
                    QB %
                  </TableHead>
                  <TableHead className='text-center'>
                    <InfoTooltip
                      title='Running Back %'
                      description='Percentage of budget spent on RB position'
                      interpretation='RB-heavy builds typically show 35%+ allocation'
                    />
                    RB %
                  </TableHead>
                  <TableHead className='text-center'>
                    <InfoTooltip
                      title='Wide Receiver %'
                      description='Percentage of budget spent on WR position'
                      interpretation='WR-focused builds typically show 40%+ allocation'
                    />
                    WR %
                  </TableHead>
                  <TableHead className='text-center'>
                    <InfoTooltip
                      title='Tight End %'
                      description='Percentage of budget spent on TE position'
                      interpretation='Premium TE builds typically show 8%+ allocation'
                    />
                    TE %
                  </TableHead>
                  <TableHead className='text-center'>
                    <InfoTooltip
                      title='Defense %'
                      description='Percentage of budget spent on DEF position'
                      interpretation='Typically minimal allocation (1-2%)'
                    />
                    DEF %
                  </TableHead>
                  <TableHead className='text-center'>
                    <InfoTooltip
                      title='Starter Allocation %'
                      description='Percentage of budget spent on starting lineup vs bench'
                      interpretation='Star-focused builds allocate 75%+ to starters'
                    />
                    Starters %
                  </TableHead>
                  <TableHead className='text-center'>
                    <InfoTooltip
                      title='Patience Score'
                      description='Measures draft timing strategy (0-1 scale)'
                      interpretation='Higher scores indicate more patient, value-hunting approach'
                    />
                    Patience
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProfiles.slice(0, 100).map((profile, index) => {
                  // Calculate league-wide ranges for each position for coloring
                  const allQB = sortedProfiles.map(p => p.spend_shares.pctQB || 0);
                  const allRB = sortedProfiles.map(p => p.spend_shares.pctRB || 0);
                  const allWR = sortedProfiles.map(p => p.spend_shares.pctWR || 0);
                  const allTE = sortedProfiles.map(p => p.spend_shares.pctTE || 0);
                  const allDEF = sortedProfiles.map(p => p.spend_shares.pctDEF || 0);
                  const allStarters = sortedProfiles.map(p => p.spend_shares.pctStarters);
                  const allPatience = sortedProfiles.map(p => p.pacing.patience_score);

                  return (
                    <TableRow
                      key={`alloc-${profile.manager || 'mgr'}-${profile.league || 'lg'}-${index}`}
                    >
                      <TableCell className='font-medium'>
                        {profile.manager || 'Unknown Manager'}
                      </TableCell>
                      <TableCell>{profile.league}</TableCell>

                      {/* QB allocation */}
                      <TableCell
                        className='text-center'
                        style={{
                          backgroundColor: getHeatmapColor(
                            profile.spend_shares.pctQB || 0,
                            Math.max(...allQB),
                            Math.min(...allQB)
                          ),
                        }}
                      >
                        {((profile.spend_shares.pctQB || 0) * 100).toFixed(1)}%
                      </TableCell>

                      {/* RB allocation */}
                      <TableCell
                        className='text-center'
                        style={{
                          backgroundColor: getHeatmapColor(
                            profile.spend_shares.pctRB || 0,
                            Math.max(...allRB),
                            Math.min(...allRB)
                          ),
                        }}
                      >
                        {((profile.spend_shares.pctRB || 0) * 100).toFixed(1)}%
                      </TableCell>

                      {/* WR allocation */}
                      <TableCell
                        className='text-center'
                        style={{
                          backgroundColor: getHeatmapColor(
                            profile.spend_shares.pctWR || 0,
                            Math.max(...allWR),
                            Math.min(...allWR)
                          ),
                        }}
                      >
                        {((profile.spend_shares.pctWR || 0) * 100).toFixed(1)}%
                      </TableCell>

                      {/* TE allocation */}
                      <TableCell
                        className='text-center'
                        style={{
                          backgroundColor: getHeatmapColor(
                            profile.spend_shares.pctTE || 0,
                            Math.max(...allTE),
                            Math.min(...allTE)
                          ),
                        }}
                      >
                        {((profile.spend_shares.pctTE || 0) * 100).toFixed(1)}%
                      </TableCell>

                      {/* DEF allocation */}
                      <TableCell
                        className='text-center'
                        style={{
                          backgroundColor: getHeatmapColor(
                            profile.spend_shares.pctDEF || 0,
                            Math.max(...allDEF),
                            Math.min(...allDEF)
                          ),
                        }}
                      >
                        {((profile.spend_shares.pctDEF || 0) * 100).toFixed(1)}%
                      </TableCell>

                      {/* Starters % */}
                      <TableCell
                        className='text-center'
                        style={{
                          backgroundColor: getHeatmapColor(
                            profile.spend_shares.pctStarters,
                            Math.max(...allStarters),
                            Math.min(...allStarters)
                          ),
                        }}
                      >
                        {(profile.spend_shares.pctStarters * 100).toFixed(1)}%
                      </TableCell>

                      {/* Patience score */}
                      <TableCell
                        className='text-center'
                        style={{
                          backgroundColor: getHeatmapColor(
                            profile.pacing.patience_score,
                            Math.max(...allPatience),
                            Math.min(...allPatience)
                          ),
                        }}
                      >
                        {profile.pacing.patience_score.toFixed(3)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='h-5 w-5' />
            Detailed Performance Metrics
          </CardTitle>
          <CardDescription>
            Advanced analytics on spending concentration, timing, and roster construction
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Concentration Metrics */}
          <div>
            <h4 className='font-medium mb-3 flex items-center gap-2'>
              <Target className='h-4 w-4' />
              Spending Concentration Analysis
            </h4>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Manager</TableHead>
                    <TableHead>
                      <InfoTooltip
                        title='Build Type'
                        description='Strategic archetype based on spending patterns'
                        interpretation='Different approaches to roster construction'
                      />
                      Build Type
                    </TableHead>
                    <TableHead className='text-center'>
                      <InfoTooltip
                        title='Gini Coefficient'
                        description='Statistical measure of spending inequality (0-1 scale)'
                        interpretation='0 = perfectly equal, 1 = maximum concentration. Stars & Scrubs builds show 0.4+'
                      />
                      Gini
                    </TableHead>
                    <TableHead className='text-center'>
                      <InfoTooltip
                        title='Top 2 Players %'
                        description='Percentage of budget spent on top 2 players'
                        interpretation='Higher concentration indicates elite duo approach'
                      />
                      Top 2%
                    </TableHead>
                    <TableHead className='text-center'>
                      <InfoTooltip
                        title='Starter Investment %'
                        description='Percentage of total budget allocated to starting lineup'
                        interpretation='Star-focused builds typically allocate 75%+ to starters'
                      />
                      Starters %
                    </TableHead>
                    <TableHead className='text-center'>
                      <InfoTooltip
                        title='Last Starter Pick'
                        description='Draft position of final starting lineup player acquired'
                        interpretation='Lower numbers suggest early roster completion; higher suggest late bargain hunting'
                      />
                      Last Starter
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProfiles.slice(0, 100).map((profile, index) => {
                    // Calculate ranges for RdYlGn coloring
                    const allGini = sortedProfiles.map(p => p.concentration.giniSpend);
                    const allTop2 = sortedProfiles.map(p => p.concentration.top2_share);
                    const allStarters = sortedProfiles.map(p => p.spend_shares.pctStarters);
                    const allLastStarter = sortedProfiles.map(p => p.pacing.last_starter_index);

                    return (
                      <TableRow
                        key={`conc-${profile.manager || 'mgr'}-${profile.league || 'lg'}-${index}`}
                      >
                        <TableCell className='font-medium'>
                          {profile.manager || 'Unknown Manager'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getClusterBadgeVariant(profile.cluster.cluster_label)}>
                            {profile.cluster.cluster_label}
                          </Badge>
                        </TableCell>

                        {/* Gini - heatmap style */}
                        <TableCell
                          className='text-center'
                          style={{
                            backgroundColor: getHeatmapColor(
                              profile.concentration.giniSpend,
                              Math.max(...allGini),
                              Math.min(...allGini)
                            ),
                          }}
                        >
                          {profile.concentration.giniSpend.toFixed(3)}
                        </TableCell>

                        {/* Top 2% - heatmap style */}
                        <TableCell
                          className='text-center'
                          style={{
                            backgroundColor: getHeatmapColor(
                              profile.concentration.top2_share,
                              Math.max(...allTop2),
                              Math.min(...allTop2)
                            ),
                          }}
                        >
                          {(profile.concentration.top2_share * 100).toFixed(1)}%
                        </TableCell>

                        {/* Starters % - heatmap style */}
                        <TableCell
                          className='text-center'
                          style={{
                            backgroundColor: getHeatmapColor(
                              profile.spend_shares.pctStarters,
                              Math.max(...allStarters),
                              Math.min(...allStarters)
                            ),
                          }}
                        >
                          {(profile.spend_shares.pctStarters * 100).toFixed(1)}%
                        </TableCell>

                        {/* Last Starter - heatmap style */}
                        <TableCell
                          className='text-center'
                          style={{
                            backgroundColor: getHeatmapColor(
                              profile.pacing.last_starter_index,
                              Math.max(...allLastStarter),
                              Math.min(...allLastStarter)
                            ),
                          }}
                        >
                          #{profile.pacing.last_starter_index}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Draft Timing Analysis */}
          <div>
            <h4 className='font-medium mb-3 flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              Draft Timing & Patience Analysis
            </h4>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Manager</TableHead>
                    <TableHead>League</TableHead>
                    <TableHead className='text-center'>
                      <InfoTooltip
                        title='Picks 1-30 Spend %'
                        description='Percentage of budget spent in first 30 draft picks'
                        interpretation='Early aggressive spending indicates star-chasing approach'
                      />
                      Picks 1-30
                    </TableHead>
                    <TableHead className='text-center'>
                      <InfoTooltip
                        title='Picks 31-60 Spend %'
                        description='Percentage of budget spent in picks 31-60'
                        interpretation='Balanced mid-draft investment'
                      />
                      Picks 31-60
                    </TableHead>
                    <TableHead className='text-center'>
                      <InfoTooltip
                        title='Picks 61-120 Spend %'
                        description='Percentage of budget spent in picks 61-120'
                        interpretation='Late-round value hunting and depth building'
                      />
                      Picks 61-120
                    </TableHead>
                    <TableHead className='text-center'>
                      <InfoTooltip
                        title='Picks 121+ Spend %'
                        description='Percentage of budget spent in final draft rounds'
                        interpretation='Patient bargain hunting in deep draft positions'
                      />
                      Picks 121+
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...sortedProfiles]
                    .sort((a, b) => {
                      // Sort by early spending (picks 1-30) descending to show most aggressive first
                      const getPickRangeSpend = (
                        profile: ManagerProfile,
                        minPick: number,
                        maxPick: number
                      ) => {
                        // This is a mock calculation since we don't have actual pick positions
                        // In real implementation, this would calculate based on actual draft position
                        if (minPick === 1 && maxPick === 30) return profile.pacing.patienceQ1; // Early picks
                        if (minPick === 31 && maxPick === 60) return profile.pacing.patienceQ2;
                        if (minPick === 61 && maxPick === 120) return profile.pacing.patienceQ3;
                        return profile.pacing.patienceQ4; // Late picks
                      };
                      return getPickRangeSpend(b, 1, 30) - getPickRangeSpend(a, 1, 30);
                    })
                    .map((profile, index) => {
                      // Mock pick range calculations (in real implementation, calculate from actual draft positions)
                      const picks1_30 = profile.pacing.patienceQ1; // Early aggressive spending
                      const picks31_60 = profile.pacing.patienceQ2;
                      const picks61_120 = profile.pacing.patienceQ3;
                      const picks121_plus = profile.pacing.patienceQ4; // Late value hunting

                      // Calculate ranges for coloring
                      const allPicks1_30 = analytics.profiles.map(p => p.pacing.patienceQ1);
                      const allPicks31_60 = analytics.profiles.map(p => p.pacing.patienceQ2);
                      const allPicks61_120 = analytics.profiles.map(p => p.pacing.patienceQ3);
                      const allPicks121_plus = analytics.profiles.map(p => p.pacing.patienceQ4);

                      return (
                        <TableRow
                          key={`pacing-${profile.manager || 'mgr'}-${profile.league || 'lg'}-${index}`}
                        >
                          <TableCell className='font-medium'>
                            {profile.manager || 'Unknown Manager'}
                          </TableCell>
                          <TableCell>{profile.league}</TableCell>

                          {/* Picks 1-30 - heatmap style */}
                          <TableCell
                            className='text-center'
                            style={{
                              backgroundColor: getHeatmapColor(
                                picks1_30,
                                Math.max(...allPicks1_30),
                                Math.min(...allPicks1_30)
                              ),
                            }}
                          >
                            {(picks1_30 * 100).toFixed(1)}%
                          </TableCell>

                          {/* Picks 31-60 - heatmap style */}
                          <TableCell
                            className='text-center'
                            style={{
                              backgroundColor: getHeatmapColor(
                                picks31_60,
                                Math.max(...allPicks31_60),
                                Math.min(...allPicks31_60)
                              ),
                            }}
                          >
                            {(picks31_60 * 100).toFixed(1)}%
                          </TableCell>

                          {/* Picks 61-120 - heatmap style */}
                          <TableCell
                            className='text-center'
                            style={{
                              backgroundColor: getHeatmapColor(
                                picks61_120,
                                Math.max(...allPicks61_120),
                                Math.min(...allPicks61_120)
                              ),
                            }}
                          >
                            {(picks61_120 * 100).toFixed(1)}%
                          </TableCell>

                          {/* Picks 121+ - heatmap style */}
                          <TableCell
                            className='text-center'
                            style={{
                              backgroundColor: getHeatmapColor(
                                picks121_plus,
                                Math.max(...allPicks121_plus),
                                Math.min(...allPicks121_plus)
                              ),
                            }}
                          >
                            {(picks121_plus * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
