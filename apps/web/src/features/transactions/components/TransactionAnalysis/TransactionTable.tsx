/**
 * Transaction Table
 *
 * Displays list of transactions with scores and grades.
 */

import { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { GradeTxn } from '@/features/transactions/types';
import { getDivergingBg, getTextColorForBg } from '@/shared/utils/colors';
import { calculateScoreRange } from './utils';

/**
 * Props for TransactionTable component
 */
export interface TransactionTableProps {
  readonly transactions: GradeTxn[];
  readonly allTransactions: GradeTxn[];
  readonly onTransactionClick: (txn: GradeTxn) => void;
}

/**
 * Transaction table display
 *
 * Shows all transactions with details in a table format.
 *
 * @example
 * <TransactionTable
 *   transactions={filteredData}
 *   allTransactions={allData}
 *   onTransactionClick={setSelectedTxn}
 * />
 */
export const TransactionTable = memo<TransactionTableProps>(props => {
  const { transactions, allTransactions, onTransactionClick } = props;
  const scoreRange = calculateScoreRange(allTransactions);

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Players</TableHead>
            <TableHead className="text-right">FAAB</TableHead>
            <TableHead className="text-right">Raw VORP</TableHead>
            <TableHead className="text-right">Adjusted VORP</TableHead>
            <TableHead className="text-right">Grade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map(txn => {
            const bg = getDivergingBg(txn.score / scoreRange);
            const fg = getTextColorForBg(bg);

            return (
              <TableRow
                key={txn.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onTransactionClick(txn)}
              >
                <TableCell>{new Date(txn.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="font-medium">{txn.teamName}</div>
                    <div className="text-xs text-muted-foreground">{txn.leagueName}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="capitalize">{txn.type.replace('_', ' ')}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {txn.players.map(p => (
                      <div key={p.playerId} className="text-sm text-muted-foreground">
                        {p.name} ({p.position}) • {p.role === 'add' ? 'Added' : 'Dropped'}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {txn.faabCost && txn.faabCost > 0 ? (
                    <div className="flex flex-col items-end">
                      <div className="font-mono font-medium">${txn.faabCost}</div>
                      <div className="text-xs text-muted-foreground">
                        {((txn.faabCost / 200) * 100).toFixed(0)}%
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-green-600 font-medium">FREE</div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {txn.rawScore !== undefined ? (
                    <div className="flex flex-col items-end">
                      <div
                        className={`font-mono font-medium ${
                          txn.rawScore >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {txn.rawScore >= 0 ? '+' : ''}
                        {txn.rawScore.toFixed(1)}
                      </div>
                      {txn.faabCost === 0 && (
                        <div className="text-xs text-muted-foreground">No Cost</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">N/A</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span
                      className="px-2 py-0.5 rounded font-mono font-medium"
                      style={{ backgroundColor: bg, color: fg }}
                    >
                      {txn.score.toFixed(1)}
                    </span>
                    {txn.faabCost && txn.faabCost > 0 && (
                      <div className="text-xs text-red-400 font-mono">
                        -{txn.costPenalty?.toFixed(1) || '0.0'}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={e => {
                      e.stopPropagation();
                      onTransactionClick(txn);
                    }}
                  >
                    <Badge>{txn.grade}</Badge>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
});

TransactionTable.displayName = 'TransactionTable';
