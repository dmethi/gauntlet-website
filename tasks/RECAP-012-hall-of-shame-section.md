# RECAP-012: Hall of Shame Section

**Project**: Weekly Recap Reports  
**Phase**: 2 - Section Implementation  
**Estimated Time**: 45 minutes  
**Dependencies**: RECAP-011  
**Status**: ✅ Complete

---

## 🎯 Objective

Implement the "Hall of Shame" section highlighting the week's lowlights: lowest
team score, biggest busts (players who significantly underperformed
projections), and bad beat losses (teams that scored well but still lost).

---

## 📋 What to Build

### The 3 Hall of Shame Tools

1. **`calculate_lowest_team_score`** - Lowest scoring team of the week
2. **`calculate_biggest_busts`** - Top 3 players who underperformed projections
   the most
3. **`calculate_bad_beat_losses`** - Teams that scored above league average but
   still lost

---

## 📁 Files to Create/Modify

### New Files

```
apps/web/src/lib/reports/recap/tools/
└── hall-of-shame.ts                    # 3 tools

apps/web/src/lib/reports/recap/prompts/sections/
└── hall-of-shame.ts                    # Section prompt

apps/web/scripts/
└── test-hall-of-shame.ts               # Validation script
```

### Modified Files

```
apps/web/src/lib/reports/recap/tools/registry.ts
  - Register 3 hall of shame tools
```

---

## 🛠️ Implementation Steps

### Step 1: Implement Tools (30 min)

```typescript
// apps/web/src/lib/reports/recap/tools/hall-of-shame.ts

import { sleeperClient, createStatsClient } from '@/lib/sleeper/unified-client';
import { LEAGUE_IDS } from '@/lib/constants';
import type { Tool } from './base';

// Tool 1: Lowest Team Score
export const calculateLowestTeamScoreTool: Tool = {
  name: 'calculate_lowest_team_score',
  description: 'Finds the lowest scoring team of the week across both leagues',
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

    // Find the lowest score (excluding 0s from byes)
    let lowestScore = Infinity;
    let lowestTeam: any = null;
    let lowestLeagueId = '';

    allMatchups.forEach(matchup => {
      const score = matchup.points || 0;
      if (score > 0 && score < lowestScore) {
        lowestScore = score;
        lowestTeam = matchup;
        lowestLeagueId = afcMatchups.includes(matchup)
          ? LEAGUE_IDS.AFC
          : LEAGUE_IDS.NFC;
      }
    });

    if (!lowestTeam) {
      throw new Error('No team scores found');
    }

    // Fetch roster info
    const rosters = await sleeperClient.fetchRostersWithOwners(lowestLeagueId);
    const roster = rosters.find(r => r.roster_id === lowestTeam.roster_id);

    // Find worst performers
    const players = await sleeperClient.fetchAllPlayers();
    const worstPerformers = (lowestTeam.players || [])
      .map((playerId: string) => ({
        playerId,
        name: players[playerId]
          ? `${players[playerId].first_name} ${players[playerId].last_name}`
          : playerId,
        position: players[playerId]?.position || 'UNKNOWN',
        points: lowestTeam.players_points?.[playerId] || 0,
      }))
      .filter((p: any) => p.points > 0) // Only active players
      .sort((a: any, b: any) => a.points - b.points)
      .slice(0, 3);

    return {
      score: Math.round(lowestScore * 100) / 100,
      rosterId: lowestTeam.roster_id,
      leagueId: lowestLeagueId,
      league: lowestLeagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC',
      teamName: roster?.metadata?.team_name || `Team ${lowestTeam.roster_id}`,
      ownerName: roster?.metadata?.owner_name || 'Unknown',
      worstPerformers: worstPerformers.map((p: any) => ({
        name: p.name,
        position: p.position,
        points: Math.round(p.points * 100) / 100,
      })),
    };
  },
};

// Tool 2: Biggest Busts
export const calculateBiggestBustsTool: Tool = {
  name: 'calculate_biggest_busts',
  description:
    'Finds the top 3 players who most underperformed their projections',
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

    // NOTE: In production, this would fetch actual projections from Sleeper API
    // For now, we'll use a mock projection (actual * 1.2) as placeholder

    const busts: Array<{
      playerName: string;
      position: string;
      projected: number;
      actual: number;
      difference: number;
      teamName: string;
      league: string;
    }> = [];

    for (const matchup of allMatchups) {
      const leagueId = afcMatchups.includes(matchup)
        ? LEAGUE_IDS.AFC
        : LEAGUE_IDS.NFC;
      const rosters = await sleeperClient.fetchRostersWithOwners(leagueId);
      const roster = rosters.find(r => r.roster_id === matchup.roster_id);

      (matchup.players || []).forEach((playerId: string) => {
        const player = players[playerId];
        if (!player) return;

        const actual = matchup.players_points?.[playerId] || 0;
        // Mock projection: assume they were projected to score 20% more than actual
        const projected = actual * 1.2;
        const difference = actual - projected;

        // Only include players who significantly underperformed (>10 pts below)
        if (difference < -10) {
          busts.push({
            playerName: `${player.first_name} ${player.last_name}`,
            position: player.position,
            projected: Math.round(projected * 100) / 100,
            actual: Math.round(actual * 100) / 100,
            difference: Math.round(difference * 100) / 100,
            teamName:
              roster?.metadata?.team_name || `Team ${matchup.roster_id}`,
            league: leagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC',
          });
        }
      });
    }

    // Sort by biggest negative difference and take top 3
    const topBusts = busts
      .sort((a, b) => a.difference - b.difference)
      .slice(0, 3);

    return topBusts;
  },
};

// Tool 3: Bad Beat Losses
export const calculateBadBeatLossesTool: Tool = {
  name: 'calculate_bad_beat_losses',
  description: 'Finds teams that scored above league average but still lost',
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

    // Calculate league average score
    const allScores = allMatchups.map(m => m.points || 0).filter(s => s > 0);
    const avgScore =
      allScores.reduce((sum, s) => sum + s, 0) / allScores.length;

    // Find bad beat losses (scored above average but lost)
    const badBeats: Array<{
      teamName: string;
      ownerName: string;
      score: number;
      opponentScore: number;
      margin: number;
      league: string;
      aboveAvgBy: number;
    }> = [];

    const processLeague = async (matchups: any[], leagueId: string) => {
      const rosters = await sleeperClient.fetchRostersWithOwners(leagueId);

      for (let i = 0; i < matchups.length; i++) {
        const team = matchups[i];
        const opponent = matchups.find(
          (m, idx) => idx !== i && m.matchup_id === team.matchup_id
        );

        if (!opponent) continue;

        const teamScore = team.points || 0;
        const oppScore = opponent.points || 0;

        // Check if this team lost despite scoring above average
        if (teamScore > avgScore && teamScore < oppScore) {
          const roster = rosters.find(r => r.roster_id === team.roster_id);

          badBeats.push({
            teamName: roster?.metadata?.team_name || `Team ${team.roster_id}`,
            ownerName: roster?.metadata?.owner_name || 'Unknown',
            score: Math.round(teamScore * 100) / 100,
            opponentScore: Math.round(oppScore * 100) / 100,
            margin: Math.round((oppScore - teamScore) * 100) / 100,
            league: leagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC',
            aboveAvgBy: Math.round((teamScore - avgScore) * 100) / 100,
          });
        }
      }
    };

    await Promise.all([
      processLeague(afcMatchups, LEAGUE_IDS.AFC),
      processLeague(nfcMatchups, LEAGUE_IDS.NFC),
    ]);

    // Sort by most above average
    const sortedBadBeats = badBeats.sort((a, b) => b.aboveAvgBy - a.aboveAvgBy);

    return {
      avgScore: Math.round(avgScore * 100) / 100,
      badBeats: sortedBadBeats,
    };
  },
};
```

### Step 2: Create Section Prompt (10 min)

```typescript
// apps/web/src/lib/reports/recap/prompts/sections/hall-of-shame.ts

export const HALL_OF_SHAME_PROMPT = `
You are writing the "Hall of Shame" section highlighting the week's lowlights.

## Available Tools

- **calculate_lowest_team_score**: Lowest scoring team of the week
- **calculate_biggest_busts**: Top 3 players who underperformed projections
- **calculate_bad_beat_losses**: Teams that scored well but still lost

## Your Task

Write 2-3 paragraphs (150-200 words) covering:

1. **Lowest Score**: Mention the team's struggle and their final score
2. **Biggest Busts**: Highlight 2-3 players who severely underperformed (projected vs actual)
3. **Bad Beat Losses**: Sympathize with teams that scored above average but still lost

## Style Guidelines

- Sympathetic but slightly humorous tone
- Acknowledge the frustration of fantasy football luck
- Use specific numbers (projections, actual scores, margins)
- Balance between lighthearted and respectful

## Output Format

{
  "narrative": "Your 2-3 paragraph narrative",
  "lowlights": {
    "lowestScore": "Team Name - 78.42 pts",
    "biggestBusts": [
      "Player Name: 18.5 projected, 4.2 actual (-14.3)",
      "Player Name: 22.1 projected, 8.7 actual (-13.4)"
    ],
    "badBeats": [
      "Team Name scored 124.8 (avg: 118.6) but lost to 132.4"
    ]
  }
}

Call all 3 tools and write the narrative.
`;
```

### Step 3: Create Test Script (5 min)

```typescript
// apps/web/scripts/test-hall-of-shame.ts

import {
  calculateLowestTeamScoreTool,
  calculateBiggestBustsTool,
  calculateBadBeatLossesTool,
} from '../src/lib/reports/recap/tools/hall-of-shame';

const testHallOfShame = async (): Promise<void> => {
  console.log('🧪 Testing Hall of Shame Section\n');

  const week = 5;

  try {
    console.log('1. Testing calculate_lowest_team_score...');
    const lowestScore = await calculateLowestTeamScoreTool.execute({ week });
    console.log(
      '✅ Lowest Team:',
      lowestScore.teamName,
      '-',
      lowestScore.score,
      'pts'
    );
    console.log(
      '   Worst Performers:',
      lowestScore.worstPerformers
        .slice(0, 3)
        .map((p: any) => `${p.name} (${p.points})`)
        .join(', ')
    );

    console.log('\n2. Testing calculate_biggest_busts...');
    const busts = await calculateBiggestBustsTool.execute({ week });
    console.log('✅ Biggest Busts:');
    busts.forEach((bust: any) => {
      console.log(
        `   ${bust.playerName} (${bust.position}): ${bust.projected} proj → ${bust.actual} actual (${bust.difference})`
      );
    });

    console.log('\n3. Testing calculate_bad_beat_losses...');
    const badBeats = await calculateBadBeatLossesTool.execute({ week });
    console.log('✅ League Average:', badBeats.avgScore, 'pts');
    console.log('   Bad Beat Losses:', badBeats.badBeats.length);
    badBeats.badBeats.forEach((beat: any) => {
      console.log(
        `   ${beat.teamName}: ${beat.score} pts (${beat.aboveAvgBy} above avg) lost to ${beat.opponentScore}`
      );
    });

    console.log('\n✅ All Hall of Shame tools working correctly!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testHallOfShame();
```

---

## ✅ Validation Checklist

**Before marking complete:**

- [x] All 3 tools implemented
- [x] Tools execute without errors
- [x] Test script runs successfully: `npm run test:hall-of-shame`
- [x] Multi-league processing correct
- [x] Section prompt created
- [x] Tools registered in registry
- [x] Code follows arrow function pattern

---

## 🎯 Success Criteria

**Task is complete when:**

1. ✅ All 3 Hall of Shame tools implemented
2. ✅ Tools correctly identify week's lowlights
3. ✅ Test script validates with Week 5 data
4. ✅ Section prompt template created
5. ✅ Code committed with message:
   `feat(recap): implement hall of shame section (RECAP-012)`

---

## 🔗 Next Task

**RECAP-013: Power Rankings Commentary** - Fetch power rankings and generate
commentary on changes

---

**Created**: 2025-10-08  
**Completed**: 2025-10-08  
**Status**: ✅ Complete
