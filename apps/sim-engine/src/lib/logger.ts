/**
 * Structured Logger using Pino
 *
 * Provides environment-aware logging:
 * - Development: Pretty-printed, colorized logs
 * - Production: JSON logs for log aggregation
 */

import pino from 'pino';

/**
 * Structured logger with environment-aware configuration.
 *
 * - Development: Pretty-printed, colorized logs
 * - Production: JSON logs for log aggregation
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV !== 'production'
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
