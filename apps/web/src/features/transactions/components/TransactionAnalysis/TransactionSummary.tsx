/**
 * Transaction Summary Statistics
 *
 * Displays overview stats for transaction analysis (positive, negative, neutral, total).
 */

import { memo } from 'react';
import type { GradeTxn } from '@/features/transactions/types';
import { calculateTransactionStats } from './utils';

/**
 * Props for TransactionSummary component
 */
export interface TransactionSummaryProps {
  readonly transactions: GradeTxn[];
}

/**
 * Transaction summary statistics display
 *
 * Shows counts of positive, negative, neutral, and total transactions.
 *
 * @example
 * <TransactionSummary transactions={filteredData} />
 */
export const TransactionSummary = memo<TransactionSummaryProps>(props => {
  const { transactions } = props;
  const stats = calculateTransactionStats(transactions);

  return (
    <div className="flex divide-x divide-border text-center">
      <div className="pl-0 pr-4">
        <div className="text-2xl font-bold text-success">{stats.positive}</div>
        <div className="text-xs text-muted-foreground">Positive</div>
      </div>
      <div className="px-4">
        <div className="text-2xl font-bold text-destructive">{stats.negative}</div>
        <div className="text-xs text-muted-foreground">Negative</div>
      </div>
      <div className="px-4">
        <div className="text-2xl font-bold text-muted-foreground">{stats.neutral}</div>
        <div className="text-xs text-muted-foreground">Neutral</div>
      </div>
      <div className="px-4">
        <div className="text-2xl font-bold text-foreground">{stats.total}</div>
        <div className="text-xs text-muted-foreground">Total</div>
      </div>
    </div>
  );
});

TransactionSummary.displayName = 'TransactionSummary';
