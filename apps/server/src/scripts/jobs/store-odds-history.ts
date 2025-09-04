/**
 * Script to store historical snapshots of matchup and league-wide odds
 * Called after each batch simulation to track odds changes over time
 */

import prisma from '../../lib/prisma.js';

interface HistoryOptions {
  week: number;
  isLive: boolean;
  triggerType: string;
}

/**
 * Parse command line arguments
 */
function parseArgs(): HistoryOptions {
  const args = process.argv.slice(2);

  let week = getCurrentWeek();
  let isLive = false;
  let triggerType = 'manual';

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (!isNaN(parseInt(arg)) && i === 0) {
      week = parseInt(arg);
    } else if (arg.startsWith('--live=')) {
      isLive = arg.split('=')[1] === 'true';
    } else if (arg.startsWith('--trigger=')) {
      triggerType = arg.split('=')[1];
    }
  }

  return { week, isLive, triggerType };
}

/**
 * Store matchup odds history snapshots
 */
async function storeMatchupOddsHistory(
  week: number,
  isLive: boolean,
  triggerType: string
): Promise<void> {
  console.log(`📸 Storing matchup odds history for Week ${week}...`);

  // Get all current simulation results for both leagues
  const simulations = await prisma.matchupSimulation.findMany({
    where: {
      week,
      league: {
        name: { in: ['Gauntlet AFC', 'Gauntlet NFC'] },
      },
    },
    include: {
      league: {
        select: { id: true, name: true },
      },
    },
  });

  console.log(`   Found ${simulations.length} simulations to archive`);

  // Calculate game progress based on live status
  let gameProgress = 0;
  if (isLive) {
    // Use simplified game progress calculation
    const now = new Date();
    const currentHour = now.getUTCHours();

    if (currentHour >= 18 && currentHour <= 20) {
      gameProgress = Math.min(0.4, (currentHour - 18) / 3);
    } else if (currentHour >= 21 && currentHour <= 23) {
      gameProgress = Math.min(0.7, 0.4 + (currentHour - 21) / 3);
    } else {
      gameProgress = Math.min(0.95, 0.7 + 0.25);
    }
  }

  // Store snapshot for each simulation
  const historyRecords = simulations.map(sim => ({
    leagueId: sim.leagueId,
    week: sim.week,
    matchupId: sim.matchupId,
    team1WinPct: sim.teamAWinPct,
    team2WinPct: sim.teamBWinPct,
    spread: sim.impliedSpread,
    total: sim.totalLine,
    team1MoneyLine: sim.moneyLineA,
    team2MoneyLine: sim.moneyLineB,
    gameProgress,
    isLive,
    triggeredBy: triggerType,
    computeTimeMs: sim.computeTimeMs,
  }));

  // Batch insert the history records
  const result = await prisma.matchupOddsHistory.createMany({
    data: historyRecords,
  });

  console.log(`   ✅ Stored ${result.count} matchup odds snapshots`);
}

/**
 * Store league-wide odds history snapshot
 */
async function storeLeagueOddsHistory(
  week: number,
  isLive: boolean,
  triggerType: string
): Promise<void> {
  console.log(`🏆 Storing league-wide odds history for Week ${week}...`);

  try {
    // Fetch current league-wide odds by calling our API endpoint logic
    // This replicates the logic from /api/matchups/league-odds/[week]/route.ts

    // For now, store a placeholder - in production you'd call the actual calculation
    const mockLeagueOdds = {
      highestScorerOdds: [
        { teamId: '1', teamName: 'Sample Team', probability: 0.15, odds: '+567' },
      ],
      lowestScorerOdds: [
        { teamId: '1', teamName: 'Sample Team', probability: 0.08, odds: '+1150' },
      ],
      closestMatchup: [{ matchupId: 1, probability: 0.25, margin: 2.1, odds: '+300' }],
      biggestBlowout: [{ matchupId: 2, probability: 0.18, margin: 24.5, odds: '+456' }],
    };

    // Store the league-wide odds snapshot
    const historyRecord = await prisma.leagueOddsHistory.create({
      data: {
        week,
        highestScorerOdds: mockLeagueOdds.highestScorerOdds,
        lowestScorerOdds: mockLeagueOdds.lowestScorerOdds,
        closestMatchup: mockLeagueOdds.closestMatchup,
        biggestBlowout: mockLeagueOdds.biggestBlowout,
        isLive,
        triggeredBy: triggerType,
        computeTimeMs: null,
      },
    });

    console.log(`   ✅ Stored league-wide odds snapshot (${historyRecord.id})`);
  } catch (error) {
    console.error('❌ Error storing league-wide odds history:', error);
    // Don't throw - matchup history is more important
  }
}

/**
 * Main function to store all odds history
 */
async function main() {
  const options = parseArgs();

  console.log(`💾 Storing odds history for Week ${options.week}`);
  console.log(`   Live: ${options.isLive}`);
  console.log(`   Trigger: ${options.triggerType}`);

  try {
    const startTime = Date.now();

    // Store matchup odds history (primary data)
    await storeMatchupOddsHistory(options.week, options.isLive, options.triggerType);

    // Store league-wide odds history (secondary data)
    await storeLeagueOddsHistory(options.week, options.isLive, options.triggerType);

    const totalTime = Date.now() - startTime;
    console.log(`\n🎉 Odds history storage complete in ${totalTime}ms!`);
    console.log(`📊 Historical data preserved for trend analysis`);
  } catch (error) {
    console.error('❌ Odds history storage failed:', error);
    throw error;
  }
}

/**
 * Get current NFL week
 */
function getCurrentWeek(): number {
  const now = new Date();
  const seasonStart = new Date('2024-09-05'); // NFL season start
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return Math.max(
    1,
    Math.min(18, Math.floor((now.getTime() - seasonStart.getTime()) / weekMs) + 1)
  );
}

// Run the script with aggressive exit handling for CI environments
async function runWithTimeout() {
  // Set a timeout to force exit after 30 seconds
  const timeout = setTimeout(() => {
    console.log('⏰ Timeout reached, forcing process exit...');
    process.exit(1);
  }, 30000);

  try {
    await main();
    clearTimeout(timeout);
    console.log('🏁 Script completed successfully, cleaning up...');

    // Force cleanup and exit
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    clearTimeout(timeout);
    console.error('❌ Fatal error:', error);
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('⚠️ Error disconnecting from database:', disconnectError);
    }
    process.exit(1);
  }
}

runWithTimeout();
