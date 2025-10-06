# OBSERVABILITY-601: Add Structured Logging with Pino

**Category:** Observability  
**Priority:** ⚠️ HIGH (Production Readiness)  
**Estimated Time:** 45 minutes  
**Dependencies:** REFACTOR-601 (Arrow Functions)  
**Blocks:** OBSERVABILITY-602 (Metrics)

---

## 📋 Overview

Replace all `console.log` calls with structured logging using Pino. This enables proper production logging with levels, structured data, and queryable fields.

**Current Problem:**
```typescript
// ❌ BAD: Unstructured, hard to query
console.log(`✅ M${snapshot.matchupId}: ${snapshot.team1Name} vs ${snapshot.team2Name}`);
console.error(`❌ Failed to save M${snapshot.matchupId}:`, error);
```

**Target Solution:**
```typescript
// ✅ GOOD: Structured, queryable, filterable
logger.info({
  event: 'snapshot_saved',
  matchupId: snapshot.matchupId,
  week: snapshot.week,
  team1Name: snapshot.team1Name,
  team2Name: snapshot.team2Name,
});

logger.error({
  event: 'snapshot_save_failed',
  matchupId: snapshot.matchupId,
  error: error.message,
  stack: error.stack,
});
```

---

## 🎯 Objective

1. Install and configure Pino logger
2. Create logger utility with environment-aware configuration
3. Replace all console.log/error calls with structured logging
4. Add log levels: debug, info, warn, error
5. Enable JSON logging in production, pretty logging in development

---

## 📖 Context Needed

**Files to Read:**
- `apps/server/src/lib/gauntlet-api-client.ts` (find all console.* calls)
- `apps/server/src/lib/snapshot-validator.ts` (find all console.* calls)
- `apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts` (find all console.* calls)

**Total Context:** ~200 lines (spread across 3 files)

---

## ✅ Steps

### 1. Install Pino (5 min)

```bash
cd apps/server
pnpm add pino
pnpm add -D pino-pretty
```

### 2. Create Logger Utility (10 min)

Create `apps/server/src/lib/logger.ts`:

```typescript
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
```

### 3. Export Logger from Barrel (2 min)

Update `apps/server/src/lib/index.ts`:

```typescript
// ... existing exports

// Logger
export { logger, createChildLogger } from './logger';
```

### 4. Replace Console Calls in API Client (8 min)

Update `apps/server/src/lib/gauntlet-api-client.ts`:

```typescript
import { logger } from './logger';

// Before:
console.warn(`Failed to fetch NFL state: ${response.status}`);

// After:
logger.warn({
  event: 'nfl_state_fetch_failed',
  status: response.status,
  message: 'Failed to fetch NFL state, using default week 4',
});

// Before:
console.warn('Error fetching current week, using default:', error);

// After:
logger.warn({
  event: 'current_week_error',
  error: error instanceof Error ? error.message : String(error),
  message: 'Error fetching current week, using default week 4',
});

// Before:
console.error(`Failed to fetch team names for league ${leagueId}:`, error);

// After:
logger.error({
  event: 'team_names_fetch_failed',
  leagueId,
  error: error instanceof Error ? error.message : String(error),
  message: 'Failed to fetch team names',
});
```

### 5. Replace Console Calls in Snapshot Validator (10 min)

Update `apps/server/src/lib/snapshot-validator.ts`:

```typescript
import { logger } from './logger';

// Before:
console.log(`⏭️  M${snapshot.matchupId}: ${snapshot.team1Name} vs ${snapshot.team2Name} - No change, skipping`);

// After:
logger.debug({
  event: 'snapshot_skipped',
  matchupId: snapshot.matchupId,
  week: snapshot.week,
  team1Name: snapshot.team1Name,
  team2Name: snapshot.team2Name,
  reason: 'unchanged',
});

// Before:
console.log(`✅ M${snapshot.matchupId}: ${snapshot.team1Name} vs ${snapshot.team2Name}`);
console.log(`   📊 Sim: ${snapshot.team1.simulatedMean.toFixed(1)} vs ...`);

// After:
logger.info({
  event: 'snapshot_saved',
  matchupId: snapshot.matchupId,
  week: snapshot.week,
  team1Name: snapshot.team1Name,
  team2Name: snapshot.team2Name,
  team1SimMean: snapshot.team1.simulatedMean,
  team2SimMean: snapshot.team2.simulatedMean,
  team1WinProb: snapshot.team1.winProbability,
  team2WinProb: snapshot.team2.winProbability,
  team1CurrentScore: snapshot.team1.currentScore,
  team2CurrentScore: snapshot.team2.currentScore,
  spread: snapshot.spread,
  total: snapshot.total,
});

// Keep player tables for now (will be moved to debug level)
// ... printPlayerTable logic (can stay as is)

// Before:
console.error(`❌ Failed to save M${snapshot.matchupId}:`, error);

// After:
logger.error({
  event: 'snapshot_save_failed',
  matchupId: snapshot.matchupId,
  error: error instanceof Error ? error.message : String(error),
  stack: error instanceof Error ? error.stack : undefined,
});
```

### 6. Replace Console Calls in Main Script (10 min)

Update `apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts`:

```typescript
import { createChildLogger } from '@/lib';

const main = async (): Promise<void> => {
  const week = await gauntletAPI.getCurrentWeek();
  const leagueIds = ['1263744209295245312', '1263740549504962561'];

  // Create job-specific logger
  const jobLogger = createChildLogger({ job: 'live-snapshot', week });

  jobLogger.info({
    event: 'job_started',
    message: `Starting comprehensive live odds snapshot for week ${week}`,
  });

  // ... rest of implementation

  // Before:
  console.log(`📋 Fetching team names...`);

  // After:
  jobLogger.debug({ event: 'fetching_team_names', leagueId });

  // Before:
  console.log(`✅ Found ${teamNames.size} team names\n`);

  // After:
  jobLogger.debug({ event: 'team_names_fetched', count: teamNames.size, leagueId });

  // Before:
  console.log('\n' + '='.repeat(60));
  console.log('✅ Complete snapshot finished!');
  console.log(`📊 Results Summary:`);
  console.log(`   ✅ Saved: ${savedCount} matchups`);

  // After:
  jobLogger.info({
    event: 'job_completed',
    savedCount,
    skippedCount,
    failedCount,
    totalProcessed: savedCount + skippedCount + failedCount,
  });
};
```

---

## ✅ Acceptance Criteria

- [ ] Pino and pino-pretty installed
- [ ] `src/lib/logger.ts` created with environment-aware config
- [ ] Logger exported from barrel (`src/lib/index.ts`)
- [ ] All `console.log` calls replaced with `logger.info`
- [ ] All `console.warn` calls replaced with `logger.warn`
- [ ] All `console.error` calls replaced with `logger.error`
- [ ] No `console.*` calls remain in production code
- [ ] Job uses child logger with context
- [ ] Tests still pass (test logs optional)
- [ ] Logs are structured JSON in production
- [ ] Logs are pretty-printed in development

---

## 🔍 Verification

```bash
cd apps/server

# 1. Check for console.* calls (should find 0)
grep -r "console\.log\|console\.error\|console\.warn" src/lib src/scripts
# Expected: No results (or only in test files)

# 2. Verify logger import
grep -r "import.*logger" src/lib src/scripts
# Expected: Multiple results

# 3. Run job locally (development mode)
NODE_ENV=development pnpm live-snapshot
# Expected: Pretty-printed colorized logs

# 4. Run job in production mode
NODE_ENV=production LOG_LEVEL=info pnpm live-snapshot
# Expected: JSON logs

# 5. Run tests
pnpm test
# Expected: All tests pass
```

---

## 📊 Estimated Context Usage

- **Files to create**: 1 (logger.ts)
- **Files to modify**: 4 (3 lib files + 1 script)
- **Lines to read**: ~200
- **Lines to modify**: ~60

---

## 🔗 Related Tasks

**Prerequisites:**
- REFACTOR-601: Arrow Functions (cleaner function syntax)

**Enables:**
- OBSERVABILITY-602: Metrics Collection (logger provides structured data)
- OBSERVABILITY-603: Health Checks (uses logger)
- Production debugging and monitoring

**Related:**
- All tasks (better debugging for everything)

---

## 💡 Cursor Prompt

```
I'm working on OBSERVABILITY-601 (Add structured logging).

Please:
1. Create src/lib/logger.ts with Pino configuration
2. Replace all console.* calls with logger.* in:
   - gauntlet-api-client.ts
   - snapshot-validator.ts
   - comprehensive-live-snapshot.ts
3. Use structured logging format with event names and context fields

Follow tasks/OBSERVABILITY-601-structured-logging.md steps exactly.

Pattern:
// Before:
console.log(`✅ M${id}: ${name}`);

// After:
logger.info({ event: 'snapshot_saved', matchupId: id, teamName: name });
```

---

## 📝 Notes

### Log Levels

- **debug**: Verbose development info (team names fetched, etc.)
- **info**: Normal operations (job started, snapshot saved)
- **warn**: Recoverable issues (API fallback, default values used)
- **error**: Failures requiring attention (save failed, API error)

### Structured Logging Benefits

1. **Queryable**: Filter logs by any field
   ```bash
   # Find all failed snapshots for week 4
   cat logs.json | grep '"event":"snapshot_save_failed"' | grep '"week":4'
   ```

2. **Aggregatable**: Count events, calculate metrics
   ```bash
   # Count saves vs skips
   cat logs.json | grep '"event":"snapshot_saved"' | wc -l
   ```

3. **Indexable**: Log aggregation tools (Datadog, Splunk) can index fields

4. **Type-safe**: TypeScript can validate log field names

### Environment Variables

```bash
# Development (pretty logs)
NODE_ENV=development LOG_LEVEL=debug pnpm live-snapshot

# Production (JSON logs)
NODE_ENV=production LOG_LEVEL=info pnpm live-snapshot

# Silent (errors only)
LOG_LEVEL=error pnpm live-snapshot
```

### Child Loggers

Use child loggers to add context to all logs within a scope:

```typescript
const jobLogger = createChildLogger({ job: 'live-snapshot', week: 4 });
jobLogger.info('Starting'); // Includes job and week in every log
```

---

## 🎯 Success Metrics

- [ ] 0 console.* calls in production code
- [ ] All logs structured with event names
- [ ] JSON logs in production mode
- [ ] Pretty logs in development mode
- [ ] Tests pass
- [ ] Job runs successfully with new logging

---

**Status:** ⏭️ Ready (blocked by REFACTOR-601)  
**Assignee:** _Unassigned_  
**Completed:** _Not Started_

