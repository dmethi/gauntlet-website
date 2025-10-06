/**
 * Retry Utilities with Exponential Backoff
 *
 * Provides automatic retry logic for transient failures.
 */

import { logger } from './logger.js';
import type { Metrics } from '@gauntlet/types';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableStatusCodes?: number[];
  timeout?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  timeout: 30000,
};

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const calculateDelay = (attempt: number, options: Required<RetryOptions>): number => {
  const delay = options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt);
  return Math.min(delay, options.maxDelayMs);
};

/**
 * Check if HTTP status code is retryable
 */
const isRetryableStatus = (status: number, retryableStatuses: number[]): boolean => {
  return retryableStatuses.includes(status);
};

/**
 * Fetch with automatic retry and exponential backoff
 *
 * @param url - URL to fetch
 * @param options - Fetch options combined with retry options
 * @param metrics - Optional Metrics instance for tracking retries
 * @returns Promise resolving to the fetch Response
 *
 * @example
 * ```typescript
 * const response = await fetchWithRetry('https://api.example.com/data', {
 *   maxRetries: 3,
 *   retryableStatusCodes: [500, 502, 503],
 * });
 * ```
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit & RetryOptions = {},
  metrics?: Metrics
): Promise<Response> => {
  const {
    maxRetries,
    initialDelayMs,
    maxDelayMs,
    backoffMultiplier,
    retryableStatusCodes,
    timeout,
    ...fetchOptions
  } = { ...DEFAULT_RETRY_OPTIONS, ...options };

  const retryConfig = {
    maxRetries,
    initialDelayMs,
    maxDelayMs,
    backoffMultiplier,
    retryableStatusCodes,
    timeout,
  };

  let lastError: Error | null = null;
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Success case
      if (response.ok) {
        if (attempt > 0) {
          logger.info({
            event: 'retry_succeeded',
            url,
            attempt,
            status: response.status,
          });
          metrics?.increment('fetch.retry.success');
        }
        return response;
      }

      // Check if we should retry this status code
      if (!isRetryableStatus(response.status, retryableStatusCodes)) {
        logger.warn({
          event: 'fetch_failed_non_retryable',
          url,
          status: response.status,
          attempt,
        });
        return response; // Don't retry 4xx client errors
      }

      lastResponse = response;

      // Prepare for retry
      if (attempt < maxRetries) {
        const delayMs = calculateDelay(attempt, retryConfig);

        logger.warn({
          event: 'fetch_retry_attempt',
          url,
          attempt: attempt + 1,
          maxRetries,
          status: response.status,
          delayMs,
        });

        metrics?.increment('fetch.retry.attempt');
        await sleep(delayMs);
      }
    } catch (error) {
      lastError = error as Error;

      // Don't retry on abort or certain errors
      if (error instanceof Error && error.name === 'AbortError') {
        logger.error({
          event: 'fetch_timeout',
          url,
          timeout,
          attempt,
        });
        metrics?.increment('fetch.timeout');
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      if (attempt < maxRetries) {
        const delayMs = calculateDelay(attempt, retryConfig);

        logger.warn({
          event: 'fetch_retry_network_error',
          url,
          attempt: attempt + 1,
          maxRetries,
          error: error instanceof Error ? error.message : String(error),
          delayMs,
        });

        metrics?.increment('fetch.retry.network_error');
        await sleep(delayMs);
      }
    }
  }

  // All retries exhausted
  metrics?.increment('fetch.retry.exhausted');

  if (lastResponse) {
    logger.error({
      event: 'fetch_retries_exhausted',
      url,
      maxRetries,
      status: lastResponse.status,
    });
    return lastResponse;
  }

  logger.error({
    event: 'fetch_retries_exhausted',
    url,
    maxRetries,
    error: lastError?.message,
  });

  throw lastError || new Error('Fetch failed after all retries');
};

/**
 * Retry a generic async function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param options - Retry options (excludes HTTP-specific options)
 * @param metrics - Optional Metrics instance for tracking retries
 * @returns Promise resolving to the function's return value
 *
 * @example
 * ```typescript
 * const result = await retryAsync(
 *   async () => await riskyOperation(),
 *   { maxRetries: 3 }
 * );
 * ```
 */
export const retryAsync = async <T>(
  fn: () => Promise<T>,
  options: Omit<RetryOptions, 'retryableStatusCodes' | 'timeout'> = {},
  metrics?: Metrics
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
  } = options;

  const retryConfig = { maxRetries, initialDelayMs, maxDelayMs, backoffMultiplier };

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delayMs = calculateDelay(attempt, {
          ...retryConfig,
          retryableStatusCodes: [],
          timeout: 30000,
        });

        logger.warn({
          event: 'retry_async_attempt',
          attempt: attempt + 1,
          maxRetries,
          error: lastError.message,
          delayMs,
        });

        metrics?.increment('retry.async.attempt');
        await sleep(delayMs);
      }
    }
  }

  metrics?.increment('retry.async.exhausted');
  throw lastError!;
};
