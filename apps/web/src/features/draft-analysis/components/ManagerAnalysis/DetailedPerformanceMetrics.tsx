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
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { BarChart3, Target } from 'lucide-react';
import { getClusterBadgeVariant, getContrastingTextColor, getHeatmapColor } from './utils';
import type { ManagerProfile } from '@/features/draft-analysis/types';

interface DetailedPerformanceMetricsProps {
  profiles: ManagerProfile[];
}

export const DetailedPerformanceMetrics = memo<DetailedPerformanceMetricsProps>(({ profiles }) => {
  const ranges = useMemo(
    () => ({
      allGini: profiles.map(p => p.concentration.giniSpend),
      allTop2: profiles.map(p => p.concentration.top2_share),
      allStarters: profiles.map(p => p.spend_shares.pctStarters),
      allLastStarter: profiles.map(p => p.pacing.last_starter_index),
    }),
    [profiles],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Detailed Performance Metrics
        </CardTitle>
        <CardDescription>
          Advanced analytics on spending concentration, timing, and roster construction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Concentration Metrics */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Spending Concentration Analysis
          </h4>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  <TableHead>
                    <InfoTooltip
                      title="Build Type"
                      description="Strategic archetype based on spending patterns"
                      interpretation="Different approaches to roster construction"
                    />
                    Build Type
                  </TableHead>
                  <TableHead className="text-center">
                    <InfoTooltip
                      title="Gini Coefficient"
                      description="Statistical measure of spending inequality (0-1 scale)"
                      interpretation="0 = perfectly equal, 1 = maximum concentration. Stars & Scrubs builds show 0.4+"
                    />
                    Gini
                  </TableHead>
                  <TableHead className="text-center">
                    <InfoTooltip
                      title="Top 2 Players %"
                      description="Percentage of budget spent on top 2 players"
                      interpretation="Higher concentration indicates elite duo approach"
                    />
                    Top 2%
                  </TableHead>
                  <TableHead className="text-center">
                    <InfoTooltip
                      title="Starter Investment %"
                      description="Percentage of total budget allocated to starting lineup"
                      interpretation="Star-focused builds typically allocate 75%+ to starters"
                    />
                    Starters %
                  </TableHead>
                  <TableHead className="text-center">
                    <InfoTooltip
                      title="Last Starter Pick"
                      description="Draft position of final starting lineup player acquired"
                      interpretation="Lower numbers suggest early roster completion; higher suggest late bargain hunting"
                    />
                    Last Starter
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.slice(0, 100).map((profile, index) => (
                  <TableRow
                    key={`conc-${profile.manager || 'mgr'}-${profile.league || 'lg'}-${index}`}
                  >
                    <TableCell className="font-medium">
                      {profile.manager || 'Unknown Manager'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getClusterBadgeVariant(profile.cluster.cluster_label)}>
                        {profile.cluster.cluster_label}
                      </Badge>
                    </TableCell>

                    {/* Gini - heatmap style */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(
                          profile.concentration.giniSpend,
                          Math.max(...ranges.allGini),
                          Math.min(...ranges.allGini),
                        ),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.concentration.giniSpend,
                          Math.max(...ranges.allGini),
                          Math.min(...ranges.allGini),
                        ),
                      }}
                    >
                      {profile.concentration.giniSpend.toFixed(3)}
                    </TableCell>

                    {/* Top 2% - heatmap style */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(
                          profile.concentration.top2_share,
                          Math.max(...ranges.allTop2),
                          Math.min(...ranges.allTop2),
                        ),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.concentration.top2_share,
                          Math.max(...ranges.allTop2),
                          Math.min(...ranges.allTop2),
                        ),
                      }}
                    >
                      {(profile.concentration.top2_share * 100).toFixed(1)}%
                    </TableCell>

                    {/* Starters % - heatmap style */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(
                          profile.spend_shares.pctStarters,
                          Math.max(...ranges.allStarters),
                          Math.min(...ranges.allStarters),
                        ),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.spend_shares.pctStarters,
                          Math.max(...ranges.allStarters),
                          Math.min(...ranges.allStarters),
                        ),
                      }}
                    >
                      {(profile.spend_shares.pctStarters * 100).toFixed(1)}%
                    </TableCell>

                    {/* Last Starter - heatmap style */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(
                          profile.pacing.last_starter_index,
                          Math.max(...ranges.allLastStarter),
                          Math.min(...ranges.allLastStarter),
                        ),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.pacing.last_starter_index,
                          Math.max(...ranges.allLastStarter),
                          Math.min(...ranges.allLastStarter),
                        ),
                      }}
                    >
                      {profile.pacing.last_starter_index}
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
});

DetailedPerformanceMetrics.displayName = 'DetailedPerformanceMetrics';
