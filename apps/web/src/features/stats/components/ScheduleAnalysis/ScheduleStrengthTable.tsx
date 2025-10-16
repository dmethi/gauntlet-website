'use client';

import { memo } from 'react';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
import { colors } from '@/lib/colors';
import type { HypotheticalRecordSummary } from './utils';

interface ScheduleStrengthTableProps {
  readonly data: HypotheticalRecordSummary[];
}

export const ScheduleStrengthTable = memo<ScheduleStrengthTableProps>(({ data }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
        Hypothetical Records Summary
      </h3>
      <div className="rounded-md border overflow-hidden">
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
              const badgeColor = getRankColor(index + 1, 24);
              return (
                <tr key={row.teamKey} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3 text-center">
                    <span
                      className="rounded-full px-2 py-1 text-xs font-medium"
                      style={{ backgroundColor: badgeColor, color: getTextColor(badgeColor) }}
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
