# Task SIM-612: Add Variance Data Versioning

**Category:** DATA_MANAGEMENT  
**Priority:** 🟡 MEDIUM  
**Estimated Time:** 30 minutes  
**Package:** apps/sim-engine

---

## 📋 Overview

Add versioning schema to variance-data.json to track changes over time, enable schema migrations, and provide data quality metrics.

---

## 🎯 Objective

Update variance-data.json format with version field, schema version, export metadata, and data quality metrics. Create validation logic that checks schema version compatibility.

---

## 📂 Context Needed

**Files to Read:**
- `apps/sim-engine/src/data/variance-data.json` (current format)
- `apps/sim-engine/src/data/variance-loader.ts` (data loading logic)

**Files to Create:**
- `apps/sim-engine/src/data/schema-version.ts` - Schema version validation

**Files to Update:**
- `apps/sim-engine/src/data/variance-data.json` - Add version fields
- `apps/sim-engine/src/data/variance-loader.ts` - Add version validation
- `apps/sim-engine/src/data/variance-data.types.ts` - Update VarianceData type

---

## 📝 Steps

### 1. Update VarianceData Type Definition

Update `apps/sim-engine/src/data/variance-data.types.ts`:

```typescript
import type {
  PositionVarianceRecord,
  PlayerVarianceRecord,
  ProjectionErrorRecord,
} from '@gauntlet/types';

/**
 * Data quality metrics for variance data export.
 */
export interface DataQualityMetrics {
  /** Total number of players in variance data */
  totalPlayers: number;
  /** Players with sufficient data (≥4 games) */
  playersWithVariance: number;
  /** Outliers removed during export */
  outlierRemovalCount: number;
  /** Positions with variance data */
  positionsWithVariance: string[];
}

/**
 * Complete variance data export format with versioning.
 */
export interface VarianceData {
  /** Semantic version of data format (e.g., "1.0.0") */
  version: string;
  
  /** Schema version number for breaking changes */
  schemaVersion: number;
  
  /** ISO 8601 timestamp of export */
  exportedAt: string;
  
  /** NFL season (e.g., 2025) */
  season: number;
  
  /** NFL weeks covered in this export */
  weeksCovered: number[];
  
  /** Data quality and statistics */
  dataQuality: DataQualityMetrics;
  
  /** Position-level variance distributions */
  positionVariance: PositionVarianceRecord[];
  
  /** Player-specific variance distributions */
  playerVariance: PlayerVarianceRecord[];
  
  /** Individual projection error records */
  projectionErrors: ProjectionErrorRecord[];
}
```

### 2. Create Schema Version Validator

Create `apps/sim-engine/src/data/schema-version.ts`:

```typescript
import { logger } from '../lib/logger';

/**
 * Current schema version supported by this codebase.
 * Increment on breaking changes to data format.
 */
export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Minimum schema version that can be read.
 * Older versions require migration.
 */
export const MIN_SUPPORTED_SCHEMA_VERSION = 1;

/**
 * Schema version validation result.
 */
export interface SchemaValidation {
  valid: boolean;
  requiresMigration: boolean;
  message: string;
}

/**
 * Validate schema version compatibility.
 * 
 * @param dataSchemaVersion - Schema version from loaded data
 * @returns Validation result with migration guidance
 */
export const validateSchemaVersion = (dataSchemaVersion: number): SchemaValidation => {
  if (dataSchemaVersion === CURRENT_SCHEMA_VERSION) {
    return {
      valid: true,
      requiresMigration: false,
      message: 'Schema version is current',
    };
  }

  if (dataSchemaVersion < MIN_SUPPORTED_SCHEMA_VERSION) {
    logger.error(
      {
        event: 'schema_version_too_old',
        dataVersion: dataSchemaVersion,
        minSupported: MIN_SUPPORTED_SCHEMA_VERSION,
        current: CURRENT_SCHEMA_VERSION,
      },
      `Variance data schema v${dataSchemaVersion} is too old (minimum: v${MIN_SUPPORTED_SCHEMA_VERSION})`
    );

    return {
      valid: false,
      requiresMigration: true,
      message: `Schema version ${dataSchemaVersion} is no longer supported. Please regenerate variance data.`,
    };
  }

  if (dataSchemaVersion > CURRENT_SCHEMA_VERSION) {
    logger.warn(
      {
        event: 'schema_version_newer',
        dataVersion: dataSchemaVersion,
        current: CURRENT_SCHEMA_VERSION,
      },
      `Variance data schema v${dataSchemaVersion} is newer than supported v${CURRENT_SCHEMA_VERSION}`
    );

    return {
      valid: true,
      requiresMigration: false,
      message: `Data uses newer schema v${dataSchemaVersion}. May have compatibility issues.`,
    };
  }

  // dataSchemaVersion is between MIN_SUPPORTED and CURRENT
  logger.info(
    {
      event: 'schema_version_older_supported',
      dataVersion: dataSchemaVersion,
      current: CURRENT_SCHEMA_VERSION,
    },
    `Variance data schema v${dataSchemaVersion} is supported but older than current v${CURRENT_SCHEMA_VERSION}`
  );

  return {
    valid: true,
    requiresMigration: false,
    message: `Using older schema v${dataSchemaVersion}. Consider regenerating for latest format.`,
  };
};

/**
 * Migration guidance for schema upgrades.
 */
export const getSchemaMigrationGuidance = (fromVersion: number, toVersion: number): string => {
  if (fromVersion === 1 && toVersion === 2) {
    return `
Schema v1 → v2 Migration:
- Added: dataQuality field with metrics
- Added: weeksCovered array
- Added: season number field
- No breaking changes to existing fields

Action: Regenerate variance data with update-variance-models job
Command: pnpm --filter @gauntlet/server run update-variance
    `.trim();
  }

  return `Migration path from v${fromVersion} to v${toVersion} not defined. Please regenerate variance data.`;
};
```

### 3. Update variance-data.json Format

Update `apps/sim-engine/src/data/variance-data.json`:

```json
{
  "version": "1.0.0",
  "schemaVersion": 2,
  "exportedAt": "2025-01-15T03:00:00.000Z",
  "season": 2025,
  "weeksCovered": [1, 2, 3, 4, 5],
  "dataQuality": {
    "totalPlayers": 380,
    "playersWithVariance": 320,
    "outlierRemovalCount": 15,
    "positionsWithVariance": ["QB", "RB", "WR", "TE", "K", "DEF"]
  },
  "positionVariance": [
    {
      "position": "QB",
      "season": "2025",
      "meanError": 0.05,
      "stdDev": 0.28,
      "sampleSize": 85
    }
  ],
  "playerVariance": [],
  "projectionErrors": []
}
```

### 4. Add Version Validation to Loader

Update `apps/sim-engine/src/data/variance-loader.ts`:

```typescript
import { validateSchemaVersion, CURRENT_SCHEMA_VERSION } from './schema-version';
import type { VarianceData } from './variance-data.types';

// Type assertion with version validation
const data = varianceData as VarianceData;

// Validate schema version on module load
const validation = validateSchemaVersion(data.schemaVersion || 1);

if (!validation.valid) {
  throw new Error(
    `Incompatible variance data schema: ${validation.message}`
  );
}

if (validation.requiresMigration) {
  throw new Error(
    `Variance data requires migration: ${validation.message}`
  );
}

// Log schema status
logger.info(
  {
    event: 'variance_data_loaded',
    version: data.version,
    schemaVersion: data.schemaVersion,
    currentSchemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: data.exportedAt,
    season: data.season,
    weeksCovered: data.weeksCovered,
    dataQuality: data.dataQuality,
  },
  'Variance data loaded successfully'
);

// Update getDataInfo to include version information
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
  };
};
```

### 5. Update Variance Update Job

Update `apps/server/src/scripts/jobs/update-variance-models.ts`:

```typescript
import { CURRENT_SCHEMA_VERSION } from '@gauntlet/sim-engine/src/data/schema-version';

// In updateVarianceModels function, update data structure:
const updatedVarianceData = {
  version: '1.0.0',
  schemaVersion: CURRENT_SCHEMA_VERSION,
  exportedAt: new Date().toISOString(),
  season: currentSeason,
  weeksCovered: [currentWeek],
  dataQuality: {
    totalPlayers: newPlayerVariance.length,
    playersWithVariance: newPlayerVariance.filter(p => p.sampleSize >= 4).length,
    outlierRemovalCount: outlierCount,
    positionsWithVariance: Array.from(
      new Set(cappedPositionVariance.map(p => p.position))
    ),
  },
  positionVariance: cappedPositionVariance,
  playerVariance: newPlayerVariance,
  projectionErrors: newProjectionErrors,
};
```

### 6. Export Version Utilities

Update `apps/sim-engine/src/index.ts`:

```typescript
// Schema versioning
export {
  validateSchemaVersion,
  getSchemaMigrationGuidance,
  CURRENT_SCHEMA_VERSION,
  MIN_SUPPORTED_SCHEMA_VERSION,
} from './data/schema-version';

export type { SchemaValidation } from './data/schema-version';
export type { DataQualityMetrics } from './data/variance-data.types';
```

### 7. Add Tests

Create `src/data/__tests__/schema-version.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  validateSchemaVersion,
  CURRENT_SCHEMA_VERSION,
  MIN_SUPPORTED_SCHEMA_VERSION,
} from '../schema-version';

describe('validateSchemaVersion', () => {
  it('should accept current schema version', () => {
    const result = validateSchemaVersion(CURRENT_SCHEMA_VERSION);
    expect(result.valid).toBe(true);
    expect(result.requiresMigration).toBe(false);
  });

  it('should reject schema versions below minimum', () => {
    const result = validateSchemaVersion(MIN_SUPPORTED_SCHEMA_VERSION - 1);
    expect(result.valid).toBe(false);
    expect(result.requiresMigration).toBe(true);
  });

  it('should accept older supported versions', () => {
    if (MIN_SUPPORTED_SCHEMA_VERSION < CURRENT_SCHEMA_VERSION) {
      const result = validateSchemaVersion(MIN_SUPPORTED_SCHEMA_VERSION);
      expect(result.valid).toBe(true);
      expect(result.requiresMigration).toBe(false);
    }
  });

  it('should warn about newer schema versions', () => {
    const result = validateSchemaVersion(CURRENT_SCHEMA_VERSION + 1);
    expect(result.valid).toBe(true);
    expect(result.message).toContain('newer');
  });
});
```

### 8. Verify Build and Tests

```bash
pnpm build
pnpm test
```

---

## ✅ Acceptance Criteria

- [ ] VarianceData type updated with version fields
- [ ] DataQualityMetrics interface created
- [ ] schema-version.ts created with validation logic
- [ ] variance-data.json updated with v2 schema
- [ ] Version validation on data load
- [ ] getDataInfo() includes version information
- [ ] Variance update job writes versioned data
- [ ] Schema version utilities exported
- [ ] Tests validate version compatibility logic
- [ ] `pnpm build` passes with 0 errors
- [ ] Backwards compatible with schema v1 data (if needed)

---

## 🔗 Related Tasks

**Depends On:**
- SIM-611: Create Weekly Variance Update Job (job writes versioned data)

**Blocks:** None

---

## 📊 Context Usage

- **Files to read:** 2 files (~100 lines)
- **Files to create:** 1 file (~150 lines)
- **Files to update:** 4 files (~200 lines changes)
- **Time estimate:** 30 minutes

---

## 🚀 Cursor Prompt

```
I'm working on SIM-612. Please:

1. Update variance-data.types.ts with VarianceData and DataQualityMetrics types
2. Create schema-version.ts with validation logic
3. Update variance-data.json with v2 schema format
4. Add version validation to variance-loader.ts
5. Update variance update job to write versioned data
6. Export version utilities from barrel
7. Create schema-version.test.ts
8. Verify with pnpm build and pnpm test

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

# Check variance data format
cat src/data/variance-data.json | jq '.version, .schemaVersion, .dataQuality'

# Test getDataInfo()
node -e "
const { getDataInfo } = require('./dist/src/index.js');
console.log(getDataInfo());
"
```

---

## 📝 Commit Message Template

```
feat(sim-engine): add variance data versioning and schema validation (SIM-612)

- Add VarianceData type with version, schemaVersion, dataQuality fields
- Create DataQualityMetrics interface for export statistics
- Create schema-version.ts with validation logic
- Current schema version: 2, minimum supported: 1
- Validate schema version on data load with migration guidance
- Update variance-data.json to v2 format
- Add season, weeksCovered, and dataQuality metadata
- Update getDataInfo() to include version information
- Update variance update job to write versioned data
- Export version utilities and types from barrel
- Tests validate version compatibility logic
- Enables schema evolution and data quality tracking

Part of sim-engine enterprise readiness initiative
```

