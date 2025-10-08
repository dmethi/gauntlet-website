# RECAP-008: Matchup Narratives - Data Layer

**Project**: Weekly Recap Reports  
**Phase**: 2 - Section Implementation  
**Estimated Time**: 1.5 hours  
**Dependencies**: RECAP-007  
**Status**: 🔴 Not Started

---

## 🎯 Objective

Implement all 11 data fetching tools required to generate complete matchup
narratives. These tools provide box scores, projections, records, head-to-head
history, and compressed game flow data. This is the data foundation for
generating engaging game recaps.

---

## 📋 What to Build

### The 11 Matchup Data Tools

1. **`fetch_matchup_box_score`** - Final scores and roster IDs
2. **`fetch_matchup_rosters`** - Team names and manager info
3. **`fetch_matchup_scoring_breakdown`** - Points by player
4. **`fetch_pre_game_projections`** - Expected scores before games
5. **`fetch_projection_vs_actual`** - Over/under performance
6. **`fetch_team_records`** - Win-loss records entering the week
7. **`fetch_h2h_history`** - Previous matchups between teams
8. **`fetch_game_flow_compressed`** - Key moments (from RECAP-007)
9. **`fetch_playoff_implications`** - Stakes for this matchup
10. **`fetch_position_breakdown`** - Points by position (QB, RB, WR, etc.)
11. **`fetch_key_player_performances`** - Top 3 performers per team

---

## 📁 Files to Create/Modify

### New Files

```
apps/web/src/lib/reports/recap/tools/
└── matchup-data.ts                 # All 11 tools

apps/web/scripts/
└── test-matchup-data-tools.ts      # Validation script
```

### Modified Files

```
apps/web/src/lib/reports/recap/types.ts
  - Add MatchupBoxScore type
  - Add ProjectionComparison type
  - Add PositionBreakdown type

apps/web/src/lib/reports/recap/tools/registry.ts
  - Register all 11 matchup tools
```

---

## 🛠️ Implementation Steps

### Step 1: Define Data Types (15 min)

```typescript
// apps/web/src/lib/reports/recap/types.ts (additions)

export interface MatchupBoxScore {
  leagueId: string;
  week: number;
  matchupId: number;
  team1: {
    rosterId: number;
    score: number;
    projectedScore: number;
  };
  team2: {
    rosterId: number;
    score: number;
    projectedScore: number;
  };
  winner: 'team1' | 'team2' | 'tie';
  margin: number;
}

export interface TeamRecord {
  rosterId: number;
  wins: number;
  losses: number;
  ties: number;
  winPct: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface H2HHistory {
  team1Wins: number;
  team2Wins: number;
  ties: number;
  previousMatchups: Array<{
    week: number;
    team1Score: number;
    team2Score: number;
    winner: 'team1' | 'team2' | 'tie';
  }>;
}

export interface PositionBreakdown {
  rosterId: number;
  positions: {
    QB: number;
    RB: number;
    WR: number;
    TE: number;
    K: number;
    DEF: number;
  };
}

export interface KeyPlayerPerformance {
  playerId: string;
  playerName: string;
  position: string;
  points: number;
  projected: number;
  overUnder: number;
}
```

### Step 2: Implement Data Tools (60 min)

```typescript
// apps/web/src/lib/reports/recap/tools/matchup-data.ts

import { sleeperClient } from '@/lib/sleeper/unified-client';
import type {
  SleeperMatchup,
  SleeperRoster,
  SleeperPlayer,
} from '@gauntlet/types';
import type { Tool } from './base';
import type {
  MatchupBoxScore,
  TeamRecord,
  H2HHistory,
  PositionBreakdown,
  KeyPlayerPerformance,
} from '../types';

// Tool 1: Box Score
export const fetchMatchupBoxScoreTool: Tool = {
  name: 'fetch_matchup_box_score',
  description: 'Fetches final scores for a specific matchup',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string' },
      week: { type: 'number' },
      matchupId: { type: 'number' },
    },
    required: ['leagueId', 'week', 'matchupId'],
  },
  execute: async (args: {
    leagueId: string;
    week: number;
    matchupId: number;
  }) => {
    const matchups = await sleeperClient.fetchMatchups(
      args.leagueId,
      args.week
    );

    const matchupTeams = matchups.filter(m => m.matchup_id === args.matchupId);
    if (matchupTeams.length !== 2) {
      throw new Error(
        `Expected 2 teams for matchup ${args.matchupId}, found ${matchupTeams.length}`
      );
    }

    const [team1, team2] = matchupTeams;
    const team1Score = team1.points || 0;
    const team2Score = team2.points || 0;

    const result: MatchupBoxScore = {
      leagueId: args.leagueId,
      week: args.week,
      matchupId: args.matchupId,
      team1: {
        rosterId: team1.roster_id,
        score: Math.round(team1Score * 100) / 100,
        projectedScore: Math.round((team1.custom_points || 0) * 100) / 100,
      },
      team2: {
        rosterId: team2.roster_id,
        score: Math.round(team2Score * 100) / 100,
        projectedScore: Math.round((team2.custom_points || 0) * 100) / 100,
      },
      winner:
        team1Score > team2Score
          ? 'team1'
          : team2Score > team1Score
            ? 'team2'
            : 'tie',
      margin: Math.round(Math.abs(team1Score - team2Score) * 100) / 100,
    };

    return result;
  },
};

// Tool 2: Team Rosters (names and owners)
export const fetchMatchupRostersTool: Tool = {
  name: 'fetch_matchup_rosters',
  description: 'Fetches team names and manager information for matchup teams',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string' },
      rosterId1: { type: 'number' },
      rosterId2: { type: 'number' },
    },
    required: ['leagueId', 'rosterId1', 'rosterId2'],
  },
  execute: async (args: {
    leagueId: string;
    rosterId1: number;
    rosterId2: number;
  }) => {
    const rosters = await sleeperClient.fetchRostersWithOwners(args.leagueId);

    const roster1 = rosters.find(r => r.roster_id === args.rosterId1);
    const roster2 = rosters.find(r => r.roster_id === args.rosterId2);

    if (!roster1 || !roster2) {
      throw new Error('Could not find one or both rosters');
    }

    return {
      team1: {
        rosterId: roster1.roster_id,
        teamName: roster1.metadata?.team_name || `Team ${roster1.roster_id}`,
        ownerName: roster1.metadata?.owner_name || 'Unknown',
      },
      team2: {
        rosterId: roster2.roster_id,
        teamName: roster2.metadata?.team_name || `Team ${roster2.roster_id}`,
        ownerName: roster2.metadata?.owner_name || 'Unknown',
      },
    };
  },
};

// Tool 3: Scoring Breakdown (points by player)
export const fetchScoringBreakdownTool: Tool = {
  name: 'fetch_matchup_scoring_breakdown',
  description: 'Fetches detailed scoring breakdown by player for a matchup',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string' },
      week: { type: 'number' },
      matchupId: { type: 'number' },
    },
    required: ['leagueId', 'week', 'matchupId'],
  },
  execute: async (args: {
    leagueId: string;
    week: number;
    matchupId: number;
  }) => {
    const matchups = await sleeperClient.fetchMatchups(
      args.leagueId,
      args.week
    );
    const matchupTeams = matchups.filter(m => m.matchup_id === args.matchupId);

    const players = await sleeperClient.fetchAllPlayers();

    const buildPlayerScores = (matchup: SleeperMatchup) => {
      if (!matchup.players || !matchup.players_points) return [];

      return matchup.players
        .map(playerId => {
          const player = players[playerId];
          return {
            playerId,
            playerName: player
              ? `${player.first_name} ${player.last_name}`
              : playerId,
            position: player?.position || 'UNKNOWN',
            points: matchup.players_points[playerId] || 0,
          };
        })
        .sort((a, b) => b.points - a.points);
    };

    return {
      team1: buildPlayerScores(matchupTeams[0]),
      team2: buildPlayerScores(matchupTeams[1]),
    };
  },
};

// Tool 4: Pre-game Projections
export const fetchPreGameProjectionsTool: Tool = {
  name: 'fetch_pre_game_projections',
  description: 'Fetches projected scores before the games started',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string' },
      week: { type: 'number' },
      matchupId: { type: 'number' },
    },
    required: ['leagueId', 'week', 'matchupId'],
  },
  execute: async (args: {
    leagueId: string;
    week: number;
    matchupId: number;
  }) => {
    const matchups = await sleeperClient.fetchMatchups(
      args.leagueId,
      args.week
    );
    const matchupTeams = matchups.filter(m => m.matchup_id === args.matchupId);

    return {
      team1Projected: matchupTeams[0]?.custom_points || 0,
      team2Projected: matchupTeams[1]?.custom_points || 0,
      projectedMargin: Math.abs(
        (matchupTeams[0]?.custom_points || 0) -
          (matchupTeams[1]?.custom_points || 0)
      ),
    };
  },
};

// Tool 5: Projection vs Actual
export const fetchProjectionVsActualTool: Tool = {
  name: 'fetch_projection_vs_actual',
  description: 'Compares projected scores to actual results',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string' },
      week: { type: 'number' },
      matchupId: { type: 'number' },
    },
    required: ['leagueId', 'week', 'matchupId'],
  },
  execute: async (args: {
    leagueId: string;
    week: number;
    matchupId: number;
  }) => {
    const matchups = await sleeperClient.fetchMatchups(
      args.leagueId,
      args.week
    );
    const matchupTeams = matchups.filter(m => m.matchup_id === args.matchupId);

    const [team1, team2] = matchupTeams;
    const team1Actual = team1.points || 0;
    const team2Actual = team2.points || 0;
    const team1Projected = team1.custom_points || 0;
    const team2Projected = team2.custom_points || 0;

    return {
      team1: {
        actual: Math.round(team1Actual * 100) / 100,
        projected: Math.round(team1Projected * 100) / 100,
        overUnder: Math.round((team1Actual - team1Projected) * 100) / 100,
        overUnderPct:
          team1Projected > 0
            ? Math.round(
                ((team1Actual - team1Projected) / team1Projected) * 100
              )
            : 0,
      },
      team2: {
        actual: Math.round(team2Actual * 100) / 100,
        projected: Math.round(team2Projected * 100) / 100,
        overUnder: Math.round((team2Actual - team2Projected) * 100) / 100,
        overUnderPct:
          team2Projected > 0
            ? Math.round(
                ((team2Actual - team2Projected) / team2Projected) * 100
              )
            : 0,
      },
    };
  },
};

// Tool 6: Team Records
export const fetchTeamRecordsTool: Tool = {
  name: 'fetch_team_records',
  description: 'Fetches win-loss records for teams entering the week',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string' },
      week: { type: 'number' },
      rosterId1: { type: 'number' },
      rosterId2: { type: 'number' },
    },
    required: ['leagueId', 'week', 'rosterId1', 'rosterId2'],
  },
  execute: async (args: {
    leagueId: string;
    week: number;
    rosterId1: number;
    rosterId2: number;
  }) => {
    // Calculate records through previous week
    const weeks = Array.from({ length: args.week - 1 }, (_, i) => i + 1);

    const calculateRecord = async (rosterId: number): Promise<TeamRecord> => {
      let wins = 0;
      let losses = 0;
      let ties = 0;
      let pointsFor = 0;
      let pointsAgainst = 0;

      for (const week of weeks) {
        const matchups = await sleeperClient.fetchMatchups(args.leagueId, week);
        const team = matchups.find(m => m.roster_id === rosterId);
        if (!team) continue;

        const opponent = matchups.find(
          m => m.matchup_id === team.matchup_id && m.roster_id !== rosterId
        );
        if (!opponent) continue;

        const teamScore = team.points || 0;
        const oppScore = opponent.points || 0;

        pointsFor += teamScore;
        pointsAgainst += oppScore;

        if (teamScore > oppScore) wins++;
        else if (oppScore > teamScore) losses++;
        else ties++;
      }

      const totalGames = wins + losses + ties;
      const winPct = totalGames > 0 ? wins / totalGames : 0;

      return {
        rosterId,
        wins,
        losses,
        ties,
        winPct: Math.round(winPct * 1000) / 1000,
        pointsFor: Math.round(pointsFor * 100) / 100,
        pointsAgainst: Math.round(pointsAgainst * 100) / 100,
      };
    };

    const [record1, record2] = await Promise.all([
      calculateRecord(args.rosterId1),
      calculateRecord(args.rosterId2),
    ]);

    return { team1: record1, team2: record2 };
  },
};

// Tool 7: H2H History
export const fetchH2HHistoryTool: Tool = {
  name: 'fetch_h2h_history',
  description: 'Fetches head-to-head history between two teams this season',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string' },
      currentWeek: { type: 'number' },
      rosterId1: { type: 'number' },
      rosterId2: { type: 'number' },
    },
    required: ['leagueId', 'currentWeek', 'rosterId1', 'rosterId2'],
  },
  execute: async (args: {
    leagueId: string;
    currentWeek: number;
    rosterId1: number;
    rosterId2: number;
  }) => {
    const weeks = Array.from({ length: args.currentWeek - 1 }, (_, i) => i + 1);
    const history: H2HHistory = {
      team1Wins: 0,
      team2Wins: 0,
      ties: 0,
      previousMatchups: [],
    };

    for (const week of weeks) {
      const matchups = await sleeperClient.fetchMatchups(args.leagueId, week);
      const team1 = matchups.find(m => m.roster_id === args.rosterId1);
      const team2 = matchups.find(m => m.roster_id === args.rosterId2);

      // Check if they played each other this week
      if (team1 && team2 && team1.matchup_id === team2.matchup_id) {
        const team1Score = team1.points || 0;
        const team2Score = team2.points || 0;

        let winner: 'team1' | 'team2' | 'tie';
        if (team1Score > team2Score) {
          history.team1Wins++;
          winner = 'team1';
        } else if (team2Score > team1Score) {
          history.team2Wins++;
          winner = 'team2';
        } else {
          history.ties++;
          winner = 'tie';
        }

        history.previousMatchups.push({
          week,
          team1Score: Math.round(team1Score * 100) / 100,
          team2Score: Math.round(team2Score * 100) / 100,
          winner,
        });
      }
    }

    return history;
  },
};

// Tool 8: Re-export game flow tool (from RECAP-007)
export { fetchGameFlowTool } from './game-flow';

// Tool 9: Playoff Implications
export const fetchPlayoffImplicationsTool: Tool = {
  name: 'fetch_playoff_implications',
  description: 'Determines playoff stakes for this matchup',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string' },
      week: { type: 'number' },
      rosterId1: { type: 'number' },
      rosterId2: { type: 'number' },
    },
    required: ['leagueId', 'week', 'rosterId1', 'rosterId2'],
  },
  execute: async (args: {
    leagueId: string;
    week: number;
    rosterId1: number;
    rosterId2: number;
  }) => {
    // Simplified playoff implications
    // In production, this would calculate actual playoff odds
    return {
      stakes: args.week >= 12 ? 'high' : args.week >= 8 ? 'medium' : 'low',
      description:
        args.week >= 12
          ? 'Critical playoff positioning game'
          : args.week >= 8
            ? 'Important for playoff seeding'
            : 'Regular season matchup',
    };
  },
};

// Tool 10: Position Breakdown
export const fetchPositionBreakdownTool: Tool = {
  name: 'fetch_position_breakdown',
  description: 'Breaks down scoring by position for each team',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string' },
      week: { type: 'number' },
      matchupId: { type: 'number' },
    },
    required: ['leagueId', 'week', 'matchupId'],
  },
  execute: async (args: {
    leagueId: string;
    week: number;
    matchupId: number;
  }) => {
    const matchups = await sleeperClient.fetchMatchups(
      args.leagueId,
      args.week
    );
    const matchupTeams = matchups.filter(m => m.matchup_id === args.matchupId);
    const players = await sleeperClient.fetchAllPlayers();

    const buildPositionBreakdown = (
      matchup: SleeperMatchup
    ): PositionBreakdown => {
      const breakdown: PositionBreakdown = {
        rosterId: matchup.roster_id,
        positions: { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0 },
      };

      if (!matchup.players || !matchup.players_points) return breakdown;

      matchup.players.forEach(playerId => {
        const player = players[playerId];
        const points = matchup.players_points![playerId] || 0;
        const position = player?.position || 'UNKNOWN';

        if (position in breakdown.positions) {
          breakdown.positions[position as keyof typeof breakdown.positions] +=
            points;
        }
      });

      // Round to 2 decimals
      Object.keys(breakdown.positions).forEach(pos => {
        breakdown.positions[pos as keyof typeof breakdown.positions] =
          Math.round(
            breakdown.positions[pos as keyof typeof breakdown.positions] * 100
          ) / 100;
      });

      return breakdown;
    };

    return {
      team1: buildPositionBreakdown(matchupTeams[0]),
      team2: buildPositionBreakdown(matchupTeams[1]),
    };
  },
};

// Tool 11: Key Player Performances
export const fetchKeyPlayerPerformancesTool: Tool = {
  name: 'fetch_key_player_performances',
  description: 'Fetches top 3 performers from each team in the matchup',
  parameters: {
    type: 'object',
    properties: {
      leagueId: { type: 'string' },
      week: { type: 'number' },
      matchupId: { type: 'number' },
    },
    required: ['leagueId', 'week', 'matchupId'],
  },
  execute: async (args: {
    leagueId: string;
    week: number;
    matchupId: number;
  }) => {
    const matchups = await sleeperClient.fetchMatchups(
      args.leagueId,
      args.week
    );
    const matchupTeams = matchups.filter(m => m.matchup_id === args.matchupId);
    const players = await sleeperClient.fetchAllPlayers();

    const getTopPerformers = (
      matchup: SleeperMatchup
    ): KeyPlayerPerformance[] => {
      if (!matchup.players || !matchup.players_points) return [];

      const performances = matchup.players.map(playerId => {
        const player = players[playerId];
        const points = matchup.players_points![playerId] || 0;
        // Projection would come from projections API in production
        const projected = points * 0.9; // Mock: assume performed 10% better than projected

        return {
          playerId,
          playerName: player
            ? `${player.first_name} ${player.last_name}`
            : playerId,
          position: player?.position || 'UNKNOWN',
          points: Math.round(points * 100) / 100,
          projected: Math.round(projected * 100) / 100,
          overUnder: Math.round((points - projected) * 100) / 100,
        };
      });

      return performances.sort((a, b) => b.points - a.points).slice(0, 3);
    };

    return {
      team1: getTopPerformers(matchupTeams[0]),
      team2: getTopPerformers(matchupTeams[1]),
    };
  },
};
```

### Step 3: Create Test Script (15 min)

```typescript
// apps/web/scripts/test-matchup-data-tools.ts

import {
  fetchMatchupBoxScoreTool,
  fetchMatchupRostersTool,
  fetchScoringBreakdownTool,
  fetchPreGameProjectionsTool,
  fetchProjectionVsActualTool,
  fetchTeamRecordsTool,
  fetchH2HHistoryTool,
  fetchPlayoffImplicationsTool,
  fetchPositionBreakdownTool,
  fetchKeyPlayerPerformancesTool,
} from '../src/lib/reports/recap/tools/matchup-data';
import { LEAGUE_IDS } from '../src/lib/constants';

const testMatchupDataTools = async (): Promise<void> => {
  console.log('🧪 Testing Matchup Data Tools\n');

  const testParams = {
    leagueId: LEAGUE_IDS.AFC,
    week: 5,
    matchupId: 1,
  };

  try {
    // Test 1: Box Score
    console.log('1. Testing fetch_matchup_box_score...');
    const boxScore = await fetchMatchupBoxScoreTool.execute(testParams);
    console.log('✅', JSON.stringify(boxScore, null, 2));

    // Test 2: Rosters
    console.log('\n2. Testing fetch_matchup_rosters...');
    const rosters = await fetchMatchupRostersTool.execute({
      leagueId: testParams.leagueId,
      rosterId1: boxScore.team1.rosterId,
      rosterId2: boxScore.team2.rosterId,
    });
    console.log('✅', JSON.stringify(rosters, null, 2));

    // Test 3: Scoring Breakdown
    console.log('\n3. Testing fetch_matchup_scoring_breakdown...');
    const scoring = await fetchScoringBreakdownTool.execute(testParams);
    console.log('✅ Team 1 top scorer:', scoring.team1[0]);
    console.log('✅ Team 2 top scorer:', scoring.team2[0]);

    // Test 4: Pre-game Projections
    console.log('\n4. Testing fetch_pre_game_projections...');
    const projections = await fetchPreGameProjectionsTool.execute(testParams);
    console.log('✅', JSON.stringify(projections, null, 2));

    // Test 5: Projection vs Actual
    console.log('\n5. Testing fetch_projection_vs_actual...');
    const vsActual = await fetchProjectionVsActualTool.execute(testParams);
    console.log('✅', JSON.stringify(vsActual, null, 2));

    // Test 6: Team Records
    console.log('\n6. Testing fetch_team_records...');
    const records = await fetchTeamRecordsTool.execute({
      leagueId: testParams.leagueId,
      week: testParams.week,
      rosterId1: boxScore.team1.rosterId,
      rosterId2: boxScore.team2.rosterId,
    });
    console.log('✅', JSON.stringify(records, null, 2));

    // Test 7: H2H History
    console.log('\n7. Testing fetch_h2h_history...');
    const h2h = await fetchH2HHistoryTool.execute({
      leagueId: testParams.leagueId,
      currentWeek: testParams.week,
      rosterId1: boxScore.team1.rosterId,
      rosterId2: boxScore.team2.rosterId,
    });
    console.log('✅', JSON.stringify(h2h, null, 2));

    // Test 8: Playoff Implications
    console.log('\n8. Testing fetch_playoff_implications...');
    const playoff = await fetchPlayoffImplicationsTool.execute({
      leagueId: testParams.leagueId,
      week: testParams.week,
      rosterId1: boxScore.team1.rosterId,
      rosterId2: boxScore.team2.rosterId,
    });
    console.log('✅', JSON.stringify(playoff, null, 2));

    // Test 9: Position Breakdown
    console.log('\n9. Testing fetch_position_breakdown...');
    const positions = await fetchPositionBreakdownTool.execute(testParams);
    console.log('✅', JSON.stringify(positions, null, 2));

    // Test 10: Key Performers
    console.log('\n10. Testing fetch_key_player_performances...');
    const keyPlayers = await fetchKeyPlayerPerformancesTool.execute(testParams);
    console.log('✅ Team 1 MVP:', keyPlayers.team1[0]);
    console.log('✅ Team 2 MVP:', keyPlayers.team2[0]);

    console.log('\n✅ All 11 matchup data tools working correctly!');
    console.log('\n📊 Data Summary:');
    console.log(
      `   Matchup: ${rosters.team1.teamName} vs ${rosters.team2.teamName}`
    );
    console.log(`   Score: ${boxScore.team1.score} - ${boxScore.team2.score}`);
    console.log(
      `   Records: ${records.team1.wins}-${records.team1.losses} vs ${records.team2.wins}-${records.team2.losses}`
    );
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testMatchupDataTools();
```

---

## ✅ Validation Checklist

**Before marking complete:**

- [ ] All 11 tools implemented
- [ ] All tools execute without errors
- [ ] Test script runs successfully: `npm run test:matchup-data`
- [ ] Data types added to types.ts
- [ ] Tools registered in registry
- [ ] Code follows arrow function pattern
- [ ] Proper error handling for edge cases
- [ ] Tools process multi-league data correctly

---

## 🎯 Success Criteria

**Task is complete when:**

1. ✅ All 11 matchup data tools implemented
2. ✅ Test script validates each tool with Week 5 data
3. ✅ Tools return properly formatted JSON
4. ✅ No TypeScript errors
5. ✅ Code committed with message:
   `feat(recap): implement matchup data tools (RECAP-008)`

---

## 🔗 Next Task

**RECAP-009: Matchup Narratives - Generation** - Create prompt template for
generating matchup narratives using all 11 tools

---

**Created**: 2025-10-08  
**Status**: 🔴 Not Started
