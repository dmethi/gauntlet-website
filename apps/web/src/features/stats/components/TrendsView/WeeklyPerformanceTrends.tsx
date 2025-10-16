import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
import { rank } from '@/shared/utils/stats';
import { colors } from '@/lib/colors';
import type { PlainStatsDataset } from '@/shared/utils/stats';
import type { TeamData, TeamInfo, TrendsViewProps } from '@/features/stats';

interface WeeklyPerformanceTrendsProps extends Pick<TrendsViewProps, 'allTeamEntries'> {
  dataset: PlainStatsDataset;
  leagueData: Array<{ key: string; rank: number }>;
}

interface WeeklyPerformanceRow {
  teamKey: string;
  teamInfo: TeamInfo;
  weeklyRanks: number[];
  weeklyScores: number[];
  trend: string;
}

const useWeeklyPerformanceRows = (
  allTeamEntries: [string, TeamData][],
  dataset: PlainStatsDataset,
  leagueData: Array<{ key: string; rank: number }>,
): WeeklyPerformanceRow[] => {
  return useMemo(() => {
    if (!dataset.currentWeek || dataset.currentWeek <= 1) {
      return [];
    }

    const weeklyRankings = new Map<
      string,
      {
        teamInfo: TeamInfo;
        weeklyRanks: number[];
        weeklyScores: number[];
        trend: string;
      }
    >();

    for (let week = 1; week <= dataset.currentWeek - 1; week++) {
      const weekTeams = allTeamEntries
        .map(([key, team]) => {
          const weekScore = team.teamScores.find(score => score.week === week)?.value || 0;
          return { key, teamInfo: team.teamInfo, weekScore };
        })
        .filter(team => team.weekScore !== 0)
        .sort((a, b) => b.weekScore - a.weekScore);

      const weekScores = weekTeams.map(team => team.weekScore);
      const weekRanks = rank(weekScores);

      weekTeams.forEach((team, index) => {
        if (!weeklyRankings.has(team.key)) {
          weeklyRankings.set(team.key, {
            teamInfo: team.teamInfo,
            weeklyRanks: [],
            weeklyScores: [],
            trend: '',
          });
        }

        const ranking = weeklyRankings.get(team.key)!;
        ranking.weeklyRanks.push(weekRanks[index]);
        ranking.weeklyScores.push(team.weekScore);
      });
    }

    weeklyRankings.forEach(data => {
      const { weeklyRanks } = data;
      if (weeklyRanks.length < 2) {
        data.trend = '➡️';
        return;
      }

      const recent = weeklyRanks.slice(-2);
      const change = recent[0] - recent[1];
      if (change < -2) data.trend = '📈';
      else if (change > 2) data.trend = '📉';
      else data.trend = '➡️';
    });

    return Array.from(weeklyRankings.entries())
      .sort((a, b) => {
        const aRank = leagueData.find(team => team.key === a[0])?.rank ?? 999;
        const bRank = leagueData.find(team => team.key === b[0])?.rank ?? 999;
        return aRank - bRank;
      })
      .map(([teamKey, data]) => ({
        teamKey,
        teamInfo: data.teamInfo,
        weeklyRanks: data.weeklyRanks,
        weeklyScores: data.weeklyScores,
        trend: data.trend,
      }));
  }, [allTeamEntries, dataset.currentWeek, leagueData]);
};

export const WeeklyPerformanceTrends = ({
  allTeamEntries,
  dataset,
  leagueData,
}: WeeklyPerformanceTrendsProps) => {
  const weeklyRows = useWeeklyPerformanceRows(allTeamEntries, dataset, leagueData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Performance Trends</CardTitle>
        <CardDescription>
          Track each team&apos;s ranking progression week by week. Green = top performance, Red =
          bottom performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-md border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="sticky left-0 z-10 bg-muted px-3 py-3 text-left font-semibold min-w-[140px]">
                  Team
                </th>
                {Array.from(
                  { length: Math.max(0, dataset.currentWeek - 1) },
                  (_, index) => index + 1,
                ).map(week => (
                  <th
                    key={week}
                    className="px-3 py-3 text-center font-semibold min-w-[50px]"
                    style={{ backgroundColor: colors.core.charcoalSteel, color: 'white' }}
                  >
                    W{week}
                  </th>
                ))}
                <th
                  className="px-3 py-3 text-center font-semibold min-w-[80px]"
                  style={{ backgroundColor: colors.core.crimsonRed, color: 'white' }}
                >
                  Weekly Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {weeklyRows.map(row => (
                <tr key={row.teamKey} className="border-t hover:bg-muted/10">
                  <td className="sticky left-0 z-10 bg-background border-r px-3 py-2">
                    <div className="font-medium">{row.teamInfo.teamName}</div>
                    <div className="text-xs text-muted-foreground">{row.teamInfo.leagueName}</div>
                  </td>
                  {Array.from(
                    { length: Math.max(0, dataset.currentWeek - 1) },
                    (_, index) => index,
                  ).map(weekIndex => {
                    const weekRank = row.weeklyRanks[weekIndex];
                    const weekScore = row.weeklyScores[weekIndex];

                    if (!weekRank) {
                      return (
                        <td key={weekIndex} className="px-1 py-2 text-center border-r">
                          <div className="text-xs text-muted-foreground">—</div>
                        </td>
                      );
                    }

                    const rankColor = getRankColor(weekRank, 24);
                    return (
                      <td key={weekIndex} className="px-1 py-2 text-center border-r">
                        <div
                          className="rounded-md p-2 transition-colors"
                          style={{
                            backgroundColor: rankColor,
                          }}
                        >
                          <div
                            className="font-mono font-bold text-xs"
                            style={{
                              color: getTextColor(rankColor),
                            }}
                          >
                            #{weekRank}
                          </div>
                          <div
                            className="font-mono text-xs mt-1"
                            style={{
                              color: getTextColor(rankColor),
                            }}
                          >
                            {weekScore?.toFixed(1)}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-2 text-lg">
                      <span>{row.trend}</span>
                      <div className="w-16 h-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={(() => {
                              const teamData = allTeamEntries.find(
                                ([key]) => key === row.teamKey,
                              )?.[1];
                              if (!teamData) return [];

                              return teamData.teamScores
                                .filter(score => score.value > 0)
                                .map(score => ({
                                  week: score.week,
                                  score: score.value,
                                }));
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
                              formatter={(value: number | string) => [
                                `${Number(value).toFixed(1)} pts`,
                                'Score',
                              ]}
                              labelFormatter={week => `Week ${week}`}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-muted/20 rounded-md text-xs">
          <h4 className="font-semibold mb-2">How to Read the Trends</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
            <div>
              <p>
                <strong>Colors:</strong> Green = top performance, Red = bottom performance
                (percentile-based)
              </p>
            </div>
            <div>
              <p>
                <strong>Trends:</strong> 📈 Improving (rank up 3+), ➡️ Stable (±2), 📉 Declining
                (rank down 3+)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
