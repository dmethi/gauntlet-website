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
    <div className="grid grid-cols-4 gap-4 text-center">
      <div className="bg-green-50 p-3 rounded-lg">
        <div className="text-2xl font-bold text-green-600">{stats.positive}</div>
        <div className="text-xs text-green-700">Positive</div>
      </div>
      <div className="bg-red-50 p-3 rounded-lg">
        <div className="text-2xl font-bold text-red-600">{stats.negative}</div>
        <div className="text-xs text-red-700">Negative</div>
      </div>
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-2xl font-bold text-gray-600">{stats.neutral}</div>
        <div className="text-xs text-gray-700">Neutral</div>
      </div>
      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
        <div className="text-xs text-blue-700">Total</div>
      </div>
    </div>
  );
});

TransactionSummary.displayName = 'TransactionSummary';
