#!/usr/bin/env node

/**
 * TEST: Single Season Historical Data Collection
 *
 * Test version that collects data for 2024 season only to validate the approach
 * before running the full 5-year collection.
 */

import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// Test configuration - just 2024 season with a few star players
const TEST_SEASON = '2024';
const TEST_PLAYERS = [
  '4984', // Josh Allen
  '6770', // Joe Burrow
  '8155', // Breece Hall
  '7543', // Travis Etienne
  '8112', // Drake London
  '11632', // Malik Nabers
];

const REQUEST_DELAY = 200; // ms between requests

interface WeeklyData {
  week: number;
  stats: { pts_half_ppr?: number };
}

/**
 * Delay execution for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch historical stats for a player/season
 */
async function fetchPlayerStats(playerId: string, season: string): Promise<WeeklyData[]> {
  const url = `https://api.sleeper.com/stats/nfl/player/${playerId}?season_type=regular&season=${season}&grouping=week`;

  try {
    console.log(`📊 Fetching stats: ${url}`);
    const response = await axios.get(url, { timeout: 10000 });

    if (response.data && typeof response.data === 'object') {
      const weeklyStats: WeeklyData[] = Object.entries(response.data)
        .filter(([week, data]) => data && typeof data === 'object')
        .map(([week, data]: [string, any]) => ({
          week: parseInt(week),
          stats: data.stats || data,
        }))
        .filter(stat => stat.stats.pts_half_ppr !== undefined && stat.stats.pts_half_ppr >= 0);

      console.log(`✅ Found ${weeklyStats.length} weeks of stats`);
      return weeklyStats;
    }

    return [];
  } catch (error) {
    console.warn(`❌ Stats failed for ${playerId}: ${error.message}`);
    return [];
  }
}

/**
 * Fetch historical projections for a player/season
 */
async function fetchPlayerProjections(playerId: string, season: string): Promise<WeeklyData[]> {
  const url = `https://api.sleeper.com/projections/nfl/player/${playerId}?season_type=regular&season=${season}&grouping=week`;

  try {
    console.log(`🎯 Fetching projections: ${url}`);
    const response = await axios.get(url, { timeout: 10000 });

    if (response.data && typeof response.data === 'object') {
      const weeklyProjections: WeeklyData[] = Object.entries(response.data)
        .filter(([week, data]) => data && typeof data === 'object')
        .map(([week, data]: [string, any]) => ({
          week: parseInt(week),
          stats: data.stats || data,
        }))
        .filter(proj => proj.stats.pts_half_ppr !== undefined && proj.stats.pts_half_ppr > 0);

      console.log(`✅ Found ${weeklyProjections.length} weeks of projections`);
      return weeklyProjections;
    }

    return [];
  } catch (error) {
    console.warn(`❌ Projections failed for ${playerId}: ${error.message}`);
    return [];
  }
}

/**
 * Test the data collection process for a single player
 */
async function testPlayerCollection(playerId: string): Promise<void> {
  console.log(`\n🔍 Testing data collection for player ${playerId}...`);

  try {
    // Fetch both stats and projections
    const [stats, projections] = await Promise.all([
      fetchPlayerStats(playerId, TEST_SEASON),
      fetchPlayerProjections(playerId, TEST_SEASON),
    ]);

    console.log(`📈 Data summary for ${playerId}:`);
    console.log(`   Stats weeks: ${stats.length}`);
    console.log(`   Projection weeks: ${projections.length}`);

    if (stats.length === 0 || projections.length === 0) {
      console.log(`⚠️  Insufficient data for ${playerId}`);
      return;
    }

    // Match stats to projections by week
    const projectionErrors = [];
    for (const stat of stats) {
      const projection = projections.find(p => p.week === stat.week);
      if (projection && projection.stats.pts_half_ppr > 0 && stat.stats.pts_half_ppr >= 0) {
        const projectedPoints = projection.stats.pts_half_ppr;
        const actualPoints = stat.stats.pts_half_ppr;
        const normalizedError = (actualPoints - projectedPoints) / projectedPoints;

        projectionErrors.push({
          playerId: playerId,
          week: stat.week,
          season: TEST_SEASON,
          projectedPoints: projectedPoints,
          actualPoints: actualPoints,
          normalizedError: normalizedError,
        });

        console.log(
          `   Week ${stat.week}: Proj=${projectedPoints.toFixed(1)}, Actual=${actualPoints.toFixed(1)}, Error=${(normalizedError * 100).toFixed(1)}%`
        );
      }
    }

    if (projectionErrors.length > 0) {
      // Save to database
      await prisma.projectionError.createMany({
        data: projectionErrors,
        skipDuplicates: true,
      });

      console.log(`✅ Saved ${projectionErrors.length} weeks of projection errors for ${playerId}`);

      // Calculate basic stats
      const errors = projectionErrors.map(pe => pe.normalizedError);
      const meanError = errors.reduce((sum, err) => sum + err, 0) / errors.length;
      const variance =
        errors.reduce((sum, err) => sum + Math.pow(err - meanError, 2), 0) / errors.length;
      const stdDev = Math.sqrt(variance);

      console.log(
        `📊 Variance stats: Mean=${(meanError * 100).toFixed(1)}%, StdDev=${(stdDev * 100).toFixed(1)}%`
      );
    }
  } catch (error) {
    console.error(`❌ Error processing ${playerId}:`, error.message);
  }
}

/**
 * Main test execution
 */
async function main() {
  console.log('🧪 Testing Single Season Data Collection');
  console.log('========================================');
  console.log(`Season: ${TEST_SEASON}`);
  console.log(`Test Players: ${TEST_PLAYERS.length}`);
  console.log('');

  try {
    // Process each test player
    for (let i = 0; i < TEST_PLAYERS.length; i++) {
      const playerId = TEST_PLAYERS[i];
      await testPlayerCollection(playerId);

      // Rate limiting delay between players
      if (i < TEST_PLAYERS.length - 1) {
        await delay(REQUEST_DELAY);
      }
    }

    // Check results in database
    const totalRecords = await prisma.projectionError.count({
      where: { season: TEST_SEASON },
    });

    console.log(`\n🎉 Test Complete!`);
    console.log(`Total records saved: ${totalRecords}`);

    // Show some sample data
    const sampleRecords = await prisma.projectionError.findMany({
      where: { season: TEST_SEASON },
      take: 5,
      orderBy: { week: 'asc' },
    });

    console.log(`\nSample records:`);
    sampleRecords.forEach(record => {
      console.log(
        `  Player ${record.playerId} Week ${record.week}: ${record.projectedPoints.toFixed(1)} → ${record.actualPoints.toFixed(1)} (${(record.normalizedError * 100).toFixed(1)}%)`
      );
    });

    if (totalRecords > 20) {
      console.log(`\n✅ Test successful! Ready to run full 5-year collection.`);
    } else {
      console.log(`\n⚠️  Low data volume. Check API endpoints and player IDs.`);
    }
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
