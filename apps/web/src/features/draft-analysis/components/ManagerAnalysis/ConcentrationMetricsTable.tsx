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
import { ArrowUpDown, ChevronDown, Target } from 'lucide-react';
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
      <Card mobileFlat>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Concentration Metrics
          </CardTitle>
          <CardDescription>
            Spending concentration by manager - click headers to sort
          </CardDescription>
          <div className="grid grid-cols-[1fr_44px] gap-2 pt-3 sm:hidden">
            <Select value={sortConfig?.key ?? 'gini'} onValueChange={onSort}>
              <SelectTrigger className="h-11" aria-label="Sort concentration metrics">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gini">Sort: Gini</SelectItem>
                <SelectItem value="top1">Sort: Top 1</SelectItem>
                <SelectItem value="top2">Sort: Top 2</SelectItem>
                <SelectItem value="top3">Sort: Top 3</SelectItem>
                <SelectItem value="top4">Sort: Top 4</SelectItem>
                <SelectItem value="top5">Sort: Top 5</SelectItem>
                <SelectItem value="manager">Sort: Manager</SelectItem>
                <SelectItem value="league">Sort: League</SelectItem>
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => onSort(sortConfig?.key ?? 'gini')}
              aria-label="Reverse concentration sort order"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-input hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <DataList className="sm:hidden">
            {profiles.slice(0, 100).map((profile, index) => (
              <DataListItem
                key={`concentration-mobile-${profile.manager || 'mgr'}-${profile.league || 'lg'}-${index}`}
              >
                <DataListHeader>
                  <div className="min-w-0">
                    <DataListTitle className="truncate">
                      {profile.manager || 'Unknown Manager'}
                    </DataListTitle>
                    <DataListDescription>{profile.league}</DataListDescription>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-base font-semibold">
                      {profile.concentration.giniSpend.toFixed(3)}
                    </div>
                    <div className="text-xs text-muted-foreground">Gini</div>
                  </div>
                </DataListHeader>
                <details className="group mt-2">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                    <span>More concentration metrics</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <DataListMetrics className="mt-1 grid-cols-2">
                    {[
                      ['Top 1', profile.concentration.top1_share],
                      ['Top 2', profile.concentration.top2_share],
                      ['Top 3', profile.concentration.top3_share],
                      ['Top 4', profile.concentration.top4_share],
                      ['Top 5', profile.concentration.top5_share],
                    ].map(([label, value]) => (
                      <DataListMetric key={label as string}>
                        <DataListMetricLabel className="text-xs">{label}</DataListMetricLabel>
                        <DataListMetricValue>
                          {((value as number) * 100).toFixed(1)}%
                        </DataListMetricValue>
                      </DataListMetric>
                    ))}
                  </DataListMetrics>
                </details>
              </DataListItem>
            ))}
          </DataList>

          <Table
            surface="responsive"
            scrollLabel="Manager concentration metrics table"
            containerClassName="hidden sm:block"
          >
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
        </CardContent>
      </Card>
    );
  },
);

ConcentrationMetricsTable.displayName = 'ConcentrationMetricsTable';
