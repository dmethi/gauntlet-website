'use client';

import { memo, useState } from 'react';
import { TrackedPosition } from '@/shared/utils/stats';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
import { PlayerBreakdownRow } from '@/components/stats/PlayerBreakdown';
import type { PlainStatsDataset } from '@/shared/utils/stats';
import type { PositionData, TeamData } from './utils';
import { calculatePositionRankings } from './utils';

interface PositionRankingsSectionProps {
  readonly allTeamEntries: [string, TeamData][];
  readonly positionsMap: Map<TrackedPosition, PositionData>;
  readonly weekNum: number | null;
  readonly isSeasonView: boolean;
  readonly dataset: PlainStatsDataset;
}

export const PositionRankingsSection = memo<PositionRankingsSectionProps>(props => {
  const { allTeamEntries, positionsMap, weekNum, isSeasonView, dataset } = props;

  // Track expanded player breakdown rows
  const [expandedLeagueRows, setExpandedLeagueRows] = useState<Set<string>>(new Set());

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-semibold text-primary">Position Rankings</h3>

      {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => {
        const positionData = calculatePositionRankings(
          allTeamEntries,
          positionsMap,
          position,
          weekNum,
          isSeasonView,
        );

        return (
          <section key={position} className="border-y md:rounded-md md:border">
            <div className="bg-muted/45 px-1 py-2 md:px-4">
              <h4 className="font-semibold text-foreground">
                {position} Rankings
                {!isSeasonView && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Tap a team to see players)
                  </span>
                )}
              </h4>
            </div>

            <div className="divide-y sm:hidden">
              {positionData.map(team => {
                const rowKey = `league-${position}-${team.key}`;
                const isExpanded = expandedLeagueRows.has(rowKey);
                const weekPlayerData = weekNum
                  ? dataset.weeklyPlayerData[weekNum]?.[team.key]
                  : null;
                const playersForPosition = weekPlayerData?.positions[position] || [];

                return (
                  <div key={team.key}>
                    <button
                      type="button"
                      className="grid min-h-11 w-full grid-cols-[2.5rem_1fr_auto] items-center gap-2 px-1 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:cursor-default"
                      disabled={isSeasonView}
                      aria-expanded={!isSeasonView ? isExpanded : undefined}
                      onClick={() => {
                        if (isSeasonView) return;
                        const next = new Set(expandedLeagueRows);
                        if (isExpanded) next.delete(rowKey);
                        else next.add(rowKey);
                        setExpandedLeagueRows(next);
                      }}
                    >
                      <span
                        className="justify-self-start rounded-full px-2 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: getRankColor(team.rank, positionData.length),
                          color: getTextColor(getRankColor(team.rank, positionData.length)),
                        }}
                      >
                        {team.rank}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {team.teamInfo.teamName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {team.teamInfo.leagueName}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block font-mono text-sm font-bold text-secondary">
                          {team.posScore.toFixed(1)}
                        </span>
                        {!isSeasonView ? (
                          <span className="block text-xs text-muted-foreground">
                            {isExpanded ? 'Hide' : 'Players'}
                          </span>
                        ) : null}
                      </span>
                    </button>
                    {isExpanded && !isSeasonView && weekNum ? (
                      <div className="border-t bg-muted/20">
                        <PlayerBreakdownRow players={playersForPosition} position={position} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="hidden p-4 sm:block">
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20">
                    <tr>
                      <th className="px-3 py-2 text-center">Rank</th>
                      <th className="px-3 py-2 text-left">Team</th>
                      <th className="px-3 py-2 text-right">Points</th>
                      {!isSeasonView && <th className="px-3 py-2 text-center">Players</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {positionData.flatMap(team => {
                      const rowKey = `league-${position}-${team.key}`;
                      const isExpanded = expandedLeagueRows.has(rowKey);
                      const rows = [];

                      // Main team row
                      rows.push(
                        <tr
                          key={team.key}
                          className={`border-t hover:bg-muted/20 ${!isSeasonView ? 'cursor-pointer' : ''}`}
                          onClick={
                            !isSeasonView
                              ? () => {
                                  const newExpanded = new Set(expandedLeagueRows);
                                  if (isExpanded) {
                                    newExpanded.delete(rowKey);
                                  } else {
                                    newExpanded.add(rowKey);
                                  }
                                  setExpandedLeagueRows(newExpanded);
                                }
                              : undefined
                          }
                        >
                          <td className="px-3 py-2 text-center">
                            <span
                              className="rounded-full px-2 py-1 text-xs font-medium"
                              style={{
                                backgroundColor: getRankColor(team.rank, positionData.length),
                                color: getTextColor(getRankColor(team.rank, positionData.length)),
                              }}
                            >
                              {team.rank}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <div>
                                <div className="font-medium">{team.teamInfo.teamName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {team.teamInfo.leagueName}
                                </div>
                              </div>
                              {!isSeasonView && (
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {isExpanded ? '▼' : '▶'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-secondary">
                            {team.posScore.toFixed(1)}
                          </td>
                          {!isSeasonView && (
                            <td className="px-3 py-2 text-center text-xs text-muted-foreground">
                              Click to expand
                            </td>
                          )}
                        </tr>,
                      );

                      // Player breakdown row (if expanded and weekly view)
                      if (isExpanded && !isSeasonView && weekNum) {
                        const weekPlayerData = dataset.weeklyPlayerData[weekNum]?.[team.key];
                        const playersForPosition = weekPlayerData?.positions[position] || [];

                        rows.push(
                          <tr key={`${team.key}-breakdown`} className="bg-muted/5">
                            <td colSpan={4} className="p-0">
                              <PlayerBreakdownRow
                                players={playersForPosition}
                                position={position}
                              />
                            </td>
                          </tr>,
                        );
                      }

                      return rows;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
});

PositionRankingsSection.displayName = 'PositionRankingsSection';
