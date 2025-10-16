'use client';

import { memo } from 'react';
import { colors } from '@/lib/colors';
import type { ScheduleMatrix } from './utils';
import type { TeamData } from '@/features/stats/types';

interface MatchupMatrixTableProps {
  readonly title: string;
  readonly description?: string;
  readonly columnLabel: string;
  readonly teams: Array<[string, TeamData]>;
  readonly matrix: ScheduleMatrix;
}

const getCellColor = (wins: number, losses: number): string => {
  const total = wins + losses;
  if (total === 0) return '#9ca3af';
  const winPct = wins / total;
  if (winPct > 0.5) return '#16a34a';
  if (winPct === 0.5) return '#ca8a04';
  return '#dc2626';
};

export const ScheduleMatrixTable = memo<MatchupMatrixTableProps>(
  ({ title, description, columnLabel, teams, matrix }) => {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
            {title}
          </h3>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>

        <div className="overflow-auto rounded-md border">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-muted px-2 py-1 text-left border-r">
                  {columnLabel}
                </th>
                {teams.map(([teamKey, team]) => (
                  <th
                    key={teamKey}
                    className="px-1 py-1 text-center border-r min-w-[60px]"
                    title={team.teamInfo.teamName}
                  >
                    <div className="transform -rotate-45 origin-center whitespace-nowrap text-xs">
                      {team.teamInfo.teamName.slice(0, 12)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map(([teamKey, team]) => {
                const row = matrix.get(teamKey);
                return (
                  <tr key={teamKey} className="border-b">
                    <td className="sticky left-0 z-10 bg-muted px-2 py-1 font-medium border-r">
                      <div className="flex flex-col">
                        <span className="font-medium text-xs sm:text-sm">
                          {team.teamInfo.teamName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {team.teamInfo.leagueName}
                        </span>
                      </div>
                    </td>
                    {teams.map(([opponentKey]) => {
                      if (teamKey === opponentKey) {
                        return (
                          <td
                            key={opponentKey}
                            className="px-1 py-1 text-center border-r bg-muted/50"
                          >
                            —
                          </td>
                        );
                      }

                      const record = row?.get(opponentKey);
                      if (!record || record.totalGames === 0) {
                        return (
                          <td
                            key={opponentKey}
                            className="px-1 py-1 text-center border-r bg-gray-50"
                          >
                            <span className="text-muted-foreground">—</span>
                          </td>
                        );
                      }

                      const color = getCellColor(record.wins, record.losses);
                      return (
                        <td
                          key={opponentKey}
                          className="px-1 py-1 text-center border-r"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <div className="font-mono text-xs font-medium" style={{ color: color }}>
                            {record.wins}-{record.losses}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-md border p-3">
            <h4 className="font-semibold mb-2">Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#16a34a20' }}></div>
                <span>Winning record</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ca8a0420' }}></div>
                <span>Even record</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc262620' }}></div>
                <span>Losing record</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border p-3">
            <h4 className="font-semibold mb-2">Analysis</h4>
            <p className="text-muted-foreground">
              Reveals schedule strength by showing how each team would perform with different
              opponents.
            </p>
          </div>

          <div className="rounded-md border p-3">
            <h4 className="font-semibold mb-2">Usage</h4>
            <p className="text-muted-foreground">
              Row team vs Column team schedule. “5-2” means the row team would go 5-2 with the
              column team&apos;s opponents.
            </p>
          </div>
        </div>
      </div>
    );
  },
);

ScheduleMatrixTable.displayName = 'ScheduleMatrixTable';
