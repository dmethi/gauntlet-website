import axios from 'axios';
import { PrismaClient } from '../generated/prisma';
import { calculateVarianceMetrics } from './calculate-metrics';

const prisma = new PrismaClient();
const SLEEPER_API = 'https://api.sleeper.app/v1';

interface SleeperStats {
  pts_ppr?: number;
  pts_half_ppr?: number;
  pts_std?: number;
  [key: string]: any;
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

async function fetchFromSleeper<T>(endpoint: string): Promise<T> {
  try {
    const response = await axios.get(`${SLEEPER_API}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
}

async function getTopPlayers(
  players: Record<string, SleeperPlayer>,
  limit: number = 400
): Promise<string[]> {
  // Convert to array and filter out players without position
  const playerArray = Object.entries(players)
    .map(([id, player]) => ({ id, ...player }))
    .filter(p => p.position && !p.position.includes('DEF'));

  // Sort by search rank (Sleeper's relevance ranking)
  const sorted = playerArray.sort((a, b) => {
    const rankA = a.search_rank || 999999;
    const rankB = b.search_rank || 999999;
    return rankA - rankB;
  });

  // Return top N player IDs
  return sorted.slice(0, limit).map(p => p.id);
}

async function ingestHistoricalData(options: {
  seasons: string[];
  weeks: number[];
  playerLimit?: number;
}) {
  const { seasons, weeks, playerLimit = 400 } = options;

  // First get current players for filtering
  console.log('Fetching current players...');
  const players = await fetchFromSleeper<Record<string, SleeperPlayer>>('/players/nfl');
  const topPlayerIds = await getTopPlayers(players, playerLimit);

  // Store all players (we'll need this for position info)
  console.log('Storing player data...');
  for (const [id, player] of Object.entries(players)) {
    if (!player.position || !player.first_name || !player.last_name) continue;

    const fullName = player.full_name || `${player.first_name} ${player.last_name}`;

    await prisma.player.upsert({
      where: { id },
      update: {
        position: player.position,
        firstName: player.first_name,
        lastName: player.last_name,
        fullName,
        team: player.team || null,
        status: player.status || null,
        injuryStatus: player.injury_status,
        number: player.number || null,
        age: player.age || null,
        yearsExp: player.years_exp || null,
      },
      create: {
        id,
        position: player.position,
        firstName: player.first_name,
        lastName: player.last_name,
        fullName,
        team: player.team || null,
        status: player.status || null,
        injuryStatus: player.injury_status,
        number: player.number || null,
        age: player.age || null,
        yearsExp: player.years_exp || null,
      },
    });
  }

  // Process each season
  for (const season of seasons) {
    console.log(`\nProcessing season ${season}...`);

    // Process each week
    for (const week of weeks) {
      console.log(`Processing week ${week}...`);

      // Get stats and projections
      const [stats, projections] = await Promise.all([
        fetchFromSleeper<Record<string, SleeperStats>>(`/stats/nfl/regular/${season}/${week}`),
        fetchFromSleeper<Record<string, SleeperStats>>(
          `/projections/nfl/regular/${season}/${week}`
        ),
      ]);

      // For position-level variance: store all player stats
      for (const [playerId, playerStats] of Object.entries(stats)) {
        if (playerId.startsWith('TEAM_')) continue;
        if (!playerStats.pts_ppr) continue;

        await prisma.playerStats.upsert({
          where: {
            playerId_week_season_statsType: {
              playerId,
              week,
              season,
              statsType: 'stats',
            },
          },
          update: {
            stats: playerStats,
          },
          create: {
            playerId,
            week,
            season,
            statsType: 'stats',
            stats: playerStats,
          },
        });
      }

      // For player-specific variance: store projections for top players
      for (const [playerId, playerProjections] of Object.entries(projections)) {
        // For recent seasons, only store top players
        if (season === '2024' && !topPlayerIds.includes(playerId)) continue;
        if (playerId.startsWith('TEAM_')) continue;
        if (!playerProjections.pts_ppr) continue;

        await prisma.playerStats.upsert({
          where: {
            playerId_week_season_statsType: {
              playerId,
              week,
              season,
              statsType: 'projections',
            },
          },
          update: {
            stats: playerProjections,
          },
          create: {
            playerId,
            week,
            season,
            statsType: 'projections',
            stats: playerProjections,
          },
        });
      }

      // Calculate variance metrics for this week
      await calculateVarianceMetrics({ season, week });
      console.log(`Completed week ${week}`);
    }

    console.log(`Completed season ${season}`);
  }
}

// For CLI usage
if (require.main === module) {
  const seasons = ['2022', '2023', '2024'];
  const weeks = Array.from({ length: 18 }, (_, i) => i + 1); // Weeks 1-18

  ingestHistoricalData({ seasons, weeks })
    .then(() => {
      console.log('Historical data ingestion complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to ingest historical data:', error);
      process.exit(1);
    });
}
