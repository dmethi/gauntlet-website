/**
 * Metrics Collection Utility
 *
 * Tracks counters and timers for monitoring simulation performance.
 */

import type { Metrics, MetricsSummary } from '@gauntlet/types';

/**
 * Create a metrics collection instance for tracking simulation performance
 *
 * @returns Metrics instance with methods for tracking counters and timers
 *
 * @example
 * ```typescript
 * const metrics = createMetrics();
 * metrics.increment('simulation.matchup.completed');
 * metrics.recordDuration('simulation.matchup.duration', 150);
 * const summary = metrics.getSummary();
 * ```
 */
export const createMetrics = (): Metrics => {
  const counters = new Map<string, number>();
  const timers = new Map<string, number[]>();

  return {
    /**
     * Increment a counter metric
     *
     * @param metric - Name of the counter metric
     * @param value - Amount to increment by (default: 1)
     *
     * @example
     * ```typescript
     * metrics.increment('simulation.matchup.completed');
     * metrics.increment('simulation.matchup.iterations', 10000);
     * ```
     */
    increment: (metric: string, value = 1): void => {
      const current = counters.get(metric) || 0;
      counters.set(metric, current + value);
    },

    /**
     * Record a duration metric in milliseconds
     *
     * @param metric - Name of the duration metric
     * @param durationMs - Duration in milliseconds
     *
     * @example
     * ```typescript
     * const start = Date.now();
     * await simulateMatchup();
     * metrics.recordDuration('simulation.matchup.duration', Date.now() - start);
     * ```
     */
    recordDuration: (metric: string, durationMs: number): void => {
      const values = timers.get(metric) || [];
      values.push(durationMs);
      timers.set(metric, values);
    },

    /**
     * Get summary of all metrics
     *
     * @returns Object containing all counters and timer statistics
     *
     * @example
     * ```typescript
     * const summary = metrics.getSummary();
     * console.log(`Completed: ${summary.counters['simulation.matchup.completed']}`);
     * console.log(`Avg duration: ${summary.timers['simulation.matchup.duration'].avg}ms`);
     * ```
     */
    getSummary: (): MetricsSummary => {
      return {
        counters: Object.fromEntries(counters),
        timers: Object.fromEntries(
          Array.from(timers).map(([key, values]) => [
            key,
            {
              count: values.length,
              total: values.reduce((a, b) => a + b, 0),
              avg: values.reduce((a, b) => a + b, 0) / values.length,
              min: Math.min(...values),
              max: Math.max(...values),
            },
          ])
        ),
      };
    },

    /**
     * Reset all metrics
     *
     * @example
     * ```typescript
     * metrics.reset();
     * ```
     */
    reset: (): void => {
      counters.clear();
      timers.clear();
    },
  };
};
