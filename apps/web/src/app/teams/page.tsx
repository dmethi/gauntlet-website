'use client';

import Link from 'next/link';
import { Container, PageHeader } from '@gauntlet/ui';
import { useLeagueData } from '@/lib/hooks';

export default function TeamsPage() {
  const { league, loading } = useLeagueData();

  const getTeamName = (roster: NonNullable<typeof league>['rosters'][number]) =>
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
        <PageHeader title='Teams' subtitle='Loading teams…' />
        <div className='rounded-md border border-border p-6 bg-card text-muted-foreground'>
          Fetching league and team data.
        </div>
      </Container>
    );
  }

  if (!league) {
    return (
      <Container className='py-8'>
        <PageHeader title='Teams' subtitle='No league data available' />
        <div className='rounded-md border border-border p-6 bg-card text-muted-foreground'>
          We could not load league information for the current season.
        </div>
      </Container>
    );
  }

  return (
    <Container className='py-8'>
      <PageHeader title='Teams' subtitle={`${league.name} • Season ${league.season}`} />

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {league.rosters.map(roster => {
          const name = getTeamName(roster);
          const owner = roster.owner?.displayName || roster.owner?.username || 'Unknown';
          const avatarUrl = getAvatarUrl(roster.owner?.avatar as string | undefined);
          const initials = getInitials(name);
          return (
            <Link
              key={roster.id}
              href={`/team/${roster.id}`}
              className='group rounded-md border border-border bg-card p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors duration-200 ease-out'
            >
              <div className='h-12 w-12 rounded-full bg-muted overflow-hidden flex items-center justify-center text-sm font-semibold'>
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
              </div>
              <div className='min-w-0'>
                <div className='font-medium truncate group-hover:underline'>{name}</div>
                <div className='text-muted-foreground text-sm truncate'>Owner: {owner}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
