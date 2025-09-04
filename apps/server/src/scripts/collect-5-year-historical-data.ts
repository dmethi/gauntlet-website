#!/usr/bin/env node

/**
 * 5-Year Historical Data Collection for Simulation Engine
 *
 * Collects historical projection vs actual performance data from Sleeper API
 * for seasons 2020-2024 to power realistic variance modeling.
 *
 * Data Sources:
 * - Sleeper Stats API: /stats/nfl/player/{player_id}?season={year}&season_type=regular&grouping=week
 * - Sleeper Projections API: /projections/nfl/player/{player_id}?season={year}&season_type=regular&grouping=week
 *
 * Output: Populates ProjectionError, PlayerVariance, and PositionVariance tables
 */

import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// Configuration
const SEASONS = ['2020', '2021', '2022', '2023', '2024'];
const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
const REQUEST_DELAY = 100; // ms between API calls to avoid rate limits
const MAX_RETRIES = 3;
const BATCH_SIZE = 50; // Process players in batches

interface PlayerData {
  player_id: string;
  position: string;
  full_name: string;
  team?: string;
}

interface WeeklyStats {
  week: number;
  stats: {
    pts_half_ppr?: number;
    [key: string]: any;
  };
}

interface WeeklyProjection {
  week: number;
  stats: {
    pts_half_ppr?: number;
    [key: string]: any;
  };
}

/**
 * Delay execution for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch all NFL players for a given season
 */
async function fetchAllPlayersForSeason(season: string): Promise<PlayerData[]> {
  console.log(`📥 Fetching all players for ${season} season...`);

  try {
    const response = await axios.get(`https://api.sleeper.app/v1/players/nfl`, {
      timeout: 30000,
    });

    // Filter to relevant positions and active players
    const players: PlayerData[] = Object.entries(response.data)
      .filter(([playerId, playerData]: [string, any]) => {
        return (
          playerData.position &&
          POSITIONS.includes(playerData.position) &&
          playerData.active !== false &&
          playerData.full_name
        );
      })
      .map(([playerId, playerData]: [string, any]) => ({
        player_id: playerId,
        position: playerData.position,
        full_name: playerData.full_name,
        team: playerData.team,
      }));

    console.log(`✅ Found ${players.length} active players for ${season}`);
    return players;
  } catch (error) {
    console.error(`❌ Error fetching players for ${season}:`, error.message);
    throw error;
  }
}

/**
 * Fetch historical stats for a player/season
 */
async function fetchPlayerStats(playerId: string, season: string): Promise<WeeklyStats[]> {
  const url = `https://api.sleeper.com/stats/nfl/player/${playerId}?season_type=regular&season=${season}&grouping=week`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(url, { timeout: 10000 });

      // Convert object format {"1": {...}, "2": {...}} to array
      if (response.data && typeof response.data === 'object') {
        const weeklyStats: WeeklyStats[] = Object.entries(response.data)
          .filter(([week, data]) => data && typeof data === 'object')
          .map(([week, data]: [string, any]) => ({
            week: parseInt(week),
            stats: data.stats || data,
          }))
          .filter(stat => stat.stats.pts_half_ppr !== undefined && stat.stats.pts_half_ppr > 0);

        return weeklyStats;
      }

      return [];
    } catch (error) {
      console.warn(
        `⚠️  Attempt ${attempt}/${MAX_RETRIES} failed for stats ${playerId} ${season}: ${error.message}`
      );
      if (attempt === MAX_RETRIES) return [];
      await delay(REQUEST_DELAY * attempt);
    }
  }

  return [];
}

/**
 * Fetch historical projections for a player/season
 */
async function fetchPlayerProjections(
  playerId: string,
  season: string
): Promise<WeeklyProjection[]> {
  const url = `https://api.sleeper.com/projections/nfl/player/${playerId}?season_type=regular&season=${season}&grouping=week`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(url, { timeout: 10000 });

      // Convert object format {"1": {...}, "2": {...}} to array
      if (response.data && typeof response.data === 'object') {
        const weeklyProjections: WeeklyProjection[] = Object.entries(response.data)
          .filter(([week, data]) => data && typeof data === 'object')
          .map(([week, data]: [string, any]) => ({
            week: parseInt(week),
            stats: data.stats || data,
          }))
          .filter(proj => proj.stats.pts_half_ppr !== undefined && proj.stats.pts_half_ppr > 0);

        return weeklyProjections;
      }

      return [];
    } catch (error) {
      console.warn(
        `⚠️  Attempt ${attempt}/${MAX_RETRIES} failed for projections ${playerId} ${season}: ${error.message}`
      );
      if (attempt === MAX_RETRIES) return [];
      await delay(REQUEST_DELAY * attempt);
    }
  }

  return [];
}

/**
 * Process a single player's historical data for one season
 */
async function processPlayerSeason(
  player: PlayerData,
  season: string
): Promise<{
  processed: number;
  errors: number;
}> {
  console.log(`🔍 Processing ${player.full_name} (${player.position}) for ${season}...`);

  try {
    // Fetch both stats and projections
    const [stats, projections] = await Promise.all([
      fetchPlayerStats(player.player_id, season),
      fetchPlayerProjections(player.player_id, season),
    ]);

    if (stats.length === 0 || projections.length === 0) {
      return { processed: 0, errors: 0 };
    }

    // Match stats to projections by week
    const projectionErrors = [];
    for (const stat of stats) {
      const projection = projections.find(p => p.week === stat.week);
      if (projection && projection.stats.pts_half_ppr > 0 && stat.stats.pts_half_ppr >= 0) {
        const normalizedError =
          (stat.stats.pts_half_ppr - projection.stats.pts_half_ppr) / projection.stats.pts_half_ppr;

        projectionErrors.push({
          playerId: player.player_id,
          week: stat.week,
          season: season,
          projectedPoints: projection.stats.pts_half_ppr,
          actualPoints: stat.stats.pts_half_ppr,
          normalizedError: normalizedError,
        });
      }
    }

    if (projectionErrors.length === 0) {
      return { processed: 0, errors: 0 };
    }

    // Batch insert projection errors (upsert to handle duplicates)
    await prisma.projectionError.createMany({
      data: projectionErrors,
      skipDuplicates: true,
    });

    console.log(`✅ ${player.full_name}: ${projectionErrors.length} weeks of data saved`);
    return { processed: projectionErrors.length, errors: 0 };
  } catch (error) {
    console.error(`❌ Error processing ${player.full_name} ${season}:`, error.message);
    return { processed: 0, errors: 1 };
  }
}

/**
 * Calculate and store position variance statistics for a season
 */
async function calculatePositionVariance(season: string): Promise<void> {
  console.log(`📊 Calculating position variance for ${season}...`);

  for (const position of POSITIONS) {
    try {
      // Get all players for this position
      const playersForPosition = await prisma.player.findMany({
        where: { position: position },
        select: { id: true },
      });
      const playerIds = playersForPosition.map(p => p.id);

      // Get all projection errors for this position/season
      const errors = await prisma.projectionError.findMany({
        where: {
          season: season,
          playerId: { in: playerIds },
        },
      });

      if (errors.length < 10) {
        console.warn(`⚠️  Insufficient data for ${position} ${season}: ${errors.length} records`);
        continue;
      }

      // Calculate variance statistics
      const normalizedErrors = errors.map(e => e.normalizedError);
      const meanError =
        normalizedErrors.reduce((sum, err) => sum + err, 0) / normalizedErrors.length;
      const variance =
        normalizedErrors.reduce((sum, err) => sum + Math.pow(err - meanError, 2), 0) /
        normalizedErrors.length;
      const stdDev = Math.sqrt(variance);

      // Upsert position variance
      await prisma.positionVariance.upsert({
        where: {
          position_season: {
            position: position,
            season: season,
          },
        },
        update: {
          sampleSize: errors.length,
          meanError: meanError,
          stdDev: stdDev,
        },
        create: {
          position: position,
          season: season,
          sampleSize: errors.length,
          meanError: meanError,
          stdDev: stdDev,
        },
      });

      console.log(
        `✅ ${position} ${season}: μ=${meanError.toFixed(3)}, σ=${stdDev.toFixed(3)}, n=${errors.length}`
      );
    } catch (error) {
      console.error(`❌ Error calculating variance for ${position} ${season}:`, error.message);
    }
  }
}

/**
 * Calculate and store player variance statistics for a season
 */
async function calculatePlayerVariance(season: string): Promise<void> {
  console.log(`🎯 Calculating player variance for ${season}...`);

  // Get all players with sufficient data (8+ weeks)
  const playersWithData = (await prisma.$queryRaw`
    SELECT "playerId", COUNT(*) as week_count
    FROM "ProjectionError" 
    WHERE "season" = ${season}
    GROUP BY "playerId"
    HAVING COUNT(*) >= 8
  `) as { playerId: string; week_count: BigInt }[];

  console.log(`📈 Found ${playersWithData.length} players with 8+ weeks of data`);

  for (const playerData of playersWithData) {
    try {
      const errors = await prisma.projectionError.findMany({
        where: {
          playerId: playerData.playerId,
          season: season,
        },
      });

      if (errors.length < 8) continue;

      // Calculate player-specific variance
      const normalizedErrors = errors.map(e => e.normalizedError);
      const meanError =
        normalizedErrors.reduce((sum, err) => sum + err, 0) / normalizedErrors.length;
      const variance =
        normalizedErrors.reduce((sum, err) => sum + Math.pow(err - meanError, 2), 0) /
        normalizedErrors.length;
      const stdDev = Math.sqrt(variance);

      // Upsert player variance
      await prisma.playerVariance.upsert({
        where: {
          playerId_season: {
            playerId: playerData.playerId,
            season: season,
          },
        },
        update: {
          sampleSize: errors.length,
          meanError: meanError,
          stdDev: stdDev,
        },
        create: {
          playerId: playerData.playerId,
          season: season,
          sampleSize: errors.length,
          meanError: meanError,
          stdDev: stdDev,
        },
      });
    } catch (error) {
      console.error(
        `❌ Error calculating player variance for ${playerData.playerId}:`,
        error.message
      );
    }
  }

  console.log(`✅ Player variance calculations complete for ${season}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting 5-Year Historical Data Collection');
  console.log('============================================\n');

  const overallStats = {
    totalPlayers: 0,
    totalWeeks: 0,
    totalErrors: 0,
    seasonsCompleted: 0,
  };

  try {
    for (const season of SEASONS) {
      console.log(`\n🗓️  Processing ${season} season...`);
      const seasonStartTime = Date.now();

      // Get all players for this season
      const players = await fetchAllPlayersForSeason(season);
      overallStats.totalPlayers += players.length;

      // Process players in batches to avoid memory issues
      let seasonWeeks = 0;
      let seasonErrors = 0;

      for (let i = 0; i < players.length; i += BATCH_SIZE) {
        const batch = players.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(players.length / BATCH_SIZE);

        console.log(
          `\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} players)...`
        );

        // Process batch in parallel with rate limiting
        const batchResults = await Promise.all(
          batch.map(async (player, index) => {
            await delay(REQUEST_DELAY * index); // Stagger requests
            return processPlayerSeason(player, season);
          })
        );

        // Aggregate batch results
        for (const result of batchResults) {
          seasonWeeks += result.processed;
          seasonErrors += result.errors;
        }

        console.log(`📊 Batch complete: ${seasonWeeks} weeks processed, ${seasonErrors} errors`);
      }

      // Calculate variance statistics for this season
      await calculatePositionVariance(season);
      await calculatePlayerVariance(season);

      overallStats.totalWeeks += seasonWeeks;
      overallStats.totalErrors += seasonErrors;
      overallStats.seasonsCompleted++;

      const seasonTime = (Date.now() - seasonStartTime) / 1000;
      console.log(
        `✅ ${season} season complete: ${seasonWeeks} weeks, ${seasonErrors} errors (${seasonTime.toFixed(1)}s)`
      );
    }

    // Final summary
    console.log('\n🎉 5-Year Historical Data Collection Complete!');
    console.log('=============================================');
    console.log(`📈 Total Statistics:`);
    console.log(`   Seasons: ${overallStats.seasonsCompleted}/${SEASONS.length}`);
    console.log(`   Players: ${overallStats.totalPlayers.toLocaleString()}`);
    console.log(`   Weeks: ${overallStats.totalWeeks.toLocaleString()}`);
    console.log(`   Errors: ${overallStats.totalErrors.toLocaleString()}`);
    console.log('');

    // Verify data quality
    const totalRecords = await prisma.projectionError.count();
    console.log(`🔍 Database Verification:`);
    console.log(`   Total ProjectionError records: ${totalRecords.toLocaleString()}`);

    const positionVarianceCount = await prisma.positionVariance.count();
    console.log(`   Position variance models: ${positionVarianceCount}`);

    const playerVarianceCount = await prisma.playerVariance.count();
    console.log(`   Player variance models: ${playerVarianceCount}`);

    console.log('\n🎯 Ready for simulation engine improvements!');
  } catch (error) {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default main;
