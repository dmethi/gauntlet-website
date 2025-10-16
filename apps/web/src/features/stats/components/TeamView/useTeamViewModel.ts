import { useMemo, useState } from 'react';
import type { TeamViewProps } from '@/features/stats/types';
import type { TrackedPosition } from '@/shared/utils/stats';
import type { PlayerContributionGroup, PositionalBreakdownResult } from './utils';
import {
  calculatePlayerContributions,
  calculatePositionalBreakdown,
  calculateTeamAdvantages,
  calculateTeamTotals,
  calculateWeeklyPerformance,
  groupByPosition,
} from './utils';

const trackedPositions: TrackedPosition[] = ['QB', 'RB', 'WR', 'TE', 'DEF'];

interface TeamViewModel {
  teamOptions: Array<{ key: string; label: string }>;
  selectedTeamKey: string;
  setSelectedTeamKey: (key: string) => void;
  teamTotals: ReturnType<typeof calculateTeamTotals>;
  weeklyPerformance: ReturnType<typeof calculateWeeklyPerformance>;
  positionalBreakdown: Map<TrackedPosition, PositionalBreakdownResult>;
  contributionsByPosition: Map<TrackedPosition, PlayerContributionGroup[]>;
  teamAdvantages: ReturnType<typeof calculateTeamAdvantages>;
}

export const useTeamViewModel = ({
  allTeamEntries,
  positionsMap,
  dataset,
  fromWeek,
  toWeek,
  availableWeeks,
}: TeamViewProps): TeamViewModel => {
  const [selectedTeamKey, setSelectedTeamKey] = useState<string>(
    allTeamEntries.length > 0 ? allTeamEntries[0][0] : '',
  );

  const teamOptions = useMemo(
    () =>
      allTeamEntries.map(([key, team]) => ({
        key,
        label: `${team.teamInfo.teamName} (${team.teamInfo.leagueName})`,
      })),
    [allTeamEntries],
  );

  const teamEntry = useMemo(
    () => allTeamEntries.find(([key]) => key === selectedTeamKey),
    [allTeamEntries, selectedTeamKey],
  );

  const teamTotals = useMemo(
    () =>
      calculateTeamTotals({
        teamEntry,
        allTeamEntries,
        selectedTeamKey,
        fromWeek,
        toWeek,
        availableWeeks,
        dataset,
      }),
    [teamEntry, allTeamEntries, selectedTeamKey, fromWeek, toWeek, availableWeeks, dataset],
  );

  const weeklyPerformance = useMemo(() => {
    if (!teamTotals) return [];
    return calculateWeeklyPerformance({
      teamTotals,
      allTeamEntries,
      selectedTeamKey,
      fromWeek,
      toWeek,
    });
  }, [teamTotals, allTeamEntries, selectedTeamKey, fromWeek, toWeek]);

  const positionalBreakdown = useMemo(() => {
    if (!teamTotals) return new Map<TrackedPosition, PositionalBreakdownResult>();
    return calculatePositionalBreakdown({
      positions: trackedPositions,
      positionsMap,
      selectedTeamKey,
      allTeamEntries,
      fromWeek,
      toWeek,
      weeks: teamTotals.weeks,
    });
  }, [teamTotals, positionsMap, allTeamEntries, selectedTeamKey, fromWeek, toWeek]);

  const playerContributions = useMemo(() => {
    if (!teamTotals) {
      return { groups: [] as PlayerContributionGroup[], totals: [] };
    }
    return calculatePlayerContributions(dataset, selectedTeamKey, teamTotals.weeks);
  }, [dataset, selectedTeamKey, teamTotals]);

  const contributionsByPosition = useMemo(() => {
    return groupByPosition<PlayerContributionGroup>(playerContributions.groups);
  }, [playerContributions.groups]);

  const teamAdvantages = useMemo(() => {
    if (!teamTotals) return null;
    return calculateTeamAdvantages({
      dataset,
      teamKey: selectedTeamKey,
      fromWeek,
      toWeek,
    });
  }, [dataset, selectedTeamKey, fromWeek, toWeek, teamTotals]);

  return {
    teamOptions,
    selectedTeamKey,
    setSelectedTeamKey,
    teamTotals,
    weeklyPerformance,
    positionalBreakdown,
    contributionsByPosition,
    teamAdvantages,
  };
};
