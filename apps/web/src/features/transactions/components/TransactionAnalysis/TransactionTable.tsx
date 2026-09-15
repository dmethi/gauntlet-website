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
import { ChevronRight } from 'lucide-react';
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
import type { GradeTxn } from '@/features/transactions/types';
import { getDivergingBg, getTextColorForBg } from '@/shared/utils/colors';
import { deltaTextClass, gradeBadgeClass } from '@/lib/stat-colors';
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
    <>
      <DataList className="sm:hidden">
        {transactions.map(txn => {
          const bg = getDivergingBg(txn.score / scoreRange);
          const fg = getTextColorForBg(bg);

          return (
            <DataListItem
              key={txn.id}
              interactive
              role="button"
              tabIndex={0}
              aria-label={`View ${txn.teamName} transaction details`}
              aria-haspopup="dialog"
              className="min-h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              onClick={() => onTransactionClick(txn)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onTransactionClick(txn);
                }
              }}
            >
              <DataListHeader>
                <div className="min-w-0">
                  <DataListTitle>{txn.teamName}</DataListTitle>
                  <DataListDescription>
                    {new Date(txn.createdAt).toLocaleDateString()} ·{' '}
                    <span className="capitalize">{txn.type.replace('_', ' ')}</span> ·{' '}
                    {txn.leagueName}
                  </DataListDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={gradeBadgeClass(txn.grade)}>{txn.grade}</Badge>
                  <ChevronRight aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                </div>
              </DataListHeader>

              <div className="mt-3 space-y-1">
                {txn.players.map(player => (
                  <div key={player.playerId} className="text-sm leading-snug">
                    <span className={player.role === 'add' ? 'text-success' : 'text-destructive'}>
                      {player.role === 'add' ? '+' : '−'}
                    </span>{' '}
                    {player.name}
                    <span className="text-muted-foreground"> · {player.position}</span>
                  </div>
                ))}
              </div>

              <DataListMetrics>
                <DataListMetric>
                  <DataListMetricLabel className="text-xs">FAAB</DataListMetricLabel>
                  <DataListMetricValue>
                    {txn.faabCost && txn.faabCost > 0 ? `$${txn.faabCost}` : 'Free'}
                  </DataListMetricValue>
                </DataListMetric>
                <DataListMetric>
                  <DataListMetricLabel className="text-xs">Raw VORP</DataListMetricLabel>
                  <DataListMetricValue
                    className={
                      txn.rawScore === undefined ? undefined : deltaTextClass(txn.rawScore)
                    }
                  >
                    {txn.rawScore === undefined
                      ? 'N/A'
                      : `${txn.rawScore >= 0 ? '+' : ''}${txn.rawScore.toFixed(1)}`}
                  </DataListMetricValue>
                </DataListMetric>
                <DataListMetric className="text-right">
                  <DataListMetricLabel className="text-xs">Adjusted</DataListMetricLabel>
                  <DataListMetricValue>
                    <span
                      className="inline-flex rounded px-1.5 py-0.5 font-mono"
                      style={{ backgroundColor: bg, color: fg }}
                    >
                      {txn.score.toFixed(1)}
                    </span>
                  </DataListMetricValue>
                </DataListMetric>
              </DataListMetrics>
            </DataListItem>
          );
        })}
      </DataList>

      <Table
        surface="responsive"
        scrollLabel="Transactions table"
        containerClassName="hidden sm:block"
      >
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
                className="cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                aria-label={`View ${txn.teamName} transaction details`}
                onClick={() => onTransactionClick(txn)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onTransactionClick(txn);
                  }
                }}
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
                    <div className="text-xs text-success font-medium">FREE</div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {txn.rawScore !== undefined ? (
                    <div className="flex flex-col items-end">
                      <div className={`font-mono font-medium ${deltaTextClass(txn.rawScore)}`}>
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
                      <div className="text-xs text-destructive font-mono">
                        -{txn.costPenalty?.toFixed(1) || '0.0'}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-11 px-3"
                    aria-label={`View ${txn.teamName} transaction details`}
                    onClick={e => {
                      e.stopPropagation();
                      onTransactionClick(txn);
                    }}
                  >
                    <Badge className={gradeBadgeClass(txn.grade)}>{txn.grade}</Badge>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
});

TransactionTable.displayName = 'TransactionTable';
