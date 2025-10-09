# Report Output Module

**Status**: ✅ Complete (RECAP-018)  
**Version**: 1.0.0

## Overview

The Report Output Module transforms LangGraph orchestration state into the final `WeeklyRecapReport` JSON format. It handles formatting, validation, and ensures proper metadata tracking with graceful handling of partial failures.

## Components

### 1. Formatter (`formatter.ts`)

Transforms `RecapReportState` into `WeeklyRecapReport` structure.

**Key Functions:**

```typescript
// Format state into complete report
const report = formatRecapReport(state);

// Serialize to JSON string
const json = serializeReport(report);

// Deserialize back to object
const report = deserializeReport(json);
```

**Features:**
- ✅ Matches existing `report-week5.json` structure exactly
- ✅ Comprehensive metadata tracking (timing, tokens, status)
- ✅ Graceful handling of partial failures
- ✅ Section-level error tracking
- ✅ Automatic status determination (`success` | `partial` | `failed`)

### 2. Validator (`validator.ts`)

Validates generated reports against schema and business rules.

**Key Functions:**

```typescript
// Validate report structure and content
const validation = validateReport(report);

// Check if ready for production
const ready = isProductionReady(validation);

// Get human-readable summary
const summary = summarizeValidation(validation);
```

**Validation Rules:**
- Week number (1-18)
- Season year (2024-2030)
- Narrative minimum length (50 chars per section)
- Score consistency checks
- Team count validation (12 AFC, 12 NFC)
- Matchup count validation (12 total)

**Quality Scoring:**
- Critical errors: -20 points each
- Major errors: -10 points each
- Minor errors: -5 points each
- Warnings: -2 points each
- Production ready: score >= 70

## Usage

### Basic Usage

```typescript
import { formatRecapReport, validateReport } from '@/lib/reports/recap/output';

// After orchestration completes
const report = formatRecapReport(state);

// Validate before saving
const validation = validateReport(report);
if (!validation.isValid) {
  console.error('Report validation failed:', validation.errors);
}

// Save to file system
await saveReport(report);
```

### Testing

```bash
# Run comprehensive test suite
npx tsx scripts/test-report-output.ts
```

**Test Scenarios:**
1. ✅ Successful report formatting
2. ✅ Report validation with warnings
3. ✅ Partial failure handling
4. ✅ Complete failure handling

## Output Structure

```typescript
interface WeeklyRecapReport {
  metadata: {
    week: number;
    season: number;
    generatedAt: string; // ISO timestamp
    generationTime: number; // milliseconds
    tokensUsed: number;
    version: string;
    status: 'success' | 'partial' | 'failed';
    errors?: string[];
  };
  sections: {
    leagueOverview: LeagueOverviewSection;
    matchupNarratives: MatchupNarrativeSection[];
    hallOfFame: HallOfFameSection;
    hallOfShame: HallOfShameSection;
    powerRankings: PowerRankingsSection;
    standings: StandingsSection;
    upcoming: UpcomingMatchupsSection;
    closing: ClosingCommentarySection;
  };
}
```

## Error Handling

### Status Determination

The formatter automatically determines report status based on section completion:

- **`success`**: All sections completed successfully
- **`partial`**: Some sections completed, some failed
- **`failed`**: All sections failed or critical error

### Partial Failure Example

```typescript
const state = {
  week: 5,
  season: 2025,
  leagueOverview: 'Successfully generated...',
  hallOfFame: 'Successfully generated...',
  hallOfShame: '', // Failed
  // ... other sections
  sectionMetadata: {
    hallOfShame: {
      status: 'failed',
      error: 'API timeout'
    }
  }
};

const report = formatRecapReport(state);
// report.metadata.status === 'partial'
// report.metadata.errors === ['[hallOfShame] API timeout']
```

## Validation Examples

### Valid Report

```typescript
const validation = validateReport(report);
// {
//   isValid: true,
//   errors: [],
//   warnings: [
//     { type: 'completeness', message: 'Expected 12 matchup narratives, got 11' }
//   ],
//   score: 94
// }

isProductionReady(validation); // true (score >= 70, no critical errors)
```

### Invalid Report

```typescript
const validation = validateReport(badReport);
// {
//   isValid: false,
//   errors: [
//     { severity: 'critical', message: 'Invalid week number', ... },
//     { severity: 'major', message: 'Narrative too short', ... }
//   ],
//   warnings: [...],
//   score: 45
// }

isProductionReady(validation); // false (score < 70 or has critical errors)
```

## Integration with Orchestrator

The output module integrates seamlessly with the LangGraph orchestrator:

```typescript
// orchestrator.ts
import { formatRecapReport, validateReport } from './output';

export const generateRecapReport = async (week: number, season: number) => {
  // 1. Run orchestration
  const state = await runRecapGraph({ week, season });
  
  // 2. Format output
  const report = formatRecapReport(state);
  
  // 3. Validate
  const validation = validateReport(report);
  
  if (!isProductionReady(validation)) {
    console.warn('Report has quality issues:', summarizeValidation(validation));
  }
  
  // 4. Save to file system
  await saveReport(report);
  
  return report;
};
```

## File Locations

```
output/
├── README.md           # This file
├── formatter.ts        # Report formatting logic
├── validator.ts        # Report validation logic
└── index.ts           # Public exports
```

## Next Steps (Phase 3)

- ✅ **RECAP-018**: JSON Report Output (COMPLETE)
- ⏳ **RECAP-019**: File System Storage
- ⏳ **RECAP-020**: Dynamic Page Generation
- ⏳ **RECAP-021**: Homepage Integration

## Related Documentation

- [Phase 3 Detailed Tasks](/tasks/RECAP-PHASE-3-DETAILED.md)
- [Types Documentation](/apps/web/src/lib/reports/recap/types.ts)
- [State Management](/apps/web/src/lib/reports/recap/state.ts)

