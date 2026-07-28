import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LegionStandingsCard, PageHeaderHero } from '@gauntlet/ui';
import { getCurrentLeagues } from '@/config/leagues';
import { getLeagueById, getRostersByLeague } from '@/lib/api-replacements';
import { ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Competition — The Gauntlet',
};

export const revalidate = 300;

interface StandingRow {
  rosterId: number;
  name: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
}

interface LeagueStandings {
  id: string;
  name: string;
  conference?: string;
  season: number;
  logo?: string;
  rows: StandingRow[];
}

const TOP_ROWS = 5;

const rosterName = (
  owner:
    | { metadata?: { team_name?: string }; display_name?: string; username?: string }
    | undefined,
  rosterId: number,
) => owner?.metadata?.team_name || owner?.display_name || owner?.username || `Team ${rosterId}`;

const loadLeagueStandings = async (league: {
  id: string;
  name: string;
  conference?: string;
  season: number;
  logo?: string;
}): Promise<LeagueStandings | null> => {
  try {
    const [leagueData, rosters] = await Promise.all([
      getLeagueById(league.id),
      getRostersByLeague(league.id),
    ]);

    if (!leagueData) return null;

    const rows = rosters
      .map(r => ({
        rosterId: r.rosterId,
        name: rosterName(r.owner, r.rosterId),
        wins: r.wins,
        losses: r.losses,
        ties: r.ties,
        pointsFor: r.pointsFor,
      }))
      .sort((a, b) => b.wins - a.wins || b.pointsFor - a.pointsFor)
      .slice(0, TOP_ROWS);

    return {
      id: league.id,
      name: league.name,
      conference: league.conference,
      season: league.season,
      logo: league.logo,
      rows,
    };
  } catch (error) {
    console.error(`Failed to load standings for league ${league.id}:`, error);
    return null;
  }
};

const EXPLORE_LINKS = [
  {
    href: '/competition/playoff-scenarios',
    label: 'Playoff Scenarios',
    description: 'Seeding odds and the AFC vs. NFC championship battle',
  },
  {
    href: '/competition/reports',
    label: 'Weekly Reports',
    description: 'Recaps and analysis for every week of the season',
  },
  {
    href: '/league/transactions',
    label: 'Transactions',
    description: 'Every add, drop, and trade across both leagues',
  },
  {
    href: '/league/draft',
    label: 'Draft Recap',
    description: 'Pick-by-pick results from draft day',
  },
  {
    href: '/start-sit',
    label: 'Start/Sit Optimizer',
    description: 'Lineup recommendations based on projected points',
  },
  {
    href: '/live',
    label: 'Live Scores',
    description: 'Follow matchups as they happen',
  },
];

export default async function CompetitionPage() {
  const leagues = getCurrentLeagues();
  const standings = (await Promise.all(leagues.map(loadLeagueStandings))).filter(
    (s): s is LeagueStandings => s !== null,
  );

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeaderHero title="Competition" crestSrc="/gauntlet_logo.svg" />

      <div className="py-8 space-y-10">
        {standings.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No leagues are live yet for the current season. Check out the{' '}
                <Link href="/archive/2025/competition" className="text-primary hover:underline">
                  2025 archive
                </Link>{' '}
                in the meantime.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {standings.map(league => (
              <LegionStandingsCard
                key={league.id}
                title={league.name}
                icon={
                  league.logo ? (
                    <img src={league.logo} alt="" width={20} height={20} className="shrink-0" />
                  ) : undefined
                }
                badge={
                  league.conference ? (
                    <Badge variant="outline" className="text-[10px]">
                      {league.conference}
                    </Badge>
                  ) : undefined
                }
                caption={`Season ${league.season} Standings`}
                rows={league.rows.map((row, index) => ({
                  rank: index + 1,
                  team: row.name,
                  record: `${row.wins}-${row.losses}${row.ties ? `-${row.ties}` : ''}`,
                  points: row.pointsFor,
                }))}
                footer={{ href: `/league/overview?leagueId=${league.id}`, label: 'Full standings' }}
              />
            ))}
          </div>
        )}

        <div>
          <h2 className="mb-4 text-2xl font-bold">Explore</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {EXPLORE_LINKS.map(link => (
              <Link key={link.href} href={link.href}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      {link.label}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
