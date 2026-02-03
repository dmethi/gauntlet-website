/**
 * usePlayoffSeeding Hook
 *
 * React Query hook for fetching and caching playoff seeding simulation results.
 * Runs Monte Carlo simulations to calculate probability of each seed for each team.
 */

import { useQuery } from '@tanstack/react-query';
import { runBothLeagueSimulations } from '../simulations';
import type { LeagueSeedingResults, SeedingSimulationConfig, PathCondition } from '../types';
import { CACHE_DURATIONS } from '@/lib/constants';

/**
 * Query key for playoff seeding data
 */
const SEEDING_QUERY_KEY = 'playoff-seeding';

/**
 * Default configuration for seeding simulation
 * Uses fewer iterations for faster UI response, can be increased for more accuracy
 */
const DEFAULT_CONFIG: SeedingSimulationConfig = {
  iterations: 10000, // Reduced from 100k for faster initial load
};

/**
 * Hook to fetch and cache playoff seeding probabilities for both leagues
 */
export const usePlayoffSeeding = (
  throughWeek: number = 13,
  config: SeedingSimulationConfig = DEFAULT_CONFIG,
) => {
  return useQuery({
    queryKey: [SEEDING_QUERY_KEY, throughWeek, config.iterations, config.lockedOutcomes],
    queryFn: async (): Promise<{
      afc: LeagueSeedingResults;
      nfc: LeagueSeedingResults;
    }> => {
      return runBothLeagueSimulations(throughWeek, config);
    },
    staleTime: CACHE_DURATIONS.FOUR_HOURS, // Results change rarely during week
    gcTime: CACHE_DURATIONS.ONE_DAY,
    refetchOnWindowFocus: false, // Don't refetch on focus (expensive simulation)
    retry: 2,
  });
};

/**
 * Hook to fetch seeding probabilities with scenario builder support
 * Allows locking specific matchup outcomes and recalculating probabilities
 */
export const usePlayoffSeedingWithScenarios = (
  throughWeek: number = 13,
  lockedOutcomes?: Record<number, 'team1' | 'team2'>,
) => {
  const config: SeedingSimulationConfig = {
    iterations: lockedOutcomes ? 5000 : 10000, // Fewer iterations when recalculating scenarios
    lockedOutcomes,
  };

  return useQuery({
    queryKey: [
      SEEDING_QUERY_KEY,
      'scenarios',
      throughWeek,
      config.iterations,
      JSON.stringify(lockedOutcomes),
    ],
    queryFn: async () => {
      return runBothLeagueSimulations(throughWeek, config);
    },
    staleTime: lockedOutcomes
      ? 0 // Always recalculate when outcomes are locked
      : CACHE_DURATIONS.FOUR_HOURS,
    gcTime: CACHE_DURATIONS.ONE_HOUR,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

/**
 * Format seed probability for display
 */
export const formatSeedProbability = (probability: number): string => {
  if (probability === 0) return '0%';
  if (probability === 1) return '100%';
  if (probability < 0.01) return '<1%';
  if (probability > 0.99) return '>99%';
  return `${Math.round(probability * 100)}%`;
};

/**
 * Get color class for seed probability bar
 */
export const getSeedProbabilityColor = (seed: number): string => {
  if (seed === 1) return 'bg-gauntlet-gold';
  if (seed <= 3) return 'bg-green-500';
  if (seed <= 6) return 'bg-blue-500';
  return 'bg-muted-foreground/30';
};

/**
 * Format scenario conditions as readable text
 */
export const formatScenarioConditions = (
  conditions: readonly {
    type: string;
    teamName: string;
    rosterId?: number;
    marginRequired?: number;
  }[],
): string => {
  if (conditions.length === 0) return 'Any outcome results in this seed';

  const parts: string[] = [];

  // Find own result first
  const ownResult = conditions.find(c => c.type === 'win' || c.type === 'lose');
  if (ownResult) {
    parts.push(ownResult.type === 'win' ? 'WIN' : 'LOSE');
  }

  // Then add other team outcomes
  conditions.forEach(condition => {
    switch (condition.type) {
      case 'other_team_wins':
        parts.push(`${condition.teamName} wins`);
        break;
      case 'other_team_loses':
        parts.push(`${condition.teamName} loses`);
        break;
      case 'points_margin':
        if (condition.marginRequired) {
          if (condition.marginRequired > 0) {
            parts.push(`outscore ${condition.teamName} by ${condition.marginRequired}+ pts`);
          } else {
            // Negative margin = be outscored by this team
            parts.push(`be outscored by ${condition.teamName}`);
          }
        }
        break;
    }
  });

  return parts.length > 0 ? parts.join(' + ') : 'Any outcome results in this seed';
};

/**
 * Format path conditions as readable text
 * For the new deterministic paths
 */
export const formatPathConditions = (conditions: readonly PathCondition[]): string => {
  if (conditions.length === 0) return 'Any outcome results in this seed';

  const parts: string[] = [];

  // Find own result first (win/lose)
  const ownResult = conditions.find(c => c.type === 'win' || c.type === 'lose');
  if (ownResult) {
    const result = ownResult.type === 'win' ? 'WIN' : 'LOSE';
    if (ownResult.opponentName) {
      parts.push(`${result} vs ${ownResult.opponentName}`);
    } else {
      parts.push(result);
    }
  }

  // Then add other team outcomes
  conditions.forEach(condition => {
    switch (condition.type) {
      case 'other_result':
        if (condition.wins !== undefined) {
          const action = condition.wins ? 'wins' : 'loses';
          if (condition.opponentName) {
            parts.push(`${condition.teamName} ${action} vs ${condition.opponentName}`);
          } else {
            parts.push(`${condition.teamName} ${action}`);
          }
        }
        break;
      case 'points_margin':
        if (condition.marginRequired !== undefined) {
          if (condition.marginRequired > 0) {
            parts.push(
              `outscore ${condition.vsTeamName || condition.teamName} by ${condition.marginRequired}+ pts`,
            );
          } else if (condition.marginRequired < 0) {
            // Negative margin = be outscored by this team
            parts.push(
              `be outscored by ${condition.vsTeamName || condition.teamName} by ${Math.abs(condition.marginRequired)}+ pts`,
            );
          }
        }
        break;
    }
  });

  return parts.length > 0 ? parts.join(' AND ') : 'Any outcome results in this seed';
};

/**
 * Format path count for display
 */
export const formatPathCount = (count: number): string => {
  if (count === 0) return 'No paths';
  if (count === 1) return '1 path';
  return `${count} paths`;
};
