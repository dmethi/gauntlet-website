# WEB-REPORT-003: Narrative Auditing & Fact-Checking

**Task ID**: WEB-REPORT-003  
**Category**: Reports  
**Priority**: ⚠️ HIGH  
**Estimated Time**: ⏱️ 1 hour

---

## 📋 Overview

Build an auditing system that validates generated narratives against actual data
to prevent:

- Fabricated player performances
- Incorrect scores or margins
- Wrong winner/loser identification
- Hallucinated storylines

This is a **critical quality control** task that ensures report accuracy before
publication.

---

## 🎯 Objective

Create an automated auditing system that:

1. Compares narrative facts against actual matchup data
2. Detects mismatches in scores, players, and outcomes
3. Validates that mentioned players actually performed as described
4. Generates audit reports with error counts and warnings
5. Prevents publication of inaccurate narratives

**Success Criteria**:

- All narrative facts are validated against source data
- Mismatches are caught and reported clearly
- Audit passes for accurate narratives
- Audit fails for inaccurate narratives with specific errors
- Clear error messages for debugging

---

## 📂 Context Needed

### Prerequisites:

- **WEB-REPORT-001** complete (data structures)
- **WEB-REPORT-002** complete (narrative generation)

### Files to Create:

1. `apps/web/src/lib/reports/narrative-auditor.ts` - Auditing logic

### Reference Files:

1. `apps/web/src/lib/reports/types.ts` - Data structures
2. `apps/web/src/lib/reports/narrative-writer.ts` - What we're auditing

---

## 🔨 Steps

### 1. Add Audit Types (10 min)

Add to `apps/web/src/lib/reports/types.ts`:

```typescript
/**
 * Audit Results
 */

export interface AuditResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  matchupId: number;
  leagueId: string;
}

export interface AuditSummary {
  totalMatchups: number;
  passed: number;
  failed: number;
  totalErrors: number;
  totalWarnings: number;
  results: Record<string, AuditResult>;
}
```

### 2. Create Narrative Auditor (50 min)

Create `apps/web/src/lib/reports/narrative-auditor.ts`:

```typescript
/**
 * Narrative Auditor
 *
 * Validates generated narratives against actual data
 * to prevent hallucinations and ensure accuracy
 */

import type {
  MatchupData,
  MatchupNarrative,
  AuditResult,
  AuditSummary,
} from './types';

/**
 * Audit a single matchup narrative against its source data
 *
 * Checks:
 * - Winner/loser are correct
 * - Scores match actual data
 * - Margin is accurate
 * - Mentioned players exist in the matchup
 * - Player performances are accurate (within tolerance)
 *
 * @param narrative - Generated narrative with facts
 * @param data - Actual matchup data from API
 * @returns Audit result with errors and warnings
 */
export const auditMatchupNarrative = (
  narrative: MatchupNarrative,
  data: MatchupData
): AuditResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Determine actual winner/loser
  const actualWinner =
    data.teamA.points > data.teamB.points ? data.teamA : data.teamB;
  const actualLoser =
    data.teamA.points > data.teamB.points ? data.teamB : data.teamA;

  // Check winner/loser
  if (narrative.facts.winner !== actualWinner.ownerName) {
    errors.push(
      `Winner mismatch: narrative says ${narrative.facts.winner}, ` +
        `data says ${actualWinner.ownerName}`
    );
  }

  if (narrative.facts.loser !== actualLoser.ownerName) {
    errors.push(
      `Loser mismatch: narrative says ${narrative.facts.loser}, ` +
        `data says ${actualLoser.ownerName}`
    );
  }

  // Check scores (allow 0.1 tolerance for rounding)
  const scoreTolerance = 0.1;
  if (
    Math.abs(narrative.facts.winnerScore - actualWinner.points) > scoreTolerance
  ) {
    errors.push(
      `Winner score mismatch: narrative says ${narrative.facts.winnerScore}, ` +
        `data says ${actualWinner.points}`
    );
  }

  if (
    Math.abs(narrative.facts.loserScore - actualLoser.points) > scoreTolerance
  ) {
    errors.push(
      `Loser score mismatch: narrative says ${narrative.facts.loserScore}, ` +
        `data says ${actualLoser.points}`
    );
  }

  // Check margin
  const actualMargin = Math.abs(data.teamA.points - data.teamB.points);
  if (Math.abs(narrative.facts.margin - actualMargin) > scoreTolerance) {
    errors.push(
      `Margin mismatch: narrative says ${narrative.facts.margin}, ` +
        `data says ${actualMargin}`
    );
  }

  // Check mentioned players exist and performance is accurate
  const allPlayers = [...data.teamA.starters, ...data.teamB.starters];
  const playerMap = new Map(allPlayers.map(p => [p.name, p]));

  // Audit top performers
  for (const playerName of narrative.facts.topPerformers) {
    const player = playerMap.get(playerName);
    if (!player) {
      warnings.push(
        `Top performer ${playerName} not found in matchup starters`
      );
    } else if (player.points < 20) {
      warnings.push(
        `Top performer ${playerName} only scored ${player.points} ` +
          `(typically need 20+)`
      );
    }
  }

  // Audit disappointments
  for (const playerName of narrative.facts.disappointments) {
    const player = playerMap.get(playerName);
    if (!player) {
      warnings.push(
        `Disappointment ${playerName} not found in matchup starters`
      );
    } else if (player.points > 10) {
      warnings.push(
        `Disappointment ${playerName} scored ${player.points} ` +
          `(not really a disappointment)`
      );
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    matchupId: data.matchupId,
    leagueId: data.leagueId,
  };
};

/**
 * Audit all matchup narratives in a report
 *
 * @param narratives - Map of matchup ID to narrative
 * @param matchups - Actual matchup data
 * @returns Complete audit summary
 */
export const auditAllMatchupNarratives = (
  narratives: Map<string, MatchupNarrative>,
  matchups: MatchupData[]
): AuditSummary => {
  const results: Record<string, AuditResult> = {};
  let passed = 0;
  let failed = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const matchup of matchups) {
    const key = `${matchup.leagueId}-matchup-${matchup.matchupId}`;
    const narrative = narratives.get(key);

    if (!narrative) {
      results[key] = {
        passed: false,
        errors: ['Narrative not found for matchup'],
        warnings: [],
        matchupId: matchup.matchupId,
        leagueId: matchup.leagueId,
      };
      failed++;
      totalErrors++;
      continue;
    }

    const result = auditMatchupNarrative(narrative, matchup);
    results[key] = result;

    if (result.passed) {
      passed++;
    } else {
      failed++;
    }

    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
  }

  return {
    totalMatchups: matchups.length,
    passed,
    failed,
    totalErrors,
    totalWarnings,
    results,
  };
};

/**
 * Generate human-readable audit summary
 *
 * @param audit - Audit results
 * @returns Formatted summary string
 */
export const generateAuditSummary = (audit: AuditSummary): string => {
  const lines: string[] = [];

  lines.push('📊 NARRATIVE AUDIT SUMMARY');
  lines.push('='.repeat(50));
  lines.push(`Total Matchups: ${audit.totalMatchups}`);
  lines.push(`✅ Passed: ${audit.passed}`);
  lines.push(`❌ Failed: ${audit.failed}`);
  lines.push(`🚨 Total Errors: ${audit.totalErrors}`);
  lines.push(`⚠️  Total Warnings: ${audit.totalWarnings}`);
  lines.push('');

  if (audit.failed > 0) {
    lines.push('FAILED AUDITS:');
    lines.push('-'.repeat(50));

    for (const [key, result] of Object.entries(audit.results)) {
      if (!result.passed) {
        lines.push(`\n${key}:`);
        result.errors.forEach(err => lines.push(`  ❌ ${err}`));
      }
    }
  }

  if (audit.totalWarnings > 0) {
    lines.push('\nWARNINGS:');
    lines.push('-'.repeat(50));

    for (const [key, result] of Object.entries(audit.results)) {
      if (result.warnings.length > 0) {
        lines.push(`\n${key}:`);
        result.warnings.forEach(warn => lines.push(`  ⚠️  ${warn}`));
      }
    }
  }

  return lines.join('\n');
};
```

---

## ✅ Acceptance Criteria

### Must Have:

- [ ] `auditMatchupNarrative()` catches all error types
- [ ] Winner/loser mismatches are detected
- [ ] Score/margin mismatches are detected (with tolerance)
- [ ] Player validation catches non-existent players
- [ ] Warnings for questionable but not wrong data
- [ ] `auditAllMatchupNarratives()` processes all matchups
- [ ] `generateAuditSummary()` produces clear reports
- [ ] All functions use arrow function syntax
- [ ] Comprehensive JSDoc on all exported functions

### Quality Checks:

- [ ] TypeScript compilation passes with 0 errors
- [ ] ESLint passes with 0 errors
- [ ] Code follows CODING_CONVENTIONS.MD patterns

---

## 📊 Estimated Context Usage

- **Files to Read**: 2 (types.ts, narrative-writer.ts)
- **Lines to Process**: ~300 lines total
- **Files to Create**: 1 new file
- **Complexity**: 🟡 Medium (validation logic)

---

## 🔗 Related Tasks

### Blockers:

- **WEB-REPORT-001** (needs data structures)
- **WEB-REPORT-002** (needs narratives to audit)

### Enables:

- **WEB-REPORT-004**: Report Orchestration (can safely generate reports)

---

## 🚀 Cursor Prompt

```
I'm working on WEB-REPORT-003. Please:

1. Read tasks/WEB-REPORT-003-narrative-auditing.md
2. Add audit types to apps/web/src/lib/reports/types.ts
3. Create apps/web/src/lib/reports/narrative-auditor.ts with:
   - auditMatchupNarrative() (complete implementation)
   - auditAllMatchupNarratives() (complete implementation)
   - generateAuditSummary() (complete implementation)

Follow the task steps exactly. Ensure all validation logic is thorough.
```

---

## 🧪 Verification

### Manual Test:

```bash
# Create test script
cat > apps/web/src/scripts/test-audit.ts << 'EOF'
import { fetchWeeklyReportData } from '@/lib/reports/data-fetcher';
import { generateMatchupNarrative } from '@/lib/reports/narrative-writer';
import {
  auditAllMatchupNarratives,
  generateAuditSummary
} from '@/lib/reports/narrative-auditor';

const data = await fetchWeeklyReportData(5);

// Generate narratives
const narratives = new Map();
for (const matchup of data.matchups) {
  const narrative = generateMatchupNarrative(matchup);
  const key = `${matchup.leagueId}-matchup-${matchup.matchupId}`;
  narratives.set(key, narrative);
}

// Audit narratives
const audit = auditAllMatchupNarratives(narratives, data.matchups);

// Print summary
console.log(generateAuditSummary(audit));

// Exit with error code if failed
if (audit.failed > 0) {
  console.error('\n❌ Audit failed! Fix errors before publishing.');
  process.exit(1);
} else {
  console.log('\n✅ All narratives passed audit!');
}
EOF

# Run test
npx tsx apps/web/src/scripts/test-audit.ts

# Clean up
rm apps/web/src/scripts/test-audit.ts
```

### Expected Output (if narratives are accurate):

```
📊 NARRATIVE AUDIT SUMMARY
==================================================
Total Matchups: 12
✅ Passed: 12
❌ Failed: 0
🚨 Total Errors: 0
⚠️  Total Warnings: 0

✅ All narratives passed audit!
```

### Expected Output (if there are errors):

```
📊 NARRATIVE AUDIT SUMMARY
==================================================
Total Matchups: 12
✅ Passed: 10
❌ Failed: 2
🚨 Total Errors: 3
⚠️  Total Warnings: 1

FAILED AUDITS:
--------------------------------------------------

1263744209295245312-matchup-1:
  ❌ Winner mismatch: narrative says John, data says Jane
  ❌ Margin mismatch: narrative says 15, data says 12.5

❌ Audit failed! Fix errors before publishing.
```

---

## 📝 Notes

### Why This Is Critical:

Automated narrative generation can produce hallucinations or errors. This
auditing system:

- Catches errors before publication
- Ensures trust in automated reports
- Makes debugging easier (specific error messages)
- Enables safe iteration on narrative generation

### Tolerance Levels:

- **Scores**: 0.1 point tolerance (rounding differences)
- **Top performers**: 20+ points threshold (warning if less)
- **Disappointments**: <10 points threshold (warning if more)

### Audit Philosophy:

- **Errors**: Must fix (wrong winner, wrong score)
- **Warnings**: Should review (questionable but not necessarily wrong)

---

**Ready to Start?** Complete WEB-REPORT-001 and WEB-REPORT-002 first, then use
the Cursor prompt above! 🚀
