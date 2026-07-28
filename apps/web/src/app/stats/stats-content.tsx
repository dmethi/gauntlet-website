'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  Calendar,
  ClipboardCheck,
  ScatterChart,
  Shuffle,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import type { PlainStatsDataset } from '@/shared/utils/stats';
import { Card, CardContent } from '@/components/ui/card';
import StartSitEfficiencyTab from '@/components/stats/StartSitEfficiencyTab';
import { TransactionAnalysis } from '@/features/transactions/components/TransactionAnalysis';
import { LeagueView } from '@/features/stats/components/LeagueView';
import { ScheduleAnalysis } from './components/ScheduleAnalysis';
import { ScatterAnalysis } from './components/ScatterAnalysis';
import { TrendsView } from './components/TrendsView';
import { TeamView } from '@/features/stats/components/TeamView';
import { WaiverAnalysisHub } from '@/features/waiver-analysis/components';

type ViewKey =
  | 'team'
  | 'league'
  | 'schedule'
  | 'trends'
  | 'scatter'
  | 'transactions'
  | 'start-sit'
  | 'waiver-analysis';

interface StatsContentProps {
  dataset: PlainStatsDataset & { startSitEfficiency?: any };
  searchParams: {
    team?: string;
    view?: ViewKey;
    week?: string;
  };
  leagues: Array<{ id: string; name: string; season: number }>;
}

const VIEWS: { key: ViewKey; label: string; Icon: typeof Users }[] = [
  { key: 'team', label: 'Team Analysis', Icon: Users },
  { key: 'league', label: 'League View', Icon: Trophy },
  { key: 'schedule', label: 'Schedule', Icon: Calendar },
  { key: 'trends', label: 'Trends', Icon: TrendingUp },
  { key: 'scatter', label: 'Scatter', Icon: ScatterChart },
  { key: 'transactions', label: 'Transactions', Icon: ArrowLeftRight },
  { key: 'waiver-analysis', label: 'Waiver', Icon: Shuffle },
  { key: 'start-sit', label: 'Start/Sit', Icon: ClipboardCheck },
];

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
  const [currentView, setCurrentView] = useState<ViewKey>(searchParams.view || 'team');
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

  const renderView = () => {
    switch (currentView) {
      case 'team':
        return (
          <TeamView
            allTeamEntries={allTeamEntries}
            positionsMap={positionsMap}
            dataset={dataset}
            fromWeek={fromWeek}
            toWeek={toWeek}
            availableWeeks={availableWeeks}
          />
        );
      case 'league':
        return (
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
        );
      case 'schedule':
        return <ScheduleAnalysis allTeamEntries={allTeamEntries} dataset={dataset} />;
      case 'trends':
        return (
          <TrendsView
            allTeamEntries={allTeamEntries}
            positionsMap={positionsMap}
            dataset={dataset}
          />
        );
      case 'scatter':
        return <ScatterAnalysis allTeamEntries={allTeamEntries} positionsMap={positionsMap} />;
      case 'transactions':
        return <TransactionAnalysis currentWeek={dataset.currentWeek} />;
      case 'waiver-analysis':
        return <WaiverAnalysisHub currentWeek={dataset.currentWeek} />;
      case 'start-sit':
        return <StartSitEfficiencyTab prefetchedData={dataset.startSitEfficiency} />;
    }
  };

  return (
    <div className="md:grid md:grid-cols-[200px_1fr] md:gap-6">
      {/* Below md: horizontal scrollable strip, never a squeezed sidebar.
          At md+: persistent vertical rail, icon+label, left-border active state.
          Validated live against real 2025 data in /playground/stats before porting. */}
      <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 pb-3 md:pb-0 mb-4 md:mb-0 md:border-r md:border-border md:pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => setCurrentView(v.key)}
            className={`flex items-center gap-2 md:gap-2.5 shrink-0 px-3 py-1.5 md:px-2.5 md:py-2 rounded-full md:rounded-md text-xs font-semibold uppercase tracking-wide transition-colors text-left ${
              currentView === v.key
                ? 'bg-primary/10 text-primary md:border-l-2 md:border-primary md:-ml-[2px] md:pl-[calc(0.625rem+2px)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <v.Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            {v.label}
          </button>
        ))}
      </nav>
      <div>{renderView()}</div>
    </div>
  );
};
