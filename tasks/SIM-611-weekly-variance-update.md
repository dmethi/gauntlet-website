# Task SIM-611: Create Weekly Variance Update Job

**Category:** DATA_MANAGEMENT  
**Priority:** ⚠️ HIGH  
**Estimated Time:** 1 hour  
**Package:** apps/server + apps/sim-engine

---

## 📋 Overview

Create automated weekly job to update player and position variance models with latest NFL week's data. This ensures simulation accuracy improves over time with fresh performance data.

---

## 🎯 Objective

Build job that fetches weekly stats/projections from Sleeper API, calculates projection errors, updates variance models with progressive seasonal weighting, validates changes, and commits updated variance-data.json to repo.

---

## 📂 Context Needed

**Files to Read:**
- `apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts` - Job pattern reference
- `apps/sim-engine/src/data/variance-loader.ts` - Current variance loading
- `apps/sim-engine/src/data/variance-data.types.ts` - Type definitions

**Files to Create:**
- `apps/server/src/scripts/jobs/update-variance-models.ts` - Main job script
- `apps/sim-engine/src/data/variance-updater.ts` - Update logic
- `apps/sim-engine/src/data/variance-validator.ts` - Validation logic
- `apps/sim-engine/src/data/players-cache.json` - Local player metadata cache (if doesn't exist)

**Sleeper API Endpoints:**
- `GET /players/nfl` - All NFL players (called once yearly, cached locally)
- `GET /stats/nfl/regular/{season}/{week}` - Actual player stats
- `GET /projections/nfl/{season}/{week}` - Projected player stats

---

## 📝 Steps

### 1. Create Player Metadata Cache Utility

Create `apps/sim-engine/src/data/player-metadata.ts`:

```typescript
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLAYERS_CACHE_PATH = path.join(__dirname, 'players-cache.json');

interface SleeperPlayer {
  player_id: string;
  full_name: string;
  position: string;
  team: string | null;
  active: boolean;
}

interface PlayerMetadataCache {
  lastUpdated: string;
  season: number;
  players: Record<string, SleeperPlayer>;
}

/**
 * Get all NFL players from cache or Sleeper API.
 * Updates cache once per year (or if cache doesn't exist).
 */
export const getPlayerMetadata = async (): Promise<Record<string, SleeperPlayer>> => {
  try {
    // Try to load from cache
    const cacheData = await fs.readFile(PLAYERS_CACHE_PATH, 'utf-8');
    const cache: PlayerMetadataCache = JSON.parse(cacheData);

    const currentYear = new Date().getFullYear();
    const cacheYear = new Date(cache.lastUpdated).getFullYear();

    // Cache is from current year, use it
    if (cacheYear === currentYear) {
      return cache.players;
    }
  } catch (error) {
    // Cache doesn't exist or is invalid, fetch from API
  }

  // Fetch from Sleeper API
  const response = await fetch('https://api.sleeper.app/v1/players/nfl');
  if (!response.ok) {
    throw new Error(`Failed to fetch players: ${response.statusText}`);
  }

  const players = (await response.json()) as Record<string, SleeperPlayer>;

  // Save to cache
  const cache: PlayerMetadataCache = {
    lastUpdated: new Date().toISOString(),
    season: new Date().getFullYear(),
    players,
  };

  await fs.writeFile(PLAYERS_CACHE_PATH, JSON.stringify(cache, null, 2));

  return players;
};
```

### 2. Create Variance Updater Logic

Create `apps/sim-engine/src/data/variance-updater.ts`:

```typescript
import type {
  VarianceData,
  PositionVarianceRecord,
  PlayerVarianceRecord,
  ProjectionErrorRecord,
} from '@gauntlet/types';

interface WeeklyStatsData {
  season: number;
  week: number;
  stats: Record<string, any>; // Sleeper stats format
  projections: Record<string, any>; // Sleeper projections format
}

/**
 * Progressive seasonal weighting for variance calculations.
 * More recent seasons get higher weight.
 * 
 * 2025: 1.0, 2024: 0.75, 2023: 0.5, 2022: 0.25
 */
const getSeasonWeight = (season: number): number => {
  const currentSeason = new Date().getFullYear();
  const yearsAgo = currentSeason - season;

  if (yearsAgo === 0) return 1.0;
  if (yearsAgo === 1) return 0.75;
  if (yearsAgo === 2) return 0.5;
  if (yearsAgo === 3) return 0.25;
  return 0; // Don't use data older than 3 years
};

/**
 * Calculate projection error for a single player-week.
 * Returns relative outcome (actual / projected).
 */
const calculateProjectionError = (
  playerId: string,
  stats: any,
  projection: any
): number | null => {
  const actualPoints = stats?.pts_half_ppr || 0;
  const projectedPoints = projection?.pts_half_ppr || 0;

  // Skip if no meaningful projection
  if (projectedPoints < 1) {
    return null;
  }

  return actualPoints / projectedPoints;
};

/**
 * Remove statistical outliers beyond 3 standard deviations.
 */
const removeOutliers = (values: number[]): number[] => {
  if (values.length < 4) return values;

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const threshold = 3 * stdDev;

  return values.filter(v => Math.abs(v - mean) <= threshold);
};

/**
 * Update projection errors with new week's data.
 * Maintains rolling 16-week window per player.
 */
export const updateProjectionErrors = (
  existingErrors: ProjectionErrorRecord[],
  weeklyData: WeeklyStatsData
): { updated: ProjectionErrorRecord[]; newCount: number; outlierCount: number } => {
  const { season, week, stats, projections } = weeklyData;
  const newErrors: ProjectionErrorRecord[] = [];
  let outlierCount = 0;

  // Calculate errors for this week
  for (const [playerId, playerStats] of Object.entries(stats)) {
    const projection = projections[playerId];
    if (!projection) continue;

    const error = calculateProjectionError(playerId, playerStats, projection);
    if (error === null) continue;

    // Check for outliers (>3σ from mean)
    const playerHistory = existingErrors.filter(e => e.playerId === playerId);
    if (playerHistory.length >= 4) {
      const historicalValues = playerHistory.map(e => e.actualPoints / e.projectedPoints);
      const cleanedValues = removeOutliers([...historicalValues, error]);

      if (cleanedValues.length < historicalValues.length + 1) {
        // This new value is an outlier, skip it
        outlierCount++;
        continue;
      }
    }

    newErrors.push({
      playerId,
      season,
      week,
      projectedPoints: projection.pts_half_ppr,
      actualPoints: playerStats.pts_half_ppr,
    });
  }

  // Combine with existing, keep last 16 weeks per player
  const allErrors = [...existingErrors, ...newErrors];
  const playerErrorMap = new Map<string, ProjectionErrorRecord[]>();

  for (const error of allErrors) {
    if (!playerErrorMap.has(error.playerId)) {
      playerErrorMap.set(error.playerId, []);
    }
    playerErrorMap.get(error.playerId)!.push(error);
  }

  // Keep last 16 weeks per player, sorted by season/week desc
  const updated: ProjectionErrorRecord[] = [];
  for (const [playerId, errors] of playerErrorMap) {
    const sorted = errors.sort((a, b) => {
      if (a.season !== b.season) return b.season - a.season;
      return b.week - a.week;
    });
    updated.push(...sorted.slice(0, 16));
  }

  return { updated, newCount: newErrors.length, outlierCount };
};

/**
 * Update position variance with progressive seasonal weighting.
 * Calculates mean error and standard deviation for each position.
 */
export const updatePositionVariance = (
  projectionErrors: ProjectionErrorRecord[],
  playerMetadata: Record<string, any>
): PositionVarianceRecord[] => {
  const positionMap = new Map<string, { errors: { value: number; weight: number }[] }>();

  // Group errors by position with seasonal weighting
  for (const error of projectionErrors) {
    const player = playerMetadata[error.playerId];
    if (!player || !player.position) continue;

    const position = player.position;
    const relativeError = error.actualPoints / error.projectedPoints;
    const weight = getSeasonWeight(error.season);

    if (weight === 0) continue; // Skip old data

    if (!positionMap.has(position)) {
      positionMap.set(position, { errors: [] });
    }

    positionMap.get(position)!.errors.push({ value: relativeError, weight });
  }

  // Calculate weighted mean and std dev for each position
  const records: PositionVarianceRecord[] = [];

  for (const [position, data] of positionMap) {
    const { errors } = data;
    if (errors.length < 10) continue; // Need minimum sample size

    // Weighted mean
    const totalWeight = errors.reduce((sum, e) => sum + e.weight, 0);
    const weightedMean =
      errors.reduce((sum, e) => sum + e.value * e.weight, 0) / totalWeight;

    // Weighted standard deviation
    const weightedVariance =
      errors.reduce((sum, e) => sum + e.weight * Math.pow(e.value - weightedMean, 2), 0) /
      totalWeight;
    const weightedStdDev = Math.sqrt(weightedVariance);

    // Get latest season for this position
    const seasons = errors.map(e => Number(e.value.toString().split('-')[0]));
    const latestSeason = Math.max(...seasons);

    records.push({
      position,
      season: latestSeason.toString(),
      meanError: weightedMean - 1.0, // Convert to error relative to 1.0
      stdDev: weightedStdDev,
      sampleSize: errors.length,
    });
  }

  return records;
};

/**
 * Update player variance records.
 * Only includes players with ≥4 games in rolling 16-week window.
 */
export const updatePlayerVariance = (
  projectionErrors: ProjectionErrorRecord[]
): PlayerVarianceRecord[] => {
  const playerMap = new Map<string, ProjectionErrorRecord[]>();

  // Group errors by player
  for (const error of projectionErrors) {
    if (!playerMap.has(error.playerId)) {
      playerMap.set(error.playerId, []);
    }
    playerMap.get(error.playerId)!.push(error);
  }

  const records: PlayerVarianceRecord[] = [];

  for (const [playerId, errors] of playerMap) {
    if (errors.length < 4) continue; // Minimum 4 games required

    const relativeErrors = errors.map(e => e.actualPoints / e.projectedPoints);

    // Calculate mean and std dev
    const mean = relativeErrors.reduce((sum, v) => sum + v, 0) / relativeErrors.length;
    const variance =
      relativeErrors.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / relativeErrors.length;
    const stdDev = Math.sqrt(variance);

    // Get latest season
    const latestSeason = Math.max(...errors.map(e => e.season));

    records.push({
      playerId,
      season: latestSeason.toString(),
      meanError: mean - 1.0,
      stdDev,
      sampleSize: errors.length,
    });
  }

  return records;
};
```

### 3. Create Variance Validator

Create `apps/sim-engine/src/data/variance-validator.ts`:

```typescript
import type { PositionVarianceRecord, PlayerVarianceRecord } from '@gauntlet/types';
import { logger } from '../lib/logger';

const MAX_WEEKLY_VARIANCE_CHANGE = 0.20; // 20% threshold

/**
 * Validate that variance changes are reasonable (not > 20% shift).
 * Logs warnings for dramatic changes.
 */
export const validateVarianceChanges = (
  oldPositionVariance: PositionVarianceRecord[],
  newPositionVariance: PositionVarianceRecord[]
): { valid: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  const oldMap = new Map(oldPositionVariance.map(r => [r.position, r]));
  const newMap = new Map(newPositionVariance.map(r => [r.position, r]));

  for (const [position, newRecord] of newMap) {
    const oldRecord = oldMap.get(position);
    if (!oldRecord) continue;

    const oldStdDev = oldRecord.stdDev;
    const newStdDev = newRecord.stdDev;
    const percentChange = Math.abs(newStdDev - oldStdDev) / oldStdDev;

    if (percentChange > MAX_WEEKLY_VARIANCE_CHANGE) {
      const warning = `${position} variance changed by ${(percentChange * 100).toFixed(1)}% (${oldStdDev.toFixed(3)} → ${newStdDev.toFixed(3)})`;
      warnings.push(warning);

      logger.warn({
        event: 'variance_validation_warning',
        position,
        oldStdDev,
        newStdDev,
        percentChange: percentChange * 100,
        threshold: MAX_WEEKLY_VARIANCE_CHANGE * 100,
      }, warning);
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
};

/**
 * Cap variance changes to maximum 20% per week.
 * Prevents single week from having outsized impact.
 */
export const capVarianceChanges = (
  oldPositionVariance: PositionVarianceRecord[],
  newPositionVariance: PositionVarianceRecord[]
): PositionVarianceRecord[] => {
  const oldMap = new Map(oldPositionVariance.map(r => [r.position, r]));

  return newPositionVariance.map(newRecord => {
    const oldRecord = oldMap.get(newRecord.position);
    if (!oldRecord) return newRecord;

    const oldStdDev = oldRecord.stdDev;
    const newStdDev = newRecord.stdDev;
    const percentChange = (newStdDev - oldStdDev) / oldStdDev;

    // Cap at ±20%
    if (Math.abs(percentChange) > MAX_WEEKLY_VARIANCE_CHANGE) {
      const cappedStdDev =
        percentChange > 0
          ? oldStdDev * (1 + MAX_WEEKLY_VARIANCE_CHANGE)
          : oldStdDev * (1 - MAX_WEEKLY_VARIANCE_CHANGE);

      logger.info({
        event: 'variance_change_capped',
        position: newRecord.position,
        oldStdDev,
        requestedStdDev: newStdDev,
        cappedStdDev,
      }, `Capped ${newRecord.position} variance change to 20%`);

      return {
        ...newRecord,
        stdDev: cappedStdDev,
      };
    }

    return newRecord;
  });
};
```

### 4. Create Main Job Script

Create `apps/server/src/scripts/jobs/update-variance-models.ts`:

```typescript
import { logger } from '@/lib';
import { createMetrics } from '@gauntlet/types';
import { getPlayerMetadata } from '@gauntlet/sim-engine/src/data/player-metadata';
import {
  updateProjectionErrors,
  updatePositionVariance,
  updatePlayerVariance,
} from '@gauntlet/sim-engine/src/data/variance-updater';
import { validateVarianceChanges, capVarianceChanges } from '@gauntlet/sim-engine/src/data/variance-validator';
import varianceData from '@gauntlet/sim-engine/src/data/variance-data.json';
import fs from 'fs/promises';
import path from 'path';

const metrics = createMetrics();

/**
 * Fetch week's stats from Sleeper API with batching.
 */
const fetchWeeklyStats = async (
  season: number,
  week: number
): Promise<{ stats: any; projections: any }> => {
  const startTime = Date.now();

  const [statsRes, projectionsRes] = await Promise.all([
    fetch(`https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}`),
    fetch(`https://api.sleeper.app/v1/projections/nfl/${season}/${week}`),
  ]);

  if (!statsRes.ok || !projectionsRes.ok) {
    throw new Error('Failed to fetch weekly data from Sleeper API');
  }

  const stats = await statsRes.json();
  const projections = await projectionsRes.json();

  metrics.recordTiming('sleeper_api.fetch_weekly_data', Date.now() - startTime);
  metrics.increment('sleeper_api.players_fetched', Object.keys(stats).length);

  return { stats, projections };
};

/**
 * Main variance update job.
 * 
 * Run after MNF each week (Tuesday 3am ET recommended).
 */
const updateVarianceModels = async () => {
  const jobStart = Date.now();

  logger.info({ event: 'variance_update_job_started' }, 'Starting weekly variance model update');

  try {
    // 1. Get current season and week (assume latest completed week)
    const currentSeason = new Date().getFullYear();
    const currentWeek = 5; // TODO: Get from Sleeper NFL state API

    logger.info({ season: currentSeason, week: currentWeek }, 'Fetching data for week');

    // 2. Fetch player metadata (cached yearly)
    const playerMetadata = await getPlayerMetadata();
    metrics.increment('player_metadata.loaded', Object.keys(playerMetadata).length);

    // 3. Fetch week's stats and projections
    const { stats, projections } = await fetchWeeklyStats(currentSeason, currentWeek);

    // 4. Update projection errors
    const { updated: newProjectionErrors, newCount, outlierCount } = updateProjectionErrors(
      (varianceData as any).projectionErrors || [],
      { season: currentSeason, week: currentWeek, stats, projections }
    );

    logger.info(
      {
        event: 'projection_errors_updated',
        newErrorCount: newCount,
        outlierCount,
        totalErrors: newProjectionErrors.length,
      },
      `Updated projection errors: ${newCount} new, ${outlierCount} outliers removed`
    );

    metrics.increment('variance_update.new_errors', newCount);
    metrics.increment('variance_update.outliers_removed', outlierCount);

    // 5. Update position variance with progressive weighting
    const newPositionVariance = updatePositionVariance(newProjectionErrors, playerMetadata);

    logger.info(
      { positionCount: newPositionVariance.length },
      `Updated variance for ${newPositionVariance.length} positions`
    );

    // 6. Validate variance changes
    const validation = validateVarianceChanges(
      (varianceData as any).positionVariance || [],
      newPositionVariance
    );

    if (!validation.valid) {
      logger.warn(
        { warningCount: validation.warnings.length, warnings: validation.warnings },
        'Variance validation warnings detected'
      );
    }

    // 7. Cap variance changes to 20%
    const cappedPositionVariance = capVarianceChanges(
      (varianceData as any).positionVariance || [],
      newPositionVariance
    );

    // 8. Update player variance
    const newPlayerVariance = updatePlayerVariance(newProjectionErrors);

    logger.info(
      { playerCount: newPlayerVariance.length },
      `Updated variance for ${newPlayerVariance.length} players (≥4 games)`
    );

    // 9. Build updated variance data
    const updatedVarianceData = {
      version: '1.0.0',
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      weeksCovered: [currentWeek],
      dataQuality: {
        totalPlayers: newPlayerVariance.length,
        playersWithVariance: newPlayerVariance.filter(p => p.sampleSize >= 4).length,
        outlierRemovalCount: outlierCount,
      },
      positionVariance: cappedPositionVariance,
      playerVariance: newPlayerVariance,
      projectionErrors: newProjectionErrors,
    };

    // 10. Write updated data to variance-data.json
    const varianceDataPath = path.resolve(
      process.cwd(),
      '../sim-engine/src/data/variance-data.json'
    );

    await fs.writeFile(varianceDataPath, JSON.stringify(updatedVarianceData, null, 2));

    logger.info(
      {
        event: 'variance_data_updated',
        path: varianceDataPath,
        fileSize: JSON.stringify(updatedVarianceData).length,
      },
      'Variance data file updated successfully'
    );

    // 11. Log metrics summary
    const metricsSummary = metrics.getSummary();
    logger.info({ event: 'variance_update_job_completed', metrics: metricsSummary }, 'Job completed successfully');

    console.log('\n✅ Variance models updated successfully!');
    console.log(`   - ${newCount} new projection errors added`);
    console.log(`   - ${outlierCount} outliers removed`);
    console.log(`   - ${cappedPositionVariance.length} positions updated`);
    console.log(`   - ${newPlayerVariance.length} players updated`);
    console.log(`   - Validation warnings: ${validation.warnings.length}`);
    console.log(`\n📊 Next steps:`);
    console.log(`   1. Review changes: git diff apps/sim-engine/src/data/variance-data.json`);
    console.log(`   2. Commit changes: git add . && git commit -m "chore: update variance models (week ${currentWeek})"`);

    metrics.recordTiming('variance_update_job.duration', Date.now() - jobStart);
  } catch (error) {
    logger.error(
      {
        event: 'variance_update_job_failed',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Variance update job failed'
    );

    throw error;
  }
};

// Run job
updateVarianceModels().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

### 5. Add NPM Script

Update `apps/server/package.json`:

```json
{
  "scripts": {
    "update-variance": "tsx src/scripts/jobs/update-variance-models.ts"
  }
}
```

### 6. Test Job Manually

```bash
cd apps/server
pnpm update-variance
```

### 7. Document Job in README

Add section to `apps/server/README.md`:

```markdown
## Variance Model Updates

Weekly job to update player variance models with latest NFL performance data.

### Run Manually

```bash
pnpm --filter @gauntlet/server run update-variance
```

### Schedule (Recommended)

Run Tuesday 3am ET after Monday Night Football:
```cron
0 3 * * 2 cd /path/to/gauntlet && pnpm --filter @gauntlet/server run update-variance
```

### What It Does

1. Fetches latest week's stats and projections from Sleeper API
2. Calculates projection errors (actual vs projected)
3. Updates player variance (rolling 16-week window)
4. Updates position variance (progressive seasonal weighting: 2025→2024→2023→2022)
5. Removes statistical outliers (>3σ)
6. Validates variance changes (<20% threshold)
7. Updates variance-data.json
8. Logs structured metrics

### Output

Updated file: `apps/sim-engine/src/data/variance-data.json`

Commit this file to repo after manual review.
```

---

## ✅ Acceptance Criteria

- [ ] Script runs: `pnpm --filter @gauntlet/server run update-variance`
- [ ] Fetches latest week's stats and projections from Sleeper API
- [ ] Reads player metadata from local JSON (or fetches once yearly)
- [ ] Updates player variance for active players (≥4 games)
- [ ] Updates position variance with progressive seasonal weighting
- [ ] Removes outliers beyond 3σ
- [ ] Validates variance changes with 20% threshold (logs warnings)
- [ ] Caps individual week impact to 20% max change
- [ ] Updates `variance-data.json` with new models
- [ ] Logs structured metrics for observability
- [ ] Tests validate calculation logic
- [ ] Can run manually (commit to git manually for now)
- [ ] Job completes in reasonable time (<5 minutes for ~250 players)
- [ ] Fallback to current variance-data.json works if job fails

---

## 🔗 Related Tasks

**Depends On:**
- SIM-607: Add Structured Logging (job needs logger)
- SIM-608: Add Metrics Collection (job tracks metrics)

**Blocks:**
- SIM-612: Add Variance Data Versioning (versioning schema)

---

## 📊 Context Usage

- **Files to read:** 3 files (~300 lines)
- **Files to create:** 4 files (~800 lines)
- **Time estimate:** 1 hour

---

## 🚀 Cursor Prompt

```
I'm working on SIM-611. Please:

1. Read apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts for job patterns
2. Create apps/sim-engine/src/data/player-metadata.ts
3. Create apps/sim-engine/src/data/variance-updater.ts
4. Create apps/sim-engine/src/data/variance-validator.ts
5. Create apps/server/src/scripts/jobs/update-variance-models.ts
6. Add pnpm script: update-variance
7. Test with: pnpm --filter @gauntlet/server run update-variance

Follow specifications:
- Sleeper API for stats/projections
- Local JSON for player metadata (cached yearly)
- Progressive weighting: 2025(1.0), 2024(0.75), 2023(0.5), 2022(0.25)
- 20% validation threshold with warnings
- 16-week rolling window for players
- 3σ outlier removal
- Commit variance-data.json to git

Follow the task steps exactly.
```

---

## ✓ Verification Commands

```bash
# Run job manually
cd apps/server
pnpm update-variance

# Verify variance-data.json updated
ls -lah ../sim-engine/src/data/variance-data.json

# Check git diff
git diff apps/sim-engine/src/data/variance-data.json

# Verify player metadata cache created
ls -lah apps/sim-engine/src/data/players-cache.json

# Run tests
pnpm test
```

---

## 📝 Commit Message Template

```
feat(sim-engine): add weekly variance model update job (SIM-611)

- Create update-variance-models.ts job in apps/server
- Fetch weekly stats/projections from Sleeper API
- Implement progressive seasonal weighting (2025→2024→2023→2022)
- Update player variance with 16-week rolling window
- Update position variance with weighted aggregation
- Remove statistical outliers (>3σ threshold)
- Validate variance changes with 20% cap per week
- Cache player metadata locally (yearly refresh)
- Log structured metrics for observability
- Updates variance-data.json for sim-engine consumption
- Run manually: pnpm --filter @gauntlet/server run update-variance
- Enables continuous improvement of simulation accuracy

Part of sim-engine enterprise readiness initiative
```

