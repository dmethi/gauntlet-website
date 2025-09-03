'use client';

import Link from 'next/link';
import { Container, PageHeader } from '@gauntlet/ui';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface League {
  id: string;
  name: string;
  season: string;
  totalRosters: number;
  status: string;
  rosters: Array<{
    id: number;
    settings?: {
      division?: number;
    };
    owner?: {
      displayName: string;
      username: string;
      avatar?: string;
      metadata?: {
        team_name?: string;
      };
    };
    coOwnerDetails?: Array<{
      displayName?: string;
      username?: string;
    }>;
  }>;
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

function TeamsPageContent() {
  const searchParams = useSearchParams();
  const leagueIdParam = searchParams.get('leagueId');

  const {
    data: leaguesData,
    isLoading: loading,
    error,
  } = useQuery<LeaguesResponse>({
    queryKey: ['leagues'],
    queryFn: fetchLeagues,
  });

  const allLeagues = leaguesData?.data || [];
  // Filter to specific league if leagueId is provided, otherwise show all
  const leagues = leagueIdParam
    ? allLeagues.filter(league => league.id === leagueIdParam)
    : allLeagues;

  const getTeamName = (roster: League['rosters'][number]) =>
    roster.owner?.metadata?.team_name ||
    roster.owner?.displayName ||
    roster.owner?.username ||
    `Team ${roster.id}`;

  const getAvatarUrl = (avatar?: string | null) => {
    if (!avatar) return undefined;
    if (avatar.startsWith('http')) return avatar;
    return `https://sleepercdn.com/avatars/${avatar}`;
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
    return (first + last).toUpperCase() || name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Container className='py-8'>
        <PageHeader title='All Teams' subtitle='Loading teams across all leagues...' />
        <div className='space-y-6'>
          {[1, 2].map(i => (
            <Card key={i} className='animate-pulse'>
              <CardHeader>
                <div className='h-6 bg-gray-200 rounded w-1/4'></div>
                <div className='h-4 bg-gray-200 rounded w-1/3'></div>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className='h-20 bg-gray-200 rounded'></div>
                  ))}
                </div>
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
        <PageHeader title='All Teams' subtitle='Failed to load team data' />
        <Card>
          <CardContent className='pt-6'>
            <p className='text-destructive'>{String(error)}</p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const totalTeams = leagues.reduce((sum, league) => sum + league.rosters.length, 0);

  // Division name mapping
  const getDivisionName = (divisionNum: number) => {
    const divisionNames = {
      1: 'North',
      2: 'South',
      3: 'East',
    };
    return divisionNames[divisionNum as keyof typeof divisionNames] || `Division ${divisionNum}`;
  };

  // Get all owners for a roster (primary + co-owners)
  const getAllOwners = (roster: League['rosters'][number]) => {
    const owners = [];

    // Add primary owner
    if (roster.owner) {
      const primaryOwner = roster.owner.displayName || roster.owner.username || 'Unknown';
      owners.push(primaryOwner);
    }

    // Add co-owners
    if (roster.coOwnerDetails && roster.coOwnerDetails.length > 0) {
      roster.coOwnerDetails.forEach(coOwner => {
        const coOwnerName = coOwner.displayName || coOwner.username || 'Unknown Co-owner';
        owners.push(coOwnerName);
      });
    }

    return owners;
  };

  // Format owners for display
  const formatOwners = (owners: string[]) => {
    if (owners.length === 0) return 'Unknown';
    if (owners.length === 1) return `Owner: ${owners[0]}`;
    if (owners.length === 2) return `Owners: ${owners[0]} & ${owners[1]}`;
    return `Owners: ${owners.slice(0, -1).join(', ')} & ${owners[owners.length - 1]}`;
  };

  return (
    <Container className='py-8'>
      <PageHeader
        title={leagueIdParam ? `${leagues[0]?.name || 'League'} Teams` : 'All Teams'}
        subtitle={
          leagueIdParam
            ? `${totalTeams} teams across ${
                leagues[0]?.rosters.reduce((divisions, roster) => {
                  const division = roster.settings?.division || 0;
                  return divisions.includes(division) ? divisions : [...divisions, division];
                }, [] as number[]).length || 0
              } divisions • 2025 Season`
            : `${totalTeams} teams across ${leagues.length} leagues • 2025 Season`
        }
      />

      <div className='space-y-8'>
        {leagues.map(league => (
          <Card key={league.id}>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Trophy className='h-5 w-5 text-gauntlet-gold' />
                {league.name}
                <Badge variant='outline' className='ml-2'>
                  <Users className='h-3 w-3 mr-1' />
                  {league.rosters.length} teams
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {league.rosters.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <p>No teams found for this league.</p>
                </div>
              ) : (
                <div className='space-y-6'>
                  {(() => {
                    // Group rosters by division
                    const divisions = league.rosters.reduce(
                      (acc, roster) => {
                        const division = roster.settings?.division || 0;
                        if (!acc[division]) {
                          acc[division] = [];
                        }
                        acc[division].push(roster);
                        return acc;
                      },
                      {} as Record<number, typeof league.rosters>
                    );

                    // Sort divisions by key and render each
                    return Object.entries(divisions)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([divisionNum, rosters]) => (
                        <div key={divisionNum}>
                          <div className='flex items-center gap-2 mb-3'>
                            <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                              {getDivisionName(Number(divisionNum))}
                            </h3>
                            <div className='flex-1 h-px bg-border' />
                          </div>
                          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                            {rosters.map(roster => {
                              const name = getTeamName(roster);
                              const allOwners = getAllOwners(roster);
                              const ownersText = formatOwners(allOwners);
                              const avatarUrl = getAvatarUrl(roster.owner?.avatar);
                              const initials = getInitials(name);
                              const hasMultipleOwners = allOwners.length > 1;

                              return (
                                <Link
                                  key={roster.id}
                                  href={`/team/${roster.id}`}
                                  className='group rounded-md border border-border bg-card/50 p-3 flex items-center gap-3 hover:bg-muted/50 hover:shadow-sm transition-all duration-200 ease'
                                >
                                  <div className='h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center text-sm font-semibold flex-shrink-0 relative'>
                                    {avatarUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={avatarUrl}
                                        alt={`${name} avatar`}
                                        className='h-full w-full object-cover'
                                      />
                                    ) : (
                                      <span>{initials}</span>
                                    )}
                                    {hasMultipleOwners && (
                                      <div className='absolute -top-1 -right-1 h-3 w-3 bg-gauntlet-regal-gold rounded-full border border-background flex items-center justify-center'>
                                        <Users className='h-1.5 w-1.5 text-background' />
                                      </div>
                                    )}
                                  </div>
                                  <div className='min-w-0 flex-1'>
                                    <div className='font-medium truncate group-hover:underline text-sm'>
                                      {name}
                                    </div>
                                    <div
                                      className='text-muted-foreground text-xs truncate'
                                      title={ownersText}
                                    >
                                      {ownersText}
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ));
                  })()}
                </div>
              )}
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

export default function TeamsPage() {
  return (
    <Suspense
      fallback={
        <Container>
          <PageHeader title='Teams' />
          <div className='animate-pulse'>
            <div className='h-32 bg-muted rounded-lg mb-4' />
            <div className='space-y-2'>
              <div className='h-4 bg-muted rounded w-1/4' />
              <div className='h-4 bg-muted rounded w-1/2' />
            </div>
          </div>
        </Container>
      }
    >
      <TeamsPageContent />
    </Suspense>
  );
}
