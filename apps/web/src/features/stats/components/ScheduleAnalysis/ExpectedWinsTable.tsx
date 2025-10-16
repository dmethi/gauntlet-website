'use client';

import { memo } from 'react';
import { colors } from '@/lib/colors';
import type { LuckAnalysisEntry } from './utils';

interface ExpectedWinsTableProps {
  readonly data: LuckAnalysisEntry[];
}

export const ExpectedWinsTable = memo<ExpectedWinsTableProps>(({ data }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
        Expected Wins vs Actual Results
      </h3>
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-center">Actual</th>
              <th className="px-4 py-3 text-center">Expected</th>
              <th className="px-4 py-3 text-center">Luck Rating</th>
              <th className="px-4 py-3 text-center">Schedule Ease</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => {
              const luckColor =
                row.luckRating > 0.05
                  ? colors.rdylgn[8]
                  : row.luckRating < -0.05
                    ? colors.rdylgn[2]
                    : colors.rdylgn[5];

              return (
                <tr key={row.teamKey} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.teamInfo.teamName}</div>
                    <div className="text-xs text-muted-foreground">{row.teamInfo.leagueName}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {(row.actualWinPct * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {(row.expectedWinPct * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-mono font-semibold" style={{ color: luckColor }}>
                      {row.luckRating > 0 ? '+' : ''}
                      {(row.luckRating * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {(row.scheduleEase * 100).toFixed(1)}%
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

ExpectedWinsTable.displayName = 'ExpectedWinsTable';
