'use client';

import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { colors } from '../../../../../../../brand/colors';
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

  const positionSummaries = getPositionSummaries(dataset, {
    from: fromWeek,
    to: toWeek,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Positional Advantages Overview</CardTitle>
        <CardDescription>
          League-wide analysis of positional strengths and weaknesses based on weekly averages vs.
          median
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Top Advantages and Disadvantages */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Advantages */}
            <div className="rounded-md border">
              <div className="px-4 py-2" style={{ backgroundColor: colors.rdylgn[2] }}>
                <h4 className="font-semibold text-white">Biggest Positional Advantages</h4>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20">
                    <tr>
                      <th className="px-3 py-2 text-left">Team</th>
                      <th className="px-3 py-2 text-center">Position</th>
                      <th className="px-3 py-2 text-right">Advantage</th>
                      <th className="px-3 py-2 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAdvantages.map(adv => (
                      <tr key={`${adv.teamKey}-${adv.position}`} className="border-t">
                        <td className="px-3 py-2">
                          <div>
                            <div className="font-medium">{adv.teamName}</div>
                            <div className="text-xs text-muted-foreground">{adv.leagueName}</div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center font-mono font-bold">
                          {adv.position}
                        </td>
                        <td
                          className="px-3 py-2 text-right font-mono font-bold"
                          style={{ color: colors.rdylgn[8] }}
                        >
                          +{adv.advantage.toFixed(1)}
                        </td>
                        <td
                          className="px-3 py-2 text-right font-mono"
                          style={{ color: colors.rdylgn[8] }}
                        >
                          +{adv.percentageAdvantage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Disadvantages */}
            <div className="rounded-md border">
              <div className="px-4 py-2" style={{ backgroundColor: colors.rdylgn[8] }}>
                <h4 className="font-semibold text-white">Biggest Positional Disadvantages</h4>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20">
                    <tr>
                      <th className="px-3 py-2 text-left">Team</th>
                      <th className="px-3 py-2 text-center">Position</th>
                      <th className="px-3 py-2 text-right">Disadvantage</th>
                      <th className="px-3 py-2 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDisadvantages.map(adv => (
                      <tr key={`${adv.teamKey}-${adv.position}`} className="border-t">
                        <td className="px-3 py-2">
                          <div>
                            <div className="font-medium">{adv.teamName}</div>
                            <div className="text-xs text-muted-foreground">{adv.leagueName}</div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center font-mono font-bold">
                          {adv.position}
                        </td>
                        <td
                          className="px-3 py-2 text-right font-mono font-bold"
                          style={{ color: colors.rdylgn[2] }}
                        >
                          {adv.advantage.toFixed(1)}
                        </td>
                        <td
                          className="px-3 py-2 text-right font-mono"
                          style={{ color: colors.rdylgn[2] }}
                        >
                          {adv.percentageAdvantage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Position-by-Position Tables */}
          <div>
            <h4 className="mb-4 text-md font-semibold" style={{ color: colors.core.charcoalSteel }}>
              Position-by-Position Rankings
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              {positionSummaries.map(posSummary => (
                <div key={posSummary.position} className="rounded-md border">
                  <div className="px-3 py-2" style={{ backgroundColor: colors.core.charcoalSteel }}>
                    <h5 className="font-semibold text-white text-center">
                      {posSummary.position} (Median: {posSummary.leagueMedian.toFixed(1)})
                    </h5>
                  </div>
                  <div className="p-3">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/20">
                        <tr>
                          <th className="px-2 py-1 text-left text-xs">Team</th>
                          <th className="px-2 py-1 text-right text-xs">Weekly Avg</th>
                          <th className="px-2 py-1 text-right text-xs">vs Median</th>
                        </tr>
                      </thead>
                      <tbody>
                        {posSummary.teams.map(team => {
                          const advantageColor =
                            team.advantage === 0
                              ? colors.rdylgn[5]
                              : team.advantage > 0
                                ? colors.rdylgn[8]
                                : colors.rdylgn[2];

                          return (
                            <tr key={team.teamKey} className="border-t">
                              <td className="px-2 py-1">
                                <div className="font-medium text-xs">{team.teamName}</div>
                                <div className="text-xs text-muted-foreground">#{team.rank}</div>
                              </td>
                              <td
                                className="px-2 py-1 text-right font-mono text-xs"
                                style={{ color: colors.core.regalGold }}
                              >
                                {team.weeklyAverage.toFixed(1)}
                              </td>
                              <td
                                className="px-2 py-1 text-right font-mono text-xs font-bold"
                                style={{ color: advantageColor }}
                              >
                                {team.advantage > 0 ? '+' : ''}
                                {team.advantage.toFixed(1)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PositionalAdvantagesCard.displayName = 'PositionalAdvantagesCard';
