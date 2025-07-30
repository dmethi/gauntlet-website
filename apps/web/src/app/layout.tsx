import { PrismaClient } from '../generated/prisma';
import { Sidebar } from '@/components/sidebar';
import './globals.css';

const prisma = new PrismaClient();

async function getTeams() {
  // First get the league ID
  const league = await prisma.league.findFirst({
    where: {
      season: '2023', // We want the 2023 season league
    },
  });

  if (!league) {
    return [];
  }

  // Then get all rosters with their owners
  const rosters = await prisma.roster.findMany({
    where: {
      leagueId: league.id,
    },
    include: {
      owner: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  const teams = rosters.map(roster => ({
    id: roster.id.toString(),
    name:
      (roster.owner?.metadata as any)?.team_name ||
      roster.owner?.displayName ||
      roster.owner?.username ||
      `Team ${roster.id}`,
    owner: roster.owner?.displayName || roster.owner?.username || 'Unknown',
  }));

  return teams;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const teams = await getTeams();
  console.log('Teams passed to Sidebar:', JSON.stringify(teams, null, 2));

  return (
    <html lang='en'>
      <body>
        <div className='flex h-screen'>
          <Sidebar teams={teams} />
          <main className='flex-1 overflow-auto bg-gray-100'>{children}</main>
        </div>
      </body>
    </html>
  );
}
