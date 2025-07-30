import { PrismaClient } from '../generated/prisma';
import { Sidebar } from '@/components/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { montserrat, geizer } from '@/lib/fonts';
import './globals.css';

const prisma = new PrismaClient();

// Metadata for the app
export const metadata = {
  title: 'The Gauntlet - Fantasy Football',
  description: 'Medieval fantasy football with balanced red & gold aesthetics',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F3E9D2' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1A1A' },
  ],
};

async function getTeams() {
  // First get the league ID
  const league = await prisma.league.findFirst({
    where: {
      season: '2024', // Updated to 2024 season
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

  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${montserrat.variable} ${geizer.variable}`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <div className='flex h-screen'>
            <Sidebar teams={teams} />
            <main className='flex-1 overflow-auto bg-background'>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
