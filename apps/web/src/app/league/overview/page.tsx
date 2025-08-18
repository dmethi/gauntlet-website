'use client';

import { LeagueChart } from '@/components/league-chart';
import { useLeagueData, usePlayoffBracket } from '@/lib/hooks';
import { ChartContainer, ChartSkeleton, Container, PageHeader } from '@gauntlet/ui';
import ContentLoader from 'react-content-loader';
import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Download, RefreshCw, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayoffBracket } from '@/components/playoff-bracket';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const LeagueOverviewLoader = () => (
  <ContentLoader
    speed={2}
    width={1200}
    height={800}
    viewBox='0 0 1200 800'
    backgroundColor='#f3f3f3'
    foregroundColor='#ecebeb'
  >
    {/* Title and Subtitle */}
    <rect x='16' y='32' rx='3' ry='3' width='300' height='36' />
    <rect x='16' y='72' rx='3' ry='3' width='150' height='20' />

    {/* Team Rankings Table */}
    <rect x='16' y='128' rx='3' ry='3' width='200' height='28' />
    <rect x='16' y='168' rx='8' ry='8' width='1168' height='400' />

    {/* League Scoring Trends Chart */}
    <rect x='16' y='600' rx='3' ry='3' width='250' height='28' />
    <rect x='16' y='640' rx='8' ry='8' width='1168' height='150' />
  </ContentLoader>
);

export default function LeagueOverview() {
  const { league, loading, teamStats, weeklyAverages } = useLeagueData();
  const leagueId = league?.id ? String(league.id) : undefined;
  const { data: playoffBracket } = usePlayoffBracket(leagueId);
  const [sortKey, setSortKey] = useState<'team' | 'record' | 'points' | 'expectedWins' | 'luck'>(
    'points'
  );
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sortedTeamStats = useMemo(() => {
    const data = [...teamStats];
    const winPct = (t: (typeof teamStats)[number]) =>
      t.wins + t.losses > 0 ? t.wins / (t.wins + t.losses) : 0;
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
  }, [teamStats, sortKey, sortDir]);

  const onSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'team' ? 'asc' : 'desc');
    }
  };

  if (loading) {
    return (
      <Container className='py-8'>
        <LeagueOverviewLoader />
        <div className='mt-8'>
          <ChartContainer
            title='League Scoring Trends'
            description='Average points by week'
            height={384}
          >
            <ChartSkeleton height={320} />
          </ChartContainer>
        </div>
      </Container>
    );
  }

  if (!league) {
    return (
      <div className='flex items-center justify-center h-[80vh]'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-card-foreground mb-2'>League Not Found</h2>
          <p className='text-muted-foreground'>No league data available for the 2023 season.</p>
        </div>
      </div>
    );
  }

  return (
    <Container className='py-8'>
      <div className='flex items-start justify-between mb-8'>
        <PageHeader title={league.name} subtitle={`Season ${league.season}`} />
        <div className='flex gap-2 opacity-0 animate-in fade-in-0 duration-300 delay-150'>
          <Button
            variant='outline'
            size='sm'
            className='hover:scale-105 active:scale-95 transition-transform duration-200 ease-out motion-reduce:transform-none'
            onClick={() => {
              /* TODO: Implement data refresh */
            }}
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='hover:scale-105 active:scale-95 transition-transform duration-200 ease-out motion-reduce:transform-none'
            onClick={() => {
              /* TODO: Implement data export */
            }}
          >
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='hover:scale-105 active:scale-95 transition-transform duration-200 ease-out motion-reduce:transform-none'
            onClick={() => {
              /* TODO: Navigate to settings */
            }}
          >
            <Settings className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='mb-8'>
        <h2 className='mb-4 text-2xl font-bold'>Team Rankings</h2>
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
                    aria-label='Sort by Points For'
                  >
                    <span>Points For</span>
                    {sortKey === 'points' &&
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
                    onClick={() => onSort('expectedWins')}
                    aria-label='Sort by Expected Wins'
                  >
                    <span>Expected Wins</span>
                    {sortKey === 'expectedWins' &&
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
                    onClick={() => onSort('luck')}
                    aria-label='Sort by Luck'
                  >
                    <span>Luck</span>
                    {sortKey === 'luck' &&
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
              {sortedTeamStats.map(team => (
                <TableRow
                  key={team.id}
                  className='group cursor-pointer hover:bg-muted/50 active:bg-muted/70 transition-colors duration-200 ease-out motion-reduce:transition-none'
                  onClick={() => {
                    // TODO: Navigate to team page - this will be implemented when team pages are linked
                  }}
                >
                  <TableCell>{team.canonicalRank}</TableCell>
                  <TableCell className='font-medium'>{team.name}</TableCell>
                  <TableCell>
                    <Badge variant='secondary'>
                      {team.wins}-{team.losses}
                    </Badge>
                  </TableCell>
                  <TableCell>{team.totalPoints.toFixed(2)}</TableCell>
                  <TableCell>{team.expectedWins.toFixed(2)}</TableCell>
                  <TableCell>{team.luckRating.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Playoff Bracket */}
      <div className='mt-12'>
        <h2 className='mb-6 text-2xl font-bold'>Playoff Brackets</h2>
        <PlayoffBracket teams={teamStats} league={league} playoffBracket={playoffBracket} />
      </div>

      <div className='mt-12'>
        <LeagueChart data={weeklyAverages} />
      </div>
    </Container>
  );
}
