'use client';

import { memo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamViewProps } from '@/features/stats/types';
import { TeamSummaryCard } from './TeamSummaryCard';
import { TeamComparisonTable } from './TeamComparisonTable';
import { WeeklyPerformanceChart } from './WeeklyPerformanceChart';
import { PositionalBreakdown } from './PositionalBreakdown';
import { PositionAdvantageChart } from './PositionAdvantageChart';
import { useTeamViewModel } from './useTeamViewModel';

export const TeamView = memo(
  ({ allTeamEntries, positionsMap, dataset, fromWeek, toWeek, availableWeeks }: TeamViewProps) => {
    const teamCount = allTeamEntries.length;
    const {
      teamOptions,
      selectedTeamKey,
      setSelectedTeamKey,
      teamTotals,
      weeklyPerformance,
      positionalBreakdown,
      contributionsByPosition,
      teamAdvantages,
    } = useTeamViewModel({
      allTeamEntries,
      positionsMap,
      dataset,
      fromWeek,
      toWeek,
      availableWeeks,
    });

    if (!teamTotals) {
      return (
        <Card mobileFlat>
          <CardHeader>
            <CardTitle>Team Analysis</CardTitle>
            <CardDescription>
              Season totals and weekly breakdown for individual teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Select a team to view analysis</div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card mobileFlat>
        <CardHeader>
          <CardTitle>Team Analysis</CardTitle>
          <CardDescription>
            Season totals, positional efficiency, and weekly performance for individual teams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 sm:space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="text-sm font-medium text-muted-foreground">Select Team</label>
            <Select value={selectedTeamKey} onValueChange={setSelectedTeamKey}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teamOptions.map(option => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {availableWeeks.length === 0 ? (
            <div className="rounded-md border border-dashed bg-muted/20 px-6 py-10 text-center">
              <h3 className="font-semibold">Week {fromWeek} scoring has not started</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Team analysis will populate here as live scores arrive.
              </p>
            </div>
          ) : (
            <>
              <TeamSummaryCard
                fromWeek={fromWeek}
                toWeek={toWeek}
                data={teamTotals}
                teamCount={teamCount}
              />
              <TeamComparisonTable
                fromWeek={fromWeek}
                toWeek={toWeek}
                data={teamTotals}
                teamCount={teamCount}
              />
              <WeeklyPerformanceChart rows={weeklyPerformance} teamCount={teamCount} />
              <PositionalBreakdown
                breakdown={positionalBreakdown}
                contributions={contributionsByPosition}
                teamCount={teamCount}
              />
              <PositionAdvantageChart data={teamAdvantages} />
            </>
          )}
        </CardContent>
      </Card>
    );
  },
);

TeamView.displayName = 'TeamView';
