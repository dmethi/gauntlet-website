# RESILIENCE-601: Add Retry Logic with Exponential Backoff

**Category:** Resilience  
**Priority:** ⚠️ HIGH (Production Reliability)  
**Estimated Time:** 50 minutes  
**Dependencies:** OBSERVABILITY-601 (Logging), OBSERVABILITY-602 (Metrics)  
**Blocks:** None

---

## 📋 Overview

Add retry logic with exponential backoff to handle transient failures in API calls. This improves reliability by automatically recovering from temporary network issues, rate limits, and server errors.

**Current Problem:**
```typescript
// ❌ Single attempt, fails immediately on any error
const response = await fetch(url);
if (!response.ok) throw new Error('Failed');
```

**Target Solution:**
```typescript
// ✅ Retries with exponential backoff
const response = await fetchWithRetry(url, {
  maxRetries: 3,
  backoff: 'exponential',
  retryOn: [500, 502, 503, 504],
});
```

---

## 🎯 Objective

1. Create retry utility with exponential backoff
2. Add configurable retry policy
3. Instrument all API calls with retry logic
4. Log retry attempts for debugging
5. Track retry metrics

---

## 📖 Context Needed

**Files to Read:**
- `apps/server/src/lib/gauntlet-api-client.ts` (lines 48-100, fetch calls)
- Reference: Industry-standard retry patterns

**Total Context:** ~80 lines

---

## ✅ Steps

### 1. Create Retry Utility (15 min)

Create `apps/server/src/lib/retry.ts`:

```typescript
/**
 * Retry Utilities with Exponential Backoff
 *
 * Provides automatic retry logic for transient failures.
 */

import { logger } from './logger';
import { Metrics } from './metrics';

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
const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const calculateDelay = (
  attempt: number,
  options: Required<RetryOptions>
): number => {
  const delay = options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt);
  return Math.min(delay, options.maxDelayMs);
};

/**
 * Check if HTTP status code is retryable
 */
const isRetryableStatus = (
  status: number,
  retryableStatuses: number[]
): boolean => {
  return retryableStatuses.includes(status);
};

/**
 * Fetch with automatic retry and exponential backoff
 *
 * @example
 * const response = await fetchWithRetry('https://api.example.com/data', {
 *   maxRetries: 3,
 *   retryableStatusCodes: [500, 502, 503],
 * });
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
 * @example
 * const result = await retryAsync(
 *   async () => await riskyOperation(),
 *   { maxRetries: 3 }
 * );
 */
export const retryAsync = async <T>(
  fn: () => Promise<T>,
  options: Omit<RetryOptions, 'retryableStatusCodes' | 'timeout'> = {},
  metrics?: Metrics
): Promise<T> => {
  const { maxRetries = 3, initialDelayMs = 1000, maxDelayMs = 10000, backoffMultiplier = 2 } = options;
  
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
```

### 2. Export from Barrel (2 min)

Update `apps/server/src/lib/index.ts`:

```typescript
// ... existing exports

// Retry logic
export { fetchWithRetry, retryAsync } from './retry';
export type { RetryOptions } from './retry';
```

### 3. Update API Client to Use Retry (20 min)

Update `apps/server/src/lib/gauntlet-api-client.ts`:

```typescript
import { fetchWithRetry } from './retry';

export const createGauntletAPIClient = (
  options: GauntletAPIOptions = {},
  metrics?: Metrics
) => {
  const baseUrl = options.baseUrl || 'https://gauntlet-website.vercel.app';
  const timeout = options.timeout || 30000;

  return {
    getCurrentWeek: async (): Promise<number> => {
      try {
        // Use fetchWithRetry instead of fetch
        const response = await fetchWithRetry(
          'https://api.sleeper.app/v1/state/nfl',
          {
            maxRetries: 2, // Quick retries for critical path
            initialDelayMs: 500,
            timeout,
          },
          metrics
        );

        if (!response.ok) {
          logger.warn({
            event: 'nfl_state_fetch_failed',
            status: response.status,
          });
          return 4;
        }

        const data: NFLState = await response.json();
        return data?.week || 4;
      } catch (error) {
        logger.warn({
          event: 'current_week_error',
          error: error instanceof Error ? error.message : String(error),
        });
        return 4;
      }
    },

    fetchLeagueOdds: async (week: number): Promise<LeagueOddsResponse> => {
      const cacheBuster = Date.now();
      const url = `${baseUrl}/api/matchups/league-odds/${week}?t=${cacheBuster}`;

      const response = await fetchWithRetry(
        url,
        {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
          maxRetries: 3,
          timeout,
        },
        metrics
      );

      if (!response.ok) {
        metrics?.increment('api.gauntlet.league_odds.error');
        throw new Error(`League odds API failed: ${response.status}`);
      }

      return await response.json();
    },

    fetchMatchupSimulation: async (
      leagueId: string,
      week: number,
      matchupId: number
    ): Promise<MatchupSimulationResponse> => {
      const url = `${baseUrl}/api/matchups/${leagueId}/${week}/${matchupId}/simulate`;

      const response = await fetchWithRetry(
        url,
        {
          maxRetries: 3,
          timeout,
        },
        metrics
      );

      if (!response.ok) {
        throw new Error(`Matchup simulation API failed: ${response.status}`);
      }

      const data: MatchupSimulationResponse = await response.json();

      if (!data.success) {
        throw new Error('Matchup simulation returned unsuccessful response');
      }

      return data;
    },

    getTeamNames: async (leagueId: string): Promise<Map<number, string>> => {
      try {
        // Parallel requests with retry
        const [usersResponse, rostersResponse] = await Promise.all([
          fetchWithRetry(
            `https://api.sleeper.app/v1/league/${leagueId}/users`,
            { maxRetries: 2, timeout },
            metrics
          ),
          fetchWithRetry(
            `https://api.sleeper.app/v1/league/${leagueId}/rosters`,
            { maxRetries: 2, timeout },
            metrics
          ),
        ]);

        if (!usersResponse.ok || !rostersResponse.ok) {
          throw new Error(
            `Failed to fetch team data: users ${usersResponse.status}, rosters ${rostersResponse.status}`
          );
        }

        const users: SleeperUser[] = await usersResponse.json();
        const rosters: SleeperRoster[] = await rostersResponse.json();

        const teamNames = new Map<number, string>();

        for (const roster of rosters) {
          const owner = users.find(u => u.user_id === roster.owner_id);
          const teamName =
            owner?.metadata?.team_name || owner?.display_name || `Team ${roster.roster_id}`;
          teamNames.set(roster.roster_id, teamName);
        }

        return teamNames;
      } catch (error) {
        logger.error({
          event: 'team_names_fetch_failed',
          leagueId,
          error: error instanceof Error ? error.message : String(error),
        });
        return new Map(); // Graceful fallback
      }
    },
  };
};
```

### 4. Add Tests for Retry Logic (10 min)

Create `apps/server/src/lib/__tests__/retry.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithRetry, retryAsync } from '../retry';

global.fetch = vi.fn();

describe('retry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchWithRetry', () => {
    it('should succeed on first attempt', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const response = await fetchWithRetry('https://api.example.com');
      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 500 error', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const response = await fetchWithRetry('https://api.example.com', {
        maxRetries: 2,
        initialDelayMs: 10,
      });

      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 404 error', async () => {
      (global.fetch as any).mockResolvedValueOnce({ ok: false, status: 404 });

      const response = await fetchWithRetry('https://api.example.com');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should exhaust retries and throw', async () => {
      (global.fetch as any).mockResolvedValue({ ok: false, status: 500 });

      const response = await fetchWithRetry('https://api.example.com', {
        maxRetries: 2,
        initialDelayMs: 10,
      });

      expect(response.ok).toBe(false);
      expect(global.fetch).toHaveBeenCalledTimes(3); // initial + 2 retries
    });
  });

  describe('retryAsync', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValueOnce('success');
      
      const result = await retryAsync(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on error', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('success');

      const result = await retryAsync(fn, {
        maxRetries: 2,
        initialDelayMs: 10,
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
```

### 5. Verify and Test (3 min)

```bash
cd apps/server

# Run tests
pnpm test

# Run job to verify retries work
pnpm live-snapshot
```

---

## ✅ Acceptance Criteria

- [ ] `src/lib/retry.ts` created with retry logic
- [ ] Exponential backoff implemented correctly
- [ ] `fetchWithRetry` handles retryable status codes
- [ ] `retryAsync` handles generic async functions
- [ ] API client uses `fetchWithRetry` for all calls
- [ ] Retry attempts logged with structured logging
- [ ] Retry metrics tracked
- [ ] Tests added for retry logic
- [ ] All tests pass (60+ tests now)
- [ ] Job runs successfully with retry logic

---

## 🔍 Verification

```bash
cd apps/server

# 1. Run tests (should have 60+ tests now)
pnpm test
# Expected: All tests pass

# 2. Simulate network issues (disconnect internet briefly)
# Run job and observe retry logs
pnpm live-snapshot
# Expected: See "fetch_retry_attempt" logs

# 3. Check for fetchWithRetry usage
grep -r "fetchWithRetry" src/lib
# Expected: Multiple results in gauntlet-api-client.ts

# 4. Build
pnpm build
# Expected: Successful compilation
```

---

## 📊 Estimated Context Usage

- **Files to create**: 2 (retry.ts, retry.test.ts)
- **Files to modify**: 2 (gauntlet-api-client.ts, index.ts)
- **Lines to read**: ~80
- **Lines to write**: ~300

---

## 🔗 Related Tasks

**Prerequisites:**
- OBSERVABILITY-601: Logging ✅ (used for retry logs)
- OBSERVABILITY-602: Metrics ✅ (tracks retry attempts)

**Enables:**
- Production reliability
- Automatic recovery from transient failures
- Better handling of rate limits

**Related:**
- RESILIENCE-602: Result Types (complementary error handling)

---

## 💡 Cursor Prompt

```
I'm working on RESILIENCE-601 (Add retry logic).

Please:
1. Create src/lib/retry.ts with fetchWithRetry and retryAsync
2. Implement exponential backoff algorithm
3. Update gauntlet-api-client.ts to use fetchWithRetry
4. Add tests for retry logic

Follow tasks/RESILIENCE-601-retry-logic.md steps exactly.

Key requirements:
- Retry 500/502/503/504 status codes
- Don't retry 4xx client errors
- Exponential backoff: 1s, 2s, 4s, 8s (capped at 10s)
- Log each retry attempt
- Track retry metrics
```

---

## 📝 Notes

### Retry Strategy

**Retryable Errors:**
- 408 Request Timeout
- 429 Too Many Requests (rate limit)
- 500 Internal Server Error
- 502 Bad Gateway
- 503 Service Unavailable
- 504 Gateway Timeout
- Network errors (ECONNRESET, ETIMEDOUT)

**Non-Retryable Errors:**
- 4xx client errors (bad request, not found, unauthorized)
- Invalid responses (malformed JSON)
- Timeout after max retries

### Backoff Calculation

```
Delay = initialDelay * (multiplier ^ attempt)
Capped at maxDelay

Example (initialDelay=1000ms, multiplier=2):
Attempt 0: 1000ms (1s)
Attempt 1: 2000ms (2s)
Attempt 2: 4000ms (4s)
Attempt 3: 8000ms (8s)
Attempt 4: 10000ms (capped at 10s)
```

### When to Use Retries

**Good use cases:**
- External API calls
- Database connections
- File operations
- Network requests

**Bad use cases:**
- Idempotent operations (may duplicate)
- Time-sensitive operations
- Operations with side effects

---

## 🎯 Success Metrics

- [ ] Retry utility created and tested
- [ ] All API calls use retry logic
- [ ] Exponential backoff working correctly
- [ ] Retry attempts logged
- [ ] All tests pass (60+ tests)
- [ ] Job handles transient failures gracefully

---

**Status:** ⏭️ Ready (blocked by OBSERVABILITY-601, OBSERVABILITY-602)  
**Assignee:** _Unassigned_  
**Completed:** _Not Started_

