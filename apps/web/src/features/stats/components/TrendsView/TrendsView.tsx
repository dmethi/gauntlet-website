'use client';

import { useMemo } from 'react';
import type { TeamData, TrendsViewProps } from '@/features/stats';
import { rank } from '@/shared/utils/stats';
import { PowerRankingsEvolution } from './PowerRankingsEvolution';
import { WeeklyPerformanceTrends } from './WeeklyPerformanceTrends';
import { PositionPerformanceTrends } from './PositionPerformanceTrends';
import { TeamConsistencyAnalysis } from './TeamConsistencyAnalysis';
import { PositionConsistencyAnalysis } from './PositionConsistencyAnalysis';
import { TeamScoringDistribution } from './TeamScoringDistribution';
import { PositionScoringDistribution } from './PositionScoringDistribution';

interface LeagueDataRow {
  key: string;
  rank: number;
}

const buildLeagueData = (allTeamEntries: [string, TeamData][]): LeagueDataRow[] => {
  const teams = allTeamEntries
    .map(([key, team]) => {
      const teamTotal = team.teamScores
        .filter(score => score.value > 0)
        .reduce((sum, score) => sum + score.value, 0);
      return {
        key,
        teamTotal,
      };
    })
    .filter(team => team.teamTotal > 0);

  if (!teams.length) {
    return [];
  }

  const totals = teams.map(team => team.teamTotal);
  const ranks = rank(totals);

  return teams
    .map((team, index) => ({
      key: team.key,
      rank: ranks[index],
    }))
    .sort((a, b) => a.rank - b.rank);
};

export const TrendsView = ({ allTeamEntries, positionsMap, dataset }: TrendsViewProps) => {
  const leagueData = useMemo(() => buildLeagueData(allTeamEntries), [allTeamEntries]);

  return (
    <div className="space-y-8">
      <PowerRankingsEvolution allTeamEntries={allTeamEntries} dataset={dataset} />
      <WeeklyPerformanceTrends
        allTeamEntries={allTeamEntries}
        dataset={dataset}
        leagueData={leagueData}
      />
      <PositionPerformanceTrends
        allTeamEntries={allTeamEntries}
        positionsMap={positionsMap}
        dataset={dataset}
      />
      <TeamConsistencyAnalysis allTeamEntries={allTeamEntries} />
      <PositionConsistencyAnalysis allTeamEntries={allTeamEntries} positionsMap={positionsMap} />
      <TeamScoringDistribution allTeamEntries={allTeamEntries} />
      <PositionScoringDistribution allTeamEntries={allTeamEntries} positionsMap={positionsMap} />
    </div>
  );
};
