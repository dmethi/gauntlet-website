/**
 * Waiver Analysis Hub
 *
 * Main container component for comprehensive waiver/FAAB analysis.
 * Provides tabbed interface for different analysis views.
 */

'use client';

import { memo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftRight, DollarSign, TrendingUp, Users } from 'lucide-react';
import { WarRoomLoader } from '@gauntlet/ui';
import { GauntletLogo } from '@/components/gauntlet-logo';
import { useWaiverAnalytics } from '../hooks';
import { CrossLeagueView } from './CrossLeagueView';
import { ManagerView } from './ManagerView';
import { PlayerMovementView } from './PlayerMovementView';

/**
 * Props for WaiverAnalysisHub component
 */
export interface WaiverAnalysisHubProps {
  readonly currentWeek: number;
}

/**
 * Waiver Analysis Hub Component
 *
 * Main entry point for waiver analysis feature.
 * Shows manager spending, cross-league comparisons, and player movement.
 *
 * @example
 * <WaiverAnalysisHub currentWeek={dataset.currentWeek} />
 */
export const WaiverAnalysisHub = memo<WaiverAnalysisHubProps>(props => {
  const { currentWeek } = props;
  const { data, isLoading, isError, error } = useWaiverAnalytics(currentWeek);
  const [currentView, setCurrentView] = useState<'managers' | 'cross-league' | 'players'>(
    'cross-league',
  );

  // Loading state
  if (isLoading) {
    return <WarRoomLoader show logo={<GauntletLogo size="lg" />} />;
  }

  // Error state
  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <DollarSign className="h-5 w-5" />
            Waiver Analysis - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
            <div className="text-destructive font-semibold mb-2">
              Failed to load waiver analysis
            </div>
            <p className="text-destructive/80 text-sm">
              {error?.message || 'An unknown error occurred while loading waiver data'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main content
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Waiver & FAAB Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive waiver wire analysis including competing bids, cross-league comparisons,
            and player movement tracking
          </CardDescription>

          {/* Quick stats summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">AFC Total Spent</div>
              <div className="text-2xl font-bold">${data.afcTrends.totalFAABSpent}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">NFC Total Spent</div>
              <div className="text-2xl font-bold">${data.nfcTrends.totalFAABSpent}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Total Waivers</div>
              <div className="text-2xl font-bold">
                {data.afcTrends.totalWaivers + data.nfcTrends.totalWaivers}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">
                Players in Both Leagues
              </div>
              <div className="text-2xl font-bold">
                {
                  data.playerComparisons.filter(p => p.afcStats !== null && p.nfcStats !== null)
                    .length
                }
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={currentView} onValueChange={v => setCurrentView(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cross-league" className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Cross-League
              </TabsTrigger>
              <TabsTrigger value="managers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Managers
              </TabsTrigger>
              <TabsTrigger value="players" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Player Movement
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cross-league" className="mt-6">
              <CrossLeagueView data={data} />
            </TabsContent>

            <TabsContent value="managers" className="mt-6">
              <ManagerView data={data} />
            </TabsContent>

            <TabsContent value="players" className="mt-6">
              <PlayerMovementView data={data} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
});

WaiverAnalysisHub.displayName = 'WaiverAnalysisHub';
