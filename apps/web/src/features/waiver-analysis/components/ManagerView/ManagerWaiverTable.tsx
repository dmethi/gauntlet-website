/**
 * Manager Waiver Table
 *
 * Comprehensive table showing manager-level waiver spending with expandable transaction details
 */

'use client';

import React, { memo, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { ManagerWaiverStats, WaiverTransaction } from '../../types';

interface ManagerWaiverTableProps {
  readonly managers: ManagerWaiverStats[];
  readonly allTransactions: WaiverTransaction[];
}

type SortField =
  | 'teamName'
  | 'totalSpent'
  | 'remainingFAAB'
  | 'percentSpent'
  | 'avgFaabPerWaiver'
  | 'totalTransactions'
  | 'netExcessSpend'
  | 'waiverSuccessRate';

export const ManagerWaiverTable = memo<ManagerWaiverTableProps>(props => {
  const { managers, allTransactions } = props;
  const [searchTerm, setSearchTerm] = useState('');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('totalSpent');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Get unique leagues for filter
  const leagues = useMemo(() => {
    const leagueSet = new Set(managers.map(m => m.leagueName));
    return Array.from(leagueSet).sort();
  }, [managers]);

  // Filter and sort
  const filteredManagers = useMemo(() => {
    let filtered = managers;

    // League filter
    if (leagueFilter !== 'all') {
      filtered = filtered.filter(m => m.leagueName === leagueFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        m =>
          m.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.managerName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case 'teamName':
          aVal = a.teamName;
          bVal = b.teamName;
          return sortAsc
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
        case 'totalSpent':
          aVal = a.totalFAABSpent;
          bVal = b.totalFAABSpent;
          break;
        case 'remainingFAAB':
          aVal = a.remainingFAAB;
          bVal = b.remainingFAAB;
          break;
        case 'percentSpent':
          aVal = a.percentSpent;
          bVal = b.percentSpent;
          break;
        case 'avgFaabPerWaiver':
          aVal = a.avgFaabPerWaiver;
          bVal = b.avgFaabPerWaiver;
          break;
        case 'totalTransactions':
          aVal = a.totalTransactions;
          bVal = b.totalTransactions;
          break;
        case 'netExcessSpend':
          aVal = a.netExcessSpend;
          bVal = b.netExcessSpend;
          break;
        case 'waiverSuccessRate':
          aVal = a.waiverSuccessRate;
          bVal = b.waiverSuccessRate;
          break;
        default:
          return 0;
      }

      return sortAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

    return sorted;
  }, [managers, leagueFilter, searchTerm, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="inline h-3 w-3 opacity-30 ml-1" />;
    return sortAsc ? (
      <TrendingUp className="inline h-3 w-3 ml-1" />
    ) : (
      <TrendingDown className="inline h-3 w-3 ml-1" />
    );
  };

  const toggleRow = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  // Get manager's transactions sorted by cost
  const getManagerTransactions = (manager: ManagerWaiverStats): WaiverTransaction[] => {
    return allTransactions
      .filter(
        txn =>
          txn.rosterId === manager.rosterId &&
          txn.leagueId === manager.leagueId &&
          txn.isWinningBid, // Only show successful acquisitions
      )
      .sort((a, b) => b.faabBid - a.faabBid); // Sort by cost descending
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Manager Waiver Performance
        </CardTitle>
        <CardDescription>
          Click any row to see detailed transactions • {filteredManagers.length} managers shown
        </CardDescription>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
          <Select value={leagueFilter} onValueChange={setLeagueFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Leagues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leagues</SelectItem>
              {leagues.map(league => (
                <SelectItem key={league} value={league}>
                  {league}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search manager or team..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('teamName')}
                >
                  Manager {getSortIcon('teamName')}
                </TableHead>
                <TableHead className="text-center">League</TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('totalSpent')}
                >
                  Total Spent {getSortIcon('totalSpent')}
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('remainingFAAB')}
                >
                  Remaining {getSortIcon('remainingFAAB')}
                </TableHead>
                <TableHead
                  className="text-center cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('percentSpent')}
                >
                  % Used {getSortIcon('percentSpent')}
                </TableHead>
                <TableHead
                  className="text-center cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('totalTransactions')}
                >
                  Txns {getSortIcon('totalTransactions')}
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('netExcessSpend')}
                >
                  Net Excess {getSortIcon('netExcessSpend')}
                </TableHead>
                <TableHead
                  className="text-center cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('waiverSuccessRate')}
                >
                  Success Rate {getSortIcon('waiverSuccessRate')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredManagers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No managers match your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredManagers.map(manager => {
                  const rowKey = `${manager.leagueId}-${manager.rosterId}`;
                  const isExpanded = expandedRows.has(rowKey);
                  const transactions = getManagerTransactions(manager);

                  return (
                    <React.Fragment key={rowKey}>
                      <TableRow className="hover:bg-muted/30 cursor-pointer">
                        {/* Expand icon */}
                        <TableCell className="text-center" onClick={() => toggleRow(rowKey)}>
                          <button className="text-muted-foreground hover:text-foreground">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </TableCell>

                        {/* Manager/Team */}
                        <TableCell onClick={() => toggleRow(rowKey)}>
                          <div>
                            <div className="font-medium">{manager.teamName}</div>
                            <div className="text-xs text-muted-foreground">
                              {manager.managerName}
                            </div>
                          </div>
                        </TableCell>

                        {/* League */}
                        <TableCell className="text-center" onClick={() => toggleRow(rowKey)}>
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                              manager.leagueName.includes('AFC')
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {manager.leagueName.includes('AFC') ? 'AFC' : 'NFC'}
                          </span>
                        </TableCell>

                        {/* Total Spent */}
                        <TableCell
                          className="text-right font-mono"
                          onClick={() => toggleRow(rowKey)}
                        >
                          <span className="font-semibold">${manager.totalFAABSpent}</span>
                        </TableCell>

                        {/* Remaining */}
                        <TableCell
                          className="text-right font-mono"
                          onClick={() => toggleRow(rowKey)}
                        >
                          ${manager.remainingFAAB}
                        </TableCell>

                        {/* Percent Spent */}
                        <TableCell className="text-center" onClick={() => toggleRow(rowKey)}>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              manager.percentSpent > 75
                                ? 'bg-red-100 text-red-700'
                                : manager.percentSpent > 50
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {manager.percentSpent.toFixed(0)}%
                          </span>
                        </TableCell>

                        {/* Total Transactions */}
                        <TableCell className="text-center" onClick={() => toggleRow(rowKey)}>
                          <span className="font-medium">{manager.totalTransactions}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({manager.totalWaivers}W)
                          </span>
                        </TableCell>

                        {/* Net Excess Spend */}
                        <TableCell className="text-right" onClick={() => toggleRow(rowKey)}>
                          {manager.netExcessSpend > 5 ? (
                            <span className="text-red-600 font-mono font-semibold">
                              +${manager.netExcessSpend.toFixed(0)}
                            </span>
                          ) : manager.netExcessSpend < -5 ? (
                            <span className="text-green-600 font-mono font-semibold">
                              ${manager.netExcessSpend.toFixed(0)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-mono">
                              ${manager.netExcessSpend.toFixed(0)}
                            </span>
                          )}
                        </TableCell>

                        {/* Success Rate */}
                        <TableCell className="text-center" onClick={() => toggleRow(rowKey)}>
                          <span className="text-sm">
                            {(manager.waiverSuccessRate * 100).toFixed(0)}%
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({manager.totalWaivers}/{manager.totalWaivers + manager.failedWaivers})
                          </span>
                        </TableCell>
                      </TableRow>

                      {/* Expanded transaction details */}
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-muted/20 p-0">
                            <div className="p-4">
                              <div className="font-semibold mb-3 text-sm">
                                Transactions (ordered by cost):
                              </div>
                              {transactions.length === 0 ? (
                                <div className="text-sm text-muted-foreground italic">
                                  No transactions recorded
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {transactions.map((txn, idx) => (
                                    <div
                                      key={txn.transactionId}
                                      className="flex items-center justify-between border-b pb-2 last:border-0"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground w-6">
                                          #{idx + 1}
                                        </span>
                                        <span className="font-medium">{txn.playerName}</span>
                                        <span className="text-xs text-muted-foreground">
                                          ({txn.position})
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          Week {txn.week}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <div className="text-right">
                                          <div className="font-mono font-semibold">
                                            {txn.transactionType === 'waiver' ? (
                                              `$${txn.faabBid}`
                                            ) : (
                                              <span className="text-muted-foreground">FA</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right w-20">
                                          {txn.excessSpend !== undefined &&
                                          txn.transactionType === 'waiver' ? (
                                            <div>
                                              <div className="text-xs text-muted-foreground mb-0.5">
                                                Excess
                                              </div>
                                              {txn.excessSpend > 5 ? (
                                                <span className="text-red-600 font-mono text-sm font-semibold">
                                                  +${txn.excessSpend.toFixed(0)}
                                                </span>
                                              ) : txn.excessSpend < -5 ? (
                                                <span className="text-green-600 font-mono text-sm font-semibold">
                                                  ${txn.excessSpend.toFixed(0)}
                                                </span>
                                              ) : (
                                                <span className="text-muted-foreground font-mono text-sm">
                                                  ${txn.excessSpend.toFixed(0)}
                                                </span>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});

ManagerWaiverTable.displayName = 'ManagerWaiverTable';
