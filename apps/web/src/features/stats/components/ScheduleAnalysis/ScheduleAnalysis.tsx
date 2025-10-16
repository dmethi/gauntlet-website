'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScheduleAnalysisProps } from '@/features/stats/types';
import {
  buildScheduleMatrix,
  calculateHypotheticalSummary,
  calculateLuckAnalysis,
  calculateScheduleDifficulty,
  calculateTeamLuckDistribution,
  calculateWeeklyDifficulty,
  splitTeamsByConference,
} from './utils';
import { ScheduleMatrixTable } from './ScheduleMatrixTable';
import { ScheduleStrengthTable } from './ScheduleStrengthTable';
import { ScheduleDifficultyTable } from './ScheduleDifficultyTable';
import { ExpectedWinsTable } from './ExpectedWinsTable';
import { WeeklyDifficultyChart } from './WeeklyDifficultyChart';
import { LuckDistributionSection } from './LuckDistributionSection';

export const ScheduleAnalysis = ({ allTeamEntries, dataset }: ScheduleAnalysisProps) => {
  const initialTeamKey = allTeamEntries.length > 0 ? allTeamEntries[0][0] : '';
  const [selectedTeamKey, setSelectedTeamKey] = useState<string>(initialTeamKey);

  const scheduleMatrix = useMemo(
    () => buildScheduleMatrix(allTeamEntries, dataset.currentWeek),
    [allTeamEntries, dataset.currentWeek],
  );

  const summaryStats = useMemo(
    () => calculateHypotheticalSummary(allTeamEntries, scheduleMatrix),
    [allTeamEntries, scheduleMatrix],
  );

  const scheduleDifficulty = useMemo(
    () => calculateScheduleDifficulty(allTeamEntries, scheduleMatrix),
    [allTeamEntries, scheduleMatrix],
  );

  const luckAnalysis = useMemo(
    () => calculateLuckAnalysis(allTeamEntries, scheduleMatrix, summaryStats),
    [allTeamEntries, scheduleMatrix, summaryStats],
  );

  const weeklyDifficultyPoints = useMemo(
    () => calculateWeeklyDifficulty(allTeamEntries, dataset),
    [allTeamEntries, dataset],
  );

  const teamOptions = useMemo(
    () =>
      allTeamEntries.map(([key, team]) => ({
        key,
        label: `${team.teamInfo.teamName} (${team.teamInfo.leagueName})`,
      })),
    [allTeamEntries],
  );

  const { afcTeams, nfcTeams } = useMemo(
    () => splitTeamsByConference(allTeamEntries),
    [allTeamEntries],
  );

  const teamLuckDetail = useMemo(
    () =>
      calculateTeamLuckDistribution(selectedTeamKey, allTeamEntries, scheduleMatrix, summaryStats),
    [selectedTeamKey, allTeamEntries, scheduleMatrix, summaryStats],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Analysis</CardTitle>
        <CardDescription>
          Hypothetical records and schedule strength comparisons across leagues and scenarios.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-10">
        <ScheduleMatrixTable
          title="Hypothetical Records Matrix"
          description="Row team vs Column team's schedule. Values show how many wins/losses would occur if the row team faced the column team's opponents."
          columnLabel="vs Opponent →"
          teams={allTeamEntries}
          matrix={scheduleMatrix}
        />

        <ScheduleStrengthTable data={summaryStats} />

        <ScheduleDifficultyTable data={scheduleDifficulty} />

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">League-by-League Matrices</h3>
          {afcTeams.length ? (
            <ScheduleMatrixTable
              title="AFC League (12×12 Matrix)"
              columnLabel="AFC Team →"
              teams={afcTeams}
              matrix={scheduleMatrix}
            />
          ) : null}
          {nfcTeams.length ? (
            <ScheduleMatrixTable
              title="NFC League (12×12 Matrix)"
              columnLabel="NFC Team →"
              teams={nfcTeams}
              matrix={scheduleMatrix}
            />
          ) : null}
        </div>

        <ExpectedWinsTable data={luckAnalysis} />

        <WeeklyDifficultyChart points={weeklyDifficultyPoints} />

        <LuckDistributionSection
          selectedTeamKey={selectedTeamKey}
          onTeamChange={setSelectedTeamKey}
          teamOptions={teamOptions}
          detail={teamLuckDetail}
        />
      </CardContent>
    </Card>
  );
};
