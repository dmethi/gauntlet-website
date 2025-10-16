import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
import { rank, TrackedPosition } from '@/shared/utils/stats';
import { colors } from '@/lib/colors';
import type { PlainStatsDataset } from '@/shared/utils/stats';
import type { PositionData, TeamData, TeamInfo, TrendsViewProps } from '@/features/stats';

interface PositionPerformanceTrendsProps
  extends Pick<TrendsViewProps, 'allTeamEntries' | 'positionsMap'> {
  dataset: PlainStatsDataset;
}

interface PositionPerformanceRow {
  teamInfo: TeamInfo;
  weeklyRanks: number[];
  weeklyScores: number[];
  trend: string;
}

const buildRowsForPosition = (
  position: TrackedPosition,
  allTeamEntries: [string, TeamData][],
  positionData: PositionData | undefined,
  dataset: PlainStatsDataset,
): Array<[string, PositionPerformanceRow]> => {
  const rankings = new Map<
    string,
    {
      teamInfo: TeamInfo;
      weeklyRanks: number[];
      weeklyScores: number[];
      trend: string;
    }
  >();

  const teamScores = new Map(positionData?.teams ?? []);

  for (let week = 1; week <= Math.max(0, dataset.currentWeek - 1); week++) {
    const weekTeams = allTeamEntries
      .map(([key, team]) => {
        const scores = teamScores.get(key)?.scores ?? [];
        const weekScore = scores.find(score => score.week === week)?.value || 0;
        return { key, teamInfo: team.teamInfo, weekScore };
      })
      .filter(entry => entry.weekScore !== 0)
      .sort((a, b) => b.weekScore - a.weekScore);

    const weekScores = weekTeams.map(team => team.weekScore);
    const weekRanks = rank(weekScores);

    weekTeams.forEach((team, index) => {
      if (!rankings.has(team.key)) {
        rankings.set(team.key, {
          teamInfo: team.teamInfo,
          weeklyRanks: [],
          weeklyScores: [],
          trend: '',
        });
      }

      const ranking = rankings.get(team.key)!;
      ranking.weeklyRanks.push(weekRanks[index]);
      ranking.weeklyScores.push(team.weekScore);
    });
  }

  rankings.forEach(data => {
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

  return Array.from(rankings.entries());
};

const usePositionPerformanceData = (
  allTeamEntries: [string, TeamData][],
  positionsMap: Map<TrackedPosition, PositionData>,
  dataset: PlainStatsDataset,
) => {
  return useMemo(() => {
    const positions: TrackedPosition[] = ['QB', 'RB', 'WR', 'TE', 'DEF'];

    return positions.map(position => {
      const rows = buildRowsForPosition(
        position,
        allTeamEntries,
        positionsMap.get(position),
        dataset,
      );
      return {
        position,
        rows,
      };
    });
  }, [allTeamEntries, dataset, positionsMap]);
};

export const PositionPerformanceTrends = ({
  allTeamEntries,
  positionsMap,
  dataset,
}: PositionPerformanceTrendsProps) => {
  const positionData = usePositionPerformanceData(allTeamEntries, positionsMap, dataset);

  return (
    <>
      {positionData.map(({ position, rows }) => (
        <Card key={position}>
          <CardHeader>
            <CardTitle>{position} Weekly Performance Trends</CardTitle>
            <CardDescription>
              Track each team&apos;s {position} performance week by week. Green = top {position}{' '}
              groups, Red = bottom {position} groups.
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
                      className="px-3 py-3 text-center font-semibold min-w-[60px]"
                      style={{ backgroundColor: colors.core.crimsonRed, color: 'white' }}
                    >
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([teamKey, data]) => (
                    <tr key={teamKey} className="border-t hover:bg-muted/10">
                      <td className="sticky left-0 z-10 bg-background border-r px-3 py-2">
                        <div className="font-medium">{data.teamInfo.teamName}</div>
                        <div className="text-xs text-muted-foreground">
                          {data.teamInfo.leagueName}
                        </div>
                      </td>
                      {Array.from(
                        { length: Math.max(0, dataset.currentWeek - 1) },
                        (_, index) => index,
                      ).map(weekIndex => {
                        const weekRank = data.weeklyRanks[weekIndex];
                        const weekScore = data.weeklyScores[weekIndex];

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
                        <div className="w-16 h-8">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={data.weeklyScores.map((score, index) => ({
                                week: index + 1,
                                score,
                              }))}
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
                                  `${Number(value).toFixed(1)}`,
                                  'Score',
                                ]}
                                labelFormatter={week => `Week ${week}`}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-muted/20 rounded-md text-xs">
              <h4 className="font-semibold mb-2">How to Read {position} Trends</h4>
              <div className="text-muted-foreground">
                <p>
                  <strong>Colors:</strong> Green = top {position} performance, Red = bottom{' '}
                  {position} performance
                </p>
                <p>
                  <strong>Trends:</strong> 📈 Improving, ➡️ Stable, 📉 Declining
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
