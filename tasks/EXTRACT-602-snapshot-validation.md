# Task: EXTRACT-602-snapshot-validation

## Overview
Extract snapshot validation and deduplication logic from `comprehensive-live-snapshot.ts` to dedicated utility.

## Context Needed
- File: `apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts` (lines 241-358) - Validation function
- File: `apps/server/src/lib/historical-data.ts` - Database functions used

## Objective
Create reusable validation utility in `apps/server/src/lib/snapshot-validator.ts` to handle snapshot deduplication and saving logic.

**Function to Extract** (lines 241-358):
- `saveCompleteSnapshot()` - Validates, deduplicates, and saves snapshots

## Steps
1. Create `apps/server/src/lib/snapshot-validator.ts`
2. Define types for snapshot data:
   ```typescript
   interface SnapshotData {
     week: number;
     leagueId: string;
     matchupId: number;
     team1: {
       rosterId: number;
       currentScore: number;
       simulatedMean: number;
       winProbability: number;
     };
     team2: {
       rosterId: number;
       currentScore: number;
       simulatedMean: number;
       winProbability: number;
     };
     spread: number;
     total: number;
     moneyLineA: number;
     moneyLineB: number;
     capturedAt: string;
   }
   
   interface ValidationResult {
     saved: boolean;
     reason?: string;
   }
   ```
3. Extract validation logic:
   ```typescript
   export async function saveSnapshotIfChanged(
     snapshot: SnapshotData
   ): Promise<ValidationResult> {
     // 1. Get last snapshot from DB
     // 2. Compare values (scores, projections, win prob)
     // 3. Skip if identical (return {saved: false, reason: 'unchanged'})
     // 4. Calculate game progress
     // 5. Save to DB via historical-data.ts
     // 6. Return {saved: true}
   }
   ```
4. Add helper function for comparison:
   ```typescript
   function hasSignificantChange(
     last: any,
     current: SnapshotData,
     threshold = 0.01
   ): boolean {
     // Compare scores, projections, win prob
     // Return true if any differ by > threshold
   }
   ```
5. Import and use in `comprehensive-live-snapshot.ts`:
   ```typescript
   import { saveSnapshotIfChanged } from '../../lib/snapshot-validator.js';
   ```
6. Replace `saveCompleteSnapshot()` calls with new function
7. Remove old function definition (lines 241-358)
8. Run `pnpm build` to verify
9. Test with `pnpm live-snapshot` (if DATABASE_URL available)

## Acceptance Criteria
- [ ] New file `src/lib/snapshot-validator.ts` created
- [ ] Types defined for snapshot data
- [ ] Validation logic extracted with tests
- [ ] Deduplication logic preserved
- [ ] Helper function for change detection
- [ ] `comprehensive-live-snapshot.ts` updated
- [ ] File reduced by ~118 lines
- [ ] `pnpm build` passes
- [ ] No TypeScript errors

## Estimated Context Usage
- Files to read: 2 (lines 241-358 of main script + historical-data.ts)
- Lines to process: ~180
- New files: 1
- Risk: **Low** (pure extraction)

## Related Tasks
- **Depends on**: EXTRACT-601 (API client first)
- **Blocks**: TEST-601 (will test validation logic)

## Cursor Prompt
```
I'm working on EXTRACT-602. Please:
1. Read tasks/EXTRACT-602-snapshot-validation.md
2. Read apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts lines 241-358
3. Read apps/server/src/lib/historical-data.ts (understand DB functions)
4. Create src/lib/snapshot-validator.ts
5. Extract saveCompleteSnapshot logic to new utility
6. Update main script to use new validator
7. Verify build passes
```

## Commit Message
```
feat(EXTRACT-602): extract snapshot validation logic

- Create src/lib/snapshot-validator.ts
- Extract saveSnapshotIfChanged function
- Add hasSignificantChange helper
- Define proper types for snapshot data
- Update comprehensive-live-snapshot.ts to use validator
- Reduce main file by ~118 lines
```

## Estimated Time
⏱️ **45 minutes**

## Verification
```bash
cd apps/server
pnpm build                    # Should compile
pnpm tsc --noEmit            # Should have no errors
# Optional: pnpm live-snapshot  # Should work (needs DATABASE_URL)
```

## Notes
- After both EXTRACT-601 and EXTRACT-602:
  - Main script: 435 → ~152 lines (65% reduction!)
- Makes validation logic testable
- Preserves deduplication behavior
- No functional changes

