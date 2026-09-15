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
import type { ScheduleDifficultyEntry } from './utils';

interface ScheduleDifficultyTableProps {
  readonly data: ScheduleDifficultyEntry[];
}

export const ScheduleDifficultyTable = memo<ScheduleDifficultyTableProps>(({ data }) => {
  const teamCount = data.length;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-primary">Schedule Difficulty Rankings</h3>
      <p className="text-sm text-muted-foreground">
        Teams with the lowest win percentage against their schedule faced the toughest opponents.
      </p>
      <DataList className="sm:hidden">
        {data.map((row, index) => {
          const badgeColor = getRankColor(index + 1, teamCount);

          return (
            <DataListItem key={row.scheduleOwnerKey}>
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
                    <DataListTitle>{row.scheduleOwnerInfo.teamName}</DataListTitle>
                    <DataListDescription>{row.scheduleOwnerInfo.leagueName}</DataListDescription>
                  </div>
                </div>
              </DataListHeader>
              <DataListMetrics className="grid-cols-2">
                <DataListMetric>
                  <DataListMetricLabel className="text-xs">Avg win rate</DataListMetricLabel>
                  <DataListMetricValue>{(row.avgWinPct * 100).toFixed(1)}%</DataListMetricValue>
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
              <th className="px-4 py-3 text-left">Schedule Owner</th>
              <th className="px-4 py-3 text-center">Avg Win % vs Schedule</th>
              <th className="px-4 py-3 text-center">Games</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const badgeColor = getRankColor(index + 1, teamCount);
              return (
                <tr key={row.scheduleOwnerKey} className="border-t hover:bg-muted/20">
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
                    <div className="font-medium">{row.scheduleOwnerInfo.teamName}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.scheduleOwnerInfo.leagueName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {(row.avgWinPct * 100).toFixed(1)}%
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

ScheduleDifficultyTable.displayName = 'ScheduleDifficultyTable';
