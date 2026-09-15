'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { StartSitData } from '@/features/start-sit/types';
import { EfficiencySummaryCard } from './EfficiencySummaryCard';
import { ManagerLeaderboard } from './ManagerLeaderboard';
import { PositionBreakdown } from './PositionBreakdown';
import { RosterContextPanel } from './RosterContextPanel';
import { RiskyDecisionsTable } from './RiskyDecisionsTable';
import { useStartSitEfficiencyModel } from './useStartSitEfficiencyModel';
import { WorstDecisionsTable } from './WorstDecisionsTable';

interface StartSitEfficiencyProps {
  data: StartSitData;
}

export const StartSitEfficiency = memo(({ data }: StartSitEfficiencyProps) => {
  const {
    selectedManagerId,
    setSelectedManagerId,
    managerOptions,
    players,
    playersLoading,
    summaryMetrics,
    selectedManager,
  } = useStartSitEfficiencyModel(data);

  return (
    <div className="mx-auto max-w-7xl space-y-5 py-4 sm:py-5 md:p-6">
      <Tabs defaultValue="overall" className="space-y-6">
        <TabsList
          aria-label="Start/sit analysis views"
          className="flex h-auto w-full justify-start gap-1 overflow-x-auto pb-2"
        >
          <TabsTrigger className="min-h-11 shrink-0" value="overall">
            Overall Scores
          </TabsTrigger>
          <TabsTrigger className="min-h-11 shrink-0" value="positions">
            Position Breakdown
          </TabsTrigger>
          <TabsTrigger className="min-h-11 shrink-0" value="context">
            Team Context
          </TabsTrigger>
          <TabsTrigger className="min-h-11 shrink-0" value="worst">
            Worst Decisions
          </TabsTrigger>
          <TabsTrigger className="min-h-11 shrink-0" value="risk">
            Risky Wins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-4">
          <EfficiencySummaryCard summary={summaryMetrics} />
          <Card mobileFlat>
            <CardHeader>
              <CardTitle>Manager Rankings (Weighted by Position Skill)</CardTitle>
            </CardHeader>
            <CardContent>
              <ManagerLeaderboard managers={data.managerEfficiencies} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions">
          <Card mobileFlat>
            <CardContent className="space-y-4 py-6">
              <PositionBreakdown
                managers={data.managerEfficiencies}
                selectedManagerId={selectedManagerId}
                onSelectManager={setSelectedManagerId}
                managerOptions={managerOptions}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="context">
          <Card mobileFlat>
            <CardContent className="space-y-4 py-6">
              {playersLoading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
                  Loading roster context...
                </div>
              ) : (
                <RosterContextPanel rosterContext={data.rosterContext || []} players={players} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="worst">
          <Card mobileFlat>
            <CardContent className="space-y-4 py-6">
              {playersLoading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
                  Loading decision details...
                </div>
              ) : (
                <WorstDecisionsTable decisions={data.worstDecisions || []} players={players} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card mobileFlat>
            <CardContent className="space-y-4 py-6">
              {playersLoading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
                  Loading decision details...
                </div>
              ) : (
                <RiskyDecisionsTable decisions={data.bestRiskyDecisions || []} players={players} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

StartSitEfficiency.displayName = 'StartSitEfficiency';
