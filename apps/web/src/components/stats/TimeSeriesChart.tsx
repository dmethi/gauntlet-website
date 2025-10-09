'use client';

import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface ChartSeries {
  key: string;
  data: Array<{ week: number; value: number }>;
  color: string;
  strokeDasharray?: string;
}

export interface TimeSeriesChartProps {
  series: ChartSeries[];
  overlays?: {
    median?: number;
    average?: number;
  };
  height?: number;
  viewMode?: 'raw' | 'rank24' | 'rankLeague';
}

export const TimeSeriesChart = ({
  series,
  overlays,
  height = 300,
  viewMode = 'raw',
}: TimeSeriesChartProps) => {
  // Transform data for Recharts format
  const weeks = new Set<number>();
  series.forEach(s => s.data.forEach(d => weeks.add(d.week)));
  const sortedWeeks = Array.from(weeks).sort((a, b) => a - b);

  const chartData = sortedWeeks.map(week => {
    const dataPoint: any = { week };
    series.forEach(s => {
      const value = s.data.find(d => d.week === week)?.value || 0;
      dataPoint[s.key] = value;
    });
    return dataPoint;
  });

  const yAxisLabel =
    viewMode === 'raw' ? 'Points' : viewMode === 'rank24' ? 'Rank (24)' : 'Rank (League)';
  const yDomain = viewMode === 'raw' ? undefined : [1, viewMode === 'rank24' ? 24 : 12];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="week"
          label={{ value: 'Week', position: 'insideBottom', offset: -5 }}
          className="text-xs"
        />
        <YAxis
          label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
          domain={yDomain}
          reversed={viewMode !== 'raw'}
          className="text-xs"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
        />
        <Legend />

        {/* Overlay lines */}
        {overlays?.median && (
          <ReferenceLine
            y={overlays.median}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="5 5"
            label={{ value: 'Median', position: 'right' }}
          />
        )}
        {overlays?.average && (
          <ReferenceLine
            y={overlays.average}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="3 3"
            label={{ value: 'Average', position: 'right' }}
          />
        )}

        {/* Data lines */}
        {series.map(s => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={s.color}
            strokeWidth={2}
            strokeDasharray={s.strokeDasharray}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
