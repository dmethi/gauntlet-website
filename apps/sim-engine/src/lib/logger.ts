/**
 * Structured Logger using Pino
 *
 * Provides environment-aware logging:
 * - Development: Pretty-printed, colorized logs
 * - Production: JSON logs for log aggregation
 * - Next.js: Synchronous logging (no worker threads)
 */

import pino from 'pino';

/**
 * Check if running in Next.js webpack environment
 * This prevents worker thread issues with pino-pretty in bundled code
 */
const isNextJsEnvironment =
  typeof process !== 'undefined' &&
  (process.env.NEXT_RUNTIME === 'nodejs' || process.env.__NEXT_PROCESSED_ENV === 'true');

/**
 * Structured logger with environment-aware configuration.
 *
 * - Development (standalone): Pretty-printed, colorized logs
 * - Next.js: Synchronous console-based logging
 * - Production: JSON logs for log aggregation
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Disable transport in Next.js to avoid worker thread issues
  transport:
    !isNextJsEnvironment && process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

/**
 * Create a child logger with additional context.
 *
 * @param context - Additional context fields to include in all logs
 *
 * @example
 * const simLogger = createChildLogger({ simulation: 'matchup', matchupId: '123' });
 * simLogger.info('Starting simulation');
 */
export const createChildLogger = (context: Record<string, unknown>): pino.Logger => {
  return logger.child(context);
};
