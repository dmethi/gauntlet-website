'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock, TrendingUp, Trophy } from 'lucide-react';
import { MatchupSimulation } from '@/components/matchup-simulation';
import { PlayerBoxPlot } from '@/components/player-box-plot';
import type { PlayerDetails, TeamRoster, MatchupDetails } from '@/features/matchups/types';

const POSITION_ORDER = ['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF'];

// Safe avatar component with error handling
function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
}: {
  src?: string | null;
  alt: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-lg',
  };

  if (!src || hasError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-muted flex items-center justify-center font-medium`}
      >
        {fallback.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full`}
      onError={() => setHasError(true)}
      onLoad={() => setHasError(false)}
    />
  );
}

export default function MatchupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { leagueId, week, matchupId } = params;

  const [matchup, setMatchup] = useState<MatchupDetails | null>(null);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [playerDistributions, setPlayerDistributions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatchupDetails = async () => {
      if (!leagueId || !week || !matchupId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch both matchup details and simulation data
        const [matchupResponse, simulationResponse] = await Promise.all([
          fetch(`/api/matchups/${leagueId}/${week}/${matchupId}`),
          fetch(`/api/matchups/${leagueId}/${week}/${matchupId}/simulate`),
        ]);

        if (!matchupResponse.ok) {
          throw new Error('Failed to fetch matchup details');
        }

        const data = await matchupResponse.json();

        // Handle simulation data
        let simData = null;
        let distributions: Record<string, any> = {};

        if (simulationResponse.ok) {
          simData = await simulationResponse.json();

          // Create a lookup map for player distributions
          if (simData.playersDistributions) {
            for (const playerDist of simData.playersDistributions) {
              distributions[playerDist.playerId] = {
                p10: playerDist.p10,
                p25: playerDist.p25,
                median: playerDist.median,
                p75: playerDist.p75,
                p90: playerDist.p90,
                mean: playerDist.mean,
                sampleSize: 1000, // Default sample size
                dataSource: playerDist.dataSource || 'projection',
              };
            }
          }
        }

        setSimulationData(simData);
        setPlayerDistributions(distributions);

        console.log('🔍 [INDIVIDUAL MATCHUP] Raw API response:', data);

        // The API returns {matchup: {...}, week: ..., leagueId: ...}
        const matchupData = data.matchup;

        // Transform the data to match our interface
        const transformedMatchup: MatchupDetails = {
          matchupId: parseInt(matchupId as string),
          week: parseInt(week as string),
          leagueId: leagueId as string,
          leagueName:
            data.leagueName ||
            (leagueId === '1263744209295245312' ? 'Gauntlet AFC' : 'Gauntlet NFC'),
          teams: matchupData.teams.map((team: any) => ({
            rosterId: team.rosterId,
            teamName: team.teamName || `Team ${team.rosterId}`,
            ownerName: team.ownerName || 'Unknown',
            points: team.points || 0,
            projectedPoints: team.projectedPoints || 0,
            starters: (team.starters || []).map((player: any) => ({
              id: player.id,
              name: player.name || 'Unknown Player',
              position: player.position || 'UNKNOWN',
              team: player.team || '',
              points: player.points || 0,
              projectedPoints: player.projectedPoints || 0,
              isStarter: true,
              status: player.status || 'active',
            })),
            bench: (team.bench || []).map((player: any) => ({
              id: player.id,
              name: player.name || 'Unknown Player',
              position: player.position || 'UNKNOWN',
              team: player.team || '',
              points: player.points || 0,
              projectedPoints: player.projectedPoints || 0,
              isStarter: false,
              status: player.status || 'active',
            })),
            remainingPlayers: team.remainingPlayers || 0,
            playersActive: team.playersActive || 0,
            owner: team.owner || {
              id: '',
              username: 'unknown',
              displayName: 'Unknown',
              avatar: null,
            },
          })),
          winner: data.winner
            ? {
                rosterId: data.winner.rosterId,
                teamName: data.winner.teamName,
                ownerName: data.winner.ownerName,
                points: data.winner.points,
                projectedPoints: data.winner.projectedPoints,
                starters: [],
                bench: [],
                remainingPlayers: 0,
                playersActive: 0,
                owner: data.winner.owner,
              }
            : null,
          isComplete:
            matchupData.summary?.winnerRosterId !== null &&
            matchupData.summary?.winnerRosterId !== undefined,
          margin: data.margin || 0,
          gameStatus: data.gameStatus || 'pre_game',
        };

        setMatchup(transformedMatchup);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch matchup details');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchupDetails();
  }, [leagueId, week, matchupId]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !matchup) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">Error loading matchup</div>
            <p className="text-muted-foreground">{error || 'Matchup not found'}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const [teamA, teamB] = matchup.teams;

  // Calculate max projection across all players for proper scaling
  const allPlayers = [...teamA.starters, ...teamA.bench, ...teamB.starters, ...teamB.bench];
  const maxProjection = Math.max(...allPlayers.map(player => player.projectedPoints));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Matchups
          </Button>
        </div>

        {/* Matchup Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-geizer tracking-wide">
                  {matchup.leagueName} • Week {matchup.week}
                </CardTitle>
                <CardDescription className="font-avenir">
                  Matchup {matchup.matchupId}
                </CardDescription>
              </div>
              <Badge variant={matchup.isComplete ? 'secondary' : 'default'}>
                {matchup.isComplete ? 'Final' : 'Live'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Score Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <TeamScore team={teamA} isLeading={teamA.points > teamB.points} />
              <div className="text-center">
                <div className="text-4xl font-bold text-muted-foreground">VS</div>
                {!matchup.isComplete && (
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
                    <Clock className="h-4 w-4" />
                    {matchup.gameStatus === 'in_progress' ? 'In Progress' : 'Not Started'}
                  </div>
                )}
              </div>
              <TeamScore team={teamB} isLeading={teamB.points > teamA.points} />
            </div>

            {matchup.isComplete && matchup.winner && (
              <div className="text-center mt-4 pt-4 border-t border-muted">
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <Trophy className="h-5 w-5" />
                  <span className="font-medium">
                    {matchup.winner.ownerName} wins by {matchup.margin.toFixed(1)} points
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Odds & Simulation */}
        <MatchupSimulation
          leagueId={Array.isArray(leagueId) ? leagueId[0] : leagueId}
          week={parseInt(Array.isArray(week) ? week[0] : week)}
          matchupId={matchup.matchupId}
        />

        {/* Team Rosters */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TeamRosterCard
            team={teamA}
            isLeading={teamA.points > teamB.points}
            maxProjection={maxProjection}
            playerDistributions={playerDistributions}
          />
          <TeamRosterCard
            team={teamB}
            isLeading={teamB.points > teamA.points}
            maxProjection={maxProjection}
            playerDistributions={playerDistributions}
          />
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}

function TeamScore({ team, isLeading }: { team: TeamRoster; isLeading: boolean }) {
  const completionPercentage =
    team.projectedPoints > 0 ? Math.min((team.points / team.projectedPoints) * 100, 100) : 0;

  return (
    <div className="text-center space-y-3">
      <div className="flex items-center justify-center gap-3">
        <Avatar src={team.owner.avatar} alt={team.ownerName} fallback={team.ownerName} size="lg" />
        <div>
          <div className="font-bold text-lg">{team.teamName}</div>
          <div className="text-sm text-muted-foreground">{team.ownerName}</div>
        </div>
      </div>

      <div
        className={`text-3xl font-bold ${isLeading ? 'text-green-600 dark:text-green-400' : ''}`}
      >
        {team.points.toFixed(1)}
      </div>

      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">
          Projected: {team.projectedPoints.toFixed(1)}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gauntlet-crimson transition-all duration-300 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function TeamRosterCard({
  team,
  isLeading,
  maxProjection,
  playerDistributions,
}: {
  team: TeamRoster;
  isLeading: boolean;
  maxProjection: number;
  playerDistributions: Record<string, any>;
}) {
  const sortedStarters = [...team.starters].sort((a, b) => {
    const aIndex = POSITION_ORDER.indexOf(a.position);
    const bIndex = POSITION_ORDER.indexOf(b.position);
    return aIndex - bIndex;
  });

  return (
    <Card className={`${isLeading ? 'ring-2 ring-green-500' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              src={team.owner.avatar}
              alt={team.ownerName}
              fallback={team.ownerName}
              size="md"
            />
            <div>
              <CardTitle className="text-lg font-geizer tracking-wide">{team.teamName}</CardTitle>
              <CardDescription className="font-avenir">{team.ownerName}</CardDescription>
            </div>
          </div>
          {isLeading && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Leading
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Starters */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Starting Lineup
          </h3>
          <div className="space-y-2">
            {sortedStarters.map(player => (
              <PlayerRow
                key={player.id}
                player={player}
                maxProjection={maxProjection}
                distribution={playerDistributions[player.id]}
              />
            ))}
          </div>
        </div>

        {/* Bench */}
        {team.bench.length > 0 && (
          <div className="pt-4 border-t border-muted">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Bench
            </h3>
            <div className="space-y-2">
              {team.bench.map(player => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  maxProjection={maxProjection}
                  distribution={playerDistributions[player.id]}
                />
              ))}
            </div>
          </div>
        )}

        {/* Team Summary */}
        <div className="pt-4 border-t border-muted">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-bold text-lg">{team.points.toFixed(1)}</div>
              <div className="text-muted-foreground">Points</div>
            </div>
            <div>
              <div className="font-bold text-lg">{team.projectedPoints.toFixed(1)}</div>
              <div className="text-muted-foreground">Projected</div>
            </div>
            <div>
              <div className="font-bold text-lg">{team.playersActive}</div>
              <div className="text-muted-foreground">Active</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PlayerRow({
  player,
  maxProjection: _maxProjection,
  distribution,
}: {
  player: PlayerDetails;
  maxProjection: number;
  distribution?: any;
}) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'out':
      case 'ir':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'questionable':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
  };

  return (
    <div className="grid grid-cols-[1fr_2fr] items-center gap-4 p-3 rounded border border-muted">
      {/* First half: Player info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className="text-xs px-2 py-0">
            {player.position}
          </Badge>
          {player.status !== 'active' && (
            <Badge className={`text-xs px-1 py-0 ${getStatusBadgeColor(player.status)}`}>
              {player.status.toUpperCase()}
            </Badge>
          )}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{player.name}</div>
          <div className="text-xs text-muted-foreground">{player.team}</div>
        </div>
      </div>

      {/* Second half: Plot and scores */}
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        {/* Player Distribution Box Plot */}
        <PlayerBoxPlot
          playerId={player.id}
          position={player.position}
          projection={player.projectedPoints}
          width={160}
          height={28}
          className="hidden sm:block justify-self-end"
          maxProjection={40}
          distribution={distribution}
        />

        <div className="text-right whitespace-nowrap">
          <div className="font-bold text-sm">{player.points.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">
            Proj: {player.projectedPoints.toFixed(1)}
          </div>
        </div>
      </div>

      {/* {Math.abs(performanceVsProjection) > 5 && (
        <div
          className={`text-xs font-medium ${
            performanceVsProjection > 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {performanceVsProjection > 0 ? '+' : ''}
          {performanceVsProjection.toFixed(0)}%
        </div>
      )} */}
    </div>
  );
}
