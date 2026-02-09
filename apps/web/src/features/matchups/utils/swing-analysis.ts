/**
 * Swing Analysis Utilities
 *
 * Identifies momentum shifts in matchups by analyzing win probability changes
 * and tracking what drove those changes (score deltas, projection changes)
 */

import type { TimeSeriesPoint } from '../hooks/useMatchupTimeSeries';

export interface SwingPoint {
  /** Unique identifier for the swing */
  id: string;
  /** Timestamp of the swing point */
  timestamp: Date;
  /** Index in the time series */
  index: number;
  /** Previous data point (before the swing) */
  before: {
    timestamp: Date;
    winProbA: number;
    scoreA: number;
    scoreB: number;
    projectedFinalA: number;
    projectedFinalB: number;
  };
  /** Current data point (after the swing) */
  after: {
    timestamp: Date;
    winProbA: number;
    scoreA: number;
    scoreB: number;
    projectedFinalA: number;
    projectedFinalB: number;
  };
  /** Win probability change (positive = Team A gained, negative = Team A lost) */
  winProbChange: number;
  /** Absolute win probability change */
  winProbChangeMagnitude: number;
  /** Team A score change */
  scoreChangeA: number;
  /** Team B score change */
  scoreChangeB: number;
  /** Team A projection change */
  projectionChangeA: number;
  /** Team B projection change */
  projectionChangeB: number;
  /** Time elapsed between samples (in minutes) */
  timeElapsed: number;
  /** Type of swing detected */
  type: 'consecutive' | 'window';
}

/**
 * Detect swings between consecutive time series samples
 *
 * @param series - Full time series data
 * @param threshold - Minimum win probability change (as decimal, e.g., 0.05 for 5%)
 * @returns Array of detected swing points
 */
export const detectConsecutiveSwings = (
  series: TimeSeriesPoint[],
  threshold: number = 0.05,
): SwingPoint[] => {
  const swings: SwingPoint[] = [];

  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1];
    const curr = series[i];

    const winProbChange = curr.team1WinProbability - prev.team1WinProbability;
    const winProbChangeMagnitude = Math.abs(winProbChange);

    // Check if swing exceeds threshold
    if (winProbChangeMagnitude >= threshold) {
      const prevTime = new Date(prev.timestamp);
      const currTime = new Date(curr.timestamp);
      const timeElapsed = (currTime.getTime() - prevTime.getTime()) / (1000 * 60); // minutes

      swings.push({
        id: `consecutive-${i}`,
        timestamp: currTime,
        index: i,
        before: {
          timestamp: prevTime,
          winProbA: prev.team1WinProbability,
          scoreA: prev.team1Score,
          scoreB: prev.team2Score,
          projectedFinalA: prev.projectedFinalA,
          projectedFinalB: prev.projectedFinalB,
        },
        after: {
          timestamp: currTime,
          winProbA: curr.team1WinProbability,
          scoreA: curr.team1Score,
          scoreB: curr.team2Score,
          projectedFinalA: curr.projectedFinalA,
          projectedFinalB: curr.projectedFinalB,
        },
        winProbChange,
        winProbChangeMagnitude,
        scoreChangeA: curr.team1Score - prev.team1Score,
        scoreChangeB: curr.team2Score - prev.team2Score,
        projectionChangeA: curr.projectedFinalA - prev.projectedFinalA,
        projectionChangeB: curr.projectedFinalB - prev.projectedFinalB,
        timeElapsed,
        type: 'consecutive',
      });
    }
  }

  return swings;
};

/**
 * Detect swings within a rolling time window
 *
 * @param series - Full time series data
 * @param threshold - Minimum win probability change (as decimal, e.g., 0.20 for 20%)
 * @param windowMinutes - Time window in minutes (default 15)
 * @returns Array of detected swing points
 */
export const detectWindowSwings = (
  series: TimeSeriesPoint[],
  threshold: number = 0.2,
  windowMinutes: number = 15,
): SwingPoint[] => {
  const swings: SwingPoint[] = [];
  const windowMs = windowMinutes * 60 * 1000;

  for (let i = 0; i < series.length; i++) {
    const curr = series[i];
    const currTime = new Date(curr.timestamp).getTime();

    // Look back within the time window
    for (let j = i - 1; j >= 0; j--) {
      const prev = series[j];
      const prevTime = new Date(prev.timestamp).getTime();
      const timeDiff = currTime - prevTime;

      // Stop if we've exceeded the window
      if (timeDiff > windowMs) {
        break;
      }

      const winProbChange = curr.team1WinProbability - prev.team1WinProbability;
      const winProbChangeMagnitude = Math.abs(winProbChange);

      // Check if swing exceeds threshold
      if (winProbChangeMagnitude >= threshold) {
        const timeElapsed = timeDiff / (1000 * 60); // minutes

        swings.push({
          id: `window-${j}-${i}`,
          timestamp: new Date(curr.timestamp),
          index: i,
          before: {
            timestamp: new Date(prev.timestamp),
            winProbA: prev.team1WinProbability,
            scoreA: prev.team1Score,
            scoreB: prev.team2Score,
            projectedFinalA: prev.projectedFinalA,
            projectedFinalB: prev.projectedFinalB,
          },
          after: {
            timestamp: new Date(curr.timestamp),
            winProbA: curr.team1WinProbability,
            scoreA: curr.team1Score,
            scoreB: curr.team2Score,
            projectedFinalA: curr.projectedFinalA,
            projectedFinalB: curr.projectedFinalB,
          },
          winProbChange,
          winProbChangeMagnitude,
          scoreChangeA: curr.team1Score - prev.team1Score,
          scoreChangeB: curr.team2Score - prev.team2Score,
          projectionChangeA: curr.projectedFinalA - prev.projectedFinalA,
          projectionChangeB: curr.projectedFinalB - prev.projectedFinalB,
          timeElapsed,
          type: 'window',
        });
      }
    }
  }

  // Remove duplicates (same swing detected multiple times)
  // Keep the one with the largest magnitude for each unique endpoint
  const uniqueSwings = new Map<number, SwingPoint>();
  for (const swing of swings) {
    const existing = uniqueSwings.get(swing.index);
    if (!existing || swing.winProbChangeMagnitude > existing.winProbChangeMagnitude) {
      uniqueSwings.set(swing.index, swing);
    }
  }

  return Array.from(uniqueSwings.values());
};

/**
 * Get all swings (both consecutive and window-based)
 *
 * @param series - Full time series data
 * @param consecutiveThreshold - Threshold for consecutive swings (default 5%)
 * @param windowThreshold - Threshold for window swings (default 20%)
 * @param windowMinutes - Time window in minutes (default 15)
 * @returns Combined array of all swing points, sorted by timestamp
 */
export const detectAllSwings = (
  series: TimeSeriesPoint[],
  consecutiveThreshold: number = 0.05,
  windowThreshold: number = 0.2,
  windowMinutes: number = 15,
): {
  consecutive: SwingPoint[];
  window: SwingPoint[];
  all: SwingPoint[];
} => {
  const consecutive = detectConsecutiveSwings(series, consecutiveThreshold);
  const window = detectWindowSwings(series, windowThreshold, windowMinutes);

  // Combine and sort by timestamp
  const all = [...consecutive, ...window].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  );

  return { consecutive, window, all };
};

/**
 * Determine which team benefited from a swing
 */
export const getSwingBeneficiary = (swing: SwingPoint): 'teamA' | 'teamB' => {
  return swing.winProbChange > 0 ? 'teamA' : 'teamB';
};

/**
 * Get primary driver of a swing (score vs projection change)
 */
export const getSwingDriver = (
  swing: SwingPoint,
): 'scoreA' | 'scoreB' | 'projectionA' | 'projectionB' | 'mixed' => {
  const absScoreA = Math.abs(swing.scoreChangeA);
  const absScoreB = Math.abs(swing.scoreChangeB);
  const absProjA = Math.abs(swing.projectionChangeA);
  const absProjB = Math.abs(swing.projectionChangeB);

  const maxChange = Math.max(absScoreA, absScoreB, absProjA, absProjB);

  if (absScoreA === maxChange) return 'scoreA';
  if (absScoreB === maxChange) return 'scoreB';
  if (absProjA === maxChange) return 'projectionA';
  if (absProjB === maxChange) return 'projectionB';

  return 'mixed';
};
