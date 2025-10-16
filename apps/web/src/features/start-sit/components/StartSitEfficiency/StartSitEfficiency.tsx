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
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Start/Sit Efficiency Analysis</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Skill-weighted decision making across {data.leagueStats.totalDecisions} tracked decisions
        </p>
      </div>

      <Tabs defaultValue="overall" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overall">Overall Scores</TabsTrigger>
          <TabsTrigger value="positions">Position Breakdown</TabsTrigger>
          <TabsTrigger value="context">Team Context</TabsTrigger>
          <TabsTrigger value="worst">Worst Decisions</TabsTrigger>
          <TabsTrigger value="risk">Risky Wins</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-4">
          <EfficiencySummaryCard summary={summaryMetrics} />
          <Card>
            <CardHeader>
              <CardTitle>Manager Rankings (Weighted by Position Skill)</CardTitle>
            </CardHeader>
            <CardContent>
              <ManagerLeaderboard managers={data.managerEfficiencies} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions">
          <Card>
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
          <Card>
            <CardContent className="space-y-4 py-6">
              {playersLoading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600" />
                  Loading roster context...
                </div>
              ) : (
                <RosterContextPanel rosterContext={data.rosterContext || []} players={players} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="worst">
          <Card>
            <CardContent className="space-y-4 py-6">
              {playersLoading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600" />
                  Loading decision details...
                </div>
              ) : (
                <WorstDecisionsTable decisions={data.worstDecisions || []} players={players} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardContent className="space-y-4 py-6">
              {playersLoading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600" />
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
