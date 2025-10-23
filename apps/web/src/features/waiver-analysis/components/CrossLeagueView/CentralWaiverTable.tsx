/**
 * Central Waiver Table
 *
 * Comprehensive player-centric table showing all waiver acquisitions across both leagues
 * Following design patterns from draft analysis and stats pages
 */

'use client';

import React, { memo, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Search, TrendingDown, TrendingUp } from 'lucide-react';
import type { WaiverAnalysisData, WaiverTransaction } from '../../types';

interface CentralWaiverTableProps {
  readonly data: WaiverAnalysisData;
}

type SortField =
  | 'playerName'
  | 'week'
  | 'faabBid'
  | 'excessSpend'
  | 'competition'
  | 'crossLeagueDelta';

export const CentralWaiverTable = memo<CentralWaiverTableProps>(props => {
  const { data } = props;

  // Filters
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [weekFilter, setWeekFilter] = useState<string>('all');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('faabBid');
  const [sortAsc, setSortAsc] = useState(false);

  // Expandable rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Get all successful waiver transactions (only FAAB waivers, not free agents)
  const allWaiverTransactions = useMemo(() => {
    return data.allTransactions.filter(t => t.isWinningBid && t.transactionType === 'waiver');
  }, [data.allTransactions]);

  // Build cross-league lookup: player+week -> transactions by league
  const crossLeagueMap = useMemo(() => {
    const map = new Map<string, { afc?: WaiverTransaction; nfc?: WaiverTransaction }>();

    allWaiverTransactions.forEach(txn => {
      const key = `${txn.playerId}-${txn.week}`;
      if (!map.has(key)) {
        map.set(key, {});
      }
      const entry = map.get(key)!;
      if (txn.leagueName.includes('AFC')) {
        entry.afc = txn;
      } else {
        entry.nfc = txn;
      }
    });

    return map;
  }, [allWaiverTransactions]);

  // Get cross-league delta for a transaction
  const getCrossLeagueDelta = (txn: WaiverTransaction): number | null => {
    const key = `${txn.playerId}-${txn.week}`;
    const entry = crossLeagueMap.get(key);
    if (!entry || !entry.afc || !entry.nfc) return null;

    const isAFC = txn.leagueName.includes('AFC');
    const thisBid = txn.faabBid;
    const otherBid = isAFC ? entry.nfc.faabBid : entry.afc.faabBid;

    return thisBid - otherBid;
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = allWaiverTransactions;

    // League filter
    if (leagueFilter !== 'all') {
      filtered = filtered.filter(t =>
        leagueFilter === 'afc' ? t.leagueName.includes('AFC') : t.leagueName.includes('NFC'),
      );
    }

    // Position filter
    if (positionFilter !== 'all') {
      filtered = filtered.filter(t => t.position === positionFilter);
    }

    // Owner search
    if (ownerSearch) {
      filtered = filtered.filter(
        t =>
          t.teamName.toLowerCase().includes(ownerSearch.toLowerCase()) ||
          t.managerName.toLowerCase().includes(ownerSearch.toLowerCase()),
      );
    }

    // Week filter
    if (weekFilter !== 'all') {
      filtered = filtered.filter(t => t.week === parseInt(weekFilter));
    }

    return filtered;
  }, [allWaiverTransactions, leagueFilter, positionFilter, ownerSearch, weekFilter]);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case 'playerName':
          return sortAsc
            ? a.playerName.localeCompare(b.playerName)
            : b.playerName.localeCompare(a.playerName);
        case 'week':
          aVal = a.week;
          bVal = b.week;
          break;
        case 'faabBid':
          aVal = a.faabBid;
          bVal = b.faabBid;
          break;
        case 'excessSpend':
          aVal = a.excessSpend ?? 0;
          bVal = b.excessSpend ?? 0;
          break;
        case 'competition':
          aVal = a.totalCompetition ?? 0;
          bVal = b.totalCompetition ?? 0;
          break;
        case 'crossLeagueDelta':
          aVal = Math.abs(getCrossLeagueDelta(a) ?? -999);
          bVal = Math.abs(getCrossLeagueDelta(b) ?? -999);
          break;
        default:
          return 0;
      }

      return sortAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
  }, [filteredTransactions, sortField, sortAsc, getCrossLeagueDelta]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const toggleRow = (txnId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(txnId)) {
      newExpanded.delete(txnId);
    } else {
      newExpanded.add(txnId);
    }
    setExpandedRows(newExpanded);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <TrendingUp className="inline h-3 w-3 opacity-30" />;
    return sortAsc ? (
      <TrendingUp className="inline h-3 w-3" />
    ) : (
      <TrendingDown className="inline h-3 w-3" />
    );
  };

  // Get unique positions for filter
  const positions = useMemo(() => {
    const posSet = new Set(allWaiverTransactions.map(t => t.position));
    return Array.from(posSet).sort();
  }, [allWaiverTransactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Complete Waiver Wire Activity
        </CardTitle>
        <CardDescription>
          All waiver acquisitions across both leagues • {sortedTransactions.length} shown of{' '}
          {allWaiverTransactions.length} total
        </CardDescription>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4">
          <Select value={leagueFilter} onValueChange={setLeagueFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Leagues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leagues</SelectItem>
              <SelectItem value="afc">AFC Only</SelectItem>
              <SelectItem value="nfc">NFC Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map(pos => (
                <SelectItem key={pos} value={pos}>
                  {pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={weekFilter} onValueChange={setWeekFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Weeks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Weeks</SelectItem>
              {data.weeksAnalyzed.map(week => (
                <SelectItem key={week} value={week.toString()}>
                  Week {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search owner..."
              value={ownerSearch}
              onChange={e => setOwnerSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-3 text-left w-8"></th>
                <th
                  className="px-3 py-3 text-left cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('playerName')}
                >
                  Player {getSortIcon('playerName')}
                </th>
                <th className="px-3 py-3 text-center">Pos</th>
                <th
                  className="px-3 py-3 text-center cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('week')}
                >
                  Week {getSortIcon('week')}
                </th>
                <th className="px-3 py-3 text-center">League</th>
                <th className="px-3 py-3 text-left">Owner</th>
                <th
                  className="px-3 py-3 text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('faabBid')}
                >
                  Bid $ {getSortIcon('faabBid')}
                </th>
                <th
                  className="px-3 py-3 text-center cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('competition')}
                >
                  Competition {getSortIcon('competition')}
                </th>
                <th
                  className="px-3 py-3 text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('excessSpend')}
                >
                  Excess $ {getSortIcon('excessSpend')}
                </th>
                <th
                  className="px-3 py-3 text-center cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('crossLeagueDelta')}
                >
                  Cross-League Δ {getSortIcon('crossLeagueDelta')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">
                    No transactions match your filters
                  </td>
                </tr>
              ) : (
                sortedTransactions.map(txn => {
                  const isExpanded = expandedRows.has(txn.transactionId);
                  const hasCompetition =
                    (txn.competingBids?.length ?? 0) > 0 && txn.transactionType === 'waiver';
                  const crossLeagueDelta = getCrossLeagueDelta(txn);

                  return (
                    <React.Fragment key={txn.transactionId}>
                      <tr className="border-t hover:bg-muted/30">
                        {/* Expand icon */}
                        <td className="px-3 py-2 text-center">
                          {hasCompetition && (
                            <button
                              onClick={() => toggleRow(txn.transactionId)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </td>

                        {/* Player */}
                        <td className="px-3 py-2 font-medium">{txn.playerName}</td>

                        {/* Position */}
                        <td className="px-3 py-2 text-center">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                            {txn.position}
                          </span>
                        </td>

                        {/* Week */}
                        <td className="px-3 py-2 text-center">{txn.week}</td>

                        {/* League Badge */}
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                              txn.leagueName.includes('AFC')
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {txn.leagueName.includes('AFC') ? 'AFC' : 'NFC'}
                          </span>
                        </td>

                        {/* Owner */}
                        <td className="px-3 py-2">
                          <div className="max-w-[150px] truncate" title={txn.teamName}>
                            {txn.teamName}
                          </div>
                        </td>

                        {/* Bid Amount */}
                        <td className="px-3 py-2 text-right font-mono">
                          {txn.transactionType === 'waiver' ? (
                            <span className="font-semibold">${txn.faabBid}</span>
                          ) : (
                            <span className="text-muted-foreground">FA</span>
                          )}
                        </td>

                        {/* Competition */}
                        <td className="px-3 py-2 text-center">
                          {txn.transactionType === 'waiver' ? (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                (txn.totalCompetition ?? 0) > 3
                                  ? 'bg-red-100 text-red-700'
                                  : (txn.totalCompetition ?? 0) > 1
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {txn.totalCompetition}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </td>

                        {/* Excess Spend */}
                        <td className="px-3 py-2 text-right">
                          {txn.transactionType === 'waiver' && txn.excessSpend !== undefined ? (
                            <div className="flex items-center justify-end gap-1">
                              {txn.excessSpend > 5 ? (
                                <>
                                  <TrendingUp className="h-3 w-3 text-red-500" />
                                  <span className="text-red-600 font-mono font-semibold">
                                    +${txn.excessSpend.toFixed(0)}
                                  </span>
                                </>
                              ) : txn.excessSpend < -5 ? (
                                <>
                                  <TrendingDown className="h-3 w-3 text-green-500" />
                                  <span className="text-green-600 font-mono font-semibold">
                                    ${txn.excessSpend.toFixed(0)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-muted-foreground font-mono">
                                  ${txn.excessSpend.toFixed(0)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </td>

                        {/* Cross-League Delta */}
                        <td className="px-3 py-2 text-center">
                          {crossLeagueDelta !== null ? (
                            <div className="flex items-center justify-center gap-1">
                              {crossLeagueDelta > 0 ? (
                                <>
                                  <TrendingUp className="h-3 w-3 text-blue-500" />
                                  <span className="text-blue-600 font-mono font-semibold">
                                    +${Math.abs(crossLeagueDelta).toFixed(0)}
                                  </span>
                                </>
                              ) : crossLeagueDelta < 0 ? (
                                <>
                                  <TrendingDown className="h-3 w-3 text-purple-500" />
                                  <span className="text-purple-600 font-mono font-semibold">
                                    -${Math.abs(crossLeagueDelta).toFixed(0)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-muted-foreground font-mono text-sm">
                                  Same
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded competing bids */}
                      {isExpanded && hasCompetition && (
                        <tr>
                          <td colSpan={10} className="px-3 py-2 bg-muted/20">
                            <div className="pl-8 text-xs">
                              <div className="font-semibold mb-1">Competing Bids:</div>
                              <div className="space-y-1">
                                {txn.competingBids?.map((bid, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="text-muted-foreground">#{idx + 1}</span>
                                    <span className="font-medium">{bid.teamName}</span>
                                    <span className="font-mono text-red-600">${bid.amount}</span>
                                    <span className="text-muted-foreground italic">
                                      ({bid.failureReason})
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});

CentralWaiverTable.displayName = 'CentralWaiverTable';
