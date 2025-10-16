'use client';

import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { colors } from '@/lib/colors';
import type { WeeklyDifficultyPoint } from './utils';

interface WeeklyDifficultyChartProps {
  readonly points: WeeklyDifficultyPoint[];
}

interface AggregatedWeekPoint {
  week: number;
  averageDifficulty: number;
}

export const WeeklyDifficultyChart = memo<WeeklyDifficultyChartProps>(({ points }) => {
  const aggregate = useMemo(() => {
    const buckets = new Map<number, { total: number; count: number }>();
    for (const point of points) {
      const bucket = buckets.get(point.week) ?? { total: 0, count: 0 };
      bucket.total += point.difficulty;
      bucket.count += 1;
      buckets.set(point.week, bucket);
    }

    const aggregated: AggregatedWeekPoint[] = Array.from(buckets.entries())
      .map(([week, bucket]) => ({ week, averageDifficulty: bucket.total / bucket.count }))
      .sort((a, b) => a.week - b.week);

    return aggregated;
  }, [points]);

  if (!aggregate.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Difficulty Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aggregate}>
              <XAxis
                dataKey="week"
                label={{ value: 'Week', position: 'insideBottom', offset: -4 }}
              />
              <YAxis
                tickFormatter={value => `${value > 0 ? '+' : ''}${value.toFixed(1)}`}
                label={{ value: 'Difficulty (vs. league avg)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={value => [`${Number(value).toFixed(2)}`, 'Difficulty']}
                labelFormatter={week => `Week ${week}`}
              />
              <Bar dataKey="averageDifficulty">
                {aggregate.map((entry, index) => {
                  const color =
                    entry.averageDifficulty >= 0 ? colors.core.crimsonRed : colors.core.regalGold;
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Positive values indicate opponents performed above the league average in that week (harder
          schedule). Negative values indicate below-average opposition (easier week).
        </p>
      </CardContent>
    </Card>
  );
});

WeeklyDifficultyChart.displayName = 'WeeklyDifficultyChart';
