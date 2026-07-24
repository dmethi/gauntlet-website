import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Container, PageHeader } from '@gauntlet/ui';
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
    <Container className="py-8">
      <PageHeader
        title="The Gauntlet Competition"
        subtitle="Two leagues, one ultimate championship"
      />

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
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {standings.map(league => (
            <Card key={league.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{league.name}</CardTitle>
                  {league.conference && <Badge variant="outline">{league.conference}</Badge>}
                </div>
                <CardDescription>Season {league.season} standings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border border-border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Rank</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Record</TableHead>
                        <TableHead>Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {league.rows.map((row, index) => (
                        <TableRow key={row.rosterId}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {row.wins}-{row.losses}
                              {row.ties ? `-${row.ties}` : ''}
                            </Badge>
                          </TableCell>
                          <TableCell>{row.pointsFor.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/league/overview?leagueId=${league.id}`}>
                      Full standings
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
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
    </Container>
  );
}
