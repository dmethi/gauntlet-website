'use client';

import { memo, useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { colors } from '@/lib/colors';
import { TableViewport } from '@/components/ui/table';
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
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);
    const matrixId = useId();

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
            {title}
          </h3>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>

        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:hidden"
          aria-controls={matrixId}
          aria-expanded={isMobileExpanded}
          aria-label={`${isMobileExpanded ? 'Hide' : 'Explore'} full ${teams.length} × ${teams.length} ${title}`}
          onClick={() => setIsMobileExpanded(expanded => !expanded)}
        >
          <span>
            {isMobileExpanded ? 'Hide full matrix' : 'Explore full matrix'}
            <span className="ml-2 font-normal text-muted-foreground">
              {teams.length} × {teams.length}
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${isMobileExpanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        <div id={matrixId} className={isMobileExpanded ? 'space-y-4' : 'hidden space-y-4 sm:block'}>
          <TableViewport surface="responsive" scrollLabel={`${title} comparison matrix`}>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 border-r bg-muted px-2 py-1 text-left">
                    {columnLabel}
                  </th>
                  {teams.map(([teamKey, team]) => (
                    <th
                      key={teamKey}
                      className="min-w-[60px] border-r px-1 py-1 text-center"
                      title={team.teamInfo.teamName}
                    >
                      <div className="origin-center -rotate-45 whitespace-nowrap text-xs">
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
                      <td className="sticky left-0 z-10 border-r bg-muted px-2 py-1 font-medium">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium sm:text-sm">
                            {team.teamInfo.teamName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {team.teamInfo.leagueName}
                          </span>
                        </div>
                      </td>
                      {teams.map(([opponentKey]) => {
                        if (teamKey === opponentKey) {
                          return (
                            <td
                              key={opponentKey}
                              className="border-r bg-muted/50 px-1 py-1 text-center"
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
                              className="border-r bg-muted/30 px-1 py-1 text-center"
                            >
                              <span className="text-muted-foreground">—</span>
                            </td>
                          );
                        }

                        const color = getCellColor(record.wins, record.losses);
                        return (
                          <td
                            key={opponentKey}
                            className="border-r px-1 py-1 text-center"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <div className="font-mono text-xs font-medium" style={{ color }}>
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
          </TableViewport>

          <div className="divide-y divide-border/70 border-y border-border/70 text-xs md:grid md:grid-cols-3 md:gap-4 md:divide-y-0 md:border-0">
            <div className="py-3 md:rounded-md md:border md:p-3">
              <h4 className="mb-2 font-semibold">Legend</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded" style={{ backgroundColor: '#16a34a20' }} />
                  <span>Winning record</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded" style={{ backgroundColor: '#ca8a0420' }} />
                  <span>Even record</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded" style={{ backgroundColor: '#dc262620' }} />
                  <span>Losing record</span>
                </div>
              </div>
            </div>

            <div className="py-3 md:rounded-md md:border md:p-3">
              <h4 className="mb-2 font-semibold">Analysis</h4>
              <p className="text-muted-foreground">
                Reveals schedule strength by showing how each team would perform with different
                opponents.
              </p>
            </div>

            <div className="py-3 md:rounded-md md:border md:p-3">
              <h4 className="mb-2 font-semibold">Usage</h4>
              <p className="text-muted-foreground">
                Row team vs Column team schedule. “5-2” means the row team would go 5-2 with the
                column team&apos;s opponents.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ScheduleMatrixTable.displayName = 'ScheduleMatrixTable';
