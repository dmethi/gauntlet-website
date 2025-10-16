'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock, Swords, Trophy } from 'lucide-react';
import Link from 'next/link';
import { MatchupOddsPreview } from '@/features/matchups';
import { LeagueWideOdds } from '@/components/league-wide-odds';
import type { LeagueMatchups, MatchupData, MatchupTeam } from '@/features/matchups/types';

const LEAGUES = [
  { id: '1263744209295245312', name: 'Gauntlet AFC' },
  { id: '1263740549504962561', name: 'Gauntlet NFC' },
];

const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);

const MatchupsPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const leagueIdParam = searchParams.get('leagueId');
  const weekParam = searchParams.get('week');

  // Use URL as source of truth, with fallback to component state during initial load
  const [selectedWeek, setSelectedWeek] = useState(weekParam ? parseInt(weekParam) : 0); // 0 = loading
  const [leagueMatchups, setLeagueMatchups] = useState<LeagueMatchups[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true); // Prevent showing stale data

  // Filter leagues based on query parameter
  const filteredLeagues = leagueIdParam
    ? LEAGUES.filter(league => league.id === leagueIdParam)
    : LEAGUES;

  // Function to update URL with week parameter
  const updateWeekInURL = (week: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('week', week.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Function to handle week changes
  const handleWeekChange = (week: number) => {
    console.log(`📅 [MATCHUPS CLIENT] Week changed to: ${week}`);
    setSelectedWeek(week);
    updateWeekInURL(week);
    fetchMatchupsForWeek(week);
  };

  const fetchMatchupsForWeek = async (week: number) => {
    setLoading(true);
    setError(null);

    console.log('🔍 [MATCHUPS CLIENT] Fetching matchups for week:', week);
    console.log('📋 [MATCHUPS CLIENT] Filtered leagues:', filteredLeagues);

    try {
      const leagueData: LeagueMatchups[] = [];

      for (const league of filteredLeagues) {
        console.log('⚔️ [MATCHUPS CLIENT] Fetching for league:', league.name, league.id);
        const response = await fetch(`/api/matchups/${league.id}/${week}`);
        if (!response.ok) {
          console.error(
            '❌ [MATCHUPS CLIENT] API response not OK:',
            response.status,
            response.statusText,
          );
          throw new Error(`Failed to fetch matchups for ${league.name}`);
        }

        const data = await response.json();
        console.log('📊 [MATCHUPS CLIENT] Raw API response for', league.name, ':', data);

        const matchups: MatchupData[] = data.matchups.map((matchup: any) => ({
          matchupId: matchup.matchupId,
          teams: matchup.teams.map((team: any) => ({
            rosterId: team.rosterId,
            teamName: team.teamName || `Team ${team.rosterId}`,
            ownerName: team.ownerName || 'Unknown',
            points: team.points || 0,
            projectedPoints: team.projectedPoints || 0,
            roster: {
              id: team.rosterId,
              players: team.players || [],
              starters: team.starters || [],
              owner: team.owner,
              playerProjections: team.playerProjections || {},
              starterProjections: team.starterProjections || {},
            },
          })),
          winner: matchup.summary?.winnerRosterId
            ? (() => {
                const winnerTeam = matchup.teams.find(
                  (team: any) => team.rosterId === matchup.summary.winnerRosterId,
                );
                if (!winnerTeam) return null;

                return {
                  rosterId: matchup.summary.winnerRosterId,
                  teamName: winnerTeam.teamName || `Team ${matchup.summary.winnerRosterId}`,
                  ownerName: winnerTeam.ownerName || 'Unknown',
                  points: winnerTeam.points || 0,
                  roster: {
                    id: matchup.summary.winnerRosterId,
                    players: [],
                    starters: [],
                    owner: winnerTeam.owner,
                  },
                };
              })()
            : null,
          isComplete:
            matchup.summary?.winnerRosterId !== null &&
            matchup.summary?.winnerRosterId !== undefined,
        }));

        console.log('📋 [MATCHUPS CLIENT] Processed matchups for', league.name, ':', matchups);

        leagueData.push({
          leagueId: league.id,
          leagueName: league.name,
          matchups,
        });
      }

      console.log('🎯 [MATCHUPS CLIENT] Final league data:', leagueData);
      setLeagueMatchups(leagueData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matchups');
    } finally {
      setLoading(false);
    }
  };

  // Single useEffect to handle initialization and URL param changes
  useEffect(() => {
    const initialize = async () => {
      console.log(
        `🔄 [MATCHUPS CLIENT] Initializing... URL week: ${weekParam}, selectedWeek: ${selectedWeek}`,
      );

      // If week is in URL, use it directly
      if (weekParam && !isNaN(parseInt(weekParam))) {
        const urlWeek = parseInt(weekParam);
        console.log(`📅 [MATCHUPS CLIENT] Using week from URL: ${urlWeek}`);
        setSelectedWeek(urlWeek);
        await fetchMatchupsForWeek(urlWeek);
        setIsInitializing(false);
        return;
      }

      // If no URL week, fetch current NFL week from Sleeper API
      try {
        console.log(
          '🏈 [MATCHUPS CLIENT] No URL week, fetching current NFL state from Sleeper API...',
        );
        const res = await fetch('/api/nfl-state', {
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (res.ok) {
          const nflState = await res.json();
          const currentWeek = nflState.display_week || nflState.week || 2;
          console.log(`📅 [MATCHUPS CLIENT] Current NFL week from Sleeper: ${currentWeek}`);

          // Update both state and URL
          setSelectedWeek(currentWeek);
          updateWeekInURL(currentWeek);
          await fetchMatchupsForWeek(currentWeek);
          setIsInitializing(false);
          return;
        } else {
          console.warn('⚠️ [MATCHUPS CLIENT] Failed to fetch NFL state, using fallback');
        }
      } catch (error) {
        console.error('❌ [MATCHUPS CLIENT] Error fetching NFL state:', error);
      }

      // Final fallback to week 2
      const fallbackWeek = 2;
      console.log(`📅 [MATCHUPS CLIENT] Using final fallback to week ${fallbackWeek}`);
      setSelectedWeek(fallbackWeek);
      updateWeekInURL(fallbackWeek);
      await fetchMatchupsForWeek(fallbackWeek);
      setIsInitializing(false);
    };

    if (isInitializing) {
      initialize();
    }
  }, [weekParam, isInitializing]); // Depend on URL param changes

  // Handle URL week param changes after initialization
  useEffect(() => {
    if (!isInitializing && weekParam && !isNaN(parseInt(weekParam))) {
      const urlWeek = parseInt(weekParam);
      if (urlWeek !== selectedWeek) {
        console.log(`📅 [MATCHUPS CLIENT] URL week changed to: ${urlWeek}`);
        setSelectedWeek(urlWeek);
        fetchMatchupsForWeek(urlWeek);
      }
    }
  }, [weekParam, isInitializing, selectedWeek]);

  // Show loading during initialization to prevent flash of wrong data
  if (isInitializing || selectedWeek === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold font-geizer tracking-wide text-foreground">
                  Matchups
                </h1>
                <p className="text-muted-foreground mt-2 font-avenir">
                  Loading current NFL week...
                </p>
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">Error loading matchups</div>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => handleWeekChange(selectedWeek)} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          {leagueIdParam && (
            <Link href="/matchups">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Matchups
              </Button>
            </Link>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-geizer tracking-wide text-foreground">
                {leagueIdParam ? `${filteredLeagues[0]?.name || 'League'} Matchups` : 'Matchups'}
              </h1>
              <p className="text-muted-foreground mt-2 font-avenir">
                {leagueIdParam
                  ? `View matchups for ${filteredLeagues[0]?.name || 'this league'}`
                  : 'View all matchups across both Gauntlet leagues'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={selectedWeek.toString()}
                onValueChange={value => handleWeekChange(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKS.map(week => (
                    <SelectItem key={week} value={week.toString()}>
                      Week {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* League-Wide Odds */}
        <LeagueWideOdds week={selectedWeek} className="mb-8" />

        {/* Loading State */}
        {loading && (
          <div className="space-y-8">
            {filteredLeagues.map(league => (
              <Card key={league.id}>
                <CardHeader>
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Matchups by League */}
        {!loading &&
          leagueMatchups.map(league => (
            <Card key={league.leagueId}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-gauntlet-crimson" />
                  <div>
                    <CardTitle className="text-xl font-geizer tracking-wide">
                      {league.leagueName}
                    </CardTitle>
                    <CardDescription className="font-avenir">
                      Week {selectedWeek} • {league.matchups.length} matchups
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {league.matchups.map(matchup => (
                    <MatchupCard
                      key={matchup.matchupId}
                      matchup={matchup}
                      leagueId={league.leagueId}
                      week={selectedWeek}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

        {/* Empty State */}
        {!loading && leagueMatchups.every(league => league.matchups.length === 0) && (
          <div className="text-center py-12">
            <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-lg font-medium text-muted-foreground mb-2">No matchups found</div>
            <p className="text-muted-foreground">No matchups available for Week {selectedWeek}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const MatchupCard = ({
  matchup,
  leagueId,
  week,
}: {
  matchup: MatchupData;
  leagueId: string;
  week: number;
}) => {
  const [teamA, teamB] = matchup.teams;
  const isGameActive = !matchup.isComplete;

  return (
    <Link href={`/matchups/${leagueId}/${week}/${matchup.matchupId}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex justify-between items-center">
              <Badge variant={matchup.isComplete ? 'secondary' : 'default'} className="text-xs">
                {matchup.isComplete ? 'Final' : 'Live'}
              </Badge>
              {isGameActive && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  In Progress
                </div>
              )}
            </div>

            {/* Teams */}
            <div className="space-y-2">
              <TeamRow team={teamA} isWinner={matchup.winner?.rosterId === teamA.rosterId} />
              <div className="border-t border-muted my-2" />
              <TeamRow team={teamB} isWinner={matchup.winner?.rosterId === teamB.rosterId} />
            </div>

            {/* Live Odds Preview - only for active games */}
            {!matchup.isComplete && (
              <div className="py-2 border-t border-muted">
                <MatchupOddsPreview
                  leagueId={leagueId}
                  week={week}
                  matchupId={matchup.matchupId}
                  teamAName={teamA.teamName}
                  teamBName={teamB.teamName}
                />
              </div>
            )}

            {/* Matchup Info */}
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-muted">
              <span>Matchup {matchup.matchupId}</span>
              <div className="flex items-center gap-1">
                <Swords className="h-3 w-3" />
                View Details
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

// Safe avatar component with error handling
const Avatar = ({ src, alt, fallback }: { src?: string | null; alt: string; fallback: string }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
        {fallback.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-8 w-8 rounded-full"
      onError={() => setHasError(true)}
      onLoad={() => setHasError(false)}
    />
  );
};

const TeamRow = ({ team, isWinner }: { team: MatchupTeam; isWinner?: boolean }) => {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded ${isWinner ? 'bg-green-50 dark:bg-green-950' : ''}`}
    >
      <div className="flex items-center gap-3">
        <Avatar src={team.roster.owner?.avatar} alt={team.ownerName} fallback={team.ownerName} />
        <div>
          <div className="font-medium text-sm">{team.teamName}</div>
          <div className="text-xs text-muted-foreground">{team.ownerName}</div>
        </div>
      </div>

      <div className="text-right">
        <div className={`font-bold ${isWinner ? 'text-green-600 dark:text-green-400' : ''}`}>
          {team.points.toFixed(1)}
        </div>
        {team.projectedPoints && (
          <div className="text-xs text-muted-foreground">
            Proj: {team.projectedPoints.toFixed(1)}
          </div>
        )}
      </div>
    </div>
  );
};

export default function MatchupsPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-32 w-full" />
            <div className="space-y-8">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      }
    >
      <MatchupsPageContent />
    </Suspense>
  );
}
