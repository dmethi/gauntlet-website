'use client';

import { memo } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { TrackedPosition } from '@/shared/utils/stats';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
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

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-center">Rank</th>
            <th className="px-3 py-2 text-left">Team</th>
            <th className="px-3 py-2 text-right">Total</th>
            {isSeasonView && <th className="px-3 py-2 text-center min-w-[120px]">Weekly Trend</th>}
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
                    backgroundColor: getRankColor(team.rank, 24),
                    color: getTextColor(getRankColor(team.rank, 24)),
                  }}
                >
                  {team.rank}
                </span>
              </td>
              <td className="px-3 py-2">
                <div className="font-medium">{team.teamInfo.teamName}</div>
                <div className="text-xs text-muted-foreground">{team.teamInfo.leagueName}</div>
              </td>
              <td
                className="px-3 py-2 text-right font-mono font-bold"
                style={{ color: colors.core.regalGold }}
              >
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
                          stroke={colors.core.regalGold}
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
                          formatter={(value, _name) => [`${Number(value).toFixed(1)} pts`, `Week`]}
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
                        backgroundColor: getRankColor(team.positionRanks[position], 24),
                      }}
                    >
                      <div
                        className="font-mono font-bold text-xs"
                        style={{
                          color: getTextColor(getRankColor(team.positionRanks[position], 24)),
                        }}
                      >
                        #{team.positionRanks[position]}
                      </div>
                      <div
                        className="font-mono text-xs"
                        style={{
                          color: getTextColor(getRankColor(team.positionRanks[position], 24)),
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
  );
});

LeagueRankingsTable.displayName = 'LeagueRankingsTable';
