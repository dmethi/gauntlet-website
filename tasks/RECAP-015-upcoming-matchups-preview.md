# RECAP-015: Upcoming Matchups Preview

**Project**: Weekly Recap Reports  
**Phase**: 2 - Section Implementation  
**Estimated Time**: 30 minutes  
**Dependencies**: RECAP-014  
**Status**: ✅ Complete

---

## 🎯 Objective

Implement the Upcoming Matchups section that provides a brief preview of next
week's games, highlighting key matchups and storylines to watch.

---

## 📋 What to Build

### The Upcoming Matchups Tool

**`fetch_next_week_matchups`** - Fetches next week's matchups with team records
and brief context

---

## 📁 Files to Create/Modify

### New Files

```
apps/web/src/lib/reports/recap/tools/
└── upcoming.ts                         # Upcoming matchups tool

apps/web/src/lib/reports/recap/prompts/sections/
└── upcoming.ts                         # Section prompt

apps/web/scripts/
└── test-upcoming.ts                    # Validation script
```

### Modified Files

```
apps/web/src/lib/reports/recap/types.ts
  - Add UpcomingMatchup type

apps/web/src/lib/reports/recap/tools/registry.ts
  - Register upcoming matchups tool
```

---

## 🛠️ Implementation Steps

### Step 1: Define Types (5 min)

```typescript
// apps/web/src/lib/reports/recap/types.ts (additions)

export interface UpcomingMatchup {
  matchupId: number;
  leagueId: string;
  league: 'AFC' | 'NFC';
  team1: {
    rosterId: number;
    teamName: string;
    record: string;
    pointsFor: number;
  };
  team2: {
    rosterId: number;
    teamName: string;
    record: string;
    pointsFor: number;
  };
  storyline?: string; // e.g., "Battle of division leaders", "Playoff elimination game"
}
```

### Step 2: Implement Upcoming Tool (20 min)

```typescript
// apps/web/src/lib/reports/recap/tools/upcoming.ts

import { sleeperClient } from '@/lib/sleeper/unified-client';
import { LEAGUE_IDS } from '@/lib/constants';
import type { Tool } from './base';
import type { UpcomingMatchup } from '../types';

export const fetchNextWeekMatchupsTool: Tool = {
  name: 'fetch_next_week_matchups',
  description: "Fetches next week's matchups with team records for preview",
  parameters: {
    type: 'object',
    properties: {
      currentWeek: { type: 'number', description: 'Current week number' },
    },
    required: ['currentWeek'],
  },
  execute: async (args: { currentWeek: number }) => {
    const nextWeek = args.currentWeek + 1;

    // Fetch next week's matchups (may not be set yet early in the week)
    const [afcMatchups, nfcMatchups] = await Promise.all([
      sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, nextWeek).catch(() => []),
      sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, nextWeek).catch(() => []),
    ]);

    // If next week's matchups aren't available, return empty
    if (afcMatchups.length === 0 && nfcMatchups.length === 0) {
      return {
        week: nextWeek,
        available: false,
        message: "Next week's matchups not yet available",
      };
    }

    // Fetch rosters and calculate records
    const [afcRosters, nfcRosters] = await Promise.all([
      sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.AFC),
      sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.NFC),
    ]);

    const calculateRecord = async (
      rosterId: number,
      leagueId: string,
      throughWeek: number
    ): Promise<{ wins: number; losses: number; pointsFor: number }> => {
      const matchupsByWeek = await Promise.all(
        Array.from({ length: throughWeek }, (_, i) =>
          sleeperClient.fetchMatchups(leagueId, i + 1)
        )
      );

      let wins = 0;
      let losses = 0;
      let pointsFor = 0;

      matchupsByWeek.forEach(weekMatchups => {
        const team = weekMatchups.find(m => m.roster_id === rosterId);
        if (!team) return;

        const opponent = weekMatchups.find(
          m => m.matchup_id === team.matchup_id && m.roster_id !== rosterId
        );
        if (!opponent) return;

        const teamScore = team.points || 0;
        const oppScore = opponent.points || 0;

        pointsFor += teamScore;

        if (teamScore > oppScore) wins++;
        else if (oppScore > teamScore) losses++;
      });

      return { wins, losses, pointsFor: Math.round(pointsFor * 100) / 100 };
    };

    const buildUpcomingMatchups = async (
      matchups: any[],
      rosters: any[],
      leagueId: string,
      leagueName: 'AFC' | 'NFC'
    ): Promise<UpcomingMatchup[]> => {
      const upcoming: UpcomingMatchup[] = [];
      const processedMatchupIds = new Set<number>();

      for (const matchup of matchups) {
        if (processedMatchupIds.has(matchup.matchup_id)) continue;
        processedMatchupIds.add(matchup.matchup_id);

        const opponent = matchups.find(
          m =>
            m.matchup_id === matchup.matchup_id &&
            m.roster_id !== matchup.roster_id
        );

        if (!opponent) continue;

        const team1Roster = rosters.find(
          r => r.roster_id === matchup.roster_id
        );
        const team2Roster = rosters.find(
          r => r.roster_id === opponent.roster_id
        );

        const [team1Record, team2Record] = await Promise.all([
          calculateRecord(matchup.roster_id, leagueId, args.currentWeek),
          calculateRecord(opponent.roster_id, leagueId, args.currentWeek),
        ]);

        // Determine storyline
        let storyline = '';
        const team1Wins = team1Record.wins;
        const team2Wins = team2Record.wins;

        if (team1Wins >= 4 && team2Wins >= 4) {
          storyline = 'Battle of playoff contenders';
        } else if (team1Wins <= 1 && team2Wins <= 1) {
          storyline = 'Elimination game territory';
        } else if (Math.abs(team1Wins - team2Wins) >= 3) {
          storyline = 'David vs Goliath matchup';
        }

        upcoming.push({
          matchupId: matchup.matchup_id,
          leagueId,
          league: leagueName,
          team1: {
            rosterId: matchup.roster_id,
            teamName:
              team1Roster?.metadata?.team_name || `Team ${matchup.roster_id}`,
            record: `${team1Record.wins}-${team1Record.losses}`,
            pointsFor: team1Record.pointsFor,
          },
          team2: {
            rosterId: opponent.roster_id,
            teamName:
              team2Roster?.metadata?.team_name || `Team ${opponent.roster_id}`,
            record: `${team2Record.wins}-${team2Record.losses}`,
            pointsFor: team2Record.pointsFor,
          },
          storyline,
        });
      }

      return upcoming;
    };

    const [afcUpcoming, nfcUpcoming] = await Promise.all([
      buildUpcomingMatchups(afcMatchups, afcRosters, LEAGUE_IDS.AFC, 'AFC'),
      buildUpcomingMatchups(nfcMatchups, nfcRosters, LEAGUE_IDS.NFC, 'NFC'),
    ]);

    return {
      week: nextWeek,
      available: true,
      afc: afcUpcoming,
      nfc: nfcUpcoming,
      totalMatchups: afcUpcoming.length + nfcUpcoming.length,
    };
  },
};
```

### Step 3: Create Section Prompt (5 min)

```typescript
// apps/web/src/lib/reports/recap/prompts/sections/upcoming.ts

export const UPCOMING_PROMPT = `
You are writing the "Looking Ahead" section previewing next week's matchups.

## Available Tool

- **fetch_next_week_matchups**: Gets next week's matchups with records and storylines

## Your Task

Write 1-2 paragraphs (100-150 words) covering:

1. **Key Matchups**: Highlight 2-3 most interesting games
2. **Storylines**: Mention playoff implications, revenge games, division battles
3. **Forward-Looking**: Build excitement for the upcoming week

## Style Guidelines

- Anticipatory and exciting tone
- Focus on stakes and storylines
- Mention specific teams and their records
- Keep it concise and engaging

## Output Format

{
  "narrative": "Your 1-2 paragraph preview",
  "keyMatchups": [
    "Team A (4-1) vs Team B (5-0) - Battle for first place",
    "Team C (1-4) vs Team D (4-1) - Must-win for Team C"
  ]
}

Call the tool and write the narrative.
`;
```

### Step 4: Create Test Script (5 min)

```typescript
// apps/web/scripts/test-upcoming.ts

import { fetchNextWeekMatchupsTool } from '../src/lib/reports/recap/tools/upcoming';

const testUpcoming = async (): Promise<void> => {
  console.log('🧪 Testing Upcoming Matchups\n');

  const currentWeek = 5;

  try {
    console.log(`Fetching Week ${currentWeek + 1} matchups...\n`);

    const result = await fetchNextWeekMatchupsTool.execute({ currentWeek });

    if (!result.available) {
      console.log('⚠️ ', result.message);
      return;
    }

    console.log('='.repeat(70));
    console.log(`WEEK ${result.week} MATCHUPS`);
    console.log('='.repeat(70));

    console.log('\nAFC:');
    result.afc.forEach((matchup: any) => {
      console.log(
        `  ${matchup.team1.teamName} (${matchup.team1.record}) vs ${matchup.team2.teamName} (${matchup.team2.record})`
      );
      if (matchup.storyline) {
        console.log(`    → ${matchup.storyline}`);
      }
    });

    console.log('\nNFC:');
    result.nfc.forEach((matchup: any) => {
      console.log(
        `  ${matchup.team1.teamName} (${matchup.team1.record}) vs ${matchup.team2.teamName} (${matchup.team2.record})`
      );
      if (matchup.storyline) {
        console.log(`    → ${matchup.storyline}`);
      }
    });

    console.log('\n✅ Upcoming matchups tool working correctly!');
    console.log(`   Total matchups: ${result.totalMatchups}`);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testUpcoming();
```

---

## ✅ Validation Checklist

**Before marking complete:**

- [ ] Upcoming tool implemented
- [ ] Tool fetches next week's matchups
- [ ] Records calculated through current week
- [ ] Storylines generated based on records
- [ ] Test script runs successfully: `npm run test:upcoming`
- [ ] Types added to types.ts
- [ ] Section prompt created
- [ ] Tool registered in registry
- [ ] Code follows arrow function pattern

---

## 🎯 Success Criteria

**Task is complete when:**

1. ✅ Upcoming matchups tool implemented
2. ✅ Tool handles case when next week not available yet
3. ✅ Records calculated correctly
4. ✅ Test script displays all matchups with records
5. ✅ Code committed with message:
   `feat(recap): implement upcoming matchups preview (RECAP-015)`

---

## 🔗 Next Task

**RECAP-016: Closing Commentary** - Aggregate all section data and generate
big-picture closing

---

## 📝 Implementation Notes

**Completed**: 2025-10-08

### What Was Built

1. **Upcoming Matchups Tool** (`upcoming.ts`)
   - Fetches next week's matchups with graceful handling when unavailable
   - Calculates team records through current week
   - Generates contextual storylines based on records
   - Returns structured data for both AFC and NFC leagues

2. **Section Prompt** (`sections/upcoming.ts`)
   - Guides AI to write 1-2 paragraph preview
   - Emphasizes anticipatory tone and storylines
   - Includes output format specification

3. **Test Script** (`test-upcoming.ts`)
   - Validates tool functionality with Week 5 → Week 6 data
   - Displays all 12 matchups with records and storylines
   - Added to package.json as `npm run test:upcoming`

4. **Tool Registration**
   - Registered as tool #22 in the registry
   - Verified with 22 total tools registered

### Test Results

```
✅ All 12 matchups fetched correctly (6 AFC + 6 NFC)
✅ Team records calculated accurately
✅ Storylines generated appropriately:
   - "Battle of playoff contenders" (both teams 4+ wins)
   - "David vs Goliath matchup" (3+ win difference)
   - "Even matchup" (same record)
   - "Elimination game territory" (both teams 1 or fewer wins)
```

### Files Created/Modified

- `apps/web/src/lib/reports/recap/tools/upcoming.ts` (new)
- `apps/web/src/lib/reports/recap/prompts/sections/upcoming.ts` (new)
- `apps/web/scripts/test-upcoming.ts` (new)
- `apps/web/src/lib/reports/recap/tools/index.ts` (modified)
- `apps/web/package.json` (modified)

---

**Created**: 2025-10-08  
**Completed**: 2025-10-08  
**Status**: ✅ Complete
