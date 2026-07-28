/**
 * Weekly Spend Chart
 *
 * Line/bar chart showing week-by-week AFC vs NFC spending comparison
 */

'use client';

import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeeklySpendComparison } from '../../types';

interface WeeklySpendChartProps {
  readonly comparisons: WeeklySpendComparison[];
}

export const WeeklySpendChart = memo<WeeklySpendChartProps>(props => {
  const { comparisons } = props;

  // Find max spend for scaling
  const maxSpend = Math.max(
    ...comparisons.map(w => Math.max(w.afcData.totalSpent, w.nfcData.totalSpent)),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Week-by-Week Spending Trends</CardTitle>
        <CardDescription>
          FAAB spending comparison across {comparisons.length} weeks
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {comparisons.map(week => {
            const afcHeight = maxSpend > 0 ? (week.afcData.totalSpent / maxSpend) * 100 : 0;
            const nfcHeight = maxSpend > 0 ? (week.nfcData.totalSpent / maxSpend) * 100 : 0;

            return (
              <div key={week.week} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Week {week.week}</span>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      AFC: {week.afcData.waiverCount} waivers, avg ${week.afcData.avgBid.toFixed(1)}
                    </span>
                    <span>
                      NFC: {week.nfcData.waiverCount} waivers, avg ${week.nfcData.avgBid.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 h-16">
                  {/* AFC Bar */}
                  <div className="flex-1 flex flex-col justify-end">
                    <div className="flex items-end justify-center">
                      <div
                        className="w-full bg-primary rounded-t-md transition-all duration-300 flex flex-col items-center justify-end pb-1"
                        style={{ height: `${Math.max(afcHeight, 5)}%` }}
                      >
                        {week.afcData.totalSpent > 0 && (
                          <span className="text-xs font-medium text-white">
                            ${week.afcData.totalSpent}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-center text-primary font-medium mt-1">AFC</div>
                  </div>

                  {/* NFC Bar */}
                  <div className="flex-1 flex flex-col justify-end">
                    <div className="flex items-end justify-center">
                      <div
                        className="w-full bg-secondary rounded-t-md transition-all duration-300 flex flex-col items-center justify-end pb-1"
                        style={{ height: `${Math.max(nfcHeight, 5)}%` }}
                      >
                        {week.nfcData.totalSpent > 0 && (
                          <span className="text-xs font-medium text-white">
                            ${week.nfcData.totalSpent}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-center text-secondary font-medium mt-1">NFC</div>
                  </div>
                </div>

                {/* Top bids */}
                {(week.afcData.topPlayer || week.nfcData.topPlayer) && (
                  <div className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>
                      {week.afcData.topPlayer &&
                        `AFC: ${week.afcData.topPlayer} ($${week.afcData.topBid})`}
                    </span>
                    <span>
                      {week.nfcData.topPlayer &&
                        `NFC: ${week.nfcData.topPlayer} ($${week.nfcData.topBid})`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Total AFC Spent</div>
              <div className="text-xl font-bold text-primary">
                ${comparisons.reduce((sum, w) => sum + w.afcData.totalSpent, 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total NFC Spent</div>
              <div className="text-xl font-bold text-secondary">
                ${comparisons.reduce((sum, w) => sum + w.nfcData.totalSpent, 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Difference</div>
              <div className="text-xl font-bold">
                ${Math.abs(comparisons.reduce((sum, w) => sum + w.spendDifference, 0)).toFixed(0)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

WeeklySpendChart.displayName = 'WeeklySpendChart';
