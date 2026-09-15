'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  Calendar,
  ChevronRight,
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
import { resolveStatsWeekRange } from './stats-week-range';

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

export const StatsContent = ({ dataset, searchParams, leagues }: StatsContentProps) => {
  const viewButtonRefs = useRef(new Map<ViewKey, HTMLButtonElement>());
  const season = leagues[0]?.season ? String(leagues[0].season) : undefined;
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

  useEffect(() => {
    const activeButton = viewButtonRefs.current.get(currentView);
    activeButton?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
  }, [currentView]);

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
        <Card mobileFlat>
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
  const { from: fromWeek, to: toWeek } = resolveStatsWeekRange({
    currentWeek: dataset.currentWeek,
    configuredRange: dataset.weekRange,
    scoredWeeks: validWeeks,
  });

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
        return <TransactionAnalysis currentWeek={dataset.currentWeek} season={season ?? '2026'} />;
      case 'waiver-analysis':
        return <WaiverAnalysisHub currentWeek={dataset.currentWeek} season={season ?? '2026'} />;
      case 'start-sit':
        return (
          <StartSitEfficiencyTab prefetchedData={dataset.startSitEfficiency} season={season} />
        );
    }
  };

  return (
    <div className="md:grid md:grid-cols-[200px_minmax(0,1fr)] md:gap-6">
      {/* Mobile keeps every destination in one labeled horizontal rail; the edge fade and arrow
          signal that more views continue off-screen. Desktop expands the same IA into a rail. */}
      <div className="relative md:contents">
        <nav
          aria-label="Stats views"
          tabIndex={0}
          className="flex gap-1 overflow-x-auto -mx-4 mb-4 px-4 pb-3 pr-14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:-mx-6 sm:px-6 md:mx-0 md:mb-0 md:flex-col md:overflow-visible md:border-r md:border-border md:px-0 md:pb-0 md:pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {VIEWS.map(v => (
            <button
              key={v.key}
              ref={button => {
                if (button) viewButtonRefs.current.set(v.key, button);
                else viewButtonRefs.current.delete(v.key);
              }}
              onClick={() => setCurrentView(v.key)}
              aria-current={currentView === v.key ? 'page' : undefined}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-left text-xs font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:gap-2.5 md:rounded-md md:px-2.5 ${
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
        <span
          aria-hidden="true"
          data-scroll-cue
          className="pointer-events-none absolute right-0 top-0 flex min-h-11 w-12 items-center justify-end bg-gradient-to-l from-background via-background/95 to-transparent pr-1 text-muted-foreground md:hidden"
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
      <div className="min-w-0">{renderView()}</div>
    </div>
  );
};
