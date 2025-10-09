# RECAP-011: Hall of Fame Section (ENHANCED)

**Project**: Weekly Recap Reports  
**Phase**: 2 - Section Implementation  
**Estimated Time**: 2 hours  
**Dependencies**: RECAP-006, Hall of Fame Data Service  
**Status**: ✅ Complete

---

## 🎯 Objective

Implement the **data-focused** "Hall of Fame" section with:
1. **Top 5 performers at each position** (QB, RB, WR, TE, K, DEF) with ownership status in both leagues
2. **Historical record checks** - Does Week 5 crack any all-time records?
3. **Structured data output** - No narrative, let stats speak for themselves

---

## 📋 What to Build

### Enhanced Hall of Fame Tools (4 tools)

1. **`calculate_top_team_score`** - Highest scoring team + historical rank
2. **`calculate_biggest_blowout`** - Largest victory margin + historical rank
3. **`calculate_top_position_performers`** - **Top 5** at each position with ownership in both leagues
4. **`check_historical_records`** - Check if week's performances broke all-time records

### Output Structure (Data-Focused, No Narrative)

```typescript
{
  topTeamScore: {
    score: 145.96,
    teamName: "Team 4",
    manager: "Manager Name",
    league: "NFC",
    topPerformers: [...],
    historicalRank: 3,  // #3 all-time
    isRecord: false
  },
  biggestBlowout: {
    margin: 46.69,
    winner: {...},
    loser: {...},
    historicalRank: 1,  // NEW RECORD!
    isRecord: true
  },
  topPositionPerformers: {
    QB: [
      {
        rank: 1,
        playerName: "Dak Prescott",
        points: 29.28,
        ownership: [
          { league: "AFC", manager: "Manager A", status: "started" },
          { league: "NFC", manager: "Waiver", status: "free_agent" }
        ]
      },
      // ... top 5
    ],
    RB: [...],
    WR: [...],
    TE: [...],
    K: [...],
    DEF: [...]
  }
}
```

---

## 📁 Files to Create/Modify

### New Files

```
apps/web/src/lib/reports/recap/tools/
└── hall-of-fame.ts                     # 3 tools

apps/web/src/lib/reports/recap/prompts/sections/
└── hall-of-fame.ts                     # Section prompt

apps/web/scripts/
└── test-hall-of-fame.ts                # Validation script
```

### Modified Files

```
apps/web/src/lib/reports/recap/tools/registry.ts
  - Register 3 hall of fame tools
```

---

## 🛠️ Implementation Steps

### Step 1: Implement Tools (30 min)

```typescript
// apps/web/src/lib/reports/recap/tools/hall-of-fame.ts

import { sleeperClient } from '@/lib/sleeper/unified-client';
import { LEAGUE_IDS } from '@/lib/constants';
import type { Tool } from './base';

// Tool 1: Top Team Score
export const calculateTopTeamScoreTool: Tool = {
  name: 'calculate_top_team_score',
  description: 'Finds the highest scoring team of the week across both leagues',
  parameters: {
    type: 'object',
    properties: {
      week: { type: 'number', description: 'NFL week number' },
    },
    required: ['week'],
  },
  execute: async (args: { week: number }) => {
    // Fetch matchups from both leagues
    const [afcMatchups, nfcMatchups] = await Promise.all([
      sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, args.week),
      sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, args.week),
    ]);

    const allMatchups = [...afcMatchups, ...nfcMatchups];

    // Find the highest score
    let topScore = 0;
    let topTeam: any = null;
    let topLeagueId = '';

    allMatchups.forEach(matchup => {
      const score = matchup.points || 0;
      if (score > topScore) {
        topScore = score;
        topTeam = matchup;
        topLeagueId = afcMatchups.includes(matchup)
          ? LEAGUE_IDS.AFC
          : LEAGUE_IDS.NFC;
      }
    });

    if (!topTeam) {
      throw new Error('No team scores found');
    }

    // Fetch roster info
    const rosters = await sleeperClient.fetchRostersWithOwners(topLeagueId);
    const roster = rosters.find(r => r.roster_id === topTeam.roster_id);

    // Fetch players for scoring breakdown
    const players = await sleeperClient.fetchAllPlayers();
    const topPerformers = (topTeam.players || [])
      .map((playerId: string) => ({
        playerId,
        name: players[playerId]
          ? `${players[playerId].first_name} ${players[playerId].last_name}`
          : playerId,
        position: players[playerId]?.position || 'UNKNOWN',
        points: topTeam.players_points?.[playerId] || 0,
      }))
      .sort((a: any, b: any) => b.points - a.points)
      .slice(0, 3);

    return {
      score: Math.round(topScore * 100) / 100,
      rosterId: topTeam.roster_id,
      leagueId: topLeagueId,
      league: topLeagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC',
      teamName: roster?.metadata?.team_name || `Team ${topTeam.roster_id}`,
      ownerName: roster?.metadata?.owner_name || 'Unknown',
      topPerformers: topPerformers.map((p: any) => ({
        name: p.name,
        position: p.position,
        points: Math.round(p.points * 100) / 100,
      })),
    };
  },
};

// Tool 2: Biggest Blowout
export const calculateBiggestBlowoutTool: Tool = {
  name: 'calculate_biggest_blowout',
  description: 'Finds the matchup with the largest victory margin',
  parameters: {
    type: 'object',
    properties: {
      week: { type: 'number', description: 'NFL week number' },
    },
    required: ['week'],
  },
  execute: async (args: { week: number }) => {
    const [afcMatchups, nfcMatchups] = await Promise.all([
      sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, args.week),
      sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, args.week),
    ]);

    // Process each league separately
    const findBlowoutInLeague = (matchups: any[], leagueId: string) => {
      let biggestMargin = 0;
      let blowout: any = null;

      for (let i = 0; i < matchups.length; i++) {
        const team1 = matchups[i];
        const team2 = matchups.find(
          (m, idx) => idx !== i && m.matchup_id === team1.matchup_id
        );

        if (!team2) continue;

        const score1 = team1.points || 0;
        const score2 = team2.points || 0;
        const margin = Math.abs(score1 - score2);

        if (margin > biggestMargin) {
          biggestMargin = margin;
          blowout = {
            winner: score1 > score2 ? team1 : team2,
            loser: score1 > score2 ? team2 : team1,
            margin,
            leagueId,
          };
        }
      }

      return blowout;
    };

    const afcBlowout = findBlowoutInLeague(afcMatchups, LEAGUE_IDS.AFC);
    const nfcBlowout = findBlowoutInLeague(nfcMatchups, LEAGUE_IDS.NFC);

    const biggestBlowout =
      (afcBlowout?.margin || 0) > (nfcBlowout?.margin || 0)
        ? afcBlowout
        : nfcBlowout;

    if (!biggestBlowout) {
      throw new Error('No blowouts found');
    }

    // Fetch roster info
    const rosters = await sleeperClient.fetchRostersWithOwners(
      biggestBlowout.leagueId
    );
    const winnerRoster = rosters.find(
      r => r.roster_id === biggestBlowout.winner.roster_id
    );
    const loserRoster = rosters.find(
      r => r.roster_id === biggestBlowout.loser.roster_id
    );

    return {
      margin: Math.round(biggestBlowout.margin * 100) / 100,
      league: biggestBlowout.leagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC',
      winner: {
        score: Math.round(biggestBlowout.winner.points * 100) / 100,
        teamName:
          winnerRoster?.metadata?.team_name ||
          `Team ${biggestBlowout.winner.roster_id}`,
        ownerName: winnerRoster?.metadata?.owner_name || 'Unknown',
      },
      loser: {
        score: Math.round(biggestBlowout.loser.points * 100) / 100,
        teamName:
          loserRoster?.metadata?.team_name ||
          `Team ${biggestBlowout.loser.roster_id}`,
        ownerName: loserRoster?.metadata?.owner_name || 'Unknown',
      },
    };
  },
};

// Tool 3: Top Position Performers
export const calculateTopPositionPerformersTool: Tool = {
  name: 'calculate_top_position_performers',
  description: 'Finds the best player at each position for the week',
  parameters: {
    type: 'object',
    properties: {
      week: { type: 'number', description: 'NFL week number' },
    },
    required: ['week'],
  },
  execute: async (args: { week: number }) => {
    const [afcMatchups, nfcMatchups] = await Promise.all([
      sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, args.week),
      sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, args.week),
    ]);

    const allMatchups = [...afcMatchups, ...nfcMatchups];
    const players = await sleeperClient.fetchAllPlayers();

    // Collect all player performances
    const performances: Array<{
      playerId: string;
      name: string;
      position: string;
      points: number;
      rosterId: number;
      leagueId: string;
    }> = [];

    allMatchups.forEach(matchup => {
      const leagueId = afcMatchups.includes(matchup)
        ? LEAGUE_IDS.AFC
        : LEAGUE_IDS.NFC;

      (matchup.players || []).forEach((playerId: string) => {
        const player = players[playerId];
        if (!player) return;

        performances.push({
          playerId,
          name: `${player.first_name} ${player.last_name}`,
          position: player.position,
          points: matchup.players_points?.[playerId] || 0,
          rosterId: matchup.roster_id,
          leagueId,
        });
      });
    });

    // Find top performer at each position
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
    const topPerformers: Record<string, any> = {};

    for (const position of positions) {
      const positionPerformances = performances.filter(
        p => p.position === position
      );
      if (positionPerformances.length === 0) continue;

      const top = positionPerformances.reduce((best, curr) =>
        curr.points > best.points ? curr : best
      );

      // Get team name
      const rosters = await sleeperClient.fetchRostersWithOwners(top.leagueId);
      const roster = rosters.find(r => r.roster_id === top.rosterId);

      topPerformers[position] = {
        playerName: top.name,
        points: Math.round(top.points * 100) / 100,
        teamName: roster?.metadata?.team_name || `Team ${top.rosterId}`,
        league: top.leagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC',
      };
    }

    return topPerformers;
  },
};
```

### Step 2: Create Section Prompt (10 min)

```typescript
// apps/web/src/lib/reports/recap/prompts/sections/hall-of-fame.ts

export const HALL_OF_FAME_PROMPT = `
You are writing the "Hall of Fame" section celebrating the week's best performances.

## Available Tools

- **calculate_top_team_score**: Highest scoring team of the week
- **calculate_biggest_blowout**: Largest victory margin
- **calculate_top_position_performers**: Best player at each position (QB, RB, WR, TE, K, DEF)

## Your Task

Write 2-3 paragraphs (150-200 words) highlighting:

1. **Top Team Score**: Celebrate the highest scoring team, mention their score and top performers
2. **Biggest Blowout**: Describe the most lopsided victory and the margin
3. **Position Stars**: Highlight the best QB, RB, WR, TE (skip K and DEF if space limited)

## Style Guidelines

- Celebratory and enthusiastic tone
- Use superlatives (dominant, explosive, unstoppable)
- Mention specific point totals
- Keep it concise but impactful

## Output Format

{
  "narrative": "Your 2-3 paragraph narrative",
  "highlights": {
    "topScore": "Team Name - 156.84 pts",
    "biggestBlowout": "Winner 134.2 - Loser 89.4 (44.8 pts)",
    "topQB": "Player Name - 32.5 pts",
    "topRB": "Player Name - 28.3 pts",
    "topWR": "Player Name - 34.1 pts",
    "topTE": "Player Name - 22.7 pts"
  }
}

Call all 3 tools and write the narrative.
`;
```

### Step 3: Create Test Script (5 min)

```typescript
// apps/web/scripts/test-hall-of-fame.ts

import {
  calculateTopTeamScoreTool,
  calculateBiggestBlowoutTool,
  calculateTopPositionPerformersTool,
} from '../src/lib/reports/recap/tools/hall-of-fame';

const testHallOfFame = async (): Promise<void> => {
  console.log('🧪 Testing Hall of Fame Section\n');

  const week = 5;

  try {
    console.log('1. Testing calculate_top_team_score...');
    const topScore = await calculateTopTeamScoreTool.execute({ week });
    console.log('✅ Top Team:', topScore.teamName, '-', topScore.score, 'pts');
    console.log(
      '   Top Performers:',
      topScore.topPerformers
        .slice(0, 3)
        .map((p: any) => `${p.name} (${p.points})`)
        .join(', ')
    );

    console.log('\n2. Testing calculate_biggest_blowout...');
    const blowout = await calculateBiggestBlowoutTool.execute({ week });
    console.log(
      '✅ Biggest Blowout:',
      blowout.winner.teamName,
      blowout.winner.score,
      '-',
      blowout.loser.teamName,
      blowout.loser.score
    );
    console.log('   Margin:', blowout.margin, 'points');

    console.log('\n3. Testing calculate_top_position_performers...');
    const topPerformers = await calculateTopPositionPerformersTool.execute({
      week,
    });
    console.log('✅ Position Stars:');
    Object.entries(topPerformers).forEach(([pos, data]: [string, any]) => {
      console.log(
        `   ${pos}: ${data.playerName} - ${data.points} pts (${data.teamName})`
      );
    });

    console.log('\n✅ All Hall of Fame tools working correctly!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testHallOfFame();
```

---

## ✅ Validation Checklist

**Before marking complete:**

- [ ] All 3 tools implemented
- [ ] Tools execute without errors
- [ ] Test script runs successfully: `npm run test:hall-of-fame`
- [ ] Multi-league processing correct (finds best across both)
- [ ] Section prompt created
- [ ] Tools registered in registry
- [ ] Code follows arrow function pattern

---

## 🎯 Success Criteria

**Task is complete when:**

1. ✅ All 3 Hall of Fame tools implemented
2. ✅ Tools correctly identify week's best performances
3. ✅ Test script validates with Week 5 data
4. ✅ Section prompt template created
5. ✅ Code committed with message:
   `feat(recap): implement hall of fame section (RECAP-011)`

---

## 🔗 Next Task

**RECAP-012: Hall of Shame Section** - Implement tools for weekly lowlights
(worst score, biggest busts, bad beat losses)

---

**Created**: 2025-10-08  
**Completed**: 2025-10-08  
**Status**: ✅ Complete

---

## ✅ Completion Summary

### What Was Built

**Enhanced Hall of Fame Tools (2 main tools):**

1. **`checkAllHistoricalRecordsTool`** - Comprehensive historical analysis
   - Runs week through ALL 68 Hall of Fame categories
   - Compares against 144+ historical matchups
   - Returns all categories where week appears in top 10
   - Identifies new all-time records

2. **`calculateTopPositionPerformersEnhanced`** - Position leaderboards
   - Top 5 performers at each position (QB, RB, WR, TE, K, DEF)
   - Ownership status in BOTH leagues
   - Started/benched/free agent status
   - Manager names and team names

### Week 5 Test Results (Actual Data)

**🏆 7 New All-Time Records Set:**
- Most Points in Loss: Hunter (129.22 pts)
- TE Points: Aman (34.00 pts) 
- Most Exciting Game: Hunter (82.99)
- Highest Combined Score: Akhil C (267.42 pts)
- Highest Combined RB Score: Hunter (110.30 pts)
- Lowest Combined RB Score: Nolan (30.20 pts)
- Highest Combined TE Score: Dhruv (43.30 pts)

**✨ 39 Total Top-10 Appearances** across 68 categories tested

### Files Created/Modified

**New Files:**
```
apps/web/src/lib/reports/recap/tools/hall-of-fame-enhanced.ts  (343 lines)
apps/web/scripts/test-hall-of-fame-enhanced.ts                  (145 lines)
```

**Modified Files:**
```
apps/web/package.json  (added test script)
```

### Key Technical Decisions

1. **Leveraged Existing System**: Instead of reimplementing, we use the complete existing Hall of Fame category system (`getAllCategories()` and `calculateHallOfFameRecords()`)

2. **Data Transformation**: Convert Sleeper matchups to `ProcessedMatchup` format required by Hall of Fame system

3. **Top-10 Filtering**: Only return categories where the week appears in top 10 to keep results focused

4. **Cross-League Ownership**: Check player ownership in both AFC and NFC leagues with started/benched status

### Integration with Existing Systems

- ✅ Uses `@/features/hall-of-fame/` complete category system
- ✅ Uses `hallOfFameDataService` for historical data
- ✅ Uses `getRealNameByRoster()` for manager names
- ✅ Uses unified Sleeper client for API calls

### Next Steps

Apply same enhancements to **Hall of Shame** section (RECAP-012)
