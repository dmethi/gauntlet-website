/**
 * Structured Logger using Pino
 *
 * Provides environment-aware logging:
 * - Development: Pretty-printed, colorized logs
 * - Production: JSON logs for log aggregation
 */

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // Pretty print in development, JSON in production
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined,

  // Base fields included in every log
  base: {
    env: process.env.NODE_ENV || 'development',
  },

  // Timestamp in all logs
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Create a child logger with additional context
 *
 * @example
 * const jobLogger = createChildLogger({ job: 'live-snapshot', week: 4 });
 * jobLogger.info('Starting job');
 */
export const createChildLogger = (bindings: Record<string, unknown>) => {
  return logger.child(bindings);
};
