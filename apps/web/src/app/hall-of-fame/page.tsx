'use client';

import { useState } from 'react';
import { useHallOfFame } from '@/hooks/useHallOfFame';
import { formatRecord, getCategoryInfo, getRankEmoji } from '@/features/hall-of-fame/utils';
import { Container, PageHeader } from '@gauntlet/ui';
import ContentLoader from 'react-content-loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Swords, Target, TrendingDown, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const HallOfFameLoader = () => (
  <ContentLoader
    speed={2}
    width={1200}
    height={800}
    viewBox="0 0 1200 800"
    backgroundColor="hsl(var(--muted))"
    foregroundColor="hsl(var(--muted-foreground))"
  >
    {/* Title */}
    <rect x="16" y="32" rx="3" ry="3" width="400" height="36" />
    <rect x="16" y="72" rx="3" ry="3" width="200" height="20" />

    {/* Tabs */}
    <rect x="16" y="120" rx="8" ry="8" width="600" height="40" />

    {/* Cards */}
    <rect x="16" y="180" rx="8" ry="8" width="380" height="250" />
    <rect x="410" y="180" rx="8" ry="8" width="380" height="250" />
    <rect x="804" y="180" rx="8" ry="8" width="380" height="250" />
    <rect x="16" y="450" rx="8" ry="8" width="380" height="250" />
    <rect x="410" y="450" rx="8" ry="8" width="380" height="250" />
    <rect x="804" y="450" rx="8" ry="8" width="380" height="250" />
  </ContentLoader>
);

const getGroupIcon = (groupKey: string) => {
  switch (groupKey) {
    case 'Score & Margin':
      return <Trophy className="h-5 w-5" />;
    case 'Lineup Quality':
      return <Target className="h-5 w-5" />;
    case 'Positional Splits':
      return <Zap className="h-5 w-5" />;
    case 'Volatility/Consistency':
      return <Sparkles className="h-5 w-5" />;
    case 'Matchup Records':
      return <Swords className="h-5 w-5" />;
    default:
      return <Trophy className="h-5 w-5" />;
  }
};

const getLeagueBadgeColor = (leagueId: string): string => {
  // AFC vs NFC coloring
  return leagueId === '1263744209295245312'
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
};

const getLeagueShortName = (leagueId: string): string => {
  return leagueId === '1263744209295245312' ? 'AFC' : 'NFC';
};

const CategoryCard = ({ categoryId, records }: { categoryId: string; records: any[] }) => {
  const category = getCategoryInfo(categoryId);
  if (!category || !records || records.length === 0) return null;

  const isShame = category.type === 'lowest';

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{category.name}</span>
          {isShame && <TrendingDown className="h-4 w-4 text-muted-foreground" />}
        </CardTitle>
        <CardDescription>{category.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {records.map((record, index) => {
            const isMatchupRecord = record.contextData?.isMatchupRecord;
            const matchupId = record.contextData?.matchupId;
            const bothTeams = record.contextData?.bothTeams;

            return (
              <div
                key={`${categoryId}-${record.leagueId}-${record.teamId || 'na'}-${record.week}-${record.value}-${index}`}
                className="flex items-start justify-between gap-2 pb-2 border-b last:border-0"
              >
                <div className="flex items-start gap-2 flex-1">
                  <span className="font-mono text-sm mt-0.5">{getRankEmoji(index + 1)}</span>
                  <div className="flex-1 min-w-0">
                    {isMatchupRecord && bothTeams ? (
                      // Display for matchup records - show both teams
                      <div>
                        <div className="font-medium text-sm">
                          <Link href={`/team/${bothTeams.teamA.id}`} className="hover:underline">
                            {bothTeams.teamA.name}
                          </Link>
                          <span className="text-muted-foreground mx-2">vs</span>
                          <Link href={`/team/${bothTeams.teamB.id}`} className="hover:underline">
                            {bothTeams.teamB.name}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className={getLeagueBadgeColor(record.leagueId)}>
                            {getLeagueShortName(record.leagueId)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Week {record.week}</span>
                          {matchupId && (
                            <Link
                              href={`/matchups/${record.leagueId}/${record.week}/${matchupId}`}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
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
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getLeagueBadgeColor(record.leagueId)}>
                            {getLeagueShortName(record.leagueId)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Week {record.week}</span>
                          {record.opponent && (
                            <span className="text-xs text-muted-foreground">
                              vs {record.opponent}
                            </span>
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
};

export default function HallOfFamePage() {
  const { data, isLoading, error } = useHallOfFame();
  const [activeGroup, setActiveGroup] = useState<string>('all');

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

  const { recordsByCategory, categoriesByGroup, totalMatchups, lastUpdated } = data;

  // Get all categories or filtered by group
  const getCategoriesToDisplay = () => {
    if (activeGroup === 'all') {
      return Array.from(recordsByCategory.keys());
    }
    const categories = categoriesByGroup.get(activeGroup) || [];
    return categories.map((c: any) => c.id);
  };

  const categoriesToDisplay = getCategoriesToDisplay();

  return (
    <Container className="py-8">
      <div className="mb-8">
        <PageHeader
          title="Hall of Fame & Shame"
          subtitle="Legendary performances and epic fails across all Gauntlet leagues"
        />
        <div className="mt-4 text-sm text-muted-foreground">
          Analyzing {totalMatchups} matchups • Last updated {new Date(lastUpdated).toLocaleString()}
        </div>
      </div>

      <Tabs value={activeGroup} onValueChange={setActiveGroup} className="w-full">
        <TabsList className="h-auto p-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">All</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          {(Array.from(categoriesByGroup.keys()) as string[]).map(groupName => (
            <TabsTrigger key={groupName} value={groupName} className="flex items-center gap-1">
              {getGroupIcon(groupName)}
              <span className="hidden lg:inline">{groupName}</span>
              <span className="lg:hidden text-xs">{groupName.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeGroup} className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoriesToDisplay.map((categoryId: string) => {
              const records = recordsByCategory.get(categoryId);
              if (!records || records.length === 0) return null;

              return <CategoryCard key={categoryId} categoryId={categoryId} records={records} />;
            })}
          </div>

          {categoriesToDisplay.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No records available for this category yet.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Fun Stats Section */}
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Appearances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const teamCounts = new Map<string, number>();
                recordsByCategory.forEach((records: any[]) => {
                  records.forEach((r: any) => {
                    teamCounts.set(r.teamName, (teamCounts.get(r.teamName) || 0) + 1);
                  });
                });
                const sorted = Array.from(teamCounts.entries()).sort((a, b) => b[1] - a[1]);
                if (sorted.length === 0) return 'N/A';
                return `${sorted[0][0]} (${sorted[0][1]})`;
              })()}
            </div>
            <p className="text-xs text-muted-foreground">Team with most records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Highest Score Ever</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const highestScoreRecords = recordsByCategory.get('highest_team_points');
                if (!highestScoreRecords || highestScoreRecords.length === 0) return 'N/A';
                return formatRecord(highestScoreRecords[0]);
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const highestScoreRecords = recordsByCategory.get('highest_team_points');
                if (!highestScoreRecords || highestScoreRecords.length === 0) return '';
                const record = highestScoreRecords[0];
                return `${record.teamName} • Week ${record.week}`;
              })()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Dominant Win</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const biggestMarginRecords = recordsByCategory.get('largest_margin_victory');
                if (!biggestMarginRecords || biggestMarginRecords.length === 0) return 'N/A';
                return formatRecord(biggestMarginRecords[0]);
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const biggestMarginRecords = recordsByCategory.get('largest_margin_victory');
                if (!biggestMarginRecords || biggestMarginRecords.length === 0) return '';
                const record = biggestMarginRecords[0];
                return `${record.teamName} vs ${record.opponent}`;
              })()}
            </p>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
