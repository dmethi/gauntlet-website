# RECAP-006: League Overview Section

**Project**: Weekly Recap Reports  
**Phase**: 2 - Section Implementation  
**Estimated Time**: 45 minutes  
**Dependencies**: RECAP-005 (Phase 1 Complete)  
**Status**: 🔴 Not Started

---

## 🎯 Objective

Implement the League Overview section that provides high-level weekly statistics
and sets the tone for the recap report. This section summarizes total points
scored, average scores, and notable league-wide trends.

---

## 📋 What to Build

### 1. Data Fetching Tools (2 tools)

#### `fetch_league_data`

```typescript
// Fetches basic league information for both AFC and NFC
const fetchLeagueData = (leagueId: string, week: number): LeagueData => {
  // Returns: league name, week number, season, etc.
};
```

#### `calculate_week_summary_stats`

```typescript
// Calculates aggregate statistics across all matchups
const calculateWeekSummaryStats = (
  leagueId: string,
  week: number
): WeekStats => {
  // Returns: total points, avg score, highest/lowest, scoring variance
};
```

### 2. League Overview Prompt

Create a section-specific prompt that generates 2-3 paragraphs covering:

- Week X is in the books with [total points] scored
- Average score was [X], up/down from Week Y
- Tight/blowout games breakdown
- Overall narrative tone-setter

### 3. Section Implementation

Wire the tools and prompt into a test that validates:

- Tools fetch correct data
- Prompt generates quality narrative
- Output format matches schema

---

## 📁 Files to Create/Modify

### New Files

```
apps/web/src/lib/reports/recap/tools/
└── league-overview.ts              # 2 tools implementation

apps/web/src/lib/reports/recap/prompts/sections/
└── league-overview.ts              # Section prompt template

apps/web/scripts/
└── test-league-overview-section.ts # Validation script
```

### Modified Files

```
apps/web/src/lib/reports/recap/tools/registry.ts
  - Register 2 new tools

apps/web/package.json
  - Add test:league-overview script
```

---

## 🛠️ Implementation Steps

### Step 1: Create Data Tools (20 min)

```typescript
// apps/web/src/lib/reports/recap/tools/league-overview.ts

import { sleeperClient } from '@/lib/sleeper/unified-client';
import type { SleeperMatchup } from '@gauntlet/types';
import { LEAGUE_IDS } from '@/lib/constants';
import type { Tool } from '../tools/base';

export const fetchLeagueDataTool: Tool = {
  name: 'fetch_league_data',
  description: 'Fetches basic league information for the specified week',
  parameters: {
    type: 'object',
    properties: {
      week: {
        type: 'number',
        description: 'NFL week number (1-18)',
      },
    },
    required: ['week'],
  },
  execute: async (args: { week: number }) => {
    // Fetch league info for both AFC and NFC
    const [afcLeague, nfcLeague] = await Promise.all([
      sleeperClient.fetchLeague(LEAGUE_IDS.AFC),
      sleeperClient.fetchLeague(LEAGUE_IDS.NFC),
    ]);

    return {
      season: afcLeague.season,
      week: args.week,
      leagues: [
        {
          id: LEAGUE_IDS.AFC,
          name: afcLeague.name,
          totalRosters: afcLeague.total_rosters,
        },
        {
          id: LEAGUE_IDS.NFC,
          name: nfcLeague.name,
          totalRosters: nfcLeague.total_rosters,
        },
      ],
      totalTeams: afcLeague.total_rosters + nfcLeague.total_rosters,
    };
  },
};

export const calculateWeekSummaryStatsTool: Tool = {
  name: 'calculate_week_summary_stats',
  description:
    'Calculates aggregate statistics for the week across all matchups',
  parameters: {
    type: 'object',
    properties: {
      week: {
        type: 'number',
        description: 'NFL week number (1-18)',
      },
    },
    required: ['week'],
  },
  execute: async (args: { week: number }) => {
    // Fetch matchups for both leagues
    const [afcMatchups, nfcMatchups] = await Promise.all([
      sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, args.week),
      sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, args.week),
    ]);

    // Process each league separately, then combine
    const allScores = [...afcMatchups, ...nfcMatchups]
      .map(m => m.points)
      .filter((p): p is number => p !== null && p !== undefined);

    const totalPoints = allScores.reduce((sum, p) => sum + p, 0);
    const avgScore = totalPoints / allScores.length;
    const highestScore = Math.max(...allScores);
    const lowestScore = Math.min(...allScores);

    // Calculate blowouts vs close games
    const matchupDiffs = [...afcMatchups, ...nfcMatchups].reduce(
      (pairs: number[], matchup, idx, arr) => {
        if (matchup.matchup_id && idx % 2 === 0) {
          const opponent = arr.find(
            (m, i) =>
              i !== idx &&
              m.matchup_id === matchup.matchup_id &&
              Math.abs(i - idx) === 1
          );
          if (opponent && matchup.points && opponent.points) {
            pairs.push(Math.abs(matchup.points - opponent.points));
          }
        }
        return pairs;
      },
      []
    );

    const closeGames = matchupDiffs.filter(d => d <= 10).length;
    const blowouts = matchupDiffs.filter(d => d >= 30).length;

    return {
      totalPoints: Math.round(totalPoints * 100) / 100,
      averageScore: Math.round(avgScore * 100) / 100,
      highestScore: Math.round(highestScore * 100) / 100,
      lowestScore: Math.round(lowestScore * 100) / 100,
      totalMatchups: matchupDiffs.length,
      closeGames,
      blowouts,
      competitiveRatio: Math.round((closeGames / matchupDiffs.length) * 100),
    };
  },
};
```

### Step 2: Create Section Prompt (15 min)

```typescript
// apps/web/src/lib/reports/recap/prompts/sections/league-overview.ts

export const LEAGUE_OVERVIEW_PROMPT = `
You are writing the opening "League Overview" section of a fantasy football weekly recap.

**Available Tools:**
- fetch_league_data: Get basic league information
- calculate_week_summary_stats: Get aggregate weekly statistics

**Your Task:**
1. Call both tools to gather league data
2. Write 2-3 paragraphs that:
   - Open with an engaging hook about the week's action
   - Mention total points scored and average score
   - Highlight if it was a high/low scoring week
   - Note the split between close games and blowouts
   - Set the tone for the rest of the report

**Style Guidelines:**
- Professional sports journalism tone
- Engaging and narrative-driven
- Use specific numbers to support claims
- Keep it concise (100-150 words)
- No bullet points, only prose

**Output Format:**
Return a JSON object with this structure:
{
  "narrative": "Your 2-3 paragraph narrative here",
  "metrics": {
    "totalPoints": number,
    "averageScore": number,
    "closeGames": number,
    "blowouts": number
  }
}

Begin by calling the tools to gather data.
`;
```

### Step 3: Create Test Script (10 min)

```typescript
// apps/web/scripts/test-league-overview-section.ts

import {
  fetchLeagueDataTool,
  calculateWeekSummaryStatsTool,
} from '../src/lib/reports/recap/tools/league-overview';

const testLeagueOverview = async (): Promise<void> => {
  console.log('🧪 Testing League Overview Section\n');

  try {
    // Test with Week 5 data
    const week = 5;

    console.log('1. Testing fetch_league_data tool...');
    const leagueData = await fetchLeagueDataTool.execute({ week });
    console.log('✅ League Data:', JSON.stringify(leagueData, null, 2));

    console.log('\n2. Testing calculate_week_summary_stats tool...');
    const summaryStats = await calculateWeekSummaryStatsTool.execute({ week });
    console.log('✅ Summary Stats:', JSON.stringify(summaryStats, null, 2));

    console.log('\n✅ All League Overview tools working correctly!');
    console.log('\n📊 Sample Output:');
    console.log(
      `Week ${week} is in the books with ${summaryStats.totalPoints} total points scored across ${summaryStats.totalMatchups} matchups.`
    );
    console.log(
      `Average score: ${summaryStats.averageScore} (High: ${summaryStats.highestScore}, Low: ${summaryStats.lowestScore})`
    );
    console.log(
      `${summaryStats.closeGames} close games, ${summaryStats.blowouts} blowouts`
    );
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testLeagueOverview();
```

---

## ✅ Validation Checklist

**Before marking complete:**

- [ ] Both tools execute without errors
- [ ] Tools return correctly formatted data
- [ ] Test script runs successfully: `npm run test:league-overview`
- [ ] Data matches expected Week 5 results
- [ ] Tools registered in registry
- [ ] Code follows arrow function pattern
- [ ] Proper TypeScript types used
- [ ] Error handling implemented

---

## 📊 Expected Output Example

```json
{
  "leagueData": {
    "season": "2025",
    "week": 5,
    "totalTeams": 24,
    "leagues": [
      {
        "id": "1263744209295245312",
        "name": "The Gauntlet - AFC",
        "totalRosters": 12
      },
      {
        "id": "1263740549504962561",
        "name": "The Gauntlet - NFC",
        "totalRosters": 12
      }
    ]
  },
  "summaryStats": {
    "totalPoints": 2847.32,
    "averageScore": 118.64,
    "highestScore": 156.84,
    "lowestScore": 89.42,
    "totalMatchups": 12,
    "closeGames": 4,
    "blowouts": 2,
    "competitiveRatio": 33
  }
}
```

---

## 🎯 Success Criteria

**Task is complete when:**

1. ✅ Both tools implemented and tested
2. ✅ Section prompt template created
3. ✅ Test script passes with Week 5 data
4. ✅ Tools return valid JSON matching schema
5. ✅ Code committed with message:
   `feat(recap): implement league overview section (RECAP-006)`

---

## 🔗 Next Task

**RECAP-007: Game Flow Data Compression** - Compress time-series data for
matchup narratives

---

**Created**: 2025-10-08  
**Status**: 🔴 Not Started
