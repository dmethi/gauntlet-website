import { PrismaClient } from '../generated/prisma';
import axios from 'axios';

const prisma = new PrismaClient();
const SLEEPER_API = 'https://api.sleeper.app/v1';

interface SleeperPlayer {
  player_id: string;
  position?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  hashtag?: string;
  team?: string;
  status?: string;
  injury_status?: string | null;
  weight?: string;
  height?: string;
  number?: number;
  age?: number;
  years_exp?: number;
  depth_chart_order?: number;
}

async function getAllPlayers(): Promise<Record<string, SleeperPlayer>> {
  const response = await axios.get(`${SLEEPER_API}/players/nfl`);
  return response.data;
}

async function main() {
  try {
    console.log('Fetching all players...');
    const players = await getAllPlayers();

    console.log('Upserting players...');
    let count = 0;
    for (const [id, player] of Object.entries(players)) {
      if (!player.position) continue;

      await prisma.player.upsert({
        where: { id },
        update: {
          hashtag: player.hashtag || null,
          firstName: player.first_name || '',
          lastName: player.last_name || '',
          fullName:
            player.full_name || `${player.first_name || ''} ${player.last_name || ''}`.trim() || id,
          team: player.team || null,
          position: player.position,
          depthChartOrder: player.depth_chart_order || null,
          status: player.status || null,
          injuryStatus: player.injury_status || null,
          weight: player.weight || null,
          height: player.height || null,
          number: player.number || null,
          age: player.age || null,
          yearsExp: player.years_exp || null,
        },
        create: {
          id,
          hashtag: player.hashtag || null,
          firstName: player.first_name || '',
          lastName: player.last_name || '',
          fullName:
            player.full_name || `${player.first_name || ''} ${player.last_name || ''}`.trim() || id,
          team: player.team || null,
          position: player.position,
          depthChartOrder: player.depth_chart_order || null,
          status: player.status || null,
          injuryStatus: player.injury_status || null,
          weight: player.weight || null,
          height: player.height || null,
          number: player.number || null,
          age: player.age || null,
          yearsExp: player.years_exp || null,
        },
      });
      count++;
    }

    console.log(`Upserted ${count} players`);
  } catch (error) {
    console.error('Error ingesting players:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
