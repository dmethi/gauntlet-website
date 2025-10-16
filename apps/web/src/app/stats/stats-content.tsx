'use client';

import { useMemo, useState } from 'react';
import type { PlainStatsDataset } from '@/shared/utils/stats';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StartSitEfficiencyTab from '@/components/stats/StartSitEfficiencyTab';
import { TransactionAnalysis } from '@/features/transactions/components/TransactionAnalysis';
import { LeagueView } from '@/features/stats/components/LeagueView';
import { ScheduleAnalysis } from './components/ScheduleAnalysis';
import { ScatterAnalysis } from './components/ScatterAnalysis';
import { TrendsView } from './components/TrendsView';
import { TeamView } from '@/features/stats/components/TeamView';

interface StatsContentProps {
  dataset: PlainStatsDataset & { startSitEfficiency?: any };
  searchParams: {
    team?: string;
    view?: 'team' | 'league' | 'schedule' | 'trends' | 'scatter' | 'transactions' | 'start-sit';
    week?: string;
  };
  leagues: Array<{ id: string; name: string; season: number }>;
}

export const StatsContent = ({ dataset, searchParams }: StatsContentProps) => {
  const teamsMap = useMemo(() => new Map(dataset.teams), [dataset.teams]);
  const allTeamEntries = useMemo(() => Array.from(teamsMap.entries()), [teamsMap]);

  // Build team options for selector
  const teamOptions = useMemo(
    () =>
      allTeamEntries.map(([key, t]) => ({
        key,
        label: `${t.teamInfo.teamName} (${t.teamInfo.leagueName})`,
        team: t,
      })),
    [allTeamEntries],
  );

  const [selectedTeamKey] = useState<string>(searchParams.team || teamOptions[0]?.key || '');

  const [currentView, setCurrentView] = useState<
    'team' | 'league' | 'schedule' | 'trends' | 'scatter' | 'transactions' | 'start-sit'
  >(
    (searchParams.view as
      | 'team'
      | 'league'
      | 'schedule'
      | 'trends'
      | 'scatter'
      | 'transactions'
      | 'start-sit') || 'team',
  );

  const [selectedWeek, setSelectedWeek] = useState<string>(searchParams.week || 'season');

  // Available weeks for dropdown
  const availableWeeks = Array.from({ length: dataset.currentWeek }, (_, i) => i + 1).filter(
    week => {
      // Only include weeks that have some non-zero scores
      return allTeamEntries.some(([, t]) => t.teamScores.find(d => d.week === week && d.value > 0));
    },
  );

  const selectedTeam = teamOptions.find(opt => opt.key === selectedTeamKey);
  const positionsMap = useMemo(() => new Map(dataset.positions), [dataset.positions]);

  if (!selectedTeam) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              No teams available or selected team not found.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const t = selectedTeam.team;

  const validWeeks = t.teamScores.filter(d => d.value > 0).map(d => d.week);
  const fromWeek = Math.min(...validWeeks, dataset.weekRange.from);
  const toWeek = Math.max(...validWeeks, Math.min(dataset.weekRange.to, dataset.currentWeek - 1)); // Exclude current week if it's incomplete

  return (
    <div className="space-y-6">
      <Tabs
        value={currentView}
        onValueChange={v =>
          setCurrentView(
            v as
              | 'team'
              | 'league'
              | 'schedule'
              | 'trends'
              | 'scatter'
              | 'transactions'
              | 'start-sit',
          )
        }
      >
        <TabsList>
          <TabsTrigger value="team">Team Analysis</TabsTrigger>
          <TabsTrigger value="league">League View</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Analysis</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="scatter">Scatter Analysis</TabsTrigger>
          <TabsTrigger value="transactions">Transaction Analysis</TabsTrigger>
          <TabsTrigger value="start-sit">Start/Sit Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="team">
          <TeamView
            allTeamEntries={allTeamEntries}
            positionsMap={positionsMap}
            dataset={dataset}
            fromWeek={fromWeek}
            toWeek={toWeek}
            availableWeeks={availableWeeks}
          />
        </TabsContent>

        <TabsContent value="league">
          <LeagueView
            selectedWeek={selectedWeek}
            allTeamEntries={allTeamEntries}
            positionsMap={positionsMap}
            setSelectedWeek={setSelectedWeek}
            availableWeeks={availableWeeks}
            dataset={dataset}
            fromWeek={fromWeek}
            toWeek={toWeek}
          />
        </TabsContent>

        <TabsContent value="schedule">
          <ScheduleAnalysis allTeamEntries={allTeamEntries} dataset={dataset} />
        </TabsContent>

        <TabsContent value="trends">
          <TrendsView
            allTeamEntries={allTeamEntries}
            positionsMap={positionsMap}
            dataset={dataset}
          />
        </TabsContent>

        <TabsContent value="scatter">
          <ScatterAnalysis allTeamEntries={allTeamEntries} positionsMap={positionsMap} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionAnalysis currentWeek={dataset.currentWeek} />
        </TabsContent>

        <TabsContent value="start-sit">
          <StartSitEfficiencyTab prefetchedData={dataset.startSitEfficiency} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
