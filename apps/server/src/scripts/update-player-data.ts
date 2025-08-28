import 'dotenv/config';
import prisma from '../lib/prisma.js';

const CURRENT_SEASON = '2025';

interface SleeperPlayer {
  player_id: string;
  hashtag?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  team?: string;
  position: string;
  depth_chart_order?: number;
  status?: string;
  injury_status?: string;
  weight?: string;
  height?: string;
  number?: number;
  age?: number;
  years_exp?: number;
}

async function fetchPlayersFromSleeper(): Promise<Record<string, SleeperPlayer>> {
  console.log('📥 Fetching player data from Sleeper API...');

  const response = await fetch('https://api.sleeper.app/v1/players/nfl');

  if (!response.ok) {
    throw new Error(`Failed to fetch players: ${response.statusText}`);
  }

  const players = await response.json();
  console.log(`✅ Fetched ${Object.keys(players).length} players from Sleeper`);

  return players;
}

async function updatePlayerData() {
  try {
    console.log('🚀 Starting player data update...');

    // Fetch all players from Sleeper
    const sleeperPlayers = await fetchPlayersFromSleeper();

    console.log('🔄 Updating player database...');
    let updatedCount = 0;
    let createdCount = 0;

    // Filter out invalid players first
    const validPlayerEntries = Object.entries(sleeperPlayers).filter(
      ([_, playerData]) =>
        playerData &&
        playerData.full_name &&
        playerData.position &&
        playerData.first_name &&
        playerData.last_name
    );

    console.log(
      `📋 Filtered to ${validPlayerEntries.length} valid players out of ${Object.keys(sleeperPlayers).length} total`
    );

    // Process players in batches to avoid overwhelming the database
    const batchSize = 500;

    for (let i = 0; i < validPlayerEntries.length; i += batchSize) {
      const batch = validPlayerEntries.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async ([playerId, playerData]) => {
          if (!playerData || !playerData.full_name || !playerData.position) {
            return; // Skip invalid player data
          }

          const result = await prisma.player.upsert({
            where: { id: playerId },
            update: {
              hashtag: playerData.hashtag,
              firstName: playerData.first_name,
              lastName: playerData.last_name,
              fullName: playerData.full_name,
              team: playerData.team,
              position: playerData.position,
              depthChartOrder: playerData.depth_chart_order,
              status: playerData.status,
              injuryStatus: playerData.injury_status,
              weight: playerData.weight,
              height: playerData.height,
              number: playerData.number,
              age: playerData.age,
              yearsExp: playerData.years_exp,
            },
            create: {
              id: playerId,
              hashtag: playerData.hashtag,
              firstName: playerData.first_name,
              lastName: playerData.last_name,
              fullName: playerData.full_name,
              team: playerData.team,
              position: playerData.position,
              depthChartOrder: playerData.depth_chart_order,
              status: playerData.status,
              injuryStatus: playerData.injury_status,
              weight: playerData.weight,
              height: playerData.height,
              number: playerData.number,
              age: playerData.age,
              yearsExp: playerData.years_exp,
            },
          });

          // Check if it was an insert or update (Prisma doesn't provide this directly)
          // We'll count all as updates since we can't easily distinguish
          updatedCount++;
        })
      );

      console.log(
        `Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validPlayerEntries.length / batchSize)}`
      );
    }

    console.log(`✅ Player data update complete!`);
    console.log(`📊 Processed ${updatedCount} players`);

    // Get updated player counts
    const playerCount = await prisma.player.count();
    console.log(`📈 Total players in database: ${playerCount}`);

    // Show some sample updated players
    const samplePlayers = await prisma.player.findMany({
      where: {
        team: { not: null },
      },
      take: 10,
      orderBy: { fullName: 'asc' },
      select: {
        id: true,
        fullName: true,
        position: true,
        team: true,
        status: true,
      },
    });

    console.log('\n📋 Sample updated players:');
    console.table(samplePlayers);
  } catch (error) {
    console.error('❌ Player data update failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanupOldPlayerStats() {
  console.log('🧹 Cleaning up old player stats from 2023...');

  // Remove old player stats that are not relevant for 2025 season
  const deleteResult = await prisma.playerStats.deleteMany({
    where: {
      season: '2023',
    },
  });

  console.log(`✅ Deleted ${deleteResult.count} old player stat records`);
}

async function main() {
  try {
    console.log('🎯 Starting comprehensive player data refresh for 2025 season...');

    // Step 1: Clean up old stats
    await cleanupOldPlayerStats();

    // Step 2: Update player data
    await updatePlayerData();

    console.log('\n🎉 Player data refresh complete!');
  } catch (error) {
    console.error('❌ Main process failed:', error);
    process.exitCode = 1;
  }
}

main().catch(console.error);
