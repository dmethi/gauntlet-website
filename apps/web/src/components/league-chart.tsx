'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer, ChartLegend } from '@gauntlet/ui';
import { dataVizColors } from '@/lib/colors';

interface WeeklyAverage {
  week: number;
  averagePoints: number;
  matchupCount?: number;
  totalPoints?: number;
}

interface LeagueChartProps {
  data: WeeklyAverage[];
}

export function LeagueChart({ data }: LeagueChartProps) {
  const seriesColor = dataVizColors.performance[8];

  if (!data || data.length === 0) {
    return (
      <ChartContainer
        title='League Scoring Trends'
        description='Average points by week'
        height={384}
        empty
        actions={<ChartLegend items={[{ label: 'League Average', color: seriesColor }]} />}
      >
        <></>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title='League Scoring Trends'
      description='Average points by week'
      height={384}
      actions={<ChartLegend items={[{ label: 'League Average', color: seriesColor }]} />}
    >
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--muted))' />
          <XAxis
            dataKey='week'
            type='number'
            domain={['dataMin', 'dataMax']}
            tickCount={data.length}
            stroke='hsl(var(--muted-foreground))'
          />
          <YAxis domain={[0, 'auto']} tickCount={10} stroke='hsl(var(--muted-foreground))' />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--card-foreground))',
            }}
          />
          <Legend />
          <Line
            type='monotone'
            dataKey='averagePoints'
            stroke={seriesColor}
            name='League Average'
            dot={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
