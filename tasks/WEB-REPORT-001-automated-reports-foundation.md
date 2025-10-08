# WEB-REPORT-001: Automated Reports Foundation

**Task ID**: WEB-REPORT-001  
**Category**: Reports  
**Priority**: 🟡 MEDIUM  
**Estimated Time**: ⏱️ 1.5 hours

---

## 📋 Overview

Create the foundational infrastructure for automated weekly report generation,
including:

- Data fetching utilities from Sleeper API
- Team/owner name resolution system
- Data validation and accuracy checks
- Type definitions for report data structures

This task focuses ONLY on data fetching and validation, not narrative
generation.

---

## 🎯 Objective

Build a robust data fetching system that:

1. Fetches all necessary data from Sleeper API (matchups, rosters, users,
   players)
2. Correctly resolves team/owner names from multiple sources (metadata, display
   names, team-owners.json)
3. Validates data accuracy with clear error reporting
4. Provides type-safe interfaces for report data

**Success Criteria**:

- All data fetching works with proper error handling
- Team names resolve correctly from all sources
- Data validation catches common errors (wrong week, missing data, etc.)
- 100% TypeScript compilation with no errors
- Comprehensive types for all report data structures

---

## 📂 Context Needed

### Files to Create:

1. `apps/web/src/lib/reports/types.ts` - Type definitions
2. `apps/web/src/lib/reports/data-fetcher.ts` - Data fetching logic
3. `apps/web/data/team-owners.json` - Manual team name overrides

### Reference Files (for understanding existing patterns):

1. `apps/web/src/scripts/generate-week4-report.ts` (lines 1-200) - Current
   manual approach
2. `apps/web/src/lib/sleeper/unified-client.ts` - API client patterns
3. `@gauntlet/types` - Central type definitions

---

## 🔨 Steps

### 1. Create Type Definitions (30 min)

Create `apps/web/src/lib/reports/types.ts`:

```typescript
/**
 * Report Data Types
 *
 * Type definitions for automated weekly report generation
 */

// Core matchup data
export interface MatchupData {
  matchupId: number;
  leagueId: string;
  leagueName: 'AFC' | 'NFC';
  teamA: TeamMatchupData;
  teamB: TeamMatchupData;
  margin: number;
  isBlowout: boolean; // margin > 30
}

export interface TeamMatchupData {
  rosterId: number;
  ownerName: string; // Display name from user
  teamName: string; // Team name from metadata or team-owners.json
  points: number;
  starters: PlayerPerformance[];
  projectedPoints: number;
}

export interface PlayerPerformance {
  playerId: string;
  name: string;
  position: string | null;
  points: number;
}

// Power rankings
export interface PowerRanking {
  rank: number;
  rosterId: number;
  teamName: string;
  ownerName: string;
  leagueId: string;
  leagueName: 'AFC' | 'NFC';
  avgPoints: number;
  record: string; // e.g. "3-1"
  expectedWins: number;
  score: number; // Composite score
}

// Full report data
export interface WeeklyReportData {
  week: number;
  season: string;
  matchups: MatchupData[];
  powerRankings: PowerRanking[];
  standings: StandingsData[];
  generatedAt: string;
}

export interface StandingsData {
  rank: number;
  rosterId: number;
  teamName: string;
  ownerName: string;
  leagueId: string;
  leagueName: 'AFC' | 'NFC';
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
}

// Team name resolution
export interface TeamOwnerOverride {
  leagueId: string;
  rosterId: number;
  teamName: string;
  ownerName: string;
  notes?: string;
}
```

### 2. Create Team Owners Config (15 min)

Create `apps/web/data/team-owners.json`:

```json
{
  "overrides": [
    {
      "leagueId": "1263744209295245312",
      "rosterId": 1,
      "teamName": "Team Name Here",
      "ownerName": "Owner Display Name",
      "notes": "Use this to override incorrect names"
    }
  ],
  "instructions": "Add entries here to manually override team/owner names when Sleeper metadata is incorrect or missing"
}
```

**Action**: Leave the overrides array mostly empty for now - we'll populate it
as we discover issues.

### 3. Create Data Fetcher (45 min)

Create `apps/web/src/lib/reports/data-fetcher.ts`:

**Requirements**:

- Use `sleeperClient` from `@/lib/sleeper/unified-client`
- Fetch player names ONCE and cache in a Map
- Resolve team names with priority: team-owners.json > metadata.team_name >
  display_name > username > fallback
- Validate all data before returning (check for null/undefined, verify counts)
- Log clear error messages for debugging
- Use arrow functions and explicit return types

**Core Functions**:

```typescript
// Fetch all player names (cache for session)
export const fetchPlayerNames = async (): Promise<Map<string, { name: string; position: string }>>

// Resolve team name with fallback chain
export const resolveTeamName = (
  rosterId: number,
  leagueId: string,
  user: SleeperUser | undefined,
  overrides: TeamOwnerOverride[]
): { teamName: string; ownerName: string }

// Fetch complete week data
export const fetchWeeklyReportData = async (
  week: number,
  season: string = '2025'
): Promise<WeeklyReportData>
```

**Data Validation**:

- Check for exactly 12 matchups per league (6 matchups × 2 teams)
- Verify all rosters have owners
- Ensure player data is complete
- Log warnings for missing/incorrect data

---

## ✅ Acceptance Criteria

### Must Have:

- [ ] All type definitions in `types.ts` compile with no errors
- [ ] `data-fetcher.ts` successfully fetches Week 5 data
- [ ] Team name resolution works correctly with priority chain
- [ ] Player names resolve correctly (no "Unknown Player" unless truly unknown)
- [ ] Data validation catches and reports errors clearly
- [ ] All functions use arrow function syntax
- [ ] Comprehensive JSDoc on all exported functions
- [ ] Console logs show clear progress and any warnings

### Quality Checks:

- [ ] TypeScript compilation passes with 0 errors
- [ ] No `any` types (use proper Sleeper types from `@gauntlet/types`)
- [ ] ESLint passes with 0 errors
- [ ] Code follows CODING_CONVENTIONS.MD patterns

---

## 📊 Estimated Context Usage

- **Files to Read**: 3 (generate-week4-report.ts, unified-client.ts, types from
  @gauntlet/types)
- **Lines to Process**: ~600 lines total
- **Files to Create**: 3 new files
- **Complexity**: 🟡 Medium (API integration, name resolution logic)

---

## 🔗 Related Tasks

### Blockers:

- None (can start immediately)

### Enables:

- **WEB-REPORT-002**: Narrative Generation System
- **WEB-REPORT-003**: Narrative Auditing & Fact-Checking

### Related:

- **WEB-REPORT-004**: Report Orchestration & Output

---

## 🚀 Cursor Prompt

```
I'm working on WEB-REPORT-001. Please:

1. Read tasks/WEB-REPORT-001-automated-reports-foundation.md
2. Create apps/web/src/lib/reports/types.ts with all type definitions
3. Create apps/web/data/team-owners.json with the template structure
4. Create apps/web/src/lib/reports/data-fetcher.ts with:
   - fetchPlayerNames() function with caching
   - resolveTeamName() function with priority chain
   - fetchWeeklyReportData() function with full validation

Follow the task steps exactly. Use sleeperClient from unified-client.ts.
Test by running: tsx apps/web/src/scripts/test-data-fetch.ts 5
```

---

## 🧪 Verification

### Manual Test:

```bash
# Create a test script
cat > apps/web/src/scripts/test-data-fetch.ts << 'EOF'
import { fetchWeeklyReportData } from '@/lib/reports/data-fetcher';

const week = parseInt(process.argv[2] || '5');
const data = await fetchWeeklyReportData(week);

console.log(`✅ Week ${week} Data Fetched:`);
console.log(`   ${data.matchups.length} matchups`);
console.log(`   ${data.powerRankings.length} rankings`);
console.log(`   ${data.standings.length} standings`);
EOF

# Run test
npx tsx apps/web/src/scripts/test-data-fetch.ts 5

# Clean up
rm apps/web/src/scripts/test-data-fetch.ts
```

### Expected Output:

```
📊 Fetching Week 5 report data...
✅ Fetched 12 matchups
✅ Fetched 24 power rankings
✅ Week 5 Data Fetched:
   12 matchups
   24 rankings
   24 standings
```

---

## 📝 Notes

### Name Resolution Priority:

1. **team-owners.json override** (manual corrections)
2. **metadata.team_name** (user-set team name)
3. **display_name** (user profile name)
4. **username** (Sleeper username)
5. **Fallback**: "Team {roster_id}"

### Common Issues to Watch:

- Some users don't set team names (metadata.team_name is null)
- Some users have display_name but no username
- Player IDs from Sleeper may not all be in players endpoint (handle gracefully)
- Week data may not be final (in-progress games show partial scores)

### Why This Approach:

- Separates data fetching from narrative generation (single responsibility)
- Makes debugging easier (can inspect raw data before narratives)
- Allows for data validation before expensive narrative generation
- Enables testing data fetching independently

---

**Ready to Start?** Read this task completely, then use the Cursor prompt above!
🚀
