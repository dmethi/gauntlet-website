'use client';

import { useState } from 'react';
import { useHallOfFameEnhanced } from '@/hooks/useHallOfFameEnhanced';
import { formatRecord, getCategoryInfo, getRankEmoji } from '@/features/hall-of-fame/utils';
import { Container, PageHeader } from '@gauntlet/ui';
import ContentLoader from 'react-content-loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Filter,
  Sparkles,
  Swords,
  Target,
  TrendingDown,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { LEAGUE_IDS } from '@/lib/constants';

const HallOfFameLoader = () => (
  <ContentLoader
    speed={2}
    width={1200}
    height={800}
    viewBox="0 0 1200 800"
    backgroundColor="hsl(var(--muted))"
    foregroundColor="hsl(var(--muted-foreground))"
    uniqueKey="hall-of-fame-loader"
  >
    <rect x="16" y="32" rx="3" ry="3" width="400" height="36" />
    <rect x="16" y="72" rx="3" ry="3" width="200" height="20" />
    <rect x="16" y="120" rx="8" ry="8" width="600" height="40" />
    <rect x="16" y="180" rx="8" ry="8" width="380" height="250" />
    <rect x="410" y="180" rx="8" ry="8" width="380" height="250" />
    <rect x="804" y="180" rx="8" ry="8" width="380" height="250" />
  </ContentLoader>
);

function getGroupIcon(groupKey: string) {
  switch (groupKey) {
    case 'Score & Margin':
      return <Trophy className="h-5 w-5" />;
    case 'Lineup Quality':
      return <Target className="h-5 w-5" />;
    case 'Positional Splits':
      return <Zap className="h-5 w-5" />;
    case 'Player Records':
      return <Users className="h-5 w-5" />;
    case 'Win Probability':
      return <Sparkles className="h-5 w-5" />;
    case 'Rolling Windows':
      return <Clock className="h-5 w-5" />;
    case 'Season Records':
      return <Calendar className="h-5 w-5" />;
    case 'Matchup Records':
      return <Swords className="h-5 w-5" />;
    default:
      return <Trophy className="h-5 w-5" />;
  }
}

function getLeagueBadgeColor(leagueId: string): string {
  return leagueId === LEAGUE_IDS.AFC
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
}

function getLeagueShortName(leagueId: string): string {
  return leagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC';
}

// Component for rolling window records
function RollingWindowCard({ title, windows }: { title: string; windows: any[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {windows.map((window, index) => (
            <div
              key={`${window.rosterId}-${window.startWeek}`}
              className="flex items-start justify-between gap-2 pb-2 border-b last:border-0"
            >
              <div className="flex items-start gap-2 flex-1">
                <span className="font-mono text-sm mt-0.5">{getRankEmoji(index + 1)}</span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/team/${window.rosterId}`}
                    className="font-medium hover:underline block truncate"
                  >
                    {window.teamName}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getLeagueBadgeColor(window.leagueId)}>
                      {getLeagueShortName(window.leagueId)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Weeks {window.startWeek}-{window.endWeek}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">{window.totalPoints.toFixed(2)} pts</div>
                <div className="text-xs text-muted-foreground">
                  {window.averagePoints.toFixed(2)}/wk
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Component for streak records
function StreakCard({ title, streaks, type }: { title: string; streaks: any[]; type: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {streaks.map((streak, index) => (
            <div
              key={`${streak.rosterId}-${streak.startWeek}`}
              className="flex items-start justify-between gap-2 pb-2 border-b last:border-0"
            >
              <div className="flex items-start gap-2 flex-1">
                <span className="font-mono text-sm mt-0.5">{getRankEmoji(index + 1)}</span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/team/${streak.rosterId}`}
                    className="font-medium hover:underline block truncate"
                  >
                    {streak.teamName}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getLeagueBadgeColor(streak.leagueId)}>
                      {getLeagueShortName(streak.leagueId)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {streak.season} • Weeks {streak.startWeek}-{streak.endWeek}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">{streak.length} weeks</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Component for seasonal records
function SeasonalCard({
  title,
  records,
  statKey,
  formatFn,
}: {
  title: string;
  records: any[];
  statKey: string;
  formatFn: (value: number) => string;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {records.map((record, index) => (
            <div
              key={`${record.rosterId}-${record.season}`}
              className="flex items-start justify-between gap-2 pb-2 border-b last:border-0"
            >
              <div className="flex items-start gap-2 flex-1">
                <span className="font-mono text-sm mt-0.5">{getRankEmoji(index + 1)}</span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/team/${record.rosterId}`}
                    className="font-medium hover:underline block truncate"
                  >
                    {record.teamName}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getLeagueBadgeColor(record.leagueId)}>
                      {getLeagueShortName(record.leagueId)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{record.season} Season</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">{formatFn(record[statKey])}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function EnhancedHallOfFamePage() {
  const { data, isLoading, error } = useHallOfFameEnhanced();
  const [activeTab, setActiveTab] = useState<string>('weekly');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [seasonFilter, setSeasonFilter] = useState<string>('all');

  if (isLoading) {
    return (
      <Container className="py-8">
        <HallOfFameLoader />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <PageHeader title="Hall of Fame & Shame" subtitle="Failed to load records" />
        <div className="text-center mt-8 text-muted-foreground">
          {error instanceof Error ? error.message : 'An error occurred'}
        </div>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container className="py-8">
        <PageHeader title="Hall of Fame & Shame" subtitle="No records available" />
      </Container>
    );
  }

  const {
    weeklyRecords,
    rollingWindows,
    streaks,
    seasonal,
    positionalDifferences,
    totalMatchups,
    totalSeasons,
    totalLeagues,
  } = data;

  return (
    <Container className="py-8">
      <div className="mb-8">
        <PageHeader
          title="Hall of Fame & Shame"
          subtitle="Comprehensive records across all Gauntlet leagues"
        />
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {totalMatchups.toLocaleString()} matchups • {totalLeagues} leagues • {totalSeasons}{' '}
            seasons
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={leagueFilter} onValueChange={setLeagueFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Leagues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leagues</SelectItem>
                <SelectItem value={LEAGUE_IDS.AFC}>AFC</SelectItem>
                <SelectItem value={LEAGUE_IDS.NFC}>NFC</SelectItem>
              </SelectContent>
            </Select>
            <Select value={seasonFilter} onValueChange={setSeasonFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Seasons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-auto p-1 grid grid-cols-3 gap-1">
          <TabsTrigger value="weekly" className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <span>Weekly</span>
          </TabsTrigger>
          <TabsTrigger value="rolling" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Rolling</span>
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Seasonal</span>
          </TabsTrigger>
        </TabsList>

        {/* Weekly Records Tab */}
        <TabsContent value="weekly" className="mt-6">
          <div className="space-y-8">
            {/* Group categories by type */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Score & Margin Records</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  'highest_team_points',
                  'lowest_team_points',
                  'largest_margin_victory',
                  'smallest_margin_victory',
                  'most_points_loss',
                  'fewest_points_win',
                ].map(categoryId => {
                  const records = weeklyRecords.get(categoryId);
                  const category = getCategoryInfo(categoryId);
                  if (!records || !category || records.length === 0) return null;
                  return (
                    <Card key={categoryId} className="h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {records.slice(0, 5).map((record, index) => {
                            const matchupId = record.contextData?.matchupId;

                            return (
                              <div
                                key={`${categoryId}-${record.leagueId}-${record.teamId || 'na'}-${record.week}-${record.value}-${index}`}
                                className="flex items-start justify-between gap-2 pb-2 border-b last:border-0"
                              >
                                <div className="flex items-start gap-2 flex-1">
                                  <span className="font-mono text-sm mt-0.5">
                                    {getRankEmoji(index + 1)}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <Link
                                      href={`/team/${record.teamId}`}
                                      className="font-medium hover:underline block truncate"
                                    >
                                      {record.teamName}
                                    </Link>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <Badge
                                        variant="outline"
                                        className={getLeagueBadgeColor(record.leagueId)}
                                      >
                                        {getLeagueShortName(record.leagueId)}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        Week {record.week}
                                      </span>
                                      {record.opponent && (
                                        <span className="text-xs text-muted-foreground">
                                          vs {record.opponent}
                                        </span>
                                      )}
                                      {matchupId && (
                                        <Link
                                          href={`/matchups/${record.leagueId}/${record.week}/${matchupId}`}
                                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                          <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                            />
                                          </svg>
                                          View Matchup
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-sm">{formatRecord(record)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Positional Records */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Positional Records</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  'qb_points_weekly',
                  'rb_points_weekly',
                  'wr_points_weekly',
                  'te_points_weekly',
                  'def_points_weekly',
                  'highest_single_player_score',
                ].map(categoryId => {
                  const records = weeklyRecords.get(categoryId);
                  const category = getCategoryInfo(categoryId);
                  if (!records || !category || records.length === 0) return null;

                  // Check if this is a "both" type category (has both high and low records)
                  const isBothType = category.type === 'both';
                  const topRecords = isBothType ? records.slice(0, 5) : records.slice(0, 5);
                  // For hall of shame, we want the worst (lowest) at the top, so don't reverse
                  const bottomRecords = isBothType ? records.slice(-5) : [];

                  return (
                    <Card key={categoryId} className="h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Hall of Fame (Top 5) */}
                        <div>
                          <h4 className="font-semibold text-sm text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            Hall of Fame
                          </h4>
                          <div className="space-y-3">
                            {topRecords.map((record, index) => (
                              <div
                                key={`${record.teamId}-${record.week}-high-${categoryId}`}
                                className="flex items-start justify-between gap-2 pb-2 border-b last:border-0"
                              >
                                <div className="flex items-start gap-2 flex-1">
                                  <span className="font-mono text-sm mt-0.5">
                                    {getRankEmoji(index + 1)}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <Link
                                      href={`/team/${record.teamId}`}
                                      className="font-medium hover:underline block truncate"
                                    >
                                      {record.teamName}
                                    </Link>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <Badge
                                        variant="outline"
                                        className={getLeagueBadgeColor(record.leagueId)}
                                      >
                                        {getLeagueShortName(record.leagueId)}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        Week {record.week}
                                      </span>
                                      {record.opponent && (
                                        <span className="text-xs text-muted-foreground">
                                          vs {record.opponent}
                                        </span>
                                      )}
                                      {record.contextData?.matchupId && (
                                        <Link
                                          href={`/matchups/${record.leagueId}/${record.week}/${record.contextData.matchupId}`}
                                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                          <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                            />
                                          </svg>
                                          View Matchup
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-sm">{formatRecord(record)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Hall of Shame (Bottom 5) - only show for "both" type categories */}
                        {isBothType && bottomRecords.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                              <TrendingDown className="h-4 w-4" />
                              Hall of Shame
                            </h4>
                            <div className="space-y-3">
                              {bottomRecords.map((record, index) => {
                                const matchupId = record.contextData?.matchupId;

                                return (
                                  <div
                                    key={`${record.teamId}-${record.week}-low-${categoryId}`}
                                    className="flex items-start justify-between gap-2 pb-2 border-b last:border-0"
                                  >
                                    <div className="flex items-start gap-2 flex-1">
                                      <span className="font-mono text-sm mt-0.5">
                                        {getRankEmoji(index + 1)}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <Link
                                          href={`/team/${record.teamId}`}
                                          className="font-medium hover:underline block truncate"
                                        >
                                          {record.teamName}
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                          <Badge
                                            variant="outline"
                                            className={getLeagueBadgeColor(record.leagueId)}
                                          >
                                            {getLeagueShortName(record.leagueId)}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            Week {record.week}
                                          </span>
                                          {record.opponent && (
                                            <span className="text-xs text-muted-foreground">
                                              vs {record.opponent}
                                            </span>
                                          )}
                                          {matchupId && (
                                            <Link
                                              href={`/matchups/${record.leagueId}/${record.week}/${matchupId}`}
                                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                            >
                                              <svg
                                                className="h-3 w-3"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                              </svg>
                                              View Matchup
                                            </Link>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-sm">
                                        {formatRecord(record)}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Team Performance Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Team Performance Stats</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  'most_passing_yards',
                  'most_passing_tds',
                  'most_pass_completions',
                  'most_rushing_yards',
                  'most_rushing_tds',
                  'most_rush_attempts',
                  'most_receiving_yards',
                  'most_receptions',
                  'most_targets',
                  'total_tds_weekly',
                  'best_yards_per_rush',
                  'best_yards_per_reception',
                  'bench_blunder',
                  'highest_top3_sum',
                  'lowest_bottom3_sum',
                ].map(categoryId => {
                  const records = weeklyRecords.get(categoryId);
                  const category = getCategoryInfo(categoryId);
                  if (!records || !category || records.length === 0) return null;

                  // Check if this is a "both" type category (has both high and low records)
                  const isBothType = category.type === 'both';
                  const topRecords = isBothType ? records.slice(0, 5) : records.slice(0, 5);
                  // For hall of shame, we want the worst (lowest) at the top, so don't reverse
                  const bottomRecords = isBothType ? records.slice(-5) : [];

                  return (
                    <Card key={categoryId} className="h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Hall of Fame (Top 5) */}
                        <div>
                          {isBothType && (
                            <h4 className="font-semibold text-sm text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                              <Trophy className="h-4 w-4" />
                              Hall of Fame
                            </h4>
                          )}
                          <div className="space-y-3">
                            {topRecords.map((record, index) => (
                              <div
                                key={`${record.teamId}-${record.week}-high-${categoryId}`}
                                className="flex items-start justify-between gap-2 pb-2 border-b last:border-0"
                              >
                                <div className="flex items-start gap-2 flex-1">
                                  <span className="font-mono text-sm mt-0.5">
                                    {getRankEmoji(index + 1)}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <Link
                                      href={`/team/${record.teamId}`}
                                      className="font-medium hover:underline block truncate"
                                    >
                                      {record.teamName}
                                    </Link>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <Badge
                                        variant="outline"
                                        className={getLeagueBadgeColor(record.leagueId)}
                                      >
                                        {getLeagueShortName(record.leagueId)}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        Week {record.week}
                                      </span>
                                      {record.opponent && (
                                        <span className="text-xs text-muted-foreground">
                                          vs {record.opponent}
                                        </span>
                                      )}
                                      {record.contextData?.matchupId && (
                                        <Link
                                          href={`/matchups/${record.leagueId}/${record.week}/${record.contextData.matchupId}`}
                                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                          <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                            />
                                          </svg>
                                          View Matchup
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-sm">{formatRecord(record)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Hall of Shame (Bottom 5) - only show for "both" type categories */}
                        {isBothType && bottomRecords.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                              <TrendingDown className="h-4 w-4" />
                              Hall of Shame
                            </h4>
                            <div className="space-y-3">
                              {bottomRecords.map((record, index) => {
                                const matchupId = record.contextData?.matchupId;

                                return (
                                  <div
                                    key={`${record.teamId}-${record.week}-low-${categoryId}`}
                                    className="flex items-start justify-between gap-2 pb-2 border-b last:border-0"
                                  >
                                    <div className="flex items-start gap-2 flex-1">
                                      <span className="font-mono text-sm mt-0.5">
                                        {getRankEmoji(index + 1)}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <Link
                                          href={`/team/${record.teamId}`}
                                          className="font-medium hover:underline block truncate"
                                        >
                                          {record.teamName}
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                          <Badge
                                            variant="outline"
                                            className={getLeagueBadgeColor(record.leagueId)}
                                          >
                                            {getLeagueShortName(record.leagueId)}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            Week {record.week}
                                          </span>
                                          {record.opponent && (
                                            <span className="text-xs text-muted-foreground">
                                              vs {record.opponent}
                                            </span>
                                          )}
                                          {matchupId && (
                                            <Link
                                              href={`/matchups/${record.leagueId}/${record.week}/${matchupId}`}
                                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                            >
                                              <svg
                                                className="h-3 w-3"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                              </svg>
                                              View Matchup
                                            </Link>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-sm">
                                        {formatRecord(record)}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Matchup Records */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Matchup Records</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  'biggest_blowout',
                  'closest_game',
                  'highest_combined',
                  'lowest_combined',
                  'most_one_sided',
                  'most_exciting_game',
                  'highest_combined_qb',
                  'lowest_combined_qb',
                  'highest_combined_rb',
                  'lowest_combined_rb',
                  'highest_combined_wr',
                  'lowest_combined_wr',
                  'highest_combined_te',
                  'lowest_combined_te',
                  'highest_combined_def',
                  'lowest_combined_def',
                ].map(categoryId => {
                  const records = weeklyRecords.get(categoryId);
                  const category = getCategoryInfo(categoryId);
                  if (!records || !category || records.length === 0) return null;
                  return (
                    <Card key={categoryId} className="h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {records.slice(0, 5).map((record, index) => {
                            const isMatchupRecord = record.contextData?.isMatchupRecord;
                            const matchupId = record.contextData?.matchupId;
                            const bothTeams = record.contextData?.bothTeams;

                            return (
                              <div
                                key={`${categoryId}-${record.leagueId}-${record.teamId || 'na'}-${record.week}-${record.value}-${index}`}
                                className="flex items-start justify-between gap-2 pb-2 border-b last:border-0"
                              >
                                <div className="flex items-start gap-2 flex-1">
                                  <span className="font-mono text-sm mt-0.5">
                                    {getRankEmoji(index + 1)}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    {isMatchupRecord && bothTeams ? (
                                      // Display for matchup records - show both teams
                                      <div>
                                        <div className="font-medium text-sm">
                                          <Link
                                            href={`/team/${bothTeams.teamA.id}`}
                                            className="hover:underline"
                                          >
                                            {bothTeams.teamA.name}
                                          </Link>
                                          <span className="text-muted-foreground mx-2">vs</span>
                                          <Link
                                            href={`/team/${bothTeams.teamB.id}`}
                                            className="hover:underline"
                                          >
                                            {bothTeams.teamB.name}
                                          </Link>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                          <Badge
                                            variant="outline"
                                            className={getLeagueBadgeColor(record.leagueId)}
                                          >
                                            {getLeagueShortName(record.leagueId)}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            Week {record.week}
                                          </span>
                                          {matchupId && (
                                            <Link
                                              href={`/matchups/${record.leagueId}/${record.week}/${matchupId}`}
                                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                            >
                                              <svg
                                                className="h-3 w-3"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                              </svg>
                                              View Matchup
                                            </Link>
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                          ({bothTeams.teamA.points?.toFixed(1)} -{' '}
                                          {bothTeams.teamB.points?.toFixed(1)})
                                        </div>
                                      </div>
                                    ) : (
                                      // Display for individual team records
                                      <div>
                                        <Link
                                          href={`/team/${record.teamId}`}
                                          className="font-medium hover:underline block truncate"
                                        >
                                          {record.teamName}
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                          <Badge
                                            variant="outline"
                                            className={getLeagueBadgeColor(record.leagueId)}
                                          >
                                            {getLeagueShortName(record.leagueId)}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            Week {record.week}
                                          </span>
                                          {record.opponent && (
                                            <span className="text-xs text-muted-foreground">
                                              vs {record.opponent}
                                            </span>
                                          )}
                                          {matchupId && (
                                            <Link
                                              href={`/matchups/${record.leagueId}/${record.week}/${matchupId}`}
                                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                            >
                                              <svg
                                                className="h-3 w-3"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                              </svg>
                                              View Matchup
                                            </Link>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-sm">{formatRecord(record)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Positional Difference Records */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Greatest Positional Differences</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The largest scoring gaps between teams at each position within a single matchup
              </p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(['QB', 'RB', 'WR', 'TE', 'K', 'DEF'] as const).map(position => {
                  const records = positionalDifferences[position];
                  if (!records || records.length === 0) return null;

                  return (
                    <Card key={position} className="h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">{position} Dominance</CardTitle>
                        <CardDescription>
                          Biggest single-matchup advantage at {position}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {records.map((record, index) => (
                            <div
                              key={`${record.leagueId}-${record.week}-${record.matchupId}-${index}`}
                              className="flex items-start justify-between gap-2 pb-2 border-b last:border-0"
                            >
                              <div className="flex items-start gap-2 flex-1">
                                <span className="font-mono text-sm mt-0.5">
                                  {getRankEmoji(index + 1)}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm">
                                    <Link
                                      href={`/team/${record.teamId}`}
                                      className="hover:underline text-green-600 dark:text-green-400"
                                    >
                                      {record.teamName}
                                    </Link>
                                    <span className="text-muted-foreground mx-1">vs</span>
                                    <Link
                                      href={`/team/${record.opponentId}`}
                                      className="hover:underline text-red-600 dark:text-red-400"
                                    >
                                      {record.opponentName}
                                    </Link>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <Badge
                                      variant="outline"
                                      className={getLeagueBadgeColor(record.leagueId)}
                                    >
                                      {getLeagueShortName(record.leagueId)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      Week {record.week}
                                    </span>
                                    {record.matchupId && (
                                      <Link
                                        href={`/matchups/${record.leagueId}/${record.week}/${record.matchupId}`}
                                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                      >
                                        <svg
                                          className="h-3 w-3"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                          />
                                        </svg>
                                        View Matchup
                                      </Link>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {record.teamScore.toFixed(1)} -{' '}
                                    {record.opponentScore.toFixed(1)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-sm text-green-600 dark:text-green-400">
                                  +{record.difference.toFixed(1)}
                                </div>
                                <div className="text-xs text-muted-foreground">diff</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Rolling Windows Tab */}
        <TabsContent value="rolling" className="mt-6">
          <div className="space-y-6">
            {rollingWindows.threeWeek.highest.length > 0 ||
            rollingWindows.threeWeek.lowest.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">3-Week Windows</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <RollingWindowCard
                    title="Highest 3-Week Totals"
                    windows={rollingWindows.threeWeek.highest}
                  />
                  <RollingWindowCard
                    title="Lowest 3-Week Totals"
                    windows={rollingWindows.threeWeek.lowest}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Not enough weeks of data for 3-week rolling windows</p>
                <p className="text-sm mt-2">Need at least 3 weeks of matchups</p>
              </div>
            )}

            {rollingWindows.fiveWeek.highest.length > 0 ||
            rollingWindows.fiveWeek.lowest.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">5-Week Windows</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <RollingWindowCard
                    title="Highest 5-Week Totals"
                    windows={rollingWindows.fiveWeek.highest}
                  />
                  <RollingWindowCard
                    title="Lowest 5-Week Totals"
                    windows={rollingWindows.fiveWeek.lowest}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Not enough weeks of data for 5-week rolling windows</p>
                <p className="text-sm mt-2">Need at least 5 weeks of matchups</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Seasonal Tab */}
        <TabsContent value="seasonal" className="mt-6">
          <div className="space-y-8">
            {/* Season Records */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Season Records</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <SeasonalCard
                  title="Most Wins"
                  records={seasonal.mostWins}
                  statKey="wins"
                  formatFn={v => `${v} wins`}
                />
                <SeasonalCard
                  title="Most Points"
                  records={seasonal.mostPoints}
                  statKey="totalPoints"
                  formatFn={v => `${v.toFixed(2)} pts`}
                />
                <SeasonalCard
                  title="Luckiest Teams"
                  records={seasonal.luckiest}
                  statKey="luckDelta"
                  formatFn={v => `+${v.toFixed(2)} luck`}
                />
                <SeasonalCard
                  title="Unluckiest Teams"
                  records={seasonal.unluckiest}
                  statKey="luckDelta"
                  formatFn={v => `${v.toFixed(2)} luck`}
                />
                <SeasonalCard
                  title="Most Donuts"
                  records={seasonal.mostDonuts}
                  statKey="totalDonuts"
                  formatFn={v => `${v} donuts`}
                />
                <SeasonalCard
                  title="Most Blowout Wins"
                  records={seasonal.mostBlowouts}
                  statKey="blowoutWins"
                  formatFn={v => `${v} blowouts`}
                />
              </div>
            </div>

            {/* Streaks */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Winning & Losing Streaks</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <StreakCard title="Longest Win Streaks" streaks={streaks.winStreaks} type="win" />
                <StreakCard
                  title="Longest Losing Streaks"
                  streaks={streaks.lossStreaks}
                  type="loss"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="mt-12 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">All-Time High Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const highestScoreRecords = weeklyRecords.get('highest_team_points');
                if (!highestScoreRecords || highestScoreRecords.length === 0) return 'N/A';
                return formatRecord(highestScoreRecords[0]);
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const highestScoreRecords = weeklyRecords.get('highest_team_points');
                if (!highestScoreRecords || highestScoreRecords.length === 0) return '';
                const record = highestScoreRecords[0];
                return `${record.teamName} • Week ${record.week}`;
              })()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Longest Win Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streaks.winStreaks[0]?.length || 0} games</div>
            <p className="text-xs text-muted-foreground">
              {streaks.winStreaks[0]?.teamName || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best 3-Week Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rollingWindows.threeWeek.highest[0]?.totalPoints.toFixed(2) || 'N/A'} pts
            </div>
            <p className="text-xs text-muted-foreground">
              {rollingWindows.threeWeek.highest[0]?.teamName || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Season Points Record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {seasonal.mostPoints[0]?.totalPoints.toFixed(2) || 'N/A'} pts
            </div>
            <p className="text-xs text-muted-foreground">
              {seasonal.mostPoints[0]?.teamName || 'N/A'} • {seasonal.mostPoints[0]?.season || ''}
            </p>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
