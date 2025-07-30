import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { getVarianceModel } from '@gauntlet/sim-engine';

const prisma = new PrismaClient();
const SLEEPER_API = 'https://api.sleeper.app/v1';

interface SleeperProjections {
  pts_ppr?: number;
  pts_half_ppr?: number;
  pts_std?: number;
  [key: string]: any;
}

async function getWeeklyProjections(
  season: number,
  week: number
): Promise<Record<string, SleeperProjections>> {
  const response = await axios.get(`${SLEEPER_API}/projections/nfl/regular/${season}/${week}`);
  return response.data;
}

async function getPlayerInfo(playerId: string) {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
  });
  return player;
}

async function getPlayerVariance(playerId: string, season: string) {
  return prisma.playerVariance.findUnique({
    where: {
      playerId_season: {
        playerId,
        season,
      },
    },
  });
}

async function getPositionVariance(position: string, season: string) {
  return prisma.positionVariance.findUnique({
    where: {
      position_season: {
        position,
        season,
      },
    },
  });
}

function calculateRange(projection: number, stdDev: number) {
  // 95% confidence interval = ±1.96 standard deviations
  const range = projection * stdDev * 1.96;
  return {
    low: Math.max(0, projection - range),
    high: projection + range,
  };
}

async function main() {
  try {
    // Get Week 1 projections
    console.log('Fetching Week 1 projections...');
    const projections = await getWeeklyProjections(2024, 1);

    // Convert to array and sort by projected points
    const playerProjections = await Promise.all(
      Object.entries(projections)
        .filter(([_, proj]) => proj.pts_ppr)
        .map(async ([id, proj]) => {
          const player = await getPlayerInfo(id);
          return {
            id,
            name: player?.fullName || id,
            position: player?.position || 'UNKNOWN',
            projection: proj.pts_ppr || 0,
          };
        })
    );

    // Sort by projection and get top 10 per position
    const positions = ['QB', 'RB', 'WR', 'TE'];
    for (const position of positions) {
      const topPlayers = playerProjections
        .filter(p => p.position === position)
        .sort((a, b) => b.projection - a.projection)
        .slice(0, 10);

      console.log(`\n=== Top 10 ${position}s - Week 1 Projections ===`);

      for (const player of topPlayers) {
        // Get both player-specific and position-level variance
        const [playerVar, positionVar] = await Promise.all([
          getPlayerVariance(player.id, '2023'), // Use 2023 for most complete data
          getPositionVariance(position, '2023'),
        ]);

        console.log(`\n${player.name} (Projected: ${player.projection.toFixed(1)} pts)`);

        if (playerVar && playerVar.sampleSize >= 4) {
          const range = calculateRange(player.projection, playerVar.stdDev);
          console.log('Player-Specific Model:');
          console.log(`  Sample Size: ${playerVar.sampleSize} weeks`);
          console.log(`  Historical Bias: ${(playerVar.meanError * 100).toFixed(1)}%`);
          console.log(`  95% CI: ${range.low.toFixed(1)} to ${range.high.toFixed(1)}`);
        }

        if (positionVar) {
          const range = calculateRange(player.projection, positionVar.stdDev);
          console.log('Position-Level Model:');
          console.log(`  Sample Size: ${positionVar.sampleSize} weeks`);
          console.log(`  Historical Bias: ${(positionVar.meanError * 100).toFixed(1)}%`);
          console.log(`  95% CI: ${range.low.toFixed(1)} to ${range.high.toFixed(1)}`);
        }
      }
    }
  } catch (error) {
    console.error('Error analyzing projections:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
