import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
import { colors } from '@/lib/colors';
import type { PlainStatsDataset } from '@/shared/utils/stats';
import type { TeamData, TeamInfo, TrendsViewProps } from '@/features/stats';

interface PowerRankingsEvolutionProps extends Pick<TrendsViewProps, 'allTeamEntries'> {
  dataset: PlainStatsDataset;
}

interface PowerRankingData {
  teamKey: string;
  teamInfo: TeamInfo;
  weeklyRanks: number[];
  weeklyScores: number[];
  trend: string;
  recordText: string;
  totalPoints: number;
}

const calculateZScore = (values: number[]): number[] => {
  if (values.length === 0) return [];
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / values.length,
  );

  if (stdDev === 0) {
    return values.map(() => 0);
  }

  return values.map(value => (value - avg) / stdDev);
};

const buildRecordText = (teamData: TeamData | undefined) => {
  if (!teamData) return '0-0';

  let wins = 0;
  let losses = 0;
  let ties = 0;
  let totalPoints = 0;

  teamData.teamScores.forEach((teamScore, index) => {
    const opponent = teamData.opponentScores[index];
    if (teamScore.value > 0 && opponent) {
      totalPoints += teamScore.value;
      if (teamScore.value > opponent.value) wins++;
      else if (teamScore.value < opponent.value) losses++;
      else ties++;
    }
  });

  const record = ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
  return { record, totalPoints };
};

const usePowerRankingRows = (
  allTeamEntries: [string, TeamData][],
  dataset: PlainStatsDataset,
): PowerRankingData[] => {
  return useMemo(() => {
    if (!dataset.currentWeek || dataset.currentWeek <= 1) {
      return [];
    }

    const weeklyPowerRankings = new Map<
      string,
      {
        teamInfo: TeamInfo;
        weeklyScores: number[];
        weeklyRanks: number[];
        trend: string;
      }
    >();

    for (let week = 1; week <= dataset.currentWeek - 1; week++) {
      const weekTeams = allTeamEntries
        .map(([key, team]) => {
          const weeklyScores = team.teamScores
            .filter(score => score.week <= week && score.value > 0)
            .map(score => score.value);

          if (weeklyScores.length === 0) {
            return null;
          }

          const avgPoints =
            weeklyScores.reduce((sum, score) => sum + score, 0) / weeklyScores.length;

          let expectedWins = 0;
          for (let checkWeek = 1; checkWeek <= week; checkWeek++) {
            const myScore = team.teamScores.find(score => score.week === checkWeek)?.value || 0;
            if (myScore > 0) {
              let winsThisWeek = 0;
              let gamesThisWeek = 0;
              for (const [, otherTeam] of allTeamEntries) {
                const opponentScore =
                  otherTeam.teamScores.find(score => score.week === checkWeek)?.value || 0;
                if (opponentScore > 0) {
                  gamesThisWeek++;
                  if (myScore > opponentScore) winsThisWeek++;
                }
              }
              expectedWins += gamesThisWeek > 0 ? winsThisWeek / gamesThisWeek : 0;
            }
          }

          const rollingScores = weeklyScores.slice(-3);
          const rolling3Avg =
            rollingScores.reduce((sum, score) => sum + score, 0) / rollingScores.length;

          return {
            key,
            teamInfo: team.teamInfo,
            avgPoints,
            expectedWins,
            rolling3Avg,
          };
        })
        .filter(Boolean) as Array<{
        key: string;
        teamInfo: TeamInfo;
        avgPoints: number;
        expectedWins: number;
        rolling3Avg: number;
      }>;

      if (weekTeams.length === 0) continue;

      const avgPointsValues = weekTeams.map(team => team.avgPoints);
      const expectedWinsValues = weekTeams.map(team => team.expectedWins);
      const rollingValues = weekTeams.map(team => team.rolling3Avg);

      const zAvgPoints = calculateZScore(avgPointsValues);
      const zExpectedWins = calculateZScore(expectedWinsValues);
      const zRolling = calculateZScore(rollingValues);

      const powerData = weekTeams.map((team, index) => {
        const powerScore =
          0.5 * zAvgPoints[index] + 0.3 * zExpectedWins[index] + 0.2 * zRolling[index];

        return {
          ...team,
          powerScore: Math.round((100 + powerScore * 15) * 100) / 100,
        };
      });

      powerData.sort((a, b) => b.powerScore - a.powerScore);

      powerData.forEach((team, index) => {
        if (!weeklyPowerRankings.has(team.key)) {
          weeklyPowerRankings.set(team.key, {
            teamInfo: team.teamInfo,
            weeklyScores: [],
            weeklyRanks: [],
            trend: '',
          });
        }
        const ranking = weeklyPowerRankings.get(team.key)!;
        ranking.weeklyScores.push(team.powerScore);
        ranking.weeklyRanks.push(index + 1);
      });
    }

    weeklyPowerRankings.forEach(data => {
      const { weeklyRanks } = data;
      if (weeklyRanks.length < 2) {
        data.trend = '➡️';
        return;
      }

      const recent = weeklyRanks.slice(-2);
      const change = recent[0] - recent[1];
      if (change < -2) data.trend = '🚀';
      else if (change > 2) data.trend = '📉';
      else data.trend = '➡️';
    });

    return Array.from(weeklyPowerRankings.entries())
      .sort((a, b) => {
        const aRank = a[1].weeklyRanks[a[1].weeklyRanks.length - 1] ?? 999;
        const bRank = b[1].weeklyRanks[b[1].weeklyRanks.length - 1] ?? 999;
        return aRank - bRank;
      })
      .map(([teamKey, data]) => {
        const teamData = allTeamEntries.find(([key]) => key === teamKey)?.[1];
        const { record, totalPoints } = buildRecordText(teamData) as {
          record: string;
          totalPoints: number;
        };
        return {
          teamKey,
          teamInfo: data.teamInfo,
          weeklyRanks: data.weeklyRanks,
          weeklyScores: data.weeklyScores,
          trend: data.trend,
          recordText: record,
          totalPoints,
        };
      });
  }, [allTeamEntries, dataset.currentWeek]);
};

export const PowerRankingsEvolution = ({
  allTeamEntries,
  dataset,
}: PowerRankingsEvolutionProps) => {
  const powerRankingRows = usePowerRankingRows(allTeamEntries, dataset);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Power Rankings Evolution</CardTitle>
        <CardDescription>
          Advanced power rankings using 50% avg points, 30% expected wins, 20% rolling average.
          Higher scores = stronger teams.
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
              {powerRankingRows.map(row => (
                <tr key={row.teamKey} className="border-t hover:bg-muted/10">
                  <td className="sticky left-0 z-10 bg-background border-r px-3 py-2">
                    <div className="font-medium">{row.teamInfo.teamName}</div>
                    <div className="text-xs text-muted-foreground">{row.teamInfo.leagueName}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-mono">{row.recordText}</span>
                      {' • '}
                      <span className="font-mono">{row.totalPoints.toFixed(1)} pts</span>
                    </div>
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
                            {weekScore?.toFixed(2)}
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
          <h4 className="font-semibold mb-2">Power Rankings Formula</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
            <div>
              <p>
                <strong>Components:</strong> 50% Avg Points + 30% Expected Wins + 20% Rolling 3-Week
                Avg
              </p>
            </div>
            <div>
              <p>
                <strong>Trends:</strong> 🚀 Rising Power (rank up 3+), ➡️ Stable, 📉 Declining Power
                (rank down 3+)
              </p>
            </div>
          </div>
          <div className="mt-2">
            <p>
              <strong>Score Range:</strong> ~70-130, where higher = stronger team. Accounts for
              consistency, recent form, and opponent strength.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
