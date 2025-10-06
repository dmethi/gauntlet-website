# Task SIM-607: Add Structured Logging with Pino

**Category:** OBSERVABILITY  
**Priority:** ⚠️ HIGH  
**Estimated Time:** 45 minutes  
**Package:** apps/sim-engine

---

## 📋 Overview

Replace all console.* calls with structured logging using Pino. This enables queryable JSON logs in production and human-readable logs in development for better observability.

---

## 🎯 Objective

Install Pino, create logger utility, and replace 5 console.* calls with structured logging that includes event names and contextual fields.

---

## 📂 Context Needed

**Files to Read:**
- `apps/server/src/lib/logger.ts` (full file) - Reference logger setup
- `apps/sim-engine/src/models/variance.ts` (lines 76, 123) - console.error calls
- `apps/sim-engine/src/data/variance-loader.ts` (lines 39-41, 74, 133) - console.log/warn/error calls

**Files to Create:**
- `apps/sim-engine/src/lib/logger.ts` - Pino logger configuration

**Files to Update:**
- `apps/sim-engine/src/models/variance.ts` - Replace console.error
- `apps/sim-engine/src/data/variance-loader.ts` - Replace console.log/warn/error

---

## 📝 Steps

### 1. Install Pino Dependencies

```bash
cd apps/sim-engine
pnpm add pino
pnpm add -D pino-pretty
```

### 2. Create Logger Utility

Create `apps/sim-engine/src/lib/logger.ts`:

```typescript
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
export const createChildLogger = (context: Record<string, unknown>) => {
  return logger.child(context);
};
```

### 3. Update variance.ts Logging

Update `apps/sim-engine/src/models/variance.ts`:

```typescript
// Add import at top
import { logger } from '../lib/logger';

// Replace line 76
// BEFORE: console.error(`Error getting ${position} distribution:`, error);
// AFTER:
logger.error(
  {
    event: 'position_distribution_error',
    position,
    error: error instanceof Error ? error.message : String(error),
  },
  `Failed to get ${position} distribution, using defaults`
);

// Replace line 123
// BEFORE: console.error('Error getting player outcomes:', error);
// AFTER:
logger.error(
  {
    event: 'player_outcomes_error',
    playerId: playerId.slice(0, 8), // Truncate for log brevity
    error: error instanceof Error ? error.message : String(error),
  },
  'Failed to get player outcomes, returning empty'
);
```

### 4. Update variance-loader.ts Logging

Update `apps/sim-engine/src/data/variance-loader.ts`:

```typescript
// Add import at top
import { logger } from '../lib/logger';

// Replace lines 39-41 (initializeCaches function)
// BEFORE:
// console.log(`✅ Loaded ${data.positionVariance.length} position variance records`);
// console.log(`✅ Loaded ${data.playerVariance.length} player variance records`);
// console.log(`✅ Loaded ${data.projectionErrors.length} projection error records`);

// AFTER:
logger.info(
  {
    event: 'variance_cache_initialized',
    positionVarianceCount: data.positionVariance.length,
    playerVarianceCount: data.playerVariance.length,
    projectionErrorCount: data.projectionErrors.length,
  },
  'Variance data loaded and cached'
);

// Replace line 74
// BEFORE: console.warn(`No position variance data found for ${position}, using defaults`);
// AFTER:
logger.warn(
  {
    event: 'position_distribution_fallback',
    position,
    seasonsAttempted: seasons,
  },
  `No variance data found for ${position}, using default distribution`
);

// Replace line 133
// BEFORE: console.error('Error getting player outcomes:', error);
// AFTER:
logger.error(
  {
    event: 'player_outcomes_error',
    playerId: playerId.slice(0, 8),
    error: error instanceof Error ? error.message : String(error),
  },
  'Failed to get player outcomes'
);
```

### 5. Export Logger from Barrel

Update `apps/sim-engine/src/index.ts` (or create `src/lib/index.ts`):

```typescript
// Add to exports
export { logger, createChildLogger } from './lib/logger';
```

### 6. Verify Logging Works

```bash
# Build to check TypeScript compilation
pnpm build

# Run a script that uses sim-engine to see logs
# Should show pretty-printed logs in development
```

---

## ✅ Acceptance Criteria

- [ ] Pino and pino-pretty installed
- [ ] `src/lib/logger.ts` created with environment-aware config
- [ ] All 5 console.* calls replaced with logger.*
- [ ] Structured event names added to all log statements
- [ ] Contextual fields included (position, playerId, error details)
- [ ] Logger exported from barrel file
- [ ] `pnpm build` passes with 0 errors
- [ ] Development logs are pretty-printed and colorized
- [ ] No console.log/warn/error remain in production code

---

## 🔗 Related Tasks

**Depends On:**
- SIM-603: Add Barrel Exports (logger can be exported cleanly)

**Blocks:**
- SIM-608: Add Metrics Collection (logger and metrics often used together)

---

## 📊 Context Usage

- **Files to read:** 3 files (~200 lines)
- **Files to create:** 1 file (~50 lines)
- **Files to update:** 2 files (~10 lines changes)
- **Time estimate:** 45 minutes

---

## 🚀 Cursor Prompt

```
I'm working on SIM-607. Please:

1. Read apps/server/src/lib/logger.ts for logger setup patterns
2. Read apps/sim-engine/src/models/variance.ts (lines 76, 123)
3. Read apps/sim-engine/src/data/variance-loader.ts (lines 39-41, 74, 133)
4. Install Pino dependencies
5. Create src/lib/logger.ts with environment-aware config
6. Replace all 5 console.* calls with structured logging
7. Add event names and contextual fields
8. Verify with pnpm build

Follow the task steps exactly.
```

---

## ✓ Verification Commands

```bash
# Verify Pino installed
pnpm list pino

# Verify no console.* remain (except in tests/markdown)
grep -r "console\." apps/sim-engine/src/*.ts apps/sim-engine/src/**/*.ts
# Should only show results in .md files or test files

# Verify TypeScript compilation
cd apps/sim-engine
pnpm build

# Test logging (if you have a test script)
NODE_ENV=development node -e "const { logger } = require('./dist/src/lib/logger'); logger.info('test');"
```

---

## 📝 Commit Message Template

```
feat(sim-engine): add structured logging with Pino (SIM-607)

- Install Pino 9.x with pino-pretty for development
- Create src/lib/logger.ts with environment-aware configuration
- Replace 5 console.* calls with structured logging
- variance.ts: 2 console.error → logger.error
- variance-loader.ts: 3 console.log/warn/error → logger.info/warn/error
- Add structured event names: variance_cache_initialized, position_distribution_error, etc.
- Include contextual fields: position, playerId, error details
- Development: Pretty-printed logs, Production: JSON logs
- TypeScript compilation passes with 0 errors

Part of sim-engine enterprise readiness initiative
```

