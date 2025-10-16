import { useMemo } from 'react';
import type {
  DecisionDetail,
  ManagerEfficiency,
  PositionBreakdown,
  StartSitData,
} from '@/features/start-sit/types';

export interface ManagerOption {
  value: string;
  label: string;
  leagueLabel: string;
}

export interface SummaryMetrics {
  averageWeightedScore: number;
  averagePointsImpact: number;
  totalDecisions: number;
  managerCount: number;
}

export interface OptimalLineupTotals {
  startedPoints: number;
  optimalPoints: number;
  efficiency: number;
}

export interface WeeklyEfficiency {
  week: number;
  startedPoints: number;
  optimalPoints: number;
  efficiency: number;
}

export interface PositionalEfficiency {
  position: string;
  metrics: PositionBreakdown;
}

export const calculateEfficiencyScore = (startedPoints: number, optimalPoints: number): number => {
  if (optimalPoints <= 0) return 100;
  if (startedPoints <= 0) return 0;
  return Math.min((startedPoints / optimalPoints) * 100, 100);
};

export const calculateMissedPoints = (decisions: DecisionDetail[]): number => {
  return decisions.reduce((sum, decision) => sum + Math.max(0, decision.pointsLeft || 0), 0);
};

export const calculateOptimalLineup = (decisions: DecisionDetail[]): OptimalLineupTotals => {
  const totals = decisions.reduce(
    (acc, decision) => {
      acc.startedPoints += decision.selectedPlayer.actualPoints;
      const optimalActual =
        (decision.optimalPlayer as any)?.adjustedActualPoints ??
        (decision.optimalPlayer as any)?.actualPoints ??
        decision.selectedPlayer.actualPoints;
      acc.optimalPoints += optimalActual;
      return acc;
    },
    { startedPoints: 0, optimalPoints: 0 },
  );

  return {
    startedPoints: totals.startedPoints,
    optimalPoints: totals.optimalPoints,
    efficiency: calculateEfficiencyScore(totals.startedPoints, totals.optimalPoints),
  };
};

export const calculatePositionalEfficiency = (
  manager: ManagerEfficiency,
): PositionalEfficiency[] => {
  return Object.entries(manager.positionBreakdown)
    .map(([position, metrics]) => ({ position, metrics }))
    .sort((a, b) => b.metrics.decisionRate - a.metrics.decisionRate);
};

export const calculateWeeklyEfficiency = (decisions: DecisionDetail[]): WeeklyEfficiency[] => {
  const weeks = new Map<number, { started: number; optimal: number }>();

  for (const decision of decisions) {
    const optimalActual =
      (decision.optimalPlayer as any)?.adjustedActualPoints ??
      (decision.optimalPlayer as any)?.actualPoints ??
      decision.selectedPlayer.actualPoints;
    const bucket = weeks.get(decision.week) || { started: 0, optimal: 0 };
    bucket.started += decision.selectedPlayer.actualPoints;
    bucket.optimal += optimalActual;
    weeks.set(decision.week, bucket);
  }

  return Array.from(weeks.entries())
    .map(([week, totals]) => ({
      week,
      startedPoints: totals.started,
      optimalPoints: totals.optimal,
      efficiency: calculateEfficiencyScore(totals.started, totals.optimal),
    }))
    .sort((a, b) => a.week - b.week);
};

export const calculateReplacementValue = (decision: DecisionDetail): number => {
  if (!decision.alternatives || decision.alternatives.length === 0) {
    return 0;
  }

  const bestAlternative = decision.alternatives.reduce(
    (best, current) => (current.adjustedActualPoints > best.adjustedActualPoints ? current : best),
    decision.alternatives[0],
  );

  return Math.max(0, bestAlternative.adjustedActualPoints - decision.selectedPlayer.actualPoints);
};

export const collectPlayerIds = (data: StartSitData): string[] => {
  const playerIds = new Set<string>();

  data.managerEfficiencies.forEach(manager => {
    manager.decisions.forEach(decision => {
      playerIds.add(decision.selectedPlayer.playerId);
      if (decision.optimalPlayer?.playerId) playerIds.add(decision.optimalPlayer.playerId);
    });
  });

  data.worstDecisions?.forEach(decision => {
    playerIds.add(decision.selectedPlayer.playerId);
    if (decision.optimalPlayer?.playerId) playerIds.add(decision.optimalPlayer.playerId);
    decision.alternatives?.forEach(alt => playerIds.add(alt.playerId));
  });

  data.bestRiskyDecisions?.forEach(decision => {
    playerIds.add(decision.selectedPlayer.playerId);
    if (decision.optimalPlayer?.playerId) playerIds.add(decision.optimalPlayer.playerId);
    decision.alternatives?.forEach(alt => playerIds.add(alt.playerId));
  });

  data.rosterContext?.forEach(context => {
    context.startingLineup?.forEach(starter => playerIds.add(starter.player.playerId));
    context.benchPlayers?.forEach(bench => playerIds.add(bench.player.playerId));
    context.waiverAlternatives?.forEach(waiver => playerIds.add(waiver.player.playerId));
  });

  return Array.from(playerIds.values());
};

export const getLeagueLabel = (leagueId: string): string => {
  if (!leagueId) return 'Unknown';
  return leagueId.includes('44209') ? 'AFC' : 'NFC';
};

export const buildManagerOptions = (managers: ManagerEfficiency[]): ManagerOption[] =>
  managers.map(manager => ({
    value: manager.managerId,
    label: manager.managerName,
    leagueLabel: getLeagueLabel(manager.leagueId),
  }));

export const calculateSummaryMetrics = (
  managers: ManagerEfficiency[],
  totalDecisions: number,
): SummaryMetrics => {
  if (managers.length === 0) {
    return {
      averageWeightedScore: 0,
      averagePointsImpact: 0,
      totalDecisions,
      managerCount: 0,
    };
  }

  const aggregate = managers.reduce(
    (acc, manager) => {
      acc.weighted += manager.weightedDecisionScore;
      acc.points += manager.pointsImpactScore;
      return acc;
    },
    { weighted: 0, points: 0 },
  );

  return {
    averageWeightedScore: aggregate.weighted / managers.length,
    averagePointsImpact: aggregate.points / managers.length,
    totalDecisions,
    managerCount: managers.length,
  };
};

export const getPlayerDisplayName = (playerId: string, players: Record<string, any>): string => {
  if (!playerId) return 'Unknown Player';
  const player = players[playerId];
  if (!player) return `Player ${playerId.slice(0, 8)}`;

  return (
    player.full_name ||
    player.fullName ||
    `${player.firstName || ''} ${player.lastName || ''}`.trim() ||
    player.name ||
    `Player ${playerId.slice(0, 8)}`
  );
};

export const useMemoizedPlayerLookup = (players: Record<string, any>) =>
  useMemo(() => players, [players]);
