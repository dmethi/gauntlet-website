/**
 * Metrics Collection Utility
 *
 * Tracks counters and timers for monitoring job performance.
 * Future: Can be extended to push metrics to Prometheus, Datadog, etc.
 */

import type { Metrics, MetricsSummary } from '@gauntlet/types';

/**
 * Create a metrics collection instance for tracking job performance
 *
 * @returns Metrics instance with methods for tracking counters and timers
 *
 * @example
 * ```typescript
 * const metrics = createMetrics();
 * metrics.increment('snapshot.saved');
 * metrics.recordDuration('api.sleeper.current_week', 150);
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
     * metrics.increment('snapshot.saved');
     * metrics.increment('api.calls', 5);
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
     * await someOperation();
     * metrics.recordDuration('operation.duration', Date.now() - start);
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
     * console.log(`Saved: ${summary.counters['snapshot.saved']}`);
     * console.log(`Avg API time: ${summary.timers['api.duration'].avg}ms`);
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

/**
 * Helper to time an async function
 *
 * @param metrics - Metrics instance to record to
 * @param metricName - Name of the metric to record
 * @param fn - Async function to measure
 * @returns Promise resolving to the function's return value
 *
 * @example
 * ```typescript
 * const metrics = createMetrics();
 * const result = await measureDuration(metrics, 'api_call', async () => {
 *   return await fetch(url);
 * });
 * ```
 */
export const measureDuration = async <T>(
  metrics: Metrics,
  metricName: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    const duration = Date.now() - start;
    metrics.recordDuration(metricName, duration);
  }
};
