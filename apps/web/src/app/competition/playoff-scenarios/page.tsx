'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Trophy, Swords, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container, PageHeader } from '@gauntlet/ui';
import {
  SeedingTable,
  CrossLeagueBattle,
  ScenarioBuilder,
} from '@/features/playoffs/components/scenarios';
import {
  usePlayoffSeedingWithScenarios,
  useCrossLeagueBattle,
  useWeek14Scenarios,
} from '@/features/playoffs/hooks';

/**
 * Loading skeleton for seeding section
 */
const SeedingLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  </div>
);

/**
 * Loading skeleton for cross-league section
 */
const CrossLeagueLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
);

/**
 * Error display component
 */
const ErrorDisplay = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <Card className="border-destructive">
    <CardContent className="pt-6">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <p>{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      )}
    </CardContent>
  </Card>
);

/**
 * Main playoff scenarios page component
 */
export default function PlayoffScenariosPage() {
  const [activeLeague, setActiveLeague] = useState<'afc' | 'nfc'>('afc');
  const currentWeek = 13; // Week 13 is complete, Week 14 is upcoming

  // Scenario builder state for each league
  const afcScenarios = useWeek14Scenarios([]);
  const nfcScenarios = useWeek14Scenarios([]);

  // Fetch seeding data with scenarios
  const {
    data: seedingData,
    isLoading: seedingLoading,
    error: seedingError,
    refetch: refetchSeeding,
  } = usePlayoffSeedingWithScenarios(
    currentWeek,
    activeLeague === 'afc'
      ? afcScenarios.getSimulationLockedOutcomes
      : nfcScenarios.getSimulationLockedOutcomes
  );

  // Fetch cross-league battle data
  const {
    data: crossLeagueData,
    isLoading: crossLeagueLoading,
    error: crossLeagueError,
    refetch: refetchCrossLeague,
  } = useCrossLeagueBattle(currentWeek);

  // Get current league data and scenarios
  const currentSeedingData = activeLeague === 'afc' ? seedingData?.afc : seedingData?.nfc;
  const currentScenarios = activeLeague === 'afc' ? afcScenarios : nfcScenarios;

  // Update scenarios when seeding data loads
  const currentMatchups = currentSeedingData?.week14Matchups || [];

  return (
    <Container className="py-8">
      <PageHeader
        title="Playoff Scenarios"
        subtitle="Week 14 seeding probabilities and cross-league championship"
      />

      <Tabs defaultValue="seeding" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="seeding" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Seeding
          </TabsTrigger>
          <TabsTrigger value="cross-league" className="flex items-center gap-2">
            <Swords className="h-4 w-4" />
            Cross-League
          </TabsTrigger>
        </TabsList>

        {/* Seeding Probabilities Tab */}
        <TabsContent value="seeding" className="space-y-6">
          {/* League selector */}
          <div className="flex items-center gap-2">
            <Button
              variant={activeLeague === 'afc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveLeague('afc')}
              className={activeLeague === 'afc' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              AFC
            </Button>
            <Button
              variant={activeLeague === 'nfc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveLeague('nfc')}
              className={activeLeague === 'nfc' ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              NFC
            </Button>
            {currentScenarios.hasLockedOutcomes && (
              <Badge variant="secondary" className="ml-2">
                {currentScenarios.lockedCount} outcomes locked
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scenario Builder */}
            <div className="lg:col-span-1">
              {seedingLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : currentMatchups.length > 0 ? (
                <ScenarioBuilder
                  matchups={currentMatchups}
                  leagueName={activeLeague === 'afc' ? 'AFC' : 'NFC'}
                  lockedOutcomes={currentScenarios.lockedOutcomes as any}
                  onLockOutcome={(matchupId, winner) =>
                    currentScenarios.lockOutcome(matchupId, winner)
                  }
                  onResetAll={currentScenarios.resetAllOutcomes}
                  isLoading={seedingLoading}
                />
              ) : null}
            </div>

            {/* Seeding Table */}
            <div className="lg:col-span-2">
              {seedingLoading ? (
                <SeedingLoadingSkeleton />
              ) : seedingError ? (
                <ErrorDisplay
                  message="Failed to load seeding data"
                  onRetry={() => refetchSeeding()}
                />
              ) : currentSeedingData ? (
                <SeedingTable results={currentSeedingData} />
              ) : null}
            </div>
          </div>
        </TabsContent>

        {/* Cross-League Battle Tab */}
        <TabsContent value="cross-league" className="space-y-6">
          {crossLeagueLoading ? (
            <CrossLeagueLoadingSkeleton />
          ) : crossLeagueError ? (
            <ErrorDisplay
              message="Failed to load cross-league data"
              onRetry={() => refetchCrossLeague()}
            />
          ) : crossLeagueData ? (
            <CrossLeagueBattle results={crossLeagueData} />
          ) : null}
        </TabsContent>
      </Tabs>

      {/* Footer note */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>
          Probabilities calculated using Monte Carlo simulations based on historical scoring
          distributions and current projections.
        </p>
        <p className="mt-1">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </Container>
  );
}

