/**
 * Weekly Trends View
 *
 * Week-by-week activity trends for both leagues
 */

'use client';

import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { LeagueWaiverTrends, WaiverAnalysisData } from '../../types';

interface WeeklyTrendsViewProps {
  readonly data: WaiverAnalysisData;
}

const LeagueTrendsCard = memo<{ trends: LeagueWaiverTrends }>(({ trends }) => {
  const maxSpend = Math.max(...trends.weeklyTrends.map(w => w.totalSpent));

  return (
    <div className="space-y-6">
      {/* Weekly Activity Chart */}
      <Card mobileFlat>
        <CardHeader>
          <CardTitle>{trends.leagueName} - Weekly Activity</CardTitle>
          <CardDescription>Week-by-week waiver spending and competition levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.weeklyTrends.map(week => {
              const spendHeight = maxSpend > 0 ? (week.totalSpent / maxSpend) * 100 : 0;

              return (
                <div key={week.week} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Week {week.week}</span>
                    <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground sm:flex sm:items-center sm:gap-4">
                      <span>
                        {week.waiverCount} waivers • {week.freeAgentCount} FA
                      </span>
                      <span>Avg: ${week.avgBid.toFixed(1)}</span>
                      <span>Competition: {week.competitionLevel.toFixed(1)}x</span>
                    </div>
                  </div>

                  <div className="flex gap-2 items-end h-12">
                    <div
                      className={`flex-1 ${
                        trends.leagueName.includes('AFC') ? 'bg-primary' : 'bg-secondary'
                      } rounded-t-md transition-all duration-300 flex items-end justify-center pb-1`}
                      style={{ height: `${Math.max(spendHeight, 5)}%` }}
                    >
                      {week.totalSpent > 0 && (
                        <span
                          className={`text-xs font-medium ${
                            trends.leagueName.includes('AFC')
                              ? 'text-primary-foreground'
                              : 'text-secondary-foreground'
                          }`}
                        >
                          ${week.totalSpent}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Position Popularity */}
      <Card mobileFlat>
        <CardHeader>
          <CardTitle>Position Popularity</CardTitle>
          <CardDescription>Where FAAB was allocated by position</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.positionTrends.map(pos => (
              <div key={pos.position} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{pos.position}</span>
                  <div className="text-sm text-muted-foreground">
                    ${pos.totalSpent} • {pos.transactionCount} txns • avg ${pos.avgCost.toFixed(1)}
                  </div>
                </div>
                <div className="h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      trends.leagueName.includes('AFC') ? 'bg-primary' : 'bg-secondary'
                    } rounded-full transition-all duration-300 flex items-center justify-center`}
                    style={{ width: `${pos.percentOfTotalSpend}%` }}
                  >
                    {pos.percentOfTotalSpend > 10 && (
                      <span
                        className={`text-xs font-medium ${
                          trends.leagueName.includes('AFC')
                            ? 'text-primary-foreground'
                            : 'text-secondary-foreground'
                        }`}
                      >
                        {pos.percentOfTotalSpend.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competition Stats */}
      <Card mobileFlat>
        <CardHeader>
          <CardTitle>Competition Metrics</CardTitle>
          <CardDescription>Waiver wire competition intensity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-y border-border/70 py-4 text-center sm:rounded-lg sm:border sm:p-4">
              <div className="text-2xl font-bold">{trends.avgBidsPerPlayer.toFixed(1)}x</div>
              <div className="text-sm text-muted-foreground">Avg Bids per Player</div>
            </div>
            <div className="border-y border-border/70 py-4 text-center sm:rounded-lg sm:border sm:p-4">
              <div className="text-2xl font-bold">{trends.totalFailedWaivers}</div>
              <div className="text-sm text-muted-foreground">Failed Waivers</div>
            </div>
            {trends.mostContestedPlayer && (
              <div className="col-span-2 border-y border-border/70 bg-muted/50 py-4 text-center sm:rounded-lg sm:border sm:p-4">
                <div className="font-semibold">{trends.mostContestedPlayer.playerName}</div>
                <div className="text-sm text-muted-foreground">
                  Most Contested ({trends.mostContestedPlayer.bidCount} bids)
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

LeagueTrendsCard.displayName = 'LeagueTrendsCard';

export const WeeklyTrendsView = memo<WeeklyTrendsViewProps>(props => {
  const { data } = props;

  return (
    <Tabs defaultValue="afc" className="w-full">
      <TabsList className="grid h-auto w-full max-w-md grid-cols-2">
        <TabsTrigger className="min-h-11" value="afc">
          AFC League
        </TabsTrigger>
        <TabsTrigger className="min-h-11" value="nfc">
          NFC League
        </TabsTrigger>
      </TabsList>

      <TabsContent value="afc" className="mt-6">
        <LeagueTrendsCard trends={data.afcTrends} />
      </TabsContent>

      <TabsContent value="nfc" className="mt-6">
        <LeagueTrendsCard trends={data.nfcTrends} />
      </TabsContent>
    </Tabs>
  );
});

WeeklyTrendsView.displayName = 'WeeklyTrendsView';
