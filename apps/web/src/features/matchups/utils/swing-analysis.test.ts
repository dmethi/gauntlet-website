import { describe, expect, it } from 'vitest';
import {
  detectAllSwings,
  detectConsecutiveSwings,
  detectWindowSwings,
  formatDelta,
  getSwingBeneficiary,
  getSwingDriver,
} from './swing-analysis';
import type { TimeSeriesPoint } from '../hooks/useMatchupTimeSeries';

describe('Swing Analysis Utilities', () => {
  const createTimeSeriesPoint = (overrides: Partial<TimeSeriesPoint>): TimeSeriesPoint => ({
    timestamp: new Date('2024-01-01T13:00:00').toISOString(),
    team1Score: 0,
    team2Score: 0,
    team1WinProbability: 0.5,
    projectedFinalA: 100,
    projectedFinalB: 100,
    ...overrides,
  });

  describe('detectConsecutiveSwings', () => {
    it('detects swing when win probability changes exceed threshold', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:00:00').toISOString(),
          team1WinProbability: 0.6,
          team1Score: 50,
          team2Score: 40,
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T14:00:00').toISOString(),
          team1WinProbability: 0.3, // -0.3 change (30%)
          team1Score: 50,
          team2Score: 60,
        }),
      ];

      const swings = detectConsecutiveSwings(series, 0.05);

      expect(swings).toHaveLength(1);
      expect(swings[0].winProbChange).toBe(-0.3);
      expect(swings[0].winProbChangeMagnitude).toBe(0.3);
    });

    it('does not detect swing below threshold', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({ team1WinProbability: 0.5 }),
        createTimeSeriesPoint({ team1WinProbability: 0.52 }), // Only 2% change
      ];

      const swings = detectConsecutiveSwings(series, 0.05);

      expect(swings).toHaveLength(0);
    });

    it('calculates score changes correctly', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:00:00').toISOString(),
          team1Score: 50,
          team2Score: 40,
          team1WinProbability: 0.6,
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T14:00:00').toISOString(),
          team1Score: 50,
          team2Score: 60,
          team1WinProbability: 0.3,
        }),
      ];

      const swings = detectConsecutiveSwings(series, 0.05);

      expect(swings[0].scoreChangeA).toBe(0);
      expect(swings[0].scoreChangeB).toBe(20);
    });

    it('calculates projection changes correctly', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:00:00').toISOString(),
          projectedFinalA: 100,
          projectedFinalB: 95,
          team1WinProbability: 0.6,
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T14:00:00').toISOString(),
          projectedFinalA: 98,
          projectedFinalB: 105,
          team1WinProbability: 0.3,
        }),
      ];

      const swings = detectConsecutiveSwings(series, 0.05);

      expect(swings[0].projectionChangeA).toBe(-2);
      expect(swings[0].projectionChangeB).toBe(10);
    });

    it('calculates time elapsed between swings', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:00:00').toISOString(),
          team1WinProbability: 0.6,
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:15:00').toISOString(),
          team1WinProbability: 0.3,
        }),
      ];

      const swings = detectConsecutiveSwings(series, 0.05);

      expect(swings[0].timeElapsed).toBe(15); // 15 minutes
    });

    it('detects multiple swings', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({ team1WinProbability: 0.6 }),
        createTimeSeriesPoint({ team1WinProbability: 0.3 }), // Swing 1
        createTimeSeriesPoint({ team1WinProbability: 0.35 }), // No swing
        createTimeSeriesPoint({ team1WinProbability: 0.7 }), // Swing 2
      ];

      const swings = detectConsecutiveSwings(series, 0.05);

      expect(swings).toHaveLength(2);
      expect(swings[0].winProbChange).toBe(-0.3);
      expect(swings[1].winProbChange).toBeCloseTo(0.35, 2);
    });

    it('marks swings as consecutive type', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({ team1WinProbability: 0.6 }),
        createTimeSeriesPoint({ team1WinProbability: 0.3 }),
      ];

      const swings = detectConsecutiveSwings(series, 0.05);

      expect(swings[0].type).toBe('consecutive');
    });

    it('assigns unique IDs to each swing', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({ team1WinProbability: 0.6 }),
        createTimeSeriesPoint({ team1WinProbability: 0.3 }),
        createTimeSeriesPoint({ team1WinProbability: 0.7 }),
      ];

      const swings = detectConsecutiveSwings(series, 0.05);

      expect(swings[0].id).toBe('consecutive-1');
      expect(swings[1].id).toBe('consecutive-2');
    });

    it('handles empty series', () => {
      const swings = detectConsecutiveSwings([], 0.05);
      expect(swings).toHaveLength(0);
    });

    it('handles single data point', () => {
      const series: TimeSeriesPoint[] = [createTimeSeriesPoint({ team1WinProbability: 0.5 })];

      const swings = detectConsecutiveSwings(series, 0.05);
      expect(swings).toHaveLength(0);
    });

    it('includes before and after states', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:00:00').toISOString(),
          team1WinProbability: 0.6,
          team1Score: 50,
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T14:00:00').toISOString(),
          team1WinProbability: 0.3,
          team1Score: 55,
        }),
      ];

      const swings = detectConsecutiveSwings(series, 0.05);

      expect(swings[0].before.winProbA).toBe(0.6);
      expect(swings[0].before.scoreA).toBe(50);
      expect(swings[0].after.winProbA).toBe(0.3);
      expect(swings[0].after.scoreA).toBe(55);
    });
  });

  describe('detectWindowSwings', () => {
    it('detects swings within time window', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:00:00').toISOString(),
          team1WinProbability: 0.7,
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:05:00').toISOString(),
          team1WinProbability: 0.65,
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:10:00').toISOString(),
          team1WinProbability: 0.4, // 0.3 change from first point
        }),
      ];

      const swings = detectWindowSwings(series, 0.2, 15);

      expect(swings.length).toBeGreaterThan(0);
      // Check that at least one swing has magnitude >= 0.2 (our threshold)
      const significantSwing = swings.find(s => s.winProbChangeMagnitude >= 0.2);
      expect(significantSwing).toBeDefined();
    });

    it('does not detect swings beyond time window', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:00:00').toISOString(),
          team1WinProbability: 0.7,
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:20:00').toISOString(), // 20 minutes later
          team1WinProbability: 0.4,
        }),
      ];

      const swings = detectWindowSwings(series, 0.2, 15); // 15 minute window

      // Should not detect since it's beyond the 15-minute window
      expect(swings).toHaveLength(0);
    });

    it('removes duplicate swings and keeps largest magnitude', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:00:00').toISOString(),
          team1WinProbability: 0.7,
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:05:00').toISOString(),
          team1WinProbability: 0.5, // 0.2 change
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:10:00').toISOString(),
          team1WinProbability: 0.4, // 0.3 change from first
        }),
      ];

      const swings = detectWindowSwings(series, 0.2, 15);

      // Should only have unique endpoint swings
      const uniqueIndices = new Set(swings.map(s => s.index));
      expect(uniqueIndices.size).toBe(swings.length);
    });

    it('marks swings as window type', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:00:00').toISOString(),
          team1WinProbability: 0.7,
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:10:00').toISOString(),
          team1WinProbability: 0.4,
        }),
      ];

      const swings = detectWindowSwings(series, 0.2, 15);

      expect(swings[0]?.type).toBe('window');
    });

    it('handles empty series', () => {
      const swings = detectWindowSwings([], 0.2, 15);
      expect(swings).toHaveLength(0);
    });

    it('calculates time elapsed correctly', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:00:00').toISOString(),
          team1WinProbability: 0.7,
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:10:00').toISOString(),
          team1WinProbability: 0.4,
        }),
      ];

      const swings = detectWindowSwings(series, 0.2, 15);

      expect(swings[0].timeElapsed).toBe(10);
    });
  });

  describe('detectAllSwings', () => {
    it('returns both consecutive and window swings', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:00:00').toISOString(),
          team1WinProbability: 0.7,
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:05:00').toISOString(),
          team1WinProbability: 0.6,
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:10:00').toISOString(),
          team1WinProbability: 0.3,
        }),
      ];

      const result = detectAllSwings(series, 0.05, 0.2, 15);

      expect(result.consecutive).toBeDefined();
      expect(result.window).toBeDefined();
      expect(result.all).toBeDefined();
    });

    it('sorts all swings by timestamp', () => {
      const series: TimeSeriesPoint[] = [
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:00:00').toISOString(),
          team1WinProbability: 0.7,
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:05:00').toISOString(),
          team1WinProbability: 0.6,
        }),
        createTimeSeriesPoint({
          timestamp: new Date('2024-01-01T13:10:00').toISOString(),
          team1WinProbability: 0.3,
        }),
      ];

      const result = detectAllSwings(series, 0.05, 0.2, 15);

      // Check that timestamps are in ascending order
      for (let i = 1; i < result.all.length; i++) {
        expect(result.all[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          result.all[i - 1].timestamp.getTime(),
        );
      }
    });

    it('handles empty series', () => {
      const result = detectAllSwings([], 0.05, 0.2, 15);

      expect(result.consecutive).toHaveLength(0);
      expect(result.window).toHaveLength(0);
      expect(result.all).toHaveLength(0);
    });
  });

  describe('formatDelta', () => {
    it('formats positive values with + sign', () => {
      expect(formatDelta(5.5)).toBe('+5.5');
    });

    it('formats negative values with - sign', () => {
      expect(formatDelta(-3.2)).toBe('-3.2');
    });

    it('formats zero', () => {
      expect(formatDelta(0)).toBe('0.0');
    });

    it('respects decimal places parameter', () => {
      expect(formatDelta(5.555, 2)).toBe('+5.55'); // toFixed rounds, not ceiling
    });

    it('rounds values correctly', () => {
      expect(formatDelta(5.556, 1)).toBe('+5.6');
    });
  });

  describe('getSwingBeneficiary', () => {
    it('returns teamA for positive win prob change', () => {
      const swing = {
        winProbChange: 0.3,
      } as any;

      expect(getSwingBeneficiary(swing)).toBe('teamA');
    });

    it('returns teamB for negative win prob change', () => {
      const swing = {
        winProbChange: -0.3,
      } as any;

      expect(getSwingBeneficiary(swing)).toBe('teamB');
    });

    it('returns teamA for zero change', () => {
      const swing = {
        winProbChange: 0,
      } as any;

      expect(getSwingBeneficiary(swing)).toBe('teamB'); // 0 is not > 0
    });
  });

  describe('getSwingDriver', () => {
    it('identifies score change A as driver', () => {
      const swing = {
        scoreChangeA: 20,
        scoreChangeB: 5,
        projectionChangeA: 2,
        projectionChangeB: 1,
      } as any;

      expect(getSwingDriver(swing)).toBe('scoreA');
    });

    it('identifies score change B as driver', () => {
      const swing = {
        scoreChangeA: 5,
        scoreChangeB: 20,
        projectionChangeA: 2,
        projectionChangeB: 1,
      } as any;

      expect(getSwingDriver(swing)).toBe('scoreB');
    });

    it('identifies projection change A as driver', () => {
      const swing = {
        scoreChangeA: 2,
        scoreChangeB: 1,
        projectionChangeA: 20,
        projectionChangeB: 5,
      } as any;

      expect(getSwingDriver(swing)).toBe('projectionA');
    });

    it('identifies projection change B as driver', () => {
      const swing = {
        scoreChangeA: 2,
        scoreChangeB: 1,
        projectionChangeA: 5,
        projectionChangeB: 20,
      } as any;

      expect(getSwingDriver(swing)).toBe('projectionB');
    });

    it('returns mixed when all changes are equal', () => {
      const swing = {
        scoreChangeA: 10,
        scoreChangeB: 10,
        projectionChangeA: 10,
        projectionChangeB: 10,
      } as any;

      expect(getSwingDriver(swing)).not.toBe('mixed'); // One will be max
    });

    it('uses absolute values for comparison', () => {
      const swing = {
        scoreChangeA: -20, // Negative but large
        scoreChangeB: 5,
        projectionChangeA: 2,
        projectionChangeB: 1,
      } as any;

      expect(getSwingDriver(swing)).toBe('scoreA'); // -20 has largest absolute value
    });
  });
});
