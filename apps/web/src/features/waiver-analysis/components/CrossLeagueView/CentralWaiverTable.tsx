/**
 * Central Waiver Table
 *
 * Comprehensive player-centric table showing all waiver acquisitions across registered leagues
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
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
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
import {
  deltaTextClass,
  leagueBadgeClass,
  neutralBadgeClass,
  tieredBadgeClass,
} from '@/lib/stat-colors';
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

  // Build cross-league lookup: player+week -> transaction by league.
  const crossLeagueMap = useMemo(() => {
    const map = new Map<string, Map<string, WaiverTransaction>>();

    allWaiverTransactions.forEach(txn => {
      const key = `${txn.playerId}-${txn.week}`;
      if (!map.has(key)) {
        map.set(key, new Map());
      }
      map.get(key)!.set(txn.leagueId, txn);
    });

    return map;
  }, [allWaiverTransactions]);

  // Get cross-league delta for a transaction
  const getCrossLeagueDelta = (txn: WaiverTransaction): number | null => {
    const key = `${txn.playerId}-${txn.week}`;
    const leagueTransactions = crossLeagueMap.get(key);
    const otherBids = Array.from(leagueTransactions?.values() ?? [])
      .filter(other => other.leagueId !== txn.leagueId)
      .map(other => other.faabBid);
    if (otherBids.length === 0) return null;

    const otherLeagueAverage = otherBids.reduce((total, bid) => total + bid, 0) / otherBids.length;
    return txn.faabBid - otherLeagueAverage;
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = allWaiverTransactions;

    // League filter
    if (leagueFilter !== 'all') {
      filtered = filtered.filter(t => t.leagueId === leagueFilter);
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
    <Card mobileFlat>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Complete Waiver Wire Activity
        </CardTitle>
        <CardDescription>
          All waiver acquisitions across {data.leagueTrends.length} leagues •{' '}
          {sortedTransactions.length} shown of {allWaiverTransactions.length} total
        </CardDescription>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 md:grid-cols-4">
          <Select value={leagueFilter} onValueChange={setLeagueFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="All Leagues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leagues</SelectItem>
              {data.leagueTrends.map(league => (
                <SelectItem key={league.leagueId} value={league.leagueId}>
                  {league.leagueName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="h-11">
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
            <SelectTrigger className="h-11">
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
              aria-label="Search waiver activity by owner"
              className="h-11 pl-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_44px] gap-2 pt-3 sm:hidden">
          <Select value={sortField} onValueChange={value => setSortField(value as SortField)}>
            <SelectTrigger className="h-11" aria-label="Sort waiver activity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="faabBid">Sort: Bid</SelectItem>
              <SelectItem value="playerName">Sort: Player</SelectItem>
              <SelectItem value="week">Sort: Week</SelectItem>
              <SelectItem value="competition">Sort: Competition</SelectItem>
              <SelectItem value="excessSpend">Sort: Excess Spend</SelectItem>
              <SelectItem value="crossLeagueDelta">Sort: Other Leagues</SelectItem>
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => setSortAsc(current => !current)}
            aria-label={sortAsc ? 'Sort descending' : 'Sort ascending'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-input hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <DataList className="sm:hidden">
          {sortedTransactions.length === 0 ? (
            <DataListItem className="text-center text-sm text-muted-foreground">
              No transactions match your filters
            </DataListItem>
          ) : (
            sortedTransactions.map(txn => {
              const crossLeagueDelta = getCrossLeagueDelta(txn);
              const hasCompetition = (txn.competingBids?.length ?? 0) > 0;

              return (
                <DataListItem key={txn.transactionId}>
                  <DataListHeader>
                    <div className="min-w-0">
                      <DataListTitle className="truncate">{txn.playerName}</DataListTitle>
                      <DataListDescription>
                        {txn.teamName} · {txn.leagueName} · Week {txn.week}
                      </DataListDescription>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-base font-semibold">${txn.faabBid}</div>
                      <div className="text-xs text-muted-foreground">{txn.position}</div>
                    </div>
                  </DataListHeader>

                  <details className="group mt-2">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                      <span>More metrics</span>
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <DataListMetrics className="mt-1">
                      <DataListMetric>
                        <DataListMetricLabel className="text-xs">Competition</DataListMetricLabel>
                        <DataListMetricValue>{txn.totalCompetition ?? 0} bids</DataListMetricValue>
                      </DataListMetric>
                      <DataListMetric>
                        <DataListMetricLabel className="text-xs">Excess</DataListMetricLabel>
                        <DataListMetricValue>
                          {txn.excessSpend === undefined
                            ? '—'
                            : `${txn.excessSpend > 0 ? '+' : ''}$${txn.excessSpend.toFixed(0)}`}
                        </DataListMetricValue>
                      </DataListMetric>
                      <DataListMetric className="text-right">
                        <DataListMetricLabel className="text-xs">Other leagues</DataListMetricLabel>
                        <DataListMetricValue>
                          {crossLeagueDelta === null
                            ? '—'
                            : `${crossLeagueDelta > 0 ? '+' : ''}$${crossLeagueDelta.toFixed(0)}`}
                        </DataListMetricValue>
                      </DataListMetric>
                    </DataListMetrics>

                    {hasCompetition && (
                      <div className="mt-3 border-t border-border/70 pt-3 text-sm">
                        <div className="font-semibold">Competing bids</div>
                        <div className="mt-2 divide-y divide-border/70">
                          {txn.competingBids?.map((bid, index) => (
                            <div
                              key={`${bid.teamName}-${bid.amount}-${index}`}
                              className="flex items-start justify-between gap-3 py-2"
                            >
                              <div className="min-w-0">
                                <div className="truncate font-medium">{bid.teamName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {bid.failureReason}
                                </div>
                              </div>
                              <div className="font-mono font-semibold">${bid.amount}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </details>
                </DataListItem>
              );
            })
          )}
        </DataList>

        <div
          role="region"
          aria-label="Complete waiver activity table"
          tabIndex={0}
          className="hidden overflow-auto rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:block"
        >
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
                  vs Other Leagues {getSortIcon('crossLeagueDelta')}
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
                              aria-label={
                                isExpanded ? 'Collapse competing bids' : 'Show competing bids'
                              }
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
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${neutralBadgeClass}`}
                          >
                            {txn.position}
                          </span>
                        </td>

                        {/* Week */}
                        <td className="px-3 py-2 text-center">{txn.week}</td>

                        {/* League Badge */}
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${leagueBadgeClass(
                              txn.leagueName,
                            )}`}
                          >
                            {txn.leagueName}
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
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tieredBadgeClass(
                                txn.totalCompetition ?? 0,
                                { low: 1, high: 3 },
                              )}`}
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
                                  <TrendingUp
                                    className={`h-3 w-3 ${deltaTextClass(-txn.excessSpend)}`}
                                  />
                                  <span
                                    className={`font-mono font-semibold ${deltaTextClass(-txn.excessSpend)}`}
                                  >
                                    +${txn.excessSpend.toFixed(0)}
                                  </span>
                                </>
                              ) : txn.excessSpend < -5 ? (
                                <>
                                  <TrendingDown
                                    className={`h-3 w-3 ${deltaTextClass(-txn.excessSpend)}`}
                                  />
                                  <span
                                    className={`font-mono font-semibold ${deltaTextClass(-txn.excessSpend)}`}
                                  >
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
                                  <TrendingUp
                                    className={`h-3 w-3 ${deltaTextClass(crossLeagueDelta)}`}
                                  />
                                  <span
                                    className={`font-mono font-semibold ${deltaTextClass(crossLeagueDelta)}`}
                                  >
                                    +${Math.abs(crossLeagueDelta).toFixed(0)}
                                  </span>
                                </>
                              ) : crossLeagueDelta < 0 ? (
                                <>
                                  <TrendingDown
                                    className={`h-3 w-3 ${deltaTextClass(crossLeagueDelta)}`}
                                  />
                                  <span
                                    className={`font-mono font-semibold ${deltaTextClass(crossLeagueDelta)}`}
                                  >
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
                                    <span className="font-mono text-destructive">
                                      ${bid.amount}
                                    </span>
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
