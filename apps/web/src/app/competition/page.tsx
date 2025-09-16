'use client';

import { Container, PageHeader } from '@gauntlet/ui';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronRight, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

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
                href='/competition/reports/2025/week-2'
                className='block p-3 rounded-md bg-gauntlet-gold/10 hover:bg-gauntlet-gold/20 transition-colors'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-semibold text-gauntlet-gold'>Week 2 Report — 2025</div>
                    <div className='text-sm text-muted-foreground'>Latest • AFC + NFC recaps</div>
                  </div>
                  <ChevronRight className='h-4 w-4 text-gauntlet-gold' />
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
