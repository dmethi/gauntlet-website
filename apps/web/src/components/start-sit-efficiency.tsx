'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePlayers } from '@/lib/hooks';
import type {
  DecisionDetail,
  ManagerEfficiency,
  RosterContext,
  StartSitData,
} from '@/features/start-sit/types';

// Helper to get player name from the players data
const getPlayerName = (playerId: string, players: Record<string, any>) => {
  if (!playerId) return 'Unknown Player';

  const player = players[playerId];
  if (player) {
    return (
      player.full_name ||
      player.fullName ||
      `${player.firstName || ''} ${player.lastName || ''}`.trim() ||
      player.name ||
      `Player ${playerId.slice(0, 8)}`
    );
  }
  return `Player ${playerId.slice(0, 8)}`;
};

const PositionBadge = ({ position, weight }: { position: string; weight: number }) => {
  const getVariant = (w: number) => {
    if (w >= 0.9) return 'default'; // FLEX
    if (w >= 0.7) return 'secondary'; // QB, RB, WR
    if (w >= 0.5) return 'outline'; // TE
    return 'secondary'; // K, DEF
  };

  return (
    <Badge variant={getVariant(weight)} className="text-xs">
      {position} ({weight}x)
    </Badge>
  );
};

const ScoreCard = ({
  title,
  value,
  subtitle,
  color = 'blue',
}: {
  title: string;
  value: string;
  subtitle: string;
  color?: string;
}) => (
  <div className="text-center p-4 bg-gray-50 rounded-lg">
    <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
    <div className="text-sm font-medium text-gray-900">{title}</div>
    <div className="text-xs text-gray-500">{subtitle}</div>
  </div>
);

const OverallScores = ({ managers }: { managers: ManagerEfficiency[] }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <ScoreCard
        title="Average Weighted Score"
        value={`${((managers.reduce((sum, m) => sum + m.weightedDecisionScore, 0) / managers.length) * 100).toFixed(1)}%`}
        subtitle="Skill-adjusted decision rate"
        color="blue"
      />
      <ScoreCard
        title="Average Points Impact"
        value={`${(managers.reduce((sum, m) => sum + m.pointsImpactScore, 0) / managers.length).toFixed(1)}`}
        subtitle="Points vs league median"
        color="green"
      />
      <ScoreCard
        title="Total Decisions"
        value={managers.reduce((sum, m) => sum + m.decisions.length, 0).toString()}
        subtitle="Across all managers"
        color="purple"
      />
    </div>

    <div className="space-y-2">
      {managers.map((manager, index) => {
        const league = manager.leagueId.includes('44209') ? 'AFC' : 'NFC';
        const isPositive = manager.pointsImpactScore >= 0;

        return (
          <div
            key={manager.managerId}
            className="flex items-center justify-between p-3 bg-white rounded-lg border"
          >
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-500 w-8">#{index + 1}</span>
              <div>
                <div className="font-medium">{manager.managerName}</div>
                <div className="text-sm text-gray-500">
                  {league} • {manager.decisions.length} decisions
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-semibold text-blue-600">
                  {(manager.weightedDecisionScore * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Weighted Score</div>
              </div>

              <div className="text-right">
                <div className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}
                  {manager.pointsImpactScore.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Points vs Median</div>
              </div>

              <Progress value={manager.weightedDecisionScore * 100} className="w-20 h-2" />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const PositionBreakdownTable = ({
  managers,
  selectedManagerId,
  setSelectedManagerId,
}: {
  managers: ManagerEfficiency[];
  selectedManagerId: string;
  setSelectedManagerId: (id: string) => void;
}) => {
  const [viewMode, setViewMode] = useState<'manager' | 'rankings'>('rankings');

  const selectedManager = managers.find(m => m.managerId === selectedManagerId);

  // Get all unique positions across all managers
  const allPositions = useMemo(() => {
    const posSet = new Set<string>();
    managers.forEach(m => {
      Object.keys(m.positionBreakdown).forEach(pos => posSet.add(pos));
    });
    return Array.from(posSet).sort();
  }, [managers]);

  // For each position, rank managers by their performance
  const positionRankings = useMemo(() => {
    const rankings: Record<
      string,
      Array<{
        manager: ManagerEfficiency;
        metrics: any;
      }>
    > = {};

    allPositions.forEach(position => {
      const managerMetrics = managers
        .filter(m => m.positionBreakdown[position])
        .map(m => ({
          manager: m,
          metrics: m.positionBreakdown[position],
        }))
        .sort((a, b) => {
          // Sort by decision rate first, then by points vs median
          if (Math.abs(a.metrics.decisionRate - b.metrics.decisionRate) > 0.01) {
            return b.metrics.decisionRate - a.metrics.decisionRate;
          }
          return b.metrics.pointsLostVsMedian - a.metrics.pointsLostVsMedian;
        });

      rankings[position] = managerMetrics;
    });

    return rankings;
  }, [managers, allPositions]);

  return (
    <div className="space-y-4">
      {/* View mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Position-by-Position Analysis</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('rankings')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === 'rankings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              League Rankings
            </button>
            <button
              onClick={() => setViewMode('manager')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === 'manager'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Individual Manager
            </button>
          </div>
        </div>

        {viewMode === 'manager' && (
          <Select value={selectedManagerId} onValueChange={setSelectedManagerId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select manager" />
            </SelectTrigger>
            <SelectContent>
              {managers.map(manager => (
                <SelectItem key={manager.managerId} value={manager.managerId}>
                  {manager.managerName} ({manager.leagueId.includes('44209') ? 'AFC' : 'NFC'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Rankings view */}
      {viewMode === 'rankings' && (
        <div className="space-y-6">
          {allPositions.map(position => {
            const rankings = positionRankings[position];
            const topManager = rankings[0];

            return (
              <Card key={position} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <PositionBadge position={position} weight={topManager.metrics.weight} />
                    <span className="text-sm text-gray-500">
                      {rankings.length} managers •{' '}
                      {rankings.reduce((sum, r) => sum + r.metrics.decisionsCount, 0)} total
                      decisions
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {rankings.map((ranking, index) => {
                    const isPositive = ranking.metrics.pointsLostVsMedian >= 0;
                    const league = ranking.manager.leagueId.includes('44209') ? 'AFC' : 'NFC';

                    return (
                      <div
                        key={ranking.manager.managerId}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-sm font-medium text-gray-500 w-6">
                            #{index + 1}
                          </span>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{ranking.manager.managerName}</div>
                            <div className="text-xs text-gray-500">
                              {league} • {ranking.metrics.decisionsCount} decisions
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-semibold text-sm text-blue-600">
                              {(ranking.metrics.decisionRate * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">Correct</div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`font-semibold text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {isPositive ? '+' : ''}
                              {ranking.metrics.pointsLostVsMedian.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500">vs Median</div>
                          </div>

                          <Progress
                            value={ranking.metrics.decisionRate * 100}
                            className="w-16 h-2"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Individual manager view */}
      {viewMode === 'manager' && selectedManager && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700">
            {selectedManager.managerName} - Position Breakdown
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(selectedManager.positionBreakdown).map(([position, metrics]) => {
              const isPositive = metrics.pointsLostVsMedian >= 0;

              return (
                <Card key={position} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <PositionBadge position={position} weight={metrics.weight} />
                    <span className="text-sm text-gray-500">
                      {metrics.decisionsCount} decisions
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Decision Rate</span>
                      <span className="font-semibold">
                        {(metrics.decisionRate * 100).toFixed(1)}%
                      </span>
                    </div>

                    <Progress value={metrics.decisionRate * 100} className="h-2" />

                    <div className="flex justify-between">
                      <span className="text-sm">vs Median</span>
                      <span
                        className={`font-semibold text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {isPositive ? '+' : ''}
                        {metrics.pointsLostVsMedian.toFixed(1)} pts
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const WorstDecisions = ({
  decisions,
  players,
}: {
  decisions: DecisionDetail[];
  players: Record<string, any>;
}) => {
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [minPointsThreshold, setMinPointsThreshold] = useState<number>(5);

  // Get unique weeks from decisions
  const availableWeeks = useMemo(() => {
    const weeks = new Set(decisions.map(d => d.week));
    return Array.from(weeks).sort((a, b) => a - b);
  }, [decisions]);

  // Filter decisions by selected week and point threshold
  const filteredDecisions = useMemo(() => {
    let filtered = decisions;

    if (selectedWeek !== 'all') {
      filtered = filtered.filter(d => d.week === parseInt(selectedWeek));
    }

    // Apply minimum points threshold
    filtered = filtered.filter(d => d.pointsLeft >= minPointsThreshold);

    return filtered;
  }, [decisions, selectedWeek, minPointsThreshold]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Worst Decisions (Most Points Left on Table) • {filteredDecisions.length} decisions
        </h3>
        <div className="flex gap-2">
          <Select
            value={minPointsThreshold.toString()}
            onValueChange={v => setMinPointsThreshold(Number(v))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All (≥0 pts)</SelectItem>
              <SelectItem value="3">≥3 points</SelectItem>
              <SelectItem value="5">≥5 points</SelectItem>
              <SelectItem value="10">≥10 points</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Weeks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Weeks</SelectItem>
              {availableWeeks.map(week => (
                <SelectItem key={week} value={week.toString()}>
                  Week {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredDecisions.map((decision, index) => {
          const league = decision.leagueId.includes('44209') ? 'AFC' : 'NFC';
          const selectedName = getPlayerName(decision.selectedPlayer.playerId, players);
          const optimalName = getPlayerName(decision.optimalPlayer.playerId, players);

          return (
            <Card
              key={`${decision.managerId}-${decision.week}-${decision.position}`}
              className="p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium">
                    {decision.managerName} ({league})
                  </div>
                  <div className="text-sm text-gray-500">
                    Week {decision.week} •{' '}
                    <PositionBadge position={decision.position} weight={decision.weight} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600 text-lg">
                    -{decision.pointsLeft.toFixed(1)} pts
                  </div>
                  <div className="text-xs text-gray-500">Points Lost</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-red-50 p-3 rounded">
                  <div className="font-medium text-red-800">Started</div>
                  <div>{selectedName}</div>
                  <div className="text-gray-600">
                    Proj: {decision.selectedPlayer.projectedPoints.toFixed(1)} | Actual:{' '}
                    {decision.selectedPlayer.actualPoints.toFixed(1)}
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded">
                  <div className="font-medium text-green-800">Should Have Started</div>
                  <div>{optimalName}</div>
                  <div className="text-gray-600">Source: {decision.optimalPlayer.source}</div>
                  <div className="text-gray-600">
                    Proj: {decision.optimalPlayer.projectedPoints.toFixed(1)} | Actual:{' '}
                    {decision.optimalPlayer.adjustedActualPoints.toFixed(1)}
                  </div>
                </div>
              </div>

              {decision.alternatives.length > 1 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs text-gray-500 mb-2">Other alternatives:</div>
                  <div className="space-y-1">
                    {decision.alternatives.slice(0, 5).map(alt => {
                      const altName = getPlayerName(alt.playerId, players);
                      const isWaiver = alt.source === 'waiver';
                      return (
                        <div
                          key={alt.playerId}
                          className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded"
                        >
                          <div className="flex-1">
                            <span className="font-medium">{altName}</span>
                            <span className="text-gray-500 ml-2">({alt.source})</span>
                          </div>
                          <div className="text-right flex gap-3 items-center">
                            <div className="text-gray-600">
                              Proj: {alt.projectedPoints.toFixed(1)}
                            </div>
                            <div>
                              {isWaiver ? (
                                <div>
                                  <span className="font-semibold text-gray-900">
                                    {alt.adjustedActualPoints.toFixed(1)}*
                                  </span>
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({alt.actualPoints.toFixed(1)} raw)
                                  </span>
                                </div>
                              ) : (
                                <span className="font-semibold text-gray-900">
                                  {alt.actualPoints.toFixed(1)} actual
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {decision.alternatives.some(alt => alt.source === 'waiver') && (
                    <div className="text-xs text-gray-500 mt-2">
                      * Adjusted with 35% waiver pickup penalty
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const BestRiskyDecisions = ({
  decisions,
  players,
}: {
  decisions: DecisionDetail[];
  players: Record<string, any>;
}) => {
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [minPayoffThreshold, setMinPayoffThreshold] = useState<number>(5);

  // Get unique weeks from decisions
  const availableWeeks = useMemo(() => {
    const weeks = new Set(decisions.map(d => d.week));
    return Array.from(weeks).sort((a, b) => a - b);
  }, [decisions]);

  // Filter decisions by selected week and payoff threshold
  const filteredDecisions = useMemo(() => {
    let filtered = decisions;

    if (selectedWeek !== 'all') {
      filtered = filtered.filter(d => d.week === parseInt(selectedWeek));
    }

    // Apply minimum payoff threshold
    filtered = filtered.filter(d => (d.actualOutcome || 0) >= minPayoffThreshold);

    return filtered;
  }, [decisions, selectedWeek, minPayoffThreshold]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Best Risky Decisions (Bold Moves That Paid Off) • {filteredDecisions.length} decisions
        </h3>
        <div className="flex gap-2">
          <Select
            value={minPayoffThreshold.toString()}
            onValueChange={v => setMinPayoffThreshold(Number(v))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All (≥0 pts)</SelectItem>
              <SelectItem value="3">≥3 payoff</SelectItem>
              <SelectItem value="5">≥5 payoff</SelectItem>
              <SelectItem value="10">≥10 payoff</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Weeks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Weeks</SelectItem>
              {availableWeeks.map(week => (
                <SelectItem key={week} value={week.toString()}>
                  Week {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredDecisions.map((decision, index) => {
          const league = decision.leagueId.includes('44209') ? 'AFC' : 'NFC';
          const selectedName = getPlayerName(decision.selectedPlayer.playerId, players);

          return (
            <Card
              key={`${decision.managerId}-${decision.week}-${decision.position}`}
              className="p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium">
                    {decision.managerName} ({league})
                  </div>
                  <div className="text-sm text-gray-500">
                    Week {decision.week} •{' '}
                    <PositionBadge position={decision.position} weight={decision.weight} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600 text-lg">
                    +{decision.actualOutcome?.toFixed(1)} pts
                  </div>
                  <div className="text-xs text-gray-500">Risky Payoff</div>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded">
                <div className="font-medium text-green-800">Risky Pick: {selectedName}</div>
                <div className="text-sm">
                  Projected: {decision.selectedPlayer.projectedPoints.toFixed(1)} | Actual:{' '}
                  {decision.selectedPlayer.actualPoints.toFixed(1)}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="text-xs text-gray-500 mb-2">
                  Higher projected alternatives they passed on:
                </div>
                <div className="space-y-1">
                  {decision.alternatives?.slice(0, 5).map(alt => {
                    const altName = getPlayerName(alt.playerId, players);
                    const projDiff = alt.projectedPoints - decision.selectedPlayer.projectedPoints;
                    // Use adjusted actual points for comparison (accounts for waiver penalty)
                    const actualDiff =
                      decision.selectedPlayer.actualPoints - alt.adjustedActualPoints;
                    const isWaiver = alt.source === 'waiver';
                    return (
                      <div
                        key={alt.playerId}
                        className="flex items-center justify-between text-xs bg-white p-2 rounded"
                      >
                        <div className="flex-1">
                          <span className="font-medium">{altName}</span>
                          <span className="text-gray-500 ml-2">({alt.source})</span>
                        </div>
                        <div className="flex gap-4 text-right items-center">
                          <div>
                            <div className="text-xs text-gray-500">Proj</div>
                            <div className="font-medium text-orange-600">
                              {alt.projectedPoints.toFixed(1)}
                              <span className="text-xs text-gray-500 ml-1">
                                (+{projDiff.toFixed(1)})
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Actual</div>
                            <div className="font-medium text-gray-900">
                              {isWaiver ? (
                                <span>
                                  {alt.adjustedActualPoints.toFixed(1)}*
                                  <span className="text-xs text-gray-400 ml-1">
                                    ({alt.actualPoints.toFixed(1)})
                                  </span>
                                </span>
                              ) : (
                                <span>{alt.actualPoints.toFixed(1)}</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Beat by</div>
                            <div className="text-green-600 font-medium">
                              +{actualDiff.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {decision.alternatives?.some(alt => alt.source === 'waiver') && (
                  <div className="text-xs text-gray-500 mt-2">
                    * Waiver points adjusted with 35% pickup penalty
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const RosterContextView = ({
  rosterContext,
  players,
}: {
  rosterContext: RosterContext[];
  players: Record<string, any>;
}) => {
  const [selectedManager, setSelectedManager] = useState<string>('all');
  const [expandedAlternatives, setExpandedAlternatives] = useState<Set<string>>(new Set());

  const filteredContext = rosterContext.filter(
    context => selectedManager === 'all' || context.managerName === selectedManager,
  );

  const managers = Array.from(new Set(rosterContext.map(c => c.managerName))).sort();

  const toggleExpanded = (contextKey: string) => {
    const newExpanded = new Set(expandedAlternatives);
    if (newExpanded.has(contextKey)) {
      newExpanded.delete(contextKey);
    } else {
      newExpanded.add(contextKey);
    }
    setExpandedAlternatives(newExpanded);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team Context - Start/Sit Decisions</h3>
        <Select value={selectedManager} onValueChange={setSelectedManager}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Managers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Managers</SelectItem>
            {managers.map(manager => (
              <SelectItem key={manager} value={manager}>
                {manager}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredContext.map(context => {
          const league = context.leagueId.includes('44209') ? 'AFC' : 'NFC';

          // Calculate total points lost for this week
          const totalPointsLost = context.decisions.reduce(
            (sum: number, decision: any) => sum + Math.max(0, decision.pointsLeft),
            0,
          );

          const correctDecisions = context.decisions.filter((d: any) => d.decisionCorrect).length;

          return (
            <Card key={`${context.managerId}-${context.week}`} className="p-3">
              <div className="flex items-center justify-between mb-3 pb-2 border-b">
                <div className="flex items-center gap-4">
                  <h4 className="font-semibold text-lg">{context.managerName}</h4>
                  <div className="text-sm text-gray-600">
                    {league} • Week {context.week}
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">{correctDecisions}</span>
                    <span className="text-gray-400">/{context.decisions.length}</span> correct
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Points Lost</div>
                  <div className="font-bold text-red-600">{totalPointsLost.toFixed(1)}</div>
                </div>
              </div>

              {/* Compact table format */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left border-b text-gray-600">
                      <th className="pb-1 font-medium">Position</th>
                      <th className="pb-1 font-medium">Started</th>
                      <th className="pb-1 font-medium text-center">Proj</th>
                      <th className="pb-1 font-medium text-center">Actual</th>
                      <th className="pb-1 font-medium text-center">Status</th>
                      <th className="pb-1 font-medium">Best Alternative</th>
                      <th className="pb-1 font-medium text-center">Alt Proj</th>
                      <th className="pb-1 font-medium text-center">Alt Actual</th>
                      <th className="pb-1 font-medium text-center">Lost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {context.decisions.map((decision: any, idx: number) => {
                      const bestAlt = decision.optimalPlayer;
                      const isCorrect = decision.decisionCorrect;
                      const pointsLost = Math.max(0, decision.pointsLeft);

                      return (
                        <tr key={idx} className={`${isCorrect ? '' : 'bg-red-50'}`}>
                          <td className="py-1 font-medium text-gray-900">{decision.position}</td>
                          <td className="py-1 text-gray-800">
                            {getPlayerName(decision.selectedPlayer.playerId, players)}
                          </td>
                          <td className="py-1 text-center text-gray-600">
                            {decision.selectedPlayer.projectedPoints.toFixed(1)}
                          </td>
                          <td className="py-1 text-center font-medium">
                            {decision.selectedPlayer.actualPoints.toFixed(1)}
                          </td>
                          <td className="py-1 text-center">
                            {isCorrect ? (
                              <span className="text-green-600 font-medium">✓</span>
                            ) : (
                              <span className="text-red-600 font-medium">✗</span>
                            )}
                          </td>
                          <td className="py-1">
                            {isCorrect ? (
                              <span className="text-gray-500 italic">Same player</span>
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-gray-800">
                                  {getPlayerName(bestAlt.playerId, players)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {bestAlt.source === 'bench'
                                    ? '(bench)'
                                    : bestAlt.source === 'waiver'
                                      ? '(waiver*)'
                                      : ''}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-1 text-center text-gray-600">
                            {isCorrect ? (
                              <span className="text-gray-400">-</span>
                            ) : (
                              bestAlt.projectedPoints.toFixed(1)
                            )}
                          </td>
                          <td className="py-1 text-center font-medium">
                            {isCorrect ? (
                              <span className="text-gray-400">-</span>
                            ) : bestAlt.source === 'waiver' ? (
                              <div className="flex flex-col">
                                <span>{bestAlt.adjustedActualPoints.toFixed(1)}*</span>
                                <span className="text-xs text-gray-400">
                                  ({bestAlt.actualPoints.toFixed(1)})
                                </span>
                              </div>
                            ) : (
                              bestAlt.actualPoints.toFixed(1)
                            )}
                          </td>
                          <td className="py-1 text-center">
                            {pointsLost > 0 ? (
                              <span className="text-red-600 font-medium">
                                {pointsLost.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Other alternatives section - expandable */}
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-gray-600">
                    Other Available Alternatives:
                  </div>
                  <button
                    onClick={() => toggleExpanded(`${context.managerId}-${context.week}`)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {expandedAlternatives.has(`${context.managerId}-${context.week}`)
                      ? '▼ Collapse'
                      : '▶ Show All'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Bench players */}
                  <div>
                    <div className="font-medium text-blue-600 mb-1">
                      Bench ({context.benchPlayers.length})
                    </div>
                    <div className="space-y-1">
                      {(expandedAlternatives.has(`${context.managerId}-${context.week}`)
                        ? context.benchPlayers
                        : context.benchPlayers.slice(0, 6)
                      ).map((bench: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-gray-700">
                          <span className="truncate pr-2">
                            {getPlayerName(bench.player.playerId, players)}
                          </span>
                          <span className="font-medium">{bench.pointsScored.toFixed(1)}</span>
                        </div>
                      ))}
                      {!expandedAlternatives.has(`${context.managerId}-${context.week}`) &&
                        context.benchPlayers.length > 6 && (
                          <div className="text-gray-400 italic">
                            +{context.benchPlayers.length - 6} more
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Waiver options */}
                  <div>
                    <div className="font-medium text-orange-600 mb-1">
                      Waiver Wire ({context.waiverAlternatives.length})
                    </div>
                    <div className="space-y-1">
                      {(expandedAlternatives.has(`${context.managerId}-${context.week}`)
                        ? context.waiverAlternatives
                        : context.waiverAlternatives.slice(0, 6)
                      ).map((waiver: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-gray-700">
                          <span className="truncate pr-2">
                            {getPlayerName(waiver.player.playerId, players)}
                          </span>
                          <span className="font-medium">{waiver.adjustedPoints.toFixed(1)}*</span>
                        </div>
                      ))}
                      {!expandedAlternatives.has(`${context.managerId}-${context.week}`) &&
                        context.waiverAlternatives.length > 6 && (
                          <div className="text-gray-400 italic">
                            +{context.waiverAlternatives.length - 6} more
                          </div>
                        )}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  * Waiver points adjusted with 35% pickup penalty
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export const StartSitEfficiency = ({ data }: { data: StartSitData }) => {
  const [selectedManagerId, setSelectedManagerId] = useState<string>(
    data.managerEfficiencies[0]?.managerId || '',
  );

  const selectedManager = data.managerEfficiencies.find(m => m.managerId === selectedManagerId);

  // Collect all unique player IDs from the data
  const allPlayerIds = useMemo(() => {
    const playerIds = new Set<string>();

    // From worst decisions
    data.worstDecisions?.forEach(decision => {
      playerIds.add(decision.selectedPlayer.playerId);
      playerIds.add(decision.optimalPlayer.playerId);
      decision.alternatives?.forEach(alt => playerIds.add(alt.playerId));
    });

    // From best risky decisions
    data.bestRiskyDecisions?.forEach(decision => {
      playerIds.add(decision.selectedPlayer.playerId);
      playerIds.add(decision.optimalPlayer.playerId);
      decision.alternatives?.forEach(alt => playerIds.add(alt.playerId));
    });

    // From roster context
    data.rosterContext?.forEach(context => {
      context.startingLineup?.forEach(starter => playerIds.add(starter.player.playerId));
      context.benchPlayers?.forEach(bench => playerIds.add(bench.player.playerId));
      context.waiverAlternatives?.forEach(waiver => playerIds.add(waiver.player.playerId));
    });

    return Array.from(playerIds);
  }, [data]);

  // Fetch all player names at once
  const { data: playersData, isLoading: playersLoading } = usePlayers(allPlayerIds);
  const players = playersData?.players || {};

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Start/Sit Efficiency Analysis</h1>
        <p className="text-gray-600">
          Skill-weighted decision making analysis across {data.leagueStats.totalDecisions} decisions
        </p>
      </div>

      <Tabs defaultValue="overall" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overall">Overall Scores</TabsTrigger>
          <TabsTrigger value="positions">Position Breakdown</TabsTrigger>
          <TabsTrigger value="roster-context">Team Context</TabsTrigger>
          <TabsTrigger value="worst">Worst Decisions</TabsTrigger>
          <TabsTrigger value="best">Best Risky Plays</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manager Rankings (Weighted by Position Skill)</CardTitle>
            </CardHeader>
            <CardContent>
              <OverallScores managers={data.managerEfficiencies} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <PositionBreakdownTable
                managers={data.managerEfficiencies}
                selectedManagerId={selectedManagerId}
                setSelectedManagerId={setSelectedManagerId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roster-context" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              {playersLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading roster context...</span>
                </div>
              ) : (
                <RosterContextView rosterContext={data.rosterContext || []} players={players} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="worst" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              {playersLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading player names...</span>
                </div>
              ) : (
                <WorstDecisions decisions={data.worstDecisions} players={players} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="best" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              {playersLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading player names...</span>
                </div>
              ) : (
                <BestRiskyDecisions decisions={data.bestRiskyDecisions} players={players} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
