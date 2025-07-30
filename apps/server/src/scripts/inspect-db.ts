import { PrismaClient } from '../generated/prisma';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const prisma = new PrismaClient();

async function inspectDb() {
  console.log('--- Inspecting Database ---');

  // Fetch all leagues
  console.log('\n--- Leagues ---');
  const leagues = await prisma.league.findMany();
  console.table(leagues);

  // Fetch all rosters
  if (leagues.length > 0) {
    console.log('\n--- Rosters ---');
    for (const league of leagues) {
      console.log(
        `\n--- Rosters for League: ${league.name} (ID: ${league.id}, Season: ${league.season}) ---`
      );
      const rosters = await prisma.roster.findMany({
        where: { leagueId: league.id },
        include: { owner: true },
      });
      console.table(
        rosters.map(r => ({
          rosterId: r.id,
          leagueId: r.leagueId,
          ownerId: r.ownerId,
          ownerName: r.owner?.displayName || r.owner?.username,
          players: r.players.length,
        }))
      );
    }
  } else {
    console.log('No leagues found, skipping roster inspection.');
  }

  console.log('\n--- Inspection Complete ---');
}

inspectDb()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
