# Task SIM-613: Optimize Variance Data Loading

**Category:** DATA_MANAGEMENT  
**Priority:** 🟡 MEDIUM  
**Estimated Time:** 30 minutes  
**Package:** apps/sim-engine

---

## 📋 Overview

Optimize variance data loading with lazy initialization, parallel loading, and index pre-computation for better cold start performance and memory efficiency.

---

## 🎯 Objective

Implement lazy loading (don't initialize until first use), parallel data fetching, pre-computed lookup maps, and memory-efficient data structures. Target: <100ms cold start, <50MB memory.

---

## 📂 Context Needed

**Files to Read:**
- `apps/sim-engine/src/data/variance-loader.ts` (lines 26-45) - Current initialization

**Files to Update:**
- `apps/sim-engine/src/data/variance-loader.ts` - Optimize loading logic

---

## 📝 Steps

### 1. Implement Lazy Initialization

Update `apps/sim-engine/src/data/variance-loader.ts`:

```typescript
import { logger } from '../lib/logger';

// Module-level state
let initialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Lazy initialize variance data caches.
 * Only loads data on first use, not on module import.
 */
const ensureInitialized = async (): Promise<void> => {
  // Already initialized
  if (initialized) {
    return;
  }

  // Initialization in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = (async () => {
    const startTime = Date.now();

    try {
      await initializeCachesAsync();
      initialized = true;

      const duration = Date.now() - startTime;
      logger.info(
        {
          event: 'variance_data_initialized',
          duration,
          positionVarianceCount: positionVarianceCache.size,
          playerVarianceCount: playerVarianceCache.size,
          memoryUsageMB: process.memoryUsage().heapUsed / 1024 / 1024,
        },
        `Variance data initialized in ${duration}ms`
      );
    } catch (error) {
      initialized = false;
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
};

/**
 * Async version of initializeCaches with parallel loading.
 */
const initializeCachesAsync = async (): Promise<void> => {
  // Load position and player variance in parallel
  await Promise.all([
    // Position variance indexing
    Promise.resolve().then(() => {
      for (const record of data.positionVariance) {
        const key = `${record.position}-${record.season}`;
        positionVarianceCache.set(key, record);
      }
    }),

    // Player variance indexing
    Promise.resolve().then(() => {
      for (const record of data.playerVariance) {
        const key = `${record.playerId}-${record.season}`;
        playerVarianceCache.set(key, record);
      }
    }),
  ]);

  logger.debug(
    {
      event: 'variance_caches_built',
      positionRecords: data.positionVariance.length,
      playerRecords: data.playerVariance.length,
      projectionErrors: data.projectionErrors.length,
    },
    'Variance caches built'
  );
};

// Remove automatic initialization on module load
// Old code: initializeCaches();
// New: Lazy initialization via ensureInitialized()
```

### 2. Update Public Functions with Lazy Loading

Update all exported functions to call `ensureInitialized()`:

```typescript
export const getPositionDistribution = async (position: string): Promise<{
  outcomes: number[];
  sampleSize: number;
}> => {
  // Ensure data is loaded
  await ensureInitialized();

  // Try current season first, fallback to most recent
  const seasons = ['2025', '2024', '2023'];

  for (const season of seasons) {
    const key = `${position}-${season}`;
    const record = positionVarianceCache.get(key);

    if (record && record.sampleSize > 0) {
      // Generate synthetic outcomes based on mean and stdDev
      const outcomes = generateNormalDistribution(
        record.meanError,
        record.stdDev,
        record.sampleSize
      );
      return { outcomes, sampleSize: record.sampleSize };
    }
  }

  // Fallback to default variance if no data found
  logger.warn(
    {
      event: 'position_distribution_fallback',
      position,
      seasonsAttempted: seasons,
    },
    `No position variance data found for ${position}, using defaults`
  );
  return getDefaultPositionVariance(position);
};

export const getPlayerOutcomes = async (playerId: string): Promise<{
  outcomes: number[];
  sampleSize: number;
}> => {
  // Ensure data is loaded
  await ensureInitialized();

  // Check cache first (expire after 1 hour)
  const cached = playerOutcomeCache.get(playerId);
  if (cached && Date.now() - cached.lastUpdated.getTime() < 60 * 60 * 1000) {
    return cached;
  }

  try {
    // Get player's recent outcomes from static data
    const errors = data.projectionErrors
      .filter(e => e.playerId === playerId)
      .sort((a, b) => {
        // Sort by season desc, then week desc
        if (a.season !== b.season) {
          return b.season.localeCompare(a.season);
        }
        return b.week - a.week;
      })
      .slice(0, 16); // Take last 16 weeks

    if (errors.length < 4) {
      return { outcomes: [], sampleSize: 0 }; // Not enough data
    }

    // ... rest of existing logic
  } catch (error) {
    logger.error(
      {
        event: 'player_outcomes_error',
        playerId: playerId.slice(0, 8),
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to get player outcomes'
    );
    return { outcomes: [], sampleSize: 0 };
  }
};

export const getDataInfo = (): {
  version: string;
  schemaVersion: number;
  exportedAt: string;
  season: number;
  weeksCovered: number[];
  positionVarianceCount: number;
  playerVarianceCount: number;
  projectionErrorCount: number;
  dataQuality: DataQualityMetrics;
  initialized: boolean;
} => {
  return {
    version: data.version,
    schemaVersion: data.schemaVersion,
    exportedAt: data.exportedAt,
    season: data.season,
    weeksCovered: data.weeksCovered,
    positionVarianceCount: data.positionVariance.length,
    playerVarianceCount: data.playerVariance.length,
    projectionErrorCount: data.projectionErrors.length,
    dataQuality: data.dataQuality,
    initialized, // Add initialization status
  };
};
```

### 3. Add Pre-warming Function (Optional)

Add optional function to pre-warm caches:

```typescript
/**
 * Pre-warm variance data caches.
 * Call this during application startup to avoid first-request latency.
 * 
 * @example
 * // In server startup
 * await prewarmVarianceData();
 * console.log('Variance data ready');
 */
export const prewarmVarianceData = async (): Promise<void> => {
  await ensureInitialized();
};
```

### 4. Optimize Memory Usage

Add memory-efficient data structures:

```typescript
/**
 * Build optimized lookup index for projection errors.
 * Groups by player ID for O(1) access.
 */
const buildProjectionErrorIndex = (): Map<string, ProjectionErrorRecord[]> => {
  const index = new Map<string, ProjectionErrorRecord[]>();

  for (const error of data.projectionErrors) {
    if (!index.has(error.playerId)) {
      index.set(error.playerId, []);
    }
    index.get(error.playerId)!.push(error);
  }

  // Sort each player's errors by season/week desc
  for (const [playerId, errors] of index) {
    errors.sort((a, b) => {
      if (a.season !== b.season) {
        return b.season - a.season;
      }
      return b.week - a.week;
    });
  }

  return index;
};

// Build index during initialization
let projectionErrorIndex: Map<string, ProjectionErrorRecord[]> | null = null;

const initializeCachesAsync = async (): Promise<void> => {
  await Promise.all([
    // Position variance indexing
    Promise.resolve().then(() => {
      for (const record of data.positionVariance) {
        const key = `${record.position}-${record.season}`;
        positionVarianceCache.set(key, record);
      }
    }),

    // Player variance indexing
    Promise.resolve().then(() => {
      for (const record of data.playerVariance) {
        const key = `${record.playerId}-${record.season}`;
        playerVarianceCache.set(key, record);
      }
    }),

    // Projection error indexing
    Promise.resolve().then(() => {
      projectionErrorIndex = buildProjectionErrorIndex();
    }),
  ]);

  logger.debug(
    {
      event: 'variance_caches_built',
      positionRecords: data.positionVariance.length,
      playerRecords: data.playerVariance.length,
      projectionErrors: data.projectionErrors.length,
      projectionErrorIndexSize: projectionErrorIndex?.size || 0,
    },
    'Variance caches built with indexes'
  );
};

// Use index in getPlayerOutcomes
export const getPlayerOutcomes = async (playerId: string): Promise<{
  outcomes: number[];
  sampleSize: number;
}> => {
  await ensureInitialized();

  // Check cache first
  const cached = playerOutcomeCache.get(playerId);
  if (cached && Date.now() - cached.lastUpdated.getTime() < 60 * 60 * 1000) {
    return cached;
  }

  try {
    // Use pre-built index for O(1) lookup instead of filter
    const errors = projectionErrorIndex?.get(playerId)?.slice(0, 16) || [];

    if (errors.length < 4) {
      return { outcomes: [], sampleSize: 0 };
    }

    // ... rest of existing logic
  } catch (error) {
    logger.error(
      {
        event: 'player_outcomes_error',
        playerId: playerId.slice(0, 8),
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to get player outcomes'
    );
    return { outcomes: [], sampleSize: 0 };
  }
};
```

### 5. Add Performance Benchmarks

Create `src/data/__tests__/variance-loader.benchmark.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  getPositionDistribution,
  getPlayerOutcomes,
  prewarmVarianceData,
} from '../variance-loader';

describe('variance-loader performance', () => {
  it('should initialize in <100ms', async () => {
    const start = Date.now();
    await prewarmVarianceData();
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
  }, 10000);

  it('should fetch position distribution in <10ms after warmup', async () => {
    await prewarmVarianceData();

    const start = Date.now();
    await getPositionDistribution('QB');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(10);
  });

  it('should fetch player outcomes in <50ms after warmup', async () => {
    await prewarmVarianceData();

    const start = Date.now();
    await getPlayerOutcomes('4866'); // Patrick Mahomes
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(50);
  });

  it('should use <50MB memory after initialization', async () => {
    const memBefore = process.memoryUsage().heapUsed / 1024 / 1024;
    await prewarmVarianceData();
    const memAfter = process.memoryUsage().heapUsed / 1024 / 1024;
    const memDelta = memAfter - memBefore;

    expect(memDelta).toBeLessThan(50);
  });
});
```

### 6. Export Optimization Functions

Update `apps/sim-engine/src/index.ts`:

```typescript
// Data loading optimization
export { prewarmVarianceData } from './data/variance-loader';
```

### 7. Update Documentation

Add JSDoc for prewarmVarianceData:

```typescript
/**
 * Pre-warm variance data caches for optimal performance.
 * 
 * Call during application startup to avoid first-request latency.
 * Loads and indexes all variance data in parallel.
 * 
 * Performance characteristics:
 * - Cold start: <100ms
 * - Memory usage: <50MB
 * - Subsequent lookups: <10ms
 * 
 * @example
 * // Server startup
 * import { prewarmVarianceData } from '@gauntlet/sim-engine';
 * 
 * async function startServer() {
 *   console.log('Warming variance data...');
 *   await prewarmVarianceData();
 *   console.log('✅ Variance data ready');
 *   
 *   // Start server
 *   app.listen(3000);
 * }
 */
export const prewarmVarianceData = async (): Promise<void> => {
  await ensureInitialized();
};
```

### 8. Verify Optimizations

```bash
pnpm build
pnpm test
```

---

## ✅ Acceptance Criteria

- [ ] Lazy initialization implemented (no module-load overhead)
- [ ] Parallel data loading for position, player, projection error indexes
- [ ] Pre-computed lookup maps for O(1) access
- [ ] `prewarmVarianceData()` function for optional pre-warming
- [ ] Cold start time <100ms
- [ ] Memory usage <50MB for full dataset
- [ ] Subsequent lookups <10ms
- [ ] Performance benchmark tests pass
- [ ] getDataInfo() includes initialization status
- [ ] `pnpm build` passes with 0 errors
- [ ] No breaking changes to API

---

## 🔗 Related Tasks

**Depends On:**
- SIM-612: Add Variance Data Versioning (data format finalized)

**Blocks:** None

---

## 📊 Context Usage

- **Files to read:** 1 file (~200 lines)
- **Files to update:** 1 file (~150 lines changes)
- **Files to create:** 1 test file (~100 lines)
- **Time estimate:** 30 minutes

---

## 🚀 Cursor Prompt

```
I'm working on SIM-613. Please:

1. Read apps/sim-engine/src/data/variance-loader.ts
2. Implement lazy initialization with ensureInitialized()
3. Add parallel data loading in initializeCachesAsync()
4. Build projection error index for O(1) lookups
5. Add prewarmVarianceData() export function
6. Update all public functions with lazy loading
7. Create variance-loader.benchmark.test.ts
8. Verify performance targets: <100ms cold start, <50MB memory
9. Verify with pnpm build and pnpm test

Follow the task steps exactly.
```

---

## ✓ Verification Commands

```bash
# Verify TypeScript compilation
cd apps/sim-engine
pnpm build

# Verify tests pass
pnpm test

# Run performance benchmarks
pnpm test variance-loader.benchmark.test.ts

# Test memory usage
node --expose-gc -e "
global.gc();
const memBefore = process.memoryUsage().heapUsed / 1024 / 1024;
const { prewarmVarianceData } = require('./dist/src/index.js');
await prewarmVarianceData();
global.gc();
const memAfter = process.memoryUsage().heapUsed / 1024 / 1024;
console.log('Memory delta:', (memAfter - memBefore).toFixed(2), 'MB');
"
```

---

## 📝 Commit Message Template

```
perf(sim-engine): optimize variance data loading performance (SIM-613)

- Implement lazy initialization (no module-load overhead)
- Add parallel data loading for position, player, projection error indexes
- Build pre-computed lookup maps for O(1) access
- Add prewarmVarianceData() for optional startup pre-warming
- Optimize memory usage with indexed data structures
- Performance improvements:
  - Cold start: <100ms (was immediate but blocking)
  - Memory usage: <50MB for full dataset
  - Subsequent lookups: <10ms
- Add performance benchmark tests
- Update getDataInfo() with initialization status
- TypeScript compilation passes with 0 errors
- No breaking changes to API

Part of sim-engine enterprise readiness initiative
```

