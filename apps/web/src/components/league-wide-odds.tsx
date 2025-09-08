'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Crown, RefreshCw, Target, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TeamOdds {
  teamId: string;
  teamName: string;
  leagueId: string;
  leagueName: string;
  probability: number;
  odds: string; // American odds format (+150, -200, etc.)
  projectedRange: { p10: number; p50: number; p90: number };
  totalProjection: number;
  color: string; // RdYlGn color for heatmap
}

interface MatchupOdds {
  matchupId: number;
  team1: { name: string; leagueId: string; projection: number };
  team2: { name: string; leagueId: string; projection: number };
  projectedMargin: number;
  probability: number;
  odds: string;
  color: string;
}

interface LeagueWideOdds {
  week: number;
  highestScorer: TeamOdds[];
  lowestScorer: TeamOdds[];
  closestMatchup: MatchupOdds[];
  biggestBlowout: MatchupOdds[];
  highestScoringMatchup: MatchupOdds[];
  lowestScoringMatchup: MatchupOdds[];
  lastUpdated: string;
}

interface LeagueWideOddsProps {
  week: number;
  className?: string;
}

export function LeagueWideOdds({ week, className = '' }: LeagueWideOddsProps) {
  const [odds, setOdds] = useState<LeagueWideOdds | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOdds = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await fetch(`/api/matchups/league-odds/${week}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch odds: ${response.status}`);
      }

      const data = await response.json();
      setOdds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load odds');
      console.error('League-wide odds error:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOdds();
  }, [week]);

  const getLeagueBadgeColor = (leagueId: string): string => {
    return leagueId === '1263744209295245312'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const getLeagueShortName = (leagueId: string): string => {
    return leagueId === '1263744209295245312' ? 'AFC' : 'NFC';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 font-geizer tracking-wide'>
            <Crown className='h-5 w-5 text-amber-500' />
            League-Wide Odds
            <Badge variant='outline'>Week {week}</Badge>
          </CardTitle>
          <CardDescription>
            Simulating all matchups to find the week&apos;s most likely outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className='space-y-3'>
                <Skeleton className='h-6 w-48' />
                <div className='space-y-2'>
                  {[1, 2, 3].map(j => (
                    <div key={j} className='flex items-center justify-between'>
                      <Skeleton className='h-4 w-32' />
                      <Skeleton className='h-4 w-16' />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 font-geizer tracking-wide text-red-600'>
            <AlertCircle className='h-5 w-5' />
            League-Wide Odds Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground mb-4'>{error}</p>
          <Button onClick={() => fetchOdds()} variant='outline' size='sm'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!odds) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2 font-geizer tracking-wide'>
              <Crown className='h-5 w-5 text-amber-500' />
              League-Wide Odds
              <Badge variant='outline'>Week {week}</Badge>
            </CardTitle>
            <CardDescription className='font-avenir'>
              Monte Carlo predictions across all Gauntlet matchups
            </CardDescription>
          </div>
          <Button onClick={() => fetchOdds(false)} variant='ghost' size='sm' disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className='space-y-8'>
          {/* Highest Scorer Table */}
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <TrendingUp className='h-5 w-5 text-green-600' />
              <h3 className='text-lg font-semibold text-green-700 dark:text-green-400'>
                Highest Scorer Odds
              </h3>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-muted'>
                    <th className='text-left py-2 font-medium text-muted-foreground'>Rank</th>
                    <th className='text-left py-2 font-medium text-muted-foreground'>Team</th>
                    <th className='text-left py-2 font-medium text-muted-foreground'>League</th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>
                      Projection
                    </th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>Range</th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>
                      Probability
                    </th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>Odds</th>
                  </tr>
                </thead>
                <tbody>
                  {odds.highestScorer.map((team, index) => (
                    <tr key={team.teamId} className='border-b border-muted/50 hover:bg-muted/30'>
                      <td className='py-2 text-muted-foreground'>#{index + 1}</td>
                      <td className='py-2 font-medium'>{team.teamName}</td>
                      <td className='py-2'>
                        <Badge className={getLeagueBadgeColor(team.leagueId)} variant='secondary'>
                          {getLeagueShortName(team.leagueId)}
                        </Badge>
                      </td>
                      <td className='py-2 text-right font-mono'>
                        {team.projectedRange?.p50?.toFixed(1) || team.totalProjection.toFixed(1)}{' '}
                        pts
                      </td>
                      <td className='py-2 text-right text-xs text-muted-foreground font-mono'>
                        {team.projectedRange?.p10?.toFixed(0) || '0'}-
                        {team.projectedRange?.p90?.toFixed(0) || '0'}
                      </td>
                      <td className='py-2 text-right font-mono'>
                        {(team.probability * 100).toFixed(1)}%
                      </td>
                      <td className='py-2 text-right'>
                        <Badge
                          variant='outline'
                          className='font-mono text-xs'
                          style={{ backgroundColor: `${team.color}20`, borderColor: team.color }}
                        >
                          {team.odds}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lowest Scorer Table */}
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <TrendingDown className='h-5 w-5 text-red-600' />
              <h3 className='text-lg font-semibold text-red-700 dark:text-red-400'>
                Lowest Scorer Odds
              </h3>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-muted'>
                    <th className='text-left py-2 font-medium text-muted-foreground'>Rank</th>
                    <th className='text-left py-2 font-medium text-muted-foreground'>Team</th>
                    <th className='text-left py-2 font-medium text-muted-foreground'>League</th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>
                      Projection
                    </th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>Range</th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>
                      Probability
                    </th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>Odds</th>
                  </tr>
                </thead>
                <tbody>
                  {odds.lowestScorer.map((team, index) => (
                    <tr key={team.teamId} className='border-b border-muted/50 hover:bg-muted/30'>
                      <td className='py-2 text-muted-foreground'>#{index + 1}</td>
                      <td className='py-2 font-medium'>{team.teamName}</td>
                      <td className='py-2'>
                        <Badge className={getLeagueBadgeColor(team.leagueId)} variant='secondary'>
                          {getLeagueShortName(team.leagueId)}
                        </Badge>
                      </td>
                      <td className='py-2 text-right font-mono'>
                        {team.projectedRange?.p50?.toFixed(1) || team.totalProjection.toFixed(1)}{' '}
                        pts
                      </td>
                      <td className='py-2 text-right text-xs text-muted-foreground font-mono'>
                        {team.projectedRange?.p10?.toFixed(0) || '0'}-
                        {team.projectedRange?.p90?.toFixed(0) || '0'}
                      </td>
                      <td className='py-2 text-right font-mono'>
                        {(team.probability * 100).toFixed(1)}%
                      </td>
                      <td className='py-2 text-right'>
                        <Badge
                          variant='outline'
                          className='font-mono text-xs'
                          style={{ backgroundColor: `${team.color}20`, borderColor: team.color }}
                        >
                          {team.odds}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Closest Matchups Table */}
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <Target className='h-5 w-5 text-orange-600' />
              <h3 className='text-lg font-semibold text-orange-700 dark:text-orange-400'>
                Closest Matchups
              </h3>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-muted'>
                    <th className='text-left py-2 font-medium text-muted-foreground'>Rank</th>
                    <th className='text-left py-2 font-medium text-muted-foreground'>Matchup</th>
                    <th className='text-left py-2 font-medium text-muted-foreground'>League</th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>Margin</th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>
                      Probability
                    </th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>Odds</th>
                  </tr>
                </thead>
                <tbody>
                  {odds.closestMatchup.map((matchup, index) => (
                    <tr
                      key={`${matchup.matchupId}-${matchup.team1.leagueId}`}
                      className='border-b border-muted/50 hover:bg-muted/30'
                    >
                      <td className='py-2 text-muted-foreground'>#{index + 1}</td>
                      <td className='py-2'>
                        <div className='font-medium'>
                          {matchup.team1.name}
                          <span className='text-xs text-muted-foreground mx-1'>vs</span>
                          {matchup.team2.name}
                        </div>
                      </td>
                      <td className='py-2'>
                        <Badge
                          className={getLeagueBadgeColor(matchup.team1.leagueId)}
                          variant='secondary'
                        >
                          {getLeagueShortName(matchup.team1.leagueId)}
                        </Badge>
                      </td>
                      <td className='py-2 text-right font-mono'>
                        {matchup.projectedMargin?.toFixed(1) || '0'} pts
                      </td>
                      <td className='py-2 text-right font-mono'>
                        {(matchup.probability * 100).toFixed(1)}%
                      </td>
                      <td className='py-2 text-right'>
                        <Badge
                          variant='outline'
                          className='font-mono text-xs'
                          style={{
                            backgroundColor: `${matchup.color}20`,
                            borderColor: matchup.color,
                          }}
                        >
                          {matchup.odds}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Biggest Blowout Table */}
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <Zap className='h-5 w-5 text-purple-600' />
              <h3 className='text-lg font-semibold text-purple-700 dark:text-purple-400'>
                Biggest Blowouts
              </h3>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-muted'>
                    <th className='text-left py-2 font-medium text-muted-foreground'>Rank</th>
                    <th className='text-left py-2 font-medium text-muted-foreground'>Matchup</th>
                    <th className='text-left py-2 font-medium text-muted-foreground'>League</th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>Margin</th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>
                      Probability
                    </th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>Odds</th>
                  </tr>
                </thead>
                <tbody>
                  {odds.biggestBlowout.map((matchup, index) => (
                    <tr
                      key={`${matchup.matchupId}-${matchup.team1.leagueId}`}
                      className='border-b border-muted/50 hover:bg-muted/30'
                    >
                      <td className='py-2 text-muted-foreground'>#{index + 1}</td>
                      <td className='py-2'>
                        <div className='font-medium'>
                          {matchup.team1.name}
                          <span className='text-xs text-muted-foreground mx-1'>vs</span>
                          {matchup.team2.name}
                        </div>
                      </td>
                      <td className='py-2'>
                        <Badge
                          className={getLeagueBadgeColor(matchup.team1.leagueId)}
                          variant='secondary'
                        >
                          {getLeagueShortName(matchup.team1.leagueId)}
                        </Badge>
                      </td>
                      <td className='py-2 text-right font-mono'>
                        {matchup.projectedMargin?.toFixed(1) || '0'} pts
                      </td>
                      <td className='py-2 text-right font-mono'>
                        {(matchup.probability * 100).toFixed(1)}%
                      </td>
                      <td className='py-2 text-right'>
                        <Badge
                          variant='outline'
                          className='font-mono text-xs'
                          style={{
                            backgroundColor: `${matchup.color}20`,
                            borderColor: matchup.color,
                          }}
                        >
                          {matchup.odds}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Highest Scoring Matchup Table */}
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <TrendingUp className='h-5 w-5 text-green-600' />
              <h3 className='text-lg font-semibold text-green-700 dark:text-green-400'>
                Highest Scoring Matchup
              </h3>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-muted'>
                    <th className='text-left py-2 font-medium text-muted-foreground'>Rank</th>
                    <th className='text-left py-2 font-medium text-muted-foreground'>Matchup</th>
                    <th className='text-left py-2 font-medium text-muted-foreground'>League</th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>
                      Total Points
                    </th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>
                      Probability
                    </th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>Odds</th>
                  </tr>
                </thead>
                <tbody>
                  {(odds.highestScoringMatchup || []).map((matchup, index) => (
                    <tr
                      key={`${matchup.matchupId}-${matchup.team1.leagueId}-highest`}
                      className='border-b border-muted/50 hover:bg-muted/30'
                    >
                      <td className='py-2 text-muted-foreground'>#{index + 1}</td>
                      <td className='py-2'>
                        <div className='font-medium'>
                          {matchup.team1.name}
                          <span className='text-xs text-muted-foreground mx-1'>vs</span>
                          {matchup.team2.name}
                        </div>
                      </td>
                      <td className='py-2'>
                        <Badge
                          className={getLeagueBadgeColor(matchup.team1.leagueId)}
                          variant='secondary'
                        >
                          {getLeagueShortName(matchup.team1.leagueId)}
                        </Badge>
                      </td>
                      <td className='py-2 text-right font-mono'>
                        {(matchup.team1.projection + matchup.team2.projection).toFixed(1)} pts
                      </td>
                      <td className='py-2 text-right font-mono'>
                        {(matchup.probability * 100).toFixed(1)}%
                      </td>
                      <td className='py-2 text-right'>
                        <Badge
                          variant='outline'
                          className='font-mono text-xs'
                          style={{
                            backgroundColor: `${matchup.color}20`,
                            borderColor: matchup.color,
                          }}
                        >
                          {matchup.odds}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lowest Scoring Matchup Table */}
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <TrendingDown className='h-5 w-5 text-orange-600' />
              <h3 className='text-lg font-semibold text-orange-700 dark:text-orange-400'>
                Lowest Scoring Matchup
              </h3>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-muted'>
                    <th className='text-left py-2 font-medium text-muted-foreground'>Rank</th>
                    <th className='text-left py-2 font-medium text-muted-foreground'>Matchup</th>
                    <th className='text-left py-2 font-medium text-muted-foreground'>League</th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>
                      Total Points
                    </th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>
                      Probability
                    </th>
                    <th className='text-right py-2 font-medium text-muted-foreground'>Odds</th>
                  </tr>
                </thead>
                <tbody>
                  {(odds.lowestScoringMatchup || []).map((matchup, index) => (
                    <tr
                      key={`${matchup.matchupId}-${matchup.team1.leagueId}-lowest`}
                      className='border-b border-muted/50 hover:bg-muted/30'
                    >
                      <td className='py-2 text-muted-foreground'>#{index + 1}</td>
                      <td className='py-2'>
                        <div className='font-medium'>
                          {matchup.team1.name}
                          <span className='text-xs text-muted-foreground mx-1'>vs</span>
                          {matchup.team2.name}
                        </div>
                      </td>
                      <td className='py-2'>
                        <Badge
                          className={getLeagueBadgeColor(matchup.team1.leagueId)}
                          variant='secondary'
                        >
                          {getLeagueShortName(matchup.team1.leagueId)}
                        </Badge>
                      </td>
                      <td className='py-2 text-right font-mono'>
                        {(matchup.team1.projection + matchup.team2.projection).toFixed(1)} pts
                      </td>
                      <td className='py-2 text-right font-mono'>
                        {(matchup.probability * 100).toFixed(1)}%
                      </td>
                      <td className='py-2 text-right'>
                        <Badge
                          variant='outline'
                          className='font-mono text-xs'
                          style={{
                            backgroundColor: `${matchup.color}20`,
                            borderColor: matchup.color,
                          }}
                        >
                          {matchup.odds}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='mt-4 pt-4 border-t border-muted text-center'>
          <p className='text-xs text-muted-foreground'>
            Updated: {new Date(odds.lastUpdated).toLocaleTimeString()} • Based on Monte Carlo
            simulations of all active rosters
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
