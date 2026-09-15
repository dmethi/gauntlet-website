'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Crown, RefreshCw, Target, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getLeagueConfig } from '@/config/leagues';
import { buildGauntletMatchupPath } from '@/features/matchups/matchup-links';
import type {
  LeagueWideOddsProps,
  LeagueWideOddsType,
  MatchupOdds,
  TeamOdds,
} from '@/features/matchups/types';
import {
  DataList,
  DataListDescription,
  DataListHeader,
  DataListItem,
  DataListMetric,
  DataListMetricLabel,
  DataListMetrics,
  DataListMetricValue,
  DataListTitle,
} from '@/components/ui/data-list';

const getLeagueBadgeColor = (leagueId: string): string => {
  switch (getLeagueConfig(leagueId)?.conference) {
    case 'Legion I':
    case 'AFC':
      return 'border border-primary/20 bg-primary/10 text-primary';
    case 'Legion II':
    case 'NFC':
      return 'border border-secondary/30 bg-secondary/15 text-secondary';
    default:
      return 'border border-success/30 bg-success/15 text-success';
  }
};

const getLeagueShortName = (leagueId: string): string =>
  getLeagueConfig(leagueId)?.conference || 'League';

const TeamOddsMobileList = ({ teams, week }: { teams: TeamOdds[]; week: number }) => (
  <DataList className="sm:hidden">
    {teams.map((team, index) => (
      <DataListItem key={team.teamId}>
        <DataListHeader>
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 px-1.5 text-sm font-bold tabular-nums text-primary">
              {index + 1}
            </span>
            <div className="min-w-0">
              <DataListTitle>
                <Link
                  href={buildGauntletMatchupPath(team.leagueId, week, team.matchupId)}
                  className="inline-flex min-h-11 items-center rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {team.teamName}
                </Link>
              </DataListTitle>
              <DataListDescription>{getLeagueShortName(team.leagueId)}</DataListDescription>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Probability
            </div>
            <div className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
              {(team.probability * 100).toFixed(1)}%
            </div>
          </div>
        </DataListHeader>
        <DataListMetrics>
          <DataListMetric>
            <DataListMetricLabel>Projection</DataListMetricLabel>
            <DataListMetricValue>
              {(team.projectedRange?.p50 ?? team.totalProjection).toFixed(1)} pts
            </DataListMetricValue>
          </DataListMetric>
          <DataListMetric>
            <DataListMetricLabel>Range</DataListMetricLabel>
            <DataListMetricValue>
              {team.projectedRange?.p10?.toFixed(0) ?? '0'}–
              {team.projectedRange?.p90?.toFixed(0) ?? '0'}
            </DataListMetricValue>
          </DataListMetric>
          <DataListMetric className="text-right">
            <DataListMetricLabel>Odds</DataListMetricLabel>
            <DataListMetricValue>{team.odds}</DataListMetricValue>
          </DataListMetric>
        </DataListMetrics>
      </DataListItem>
    ))}
  </DataList>
);

const MatchupOddsMobileList = ({
  matchups,
  week,
  valueLabel,
  valueFor,
}: {
  matchups: MatchupOdds[];
  week: number;
  valueLabel: string;
  valueFor: (matchup: MatchupOdds) => string;
}) => (
  <DataList className="sm:hidden">
    {matchups.map((matchup, index) => (
      <DataListItem key={`${matchup.matchupId}-${matchup.team1.leagueId}-${valueLabel}`}>
        <DataListHeader>
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 px-1.5 text-sm font-bold tabular-nums text-primary">
              {index + 1}
            </span>
            <div className="min-w-0">
              <DataListTitle>
                <Link
                  href={buildGauntletMatchupPath(matchup.team1.leagueId, week, matchup.matchupId)}
                  className="inline-flex min-h-11 items-center rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {matchup.team1.name} vs {matchup.team2.name}
                </Link>
              </DataListTitle>
              <DataListDescription>
                {getLeagueShortName(matchup.team1.leagueId)}
              </DataListDescription>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Probability
            </div>
            <div className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
              {(matchup.probability * 100).toFixed(1)}%
            </div>
          </div>
        </DataListHeader>
        <DataListMetrics className="grid-cols-2">
          <DataListMetric>
            <DataListMetricLabel>{valueLabel}</DataListMetricLabel>
            <DataListMetricValue>{valueFor(matchup)}</DataListMetricValue>
          </DataListMetric>
          <DataListMetric className="text-right">
            <DataListMetricLabel>Odds</DataListMetricLabel>
            <DataListMetricValue>{matchup.odds}</DataListMetricValue>
          </DataListMetric>
        </DataListMetrics>
      </DataListItem>
    ))}
  </DataList>
);

export const LeagueWideOdds = ({ week, className = '' }: LeagueWideOddsProps) => {
  const [odds, setOdds] = useState<LeagueWideOddsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOdds = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Add cache busting to ensure fresh data, especially for new weeks
      const cacheBuster = Date.now();
      const response = await fetch(`/api/matchups/league-odds/${week}?t=${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

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

  if (loading) {
    return (
      <Card mobileFlat className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-geizer tracking-wide">
            <Crown className="h-5 w-5 text-secondary" />
            League-Wide Odds
            <Badge variant="outline">Week {week}</Badge>
          </CardTitle>
          <CardDescription>
            Simulating all matchups to find the week&apos;s most likely outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-2">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
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
      <Card mobileFlat className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-geizer tracking-wide text-destructive">
            <AlertCircle className="h-5 w-5" />
            League-Wide Odds Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchOdds()} variant="outline" className="min-h-11">
            <RefreshCw className="h-4 w-4 mr-2" />
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
    <Card mobileFlat className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-geizer tracking-wide">
              <Crown className="h-5 w-5 text-secondary" />
              League-Wide Odds
              <Badge variant="outline">Week {week}</Badge>
            </CardTitle>
            <CardDescription className="font-avenir">
              Live projections and distributions from driveFF across all three Legions
            </CardDescription>
          </div>
          <Button
            onClick={() => fetchOdds(false)}
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            disabled={loading}
            aria-label="Refresh league-wide odds"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-8">
          {/* Highest Scorer Table */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-success" />
              <h3 className="text-lg font-semibold text-success">Highest Scorer Odds</h3>
            </div>
            <TeamOddsMobileList teams={odds.highestScorer} week={week} />
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="text-left py-2 font-medium text-muted-foreground">Rank</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Team</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">League</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Projection
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Range</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Probability
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Odds</th>
                  </tr>
                </thead>
                <tbody>
                  {odds.highestScorer.map((team, index) => (
                    <tr key={team.teamId} className="border-b border-muted/50 hover:bg-muted/30">
                      <td className="py-2 text-muted-foreground">#{index + 1}</td>
                      <td className="py-2 font-medium">
                        <Link
                          href={buildGauntletMatchupPath(team.leagueId, week, team.matchupId)}
                          className="underline-offset-4 hover:text-primary hover:underline"
                        >
                          {team.teamName}
                        </Link>
                      </td>
                      <td className="py-2">
                        <Badge className={getLeagueBadgeColor(team.leagueId)} variant="secondary">
                          {getLeagueShortName(team.leagueId)}
                        </Badge>
                      </td>
                      <td className="py-2 text-right font-mono">
                        {team.projectedRange?.p50?.toFixed(1) || team.totalProjection.toFixed(1)}{' '}
                        pts
                      </td>
                      <td className="py-2 text-right text-xs text-muted-foreground font-mono">
                        {team.projectedRange?.p10?.toFixed(0) || '0'}-
                        {team.projectedRange?.p90?.toFixed(0) || '0'}
                      </td>
                      <td className="py-2 text-right font-mono">
                        {(team.probability * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 text-right">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs"
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
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <h3 className="text-lg font-semibold text-destructive">Lowest Scorer Odds</h3>
            </div>
            <TeamOddsMobileList teams={odds.lowestScorer} week={week} />
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="text-left py-2 font-medium text-muted-foreground">Rank</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Team</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">League</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Projection
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Range</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Probability
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Odds</th>
                  </tr>
                </thead>
                <tbody>
                  {odds.lowestScorer.map((team, index) => (
                    <tr key={team.teamId} className="border-b border-muted/50 hover:bg-muted/30">
                      <td className="py-2 text-muted-foreground">#{index + 1}</td>
                      <td className="py-2 font-medium">
                        <Link
                          href={buildGauntletMatchupPath(team.leagueId, week, team.matchupId)}
                          className="underline-offset-4 hover:text-primary hover:underline"
                        >
                          {team.teamName}
                        </Link>
                      </td>
                      <td className="py-2">
                        <Badge className={getLeagueBadgeColor(team.leagueId)} variant="secondary">
                          {getLeagueShortName(team.leagueId)}
                        </Badge>
                      </td>
                      <td className="py-2 text-right font-mono">
                        {team.projectedRange?.p50?.toFixed(1) || team.totalProjection.toFixed(1)}{' '}
                        pts
                      </td>
                      <td className="py-2 text-right text-xs text-muted-foreground font-mono">
                        {team.projectedRange?.p10?.toFixed(0) || '0'}-
                        {team.projectedRange?.p90?.toFixed(0) || '0'}
                      </td>
                      <td className="py-2 text-right font-mono">
                        {(team.probability * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 text-right">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs"
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
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-secondary" />
              <h3 className="text-lg font-semibold text-secondary">Closest Matchups</h3>
            </div>
            <MatchupOddsMobileList
              matchups={odds.closestMatchup}
              week={week}
              valueLabel="Margin"
              valueFor={matchup => `${matchup.projectedMargin?.toFixed(1) || '0'} pts`}
            />
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="text-left py-2 font-medium text-muted-foreground">Rank</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Matchup</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">League</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Margin</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Probability
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Odds</th>
                  </tr>
                </thead>
                <tbody>
                  {odds.closestMatchup.map((matchup, index) => (
                    <tr
                      key={`${matchup.matchupId}-${matchup.team1.leagueId}`}
                      className="border-b border-muted/50 hover:bg-muted/30"
                    >
                      <td className="py-2 text-muted-foreground">#{index + 1}</td>
                      <td className="py-2">
                        <Link
                          href={buildGauntletMatchupPath(
                            matchup.team1.leagueId,
                            week,
                            matchup.matchupId,
                          )}
                          className="font-medium underline-offset-4 hover:text-primary hover:underline"
                        >
                          {matchup.team1.name}
                          <span className="text-xs text-muted-foreground mx-1">vs</span>
                          {matchup.team2.name}
                        </Link>
                      </td>
                      <td className="py-2">
                        <Badge
                          className={getLeagueBadgeColor(matchup.team1.leagueId)}
                          variant="secondary"
                        >
                          {getLeagueShortName(matchup.team1.leagueId)}
                        </Badge>
                      </td>
                      <td className="py-2 text-right font-mono">
                        {matchup.projectedMargin?.toFixed(1) || '0'} pts
                      </td>
                      <td className="py-2 text-right font-mono">
                        {(matchup.probability * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 text-right">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs"
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
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">Biggest Blowouts</h3>
            </div>
            <MatchupOddsMobileList
              matchups={odds.biggestBlowout}
              week={week}
              valueLabel="Margin"
              valueFor={matchup => `${matchup.projectedMargin?.toFixed(1) || '0'} pts`}
            />
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="text-left py-2 font-medium text-muted-foreground">Rank</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Matchup</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">League</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Margin</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Probability
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Odds</th>
                  </tr>
                </thead>
                <tbody>
                  {odds.biggestBlowout.map((matchup, index) => (
                    <tr
                      key={`${matchup.matchupId}-${matchup.team1.leagueId}`}
                      className="border-b border-muted/50 hover:bg-muted/30"
                    >
                      <td className="py-2 text-muted-foreground">#{index + 1}</td>
                      <td className="py-2">
                        <Link
                          href={buildGauntletMatchupPath(
                            matchup.team1.leagueId,
                            week,
                            matchup.matchupId,
                          )}
                          className="font-medium underline-offset-4 hover:text-primary hover:underline"
                        >
                          {matchup.team1.name}
                          <span className="text-xs text-muted-foreground mx-1">vs</span>
                          {matchup.team2.name}
                        </Link>
                      </td>
                      <td className="py-2">
                        <Badge
                          className={getLeagueBadgeColor(matchup.team1.leagueId)}
                          variant="secondary"
                        >
                          {getLeagueShortName(matchup.team1.leagueId)}
                        </Badge>
                      </td>
                      <td className="py-2 text-right font-mono">
                        {matchup.projectedMargin?.toFixed(1) || '0'} pts
                      </td>
                      <td className="py-2 text-right font-mono">
                        {(matchup.probability * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 text-right">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs"
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
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-success" />
              <h3 className="text-lg font-semibold text-success">Highest Scoring Matchup</h3>
            </div>
            <MatchupOddsMobileList
              matchups={odds.highestScoringMatchup || []}
              week={week}
              valueLabel="Total points"
              valueFor={matchup =>
                `${(matchup.team1.projection + matchup.team2.projection).toFixed(1)} pts`
              }
            />
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="text-left py-2 font-medium text-muted-foreground">Rank</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Matchup</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">League</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Total Points
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Probability
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Odds</th>
                  </tr>
                </thead>
                <tbody>
                  {(odds.highestScoringMatchup || []).map((matchup, index) => (
                    <tr
                      key={`${matchup.matchupId}-${matchup.team1.leagueId}-highest`}
                      className="border-b border-muted/50 hover:bg-muted/30"
                    >
                      <td className="py-2 text-muted-foreground">#{index + 1}</td>
                      <td className="py-2">
                        <Link
                          href={buildGauntletMatchupPath(
                            matchup.team1.leagueId,
                            week,
                            matchup.matchupId,
                          )}
                          className="font-medium underline-offset-4 hover:text-primary hover:underline"
                        >
                          {matchup.team1.name}
                          <span className="text-xs text-muted-foreground mx-1">vs</span>
                          {matchup.team2.name}
                        </Link>
                      </td>
                      <td className="py-2">
                        <Badge
                          className={getLeagueBadgeColor(matchup.team1.leagueId)}
                          variant="secondary"
                        >
                          {getLeagueShortName(matchup.team1.leagueId)}
                        </Badge>
                      </td>
                      <td className="py-2 text-right font-mono">
                        {(matchup.team1.projection + matchup.team2.projection).toFixed(1)} pts
                      </td>
                      <td className="py-2 text-right font-mono">
                        {(matchup.probability * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 text-right">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs"
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
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-secondary" />
              <h3 className="text-lg font-semibold text-secondary">Lowest Scoring Matchup</h3>
            </div>
            <MatchupOddsMobileList
              matchups={odds.lowestScoringMatchup || []}
              week={week}
              valueLabel="Total points"
              valueFor={matchup =>
                `${(matchup.team1.projection + matchup.team2.projection).toFixed(1)} pts`
              }
            />
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="text-left py-2 font-medium text-muted-foreground">Rank</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Matchup</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">League</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Total Points
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Probability
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Odds</th>
                  </tr>
                </thead>
                <tbody>
                  {(odds.lowestScoringMatchup || []).map((matchup, index) => (
                    <tr
                      key={`${matchup.matchupId}-${matchup.team1.leagueId}-lowest`}
                      className="border-b border-muted/50 hover:bg-muted/30"
                    >
                      <td className="py-2 text-muted-foreground">#{index + 1}</td>
                      <td className="py-2">
                        <Link
                          href={buildGauntletMatchupPath(
                            matchup.team1.leagueId,
                            week,
                            matchup.matchupId,
                          )}
                          className="font-medium underline-offset-4 hover:text-primary hover:underline"
                        >
                          {matchup.team1.name}
                          <span className="text-xs text-muted-foreground mx-1">vs</span>
                          {matchup.team2.name}
                        </Link>
                      </td>
                      <td className="py-2">
                        <Badge
                          className={getLeagueBadgeColor(matchup.team1.leagueId)}
                          variant="secondary"
                        >
                          {getLeagueShortName(matchup.team1.leagueId)}
                        </Badge>
                      </td>
                      <td className="py-2 text-right font-mono">
                        {(matchup.team1.projection + matchup.team2.projection).toFixed(1)} pts
                      </td>
                      <td className="py-2 text-right font-mono">
                        {(matchup.probability * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 text-right">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs"
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
        <div className="mt-4 pt-4 border-t border-muted text-center">
          <p className="text-xs text-muted-foreground">
            Updated: {new Date(odds.lastUpdated).toLocaleTimeString()} • driveFF live model • 10,000
            cross-league simulations
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
