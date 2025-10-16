import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { colors } from '@/lib/colors';
import { mean, median } from '@/shared/utils/stats';
import type { TeamData, TrendsViewProps } from '@/features/stats';

interface ConsistencyRow {
  teamKey: string;
  teamName: string;
  leagueName: string;
  median: number;
  mean: number;
  min: number;
  max: number;
  range: number;
  stdDev: number;
  gamesPlayed: number;
  scores: number[];
  consistency: number;
}

const useConsistencyData = (allTeamEntries: [string, TeamData][]): ConsistencyRow[] => {
  return useMemo(() => {
    return allTeamEntries
      .map(([teamKey, team]) => {
        const weeklyScores = team.teamScores
          .filter(score => score.value > 0)
          .map(score => score.value)
          .sort((a, b) => a - b);

        if (weeklyScores.length === 0) {
          return null;
        }

        const medianValue = median(weeklyScores);
        const meanValue = mean(weeklyScores);
        const minScore = weeklyScores[0];
        const maxScore = weeklyScores[weeklyScores.length - 1];
        const range = maxScore - minScore;
        const stdDev = Math.sqrt(
          weeklyScores.reduce((sum, score) => sum + Math.pow(score - meanValue, 2), 0) /
            weeklyScores.length,
        );

        return {
          teamKey,
          teamName: team.teamInfo.teamName,
          leagueName: team.teamInfo.leagueName,
          median: medianValue,
          mean: meanValue,
          min: minScore,
          max: maxScore,
          range,
          stdDev,
          gamesPlayed: weeklyScores.length,
          scores: weeklyScores,
          consistency: 100 - Math.min(stdDev * 3, 100),
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b!.consistency ?? 0) - (a!.consistency ?? 0)) as ConsistencyRow[];
  }, [allTeamEntries]);
};

const getConsistencyDescriptor = (stdDev: number) => {
  if (stdDev < 15) return '🎯 Very Steady';
  if (stdDev < 25) return '📊 Somewhat Predictable';
  return '🎲 Highly Volatile';
};

export const TeamConsistencyAnalysis = ({
  allTeamEntries,
}: Pick<TrendsViewProps, 'allTeamEntries'>) => {
  const data = useConsistencyData(allTeamEntries);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Consistency Analysis</CardTitle>
        <CardDescription>
          Consistency scores showing scoring reliability vs volatility. Higher bars = more
          predictable teams.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <XAxis
                dataKey="teamName"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                label={{ value: 'Consistency Score', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 11 }}
                domain={[0, 100]}
                tickFormatter={value => Number(value).toFixed(0)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }

                  const row = payload[0].payload as ConsistencyRow;

                  return (
                    <div
                      className="p-4 rounded-lg shadow-xl border min-w-[320px]"
                      style={{
                        backgroundColor: colors.core.charcoalSteel,
                        borderColor: colors.core.regalGold,
                        color: 'white',
                      }}
                    >
                      <div
                        className="font-bold text-lg mb-1"
                        style={{ color: colors.core.regalGold }}
                      >
                        {row.teamName}
                      </div>
                      <div className="text-xs text-gray-300 mb-3">{row.leagueName}</div>
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="font-semibold">Consistency Score</div>
                            <div className="text-lg font-bold">
                              {row.consistency.toFixed(1)}/100
                            </div>
                            <div className="text-xs text-gray-400">
                              {getConsistencyDescriptor(row.stdDev)}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold">Score Range</div>
                            <div className="text-lg font-bold">{row.range.toFixed(1)}</div>
                            <div className="text-xs text-gray-400">
                              {row.min.toFixed(1)} - {row.max.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-gray-600 pt-2">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              Median: <span className="font-semibold">{row.median.toFixed(1)}</span>
                            </div>
                            <div>
                              Mean: <span className="font-semibold">{row.mean.toFixed(1)}</span>
                            </div>
                            <div>
                              Std Dev:{' '}
                              <span className="font-semibold">{row.stdDev.toFixed(1)}</span>
                            </div>
                            <div>
                              Games: <span className="font-semibold">{row.gamesPlayed}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="consistency">
                {data.map(row => (
                  <Cell key={row.teamKey} fill={colors.core.regalGold} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-3 bg-muted/20 rounded-md text-xs">
          <h4 className="font-semibold mb-2">How to Read Consistency</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground">
            <div>
              <span className="font-semibold">🎯 Steady Teams:</span> Low standard deviation
              (&lt;15), narrow score ranges. Reliable for playoffs.
            </div>
            <div>
              <span className="font-semibold">📊 Average Teams:</span> Medium volatility (15-25 std
              dev). Some variance but predictable.
            </div>
            <div>
              <span className="font-semibold">🎲 Volatile Teams:</span> High volatility (&gt;25 std
              dev). Boom-or-bust potential.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
