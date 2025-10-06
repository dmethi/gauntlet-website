# Task: CLEAN-606-add-jsdoc

## Overview
Add JSDoc comments to all exported functions in `apps/server` for better documentation and IDE support.

## Context Needed
- File: `apps/server/src/lib/historical-data.ts` - Database functions
- File: `apps/server/src/lib/gauntlet-api-client.ts` - API client (from EXTRACT-601)
- File: `apps/server/src/lib/snapshot-validator.ts` - Validator (from EXTRACT-602)

## Objective
Add comprehensive JSDoc comments to all public exports with usage examples.

**Files to Document**:
1. `historical-data.ts` - 10+ exported functions
2. `gauntlet-api-client.ts` - 4 exported members
3. `snapshot-validator.ts` - 2 exported functions

## Steps

### 1. Document `historical-data.ts`
For each exported function, add JSDoc following this pattern:
```typescript
/**
 * Save a live win probability sample to the database
 * 
 * Used by: comprehensive-live-snapshot.ts (every 10 min during games)
 * 
 * @param data - Snapshot data including scores, projections, and win probabilities
 * @returns Promise resolving to created LiveWinProbSample record
 * 
 * @example
 * ```typescript
 * await saveLiveWinProbSample({
 *   leagueId: '1263744209295245312',
 *   week: 4,
 *   matchupId: 1,
 *   rosterAId: 1,
 *   rosterBId: 2,
 *   gameProgress: 0.5,
 *   winProbA: 0.65,
 *   winProbB: 0.35,
 *   projectedFinalA: 125.5,
 *   projectedFinalB: 108.2,
 *   currentScoreA: 85.0,
 *   currentScoreB: 72.5,
 *   spread: -3.5,
 *   total: 233.7,
 * });
 * ```
 */
export async function saveLiveWinProbSample(data: { ... }) {
  // existing implementation
}
```

Functions to document:
- `saveLiveWinProbSample()`
- `saveMatchupOddsHistory()`
- `saveLeagueOddsHistory()`
- `getLastWinProbSample()`
- `getMatchupWinProbTimeSeries()`
- `getWeekWinProbSamples()`
- `getMatchupExcitementMetrics()`
- `getMatchupOddsHistory()`
- `getLeagueOddsHistory()`
- `getLatestLeagueOdds()`
- `disconnect()`

### 2. Document `gauntlet-api-client.ts`
Add JSDoc to:
- Class `GauntletAPIClient`
- Method `getCurrentWeek()`
- Method `fetchLeagueOdds()`
- Method `fetchMatchupSimulation()`
- Exported instance `gauntletAPI`

Example:
```typescript
/**
 * Client for fetching data from Gauntlet web app API endpoints
 * 
 * Used by background jobs to get simulation results and odds.
 * 
 * @example
 * ```typescript
 * import { gauntletAPI } from './gauntlet-api-client';
 * 
 * const week = await gauntletAPI.getCurrentWeek();
 * const odds = await gauntletAPI.fetchLeagueOdds(week);
 * ```
 */
export class GauntletAPIClient {
  // ...
}
```

### 3. Document `snapshot-validator.ts`
Add JSDoc to:
- `saveSnapshotIfChanged()`
- `hasSignificantChange()` (if exported)
- Interface `SnapshotData`
- Interface `ValidationResult`

Example:
```typescript
/**
 * Save snapshot to database only if data has changed significantly
 * 
 * Implements deduplication logic to avoid storing identical snapshots.
 * A snapshot is considered "changed" if:
 * - Scores differ by >0.01 points
 * - Win probability differs by >1%
 * - Projections differ by >0.1 points
 * 
 * @param snapshot - Complete snapshot data from simulation
 * @returns Result indicating if snapshot was saved and why
 * 
 * @example
 * ```typescript
 * const result = await saveSnapshotIfChanged(snapshotData);
 * if (result.saved) {
 *   console.log('Snapshot saved!');
 * } else {
 *   console.log('Skipped:', result.reason);
 * }
 * ```
 */
export async function saveSnapshotIfChanged(
  snapshot: SnapshotData
): Promise<ValidationResult> {
  // ...
}
```

### 4. Verify Documentation
- Run `pnpm build` to ensure no syntax errors
- Check IDE hover tooltips show JSDoc
- Verify examples are syntactically correct

## Acceptance Criteria
- [ ] All exported functions have JSDoc comments
- [ ] Each JSDoc includes description
- [ ] Each JSDoc includes `@param` for parameters
- [ ] Each JSDoc includes `@returns` for return value
- [ ] Each JSDoc includes `@example` with usage
- [ ] All examples are syntactically correct
- [ ] `pnpm build` passes
- [ ] No TypeScript errors
- [ ] IDE tooltips show documentation

## Estimated Context Usage
- Files to read: 3 (the utilities)
- Lines to process: ~300
- New files: 0 (modify existing)
- Risk: **Low** (comments only)

## Related Tasks
- **Depends on**: EXTRACT-601, EXTRACT-602 (functions must exist)
- **Related**: CLEAN-605 (README should reference these)

## Cursor Prompt
```
I'm working on CLEAN-606. Please:
1. Read tasks/CLEAN-606-add-jsdoc.md
2. Read apps/server/src/lib/historical-data.ts
3. Add JSDoc comments to all exported functions
4. Include description, @param, @returns, @example
5. Repeat for gauntlet-api-client.ts and snapshot-validator.ts
6. Verify build passes
```

## Commit Message
```
docs(CLEAN-606): add JSDoc to all exported functions

- Add comprehensive JSDoc to historical-data.ts (11 functions)
- Add JSDoc to gauntlet-api-client.ts (4 members)
- Add JSDoc to snapshot-validator.ts (2 functions)
- Include usage examples for all functions
- Document parameters and return types
- Improve IDE autocomplete and hover tooltips
```

## Estimated Time
⏱️ **30 minutes**

## Verification
- Hover over function in IDE → Should show JSDoc
- `pnpm build` → Should pass
- Check generated `.d.ts` files include comments

## Notes
- Good documentation makes code self-explanatory
- Examples are especially valuable for future maintenance
- JSDoc appears in IDE tooltips and generated type definitions
- This is final polish before declaring package "enterprise-ready"

