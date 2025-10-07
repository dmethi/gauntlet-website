'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TeamInfo } from '../types';
import { GradeTxn } from '@/app/stats/types';
import { CURRENT_LEAGUES } from '@/config/leagues';
import { buildFacts } from '@/lib/transactions-facts';
import { computeTransactionGradesForStatsHub } from '../utils/computeTransactionGradesForStatsHub';
import { getDivergingBg } from '../utils/getDivergingBg';
import { getTextColorForBg } from '../utils/getTextColorForBg';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ManagerRankings } from './ManagerRankings';

export function TransactionAnalysis() {
  const [allData, setAllData] = useState<GradeTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Initializing...');
  const [selectedTxn, setSelectedTxn] = useState<GradeTxn | null>(null);
  const [teamsMap, setTeamsMap] = useState<Map<string, TeamInfo>>(new Map());
  const [currentNflWeek, setCurrentNflWeek] = useState(4); // Will be updated dynamically

  // Additional loading states for better UX
  const [teamsLoaded, setTeamsLoaded] = useState(false);
  const [transactionsProcessed, setTransactionsProcessed] = useState(false);

  // Filter and sort states (like original)
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'score' | 'grade' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort data like the original sidebar page (MOVED TO TOP TO AVOID HOOK ORDER ISSUES)
  const filteredData = useMemo(() => {
    const filtered = allData.filter(txn => {
      // Team filter
      if (teamFilter !== 'all' && txn.teamName !== teamFilter) return false;

      // League filter
      if (leagueFilter !== 'all' && txn.leagueName !== leagueFilter) return false;

      // Grade filter
      if (gradeFilter !== 'all' && txn.grade !== gradeFilter) return false;

      // Search filter
      if (
        searchTerm &&
        !txn.players.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
        return false;

      return true;
    });

    // Sort data
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'score') {
        comparison = a.score - b.score;
      } else if (sortBy === 'grade') {
        const gradeOrder = { 'A+': 6, A: 5, B: 4, C: 3, D: 2, F: 1 };
        comparison =
          (gradeOrder[a.grade as keyof typeof gradeOrder] || 0) -
          (gradeOrder[b.grade as keyof typeof gradeOrder] || 0);
      } else if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [allData, teamFilter, leagueFilter, gradeFilter, searchTerm, sortBy, sortOrder]);

  // Get unique teams and leagues for filters (MOVED TO TOP TO AVOID HOOK ORDER ISSUES)
  const uniqueTeams = useMemo(
    () => Array.from(new Set(allData.map(txn => txn.teamName).filter(Boolean))).sort(),
    [allData],
  );

  const uniqueLeagues = useMemo(
    () => Array.from(new Set(allData.map(txn => txn.leagueName).filter(Boolean))).sort(),
    [allData],
  );

  // Load transaction data using the full working implementation
  useEffect(() => {
    let cancelled = false;

    const loadTransactionData = async () => {
      try {
        setLoading(true);
        setLoadingStep('Getting current NFL week...');

        // Load current NFL week
        try {
          const nflRes = await fetch('/api/nfl-state');
          if (nflRes.ok) {
            const nflState = await nflRes.json();
            const currentWeek = nflState.week || nflState.display_week || 4;
            console.log(`[Transaction Analysis] Current NFL Week: ${currentWeek}`);
            setCurrentNflWeek(currentWeek);
          }
        } catch (error) {
          console.log('NFL state error, using default week 4', error);
        }

        // Load team information
        setLoadingStep('Loading team information from both leagues...');
        const teamsData = new Map<string, TeamInfo>();
        try {
          const teamsRes = await fetch('/api/league/teams');
          if (teamsRes.ok) {
            const teamsResponse = await teamsRes.json();
            const teams = teamsResponse.teams || [];

            teams.forEach((team: any) => {
              const teamKey = `${team.leagueId}-${team.id}`;
              teamsData.set(teamKey, {
                rosterId: team.id,
                teamName: team.name,
                ownerName: team.owner,
                leagueId: team.leagueId,
                leagueName: team.leagueName,
              });
            });

            console.log(`[Team Loading] Loaded ${teams.length} teams total`);
            console.log(
              `[Team Loading] Teams by league:`,
              teams.reduce((acc: any, team: any) => {
                acc[team.leagueName] = (acc[team.leagueName] || 0) + 1;
                return acc;
              }, {}),
            );
          }
        } catch (error) {
          console.error('Failed to load team data:', error);
        }

        setTeamsMap(teamsData);
        setTeamsLoaded(true);
        const allTransactions: GradeTxn[] = [];

        // Process each league using the full working implementation
        for (const league of CURRENT_LEAGUES) {
          if (cancelled) return;

          setLoadingStep(`Processing ${league.name} transactions and calculating VORP...`);

          try {
            // Fetch transactions
            const txnRes = await fetch(`/api/league/${league.id}/transactions`);
            if (!txnRes.ok) continue;
            const txnData = await txnRes.json();
            const transactions = txnData.data || [];

            // Build facts - dynamically use weeks 1 through current week
            const weeksToAnalyze = Array.from({ length: currentNflWeek }, (_, i) => i + 1);
            console.log(`[Transaction Analysis] Analyzing weeks: ${weeksToAnalyze.join(', ')}`);
            const facts = await buildFacts(league.id, weeksToAnalyze);

            // Grade transactions using the full working implementation
            const gradedTransactions = await computeTransactionGradesForStatsHub(
              transactions,
              facts,
              league.id,
              league.name,
              teamsData,
              currentNflWeek,
            );

            allTransactions.push(...gradedTransactions);
          } catch (error) {
            console.error(`Failed to process ${league.name}:`, error);
          }
        }

        if (cancelled) return;

        // Assign letter grades using the working logic
        setLoadingStep('Calculating final transaction grades...');
        if (allTransactions.length > 0) {
          const vals = allTransactions.map(g => g.score);
          const n = vals.length || 1;
          const mean = vals.reduce((a, b) => a + b, 0) / n;
          const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1);
          const std = Math.sqrt(variance);

          allTransactions.forEach(g => {
            const z = std > 0 ? (g.score - mean) / std : 0;
            const pct = 50 + 40 * Math.tanh(z);
            g.grade =
              pct >= 88
                ? 'A+'
                : pct >= 82
                  ? 'A'
                  : pct >= 70
                    ? 'B'
                    : pct >= 55
                      ? 'C'
                      : pct >= 40
                        ? 'D'
                        : 'F';
          });
        }

        // Sort by score descending
        setLoadingStep('Finalizing transaction rankings...');
        allTransactions.sort((a, b) => b.score - a.score);
        setAllData(allTransactions);
        setTransactionsProcessed(true);
      } catch (error) {
        console.error('Failed to load transaction data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactionData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading placeholder for manager rankings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Manager Rankings by Net VORP
            </CardTitle>
            <CardDescription>Loading transaction efficiency rankings...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                <div
                  className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading placeholder for transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Transaction Analysis
            </CardTitle>
            <CardDescription>Loading transaction data with VORP calculations...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
                <div
                  className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-muted-foreground mb-1">
                  Loading Transaction Analysis
                </div>
                <div className="text-sm text-muted-foreground">{loadingStep}</div>
              </div>

              {/* Progress indicator */}
              <div className="w-full max-w-md bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 animate-pulse"
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render anything until ALL data is fully loaded
  if (loading || !teamsLoaded || !transactionsProcessed || allData.length === 0) {
    return (
      <div className="space-y-6">
        {/* Loading placeholder for manager rankings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Manager Rankings by Net VORP
            </CardTitle>
            <CardDescription>Loading transaction efficiency rankings...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                <div
                  className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading placeholder for transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Transaction Analysis
            </CardTitle>
            <CardDescription>Loading transaction data with VORP calculations...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
                <div
                  className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-muted-foreground mb-1">
                  Loading Transaction Analysis
                </div>
                <div className="text-sm text-muted-foreground">{loadingStep}</div>
              </div>

              {/* Progress indicator */}
              <div className="w-full max-w-md bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 animate-pulse"
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ManagerRankings transactions={allData} allTeams={teamsMap} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Transaction Analysis
              </CardTitle>
              <CardDescription>
                All transactions ranked by Cost-Adjusted VORP (Raw VORP - FAAB Penalty)
              </CardDescription>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {filteredData.filter(t => t.score > 0).length}
                </div>
                <div className="text-xs text-green-700">Positive</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {filteredData.filter(t => t.score < 0).length}
                </div>
                <div className="text-xs text-red-700">Negative</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {filteredData.filter(t => t.score === 0).length}
                </div>
                <div className="text-xs text-gray-700">Neutral</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
                <div className="text-xs text-blue-700">Total</div>
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {/* Team Filter */}
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {uniqueTeams.map(team => (
                  <SelectItem key={team} value={team || ''}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* League Filter */}
            <Select value={leagueFilter} onValueChange={setLeagueFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Leagues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leagues</SelectItem>
                {uniqueLeagues.map(league => (
                  <SelectItem key={league} value={league || ''}>
                    {league}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Grade Filter */}
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="F">F</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={value => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="grade">Grade</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>

              <button
                title="Sort"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Showing {filteredData.length} of {allData.length} transactions
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">No transactions match your filters</div>
              <button
                onClick={() => {
                  setTeamFilter('all');
                  setLeagueFilter('all');
                  setGradeFilter('all');
                  setSearchTerm('');
                }}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
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
                  {filteredData.map(txn => {
                    const scoreRange = Math.max(...allData.map(t => Math.abs(t.score))) || 1;
                    return (
                      <TableRow
                        key={txn.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedTxn(txn)}
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
                          {txn.faabCost > 0 ? (
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
                          {(() => {
                            const bg = getDivergingBg(txn.score / scoreRange);
                            const fg = getTextColorForBg(bg);
                            return (
                              <div className="flex flex-col items-end">
                                <span
                                  className="px-2 py-0.5 rounded font-mono font-medium"
                                  style={{ backgroundColor: bg, color: fg }}
                                >
                                  {txn.score.toFixed(1)}
                                </span>
                                {txn.faabCost > 0 && (
                                  <div className="text-xs text-red-400 font-mono">
                                    -{txn.costPenalty?.toFixed(1) || '0.0'}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedTxn(txn);
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
          )}
        </CardContent>
      </Card>

      {/* Original Dialog Modal */}
      <Dialog open={!!selectedTxn} onOpenChange={open => !open && setSelectedTxn(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTxn && (
            <div className="text-sm space-y-4">
              <div className="flex items-center gap-2">
                <Badge>{selectedTxn.grade}</Badge>
                {(() => {
                  const scoreRange = Math.max(...allData.map(t => Math.abs(t.score))) || 1;
                  const bg = getDivergingBg(selectedTxn.score / scoreRange);
                  const fg = getTextColorForBg(bg);
                  return (
                    <span className="px-1.5 rounded" style={{ backgroundColor: bg, color: fg }}>
                      Score: {selectedTxn.score.toFixed(2)}
                    </span>
                  );
                })()}
              </div>

              <div className="text-muted-foreground">
                <div className="flex flex-col gap-1">
                  <div>
                    {new Date(selectedTxn.createdAt).toLocaleString()} •{' '}
                    {selectedTxn.type.replace('_', ' ')}
                  </div>
                  <div className="text-xs">
                    Team: {selectedTxn.teamName} • League: {selectedTxn.leagueName}
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <h3 className="font-semibold text-base">Score Breakdown</h3>
                {(() => {
                  const contribution = selectedTxn.players
                    .filter(p => p.role === 'add' && p.forYou)
                    .reduce((s, p) => s + (p.forYou?.weightedPoints || 0), 0);
                  const selfHarm = selectedTxn.players
                    .filter(p => p.role === 'drop' && p.afterDrop)
                    .reduce((s, p) => s + (p.afterDrop?.selfHarmWeighted || 0), 0);
                  const oppHarm = selectedTxn.players
                    .filter(p => p.role === 'drop' && p.afterDrop)
                    .reduce((s, p) => s + (p.afterDrop?.oppHarmWeighted || 0), 0);
                  const totalPenalties = selfHarm + oppHarm;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-green-600">Contribution</div>
                        <div className="text-lg font-bold">+{contribution.toFixed(1)}</div>
                        <div className="text-muted-foreground">
                          Playoff-weighted VORP when started
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-red-600">Self-Harm</div>
                        <div className="text-lg font-bold">-{selfHarm.toFixed(1)}</div>
                        <div className="text-muted-foreground">
                          Points lost vs your best starter
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-orange-600">Opponent-Harm</div>
                        <div className="text-lg font-bold">-{oppHarm.toFixed(1)}</div>
                        <div className="text-muted-foreground">
                          Points above replacement by any opponent
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">Net Score</div>
                        <div
                          className={`text-lg font-bold ${selectedTxn.score >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {selectedTxn.score >= 0 ? '+' : ''}
                          {selectedTxn.score.toFixed(1)}
                        </div>
                        <div className="text-muted-foreground">
                          {contribution.toFixed(1)} - {totalPenalties.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Players Section */}
              <div className="space-y-4">
                {selectedTxn.players.map(player => (
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
                          .filter(w => w.week <= currentNflWeek)
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
