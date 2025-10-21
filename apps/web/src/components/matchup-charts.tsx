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
import { colors } from '@/lib/colors';

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
 * Game window type for NFL game slots
 */
interface GameWindow {
  label: string;
  startTime: Date;
}

/**
 * Filter out consecutive duplicate data points to reduce noise
 * Keeps a point only if score or win probability has changed from the previous point
 */
const filterConsecutiveDuplicates = (series: ChartSeriesPoint[]): ChartSeriesPoint[] => {
  if (series.length === 0) return [];

  const filtered: ChartSeriesPoint[] = [series[0]]; // Always keep first point

  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1];
    const curr = series[i];

    // Keep point if any value has changed
    const scoreChanged = prev.team1Score !== curr.team1Score || prev.team2Score !== curr.team2Score;

    const winProbChanged = prev.team1WinProbability !== curr.team1WinProbability;

    if (scoreChanged || winProbChanged) {
      filtered.push(curr);
    }
  }

  // Always keep last point if it's not already included
  if (series.length > 1 && filtered[filtered.length - 1] !== series[series.length - 1]) {
    filtered.push(series[series.length - 1]);
  }

  return filtered;
};

/**
 * Check if a timestamp is during an NFL game window
 * Game windows are ONLY the specific time periods when NFL games are played
 *
 * This is intentionally strict to compress non-game data and emphasize
 * the interesting changes that happen during actual games.
 */
const isInGameWindow = (timestamp: Date): boolean => {
  const dayOfWeek = timestamp.getUTCDay();
  const hourUTC = timestamp.getUTCHours();

  // Thursday Night Football ONLY
  // 8:15 PM ET Thursday = 00:15 UTC Friday (accounting for EDT/EST)
  // Game window: Thu 10pm UTC - Fri 4am UTC (8 hour window)
  if (dayOfWeek === 4 && hourUTC >= 22) return true;
  if (dayOfWeek === 5 && hourUTC <= 4) return true;

  // Sunday games ONLY
  // Early games: 1:00 PM ET = 17:00 UTC (EDT) or 18:00 UTC (EST)
  // Late games: 4:05/4:25 PM ET = 20:05/20:25 or 21:05/21:25 UTC
  // SNF: 8:20 PM ET = 00:20 or 01:20 UTC Monday
  // Window: Sun 5pm UTC - Mon 4am UTC (captures all Sunday games)
  if (dayOfWeek === 0 && hourUTC >= 17) return true;
  if (dayOfWeek === 1 && hourUTC <= 4) return true;

  // Monday Night Football ONLY
  // 8:15 PM ET Monday = 00:15 or 01:15 UTC Tuesday
  // Window: Mon 10pm UTC - Tue 4am UTC (8 hour window)
  if (dayOfWeek === 1 && hourUTC >= 22) return true;
  if (dayOfWeek === 2 && hourUTC <= 4) return true;

  // No Friday/Saturday games by default
  // These are rare and only happen in special circumstances
  // If needed, manually adjust for specific weeks

  return false;
};

/**
 * Compress data to reduce non-game-time noise while preserving game-time detail
 *
 * Strategy:
 * - During NFL game windows: Keep all data points (high detail)
 * - Outside game windows: Keep only 1-2 points per 12-hour segment
 *
 * This makes the interesting game-time data dominate the chart.
 */
const compressNonGameData = (series: ChartSeriesPoint[]): ChartSeriesPoint[] => {
  if (series.length === 0) return [];

  const compressed: ChartSeriesPoint[] = [];
  let currentSegment: ChartSeriesPoint[] = [];
  let lastSegmentKey = '';
  let isCurrentlyInGame = false;

  for (let i = 0; i < series.length; i++) {
    const point = series[i];
    const timestamp = new Date(point.timestamp);
    const inGameWindow = isInGameWindow(timestamp);

    // Create a segment key: YYYY-MM-DD-AM/PM (12-hour segments)
    const dateStr = timestamp.toISOString().split('T')[0];
    const period = timestamp.getUTCHours() < 12 ? 'AM' : 'PM';
    const segmentKey = `${dateStr}-${period}`;

    // If we're in a game window, keep all points
    if (inGameWindow) {
      // Flush any accumulated non-game segment first
      if (currentSegment.length > 0 && !isCurrentlyInGame) {
        // Keep first and last point of non-game segment
        compressed.push(currentSegment[0]);
        if (currentSegment.length > 1) {
          compressed.push(currentSegment[currentSegment.length - 1]);
        }
        currentSegment = [];
      }

      compressed.push(point);
      isCurrentlyInGame = true;
      lastSegmentKey = segmentKey;
    }
    // Outside game window - compress aggressively
    else {
      // If entering a new segment, flush the old one
      if (segmentKey !== lastSegmentKey && currentSegment.length > 0) {
        // Keep first and last point of segment
        compressed.push(currentSegment[0]);
        if (currentSegment.length > 1) {
          compressed.push(currentSegment[currentSegment.length - 1]);
        }
        currentSegment = [];
      }

      currentSegment.push(point);
      isCurrentlyInGame = false;
      lastSegmentKey = segmentKey;
    }
  }

  // Flush any remaining segment
  if (currentSegment.length > 0) {
    compressed.push(currentSegment[0]);
    if (currentSegment.length > 1) {
      compressed.push(currentSegment[currentSegment.length - 1]);
    }
  }

  return compressed;
};

/**
 * Format timestamp to EST with day and time
 * Example: "Thu 8PM", "Sun 1PM", "Mon 11PM"
 */
const formatTimestampEST = (timestamp: Date): string => {
  // Convert to EST (UTC-5) or EDT (UTC-4) - using a simple approach
  // Note: This doesn't handle DST transitions perfectly but works for display
  const estDate = new Date(timestamp.getTime() - 5 * 60 * 60 * 1000);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = dayNames[estDate.getUTCDay()];

  let hours = estDate.getUTCHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert to 12-hour format

  return `${day} ${hours}${ampm}`;
};

/**
 * Generate time-based tick marks for X-axis
 * Spreads ticks evenly across the timeline to show actual timestamps in EST
 */
const generateTimeTicks = (
  data: Array<{ idx: number; timestamp: Date }>,
): Array<{ value: number; label: string }> => {
  if (data.length === 0) return [];

  const ticks: Array<{ value: number; label: string }> = [];

  // Aim for ~6-8 ticks across the timeline
  const targetTickCount = Math.min(8, Math.max(4, Math.floor(data.length / 10)));
  const step = Math.max(1, Math.floor(data.length / targetTickCount));

  // Always include first tick
  ticks.push({
    value: data[0].idx,
    label: formatTimestampEST(data[0].timestamp),
  });

  // Add intermediate ticks
  for (let i = step; i < data.length - step; i += step) {
    ticks.push({
      value: data[i].idx,
      label: formatTimestampEST(data[i].timestamp),
    });
  }

  // Always include last tick if we have more than one data point
  if (data.length > 1) {
    ticks.push({
      value: data[data.length - 1].idx,
      label: formatTimestampEST(data[data.length - 1].timestamp),
    });
  }

  return ticks;
};

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

  // Compress non-game data and prepare chart data
  const { data, ticks } = useMemo(() => {
    // First filter consecutive duplicates, then compress non-game windows
    const filtered = filterConsecutiveDuplicates(series);
    const compressed = compressNonGameData(filtered);

    const chartData = compressed.map((p, idx) => ({
      idx,
      t: new Date(p.timestamp).toLocaleString(),
      timestamp: new Date(p.timestamp),
      teamA: Math.round((p.team1WinProbability || 0) * 1000) / 10,
      teamB: Math.round((1 - (p.team1WinProbability || 0)) * 1000) / 10,
    }));

    const timeTicks = generateTimeTicks(chartData);

    return { data: chartData, ticks: timeTicks };
  }, [series]);

  if (!data.length) return null;

  return (
    <div className="h-48 w-full min-w-0 select-none">
      <LineChart width={600} height={192} data={data} className="w-full h-full">
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
        <XAxis
          dataKey="idx"
          stroke={chartColors.axis}
          tick={{ fontSize: 10, fill: chartColors.axis }}
          ticks={ticks.map(t => t.value)}
          tickFormatter={(value: number) => {
            const tick = ticks.find(t => t.value === value);
            return tick ? tick.label : '';
          }}
          height={40}
          angle={-45}
          textAnchor="end"
        />
        <YAxis
          domain={[0, 100]}
          stroke={chartColors.axis}
          width={32}
          tick={{ fontSize: 10, fill: chartColors.axis }}
          label={{
            value: 'Win %',
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 10, fill: chartColors.axis },
          }}
        />
        <Tooltip
          contentStyle={{
            background: chartColors.tooltip.background,
            color: chartColors.tooltip.text,
            border: `1px solid ${colors.core.crimsonRed}`,
            borderRadius: '6px',
            padding: '8px',
          }}
          labelFormatter={(label: number) => data[label]?.t || ''}
          formatter={(value: number, name: string) => [`${value}%`, name]}
        />
        <Legend
          verticalAlign="top"
          align="right"
          wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
        />
        <Line
          type="monotone"
          dataKey="teamA"
          name={teamAName}
          stroke={colors.core.crimsonRed}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="teamB"
          name={teamBName}
          stroke={colors.core.regalGold}
          strokeWidth={2}
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

  // Compress non-game data and prepare chart data
  const { data, ticks } = useMemo(() => {
    // First filter consecutive duplicates, then compress non-game windows
    const filtered = filterConsecutiveDuplicates(series);
    const compressed = compressNonGameData(filtered);

    const chartData = compressed
      .filter(p => p.team1Score != null && p.team2Score != null)
      .map((p, idx) => ({
        idx,
        t: new Date(p.timestamp).toLocaleString(),
        timestamp: new Date(p.timestamp),
        teamA: Number(p.team1Score),
        teamB: Number(p.team2Score),
      }));

    const timeTicks = generateTimeTicks(chartData);

    return { data: chartData, ticks: timeTicks };
  }, [series]);

  if (!data.length) return null;

  return (
    <div className="h-48 w-full min-w-0 select-none">
      <LineChart width={600} height={192} data={data} className="w-full h-full">
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
        <XAxis
          dataKey="idx"
          stroke={chartColors.axis}
          tick={{ fontSize: 10, fill: chartColors.axis }}
          ticks={ticks.map(t => t.value)}
          tickFormatter={(value: number) => {
            const tick = ticks.find(t => t.value === value);
            return tick ? tick.label : '';
          }}
          height={40}
          angle={-45}
          textAnchor="end"
        />
        <YAxis
          domain={[0, 'auto']}
          stroke={chartColors.axis}
          width={32}
          tick={{ fontSize: 10, fill: chartColors.axis }}
          label={{
            value: 'Points',
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 10, fill: chartColors.axis },
          }}
        />
        <Tooltip
          contentStyle={{
            background: chartColors.tooltip.background,
            color: chartColors.tooltip.text,
            border: `1px solid ${colors.core.crimsonRed}`,
            borderRadius: '6px',
            padding: '8px',
          }}
          labelFormatter={(label: number) => data[label]?.t || ''}
          formatter={(value: number, name: string) => [value.toFixed(1), name]}
        />
        <Legend
          verticalAlign="top"
          align="right"
          wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
        />
        <Line
          type="monotone"
          dataKey="teamA"
          name={teamAName}
          stroke={colors.core.crimsonRed}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="teamB"
          name={teamBName}
          stroke={colors.core.regalGold}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  );
};
