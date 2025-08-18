'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { ChartContainer, ChartLegend, Container, PageHeader } from '@gauntlet/ui';
import {
  type PlayerInfo,
  type PlayerStats,
  useMatchup,
  usePlayerStats,
  usePlayers,
} from '@/lib/hooks';
import ContentLoader from 'react-content-loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const MatchupDetailLoader = () => (
  <ContentLoader
    speed={2}
    width={1200}
    height={1000}
    viewBox='0 0 1200 1000'
    backgroundColor='#f3f3f3'
    foregroundColor='#ecebeb'
  >
    {/* Header */}
    <rect x='16' y='32' rx='3' ry='3' width='200' height='32' />
    <rect x='16' y='72' rx='3' ry='3' width='300' height='20' />

    {/* Back button */}
    <rect x='16' y='120' rx='8' ry='8' width='120' height='40' />

    {/* Team headers */}
    <rect x='16' y='200' rx='8' ry='8' width='560' height='80' />
    <rect x='600' y='200' rx='8' ry='8' width='560' height='80' />

    {/* Roster tables */}
    <rect x='16' y='300' rx='8' ry='8' width='560' height='400' />
    <rect x='600' y='300' rx='8' ry='8' width='560' height='400' />

    {/* Summary stats */}
    <rect x='16' y='720' rx='8' ry='8' width='1144' height='120' />
  </ContentLoader>
);

interface PlayerRowProps {
  playerId: string;
  playerInfo?: PlayerInfo;
  playerStats?: PlayerStats;
  points: number;
  isStarter: boolean;
  position?: string;
}

function PlayerRow({
  playerId,
  playerInfo,
  playerStats,
  points,
  isStarter,
  position,
}: PlayerRowProps) {
  // Use actual player data if available, fallback to player ID
  const displayName = playerInfo?.fullName || `Player ${playerId}`;
  const playerPosition = playerInfo?.position || position || 'UNKNOWN';
  const team = playerInfo?.team || 'FA';

  // Extract projected fantasy points if available
  const projectedPoints = playerStats?.projections?.pts_ppr;
  const difference = projectedPoints ? points - projectedPoints : null;

  // Position-based badge colors
  const getPositionColor = (pos: string) => {
    switch (pos) {
      case 'QB':
        return 'bg-purple-100 text-purple-800';
      case 'RB':
        return 'bg-green-100 text-green-800';
      case 'WR':
        return 'bg-blue-100 text-blue-800';
      case 'TE':
        return 'bg-orange-100 text-orange-800';
      case 'K':
        return 'bg-yellow-100 text-yellow-800';
      case 'DEF':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show projection difference as a simple +/- indicator
  const projectionDifference =
    difference !== null ? (difference > 0 ? '+' : '') + difference.toFixed(1) : null;

  return (
    <tr className={`border-b ${isStarter ? 'bg-blue-50' : 'bg-gray-50'}`}>
      <td className='px-2 md:px-4 py-3'>
        <div className='flex items-center space-x-1 md:space-x-2'>
          <Badge className={`text-xs ${getPositionColor(playerPosition)}`}>{playerPosition}</Badge>
          {isStarter && (
            <Badge variant='outline' className='text-xs hidden sm:inline-flex'>
              Starter
            </Badge>
          )}
        </div>
      </td>
      <td className='px-2 md:px-4 py-3'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='cursor-help'>
                <p className='font-medium text-sm truncate max-w-[120px] md:max-w-none'>
                  {displayName}
                </p>
                <p className='text-xs text-gray-500'>{team}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent className='max-w-xs'>
              <div className='space-y-1'>
                <p className='font-medium'>{displayName}</p>
                <p className='text-xs'>Position: {playerPosition}</p>
                <p className='text-xs'>Team: {team}</p>
                {isStarter && <p className='text-xs text-blue-600'>Starter</p>}
                {projectedPoints && (
                  <p className='text-xs'>Projected: {projectedPoints.toFixed(1)} pts</p>
                )}
                {playerStats?.actual && <p className='text-xs'>Actual: {points.toFixed(1)} pts</p>}
                {difference !== null && (
                  <p className={`text-xs ${difference > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    vs Projection: {difference > 0 ? '+' : ''}
                    {difference.toFixed(1)}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
      <td className='px-2 md:px-4 py-3 text-right'>
        <div className='text-right'>
          <span
            className={`font-semibold text-sm ${points > 15 ? 'text-green-600' : points > 8 ? 'text-blue-600' : points > 0 ? 'text-gray-600' : 'text-red-500'}`}
          >
            {points.toFixed(1)}
          </span>
          {projectedPoints && (
            <p className='text-xs text-gray-500 mt-1 hidden sm:block'>
              Proj: {projectedPoints.toFixed(1)}
              {projectionDifference && (
                <span className={`ml-1 ${difference! > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  ({projectionDifference})
                </span>
              )}
            </p>
          )}
        </div>
      </td>
    </tr>
  );
}

interface TeamRosterProps {
  team: {
    rosterId: number;
    owner: { displayName?: string; username?: string } | null;
    points: number;
    starters: string[];
    startersPoints: number[] | Record<string, number>;
    players: string[];
    playersPoints: Record<string, number>;
  };
  isWinner: boolean;
  playersData?: { players: Record<string, PlayerInfo> };
  playerStatsData?: { playerStats: Record<string, PlayerStats> };
  statsLoading?: boolean;
}

function TeamRoster({
  team,
  isWinner,
  playersData,
  playerStatsData,
  statsLoading,
}: TeamRosterProps) {
  // Parse the points data
  const startersPointsArray = Array.isArray(team.startersPoints) ? team.startersPoints : [];
  const playersPointsObj = typeof team.playersPoints === 'object' ? team.playersPoints : {};

  // Combine starter and bench players with their points
  const allPlayers: Array<{
    playerId: string;
    points: number;
    isStarter: boolean;
    playerInfo?: PlayerInfo;
    playerStats?: PlayerStats;
  }> = [];

  // Add starters first
  team.starters.forEach((playerId, index) => {
    const points = startersPointsArray[index] || playersPointsObj[playerId] || 0;
    allPlayers.push({
      playerId,
      points,
      isStarter: true,
      playerInfo: playersData?.players[playerId],
      playerStats: playerStatsData?.playerStats[playerId],
    });
  });

  // Add bench players
  team.players.forEach(playerId => {
    if (!team.starters.includes(playerId)) {
      const points = playersPointsObj[playerId] || 0;
      allPlayers.push({
        playerId,
        points,
        isStarter: false,
        playerInfo: playersData?.players[playerId],
        playerStats: playerStatsData?.playerStats[playerId],
      });
    }
  });

  return (
    <Card className={`w-full ${isWinner ? 'ring-2 ring-green-500' : ''}`}>
      <CardHeader className={isWinner ? 'bg-green-50' : ''}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <Link href={`/team/${team.rosterId}`} className='hover:underline'>
              <div className='flex items-center space-x-2'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold'>
                  {team.owner?.displayName?.charAt(0) || 'T'}
                </div>
                <div>
                  <CardTitle className='text-xl'>{team.owner?.displayName || 'Team'}</CardTitle>
                  <CardDescription>@{team.owner?.username || 'unknown'}</CardDescription>
                </div>
              </div>
            </Link>
            {isWinner && <Badge className='bg-green-500'>Winner</Badge>}
          </div>
          <div className='text-right'>
            <p className='text-3xl font-bold text-blue-600'>{team.points.toFixed(1)}</p>
            <p className='text-sm text-gray-600'>{team.starters.length} starters</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        {statsLoading && (
          <div className='p-4 text-center text-gray-500'>
            <p>Loading player information and stats...</p>
          </div>
        )}
        <div className='overflow-x-auto -mx-2 px-2 md:mx-0 md:px-0'>
          <table className='w-full min-w-[400px]'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                  Position
                </th>
                <th className='px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                  Player
                </th>
                <th className='px-2 md:px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase'>
                  Points
                </th>
              </tr>
            </thead>
            <tbody>
              {allPlayers.map((player, index) => (
                <PlayerRow
                  key={`${player.playerId}-${index}`}
                  playerId={player.playerId}
                  playerInfo={player.playerInfo}
                  playerStats={player.playerStats}
                  points={player.points}
                  isStarter={player.isStarter}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MatchupDetailPage({ params }: { params: { matchupId: string } }) {
  const searchParams = useSearchParams();
  const week = searchParams.get('week');
  const weekNumber = week ? parseInt(week) : 1;
  const matchupId = parseInt(params.matchupId);

  // For now, hardcode league ID - this should be dynamic in a real app
  const leagueId = '997670420490801152';

  const { data: matchup, isLoading: loading, error } = useMatchup(leagueId, weekNumber, matchupId);

  // Get all unique player IDs from both teams if matchup data is available
  const allPlayerIds = React.useMemo(() => {
    if (!matchup?.matchup?.teams || matchup.matchup.teams.length !== 2) {
      return [];
    }
    const [teamA, teamB] = matchup.matchup.teams;
    return [...new Set([...teamA.starters, ...teamA.players, ...teamB.starters, ...teamB.players])];
  }, [matchup?.matchup?.teams]);

  // Always call hooks - but they'll handle empty arrays gracefully
  const { data: allPlayerStatsData, isLoading: statsLoading } = usePlayerStats(
    allPlayerIds,
    '2023',
    weekNumber
  );
  const { data: allPlayersData, isLoading: playersLoading } = usePlayers(allPlayerIds);

  // Calculate team projections only when we have data - do this at the hook level
  const teamAProjection = React.useMemo(() => {
    if (!matchup?.matchup?.teams?.[0]?.starters || !allPlayerStatsData?.playerStats) {
      return null;
    }
    const teamA = matchup.matchup.teams[0];
    return teamA.starters.reduce((total, playerId) => {
      const playerStats = allPlayerStatsData.playerStats[playerId];
      const projectedPoints = playerStats?.projections?.pts_ppr || 0;
      return total + projectedPoints;
    }, 0);
  }, [matchup?.matchup?.teams, allPlayerStatsData?.playerStats]);

  const teamBProjection = React.useMemo(() => {
    if (!matchup?.matchup?.teams?.[1]?.starters || !allPlayerStatsData?.playerStats) {
      return null;
    }
    const teamB = matchup.matchup.teams[1];
    return teamB.starters.reduce((total, playerId) => {
      const playerStats = allPlayerStatsData.playerStats[playerId];
      const projectedPoints = playerStats?.projections?.pts_ppr || 0;
      return total + projectedPoints;
    }, 0);
  }, [matchup?.matchup?.teams, allPlayerStatsData?.playerStats]);

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <MatchupDetailLoader />
      </div>
    );
  }

  if (error) {
    return (
      <Container className='py-8'>
        <PageHeader title='Error Loading Matchup' subtitle='Failed to load matchup data' />
        <div className='mt-4 text-red-600'>{String(error)}</div>
        <Link href='/matchups'>
          <Button variant='outline' className='mt-4'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Matchups
          </Button>
        </Link>
      </Container>
    );
  }

  if (!matchup?.matchup || !matchup.matchup.teams || matchup.matchup.teams.length !== 2) {
    return (
      <Container className='py-8'>
        <PageHeader title='Matchup Not Found' subtitle='Unable to load matchup data' />
        <Link href='/matchups'>
          <Button variant='outline' className='mt-4'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Matchups
          </Button>
        </Link>
      </Container>
    );
  }

  const [teamA, teamB] = matchup.matchup.teams;
  const winner = matchup.matchup.summary?.winnerRosterId;
  const isTeamAWinner = winner === teamA.rosterId;
  const isTeamBWinner = winner === teamB.rosterId;

  const totalPoints = teamA.points + teamB.points;
  const margin = matchup.matchup.summary?.margin || Math.abs(teamA.points - teamB.points);

  return (
    <Container className='py-4 md:py-8 max-w-7xl'>
      <div className='mb-6'>
        <Link href='/matchups'>
          <Button variant='outline' className='text-sm'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            <span className='hidden sm:inline'>Back to Matchups</span>
            <span className='sm:hidden'>Back</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Matchup ${matchupId}`}
        subtitle={`Week ${weekNumber} • ${teamA.owner?.displayName || 'Team A'} vs ${teamB.owner?.displayName || 'Team B'}`}
      />

      {/* Navigation Tabs */}
      <Tabs defaultValue='overview' className='w-full mb-6'>
        <TabsList className='grid w-full grid-cols-3 max-w-md mx-auto mb-6'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='timeline'>Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          {/* Score Overview */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg md:text-xl'>Score Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6'>
                <div className='text-center'>
                  <h3 className='text-base md:text-lg font-semibold mb-2 truncate'>
                    {teamA.owner?.displayName || 'Team A'}
                  </h3>
                  <p
                    className={`text-3xl md:text-4xl font-bold ${isTeamAWinner ? 'text-green-600' : 'text-blue-600'}`}
                  >
                    {teamA.points.toFixed(1)}
                  </p>
                  <div className='mt-2 text-xs md:text-sm text-gray-600'>
                    {teamAProjection !== null ? (
                      <>
                        <p>Projected: {teamAProjection.toFixed(1)} pts</p>
                        <p
                          className={
                            teamA.points > teamAProjection ? 'text-green-600' : 'text-red-500'
                          }
                        >
                          {teamA.points > teamAProjection ? '+' : ''}
                          {(teamA.points - teamAProjection).toFixed(1)} vs proj
                        </p>
                      </>
                    ) : (
                      <p className='text-gray-500'>Loading projections...</p>
                    )}
                  </div>
                  {isTeamAWinner && (
                    <p className='text-xs md:text-sm text-green-600 mt-2'>Winner! 🏆</p>
                  )}
                </div>
                <div className='text-center'>
                  <h3 className='text-base md:text-lg font-semibold mb-2 truncate'>
                    {teamB.owner?.displayName || 'Team B'}
                  </h3>
                  <p
                    className={`text-3xl md:text-4xl font-bold ${isTeamBWinner ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {teamB.points.toFixed(1)}
                  </p>
                  <div className='mt-2 text-xs md:text-sm text-gray-600'>
                    {teamBProjection !== null ? (
                      <>
                        <p>Projected: {teamBProjection.toFixed(1)} pts</p>
                        <p
                          className={
                            teamB.points > teamBProjection ? 'text-green-600' : 'text-red-500'
                          }
                        >
                          {teamB.points > teamBProjection ? '+' : ''}
                          {(teamB.points - teamBProjection).toFixed(1)} vs proj
                        </p>
                      </>
                    ) : (
                      <p className='text-gray-500'>Loading projections...</p>
                    )}
                  </div>
                  {isTeamBWinner && (
                    <p className='text-xs md:text-sm text-green-600 mt-2'>Winner! 🏆</p>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 pt-4 md:pt-6 border-t border-gray-200'>
                <div className='text-center'>
                  <p className='text-xl md:text-2xl font-bold text-foreground'>
                    {margin.toFixed(1)}
                  </p>
                  <p className='text-xs md:text-sm text-muted-foreground'>Margin of Victory</p>
                </div>
                <div className='text-center'>
                  <p className='text-xl md:text-2xl font-bold text-foreground'>
                    {totalPoints.toFixed(1)}
                  </p>
                  <p className='text-xs md:text-sm text-muted-foreground'>Combined Points</p>
                </div>
                <div className='text-center col-span-2 md:col-span-1'>
                  <p className='text-base md:text-lg font-semibold text-primary'>65%</p>
                  <p className='text-xs md:text-sm text-muted-foreground'>Pre-game Win Prob</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Rosters */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8'>
            <TeamRoster
              team={teamA}
              isWinner={isTeamAWinner}
              playersData={allPlayersData}
              playerStatsData={allPlayerStatsData}
              statsLoading={statsLoading || playersLoading}
            />
            <TeamRoster
              team={teamB}
              isWinner={isTeamBWinner}
              playersData={allPlayersData}
              playerStatsData={allPlayerStatsData}
              statsLoading={statsLoading || playersLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-6'>
          {/* Charts Section */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Win Probability Chart */}
            <ChartContainer
              title='Win Probability Over Time'
              description='How the odds changed throughout the week'
              height={320}
            >
              <div className='h-48 relative'>
                <svg className='w-full h-full' viewBox='0 0 320 160'>
                  {/* Y-axis */}
                  <line x1='20' y1='10' x2='20' y2='150' stroke='#e5e7eb' strokeWidth='1' />
                  {/* X-axis */}
                  <line x1='20' y1='150' x2='300' y2='150' stroke='#e5e7eb' strokeWidth='1' />

                  {/* 50% reference line */}
                  <line
                    x1='20'
                    y1='80'
                    x2='300'
                    y2='80'
                    stroke='#9ca3af'
                    strokeWidth='1'
                    strokeDasharray='5,5'
                  />
                  <text x='2' y='85' fontSize='10' fill='#6b7280'>
                    50%
                  </text>
                  <text x='2' y='25' fontSize='10' fill='#6b7280'>
                    100%
                  </text>
                  <text x='2' y='155' fontSize='10' fill='#6b7280'>
                    0%
                  </text>

                  {/* Win probability line */}
                  <polyline
                    points='20,92 40,85 60,110 80,102 100,70 120,118 140,92 160,58 180,98 200,88 220,95 240,62 260,55 280,50 300,55'
                    stroke='hsl(var(--primary))'
                    strokeWidth='2'
                    fill='none'
                    className='drop-shadow-sm'
                  />

                  {/* Data points */}
                  <circle cx='20' cy='92' r='3' fill='hsl(var(--primary))' />
                  <circle cx='160' cy='58' r='3' fill='hsl(var(--primary))' />
                  <circle cx='300' cy='55' r='3' fill='hsl(var(--primary))' />

                  {/* Time labels */}
                  <text x='20' y='170' fontSize='10' fill='#6b7280' textAnchor='start'>
                    Sun 1PM
                  </text>
                  <text x='160' y='170' fontSize='10' fill='#6b7280' textAnchor='middle'>
                    Sun 8PM
                  </text>
                  <text x='300' y='170' fontSize='10' fill='#6b7280' textAnchor='end'>
                    Final
                  </text>
                </svg>
              </div>
              <div className='flex justify-between text-sm pt-4 border-t'>
                <div className='text-center'>
                  <p className='font-semibold text-primary'>80%</p>
                  <p className='text-muted-foreground text-xs'>Peak Win %</p>
                </div>
                <div className='text-center'>
                  <p className='font-semibold text-primary'>4</p>
                  <p className='text-muted-foreground text-xs'>Lead Changes</p>
                </div>
                <div className='text-center'>
                  <p className='font-semibold text-primary'>15.3</p>
                  <p className='text-muted-foreground text-xs'>Avg Swing</p>
                </div>
              </div>
            </ChartContainer>

            {/* Score Progression */}
            <ChartContainer
              title='Score Progression'
              description='How points accumulated during the week'
              height={380}
            >
              <div className='h-48 relative mb-4'>
                <svg className='w-full h-full' viewBox='0 0 380 160'>
                  {/* Y-axis */}
                  <line x1='30' y1='10' x2='30' y2='140' stroke='#e5e7eb' strokeWidth='1' />
                  {/* X-axis */}
                  <line x1='30' y1='140' x2='360' y2='140' stroke='#e5e7eb' strokeWidth='1' />

                  {/* Y-axis labels */}
                  <text x='25' y='15' fontSize='9' fill='#6b7280' textAnchor='end'>
                    120
                  </text>
                  <text x='25' y='45' fontSize='9' fill='#6b7280' textAnchor='end'>
                    80
                  </text>
                  <text x='25' y='75' fontSize='9' fill='#6b7280' textAnchor='end'>
                    40
                  </text>
                  <text x='25' y='105' fontSize='9' fill='#6b7280' textAnchor='end'>
                    20
                  </text>
                  <text x='25' y='143' fontSize='9' fill='#6b7280' textAnchor='end'>
                    0
                  </text>

                  {/* Team A score line (blue) */}
                  <path
                    d='M30,140 Q60,130 90,110 Q120,95 150,75 Q180,60 210,45 Q240,35 270,28 Q300,22 330,18 Q345,16 360,15'
                    stroke='hsl(var(--primary))'
                    strokeWidth='2.5'
                    fill='none'
                    className='drop-shadow-sm'
                  />

                  {/* Team B score line (red) */}
                  <path
                    d='M30,140 Q60,135 90,120 Q120,108 150,98 Q180,90 210,85 Q240,82 270,80 Q300,79 330,78 Q345,78 360,78'
                    stroke='#ef4444'
                    strokeWidth='2.5'
                    fill='none'
                    className='drop-shadow-sm'
                  />

                  {/* Data point markers */}
                  <circle cx='90' cy='110' r='2' fill='hsl(var(--primary))' />
                  <circle cx='210' cy='45' r='2' fill='hsl(var(--primary))' />
                  <circle cx='360' cy='15' r='2' fill='hsl(var(--primary))' />
                  <circle cx='90' cy='120' r='2' fill='#ef4444' />
                  <circle cx='210' cy='85' r='2' fill='#ef4444' />
                  <circle cx='360' cy='78' r='2' fill='#ef4444' />

                  {/* Time labels */}
                  <text x='90' y='155' fontSize='10' fill='#6b7280' textAnchor='middle'>
                    Sun 1PM
                  </text>
                  <text x='210' y='155' fontSize='10' fill='#6b7280' textAnchor='middle'>
                    Sun 4PM
                  </text>
                  <text x='300' y='155' fontSize='10' fill='#6b7280' textAnchor='middle'>
                    Sun 8PM
                  </text>
                  <text x='360' y='155' fontSize='10' fill='#6b7280' textAnchor='middle'>
                    Mon 8PM
                  </text>
                </svg>
              </div>

              <ChartLegend
                items={[
                  { label: teamA.owner?.displayName || 'Team A', color: 'hsl(var(--primary))' },
                  { label: teamB.owner?.displayName || 'Team B', color: '#ef4444' },
                ]}
              />

              <div className='grid grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t'>
                <div className='text-center'>
                  <p className='font-semibold text-foreground'>Sunday 1PM</p>
                  <p className='text-muted-foreground text-xs'>68% of points</p>
                  <p className='text-xs text-primary'>Most active slot</p>
                </div>
                <div className='text-center'>
                  <p className='font-semibold text-foreground'>Sunday 4PM</p>
                  <p className='text-muted-foreground text-xs'>22% of points</p>
                  <p className='text-xs text-muted-foreground'>Secondary games</p>
                </div>
                <div className='text-center'>
                  <p className='font-semibold text-foreground'>Mon Night</p>
                  <p className='text-muted-foreground text-xs'>10% of points</p>
                  <p className='text-xs text-primary'>Close finish</p>
                </div>
              </div>
            </ChartContainer>
          </div>

          {/* Advanced Analytics */}
          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Deep insights into matchup performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                {/* Performance Highlights */}
                <div className='p-4 bg-muted/50 rounded-lg border'>
                  <h4 className='font-semibold mb-3 text-foreground'>Performance Highlights</h4>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <p className='text-sm text-gray-700'>Highest Scorer</p>
                      <Badge variant='secondary' className='text-xs'>
                        22.4 pts
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <p className='text-sm text-gray-700'>Biggest Boom</p>
                      <Badge variant='secondary' className='text-xs'>
                        +15.2 vs proj
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <p className='text-sm text-gray-700'>Biggest Bust</p>
                      <Badge variant='outline' className='text-xs'>
                        -8.5 vs proj
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Excitement Score */}
                <div className='p-4 bg-muted/50 rounded-lg border'>
                  <h4 className='font-semibold mb-3 text-foreground'>Excitement Score</h4>
                  <div className='text-center space-y-2'>
                    <p className='text-3xl font-bold text-primary'>87</p>
                    <p className='text-xs text-muted-foreground'>Very Exciting</p>
                    <div className='mt-3 space-y-1'>
                      <div className='flex justify-between text-xs'>
                        <span>Lead Changes:</span>
                        <span className='font-medium'>4</span>
                      </div>
                      <div className='flex justify-between text-xs'>
                        <span>Close Finish:</span>
                        <span className='font-medium'>Yes</span>
                      </div>
                      <div className='flex justify-between text-xs'>
                        <span>Clutch Plays:</span>
                        <span className='font-medium'>3</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance vs Projection */}
                <div className='p-4 bg-muted/50 rounded-lg border'>
                  <h4 className='font-semibold mb-3 text-foreground'>Projection Analysis</h4>
                  <div className='space-y-3'>
                    <div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600'>Team A Performance</span>
                        <span className='font-medium text-green-600'>+8.4 vs proj</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2 mt-1'>
                        <div className='bg-green-500 h-2 rounded-full w-2/3'></div>
                      </div>
                    </div>
                    <div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600'>Team B Performance</span>
                        <span className='font-medium text-red-600'>-12.1 vs proj</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2 mt-1'>
                        <div className='bg-red-500 h-2 rounded-full w-1/3'></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Matchup Efficiency */}
                <div className='p-4 bg-muted/50 rounded-lg border'>
                  <h4 className='font-semibold mb-3 text-foreground'>Team Efficiency</h4>
                  <div className='space-y-3'>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-primary'>87%</p>
                      <p className='text-xs text-muted-foreground'>Optimal Lineup Efficiency</p>
                    </div>
                    <div className='text-center'>
                      <p className='text-lg font-semibold text-foreground'>+12.4</p>
                      <p className='text-xs text-muted-foreground'>Points left on bench</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='timeline' className='space-y-6'>
          {/* Game Timeline/Progression */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg md:text-xl'>Game Timeline</CardTitle>
              <CardDescription>Key moments and scoring progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='border-l-4 border-primary pl-4'>
                  <div className='flex justify-between items-center mb-1'>
                    <p className='font-medium text-sm'>Pre-Game</p>
                    <p className='text-xs text-muted-foreground'>Sunday 12:00 PM</p>
                  </div>
                  <p className='text-sm text-gray-600'>Lineups set • Projections calculated</p>
                </div>

                <div className='border-l-4 border-blue-500 pl-4'>
                  <div className='flex justify-between items-center mb-1'>
                    <p className='font-medium text-sm'>Early Games</p>
                    <p className='text-xs text-muted-foreground'>Sunday 1:00 PM</p>
                  </div>
                  <p className='text-sm text-gray-600'>68% of total points scored</p>
                </div>

                <div className='border-l-4 border-green-500 pl-4'>
                  <div className='flex justify-between items-center mb-1'>
                    <p className='font-medium text-sm'>Late Games</p>
                    <p className='text-xs text-muted-foreground'>Sunday 4:25 PM</p>
                  </div>
                  <p className='text-sm text-gray-600'>22% of total points scored</p>
                </div>

                <div className='border-l-4 border-red-500 pl-4'>
                  <div className='flex justify-between items-center mb-1'>
                    <p className='font-medium text-sm'>Final Result</p>
                    <p className='text-xs text-muted-foreground'>Monday 11:30 PM</p>
                  </div>
                  <p className='text-sm text-gray-600'>
                    {isTeamAWinner ? teamA.owner?.displayName : teamB.owner?.displayName} wins by{' '}
                    {margin.toFixed(1)} points
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}
