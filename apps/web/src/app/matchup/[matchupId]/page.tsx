'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChartContainer, Container, PageHeader } from '@gauntlet/ui';
import {
  type PlayerInfo,
  type PlayerStats,
  useMatchup,
  usePlayers,
  usePlayerStats,
} from '@/lib/hooks';
import ContentLoader from 'react-content-loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ScoreChart, WinProbChart } from '@/components/matchup-charts';
import { useMatchupTimeSeries } from '@/features/matchups/hooks';
import { SwingPointsDisplay } from '@/features/matchups/components/SwingPointsDisplay';

const MatchupDetailLoader = () => (
  <ContentLoader
    speed={2}
    width={1200}
    height={1000}
    viewBox="0 0 1200 1000"
    backgroundColor="hsl(var(--muted))"
    foregroundColor="hsl(var(--muted-foreground))"
  >
    {/* Header */}
    <rect x="16" y="32" rx="3" ry="3" width="200" height="32" />
    <rect x="16" y="72" rx="3" ry="3" width="300" height="20" />

    {/* Back button */}
    <rect x="16" y="120" rx="8" ry="8" width="120" height="40" />

    {/* Team headers */}
    <rect x="16" y="200" rx="8" ry="8" width="560" height="80" />
    <rect x="600" y="200" rx="8" ry="8" width="560" height="80" />

    {/* Roster tables */}
    <rect x="16" y="300" rx="8" ry="8" width="560" height="400" />
    <rect x="600" y="300" rx="8" ry="8" width="560" height="400" />

    {/* Summary stats */}
    <rect x="16" y="720" rx="8" ry="8" width="1144" height="120" />
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

const PlayerRow = ({
  playerId,
  playerInfo,
  playerStats,
  points,
  isStarter,
  position,
}: PlayerRowProps) => {
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
    <tr className={`border-b ${isStarter ? 'bg-primary/5 dark:bg-primary/10' : 'bg-muted/20'}`}>
      <td className="px-2 md:px-4 py-3">
        <div className="flex items-center space-x-1 md:space-x-2">
          <Badge className={`text-xs ${getPositionColor(playerPosition)}`}>{playerPosition}</Badge>
          {isStarter && (
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
              Starter
            </Badge>
          )}
        </div>
      </td>
      <td className="px-2 md:px-4 py-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <p className="font-medium text-sm truncate max-w-[120px] md:max-w-none">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">{team}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="space-y-1">
                <p className="font-medium">{displayName}</p>
                <p className="text-xs">Position: {playerPosition}</p>
                <p className="text-xs">Team: {team}</p>
                {isStarter && <p className="text-xs text-primary">Starter</p>}
                {projectedPoints && (
                  <p className="text-xs">Projected: {projectedPoints.toFixed(1)} pts</p>
                )}
                {playerStats?.actual && <p className="text-xs">Actual: {points.toFixed(1)} pts</p>}
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
      <td className="px-2 md:px-4 py-3 text-right">
        <div className="text-right">
          <span
            className={`font-semibold text-sm ${points > 15 ? 'text-green-600' : points > 8 ? 'text-blue-600' : points > 0 ? 'text-gray-600' : 'text-red-500'}`}
          >
            {points.toFixed(1)}
          </span>
          {projectedPoints && (
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">
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
};

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

const TeamRoster = ({
  team,
  isWinner,
  playersData,
  playerStatsData,
  statsLoading,
}: TeamRosterProps) => {
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
      <CardHeader className={isWinner ? 'bg-green-50 dark:bg-green-900/20' : ''}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href={`/team/${team.rosterId}`} className="hover:underline">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {team.owner?.displayName?.charAt(0) || 'T'}
                </div>
                <div>
                  <CardTitle className="text-xl">{team.owner?.displayName || 'Team'}</CardTitle>
                  <CardDescription>@{team.owner?.username || 'unknown'}</CardDescription>
                </div>
              </div>
            </Link>
            {isWinner && <Badge className="bg-green-500">Winner</Badge>}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">{team.points.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">{team.starters.length} starters</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {statsLoading && (
          <div className="p-4 text-center text-gray-500">
            <p>Loading player information and stats...</p>
          </div>
        )}
        <div className="overflow-x-auto -mx-2 px-2 md:mx-0 md:px-0">
          <table className="w-full min-w-[400px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                  Position
                </th>
                <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                  Player
                </th>
                <th className="px-2 md:px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
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
};

const MatchupDetailPageContent = ({ params }: { params: { matchupId: string } }) => {
  const searchParams = useSearchParams();
  const week = searchParams.get('week');
  const leagueIdParam = searchParams.get('leagueId');
  const weekNumber = week ? parseInt(week) : 1;
  const matchupId = parseInt(params.matchupId);

  // Get league ID from URL params, fallback to Gauntlet AFC
  const leagueId = leagueIdParam || '1263744209295245312';

  const { data: matchup, isLoading: loading, error } = useMatchup(leagueId, weekNumber, matchupId);

  // Fetch time series data for charts
  const {
    data: timeSeriesData,
    isLoading: timeSeriesLoading,
    error: timeSeriesError,
  } = useMatchupTimeSeries(leagueId, weekNumber, matchupId);

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
    weekNumber,
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
      <div className="container mx-auto px-4 py-8">
        <MatchupDetailLoader />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <PageHeader title="Error Loading Matchup" subtitle="Failed to load matchup data" />
        <div className="mt-4 text-destructive">{String(error)}</div>
        <Link href="/archive/2025/matchups">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matchups
          </Button>
        </Link>
      </Container>
    );
  }

  if (!matchup?.matchup || !matchup.matchup.teams || matchup.matchup.teams.length !== 2) {
    return (
      <Container className="py-8">
        <PageHeader title="Matchup Not Found" subtitle="Unable to load matchup data" />
        <Link href="/archive/2025/matchups">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
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
    <Container className="py-4 md:py-8 max-w-7xl">
      <div className="mb-6">
        <Link href="/archive/2025/matchups">
          <Button variant="outline" className="text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Matchups</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Matchup ${matchupId}`}
        subtitle={`Week ${weekNumber} • ${teamA.owner?.displayName || 'Team A'} vs ${teamB.owner?.displayName || 'Team B'}`}
      />

      {/* Navigation Tabs */}
      <Tabs defaultValue="overview" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Score Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Score Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6">
                <div className="text-center">
                  <h3 className="text-base md:text-lg font-semibold mb-2 truncate">
                    {teamA.owner?.displayName || 'Team A'}
                  </h3>
                  <p
                    className={`text-3xl md:text-4xl font-bold ${isTeamAWinner ? 'text-green-600' : 'text-blue-600'}`}
                  >
                    {teamA.points.toFixed(1)}
                  </p>
                  <div className="mt-2 text-xs md:text-sm text-gray-600">
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
                      <p className="text-gray-500">Loading projections...</p>
                    )}
                  </div>
                  {isTeamAWinner && (
                    <p className="text-xs md:text-sm text-green-600 mt-2">Winner! 🏆</p>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-base md:text-lg font-semibold mb-2 truncate">
                    {teamB.owner?.displayName || 'Team B'}
                  </h3>
                  <p
                    className={`text-3xl md:text-4xl font-bold ${isTeamBWinner ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {teamB.points.toFixed(1)}
                  </p>
                  <div className="mt-2 text-xs md:text-sm text-gray-600">
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
                      <p className="text-gray-500">Loading projections...</p>
                    )}
                  </div>
                  {isTeamBWinner && (
                    <p className="text-xs md:text-sm text-green-600 mt-2">Winner! 🏆</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 pt-4 md:pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {margin.toFixed(1)}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">Margin of Victory</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {totalPoints.toFixed(1)}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">Combined Points</p>
                </div>
                <div className="text-center col-span-2 md:col-span-1">
                  <p className="text-base md:text-lg font-semibold text-primary">65%</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Pre-game Win Prob</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Rosters */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
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

        <TabsContent value="analytics" className="space-y-6">
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Win Probability Chart */}
            <ChartContainer
              title="Win Probability Over Time"
              description="How the odds changed throughout the week"
              height={320}
            >
              {timeSeriesLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-sm text-muted-foreground">Loading chart data...</div>
                </div>
              ) : timeSeriesError ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-sm text-muted-foreground">Unable to load chart data</div>
                </div>
              ) : timeSeriesData?.series && timeSeriesData.series.length > 0 ? (
                <WinProbChart
                  series={timeSeriesData.series}
                  teamAName={teamA.owner?.displayName || 'Team A'}
                  teamBName={teamB.owner?.displayName || 'Team B'}
                />
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center text-sm text-muted-foreground px-4">
                    <p className="mb-2">Live data not yet available for this matchup</p>
                    <p className="text-xs">Data is collected during games starting Week 6</p>
                  </div>
                </div>
              )}
            </ChartContainer>

            {/* Score Progression */}
            <ChartContainer
              title="Score Over Time"
              description="How points accumulated during the week"
              height={320}
            >
              {timeSeriesLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-sm text-muted-foreground">Loading chart data...</div>
                </div>
              ) : timeSeriesError ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-sm text-muted-foreground">Unable to load chart data</div>
                </div>
              ) : timeSeriesData?.series && timeSeriesData.series.length > 0 ? (
                <ScoreChart
                  series={timeSeriesData.series}
                  teamAName={teamA.owner?.displayName || 'Team A'}
                  teamBName={teamB.owner?.displayName || 'Team B'}
                />
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center text-sm text-muted-foreground px-4">
                    <p className="mb-2">Live data not yet available for this matchup</p>
                    <p className="text-xs">Data is collected during games starting Week 6</p>
                  </div>
                </div>
              )}
            </ChartContainer>
          </div>

          {/* Game Swings Section */}
          {timeSeriesData?.series && timeSeriesData.series.length > 0 && (
            <div className="mt-6">
              <SwingPointsDisplay
                series={timeSeriesData.series}
                teamAName={teamA.owner?.displayName || 'Team A'}
                teamBName={teamB.owner?.displayName || 'Team B'}
              />
            </div>
          )}

          {/* Advanced Analytics */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Deep insights into matchup performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Performance Highlights */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h4 className="font-semibold mb-3 text-foreground">Performance Highlights</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">Highest Scorer</p>
                      <Badge variant="secondary" className="text-xs">
                        22.4 pts
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">Biggest Boom</p>
                      <Badge variant="secondary" className="text-xs">
                        +15.2 vs proj
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">Biggest Bust</p>
                      <Badge variant="outline" className="text-xs">
                        -8.5 vs proj
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Excitement Score */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h4 className="font-semibold mb-3 text-foreground">Excitement Score</h4>
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold text-primary">87</p>
                    <p className="text-xs text-muted-foreground">Very Exciting</p>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Lead Changes:</span>
                        <span className="font-medium">4</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Close Finish:</span>
                        <span className="font-medium">Yes</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Clutch Plays:</span>
                        <span className="font-medium">3</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance vs Projection */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h4 className="font-semibold mb-3 text-foreground">Projection Analysis</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Team A Performance</span>
                        <span className="font-medium text-green-600">+8.4 vs proj</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-green-500 h-2 rounded-full w-2/3"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Team B Performance</span>
                        <span className="font-medium text-red-600">-12.1 vs proj</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-red-500 h-2 rounded-full w-1/3"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Matchup Efficiency */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h4 className="font-semibold mb-3 text-foreground">Team Efficiency</h4>
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">87%</p>
                      <p className="text-xs text-muted-foreground">Optimal Lineup Efficiency</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">+12.4</p>
                      <p className="text-xs text-muted-foreground">Points left on bench</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          {/* Game Timeline/Progression */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Game Timeline</CardTitle>
              <CardDescription>Key moments and scoring progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium text-sm">Pre-Game</p>
                    <p className="text-xs text-muted-foreground">Sunday 12:00 PM</p>
                  </div>
                  <p className="text-sm text-gray-600">Lineups set • Projections calculated</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium text-sm">Early Games</p>
                    <p className="text-xs text-muted-foreground">Sunday 1:00 PM</p>
                  </div>
                  <p className="text-sm text-gray-600">68% of total points scored</p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium text-sm">Late Games</p>
                    <p className="text-xs text-muted-foreground">Sunday 4:25 PM</p>
                  </div>
                  <p className="text-sm text-gray-600">22% of total points scored</p>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium text-sm">Final Result</p>
                    <p className="text-xs text-muted-foreground">Monday 11:30 PM</p>
                  </div>
                  <p className="text-sm text-gray-600">
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
};

export default function MatchupDetailPage({ params }: { params: { matchupId: string } }) {
  return (
    <Suspense
      fallback={
        <Container>
          <PageHeader title="Matchup Details" />
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
          </div>
        </Container>
      }
    >
      <MatchupDetailPageContent params={params} />
    </Suspense>
  );
}
