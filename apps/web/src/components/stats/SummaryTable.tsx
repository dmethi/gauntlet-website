'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDelta, formatNumber } from '@/shared/utils/formatting';
import { ChevronDown } from 'lucide-react';
import {
  DataList,
  DataListHeader,
  DataListItem,
  DataListMetric,
  DataListMetricLabel,
  DataListMetrics,
  DataListMetricValue,
  DataListTitle,
} from '@/components/ui/data-list';
import { deltaTextClass } from '@/lib/stat-colors';

export interface SummaryTableRow {
  teamName: string;
  windowTotal: number;
  oppTotal: number;
  diff: number;
  avgDelta: number;
  medianDelta: number;
  rank24: number;
  rankLeague: number;
}

export interface SummaryTableProps {
  data: SummaryTableRow[];
  showLeagueRank?: boolean;
}

export const SummaryTable = ({ data, showLeagueRank = true }: SummaryTableProps) => {
  // Sort by windowTotal descending
  const sortedData = [...data].sort((a, b) => b.windowTotal - a.windowTotal);

  return (
    <>
      <DataList className="sm:hidden">
        {sortedData.map((row, index) => (
          <DataListItem key={row.teamName}>
            <DataListHeader>
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 px-1.5 text-sm font-bold tabular-nums text-primary">
                  {index + 1}
                </span>
                <DataListTitle className="truncate">{row.teamName}</DataListTitle>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Total
                </div>
                <div className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
                  {formatNumber(row.windowTotal)}
                </div>
              </div>
            </DataListHeader>
            <DataListMetrics>
              <DataListMetric>
                <DataListMetricLabel>Opponent</DataListMetricLabel>
                <DataListMetricValue>{formatNumber(row.oppTotal)}</DataListMetricValue>
              </DataListMetric>
              <DataListMetric>
                <DataListMetricLabel>Difference</DataListMetricLabel>
                <DataListMetricValue className={deltaTextClass(row.diff)}>
                  {formatDelta(row.diff)}
                </DataListMetricValue>
              </DataListMetric>
              <DataListMetric className="text-right">
                <DataListMetricLabel>
                  {showLeagueRank ? 'Ranks' : 'Overall rank'}
                </DataListMetricLabel>
                <DataListMetricValue>
                  {showLeagueRank ? `${row.rank24} · ${row.rankLeague}` : row.rank24}
                </DataListMetricValue>
              </DataListMetric>
            </DataListMetrics>
            <details className="group mt-1.5">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                Average and median detail
                <ChevronDown
                  className="h-4 w-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </summary>
              <DataListMetrics className="mt-0 grid-cols-2 border-t border-border/70 pt-3">
                <DataListMetric>
                  <DataListMetricLabel>Average delta</DataListMetricLabel>
                  <DataListMetricValue className={deltaTextClass(row.avgDelta)}>
                    {formatDelta(row.avgDelta)}
                  </DataListMetricValue>
                </DataListMetric>
                <DataListMetric className="text-right">
                  <DataListMetricLabel>Median delta</DataListMetricLabel>
                  <DataListMetricValue className={deltaTextClass(row.medianDelta)}>
                    {formatDelta(row.medianDelta)}
                  </DataListMetricValue>
                </DataListMetric>
              </DataListMetrics>
            </details>
          </DataListItem>
        ))}
      </DataList>

      <Table
        containerClassName="hidden sm:block"
        surface="responsive"
        scrollLabel="Team scoring summary"
      >
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Opp Total</TableHead>
            <TableHead className="text-right">Diff</TableHead>
            <TableHead className="text-right">Avg Δ</TableHead>
            <TableHead className="text-right">Median Δ</TableHead>
            <TableHead className="text-center">Rank (24)</TableHead>
            {showLeagueRank && <TableHead className="text-center">Rank (Lg)</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map(row => (
            <TableRow key={row.teamName}>
              <TableCell className="font-medium">{row.teamName}</TableCell>
              <TableCell className="text-right font-mono">
                {formatNumber(row.windowTotal)}
              </TableCell>
              <TableCell className="text-right font-mono">{formatNumber(row.oppTotal)}</TableCell>
              <TableCell className={cn('text-right font-mono', deltaTextClass(row.diff))}>
                {formatDelta(row.diff)}
              </TableCell>
              <TableCell className={cn('text-right font-mono', deltaTextClass(row.avgDelta))}>
                {formatDelta(row.avgDelta)}
              </TableCell>
              <TableCell className={cn('text-right font-mono', deltaTextClass(row.medianDelta))}>
                {formatDelta(row.medianDelta)}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={row.rank24 <= 4 ? 'default' : row.rank24 <= 12 ? 'secondary' : 'outline'}
                  className="min-w-[2.5rem] justify-center"
                >
                  {row.rank24}
                </Badge>
              </TableCell>
              {showLeagueRank && (
                <TableCell className="text-center">
                  <Badge
                    variant={
                      row.rankLeague <= 2
                        ? 'default'
                        : row.rankLeague <= 6
                          ? 'secondary'
                          : 'outline'
                    }
                    className="min-w-[2.5rem] justify-center"
                  >
                    {row.rankLeague}
                  </Badge>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
