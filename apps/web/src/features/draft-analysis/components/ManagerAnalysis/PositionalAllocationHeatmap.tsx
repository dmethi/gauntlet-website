'use client';

import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { TrendingUp } from 'lucide-react';
import { getContrastingTextColor, getHeatmapColor } from './utils';
import type { ManagerProfile } from '@/features/draft-analysis/types';

interface PositionalAllocationHeatmapProps {
  profiles: ManagerProfile[];
  sortBy: string;
  onSortChange: (_value: string) => void;
}

export const PositionalAllocationHeatmap = memo<PositionalAllocationHeatmapProps>(
  ({ profiles, sortBy, onSortChange }) => {
    const { allQB, allRB, allWR, allTE, allDEF, allStarters, allPatience } = useMemo(() => {
      return {
        allQB: profiles.map(p => p.spend_shares.pctQB || 0),
        allRB: profiles.map(p => p.spend_shares.pctRB || 0),
        allWR: profiles.map(p => p.spend_shares.pctWR || 0),
        allTE: profiles.map(p => p.spend_shares.pctTE || 0),
        allDEF: profiles.map(p => p.spend_shares.pctDEF || 0),
        allStarters: profiles.map(p => p.spend_shares.pctStarters),
        allPatience: profiles.map(p => p.pacing.patience_score),
      };
    }, [profiles]);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Positional Allocation Heatmap
            </div>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concentration">Sort by Concentration</SelectItem>
                <SelectItem value="patience">Sort by Patience</SelectItem>
                <SelectItem value="starters">Sort by Starter %</SelectItem>
                <SelectItem value="top1">Sort by Top Player %</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
          <CardDescription>
            Budget allocation by position, compared to league averages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-center">League</TableHead>
                  <TableHead className="text-center">
                    <InfoTooltip
                      title="Quarterback %"
                      description="Percentage of budget spent on QB position"
                      interpretation="Elite QB approach typically shows 12%+ allocation"
                    />
                    QB %
                  </TableHead>
                  <TableHead className="text-center">
                    <InfoTooltip
                      title="Running Back %"
                      description="Percentage of budget spent on RB position"
                      interpretation="RB-heavy builds typically show 35%+ allocation"
                    />
                    RB %
                  </TableHead>
                  <TableHead className="text-center">
                    <InfoTooltip
                      title="Wide Receiver %"
                      description="Percentage of budget spent on WR position"
                      interpretation="WR-focused builds typically show 40%+ allocation"
                    />
                    WR %
                  </TableHead>
                  <TableHead className="text-center">
                    <InfoTooltip
                      title="Tight End %"
                      description="Percentage of budget spent on TE position"
                      interpretation="Premium TE builds typically show 8%+ allocation"
                    />
                    TE %
                  </TableHead>
                  <TableHead className="text-center">
                    <InfoTooltip
                      title="Defense %"
                      description="Percentage of budget spent on DEF position"
                      interpretation="Typically minimal allocation (1-2%)"
                    />
                    DEF %
                  </TableHead>
                  <TableHead className="text-center">
                    <InfoTooltip
                      title="Starter Allocation %"
                      description="Percentage of budget spent on starting lineup vs bench"
                      interpretation="Star-focused builds allocate 75%+ to starters"
                    />
                    Starters %
                  </TableHead>
                  <TableHead className="text-center">
                    <InfoTooltip
                      title="Patience Score"
                      description="Measures draft timing strategy (0-1 scale)"
                      interpretation="Higher scores indicate more patient, value-hunting approach"
                    />
                    Patience
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.slice(0, 100).map((profile, index) => (
                  <TableRow
                    key={`alloc-${profile.manager || 'mgr'}-${profile.league || 'lg'}-${index}`}
                  >
                    <TableCell className="font-medium">
                      {profile.manager || 'Unknown Manager'}
                    </TableCell>
                    <TableCell>{profile.league}</TableCell>

                    {/* QB allocation */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(
                          profile.spend_shares.pctQB || 0,
                          Math.max(...allQB),
                          Math.min(...allQB),
                        ),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.spend_shares.pctQB || 0,
                          Math.max(...allQB),
                          Math.min(...allQB),
                        ),
                      }}
                    >
                      {((profile.spend_shares.pctQB || 0) * 100).toFixed(1)}%
                    </TableCell>

                    {/* RB allocation */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(
                          profile.spend_shares.pctRB || 0,
                          Math.max(...allRB),
                          Math.min(...allRB),
                        ),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.spend_shares.pctRB || 0,
                          Math.max(...allRB),
                          Math.min(...allRB),
                        ),
                      }}
                    >
                      {((profile.spend_shares.pctRB || 0) * 100).toFixed(1)}%
                    </TableCell>

                    {/* WR allocation */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(
                          profile.spend_shares.pctWR || 0,
                          Math.max(...allWR),
                          Math.min(...allWR),
                        ),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.spend_shares.pctWR || 0,
                          Math.max(...allWR),
                          Math.min(...allWR),
                        ),
                      }}
                    >
                      {((profile.spend_shares.pctWR || 0) * 100).toFixed(1)}%
                    </TableCell>

                    {/* TE allocation */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(
                          profile.spend_shares.pctTE || 0,
                          Math.max(...allTE),
                          Math.min(...allTE),
                        ),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.spend_shares.pctTE || 0,
                          Math.max(...allTE),
                          Math.min(...allTE),
                        ),
                      }}
                    >
                      {((profile.spend_shares.pctTE || 0) * 100).toFixed(1)}%
                    </TableCell>

                    {/* DEF allocation */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(
                          profile.spend_shares.pctDEF || 0,
                          Math.max(...allDEF),
                          Math.min(...allDEF),
                        ),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.spend_shares.pctDEF || 0,
                          Math.max(...allDEF),
                          Math.min(...allDEF),
                        ),
                      }}
                    >
                      {((profile.spend_shares.pctDEF || 0) * 100).toFixed(1)}%
                    </TableCell>

                    {/* Starters allocation */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(
                          profile.spend_shares.pctStarters,
                          Math.max(...allStarters),
                          Math.min(...allStarters),
                        ),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.spend_shares.pctStarters,
                          Math.max(...allStarters),
                          Math.min(...allStarters),
                        ),
                      }}
                    >
                      {(profile.spend_shares.pctStarters * 100).toFixed(1)}%
                    </TableCell>

                    {/* Patience score */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(
                          profile.pacing.patience_score,
                          Math.max(...allPatience),
                          Math.min(...allPatience),
                        ),
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.pacing.patience_score,
                          Math.max(...allPatience),
                          Math.min(...allPatience),
                        ),
                      }}
                    >
                      {profile.pacing.patience_score.toFixed(3)}
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

PositionalAllocationHeatmap.displayName = 'PositionalAllocationHeatmap';
