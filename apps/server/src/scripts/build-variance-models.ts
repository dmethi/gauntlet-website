import { PrismaClient } from '../generated/prisma';
import { calculateNormalizedError, calculateStdDev } from '@gauntlet/lib';
import axios from 'axios';

const prisma = new PrismaClient();
const SLEEPER_API = 'https://api.sleeper.app/v1';

interface PlayerWeekStat {
  playerId: string;
  season: number;
  week: number;
  position: string;
  projectedPoints: number;
  actualPoints: number;
}

interface SleeperPlayer {
  position?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  team?: string;
  status?: string;
  injury_status?: string | null;
  number?: number;
  age?: number;
  years_exp?: number;
  search_rank?: number;
}

interface SleeperStats {
  pts_ppr?: number;
  pts_half_ppr?: number;
  pts_std?: number;
  [key: string]: any;
}

interface SleeperProjections {
  pts_ppr?: number;
  pts_half_ppr?: number;
  pts_std?: number;
  adp_dd_ppr?: number;
  pos_adp_dd_ppr?: number;
  [key: string]: any;
}

async function fetchFromSleeper<T>(endpoint: string): Promise<T> {
  try {
    const response = await axios.get(`${SLEEPER_API}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

async function getAllPlayers(): Promise<Record<string, SleeperPlayer>> {
  return fetchFromSleeper('/players/nfl');
}

async function getWeeklyStats(season: number, week: number): Promise<Record<string, SleeperStats>> {
  return fetchFromSleeper(`/stats/nfl/regular/${season}/${week}`);
}

async function getWeeklyProjections(
  season: number,
  week: number
): Promise<Record<string, SleeperProjections>> {
  return fetchFromSleeper(`/projections/nfl/regular/${season}/${week}`);
}

async function getTopPlayers(
  players: Record<string, SleeperPlayer>,
  projections: Record<string, SleeperProjections>,
  limit: number = 400
): Promise<string[]> {
  // Convert to array and filter out players without position
  const playerArray = Object.entries(players)
    .map(([id, player]) => ({
      id,
      position: player.position,
      adp: projections[id]?.adp_dd_ppr || 1000,
      posAdp: projections[id]?.pos_adp_dd_ppr || 999,
    }))
    .filter(p => p.position && !p.position.includes('DEF'));

  // Sort by ADP
  const sorted = playerArray.sort((a, b) => a.adp - b.adp);

  // Return top N player IDs
  return sorted.slice(0, limit).map(p => p.id);
}

async function processWeek(
  season: number,
  week: number,
  players: Record<string, SleeperPlayer>
): Promise<PlayerWeekStat[]> {
  console.log(`Processing ${season} week ${week}...`);

  try {
    // Get both stats and projections
    const [stats, projections] = await Promise.all([
      getWeeklyStats(season, week),
      getWeeklyProjections(season, week),
    ]);

    const weekStats: PlayerWeekStat[] = [];

    // Process each player that has both stats and projections
    for (const [playerId, playerStats] of Object.entries(stats)) {
      const playerProj = projections[playerId];
      const player = players[playerId];

      // Skip if missing key data
      if (!player?.position || !playerStats?.pts_ppr || !playerProj?.pts_ppr) {
        continue;
      }

      weekStats.push({
        playerId,
        season,
        week,
        position: player.position,
        projectedPoints: playerProj.pts_ppr,
        actualPoints: playerStats.pts_ppr,
      });
    }

    return weekStats;
  } catch (error) {
    console.error(`Error processing ${season} week ${week}:`, error);
    return [];
  }
}

async function computePositionVariance(stats: PlayerWeekStat[], position: string): Promise<void> {
  // Get all normalized errors for this position
  const errors = stats
    .filter(stat => stat.position === position)
    .map(stat => calculateNormalizedError(stat.projectedPoints, stat.actualPoints))
    .filter((error): error is number => error !== null);

  if (errors.length < 10) {
    console.log(`Not enough data for ${position} variance (${errors.length} samples)`);
    return;
  }

  const meanError = errors.reduce((sum, err) => sum + err, 0) / errors.length;
  const stdDev = calculateStdDev(errors);

  // Store in database
  await prisma.positionVariance.upsert({
    where: {
      position_season: {
        position,
        season: stats[0].season.toString(),
      },
    },
    update: {
      sampleSize: errors.length,
      meanError,
      stdDev,
      lastUpdated: new Date(),
    },
    create: {
      position,
      season: stats[0].season.toString(),
      sampleSize: errors.length,
      meanError,
      stdDev,
      lastUpdated: new Date(),
    },
  });

  console.log(
    `${position} variance updated: mean=${meanError.toFixed(3)}, stdDev=${stdDev.toFixed(3)}, n=${errors.length}`
  );
}

async function computePlayerVariance(stats: PlayerWeekStat[], playerId: string): Promise<void> {
  // Get all normalized errors for this player
  const errors = stats
    .filter(stat => stat.playerId === playerId)
    .map(stat => calculateNormalizedError(stat.projectedPoints, stat.actualPoints))
    .filter((error): error is number => error !== null);

  if (errors.length < 4) {
    // Not enough data for reliable player-specific variance
    return;
  }

  const meanError = errors.reduce((sum, err) => sum + err, 0) / errors.length;
  const stdDev = calculateStdDev(errors);

  // Store in database
  await prisma.playerVariance.upsert({
    where: {
      playerId_season: {
        playerId,
        season: stats[0].season.toString(),
      },
    },
    update: {
      sampleSize: errors.length,
      meanError,
      stdDev,
      lastUpdated: new Date(),
    },
    create: {
      playerId,
      season: stats[0].season.toString(),
      sampleSize: errors.length,
      meanError,
      stdDev,
      lastUpdated: new Date(),
    },
  });

  console.log(
    `Player ${playerId} variance updated: mean=${meanError.toFixed(3)}, stdDev=${stdDev.toFixed(3)}, n=${errors.length}`
  );
}

async function storeProjectionError(stat: PlayerWeekStat): Promise<void> {
  await prisma.projectionError.upsert({
    where: {
      playerId_week_season: {
        playerId: stat.playerId,
        week: stat.week,
        season: stat.season.toString(),
      },
    },
    update: {
      projectedPoints: stat.projectedPoints,
      actualPoints: stat.actualPoints,
      normalizedError: calculateNormalizedError(stat.projectedPoints, stat.actualPoints) || 0,
    },
    create: {
      playerId: stat.playerId,
      week: stat.week,
      season: stat.season.toString(),
      projectedPoints: stat.projectedPoints,
      actualPoints: stat.actualPoints,
      normalizedError: calculateNormalizedError(stat.projectedPoints, stat.actualPoints) || 0,
    },
  });
}

async function main() {
  try {
    // Get all players first
    console.log('Fetching all players...');
    const players = await getAllPlayers();

    // Get initial projections to identify top players
    console.log('Getting initial projections for player ranking...');
    const initialProj = await getWeeklyProjections(2024, 1);
    const topPlayerIds = await getTopPlayers(players, initialProj);

    // Process each season
    const seasons = [2022, 2023, 2024];
    for (const season of seasons) {
      console.log(`\nProcessing ${season} season...`);

      // Process weeks 1-17 (or current week for 2024)
      const maxWeek = season === 2024 ? 8 : 17; // Adjust based on current week
      for (let week = 1; week <= maxWeek; week++) {
        const weekStats = await processWeek(season, week, players);

        // Store each projection error
        for (const stat of weekStats) {
          await storeProjectionError(stat);
        }

        // Add delay between API calls
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // After processing all weeks, compute variances
      const seasonStats = await prisma.projectionError.findMany({
        where: { season: season.toString() },
      });

      const playerStats: PlayerWeekStat[] = seasonStats.map(err => ({
        playerId: err.playerId,
        season: parseInt(err.season),
        week: err.week,
        position: players[err.playerId]?.position || 'UNKNOWN',
        projectedPoints: err.projectedPoints,
        actualPoints: err.actualPoints,
      }));

      // Update position-level variances
      const positions = ['QB', 'RB', 'WR', 'TE'];
      for (const position of positions) {
        await computePositionVariance(playerStats, position);
      }

      // Update player-specific variances for top players
      for (const playerId of topPlayerIds) {
        await computePlayerVariance(playerStats, playerId);
      }
    }

    console.log('\nVariance model building complete!');
  } catch (error) {
    console.error('Error building variance models:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
