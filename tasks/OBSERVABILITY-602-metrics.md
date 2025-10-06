# OBSERVABILITY-602: Add Metrics Collection

**Category:** Observability  
**Priority:** 🟡 MEDIUM (Production Readiness)  
**Estimated Time:** 40 minutes  
**Dependencies:** OBSERVABILITY-601 (Structured Logging)  
**Blocks:** None

---

## 📋 Overview

Add metrics collection to track job performance, success rates, and API call durations. This enables monitoring, alerting, and performance optimization.

**Current Problem:**
- No visibility into job performance
- Can't track success/failure rates
- No API duration tracking
- No way to detect performance degradation

**Target Solution:**
- Track counter metrics (saves, skips, errors)
- Track duration metrics (API calls, simulations)
- Report metrics at end of job
- Enable future integration with monitoring systems

---

## 🎯 Objective

1. Create metrics utility for counters and timers
2. Instrument API client with duration tracking
3. Instrument snapshot validator with outcome tracking
4. Report metrics at end of job
5. Log metrics in structured format

---

## 📖 Context Needed

**Files to Read:**
- `apps/server/src/lib/gauntlet-api-client.ts` (lines 48-100, API methods)
- `apps/server/src/lib/snapshot-validator.ts` (lines 131-200, main function)
- `apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts` (lines 134-200, main loop)

**Total Context:** ~150 lines

---

## ✅ Steps

### 1. Create Metrics Utility (10 min)

Create `apps/server/src/lib/metrics.ts`:

```typescript
/**
 * Metrics Collection Utility
 *
 * Tracks counters and timers for monitoring job performance.
 * Future: Can be extended to push metrics to Prometheus, Datadog, etc.
 */

interface MetricsSummary {
  counters: Record<string, number>;
  timers: Record<string, {
    count: number;
    total: number;
    avg: number;
    min: number;
    max: number;
  }>;
}

export class Metrics {
  private counters = new Map<string, number>();
  private timers = new Map<string, number[]>();

  /**
   * Increment a counter metric
   */
  increment(metric: string, value = 1): void {
    const current = this.counters.get(metric) || 0;
    this.counters.set(metric, current + value);
  }

  /**
   * Record a duration metric in milliseconds
   */
  recordDuration(metric: string, durationMs: number): void {
    const values = this.timers.get(metric) || [];
    values.push(durationMs);
    this.timers.set(metric, values);
  }

  /**
   * Get summary of all metrics
   */
  getSummary(): MetricsSummary {
    return {
      counters: Object.fromEntries(this.counters),
      timers: Object.fromEntries(
        Array.from(this.timers).map(([key, values]) => [
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
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear();
    this.timers.clear();
  }
}

/**
 * Helper to time an async function
 *
 * @example
 * const result = await measureDuration('api_call', async () => {
 *   return await fetch(url);
 * });
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
```

### 2. Export from Barrel (2 min)

Update `apps/server/src/lib/index.ts`:

```typescript
// ... existing exports

// Metrics
export { Metrics, measureDuration } from './metrics';
```

### 3. Instrument API Client (10 min)

Update `apps/server/src/lib/gauntlet-api-client.ts`:

```typescript
import { Metrics } from './metrics';
import { logger } from './logger';

export const createGauntletAPIClient = (
  options: GauntletAPIOptions = {},
  metrics?: Metrics
) => {
  const baseUrl = options.baseUrl || 'https://gauntlet-website.vercel.app';
  const timeout = options.timeout || 30000;

  return {
    getCurrentWeek: async (): Promise<number> => {
      const start = Date.now();
      try {
        const response = await fetch('https://api.sleeper.app/v1/state/nfl');
        const duration = Date.now() - start;
        metrics?.recordDuration('api.sleeper.current_week', duration);
        
        if (!response.ok) {
          logger.warn({
            event: 'nfl_state_fetch_failed',
            status: response.status,
            duration,
          });
          return 4;
        }
        const data: NFLState = await response.json();
        return data?.week || 4;
      } catch (error) {
        const duration = Date.now() - start;
        metrics?.recordDuration('api.sleeper.current_week', duration);
        metrics?.increment('api.sleeper.current_week.error');
        logger.warn({
          event: 'current_week_error',
          error: error instanceof Error ? error.message : String(error),
          duration,
        });
        return 4;
      }
    },

    fetchLeagueOdds: async (week: number): Promise<LeagueOddsResponse> => {
      const start = Date.now();
      const cacheBuster = Date.now();
      const url = `${baseUrl}/api/matchups/league-odds/${week}?t=${cacheBuster}`;

      try {
        const response = await fetch(url, {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
          signal: AbortSignal.timeout(timeout),
        });

        const duration = Date.now() - start;
        metrics?.recordDuration('api.gauntlet.league_odds', duration);

        if (!response.ok) {
          metrics?.increment('api.gauntlet.league_odds.error');
          throw new Error(`League odds API failed: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        const duration = Date.now() - start;
        metrics?.recordDuration('api.gauntlet.league_odds', duration);
        metrics?.increment('api.gauntlet.league_odds.error');
        throw error;
      }
    },

    // Similar instrumentation for:
    // - fetchMatchupSimulation
    // - getTeamNames
  };
};

// Update default instance to accept metrics
export const gauntletAPI = createGauntletAPIClient();
```

### 4. Instrument Snapshot Validator (8 min)

Update `apps/server/src/lib/snapshot-validator.ts`:

```typescript
import { Metrics } from './metrics';

export const saveSnapshotIfChanged = async (
  snapshot: CompleteSnapshot,
  metrics?: Metrics
): Promise<ValidationResult> => {
  const start = Date.now();
  
  try {
    const lastSnapshot = await getLastWinProbSample(
      snapshot.leagueId,
      snapshot.week,
      snapshot.matchupId
    );

    if (lastSnapshot) {
      const hasChanged = hasSignificantChange(lastSnapshot, snapshot);

      if (!hasChanged) {
        const duration = Date.now() - start;
        metrics?.increment('snapshot.skipped');
        metrics?.recordDuration('snapshot.validation', duration);
        
        logger.debug({
          event: 'snapshot_skipped',
          matchupId: snapshot.matchupId,
          week: snapshot.week,
          duration,
        });
        return { saved: false, reason: 'unchanged' };
      }
    }

    await saveLiveWinProbSample({
      leagueId: snapshot.leagueId,
      week: snapshot.week,
      matchupId: snapshot.matchupId,
      rosterAId: snapshot.team1.rosterId,
      rosterBId: snapshot.team2.rosterId,
      gameProgress: 0,
      winProbA: snapshot.team1.winProbability,
      winProbB: snapshot.team2.winProbability,
      projectedFinalA: snapshot.team1.simulatedMean,
      projectedFinalB: snapshot.team2.simulatedMean,
      currentScoreA: snapshot.team1.currentScore,
      currentScoreB: snapshot.team2.currentScore,
      spread: snapshot.spread,
      total: snapshot.total,
    });

    const duration = Date.now() - start;
    metrics?.increment('snapshot.saved');
    metrics?.recordDuration('snapshot.save', duration);

    logger.info({
      event: 'snapshot_saved',
      matchupId: snapshot.matchupId,
      week: snapshot.week,
      duration,
      // ... other fields
    });

    return { saved: true, reason: 'saved' };
  } catch (error) {
    const duration = Date.now() - start;
    metrics?.increment('snapshot.error');
    metrics?.recordDuration('snapshot.save', duration);
    
    logger.error({
      event: 'snapshot_save_failed',
      matchupId: snapshot.matchupId,
      error: error instanceof Error ? error.message : String(error),
      duration,
    });
    return { saved: false, reason: 'error' };
  }
};
```

### 5. Integrate into Main Script (10 min)

Update `apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts`:

```typescript
import { createChildLogger, Metrics, gauntletAPI } from '@/lib';

const main = async (): Promise<void> => {
  const metrics = new Metrics();
  const jobStartTime = Date.now();
  
  const week = await gauntletAPI.getCurrentWeek();
  const leagueIds = ['1263744209295245312', '1263740549504962561'];

  const jobLogger = createChildLogger({ job: 'live-snapshot', week });

  jobLogger.info({ event: 'job_started' });

  // Create metrics-aware API client
  const apiClient = createGauntletAPIClient({}, metrics);

  for (const leagueId of leagueIds) {
    const teamNames = await apiClient.getTeamNames(leagueId);

    for (let matchupId = 1; matchupId <= 6; matchupId++) {
      const snapshot = await captureIndividualMatchup(
        leagueId,
        week,
        matchupId,
        teamNames,
        apiClient
      );

      if (snapshot) {
        await saveSnapshotIfChanged(snapshot, metrics);
      } else {
        metrics.increment('matchup.capture_failed');
      }

      // Delay between matchups
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Report metrics
  const jobDuration = Date.now() - jobStartTime;
  const summary = metrics.getSummary();

  jobLogger.info({
    event: 'job_completed',
    duration: jobDuration,
    metrics: summary,
  });
};
```

---

## ✅ Acceptance Criteria

- [ ] `src/lib/metrics.ts` created with Metrics class
- [ ] Metrics exported from barrel
- [ ] API client instrumented with duration tracking
- [ ] Snapshot validator instrumented with outcome tracking
- [ ] Main script creates and uses Metrics instance
- [ ] Metrics summary logged at job completion
- [ ] All tests pass
- [ ] Metrics don't break existing functionality

---

## 🔍 Verification

```bash
cd apps/server

# 1. Run job and check metrics output
pnpm live-snapshot
# Expected: Final log contains metrics summary with:
# - counters (snapshot.saved, snapshot.skipped, etc.)
# - timers (api.*.duration with avg/min/max)

# 2. Verify metrics structure
pnpm live-snapshot 2>&1 | grep '"event":"job_completed"'
# Expected: JSON with metrics field

# 3. Run tests
pnpm test
# Expected: All tests pass (metrics optional in tests)

# 4. Build
pnpm build
# Expected: Successful compilation
```

---

## 📊 Estimated Context Usage

- **Files to create**: 1 (metrics.ts)
- **Files to modify**: 3 (gauntlet-api-client.ts, snapshot-validator.ts, comprehensive-live-snapshot.ts)
- **Lines to read**: ~150
- **Lines to write**: ~120

---

## 🔗 Related Tasks

**Prerequisites:**
- OBSERVABILITY-601: Structured Logging ✅ (logger used for metrics output)

**Enables:**
- Performance monitoring
- Alerting on anomalies
- Future Prometheus/Datadog integration

**Related:**
- OBSERVABILITY-603: Health Checks (can include metrics)

---

## 💡 Cursor Prompt

```
I'm working on OBSERVABILITY-602 (Add metrics collection).

Please:
1. Create src/lib/metrics.ts with Metrics class
2. Instrument gauntlet-api-client.ts with duration tracking
3. Instrument snapshot-validator.ts with outcome counters
4. Update comprehensive-live-snapshot.ts to collect and report metrics

Follow tasks/OBSERVABILITY-602-metrics.md steps exactly.

Key metrics to track:
- Counters: snapshot.saved, snapshot.skipped, snapshot.error
- Timers: api.sleeper.*, api.gauntlet.*, snapshot.*
```

---

## 📝 Notes

### Metrics vs Logging

- **Metrics**: Quantitative data for trends and alerting (counters, timers)
- **Logging**: Qualitative data for debugging (what happened, why)

Both are complementary - metrics tell you *something is wrong*, logs tell you *what and why*.

### Future Extensions

This metrics foundation enables:

1. **Prometheus Integration**:
   ```typescript
   import { register, Counter, Histogram } from 'prom-client';
   ```

2. **Datadog StatsD**:
   ```typescript
   import { StatsD } from 'hot-shots';
   ```

3. **CloudWatch Metrics**:
   ```typescript
   import { CloudWatch } from 'aws-sdk';
   ```

4. **Custom Dashboards**:
   - Success rate over time
   - Average API duration
   - Error rate spikes

### Alerting Use Cases

With metrics, you can alert on:
- Snapshot save rate < 80%
- API duration > 5 seconds (p95)
- Error rate > 5%
- Job duration > 2 minutes

---

## 🎯 Success Metrics

- [ ] Metrics utility created and tested
- [ ] API calls tracked with durations
- [ ] Snapshot outcomes counted
- [ ] Job reports metrics at completion
- [ ] Tests pass
- [ ] Job runs successfully

---

**Status:** ⏭️ Ready (blocked by OBSERVABILITY-601)  
**Assignee:** _Unassigned_  
**Completed:** _Not Started_

