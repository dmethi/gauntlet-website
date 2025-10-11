/**
 * Matchup Charts Components
 *
 * Shared chart components for displaying win probability and score progression
 * over time. Used by both the recap reports and matchup detail pages.
 */

'use client';

import { useMemo } from 'react';
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useChartColors } from '@/shared/utils/colors';

/**
 * Time series data point shape expected by both charts
 */
export interface ChartSeriesPoint {
  timestamp: string;
  team1Score?: number;
  team2Score?: number;
  team1WinProbability?: number;
  gameProgress?: number;
}

/**
 * Win Probability Over Time Chart
 *
 * Displays how win probability changed throughout the week/game.
 * Shows both teams' win probability lines with interactive tooltips.
 *
 * @param series - Array of time series data points
 * @param teamAName - Display name for team A
 * @param teamBName - Display name for team B
 */
export const WinProbChart = ({
  series,
  teamAName,
  teamBName,
}: {
  series: ChartSeriesPoint[];
  teamAName: string;
  teamBName: string;
}) => {
  const chartColors = useChartColors();
  const data = useMemo(
    () =>
      series.map((p, idx) => ({
        idx,
        t: new Date(p.timestamp).toLocaleString(),
        A: Math.round((p.team1WinProbability || 0) * 1000) / 10,
        B: Math.round((1 - (p.team1WinProbability || 0)) * 1000) / 10,
      })),
    [series],
  );

  if (!data.length) return null;

  return (
    <div className="h-48 w-full min-w-0 select-none">
      <LineChart width={600} height={192} data={data} className="w-full h-full">
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
        <XAxis dataKey="idx" stroke={chartColors.axis} tick={false} />
        <YAxis domain={[0, 100]} stroke={chartColors.axis} width={28} />
        <Tooltip
          contentStyle={{
            background: chartColors.tooltip.background,
            color: chartColors.tooltip.text,
            border: `1px solid ${chartColors.brandPrimary}`,
          }}
          labelFormatter={(label: number) => data[label]?.t || ''}
          formatter={(value: number, name: string) => [
            `${value}%`,
            name === 'A' ? teamAName : teamBName,
          ]}
        />
        <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="A"
          name={teamAName}
          stroke={chartColors.primary}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="B"
          name={teamBName}
          stroke={chartColors.secondary}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  );
};

/**
 * Score Over Time Chart
 *
 * Displays how scores accumulated throughout the week/game.
 * Shows both teams' score progression lines with interactive tooltips.
 *
 * @param series - Array of time series data points
 * @param teamAName - Display name for team A
 * @param teamBName - Display name for team B
 */
export const ScoreChart = ({
  series,
  teamAName,
  teamBName,
}: {
  series: ChartSeriesPoint[];
  teamAName: string;
  teamBName: string;
}) => {
  const chartColors = useChartColors();
  const data = useMemo(
    () =>
      series
        .filter(p => p.team1Score != null && p.team2Score != null)
        .map((p, idx) => ({
          idx,
          t: new Date(p.timestamp).toLocaleString(),
          A: Number(p.team1Score),
          B: Number(p.team2Score),
        })),
    [series],
  );

  if (!data.length) return null;

  return (
    <div className="h-48 w-full min-w-0 select-none">
      <LineChart width={600} height={192} data={data} className="w-full h-full">
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
        <XAxis dataKey="idx" stroke={chartColors.axis} tick={false} />
        <YAxis domain={[0, 'auto']} stroke={chartColors.axis} width={28} />
        <Tooltip
          contentStyle={{
            background: chartColors.tooltip.background,
            color: chartColors.tooltip.text,
            border: `1px solid ${chartColors.brandPrimary}`,
          }}
          labelFormatter={(label: number) => data[label]?.t || ''}
          formatter={(value: number, name: string) => [
            value.toFixed(1),
            name === 'A' ? teamAName : teamBName,
          ]}
        />
        <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="A"
          name={teamAName}
          stroke={chartColors.primary}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="B"
          name={teamBName}
          stroke={chartColors.secondary}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  );
};

