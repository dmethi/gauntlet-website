#!/usr/bin/env node
/**
 * Batch Simulation Runner - V2 (Sleeper API Version)
 * Fetches data directly from Sleeper API instead of database
 * Only stores simulation results in minimal database
 */

import SleeperAPIService from '../../services/sleeper/sleeper-api.service';
import ArchiveService from '../../services/archive/archive.service';
import prisma from '../../lib/prisma';
import { simulateMatchupProbabilityFromPlayers } from '@gauntlet/sim-engine/src/index.js';

// Types
interface SimulationOptions {
  week?: number;
  leagueIds?: string[];
  iterations?: number;
  isLive?: boolean;
  triggerType?: string;
}

interface PlayerProjection {
  playerId: string;
  playerName: string;
  position: string;
  projection: number;
  team?: string;
  isStarter: boolean;
}

/**
 * Parse command line arguments
 */
function parseArgs(): SimulationOptions {
  const args = process.argv.slice(2);
  const options: SimulationOptions = {
    iterations: 100000,
    triggerType: 'manual',
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--week':
        options.week = parseInt(args[++i]);
        break;
      case '--league':
        options.leagueIds = [args[++i]];
        break;
      case '--iterations':
        options.iterations = parseInt(args[++i]);
        break;
      case '--live':
        options.isLive = true;
        break;
      case '--trigger':
        options.triggerType = args[++i];
        break;
    }
  }

  return options;
}

/**
 * Get current week from NFL state
 */
async function getCurrentWeek(): Promise<number> {
  const sleeper = SleeperAPIService.getInstance();
  const state = await sleeper.getNFLState();
  return state.week;
}

/**
 * Build lineup players from Sleeper data
 */
async function buildLineupPlayers(
  starters: string[],
  projections: Record<string, any>,
  players: Record<string, any>,
  scoringSettings: any
): Promise<PlayerProjection[]> {
  const lineup: PlayerProjection[] = [];

  for (const playerId of starters) {
    const player = players[playerId];
    const projection = projections[playerId];

    // Skip players without basic data
    if (!player) {
      console.warn(`⚠️ Player ${playerId} not found in players data`);
      continue;
    }

    // Calculate projected points based on scoring settings
    const points = calculateProjectedPoints(
      projection || {},
      scoringSettings,
      playerId,
      player.full_name
    );

    // Skip players with zero projections (likely missing data)
    if (points <= 0 && !projection) {
      console.warn(
        `⚠️ Skipping ${player.full_name} (${player.position}) - no projection data available`
      );
      continue;
    }

    lineup.push({
      playerId,
      playerName: `${player.first_name} ${player.last_name}`,
      position: player.position,
      projection: Math.max(0.1, points), // Ensure minimum 0.1 points
      team: player.team,
      isStarter: true,
    });
  }

  return lineup;
}

/**
 * Calculate projected points based on scoring settings
 */
function calculateProjectedPoints(
  projection: any,
  scoringSettings: any,
  playerId?: string,
  playerName?: string
): number {
  let points = 0;
  const scoring = scoringSettings || {};
  const breakdown: any = {};
  const unusedCategories: string[] = [];
  const usedCategories: string[] = [];

  // Dynamically iterate through ALL scoring categories the league actually uses
  for (const [category, multiplier] of Object.entries(scoring)) {
    if (multiplier !== 0 && multiplier != null) {
      // Check if we have projection data for this scoring category
      if (projection[category] !== undefined && projection[category] !== null) {
        const categoryPoints = projection[category] * multiplier;
        points += categoryPoints;
        breakdown[category] =
          `${projection[category]} * ${multiplier} = ${categoryPoints.toFixed(2)}`;
        usedCategories.push(category);
      } else {
        // Track categories we have scoring for but no projection data
        unusedCategories.push(category);
      }
    }
  }

  const finalPoints = Math.max(0, points);

  // Debug: Show diagnostic info for understanding projection coverage
  if (playerId && Math.random() < 0.1) {
    // Show ~10% of players for sampling
    console.log(`📊 ${playerName || playerId} (${finalPoints.toFixed(2)} pts):`);
    console.log(`   ✅ Used categories (${usedCategories.length}):`, usedCategories);
    console.log(
      `   ❌ League scoring categories without projection data (${unusedCategories.length}):`,
      unusedCategories
    );
    console.log(`   📈 Point breakdown:`, breakdown);

    if (unusedCategories.length > 0) {
      console.log(
        `   ⚠️ Missing ${unusedCategories.length} scoring categories - potential point undercount`
      );
    }

    if (finalPoints < 3) {
      console.log(`   🔍 Available projection stats:`, Object.keys(projection));
      console.log(
        `   🔍 League scoring settings:`,
        Object.keys(scoring).filter(key => scoring[key] !== 0)
      );
    }
  }

  return Math.round(points * 100) / 100;
}

/**
 * Simulate a single matchup
 */
async function simulateMatchup(
  leagueId: string,
  week: number,
  matchupId: number,
  options: SimulationOptions
): Promise<void> {
  const startTime = Date.now();
  const sleeper = SleeperAPIService.getInstance();

  console.log(`\n📊 Simulating matchup ${matchupId} in league ${leagueId} week ${week}`);

  try {
    // Fetch all required data from Sleeper API
    const [league, matchups, projections, players] = await Promise.all([
      sleeper.getLeague(leagueId),
      sleeper.getMatchups(leagueId, week),
      sleeper.getProjections(week),
      sleeper.getPlayers(),
    ]);

    // Basic validation
    if (!projections || typeof projections !== 'object') {
      console.error(`❌ Invalid projections data received`);
      return;
    }

    // Find the matchup pair
    const matchupPair = matchups.filter(m => m.matchup_id === matchupId);
    if (matchupPair.length !== 2) {
      console.error(`❌ Invalid matchup: ${matchupId} (found ${matchupPair.length} teams)`);
      return;
    }

    const [team1Matchup, team2Matchup] = matchupPair;

    // =====================================================
    // LINEUP AND MATCHING ANALYSIS
    // =====================================================
    if (projections && typeof projections === 'object') {
      console.log(`\n🔍 ========== LINEUP STARTERS DEBUG ==========`);
      const team1Starters = team1Matchup.starters || [];
      const team2Starters = team2Matchup.starters || [];
      const allStarters = [...team1Starters, ...team2Starters];

      console.log(`🔍 Team 1 starters (${team1Starters.length}): ${team1Starters.join(', ')}`);
      console.log(`🔍 Team 2 starters (${team2Starters.length}): ${team2Starters.join(', ')}`);

      // Check exact matches
      console.log(`\n🔍 ========== PLAYER ID MATCHING ==========`);
      let found = 0;
      const missing = [];

      for (const starterId of allStarters.slice(0, 10)) {
        // Check first 10
        if (projections[starterId]) {
          found++;
          console.log(
            `✅ Found projection for starter ${starterId}:`,
            Object.keys(projections[starterId])
          );
        } else {
          missing.push(starterId);
        }
      }

      console.log(
        `🔍 MATCH RESULTS: ${found}/${Math.min(allStarters.length, 10)} starters have projections`
      );
      if (missing.length > 0) {
        console.log(`❌ Missing projections for: ${missing.join(', ')}`);
      }
      console.log(`🔍 ============================================\n`);
    }

    // Build lineups - using FRESH data from Sleeper!
    const [team1Players, team2Players] = await Promise.all([
      buildLineupPlayers(
        team1Matchup.starters || [],
        projections,
        players,
        league.scoring_settings
      ),
      buildLineupPlayers(
        team2Matchup.starters || [],
        projections,
        players,
        league.scoring_settings
      ),
    ]);

    const team1Total = team1Players.reduce((sum, p) => sum + p.projection, 0);
    const team2Total = team2Players.reduce((sum, p) => sum + p.projection, 0);

    console.log(
      `   Team 1 (Roster ${team1Matchup.roster_id}): ${team1Players.length} starters, ${team1Total.toFixed(1)} projected pts`
    );
    console.log(
      `   Team 2 (Roster ${team2Matchup.roster_id}): ${team2Players.length} starters, ${team2Total.toFixed(1)} projected pts`
    );

    // Run simulation
    const simResult = await simulateMatchupProbabilityFromPlayers(
      team1Players as any,
      team2Players as any,
      options.iterations || 100000,
      options.isLive ? 0.5 : 0 // Game progress
    );

    // Calculate betting odds
    const spread = simResult.team1Scores.mean - simResult.team2Scores.mean;
    const total = simResult.team1Scores.mean + simResult.team2Scores.mean;
    const moneyLineA = calculateMoneyLine(simResult.team1WinPct);
    const moneyLineB = calculateMoneyLine(simResult.team2WinPct);

    // Store simulation result in minimal database
    await prisma.matchupSimulation.upsert({
      where: {
        leagueId_week_matchupId: {
          leagueId,
          week,
          matchupId,
        },
      },
      update: {
        // Team A (first team in pair)
        teamAMean: simResult.team1Scores.mean,
        teamAP10: simResult.team1Scores.p10,
        teamAMedian: simResult.team1Scores.median,
        teamAP90: simResult.team1Scores.p90,
        teamAStdDev: (simResult.team1Scores.p90 - simResult.team1Scores.p10) / 2.56,

        // Team B (second team in pair)
        teamBMean: simResult.team2Scores.mean,
        teamBP10: simResult.team2Scores.p10,
        teamBMedian: simResult.team2Scores.median,
        teamBP90: simResult.team2Scores.p90,
        teamBStdDev: (simResult.team2Scores.p90 - simResult.team2Scores.p10) / 2.56,

        // Probabilities
        teamAWinPct: simResult.team1WinPct,
        teamBWinPct: simResult.team2WinPct,

        // Betting lines
        impliedSpread: spread,
        moneyLineA,
        moneyLineB,
        totalLine: total,
        overPct: 0.5, // Simplified for now
        underPct: 0.5,

        // Metadata
        iterations: options.iterations,
        computeTimeMs: Date.now() - startTime,
        updatedAt: new Date(),
      },
      create: {
        leagueId,
        week,
        matchupId,

        // Team A
        teamAMean: simResult.team1Scores.mean,
        teamAP10: simResult.team1Scores.p10,
        teamAMedian: simResult.team1Scores.median,
        teamAP90: simResult.team1Scores.p90,
        teamAStdDev: (simResult.team1Scores.p90 - simResult.team1Scores.p10) / 2.56,

        // Team B
        teamBMean: simResult.team2Scores.mean,
        teamBP10: simResult.team2Scores.p10,
        teamBMedian: simResult.team2Scores.median,
        teamBP90: simResult.team2Scores.p90,
        teamBStdDev: (simResult.team2Scores.p90 - simResult.team2Scores.p10) / 2.56,

        // Probabilities
        teamAWinPct: simResult.team1WinPct,
        teamBWinPct: simResult.team2WinPct,

        // Betting lines
        impliedSpread: spread,
        moneyLineA,
        moneyLineB,
        totalLine: total,
        overPct: 0.5,
        underPct: 0.5,

        // Metadata
        iterations: options.iterations,
        computeTimeMs: Date.now() - startTime,
      },
    });

    console.log(`   ✅ Simulation complete in ${Date.now() - startTime}ms`);
    console.log(`   📊 Results: Team 1 win% = ${(simResult.team1WinPct * 100).toFixed(1)}%`);
    console.log(`   📊 Spread: ${spread.toFixed(1)}, Total: ${total.toFixed(1)}`);

    // Store odds history if requested
    if (options.triggerType !== 'test') {
      await storeOddsHistory(leagueId, week, matchupId, simResult, options);
    }
  } catch (error) {
    console.error(`❌ Error simulating matchup ${matchupId}:`, error);
  }
}

/**
 * Calculate money line from win probability
 */
function calculateMoneyLine(winProbability: number): number {
  if (winProbability >= 0.5) {
    return -Math.round((winProbability / (1 - winProbability)) * 100);
  } else {
    return Math.round(((1 - winProbability) / winProbability) * 100);
  }
}

/**
 * Store odds history snapshot
 */
async function storeOddsHistory(
  leagueId: string,
  week: number,
  matchupId: number,
  simResult: any,
  options: SimulationOptions
): Promise<void> {
  try {
    await prisma.matchupOddsHistory.create({
      data: {
        leagueId,
        week,
        matchupId,
        team1WinPct: simResult.team1WinPct,
        team2WinPct: simResult.team2WinPct,
        spread: simResult.team1Scores.mean - simResult.team2Scores.mean,
        total: simResult.team1Scores.mean + simResult.team2Scores.mean,
        team1MoneyLine: calculateMoneyLine(simResult.team1WinPct),
        team2MoneyLine: calculateMoneyLine(simResult.team2WinPct),
        gameProgress: options.isLive ? 0.5 : 0,
        isLive: options.isLive || false,
        triggeredBy: options.triggerType || 'manual',
      },
    });
  } catch (error) {
    console.error('Failed to store odds history:', error);
  }
}

/**
 * Run simulations for all matchups in a league
 */
async function simulateLeague(
  leagueId: string,
  week: number,
  options: SimulationOptions
): Promise<void> {
  const sleeper = SleeperAPIService.getInstance();

  console.log(`\n🏆 Simulating all matchups for league ${leagueId} week ${week}`);

  // Get all matchups
  const matchups = await sleeper.getMatchups(leagueId, week);

  // Get unique matchup IDs
  const matchupIds = [...new Set(matchups.map(m => m.matchup_id))];

  console.log(`   Found ${matchupIds.length} matchups to simulate`);

  // Simulate each matchup
  for (const matchupId of matchupIds) {
    await simulateMatchup(leagueId, week, matchupId, options);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Batch Simulations (V2 - Sleeper API)');
  console.log('================================================');

  const options = parseArgs();
  const sleeper = SleeperAPIService.getInstance();
  const archive = new ArchiveService();

  try {
    // Get current week if not specified
    const week = options.week || (await getCurrentWeek());

    // Get league IDs
    const leagueIds = options.leagueIds || [
      SleeperAPIService.LEAGUE_IDS.AFC,
      SleeperAPIService.LEAGUE_IDS.NFC,
    ];

    console.log(`\n📅 Week: ${week}`);
    console.log(`🏆 Leagues: ${leagueIds.join(', ')}`);
    console.log(`🎲 Iterations: ${options.iterations}`);
    console.log(`🔴 Live mode: ${options.isLive ? 'Yes' : 'No'}`);
    console.log(`🏷️ Trigger: ${options.triggerType}`);

    // Run simulations for each league
    for (const leagueId of leagueIds) {
      await simulateLeague(leagueId, week, options);
    }

    // Archive simulation results
    const simulations = await prisma.matchupSimulation.findMany({
      where: {
        week,
        leagueId: { in: leagueIds },
      },
    });

    await archive.saveSnapshot('simulations', `week_${week}`, simulations, {
      week,
      leagueIds,
      count: simulations.length,
    });

    console.log('\n✅ All simulations complete!');
    console.log(`📁 Archived ${simulations.length} simulation results`);

    // Clear Sleeper API cache for next run
    sleeper.clearCache();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly (ES module version)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { simulateMatchup, simulateLeague };
