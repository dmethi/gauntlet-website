# WEB-REPORT-004: Report Orchestration & Output

**Task ID**: WEB-REPORT-004  
**Category**: Reports  
**Priority**: 🟡 MEDIUM  
**Estimated Time**: ⏱️ 1 hour

---

## 📋 Overview

Create the orchestration layer that:

1. Coordinates data fetching, narrative generation, and auditing
2. Outputs final report data as JSON
3. Provides clear progress logging
4. Handles errors gracefully
5. Creates runnable script for weekly report generation

This ties together all previous report tasks into a cohesive automated system.

---

## 🎯 Objective

Build the final orchestration layer that:

1. Runs full report generation pipeline (fetch → generate → audit → output)
2. Logs progress clearly at each step
3. Fails fast if audit detects errors
4. Outputs complete report data as JSON
5. Provides CLI script for easy execution

**Success Criteria**:

- Complete pipeline runs successfully
- Audit failures prevent bad output
- Progress is logged clearly
- JSON output matches existing report structure
- Script can be run with: `npm run generate-report 5`

---

## 📂 Context Needed

### Prerequisites:

- **WEB-REPORT-001** complete (data fetching)
- **WEB-REPORT-002** complete (narrative generation)
- **WEB-REPORT-003** complete (auditing)

### Files to Create:

1. `apps/web/src/lib/reports/orchestrator.ts` - Orchestration logic
2. `apps/web/src/scripts/generate-report-automated.ts` - CLI script

### Files to Update:

1. `apps/web/package.json` - Add npm script

### Reference Files:

1. `apps/web/data/report-week5.json` - Expected output structure

---

## 🔨 Steps

### 1. Add Orchestrator Types (10 min)

Add to `apps/web/src/lib/reports/types.ts`:

```typescript
/**
 * Report Generation Types
 */

export interface GeneratedReport {
  week: number;
  season: string;
  generatedAt: string;
  data: WeeklyReportData;
  narratives: {
    afc: MatchupNarrative[];
    nfc: MatchupNarrative[];
  };
  audit: AuditSummary;
}

export interface ReportGenerationOptions {
  week: number;
  season?: string;
  outputPath?: string;
  failOnAuditErrors?: boolean;
}
```

### 2. Create Orchestrator (30 min)

Create `apps/web/src/lib/reports/orchestrator.ts`:

```typescript
/**
 * Report Orchestrator
 *
 * Coordinates the full report generation pipeline:
 * Data Fetching → Narrative Generation → Auditing → Output
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fetchWeeklyReportData } from './data-fetcher';
import { generateMatchupNarrative } from './narrative-writer';
import {
  auditAllMatchupNarratives,
  generateAuditSummary,
} from './narrative-auditor';
import type { GeneratedReport, ReportGenerationOptions } from './types';

/**
 * Generate a complete weekly report with full pipeline
 *
 * Steps:
 * 1. Fetch data from Sleeper API
 * 2. Generate narratives for all matchups
 * 3. Audit narratives for accuracy
 * 4. Output results
 *
 * @param options - Report generation options
 * @returns Complete generated report with audit
 * @throws Error if audit fails and failOnAuditErrors is true
 */
export const generateWeeklyReport = async (
  options: ReportGenerationOptions
): Promise<GeneratedReport> => {
  const { week, season = '2025', failOnAuditErrors = true } = options;

  console.log('\n🏈 ============================================');
  console.log(`📊 Generating Week ${week} Report (${season})`);
  console.log('============================================\n');

  // Step 1: Fetch data
  console.log('📥 Step 1: Fetching data from Sleeper API...');
  const data = await fetchWeeklyReportData(week, season);
  console.log(
    `✅ Fetched ${data.matchups.length} matchups, ` +
      `${data.powerRankings.length} rankings\n`
  );

  // Step 2: Generate narratives
  console.log('✍️  Step 2: Generating narratives...');
  const afcMatchups = data.matchups.filter(
    m => m.leagueId === '1263744209295245312' // AFC League ID
  );
  const nfcMatchups = data.matchups.filter(
    m => m.leagueId === '1263740549504962561' // NFC League ID
  );

  const afcNarratives = afcMatchups.map(generateMatchupNarrative);
  const nfcNarratives = nfcMatchups.map(generateMatchupNarrative);

  console.log(
    `✅ Generated ${afcNarratives.length} AFC + ` +
      `${nfcNarratives.length} NFC narratives\n`
  );

  // Step 3: Audit narratives
  console.log('🔍 Step 3: Auditing narratives for accuracy...');
  const narrativeMap = new Map();
  [...afcNarratives, ...nfcNarratives].forEach(n => {
    const key = `${n.leagueId}-matchup-${n.matchupId}`;
    narrativeMap.set(key, n);
  });

  const audit = auditAllMatchupNarratives(narrativeMap, data.matchups);
  console.log(generateAuditSummary(audit));

  if (failOnAuditErrors && audit.failed > 0) {
    throw new Error(
      `Audit failed with ${audit.totalErrors} errors. ` +
        `Fix narratives before publishing.`
    );
  }

  if (audit.failed === 0) {
    console.log('\n✅ All narratives passed audit!');
  }

  // Step 4: Build final report
  console.log('\n📝 Step 4: Building final report...');
  const report: GeneratedReport = {
    week,
    season,
    generatedAt: new Date().toISOString(),
    data,
    narratives: {
      afc: afcNarratives,
      nfc: nfcNarratives,
    },
    audit,
  };

  console.log('✅ Report generation complete!\n');
  console.log('============================================\n');

  return report;
};

/**
 * Generate and save report to file
 *
 * @param options - Report generation options
 * @returns Path to saved report
 */
export const generateAndSaveReport = async (
  options: ReportGenerationOptions
): Promise<string> => {
  const report = await generateWeeklyReport(options);

  // Determine output path
  const outputPath =
    options.outputPath ||
    resolve(
      process.cwd(),
      'apps/web/data',
      `report-week${options.week}-automated.json`
    );

  // Save report
  console.log(`💾 Saving report to: ${outputPath}`);
  writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log('✅ Report saved successfully!\n');

  return outputPath;
};
```

### 3. Create CLI Script (15 min)

Create `apps/web/src/scripts/generate-report-automated.ts`:

```typescript
/**
 * Automated Weekly Report Generation Script
 *
 * Usage: npm run generate-report <week>
 * Example: npm run generate-report 5
 */

import { generateAndSaveReport } from '@/lib/reports/orchestrator';

// Get week from command line args
const week = parseInt(process.argv[2]);

if (!week || isNaN(week) || week < 1 || week > 18) {
  console.error('❌ Error: Invalid week number');
  console.error('Usage: npm run generate-report <week>');
  console.error('Example: npm run generate-report 5');
  process.exit(1);
}

try {
  const outputPath = await generateAndSaveReport({
    week,
    failOnAuditErrors: true,
  });

  console.log('🎉 SUCCESS!');
  console.log(`   Report saved to: ${outputPath}`);
  console.log(`   Next steps:`);
  console.log(`   1. Review narratives in the JSON file`);
  console.log(`   2. Manually write Hall of Fame entries`);
  console.log(`   3. Create report page component`);
  console.log(`   4. Add navigation links\n`);
} catch (error) {
  console.error('\n❌ FAILED:', error instanceof Error ? error.message : error);
  process.exit(1);
}
```

### 4. Add npm Script (5 min)

Update `apps/web/package.json`:

```json
{
  "scripts": {
    "generate-report": "tsx src/scripts/generate-report-automated.ts"
  }
}
```

---

## ✅ Acceptance Criteria

### Must Have:

- [ ] `generateWeeklyReport()` runs complete pipeline
- [ ] Progress is logged clearly at each step
- [ ] Audit failures throw errors when enabled
- [ ] `generateAndSaveReport()` writes JSON file
- [ ] CLI script accepts week number argument
- [ ] npm script works: `npm run generate-report 5`
- [ ] Output JSON matches expected structure
- [ ] All functions use arrow function syntax
- [ ] Comprehensive JSDoc on all exported functions

### Quality Checks:

- [ ] TypeScript compilation passes with 0 errors
- [ ] ESLint passes with 0 errors
- [ ] Code follows CODING_CONVENTIONS.MD patterns

---

## 📊 Estimated Context Usage

- **Files to Read**: 3 (previous report tasks)
- **Lines to Process**: ~400 lines total
- **Files to Create**: 2 new files + 1 update
- **Complexity**: 🟢 Low (mostly coordination)

---

## 🔗 Related Tasks

### Blockers:

- **WEB-REPORT-001** (data fetching)
- **WEB-REPORT-002** (narrative generation)
- **WEB-REPORT-003** (auditing)

### Completes:

- Automated report generation system

### Follow-up (Manual Steps):

- Hall of Fame entry writing (still manual)
- Report page component creation
- Navigation link updates

---

## 🚀 Cursor Prompt

```
I'm working on WEB-REPORT-004. Please:

1. Read tasks/WEB-REPORT-004-report-orchestration.md
2. Add orchestrator types to apps/web/src/lib/reports/types.ts
3. Create apps/web/src/lib/reports/orchestrator.ts with:
   - generateWeeklyReport() (complete implementation)
   - generateAndSaveReport() (complete implementation)
4. Create apps/web/src/scripts/generate-report-automated.ts
5. Add npm script to apps/web/package.json

Follow the task steps exactly. Test by running the script.
```

---

## 🧪 Verification

### End-to-End Test:

```bash
# Generate Week 5 report
cd apps/web
npm run generate-report 5

# Expected output:
# 🏈 ============================================
# 📊 Generating Week 5 Report (2025)
# ============================================
#
# 📥 Step 1: Fetching data from Sleeper API...
# ✅ Fetched 12 matchups, 24 rankings
#
# ✍️  Step 2: Generating narratives...
# ✅ Generated 6 AFC + 6 NFC narratives
#
# 🔍 Step 3: Auditing narratives for accuracy...
# 📊 NARRATIVE AUDIT SUMMARY
# ==================================================
# Total Matchups: 12
# ✅ Passed: 12
# ❌ Failed: 0
# 🚨 Total Errors: 0
# ⚠️  Total Warnings: 0
#
# ✅ All narratives passed audit!
#
# 📝 Step 4: Building final report...
# ✅ Report generation complete!
#
# 💾 Saving report to: .../apps/web/data/report-week5-automated.json
# ✅ Report saved successfully!
#
# 🎉 SUCCESS!
#    Report saved to: .../report-week5-automated.json
#    Next steps:
#    1. Review narratives in the JSON file
#    2. Manually write Hall of Fame entries
#    3. Create report page component
#    4. Add navigation links
```

### Validate Output:

```bash
# Check file was created
ls -lh apps/web/data/report-week5-automated.json

# Preview structure
cat apps/web/data/report-week5-automated.json | jq '.narratives.afc[0]'
```

---

## 📝 Notes

### What's Automated:

✅ Data fetching from Sleeper API  
✅ Matchup narrative generation  
✅ Accuracy auditing  
✅ JSON output generation

### What's Still Manual:

❌ Hall of Fame entry writing (requires editorial judgment)  
❌ League overview narratives (requires strategic insight)  
❌ Power ranking commentary (requires context)  
❌ Report page component creation  
❌ Navigation link updates

### Why This Architecture:

- **Separation of concerns**: Each task handles one thing
- **Testability**: Can test each component independently
- **Debuggability**: Clear logging at each step
- **Safety**: Auditing prevents bad output
- **Flexibility**: Can run pipeline partially or modify steps

### Future Enhancements:

- Automated Hall of Fame detection (biggest blowout, closest game, etc.)
- League overview generation from matchup patterns
- Power ranking trend analysis
- Automated page component generation

---

**Ready to Start?** Complete WEB-REPORT-001, 002, and 003 first, then use the
Cursor prompt above! 🚀
