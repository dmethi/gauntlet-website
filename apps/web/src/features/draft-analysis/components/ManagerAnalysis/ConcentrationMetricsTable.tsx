'use client';

import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Target } from 'lucide-react';
import { getContrastingTextColor, getHeatmapColor } from './utils';
import type { ManagerProfile } from '@/features/draft-analysis/types';
import type { SortConfig } from '@/features/draft-analysis/hooks';

interface ConcentrationMetricsTableProps {
  profiles: ManagerProfile[];
  sortConfig: SortConfig | null;
  onSort: (_key: string) => void;
}

export const ConcentrationMetricsTable = memo<ConcentrationMetricsTableProps>(
  ({ profiles, sortConfig, onSort }) => {
    // Calculate ranges for coloring each metric
    const allGini = profiles.map(p => p.concentration.giniSpend);
    const allTop1 = profiles.map(p => p.concentration.top1_share);
    const allTop2 = profiles.map(p => p.concentration.top2_share);
    const allTop3 = profiles.map(p => p.concentration.top3_share);
    const allTop4 = profiles.map(p => p.concentration.top4_share);
    const allTop5 = profiles.map(p => p.concentration.top5_share);

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

    const getSortIcon = (key: string): string => {
      if (sortConfig?.key !== key) return '';
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Concentration Metrics
          </CardTitle>
          <CardDescription>
            Spending concentration by manager - click headers to sort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('manager')}
                  >
                    Manager {getSortIcon('manager')}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('league')}
                  >
                    League {getSortIcon('league')}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('gini')}
                  >
                    <InfoTooltip
                      title="Gini Coefficient"
                      description="Measures spending inequality. 0 = perfectly equal, 1 = maximum concentration"
                      interpretation="Higher values indicate more top-heavy spending (stars & scrubs approach)"
                    />
                    Gini {getSortIcon('gini')}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('top1')}
                  >
                    <InfoTooltip
                      title="Top Player %"
                      description="Percentage of budget spent on highest-priced player"
                      interpretation="Stars & Scrubs builds typically show 25%+ on top player"
                    />
                    Top 1% {getSortIcon('top1')}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('top2')}
                  >
                    <InfoTooltip
                      title="Top 2 Players %"
                      description="Percentage of budget spent on two highest-priced players"
                      interpretation="Elite duo approach typically shows 40%+ on top 2"
                    />
                    Top 2% {getSortIcon('top2')}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('top3')}
                  >
                    <InfoTooltip
                      title="Top 3 Players %"
                      description="Percentage of budget spent on three highest-priced players"
                      interpretation="Core trio strategy typically shows 55%+ on top 3"
                    />
                    Top 3% {getSortIcon('top3')}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('top4')}
                  >
                    <InfoTooltip
                      title="Top 4 Players %"
                      description="Percentage of budget spent on four highest-priced players"
                      interpretation="Balanced approach typically shows 60-70% on top 4"
                    />
                    Top 4% {getSortIcon('top4')}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('top5')}
                  >
                    <InfoTooltip
                      title="Top 5 Players %"
                      description="Percentage of budget spent on five highest-priced players"
                      interpretation="Shows how much remains for depth after core investments"
                    />
                    Top 5% {getSortIcon('top5')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.slice(0, 100).map((profile, index) => (
                  <TableRow
                    key={`concentration-${profile.manager || 'mgr'}-${profile.league || 'lg'}-${index}`}
                  >
                    <TableCell className="font-medium">
                      {profile.manager || 'Unknown Manager'}
                    </TableCell>
                    <TableCell className="text-center text-sm">{profile.league}</TableCell>

                    {/* Gini */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(profile.concentration.giniSpend, maxGini, minGini),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.concentration.giniSpend,
                          maxGini,
                          minGini,
                        ),
                      }}
                    >
                      {profile.concentration.giniSpend.toFixed(3)}
                    </TableCell>

                    {/* Top 1% */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(profile.concentration.top1_share, maxTop1, minTop1),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.concentration.top1_share,
                          maxTop1,
                          minTop1,
                        ),
                      }}
                    >
                      {(profile.concentration.top1_share * 100).toFixed(1)}%
                    </TableCell>

                    {/* Top 2% */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(profile.concentration.top2_share, maxTop2, minTop2),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.concentration.top2_share,
                          maxTop2,
                          minTop2,
                        ),
                      }}
                    >
                      {(profile.concentration.top2_share * 100).toFixed(1)}%
                    </TableCell>

                    {/* Top 3% */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(profile.concentration.top3_share, maxTop3, minTop3),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.concentration.top3_share,
                          maxTop3,
                          minTop3,
                        ),
                      }}
                    >
                      {(profile.concentration.top3_share * 100).toFixed(1)}%
                    </TableCell>

                    {/* Top 4% */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(profile.concentration.top4_share, maxTop4, minTop4),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.concentration.top4_share,
                          maxTop4,
                          minTop4,
                        ),
                      }}
                    >
                      {(profile.concentration.top4_share * 100).toFixed(1)}%
                    </TableCell>

                    {/* Top 5% */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(profile.concentration.top5_share, maxTop5, minTop5),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.concentration.top5_share,
                          maxTop5,
                          minTop5,
                        ),
                      }}
                    >
                      {(profile.concentration.top5_share * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  },
);

ConcentrationMetricsTable.displayName = 'ConcentrationMetricsTable';
