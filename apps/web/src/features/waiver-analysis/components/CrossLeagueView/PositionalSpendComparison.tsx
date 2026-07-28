/**
 * Positional Spend Comparison
 *
 * Shows AFC vs NFC spending by position with visual comparison bars
 */

'use client';

import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PositionalSpendComparison } from '../../types';

interface PositionalSpendComparisonProps {
  readonly comparisons: PositionalSpendComparison[];
}

export const PositionalSpendComparisonView = memo<PositionalSpendComparisonProps>(props => {
  const { comparisons } = props;

  // Find max total for scaling bars
  const maxTotal = Math.max(...comparisons.map(c => Math.max(c.afcSpend.total, c.nfcSpend.total)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Positional Spending Comparison</CardTitle>
        <CardDescription>How AFC vs NFC allocate FAAB across positions</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {comparisons.map(pos => {
            const afcPercent = (pos.afcSpend.total / maxTotal) * 100;
            const nfcPercent = (pos.nfcSpend.total / maxTotal) * 100;
            const afcMoreActive = pos.afcSpend.count > pos.nfcSpend.count;

            return (
              <div key={pos.position} className="space-y-2">
                {/* Position Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">{pos.position}</span>
                    <span className="text-sm text-muted-foreground">
                      {pos.afcSpend.count + pos.nfcSpend.count} total acquisitions
                    </span>
                  </div>
                  <div className="text-sm font-medium">
                    <span
                      className={
                        pos.whichLeagueSpendsMore === 'AFC'
                          ? 'text-primary'
                          : pos.whichLeagueSpendsMore === 'NFC'
                            ? 'text-secondary'
                            : 'text-muted-foreground'
                      }
                    >
                      {pos.whichLeagueSpendsMore === 'EQUAL'
                        ? 'Equal spending'
                        : `${pos.whichLeagueSpendsMore} spends more`}
                    </span>
                  </div>
                </div>

                {/* AFC Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary font-medium">AFC</span>
                    <span className="text-muted-foreground">
                      ${pos.afcSpend.total} • {pos.afcSpend.count} pickups • avg $
                      {pos.afcSpend.avg.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{ width: `${afcPercent}%` }}
                    >
                      {afcPercent > 15 && (
                        <span className="text-xs font-medium text-white">
                          ${pos.afcSpend.total}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* NFC Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary font-medium">NFC</span>
                    <span className="text-muted-foreground">
                      ${pos.nfcSpend.total} • {pos.nfcSpend.count} pickups • avg $
                      {pos.nfcSpend.avg.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{ width: `${nfcPercent}%` }}
                    >
                      {nfcPercent > 15 && (
                        <span className="text-xs font-medium text-white">
                          ${pos.nfcSpend.total}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Players */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <div>
                    AFC top: {pos.afcSpend.topPlayer} (${pos.afcSpend.topBid})
                  </div>
                  <div>
                    NFC top: {pos.nfcSpend.topPlayer} (${pos.nfcSpend.topBid})
                  </div>
                </div>

                {/* Divider */}
                {pos !== comparisons[comparisons.length - 1] && <div className="border-b pt-2" />}
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              ${comparisons.reduce((sum, p) => sum + p.afcSpend.total, 0)}
            </div>
            <div className="text-sm text-muted-foreground">AFC Total Spent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">
              ${comparisons.reduce((sum, p) => sum + p.nfcSpend.total, 0)}
            </div>
            <div className="text-sm text-muted-foreground">NFC Total Spent</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PositionalSpendComparisonView.displayName = 'PositionalSpendComparisonView';
