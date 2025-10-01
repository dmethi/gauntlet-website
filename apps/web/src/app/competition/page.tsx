'use client';

import { Container, PageHeader } from '@gauntlet/ui';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronDown, ChevronRight, ChevronUp, Trophy, Users } from 'lucide-react';
import Link from 'next/link';
import { useLeagueOverviewClient } from '@/hooks/useLeagueOverviewClient';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface League {
  id: string;
  name: string;
  season: string;
  totalRosters: number;
  status: string;
  rosters: Array<{
    id: number;
    owner?: {
      displayName: string;
      username: string;
      avatar?: string;
    };
  }>;
  _count: {
    rosters: number;
    matchups: number;
    transactions: number;
  };
}

interface LeaguesResponse {
  ok: boolean;
  data: League[];
  count: number;
}

async function fetchLeagues(): Promise<LeaguesResponse> {
  const response = await fetch('/api/leagues');
  if (!response.ok) {
    throw new Error('Failed to fetch leagues');
  }
  return response.json();
}

// Component to display league standings for both leagues
function LeagueStandingsSection() {
  const afcLeagueId = '1263744209295245312';
  const nfcLeagueId = '1263740549504962561';

  const {
    league: afcLeague,
    loading: afcLoading,
    teamStats: afcTeamStats,
  } = useLeagueOverviewClient(afcLeagueId);
  const {
    league: nfcLeague,
    loading: nfcLoading,
    teamStats: nfcTeamStats,
  } = useLeagueOverviewClient(nfcLeagueId);

  const [sortKey, setSortKey] = useState<'team' | 'record' | 'points' | 'expectedWins' | 'luck'>(
    'points'
  );
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const onSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'team' ? 'asc' : 'desc');
    }
  };

  const getSortedTeamStats = (teamStats: any[]) => {
    const data = [...teamStats];
    const winPct = (t: any) => (t.wins + t.losses > 0 ? t.wins / (t.wins + t.losses) : 0);

    data.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      switch (sortKey) {
        case 'team':
          av = a.name;
          bv = b.name;
          break;
        case 'record':
          av = winPct(a);
          bv = winPct(b);
          break;
        case 'points':
          av = a.totalPoints;
          bv = b.totalPoints;
          break;
        case 'expectedWins':
          av = a.expectedWins;
          bv = b.expectedWins;
          break;
        case 'luck':
          av = a.luckRating;
          bv = b.luckRating;
          break;
        default:
          av = a.totalPoints;
          bv = b.totalPoints;
      }
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const diff = Number(av) - Number(bv);
      return sortDir === 'asc' ? diff : -diff;
    });
    return data;
  };

  const getDivisionName = (division: number) => {
    const divisions = ['North', 'South', 'East', 'West'];
    return divisions[division - 1] || 'N/A';
  };

  if (afcLoading || nfcLoading) {
    return (
      <div className='mb-8'>
        <Card>
          <CardHeader>
            <CardTitle>League Standings</CardTitle>
            <CardDescription>Loading standings...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='animate-pulse'>
              <div className='h-32 bg-muted rounded'></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const afcSortedStats = getSortedTeamStats(afcTeamStats);
  const nfcSortedStats = getSortedTeamStats(nfcTeamStats);

  return (
    <div className='mb-8'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5 text-gauntlet-gold' />
            League Standings
          </CardTitle>
          <CardDescription>Current team rankings across both leagues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-8 lg:grid-cols-2'>
            {/* AFC Standings */}
            <div>
              <h3 className='mb-4 text-lg font-semibold'>{afcLeague?.name || 'Gauntlet AFC'}</h3>
              <div className='overflow-x-auto rounded-md border border-border bg-card'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[60px]'>Rank</TableHead>
                      <TableHead>
                        <button
                          className='flex items-center gap-1 px-1 py-0.5 -mx-1 -my-0.5 rounded hover:text-card-foreground hover:bg-muted/50 active:bg-muted/70 transition-all duration-200 ease-out motion-reduce:transition-none'
                          onClick={() => onSort('team')}
                          aria-label='Sort by Team'
                        >
                          <span>Team</span>
                          {sortKey === 'team' &&
                            (sortDir === 'asc' ? (
                              <ChevronUp className='h-3 w-3' />
                            ) : (
                              <ChevronDown className='h-3 w-3' />
                            ))}
                        </button>
                      </TableHead>
                      <TableHead className='w-[80px]'>Division</TableHead>
                      <TableHead>
                        <button
                          className='flex items-center gap-1 px-1 py-0.5 -mx-1 -my-0.5 rounded hover:text-card-foreground hover:bg-muted/50 active:bg-muted/70 transition-all duration-200 ease-out motion-reduce:transition-none'
                          onClick={() => onSort('record')}
                          aria-label='Sort by Record'
                        >
                          <span>Record</span>
                          {sortKey === 'record' &&
                            (sortDir === 'asc' ? (
                              <ChevronUp className='h-3 w-3' />
                            ) : (
                              <ChevronDown className='h-3 w-3' />
                            ))}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          className='flex items-center gap-1 px-1 py-0.5 -mx-1 -my-0.5 rounded hover:text-card-foreground hover:bg-muted/50 active:bg-muted/70 transition-all duration-200 ease-out motion-reduce:transition-none'
                          onClick={() => onSort('points')}
                          aria-label='Sort by Points'
                        >
                          <span>Points</span>
                          {sortKey === 'points' &&
                            (sortDir === 'asc' ? (
                              <ChevronUp className='h-3 w-3' />
                            ) : (
                              <ChevronDown className='h-3 w-3' />
                            ))}
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {afcSortedStats.map((team: any) => (
                      <TableRow key={team.id} className='hover:bg-muted/50'>
                        <TableCell>{team.canonicalRank}</TableCell>
                        <TableCell className='font-medium'>{team.name}</TableCell>
                        <TableCell>
                          <Badge variant='outline' className='text-xs'>
                            {getDivisionName(team.division)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>
                            {team.wins}-{team.losses}
                          </Badge>
                        </TableCell>
                        <TableCell>{team.totalPoints.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* NFC Standings */}
            <div>
              <h3 className='mb-4 text-lg font-semibold'>{nfcLeague?.name || 'Gauntlet NFC'}</h3>
              <div className='overflow-x-auto rounded-md border border-border bg-card'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[60px]'>Rank</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className='w-[80px]'>Division</TableHead>
                      <TableHead>Record</TableHead>
                      <TableHead>Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nfcSortedStats.map((team: any) => (
                      <TableRow key={team.id} className='hover:bg-muted/50'>
                        <TableCell>{team.canonicalRank}</TableCell>
                        <TableCell className='font-medium'>{team.name}</TableCell>
                        <TableCell>
                          <Badge variant='outline' className='text-xs'>
                            {getDivisionName(team.division)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>
                            {team.wins}-{team.losses}
                          </Badge>
                        </TableCell>
                        <TableCell>{team.totalPoints.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CompetitionPage() {
  const {
    data: leaguesData,
    isLoading,
    error,
  } = useQuery<LeaguesResponse>({
    queryKey: ['leagues'],
    queryFn: fetchLeagues,
  });

  const leagues = leaguesData?.data || [];

  if (isLoading) {
    return (
      <Container className='py-8'>
        <PageHeader title='The Gauntlet Competition' subtitle='Loading leagues...' />
        <div className='grid gap-6 md:grid-cols-2'>
          {[1, 2].map(i => (
            <Card key={i} className='animate-pulse'>
              <CardHeader>
                <div className='h-6 bg-gray-200 rounded w-3/4'></div>
                <div className='h-4 bg-gray-200 rounded w-1/2'></div>
              </CardHeader>
              <CardContent>
                <div className='h-20 bg-gray-200 rounded'></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className='py-8'>
        <PageHeader title='The Gauntlet Competition' subtitle='Failed to load leagues' />
        <Card>
          <CardContent className='pt-6'>
            <p className='text-destructive'>{String(error)}</p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pre_draft: { variant: 'outline' as const, label: 'Pre-Draft' },
      drafting: { variant: 'default' as const, label: 'Drafting' },
      in_season: { variant: 'secondary' as const, label: 'In Season' },
      complete: { variant: 'destructive' as const, label: 'Complete' },
    };

    const config = variants[status as keyof typeof variants] || variants.pre_draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Container className='py-8'>
      <PageHeader
        title='The Gauntlet Competition'
        subtitle='Two leagues, one ultimate championship'
      />

      <div className='mb-8'>
        <Card className='bg-gradient-to-r from-gauntlet-crimson/5 to-gauntlet-gold/5 border-gauntlet-crimson/20'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5 text-gauntlet-gold' />
              The Gauntlet Format
            </CardTitle>
            <CardDescription>
              A unique two-league system with promotion and relegation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-3'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gauntlet-crimson'>2</div>
                <div className='text-sm text-muted-foreground'>Leagues</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gauntlet-crimson'>24</div>
                <div className='text-sm text-muted-foreground'>Total Teams</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gauntlet-crimson'>6</div>
                <div className='text-sm text-muted-foreground'>Playoff Teams Each</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Section */}
      <div className='mb-8'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5 text-gauntlet-gold' />
              Reports
            </CardTitle>
            <CardDescription>Weekly recaps and draft analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <Link
                href='/competition/reports/2025/week-4'
                className='block p-3 rounded-md bg-gauntlet-gold/10 hover:bg-gauntlet-gold/20 transition-colors'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-semibold text-gauntlet-gold'>Week 4 Report — 2025</div>
                    <div className='text-sm text-muted-foreground'>
                      Latest • Undefeateds fall, chaos reigns
                    </div>
                  </div>
                  <ChevronRight className='h-4 w-4 text-gauntlet-gold' />
                </div>
              </Link>
              <Link
                href='/competition/reports/2025/week-3'
                className='block p-3 rounded-md hover:bg-muted/50 transition-colors'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>Week 3 Report — 2025</div>
                    <div className='text-sm text-muted-foreground'>
                      Championship contenders emerge
                    </div>
                  </div>
                  <ChevronRight className='h-4 w-4 text-muted-foreground' />
                </div>
              </Link>
              <Link
                href='/competition/reports/2025/week-2'
                className='block p-3 rounded-md hover:bg-muted/50 transition-colors'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>Week 2 Report — 2025</div>
                    <div className='text-sm text-muted-foreground'>AFC + NFC recaps</div>
                  </div>
                  <ChevronRight className='h-4 w-4 text-muted-foreground' />
                </div>
              </Link>
              <Link
                href='/competition/reports/2025/week-1'
                className='block p-3 rounded-md hover:bg-muted/50 transition-colors'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>Week 1 Report — 2025</div>
                    <div className='text-sm text-muted-foreground'>
                      Draft analysis + first matchups
                    </div>
                  </div>
                  <ChevronRight className='h-4 w-4 text-muted-foreground' />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* League Standings */}
      <LeagueStandingsSection />

      <div className='grid gap-6 md:grid-cols-2'>
        {leagues.map((league, index) => (
          <Card key={league.id} className='hover:shadow-lg transition-shadow'>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    {league.name}
                    {getStatusBadge(league.status)}
                  </CardTitle>
                  <CardDescription className='flex items-center gap-4 mt-1'>
                    <span className='flex items-center gap-1'>
                      <Calendar className='h-3 w-3' />
                      {league.season} Season
                    </span>
                    <span className='flex items-center gap-1'>
                      <Users className='h-3 w-3' />
                      {league.totalRosters} Teams
                    </span>
                  </CardDescription>
                </div>
                <Badge variant='outline' className='ml-2'>
                  {index === 0 ? 'AFC' : 'NFC'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='text-sm text-muted-foreground'>
                  <p>
                    {league._count.rosters > 0
                      ? `${league._count.rosters} teams ready for action`
                      : 'Teams are being set up'}
                  </p>
                  <p>
                    {league._count.matchups > 0
                      ? `${league._count.matchups} matchups played`
                      : "Season hasn't started yet"}
                  </p>
                </div>

                <div className='flex gap-2'>
                  <Button asChild variant='default' size='sm' className='flex-1'>
                    <Link href={`/league/overview?leagueId=${league.id}`}>
                      <span>View League</span>
                      <ChevronRight className='h-3 w-3 ml-1' />
                    </Link>
                  </Button>
                  <Button asChild variant='outline' size='sm'>
                    <Link href={`/teams?leagueId=${league.id}`}>Teams</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {leagues.length === 0 && (
        <Card>
          <CardContent className='pt-6 text-center'>
            <p className='text-muted-foreground'>No leagues found. Check back soon!</p>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
