'use client';

import { memo } from 'react';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
import { colors } from '@/lib/colors';
import type { ScheduleDifficultyEntry } from './utils';

interface ScheduleDifficultyTableProps {
  readonly data: ScheduleDifficultyEntry[];
}

export const ScheduleDifficultyTable = memo<ScheduleDifficultyTableProps>(({ data }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
        Schedule Difficulty Rankings
      </h3>
      <p className="text-sm text-muted-foreground">
        Teams with the lowest win percentage against their schedule faced the toughest opponents.
      </p>
      <div className="rounded-md border overflow-hidden">
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
              const badgeColor = getRankColor(index + 1, 24);
              return (
                <tr key={row.scheduleOwnerKey} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3 text-center">
                    <span
                      className="rounded-full px-2 py-1 text-xs font-medium"
                      style={{ backgroundColor: badgeColor, color: getTextColor(badgeColor) }}
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
