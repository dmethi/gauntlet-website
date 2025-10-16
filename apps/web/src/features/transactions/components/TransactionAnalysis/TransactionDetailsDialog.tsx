/**
 * Transaction Details Dialog
 *
 * Modal showing detailed transaction breakdown with player performance.
 */

import { memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { GradeTxn } from '@/features/transactions/types';
import { getDivergingBg, getTextColorForBg } from '@/shared/utils/colors';
import { calculateScoreBreakdown, calculateScoreRange } from './utils';

/**
 * Props for TransactionDetailsDialog component
 */
export interface TransactionDetailsDialogProps {
  readonly transaction: GradeTxn | null;
  readonly allTransactions: GradeTxn[];
  readonly currentNflWeek: number;
  readonly onClose: () => void;
}

/**
 * Transaction details modal
 *
 * Displays full breakdown of transaction score and player performance.
 *
 * @example
 * <TransactionDetailsDialog
 *   transaction={selectedTxn}
 *   allTransactions={allData}
 *   currentNflWeek={4}
 *   onClose={() => setSelectedTxn(null)}
 * />
 */
export const TransactionDetailsDialog = memo<TransactionDetailsDialogProps>(props => {
  const { transaction, allTransactions, currentNflWeek, onClose } = props;

  if (!transaction) return null;

  const scoreRange = calculateScoreRange(allTransactions);
  const bg = getDivergingBg(transaction.score / scoreRange);
  const fg = getTextColorForBg(bg);
  const breakdown = calculateScoreBreakdown(transaction);

  return (
    <Dialog open={!!transaction} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <div className="text-sm space-y-4">
          <div className="flex items-center gap-2">
            <Badge>{transaction.grade}</Badge>
            <span className="px-1.5 rounded" style={{ backgroundColor: bg, color: fg }}>
              Score: {transaction.score.toFixed(2)}
            </span>
          </div>

          <div className="text-muted-foreground">
            <div className="flex flex-col gap-1">
              <div>
                {new Date(transaction.createdAt).toLocaleString()} •{' '}
                {transaction.type.replace('_', ' ')}
              </div>
              <div className="text-xs">
                Team: {transaction.teamName} • League: {transaction.leagueName}
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <h3 className="font-semibold text-base">Score Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="text-center">
                <div className="font-medium text-green-600">Contribution</div>
                <div className="text-lg font-bold">+{breakdown.contribution.toFixed(1)}</div>
                <div className="text-muted-foreground">Playoff-weighted VORP when started</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">Self-Harm</div>
                <div className="text-lg font-bold">-{breakdown.selfHarm.toFixed(1)}</div>
                <div className="text-muted-foreground">Points lost vs your best starter</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-orange-600">Opponent-Harm</div>
                <div className="text-lg font-bold">-{breakdown.oppHarm.toFixed(1)}</div>
                <div className="text-muted-foreground">
                  Points above replacement by any opponent
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">Net Score</div>
                <div
                  className={`text-lg font-bold ${transaction.score >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {transaction.score >= 0 ? '+' : ''}
                  {transaction.score.toFixed(1)}
                </div>
                <div className="text-muted-foreground">
                  {breakdown.contribution.toFixed(1)} - {breakdown.totalPenalties.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Players Section */}
          <div className="space-y-4">
            {transaction.players.map(player => (
              <div
                key={player.playerId}
                className={`rounded-lg p-3 border ${
                  player.role === 'add'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{player.name}</h4>
                    <div className="text-sm text-muted-foreground">
                      {player.position} • {player.role === 'add' ? 'Added' : 'Dropped'}
                    </div>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      player.role === 'add' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {player.role === 'add'
                      ? `+${player.forYou?.weightedPoints.toFixed(1) || '0.0'}`
                      : `-${player.afterDrop?.oppHarmWeighted.toFixed(1) || '0.0'}`}
                  </div>
                </div>

                {player.role === 'add' && player.forYou && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Times Started</div>
                      <div className="text-lg">{player.forYou.starts}</div>
                    </div>
                    <div>
                      <div className="font-medium">Total Points</div>
                      <div className="text-lg">{player.forYou.points.toFixed(1)}</div>
                    </div>
                  </div>
                )}

                {player.role === 'drop' && player.afterDrop && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Self-Harm</div>
                      <div className="text-lg">{player.afterDrop.selfHarm.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="font-medium">Opponent-Harm</div>
                      <div className="text-lg">{player.afterDrop.oppHarm.toFixed(1)}</div>
                    </div>
                  </div>
                )}

                {/* Weekly Performance */}
                <div className="mt-3">
                  <h5 className="font-medium mb-2">Weekly Performance</h5>
                  <div className="flex gap-2 overflow-x-auto">
                    {player.weeklyPoints
                      ?.filter(w => w.week <= currentNflWeek)
                      .map(week => {
                        const displayValue = week.vorp !== undefined ? week.vorp : week.points;
                        const showVORP =
                          week.vorp !== undefined && week.replacementLevel !== undefined;

                        return (
                          <div
                            key={week.week}
                            className={`min-w-16 text-center p-2 rounded text-sm ${
                              week.started
                                ? player.role === 'add'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                            title={
                              showVORP
                                ? `Raw: ${week.points.toFixed(1)} pts\nReplacement: ${week.replacementLevel!.toFixed(1)}\nVORP: ${week.vorp!.toFixed(1)}`
                                : `${week.points.toFixed(1)} pts`
                            }
                          >
                            <div className="font-semibold">W{week.week}</div>
                            <div className="font-bold">{displayValue.toFixed(1)}</div>
                            {showVORP && <div className="text-xs opacity-75">VORP</div>}
                            {week.started && <div className="text-xs">✓</div>}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

TransactionDetailsDialog.displayName = 'TransactionDetailsDialog';
