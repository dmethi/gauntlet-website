/**
 * Transaction Analysis
 *
 * Main container component for transaction analysis with VORP calculations.
 */

'use client';

import { memo, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { WarRoomLoader } from '@gauntlet/ui';
import { GauntletLogo } from '@/components/gauntlet-logo';
import type { GradeTxn } from '@/features/transactions/types';
import { ManagerRankings } from '@/app/stats/components/ManagerRankings';
import { useTransactionAnalysisModel } from './useTransactionAnalysisModel';
import { TransactionSummary } from './TransactionSummary';
import { TransactionFilters } from './TransactionFilters';
import { TransactionTable } from './TransactionTable';
import { TransactionDetailsDialog } from './TransactionDetailsDialog';
import {
  filterTransactions,
  getUniqueValues,
  type SortBy,
  type SortOrder,
  sortTransactions,
} from './utils';

/**
 * Props for TransactionAnalysis component
 */
export interface TransactionAnalysisProps {
  readonly currentWeek: number;
  readonly season: string;
}

/**
 * Transaction Analysis Component
 *
 * Analyzes all transactions from both leagues with VORP calculations and grading.
 *
 * @example
 * <TransactionAnalysis currentWeek={dataset.currentWeek} />
 */
export const TransactionAnalysis = memo<TransactionAnalysisProps>(props => {
  const { currentWeek, season } = props;
  const model = useTransactionAnalysisModel(currentWeek, season);
  const [selectedTxn, setSelectedTxn] = useState<GradeTxn | null>(null);
  const transactionTriggerRef = useRef<HTMLElement | null>(null);

  // Filter and sort states
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortBy>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter and sort data
  const filteredData = useMemo(() => {
    const filtered = filterTransactions(model.allData, {
      teamFilter,
      leagueFilter,
      gradeFilter,
      searchTerm,
    });

    return sortTransactions(filtered, sortBy, sortOrder);
  }, [model.allData, teamFilter, leagueFilter, gradeFilter, searchTerm, sortBy, sortOrder]);

  // Get unique values for filters
  const uniqueTeams = useMemo(() => getUniqueValues(model.allData, 'teamName'), [model.allData]);
  const uniqueLeagues = useMemo(
    () => getUniqueValues(model.allData, 'leagueName'),
    [model.allData],
  );

  // Loading state
  if (
    model.loading ||
    !model.teamsLoaded ||
    !model.transactionsProcessed ||
    model.allData.length === 0
  ) {
    return <WarRoomLoader show logo={<GauntletLogo size="lg" />} />;
  }

  // Clear all filters handler
  const handleClearFilters = (): void => {
    setTeamFilter('all');
    setLeagueFilter('all');
    setGradeFilter('all');
    setSearchTerm('');
  };

  const handleOpenTransaction = (transaction: GradeTxn): void => {
    transactionTriggerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelectedTxn(transaction);
  };

  const handleCloseTransaction = (): void => {
    setSelectedTxn(null);
    window.requestAnimationFrame(() => transactionTriggerRef.current?.focus());
  };

  return (
    <div className="space-y-6">
      <ManagerRankings transactions={model.allData} allTeams={model.teamsMap} />

      <Card mobileFlat>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Transaction Analysis
              </CardTitle>
              <CardDescription>
                All transactions ranked by Cost-Adjusted VORP (Raw VORP - FAAB Penalty)
              </CardDescription>
            </div>

            {/* Stats Overview */}
            <TransactionSummary transactions={filteredData} />
          </div>

          {/* Filters */}
          <TransactionFilters
            teamFilter={teamFilter}
            leagueFilter={leagueFilter}
            gradeFilter={gradeFilter}
            searchTerm={searchTerm}
            sortBy={sortBy}
            sortOrder={sortOrder}
            uniqueTeams={uniqueTeams}
            uniqueLeagues={uniqueLeagues}
            onTeamFilterChange={setTeamFilter}
            onLeagueFilterChange={setLeagueFilter}
            onGradeFilterChange={setGradeFilter}
            onSearchChange={setSearchTerm}
            onSortByChange={setSortBy}
            onSortOrderToggle={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            filteredCount={filteredData.length}
            totalCount={model.allData.length}
          />
        </CardHeader>

        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">No transactions match your filters</div>
              <button
                onClick={handleClearFilters}
                className="mt-2 min-h-11 rounded-md px-3 text-sm font-medium text-primary hover:bg-primary/10 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <TransactionTable
              transactions={filteredData}
              allTransactions={model.allData}
              onTransactionClick={handleOpenTransaction}
            />
          )}
        </CardContent>
      </Card>

      <TransactionDetailsDialog
        transaction={selectedTxn}
        allTransactions={model.allData}
        currentNflWeek={currentWeek}
        onClose={handleCloseTransaction}
      />
    </div>
  );
});

TransactionAnalysis.displayName = 'TransactionAnalysis';
