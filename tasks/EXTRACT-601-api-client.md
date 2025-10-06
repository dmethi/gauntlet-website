# Task: EXTRACT-601-api-client

## Overview

Extract API fetching logic from `comprehensive-live-snapshot.ts` to a dedicated
Gauntlet API client.

## Context Needed

- File: `apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts` (lines
  74-239) - API functions
- Reference: `apps/web/src/lib/sleeper/unified-client.ts` - Client pattern

## Objective

Create reusable API client in `apps/server/src/lib/gauntlet-api-client.ts` for
fetching from Gauntlet web app endpoints.

**Functions to Extract** (lines 74-239):

- `getCurrentWeek()` - Fetches current NFL week
- `captureLeagueOdds()` - Fetches league-wide odds
- `captureIndividualMatchup()` - Fetches single matchup simulation

## Steps

1. Create `apps/server/src/lib/gauntlet-api-client.ts`
2. Define types at top:

   ```typescript
   interface GauntletAPIOptions {
     baseUrl?: string;
     timeout?: number;
   }

   interface LeagueOddsResponse {
     // From actual API response
   }

   interface MatchupSimulationResponse {
     // From actual API response
   }
   ```

3. Create client class:
   ```typescript
   export class GauntletAPIClient {
     private baseUrl: string;

     constructor(options: GauntletAPIOptions = {}) {
       this.baseUrl = options.baseUrl || 'https://gauntlet-website.vercel.app';
     }

     async getCurrentWeek(): Promise<number> { ... }
     async fetchLeagueOdds(week: number): Promise<LeagueOddsResponse> { ... }
     async fetchMatchupSimulation(leagueId: string, week: number, matchupId: number): Promise<MatchupSimulationResponse> { ... }
   }
   ```
4. Add error handling for each method
5. Add cache-busting query params where needed
6. Export convenience function:
   ```typescript
   export const gauntletAPI = new GauntletAPIClient();
   ```
7. Update `comprehensive-live-snapshot.ts`:
   - Import `gauntletAPI`
   - Replace inline functions with client calls
   - Remove old function definitions (lines 74-239)
8. Run `pnpm build` to verify
9. Test with `pnpm live-snapshot` (if DATABASE_URL available)

## Acceptance Criteria

- [ ] New file `src/lib/gauntlet-api-client.ts` created
- [ ] All 3 API functions extracted to client
- [ ] Types defined for API responses
- [ ] Error handling included
- [ ] Cache-busting preserved
- [ ] `comprehensive-live-snapshot.ts` updated to use client
- [ ] File reduced by ~165 lines
- [ ] `pnpm build` passes
- [ ] No TypeScript errors

## Estimated Context Usage

- Files to read: 1 (just lines 74-239 of comprehensive-live-snapshot.ts)
- Lines to process: ~165
- New files: 1
- Risk: **Low** (pure extraction, no logic changes)

## Related Tasks

- **Depends on**: CLEAN-602 (working TypeScript config)
- **Related**: EXTRACT-602 (validation logic)

## Cursor Prompt

```
I'm working on EXTRACT-601. Please:
1. Read tasks/EXTRACT-601-api-client.md
2. Read apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts lines 74-239
3. Create src/lib/gauntlet-api-client.ts following the structure
4. Extract the 3 API functions to the new client
5. Update comprehensive-live-snapshot.ts to use the client
6. Verify build passes
```

## Commit Message

```
feat(EXTRACT-601): extract Gauntlet API client

- Create src/lib/gauntlet-api-client.ts
- Extract getCurrentWeek, fetchLeagueOdds, fetchMatchupSimulation
- Add proper types for API responses
- Add error handling and cache-busting
- Update comprehensive-live-snapshot.ts to use client
- Reduce main file by ~165 lines
```

## Estimated Time

⏱️ **60 minutes**

## Verification

```bash
cd apps/server
pnpm build                    # Should compile
pnpm tsc --noEmit            # Should have no errors
# Optional: pnpm live-snapshot  # Should work (needs DATABASE_URL)
```

## Notes

- This extraction makes the API logic reusable
- Follows same pattern as apps/web unified-client
- No behavior changes - pure refactor
- Main script will go from 435 → ~270 lines
