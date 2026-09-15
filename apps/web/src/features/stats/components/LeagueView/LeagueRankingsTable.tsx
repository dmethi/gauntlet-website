'use client';

import { memo } from 'react';
import { ChevronDown, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { TrackedPosition } from '@/shared/utils/stats';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
import {
  DataList,
  DataListDescription,
  DataListHeader,
  DataListItem,
  DataListTitle,
} from '@/components/ui/data-list';
import { colors } from '../../../../../../../brand/colors';
import type { LeagueRanking, PositionData, TeamData } from './utils';
import { getPositionSparklineColor, getPositionSparklineData, getSparklineData } from './utils';

interface LeagueRankingsTableProps {
  readonly leagueData: LeagueRanking[];
  readonly isSeasonView: boolean;
  readonly allTeamEntries: [string, TeamData][];
  readonly positionsMap: Map<TrackedPosition, PositionData>;
}

export const LeagueRankingsTable = memo<LeagueRankingsTableProps>(props => {
  const { leagueData, isSeasonView, allTeamEntries, positionsMap } = props;
  const teamCount = leagueData.length;
  const teamDataByKey = new Map(allTeamEntries);

  return (
    <>
      <DataList className="sm:hidden">
        {leagueData.map(team => {
          const rankColor = getRankColor(team.rank, teamCount);
          const trendData = getSparklineData(teamDataByKey.get(team.key));
          const latestPoint = trendData.at(-1);
          const previousPoint = trendData.at(-2);
          const weeklyDelta =
            latestPoint && previousPoint ? latestPoint.score - previousPoint.score : null;

          return (
            <DataListItem key={team.key} className="py-3">
              <DataListHeader>
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums"
                    style={{ backgroundColor: rankColor, color: getTextColor(rankColor) }}
                    aria-label={`Rank ${team.rank} of ${teamCount}`}
                  >
                    {team.rank}
                  </span>
                  <div className="min-w-0">
                    <DataListTitle className="truncate">{team.teamInfo.teamName}</DataListTitle>
                    <DataListDescription>{team.teamInfo.leagueName}</DataListDescription>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Total
                  </div>
                  <div className="mt-0.5 font-mono text-lg font-bold tabular-nums text-secondary">
                    {team.teamTotal.toFixed(1)}
                  </div>
                </div>
              </DataListHeader>

              {isSeasonView && latestPoint ? (
                <div
                  className="mt-3 grid grid-cols-[minmax(0,1fr)_7rem] items-center gap-3 border-y border-border/70 py-2"
                  role="img"
                  aria-label={`${team.teamInfo.teamName} weekly scoring trend, latest Week ${latestPoint.week}: ${latestPoint.score.toFixed(1)} points${weeklyDelta === null ? '' : `, ${weeklyDelta >= 0 ? 'up' : 'down'} ${Math.abs(weeklyDelta).toFixed(1)} points from the prior week`}`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-muted-foreground">Weekly trend</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs tabular-nums">
                      <span className="font-semibold">
                        W{latestPoint.week} · {latestPoint.score.toFixed(1)} pts
                      </span>
                      {weeklyDelta === null ? null : (
                        <span
                          className={
                            weeklyDelta > 0
                              ? 'flex items-center gap-1 text-success'
                              : weeklyDelta < 0
                                ? 'flex items-center gap-1 text-destructive'
                                : 'flex items-center gap-1 text-muted-foreground'
                          }
                        >
                          {weeklyDelta > 0 ? (
                            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : weeklyDelta < 0 ? (
                            <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          {Math.abs(weeklyDelta).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-9 w-28" aria-hidden="true">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="hsl(var(--secondary))"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : null}

              <details className="group mt-1">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-md text-xs font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                  {isSeasonView ? 'Position trends & ranks' : 'Position breakdown'}
                  <ChevronDown
                    className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="divide-y divide-border/70 border-y border-border/70">
                  {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => {
                    const positionRank = team.positionRanks[position];
                    const positionColor = getRankColor(positionRank, teamCount);
                    const positionTrend = getPositionSparklineData(
                      positionsMap,
                      position,
                      team.key,
                    );

                    return (
                      <div
                        key={position}
                        className="grid min-h-12 grid-cols-[2.5rem_minmax(0,1fr)_5rem] items-center gap-3 py-2"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span
                            className="h-2.5 w-2.5 rounded-sm"
                            style={{ backgroundColor: positionColor }}
                            aria-hidden="true"
                          />
                          {position}
                        </div>
                        <div className="min-w-0 text-xs tabular-nums">
                          <span className="font-semibold">Rank #{positionRank}</span>
                          <span className="text-muted-foreground"> of {teamCount}</span>
                          <span className="ml-2 text-muted-foreground">
                            {team.positions[position].toFixed(1)} pts
                          </span>
                        </div>
                        {isSeasonView ? (
                          <div
                            className="h-6 w-20"
                            role="img"
                            aria-label={`${team.teamInfo.teamName} ${position} weekly trend`}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={positionTrend}>
                                <Line
                                  type="monotone"
                                  dataKey="score"
                                  stroke={getPositionSparklineColor(
                                    positionRank,
                                    teamCount,
                                    colors,
                                  )}
                                  strokeWidth={1.5}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div />
                        )}
                      </div>
                    );
                  })}
                </div>
              </details>
            </DataListItem>
          );
        })}
      </DataList>

      <div className="hidden rounded-md border sm:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-center">Rank</th>
              <th className="px-3 py-2 text-left">Team</th>
              <th className="px-3 py-2 text-right">Total</th>
              {isSeasonView && (
                <th className="px-3 py-2 text-center min-w-[120px]">Weekly Trend</th>
              )}
              <th className="px-3 py-2 text-center">QB</th>
              <th className="px-3 py-2 text-center">RB</th>
              <th className="px-3 py-2 text-center">WR</th>
              <th className="px-3 py-2 text-center">TE</th>
              <th className="px-3 py-2 text-center">DEF</th>
            </tr>
          </thead>
          <tbody>
            {leagueData.map(team => (
              <tr key={team.key} className="border-t hover:bg-muted/20">
                <td className="px-3 py-2 text-center">
                  <span
                    className="rounded-full px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: getRankColor(team.rank, teamCount),
                      color: getTextColor(getRankColor(team.rank, teamCount)),
                    }}
                    aria-label={`Rank ${team.rank} of ${teamCount}`}
                  >
                    {team.rank}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium">{team.teamInfo.teamName}</div>
                  <div className="text-xs text-muted-foreground">{team.teamInfo.leagueName}</div>
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-secondary">
                  {team.teamTotal.toFixed(1)}
                </td>
                {isSeasonView && (
                  <td className="px-2 py-2">
                    <div className="w-28 h-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={(() => {
                            const teamData = allTeamEntries.find(([k]) => k === team.key);
                            if (!teamData) return [];
                            return getSparklineData(teamData[1]);
                          })()}
                        >
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="hsl(var(--secondary))"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              border: 'none',
                              borderRadius: '4px',
                              color: 'white',
                              fontSize: '11px',
                              padding: '4px 8px',
                            }}
                            formatter={(value, _name) => [
                              `${Number(value).toFixed(1)} pts`,
                              `Week`,
                            ]}
                            labelFormatter={week => `Week ${week}`}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                )}
                {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => (
                  <td key={position} className="px-2 py-2 text-center">
                    <div className="space-y-2">
                      {/* Position heatmap cell */}
                      <div
                        className="rounded-lg p-2 transition-colors min-w-[70px]"
                        style={{
                          backgroundColor: getRankColor(team.positionRanks[position], teamCount),
                        }}
                      >
                        <div
                          className="font-mono font-bold text-xs"
                          style={{
                            color: getTextColor(
                              getRankColor(team.positionRanks[position], teamCount),
                            ),
                          }}
                        >
                          #{team.positionRanks[position]}
                        </div>
                        <div
                          className="font-mono text-xs"
                          style={{
                            color: getTextColor(
                              getRankColor(team.positionRanks[position], teamCount),
                            ),
                          }}
                        >
                          {team.positions[position].toFixed(1)}
                        </div>
                      </div>

                      {/* Position sparkline (season view only) */}
                      {isSeasonView && (
                        <div className="w-16 h-6">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={getPositionSparklineData(positionsMap, position, team.key)}
                            >
                              <Line
                                type="monotone"
                                dataKey="score"
                                stroke={getPositionSparklineColor(
                                  team.positionRanks[position],
                                  teamCount,
                                  colors,
                                )}
                                strokeWidth={1.5}
                                dot={false}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(0,0,0,0.8)',
                                  border: 'none',
                                  borderRadius: '4px',
                                  color: 'white',
                                  fontSize: '10px',
                                  padding: '3px 6px',
                                }}
                                formatter={value => [`${Number(value).toFixed(1)} pts`, position]}
                                labelFormatter={week => `Week ${week}`}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
});

LeagueRankingsTable.displayName = 'LeagueRankingsTable';
