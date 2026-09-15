'use client';

import { memo } from 'react';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
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
import type { HypotheticalRecordSummary } from './utils';

interface ScheduleStrengthTableProps {
  readonly data: HypotheticalRecordSummary[];
}

export const ScheduleStrengthTable = memo<ScheduleStrengthTableProps>(({ data }) => {
  const teamCount = data.length;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Hypothetical Records Summary</h3>
      <DataList className="sm:hidden">
        {data.map((row, index) => {
          const badgeColor = getRankColor(index + 1, teamCount);

          return (
            <DataListItem key={row.teamKey}>
              <DataListHeader>
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-bold"
                    style={{ backgroundColor: badgeColor, color: getTextColor(badgeColor) }}
                    aria-label={`Rank ${index + 1} of ${teamCount}`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <DataListTitle>{row.teamInfo.teamName}</DataListTitle>
                    <DataListDescription>{row.teamInfo.leagueName}</DataListDescription>
                  </div>
                </div>
              </DataListHeader>
              <DataListMetrics>
                <DataListMetric>
                  <DataListMetricLabel className="text-xs">Record</DataListMetricLabel>
                  <DataListMetricValue>
                    {row.totalWins}-{row.totalLosses}
                  </DataListMetricValue>
                </DataListMetric>
                <DataListMetric>
                  <DataListMetricLabel className="text-xs">Win rate</DataListMetricLabel>
                  <DataListMetricValue>{(row.winPct * 100).toFixed(1)}%</DataListMetricValue>
                </DataListMetric>
                <DataListMetric className="text-right">
                  <DataListMetricLabel className="text-xs">Games</DataListMetricLabel>
                  <DataListMetricValue>{row.totalGames}</DataListMetricValue>
                </DataListMetric>
              </DataListMetrics>
            </DataListItem>
          );
        })}
      </DataList>

      <div className="hidden overflow-hidden rounded-md border sm:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-center">Rank</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-center">Record</th>
              <th className="px-4 py-3 text-center">Win %</th>
              <th className="px-4 py-3 text-center">Games</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const badgeColor = getRankColor(index + 1, teamCount);
              return (
                <tr key={row.teamKey} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3 text-center">
                    <span
                      className="rounded-full px-2 py-1 text-xs font-medium"
                      style={{ backgroundColor: badgeColor, color: getTextColor(badgeColor) }}
                      aria-label={`Rank ${index + 1} of ${teamCount}`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.teamInfo.teamName}</div>
                    <div className="text-xs text-muted-foreground">{row.teamInfo.leagueName}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold">
                    {row.totalWins}-{row.totalLosses}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {(row.winPct * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-muted-foreground">
                    {row.totalGames}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

ScheduleStrengthTable.displayName = 'ScheduleStrengthTable';
