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
 * Determine game window label based on timestamp
 * Maps to NFL game windows: Thursday Night, Sunday Early/Afternoon/Night, Monday Night
 */
const getGameWindowLabel = (timestamp: Date): string => {
  const dayOfWeek = timestamp.getUTCDay(); // 0 = Sunday, 4 = Thursday, 1 = Monday
  const hourUTC = timestamp.getUTCHours();

  // Thursday Night Football (typically 8:15 PM ET = 00:15 UTC Friday)
  if (dayOfWeek === 4 || (dayOfWeek === 5 && hourUTC === 0)) {
    return 'Thu Night';
  }
  // Sunday games
  else if (dayOfWeek === 0) {
    // Sunday Night Football (8:20 PM ET = 00:20 UTC Monday)
    if (hourUTC === 0 || hourUTC === 1) {
      return 'Sun Night';
    }
    // Late afternoon (4:05 or 4:25 PM ET = 20:05 or 20:25 UTC)
    else if (hourUTC >= 20 && hourUTC < 23) {
      return 'Sun Late';
    }
    // Early games (1:00 PM ET = 17:00 UTC or 9:30am games = 13:30 UTC)
    else {
      return 'Sun Early';
    }
  }
  // Monday Night Football (8:15 PM ET = 00:15 UTC Tuesday)
  else if (dayOfWeek === 1 || (dayOfWeek === 2 && hourUTC === 0)) {
    return 'Mon Night';
  }
  // Saturday games (late season)
  else if (dayOfWeek === 6) {
    return 'Saturday';
  }
  // Friday games (international/special games)
  else if (dayOfWeek === 5 && hourUTC > 1) {
    return 'Friday';
  }

  return '';
};

/**
 * Generate game window tick marks for X-axis
 * Identifies unique game windows and their positions in the data
 */
const generateGameWindowTicks = (
  data: Array<{ idx: number; timestamp: Date }>,
): Array<{ value: number; label: string }> => {
  if (data.length === 0) return [];

  const windows: Array<{ value: number; label: string }> = [];
  let lastWindow = '';

  for (let i = 0; i < data.length; i++) {
    const windowLabel = getGameWindowLabel(data[i].timestamp);

    // Add tick when we enter a new game window
    if (windowLabel && windowLabel !== lastWindow) {
      windows.push({
        value: data[i].idx,
        label: windowLabel,
      });
      lastWindow = windowLabel;
    }
  }

  return windows;
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

    const gameTicks = generateGameWindowTicks(chartData);

    return { data: chartData, ticks: gameTicks };
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

    const gameTicks = generateGameWindowTicks(chartData);

    return { data: chartData, ticks: gameTicks };
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
