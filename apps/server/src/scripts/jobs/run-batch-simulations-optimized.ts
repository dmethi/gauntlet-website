#!/usr/bin/env tsx
/**
 * OPTIMIZED VERSION: Minimal database connection time
 *
 * Strategy:
 * 1. Fetch everything from Sleeper API (no DB needed)
 * 2. Run simulations in memory
 * 3. Connect to DB only for final write
 * 4. Disconnect immediately
 *
 * Result: DB compute time reduced from minutes to seconds!
 */

import { simulateMatchupProbabilityFromPlayers } from '@gauntlet/sim-engine/src/index.js';
import { PrismaClient } from '@prisma/client';

// Types
interface SimulationResult {
  leagueId: string;
  week: number;
  matchupId: number;
  rosterAId: number;
  rosterBId: number;
  simulation: any;
  playerSimulations: any[];
}

/**
 * Fetch everything we need from Sleeper API - NO DATABASE NEEDED!
 */
async function fetchAllDataFromSleeper(leagueIds: string[], week: number) {
  const allData: any[] = [];

  for (const leagueId of leagueIds) {
    console.log(`📡 Fetching data for league ${leagueId} from Sleeper API...`);

    // Fetch all data in parallel from Sleeper
    const [league, rosters, matchups, projections] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${leagueId}`).then(r => r.json()),
      fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`).then(r => r.json()),
      fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`).then(r => r.json()),
      fetch(
        `https://api.sleeper.com/projections/nfl/2025/${week}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE&position[]=K&position[]=DEF`
      ).then(r => r.json()),
    ]);

    console.log(`📊 League ${leagueId} API responses:`, {
      league: league ? 'OK' : 'NULL',
      rosters: Array.isArray(rosters) ? `${rosters.length} rosters` : 'NOT_ARRAY',
      matchups: Array.isArray(matchups)
        ? `${matchups.length} matchups`
        : `ERROR: ${typeof matchups} - ${JSON.stringify(matchups)}`,
      projections: projections ? Object.keys(projections).length + ' players' : 'NULL',
    });

    // Group matchups by matchup_id
    const matchupGroups = new Map<number, any[]>();
    for (const matchup of matchups) {
      if (matchup.matchup_id) {
        if (!matchupGroups.has(matchup.matchup_id)) {
          matchupGroups.set(matchup.matchup_id, []);
        }
        matchupGroups.get(matchup.matchup_id)!.push(matchup);
      }
    }

    // Process each matchup pair
    for (const [matchupId, pair] of matchupGroups.entries()) {
      if (pair.length !== 2) continue;

      allData.push({
        leagueId,
        league,
        week,
        matchupId,
        team1: pair[0],
        team2: pair[1],
        projections,
        scoringSettings: league.scoring_settings,
      });
    }
  }

  return allData;
}

/**
 * Run all simulations in memory - NO DATABASE NEEDED!
 */
async function runSimulationsInMemory(matchupData: any[]): Promise<SimulationResult[]> {
  const results: SimulationResult[] = [];

  console.log(`🎲 Running ${matchupData.length} simulations in memory...`);

  for (const data of matchupData) {
    // Build lineup players from Sleeper data
    const team1Players = (data.team1.starters || []).map((playerId: string) => {
      const projection = data.projections[playerId];
      return {
        id: playerId,
        name: playerId, // We don't need actual names for simulation
        position: projection?.position || 'UNKNOWN',
        projection: calculateFantasyPoints(projection, data.scoringSettings),
      };
    });

    const team2Players = (data.team2.starters || []).map((playerId: string) => {
      const projection = data.projections[playerId];
      return {
        id: playerId,
        name: playerId,
        position: projection?.position || 'UNKNOWN',
        projection: calculateFantasyPoints(projection, data.scoringSettings),
      };
    });

    const team1Total = team1Players.reduce((sum, p) => sum + p.projection, 0);
    const team2Total = team2Players.reduce((sum, p) => sum + p.projection, 0);

    // Debug: Log projection totals
    console.log(
      `🏈 Matchup ${data.matchupId}: Team1 ${team1Total.toFixed(1)} pts vs Team2 ${team2Total.toFixed(1)} pts`
    );

    // Run simulation
    const simResult = await simulateMatchupProbabilityFromPlayers(
      team1Players,
      team2Players,
      10000, // Reduced from 100k - still very accurate
      0 // Game progress
    );

    // Debug: Log simulation results
    const team1ML = simResult.impliedOdds?.team1MoneyLine;
    const team2ML = simResult.impliedOdds?.team2MoneyLine;
    console.log(
      `🎯 Matchup ${data.matchupId}: ${(simResult.team1WinPct * 100).toFixed(1)}% vs ${(simResult.team2WinPct * 100).toFixed(1)}% | ML: ${isFinite(team1ML) ? team1ML : 'INF'} / ${isFinite(team2ML) ? team2ML : 'INF'}`
    );

    // Store result
    results.push({
      leagueId: data.leagueId,
      week: data.week,
      matchupId: data.matchupId,
      rosterAId: data.team1.roster_id,
      rosterBId: data.team2.roster_id,
      simulation: simResult,
      playerSimulations: [...team1Players, ...team2Players].map(p => ({
        playerId: p.id,
        projection: p.projection,
        // Add distribution data if needed
      })),
    });
  }

  return results;
}

/**
 * Calculate fantasy points based on scoring settings
 */
function calculateFantasyPoints(projection: any, scoringSettings: any): number {
  if (!projection?.stats) {
    console.log(`⚠️ No projection stats for player`, { projection });
    return 0;
  }

  let points = 0;
  const stats = projection.stats;

  // Passing
  points += (stats.pass_yd || 0) * (scoringSettings.pass_yd || 0.04);
  points += (stats.pass_td || 0) * (scoringSettings.pass_td || 4);
  points += (stats.pass_int || 0) * (scoringSettings.pass_int || -2);

  // Rushing
  points += (stats.rush_yd || 0) * (scoringSettings.rush_yd || 0.1);
  points += (stats.rush_td || 0) * (scoringSettings.rush_td || 6);

  // Receiving
  points += (stats.rec || 0) * (scoringSettings.rec || 0.5);
  points += (stats.rec_yd || 0) * (scoringSettings.rec_yd || 0.1);
  points += (stats.rec_td || 0) * (scoringSettings.rec_td || 6);

  // Add other scoring categories as needed...

  if (points === 0) {
    console.log(`⚠️ Zero points calculated for player`, {
      projection,
      stats,
      scoringSettings: Object.keys(scoringSettings || {}),
    });
  }

  return points;
}

/**
 * Write all results to database in one operation
 */
async function writeResultsToDatabase(results: SimulationResult[]) {
  console.log(`💾 Connecting to database for write operation...`);
  const startTime = Date.now();

  const prisma = new PrismaClient();

  try {
    // Use transaction for atomic write
    // Type workaround until Prisma client types refresh in monorepo build
    const db = prisma as any;
    await db.$transaction(async (tx: any) => {
      // Clear old simulations
      for (const result of results) {
        await tx.matchupSimulation.deleteMany({
          where: {
            leagueId: result.leagueId,
            week: result.week,
            matchupId: result.matchupId,
          },
        });
      }

      // Write new simulations
      for (const result of results) {
        await tx.matchupSimulation.create({
          data: {
            league: { connect: { id: result.leagueId } },
            week: result.week,
            matchupId: result.matchupId,
            teamAWinPct: result.simulation.team1WinPct,
            teamBWinPct: result.simulation.team2WinPct,
            teamAMean: result.simulation.team1Scores.mean,
            teamBMean: result.simulation.team2Scores.mean,
            teamAMedian: result.simulation.team1Scores.median,
            teamBMedian: result.simulation.team2Scores.median,
            teamAP10: result.simulation.team1Scores.p10,
            teamBP10: result.simulation.team2Scores.p10,
            teamAP90: result.simulation.team1Scores.p90,
            teamBP90: result.simulation.team2Scores.p90,
            teamAStdDev: 0, // Calculate if needed
            teamBStdDev: 0,
            iterations: 10000,
            computeTimeMs: 0,
            impliedSpread: result.simulation.impliedOdds?.spread || 0,
            totalLine: result.simulation.impliedOdds?.total || 0,
            moneyLineA: isFinite(result.simulation.impliedOdds?.team1MoneyLine || 0)
              ? result.simulation.impliedOdds.team1MoneyLine
              : 0,
            moneyLineB: isFinite(result.simulation.impliedOdds?.team2MoneyLine || 0)
              ? result.simulation.impliedOdds.team2MoneyLine
              : 0,
            overPct: 0.5,
            underPct: 0.5,
            // Add player simulations if needed
          },
        });
      }
    });

    const elapsed = Date.now() - startTime;
    console.log(`✅ Database write complete in ${elapsed}ms`);
  } finally {
    // CRITICAL: Disconnect immediately!
    await prisma.$disconnect();
    console.log(`🔌 Database disconnected`);
  }
}

/**
 * Fetch current NFL week from Sleeper API
 */
async function getCurrentNFLWeek(): Promise<number> {
  try {
    console.log('📅 Fetching current NFL week from Sleeper API...');
    const response = await fetch('https://api.sleeper.app/v1/state/nfl');
    const nflState = await response.json();

    const currentWeek = nflState.display_week || nflState.week || 1;
    console.log(
      `📊 Current NFL State: Week ${currentWeek}, Season ${nflState.season}, Type: ${nflState.season_type}`
    );
    return currentWeek;
  } catch (error) {
    console.error('⚠️ Error fetching NFL state, defaulting to week 1:', error);
    return 1;
  }
}

/**
 * Main execution
 */
async function main() {
  // Get current NFL week dynamically (or allow override via command line)
  const weekOverride = process.argv[2] ? parseInt(process.argv[2]) : null;
  const week = weekOverride || (await getCurrentNFLWeek());

  const leagueIds = [
    '1263744209295245312', // Gauntlet AFC
    '1263740549504962561', // Gauntlet NFC
  ];

  console.log(
    `🚀 Starting OPTIMIZED batch simulations for Week ${week}${weekOverride ? ' (manual override)' : ' (current NFL week)'}`
  );
  console.log(`📊 Strategy: Fetch from API → Simulate in memory → Single DB write`);

  try {
    // Step 1: Fetch all data from Sleeper (no DB!)
    const matchupData = await fetchAllDataFromSleeper(leagueIds, week);
    console.log(`✅ Fetched ${matchupData.length} matchups from Sleeper API`);

    // Step 2: Run all simulations in memory (no DB!)
    const results = await runSimulationsInMemory(matchupData);
    console.log(`✅ Completed ${results.length} simulations in memory`);

    // Step 3: Single database write operation (minimal connection time!)
    await writeResultsToDatabase(results);

    console.log(`🎉 Complete! Database was only active for the final write operation.`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly (ES module version)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
