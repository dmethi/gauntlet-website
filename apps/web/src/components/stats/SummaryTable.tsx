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
import { formatNumber, formatDelta } from '@/shared/utils/formatting';

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

export function SummaryTable({ data, showLeagueRank = true }: SummaryTableProps) {
  // Sort by windowTotal descending
  const sortedData = [...data].sort((a, b) => b.windowTotal - a.windowTotal);

  return (
    <div className="rounded-md border">
      <Table>
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
          {sortedData.map((row, index) => (
            <TableRow key={row.teamName}>
              <TableCell className="font-medium">{row.teamName}</TableCell>
              <TableCell className="text-right font-mono">
                {formatNumber(row.windowTotal)}
              </TableCell>
              <TableCell className="text-right font-mono">{formatNumber(row.oppTotal)}</TableCell>
              <TableCell
                className={cn(
                  'text-right font-mono',
                  row.diff > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400',
                )}
              >
                {formatDelta(row.diff)}
              </TableCell>
              <TableCell
                className={cn(
                  'text-right font-mono',
                  row.avgDelta > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400',
                )}
              >
                {formatDelta(row.avgDelta)}
              </TableCell>
              <TableCell
                className={cn(
                  'text-right font-mono',
                  row.medianDelta > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400',
                )}
              >
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
    </div>
  );
}
