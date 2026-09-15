'use client';

import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DataList,
  DataListDescription,
  DataListHeader,
  DataListItem,
  DataListMetric,
  DataListMetricLabel,
  DataListMetrics,
  DataListMetricValue,
  DataListTitle,
} from '@/components/ui/data-list';
import { deltaTextClass } from '@/lib/stat-colors';
import { getPositionSummaries, getTopPositionalAdvantages } from '@/shared/utils/stats';
import type { PlainStatsDataset } from '@/shared/utils/stats';

interface PositionalAdvantagesCardProps {
  readonly dataset: PlainStatsDataset;
  readonly fromWeek: number;
  readonly toWeek: number;
}

export const PositionalAdvantagesCard = memo<PositionalAdvantagesCardProps>(props => {
  const { dataset, fromWeek, toWeek } = props;
  const { topAdvantages, topDisadvantages } = getTopPositionalAdvantages(
    dataset,
    { from: fromWeek, to: toWeek },
    8,
  );
  const positionSummaries = getPositionSummaries(dataset, { from: fromWeek, to: toWeek });

  return (
    <Card mobileFlat>
      <CardHeader>
        <CardTitle>Positional Advantages Overview</CardTitle>
        <CardDescription>
          League-wide positional strengths and weaknesses based on weekly average versus median.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2 md:gap-6">
          <section className="md:rounded-md md:border">
            <header className="border-b border-success/30 bg-success/10 px-1 py-3 md:px-4">
              <h4 className="font-semibold text-success">Biggest positional advantages</h4>
            </header>
            <DataList className="border-t-0 md:border-b-0">
              {topAdvantages.map(advantage => (
                <DataListItem key={`${advantage.teamKey}-${advantage.position}`}>
                  <DataListHeader>
                    <div className="min-w-0">
                      <DataListTitle>{advantage.teamName}</DataListTitle>
                      <DataListDescription>{advantage.leagueName}</DataListDescription>
                    </div>
                    <span className="font-mono text-sm font-bold text-success">
                      +{advantage.advantage.toFixed(1)}
                    </span>
                  </DataListHeader>
                  <DataListMetrics className="grid-cols-2">
                    <DataListMetric>
                      <DataListMetricLabel>Position</DataListMetricLabel>
                      <DataListMetricValue>{advantage.position}</DataListMetricValue>
                    </DataListMetric>
                    <DataListMetric>
                      <DataListMetricLabel>Vs median</DataListMetricLabel>
                      <DataListMetricValue className="text-success">
                        +{advantage.percentageAdvantage.toFixed(1)}%
                      </DataListMetricValue>
                    </DataListMetric>
                  </DataListMetrics>
                </DataListItem>
              ))}
            </DataList>
          </section>

          <section className="md:rounded-md md:border">
            <header className="border-b border-destructive/30 bg-destructive/10 px-1 py-3 md:px-4">
              <h4 className="font-semibold text-destructive">Biggest positional disadvantages</h4>
            </header>
            <DataList className="border-t-0 md:border-b-0">
              {topDisadvantages.map(disadvantage => (
                <DataListItem key={`${disadvantage.teamKey}-${disadvantage.position}`}>
                  <DataListHeader>
                    <div className="min-w-0">
                      <DataListTitle>{disadvantage.teamName}</DataListTitle>
                      <DataListDescription>{disadvantage.leagueName}</DataListDescription>
                    </div>
                    <span className="font-mono text-sm font-bold text-destructive">
                      {disadvantage.advantage.toFixed(1)}
                    </span>
                  </DataListHeader>
                  <DataListMetrics className="grid-cols-2">
                    <DataListMetric>
                      <DataListMetricLabel>Position</DataListMetricLabel>
                      <DataListMetricValue>{disadvantage.position}</DataListMetricValue>
                    </DataListMetric>
                    <DataListMetric>
                      <DataListMetricLabel>Vs median</DataListMetricLabel>
                      <DataListMetricValue className="text-destructive">
                        {disadvantage.percentageAdvantage.toFixed(1)}%
                      </DataListMetricValue>
                    </DataListMetric>
                  </DataListMetrics>
                </DataListItem>
              ))}
            </DataList>
          </section>
        </div>

        <section>
          <h4 className="mb-4 font-semibold text-primary">Position-by-position rankings</h4>
          <div className="grid gap-8 md:grid-cols-2 md:gap-6">
            {positionSummaries.map(positionSummary => (
              <section key={positionSummary.position} className="md:rounded-md md:border">
                <header className="border-b bg-muted/45 px-1 py-3 md:px-4">
                  <h5 className="font-semibold">
                    {positionSummary.position}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      Median {positionSummary.leagueMedian.toFixed(1)}
                    </span>
                  </h5>
                </header>
                <DataList className="border-t-0 md:border-b-0">
                  {positionSummary.teams.map(team => (
                    <DataListItem key={team.teamKey} className="py-3">
                      <DataListHeader>
                        <div className="min-w-0">
                          <DataListTitle>{team.teamName}</DataListTitle>
                          <DataListDescription>Rank #{team.rank}</DataListDescription>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm font-bold text-secondary">
                            {team.weeklyAverage.toFixed(1)}
                          </div>
                          <div
                            className={`font-mono text-xs font-semibold ${deltaTextClass(team.advantage)}`}
                          >
                            {team.advantage > 0 ? '+' : ''}
                            {team.advantage.toFixed(1)} vs median
                          </div>
                        </div>
                      </DataListHeader>
                    </DataListItem>
                  ))}
                </DataList>
              </section>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
});

PositionalAdvantagesCard.displayName = 'PositionalAdvantagesCard';
