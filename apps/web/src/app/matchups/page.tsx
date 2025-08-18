'use client';

import { useState } from 'react';
import { Container, PageHeader } from '@gauntlet/ui';
import { useMatchups } from '@/lib/hooks';
import ContentLoader from 'react-content-loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const MatchupsPageLoader = () => (
  <ContentLoader
    speed={2}
    width={1200}
    height={800}
    viewBox='0 0 1200 800'
    backgroundColor='hsl(var(--muted))'
    foregroundColor='hsl(var(--muted-foreground))'
  >
    {/* Title */}
    <rect x='16' y='32' rx='3' ry='3' width='300' height='32' />
    <rect x='16' y='72' rx='3' ry='3' width='150' height='20' />

    {/* Week selector */}
    <rect x='16' y='120' rx='8' ry='8' width='200' height='40' />

    {/* Matchup cards */}
    <rect x='16' y='180' rx='8' ry='8' width='560' height='160' />
    <rect x='600' y='180' rx='8' ry='8' width='560' height='160' />
    <rect x='16' y='360' rx='8' ry='8' width='560' height='160' />
    <rect x='600' y='360' rx='8' ry='8' width='560' height='160' />
    <rect x='16' y='540' rx='8' ry='8' width='560' height='160' />
    <rect x='600' y='540' rx='8' ry='8' width='560' height='160' />
  </ContentLoader>
);

interface MatchupCardProps {
  matchup: {
    matchupId: number;
    teams: Array<{
      rosterId: number;
      owner: {
        id: string;
        username: string;
        displayName: string;
        avatar?: string;
      } | null;
      points: number;
      customPoints?: number;
      starters: string[];
      startersPoints: number[] | Record<string, number>;
      players: string[];
      playersPoints: Record<string, number>;
    }>;
    summary?: {
      pointsA: number;
      pointsB: number;
      winnerRosterId?: number;
      margin: number;
    } | null;
  };
  week: number;
}

function MatchupCard({ matchup, week }: MatchupCardProps) {
  const [teamA, teamB] = matchup.teams;

  if (!teamA || !teamB) {
    return null;
  }

  const winner = matchup.summary?.winnerRosterId;
  const isTeamAWinner = winner === teamA.rosterId;
  const isTeamBWinner = winner === teamB.rosterId;

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='text-lg'>Matchup {matchup.matchupId}</CardTitle>
        <CardDescription>Week {week}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Team A */}
        <div
          className={`flex items-center justify-between p-4 rounded-lg border ${
            isTeamAWinner
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
              : 'bg-muted/20 border-muted'
          }`}
        >
          <div className='flex items-center space-x-3'>
            <Link href={`/team/${teamA.rosterId}`} className='hover:underline'>
              <div className='flex items-center space-x-2'>
                <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold'>
                  {teamA.owner?.displayName?.charAt(0) || 'T'}
                </div>
                <div>
                  <p className='font-medium'>{teamA.owner?.displayName || 'Team A'}</p>
                  <p className='text-sm text-muted-foreground'>
                    @{teamA.owner?.username || 'unknown'}
                  </p>
                </div>
              </div>
            </Link>
            {isTeamAWinner && <Badge variant='secondary'>Winner</Badge>}
          </div>
          <div className='text-right'>
            <p className='text-2xl font-bold'>{teamA.points.toFixed(1)}</p>
            <p className='text-sm text-muted-foreground'>{teamA.starters.length} starters</p>
          </div>
        </div>

        {/* VS divider */}
        <div className='flex items-center justify-center'>
          <div className='bg-muted px-3 py-1 rounded-full text-sm font-medium'>
            VS
            {matchup.summary && (
              <span className='ml-2 text-muted-foreground'>
                (Margin: {matchup.summary.margin.toFixed(1)})
              </span>
            )}
          </div>
        </div>

        {/* Team B */}
        <div
          className={`flex items-center justify-between p-4 rounded-lg border ${
            isTeamBWinner
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
              : 'bg-muted/20 border-muted'
          }`}
        >
          <div className='flex items-center space-x-3'>
            <Link href={`/team/${teamB.rosterId}`} className='hover:underline'>
              <div className='flex items-center space-x-2'>
                <div className='w-8 h-8 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground text-sm font-semibold'>
                  {teamB.owner?.displayName?.charAt(0) || 'T'}
                </div>
                <div>
                  <p className='font-medium'>{teamB.owner?.displayName || 'Team B'}</p>
                  <p className='text-sm text-muted-foreground'>
                    @{teamB.owner?.username || 'unknown'}
                  </p>
                </div>
              </div>
            </Link>
            {isTeamBWinner && <Badge variant='secondary'>Winner</Badge>}
          </div>
          <div className='text-right'>
            <p className='text-2xl font-bold'>{teamB.points.toFixed(1)}</p>
            <p className='text-sm text-muted-foreground'>{teamB.starters.length} starters</p>
          </div>
        </div>

        {/* Match Details Button */}
        <div className='pt-2'>
          <Link href={`/matchups/${matchup.matchupId}?week=${week}`}>
            <Button variant='outline' className='w-full'>
              View Match Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MatchupsPage() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  // For now, we'll hardcode a league ID - in a real app this would come from context or routing
  const leagueId = '997670420490801152'; // This should be dynamic

  const { data: matchups, isLoading: loading, error } = useMatchups(leagueId, selectedWeek);

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <MatchupsPageLoader />
      </div>
    );
  }

  if (error) {
    return (
      <Container className='py-8'>
        <PageHeader title='Error Loading Matchups' subtitle='Failed to load matchup data' />
        <div className='mt-4 text-destructive'>{String(error)}</div>
      </Container>
    );
  }

  // Generate week options (1-17 for regular season)
  const weekOptions = Array.from({ length: 17 }, (_, i) => i + 1);

  return (
    <Container className='py-8'>
      <PageHeader title='Matchups' subtitle={`View head-to-head matchups for each week`} />

      {/* Week Selector */}
      <div className='mb-6'>
        <label htmlFor='week-select' className='block text-sm font-medium text-foreground mb-2'>
          Select Week
        </label>
        <select
          id='week-select'
          value={selectedWeek}
          onChange={e => setSelectedWeek(parseInt(e.target.value))}
          className='px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
        >
          {weekOptions.map(week => (
            <option key={week} value={week}>
              Week {week}
            </option>
          ))}
        </select>
      </div>

      {/* Debug Panel (temporary) */}
      {process.env.NODE_ENV === 'development' && (
        <div className='mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800'>
          <h4 className='font-semibold text-yellow-800 dark:text-yellow-200 mb-2'>Debug Info</h4>
          <div className='text-sm text-yellow-700 dark:text-yellow-300 space-y-1'>
            <p>
              <strong>League ID:</strong> {leagueId}
            </p>
            <p>
              <strong>Selected Week:</strong> {selectedWeek}
            </p>
            <p>
              <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Error:</strong> {error || 'None'}
            </p>
            <p>
              <strong>Matchups Array:</strong>{' '}
              {matchups?.matchups ? `${matchups.matchups.length} items` : 'undefined/null'}
            </p>
            <p>
              <strong>Raw Response:</strong>{' '}
              {JSON.stringify(matchups, null, 2)?.substring(0, 200) || 'No data'}...
            </p>
          </div>
        </div>
      )}

      {/* Matchups Grid */}
      {matchups?.matchups && matchups.matchups.length > 0 ? (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {matchups.matchups.map(matchup => (
            <MatchupCard key={matchup.matchupId} matchup={matchup} week={selectedWeek} />
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <p className='text-muted-foreground text-lg'>No matchups found for Week {selectedWeek}</p>
          <p className='text-muted-foreground text-sm mt-2'>
            Try selecting a different week or check if data is available.
          </p>
          <div className='mt-4 text-xs text-muted-foreground'>
            <p>
              Debug: Loading={loading ? 'true' : 'false'}, Error={error || 'none'}
            </p>
            <p>
              Matchups:{' '}
              {matchups?.matchups ? `${matchups.matchups.length} found` : 'null/undefined'}
            </p>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {matchups?.matchups && matchups.matchups.length > 0 && (
        <div className='mt-8 pt-6 border-t'>
          <h3 className='text-lg font-semibold mb-4'>Week {selectedWeek} Summary</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold text-primary'>{matchups.matchups.length}</p>
              <p className='text-sm text-muted-foreground'>Total Matchups</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
                {matchups.matchups
                  .reduce(
                    (sum, m) => sum + (m.teams[0]?.points || 0) + (m.teams[1]?.points || 0),
                    0
                  )
                  .toFixed(1)}
              </p>
              <p className='text-sm text-muted-foreground'>Total Points</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                {(
                  matchups.matchups.reduce((avg, m) => {
                    const total = (m.teams[0]?.points || 0) + (m.teams[1]?.points || 0);
                    return avg + total / 2;
                  }, 0) / matchups.matchups.length
                ).toFixed(1)}
              </p>
              <p className='text-sm text-muted-foreground'>Avg Points/Team</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                {Math.max(
                  ...matchups.matchups.map(m =>
                    Math.max(m.teams[0]?.points || 0, m.teams[1]?.points || 0)
                  )
                ).toFixed(1)}
              </p>
              <p className='text-sm text-muted-foreground'>Highest Score</p>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
