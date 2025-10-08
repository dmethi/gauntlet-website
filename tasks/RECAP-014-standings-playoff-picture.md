# RECAP-014: Standings & Playoff Picture

**Project**: Weekly Recap Reports  
**Phase**: 2 - Section Implementation  
**Estimated Time**: 30 minutes  
**Dependencies**: RECAP-013  
**Status**: 🔴 Not Started

---

## 🎯 Objective

Implement the Standings section that displays current league standings with
playoff seeds. This is primarily a data formatting task with minimal narrative
generation.

---

## 📋 What to Build

### The Standings Tool

**`fetch_standings`** - Fetches current standings for both leagues with playoff
seeding

---

## 📁 Files to Create/Modify

### New Files

```
apps/web/src/lib/reports/recap/tools/
└── standings.ts                        # Standings tool

apps/web/scripts/
└── test-standings.ts                   # Validation script
```

### Modified Files

```
apps/web/src/lib/reports/recap/types.ts
  - Add StandingsEntry type
  - Add Standings type

apps/web/src/lib/reports/recap/tools/registry.ts
  - Register standings tool
```

---

## 🛠️ Implementation Steps

### Step 1: Define Types (5 min)

```typescript
// apps/web/src/lib/reports/recap/types.ts (additions)

export interface StandingsEntry {
  rank: number;
  rosterId: number;
  teamName: string;
  ownerName: string;
  wins: number;
  losses: number;
  ties: number;
  winPct: number;
  pointsFor: number;
  pointsAgainst: number;
  playoffSeed: number | null; // 1-6 for playoff teams, null for others
}

export interface Standings {
  league: 'AFC' | 'NFC';
  entries: StandingsEntry[];
  playoffLine: number; // Number of teams that make playoffs
}
```

### Step 2: Implement Standings Tool (20 min)

```typescript
// apps/web/src/lib/reports/recap/tools/standings.ts

import { sleeperClient } from '@/lib/sleeper/unified-client';
import { LEAGUE_IDS } from '@/lib/constants';
import type { Tool } from './base';
import type { Standings, StandingsEntry } from '../types';

export const fetchStandingsTool: Tool = {
  name: 'fetch_standings',
  description: 'Fetches current league standings with playoff seeding',
  parameters: {
    type: 'object',
    properties: {
      week: { type: 'number', description: 'Current NFL week' },
    },
    required: ['week'],
  },
  execute: async (args: { week: number }) => {
    const calculateStandings = async (
      leagueId: string,
      leagueName: 'AFC' | 'NFC'
    ): Promise<Standings> => {
      // Fetch all matchups up to current week
      const matchupsByWeek = await Promise.all(
        Array.from({ length: args.week }, (_, i) =>
          sleeperClient.fetchMatchups(leagueId, i + 1)
        )
      );

      const rosters = await sleeperClient.fetchRostersWithOwners(leagueId);

      // Calculate each team's record
      const standings: StandingsEntry[] = rosters.map(roster => {
        let wins = 0;
        let losses = 0;
        let ties = 0;
        let pointsFor = 0;
        let pointsAgainst = 0;

        matchupsByWeek.forEach(weekMatchups => {
          const team = weekMatchups.find(m => m.roster_id === roster.roster_id);
          if (!team) return;

          const opponent = weekMatchups.find(
            m =>
              m.matchup_id === team.matchup_id &&
              m.roster_id !== roster.roster_id
          );
          if (!opponent) return;

          const teamScore = team.points || 0;
          const oppScore = opponent.points || 0;

          pointsFor += teamScore;
          pointsAgainst += oppScore;

          if (teamScore > oppScore) wins++;
          else if (oppScore > teamScore) losses++;
          else ties++;
        });

        const totalGames = wins + losses + ties;
        const winPct = totalGames > 0 ? wins / totalGames : 0;

        return {
          rank: 0, // Will be set after sorting
          rosterId: roster.roster_id,
          teamName: roster.metadata?.team_name || `Team ${roster.roster_id}`,
          ownerName: roster.metadata?.owner_name || 'Unknown',
          wins,
          losses,
          ties,
          winPct: Math.round(winPct * 1000) / 1000,
          pointsFor: Math.round(pointsFor * 100) / 100,
          pointsAgainst: Math.round(pointsAgainst * 100) / 100,
          playoffSeed: null,
        };
      });

      // Sort by win percentage, then by points for (tiebreaker)
      standings.sort((a, b) => {
        if (b.winPct !== a.winPct) return b.winPct - a.winPct;
        return b.pointsFor - a.pointsFor;
      });

      // Assign ranks and playoff seeds
      standings.forEach((entry, i) => {
        entry.rank = i + 1;
        entry.playoffSeed = i < 6 ? i + 1 : null; // Top 6 make playoffs
      });

      return {
        league: leagueName,
        entries: standings,
        playoffLine: 6,
      };
    };

    // Calculate standings for both leagues
    const [afcStandings, nfcStandings] = await Promise.all([
      calculateStandings(LEAGUE_IDS.AFC, 'AFC'),
      calculateStandings(LEAGUE_IDS.NFC, 'NFC'),
    ]);

    return {
      afc: afcStandings,
      nfc: nfcStandings,
    };
  },
};
```

### Step 3: Create Test Script (5 min)

```typescript
// apps/web/scripts/test-standings.ts

import { fetchStandingsTool } from '../src/lib/reports/recap/tools/standings';

const testStandings = async (): Promise<void> => {
  console.log('🧪 Testing Standings\n');

  const week = 5;

  try {
    console.log(`Fetching standings through Week ${week}...\n`);

    const result = await fetchStandingsTool.execute({ week });

    console.log('='.repeat(70));
    console.log('AFC STANDINGS');
    console.log('='.repeat(70));
    result.afc.entries.forEach((entry: any) => {
      const seed = entry.playoffSeed ? `[${entry.playoffSeed}] ` : '    ';
      console.log(
        `${seed}${entry.rank}. ${entry.teamName.padEnd(25)} ${entry.wins}-${entry.losses} (${entry.winPct.toFixed(3)}) | ${entry.pointsFor} PF, ${entry.pointsAgainst} PA`
      );
    });

    console.log('\n' + '='.repeat(70));
    console.log('NFC STANDINGS');
    console.log('='.repeat(70));
    result.nfc.entries.forEach((entry: any) => {
      const seed = entry.playoffSeed ? `[${entry.playoffSeed}] ` : '    ';
      console.log(
        `${seed}${entry.rank}. ${entry.teamName.padEnd(25)} ${entry.wins}-${entry.losses} (${entry.winPct.toFixed(3)}) | ${entry.pointsFor} PF, ${entry.pointsAgainst} PA`
      );
    });

    console.log('\n✅ Standings tool working correctly!');
    console.log(`   Top 6 teams in each league make playoffs`);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testStandings();
```

---

## ✅ Validation Checklist

**Before marking complete:**

- [ ] Standings tool implemented
- [ ] Tool calculates records correctly
- [ ] Playoff seeds assigned to top 6 teams
- [ ] Test script runs successfully: `npm run test:standings`
- [ ] Types added to types.ts
- [ ] Tool registered in registry
- [ ] Code follows arrow function pattern

---

## 📊 Expected Output Example

```
🧪 Testing Standings

Fetching standings through Week 5...

======================================================================
AFC STANDINGS
======================================================================
[1] 1. Crimson Tide              5-0 (1.000) | 612.4 PF, 534.2 PA
[2] 2. Blue Devils                4-1 (0.800) | 598.7 PF, 551.3 PA
[3] 3. Golden Bears              4-1 (0.800) | 587.2 PF, 542.8 PA
[4] 4. Wildcats                  3-2 (0.600) | 572.5 PF, 558.9 PA
[5] 5. Tigers                    3-2 (0.600) | 565.3 PF, 561.4 PA
[6] 6. Eagles                    3-2 (0.600) | 554.8 PF, 563.2 PA
    7. Panthers                  2-3 (0.400) | 548.6 PF, 571.9 PA
    8. Falcons                   2-3 (0.400) | 542.1 PF, 578.4 PA
    9. Ravens                    1-4 (0.200) | 531.7 PF, 592.3 PA
    10. Broncos                  1-4 (0.200) | 524.3 PF, 598.7 PA
    11. Cardinals                0-5 (0.000) | 512.8 PF, 612.5 PA
    12. Chargers                 0-5 (0.000) | 498.2 PF, 625.1 PA

======================================================================
NFC STANDINGS
======================================================================
[1] 1. Packers                   5-0 (1.000) | 625.7 PF, 542.1 PA
[2] 2. Cowboys                   4-1 (0.800) | 604.3 PF, 558.9 PA
...

✅ Standings tool working correctly!
   Top 6 teams in each league make playoffs
```

---

## 🎯 Success Criteria

**Task is complete when:**

1. ✅ Standings tool calculates records correctly
2. ✅ Playoff seeds assigned to top 6
3. ✅ Test script displays formatted standings
4. ✅ Tiebreakers work (points for)
5. ✅ Code committed with message:
   `feat(recap): implement standings and playoff picture (RECAP-014)`

---

## 🔗 Next Task

**RECAP-015: Upcoming Matchups Preview** - Brief look ahead to next week's games

---

**Created**: 2025-10-08  
**Status**: 🔴 Not Started
