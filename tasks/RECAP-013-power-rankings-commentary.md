# RECAP-013: Power Rankings Commentary

**Project**: Weekly Recap Reports  
**Phase**: 2 - Section Implementation  
**Estimated Time**: 45 minutes  
**Dependencies**: RECAP-006  
**Status**: ✅ Complete

---

## 🎯 Objective

Implement the Power Rankings section that fetches current and previous week
rankings, calculates movement, and generates brief commentary on the biggest
risers, fallers, and stable teams.

---

## 📋 What to Build

### The Power Rankings Tool

**`fetch_power_rankings`** - Fetches current and previous week rankings,
calculates changes

---

## 📁 Files to Create/Modify

### New Files

```
apps/web/src/lib/reports/recap/tools/
└── power-rankings.ts                   # Power rankings tool

apps/web/src/lib/reports/recap/prompts/sections/
└── power-rankings.ts                   # Section prompt

apps/web/scripts/
└── test-power-rankings.ts              # Validation script
```

### Modified Files

```
apps/web/src/lib/reports/recap/types.ts
  - Add PowerRanking type
  - Add RankingChange type

apps/web/src/lib/reports/recap/tools/registry.ts
  - Register power rankings tool
```

---

## 🛠️ Implementation Steps

### Step 1: Define Types (5 min)

```typescript
// apps/web/src/lib/reports/recap/types.ts (additions)

export interface PowerRanking {
  rank: number;
  previousRank: number;
  movement: number; // Positive = moved up, negative = moved down
  rosterId: number;
  leagueId: string;
  teamName: string;
  ownerName: string;
  record: string; // e.g., "4-1"
  pointsFor: number;
  league: 'AFC' | 'NFC';
}

export interface RankingChange {
  biggestRiser: PowerRanking;
  biggestFaller: PowerRanking;
  topThree: PowerRanking[];
  notableChanges: PowerRanking[]; // Moved 3+ spots
}
```

### Step 2: Implement Power Rankings Tool (25 min)

```typescript
// apps/web/src/lib/reports/recap/tools/power-rankings.ts

import { sleeperClient } from '@/lib/sleeper/unified-client';
import { LEAGUE_IDS } from '@/lib/constants';
import type { Tool } from './base';
import type { PowerRanking, RankingChange } from '../types';

export const fetchPowerRankingsTool: Tool = {
  name: 'fetch_power_rankings',
  description:
    'Fetches current and previous week power rankings with movement tracking',
  parameters: {
    type: 'object',
    properties: {
      currentWeek: { type: 'number', description: 'Current NFL week' },
    },
    required: ['currentWeek'],
  },
  execute: async (args: { currentWeek: number }) => {
    // NOTE: In production, this would fetch from a power rankings database/API
    // For now, we'll calculate basic power rankings based on record and points

    const calculateRankings = async (week: number): Promise<PowerRanking[]> => {
      const [afcMatchups, nfcMatchups, afcRosters, nfcRosters] =
        await Promise.all([
          Promise.all(
            Array.from({ length: week }, (_, i) =>
              sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, i + 1)
            )
          ),
          Promise.all(
            Array.from({ length: week }, (_, i) =>
              sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, i + 1)
            )
          ),
          sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.AFC),
          sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.NFC),
        ]);

      const calculateTeamStats = (rosterId: number, matchups: any[][]) => {
        let wins = 0;
        let losses = 0;
        let pointsFor = 0;

        matchups.forEach(weekMatchups => {
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

        return { wins, losses, pointsFor, winPct: wins / (wins + losses || 1) };
      };

      const rankings: PowerRanking[] = [];

      // Process AFC
      afcRosters.forEach(roster => {
        const stats = calculateTeamStats(roster.roster_id, afcMatchups);
        rankings.push({
          rank: 0, // Will be set after sorting
          previousRank: 0, // Will be set when comparing weeks
          movement: 0,
          rosterId: roster.roster_id,
          leagueId: LEAGUE_IDS.AFC,
          teamName: roster.metadata?.team_name || `Team ${roster.roster_id}`,
          ownerName: roster.metadata?.owner_name || 'Unknown',
          record: `${stats.wins}-${stats.losses}`,
          pointsFor: Math.round(stats.pointsFor * 100) / 100,
          league: 'AFC',
        });
      });

      // Process NFC
      nfcRosters.forEach(roster => {
        const stats = calculateTeamStats(roster.roster_id, nfcMatchups);
        rankings.push({
          rank: 0,
          previousRank: 0,
          movement: 0,
          rosterId: roster.roster_id,
          leagueId: LEAGUE_IDS.NFC,
          teamName: roster.metadata?.team_name || `Team ${roster.roster_id}`,
          ownerName: roster.metadata?.owner_name || 'Unknown',
          record: `${stats.wins}-${stats.losses}`,
          pointsFor: Math.round(stats.pointsFor * 100) / 100,
          league: 'NFC',
        });
      });

      // Sort by points for (simple power ranking)
      rankings.sort((a, b) => b.pointsFor - a.pointsFor);

      // Assign ranks
      rankings.forEach((ranking, i) => {
        ranking.rank = i + 1;
      });

      return rankings;
    };

    // Calculate current and previous week rankings
    const [currentRankings, previousRankings] = await Promise.all([
      calculateRankings(args.currentWeek),
      args.currentWeek > 1 ? calculateRankings(args.currentWeek - 1) : [],
    ]);

    // Calculate movement
    if (previousRankings.length > 0) {
      currentRankings.forEach(current => {
        const previous = previousRankings.find(
          p =>
            p.leagueId === current.leagueId && p.rosterId === current.rosterId
        );
        if (previous) {
          current.previousRank = previous.rank;
          current.movement = previous.rank - current.rank; // Positive = moved up
        } else {
          current.previousRank = current.rank;
          current.movement = 0;
        }
      });
    } else {
      // First week, no movement
      currentRankings.forEach(ranking => {
        ranking.previousRank = ranking.rank;
        ranking.movement = 0;
      });
    }

    // Identify notable changes
    const biggestRiser = currentRankings
      .filter(r => r.movement > 0)
      .sort((a, b) => b.movement - a.movement)[0];

    const biggestFaller = currentRankings
      .filter(r => r.movement < 0)
      .sort((a, b) => a.movement - b.movement)[0];

    const topThree = currentRankings.slice(0, 3);

    const notableChanges = currentRankings.filter(
      r => Math.abs(r.movement) >= 3
    );

    const changes: RankingChange = {
      biggestRiser,
      biggestFaller,
      topThree,
      notableChanges,
    };

    return {
      currentWeek: args.currentWeek,
      rankings: currentRankings,
      changes,
    };
  },
};
```

### Step 3: Create Section Prompt (10 min)

```typescript
// apps/web/src/lib/reports/recap/prompts/sections/power-rankings.ts

export const POWER_RANKINGS_PROMPT = `
You are writing the "Power Rankings" section commenting on team movements.

## Available Tool

- **fetch_power_rankings**: Gets current rankings with movement from previous week

## Your Task

Write 2 paragraphs (100-150 words) covering:

1. **Top 3**: Briefly mention the current top 3 teams
2. **Movement**: Highlight the biggest riser and biggest faller
3. **Notable Changes**: Mention any teams that moved 3+ spots

## Style Guidelines

- Analytical and objective tone
- Focus on what drove the changes (big wins, tough losses)
- Use specific rankings and movement (e.g., "jumped 5 spots to #8")
- Keep it concise

## Output Format

{
  "narrative": "Your 2-paragraph narrative",
  "rankings": {
    "topThree": ["#1 Team Name (5-0, 612.4 PF)", ...],
    "biggestRiser": "#12 Team Name (↑5 spots)",
    "biggestFaller": "#18 Team Name (↓4 spots)"
  }
}

Call the tool and write the narrative.
`;
```

### Step 4: Create Test Script (5 min)

```typescript
// apps/web/scripts/test-power-rankings.ts

import { fetchPowerRankingsTool } from '../src/lib/reports/recap/tools/power-rankings';

const testPowerRankings = async (): Promise<void> => {
  console.log('🧪 Testing Power Rankings\n');

  const currentWeek = 5;

  try {
    console.log(`Fetching power rankings for Week ${currentWeek}...\n`);

    const result = await fetchPowerRankingsTool.execute({ currentWeek });

    console.log('✅ Top 10 Rankings:');
    result.rankings.slice(0, 10).forEach((ranking: any) => {
      const arrow =
        ranking.movement > 0 ? '↑' : ranking.movement < 0 ? '↓' : '→';
      const moveText =
        ranking.movement !== 0
          ? ` (${arrow}${Math.abs(ranking.movement)})`
          : '';
      console.log(
        `   #${ranking.rank}${moveText} ${ranking.teamName} (${ranking.league}) - ${ranking.record}, ${ranking.pointsFor} PF`
      );
    });

    if (result.changes.biggestRiser) {
      console.log(
        `\n📈 Biggest Riser: ${result.changes.biggestRiser.teamName} (↑${result.changes.biggestRiser.movement} to #${result.changes.biggestRiser.rank})`
      );
    }

    if (result.changes.biggestFaller) {
      console.log(
        `📉 Biggest Faller: ${result.changes.biggestFaller.teamName} (↓${Math.abs(result.changes.biggestFaller.movement)} to #${result.changes.biggestFaller.rank})`
      );
    }

    console.log(
      `\n⚡ Notable Changes (3+ spots): ${result.changes.notableChanges.length}`
    );
    result.changes.notableChanges.forEach((change: any) => {
      const arrow = change.movement > 0 ? '↑' : '↓';
      console.log(
        `   ${change.teamName}: ${arrow}${Math.abs(change.movement)} to #${change.rank}`
      );
    });

    console.log('\n✅ Power rankings tool working correctly!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testPowerRankings();
```

---

## ✅ Validation Checklist

**Before marking complete:**

- [x] Power rankings tool implemented
- [x] Tool calculates movement correctly
- [x] Test script runs successfully: `npm run test:power-rankings`
- [x] Types added to types.ts
- [x] Section prompt created
- [x] Tool registered in registry
- [x] Code follows arrow function pattern

---

## 🎯 Success Criteria

**Task is complete when:**

1. ✅ Power rankings tool implemented - DONE
2. ✅ Movement tracking works (previous vs current week) - DONE
3. ✅ Test script shows top 10 with movement - DONE
4. ✅ Notable changes identified correctly - DONE
5. ✅ Code committed with message:
   `feat(recap): implement power rankings commentary (RECAP-013)` - DONE

---

## 🔗 Next Task

**RECAP-014: Standings & Playoff Picture** - Format league standings (minimal
narrative)

---

**Created**: 2025-10-08  
**Completed**: 2025-10-08  
**Status**: ✅ Complete
