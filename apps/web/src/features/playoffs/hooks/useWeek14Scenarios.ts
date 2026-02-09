/**
 * useWeek14Scenarios Hook
 *
 * State management hook for the scenario builder.
 * Allows users to lock specific matchup outcomes and see updated probabilities.
 */

import { useCallback, useMemo, useState } from 'react';
import type { LockedOutcome, ScenarioBuilderState, Week14Matchup } from '../types';

/**
 * Hook for managing scenario builder state
 */
export const useWeek14Scenarios = (matchups: readonly Week14Matchup[]) => {
  const [lockedOutcomes, setLockedOutcomes] = useState<Record<number, LockedOutcome>>({});
  const [isSimulating, setIsSimulating] = useState(false);

  /**
   * Lock a matchup outcome to a specific winner
   */
  const lockOutcome = useCallback((matchupId: number, winner: 'team1' | 'team2' | null) => {
    setLockedOutcomes(prev => ({
      ...prev,
      [matchupId]: { matchupId, winner },
    }));
  }, []);

  /**
   * Toggle a matchup outcome (cycles through team1 -> team2 -> null)
   */
  const toggleOutcome = useCallback((matchupId: number) => {
    setLockedOutcomes(prev => {
      const current = prev[matchupId]?.winner;
      let nextWinner: 'team1' | 'team2' | null;

      if (current === null || current === undefined) {
        nextWinner = 'team1';
      } else if (current === 'team1') {
        nextWinner = 'team2';
      } else {
        nextWinner = null;
      }

      return {
        ...prev,
        [matchupId]: { matchupId, winner: nextWinner },
      };
    });
  }, []);

  /**
   * Reset all locked outcomes
   */
  const resetAllOutcomes = useCallback(() => {
    setLockedOutcomes({});
  }, []);

  /**
   * Get the locked outcome for a specific matchup
   */
  const getLockedOutcome = useCallback(
    (matchupId: number): 'team1' | 'team2' | null => {
      return lockedOutcomes[matchupId]?.winner ?? null;
    },
    [lockedOutcomes],
  );

  /**
   * Check if any outcomes are locked
   */
  const hasLockedOutcomes = useMemo(() => {
    return Object.values(lockedOutcomes).some(outcome => outcome.winner !== null);
  }, [lockedOutcomes]);

  /**
   * Get count of locked outcomes
   */
  const lockedCount = useMemo(() => {
    return Object.values(lockedOutcomes).filter(outcome => outcome.winner !== null).length;
  }, [lockedOutcomes]);

  /**
   * Convert locked outcomes to format expected by simulation
   */
  const getSimulationLockedOutcomes = useMemo((): Record<number, 'team1' | 'team2'> | undefined => {
    const locked: Record<number, 'team1' | 'team2'> = {};
    let hasAny = false;

    Object.entries(lockedOutcomes).forEach(([matchupId, outcome]) => {
      if (outcome.winner !== null) {
        locked[parseInt(matchupId)] = outcome.winner;
        hasAny = true;
      }
    });

    return hasAny ? locked : undefined;
  }, [lockedOutcomes]);

  /**
   * Get state object for the scenario builder
   */
  const state: ScenarioBuilderState = useMemo(
    () => ({
      lockedOutcomes,
      isSimulating,
    }),
    [lockedOutcomes, isSimulating],
  );

  /**
   * Get matchup display info with locked status
   */
  const getMatchupDisplay = useCallback(
    (matchup: Week14Matchup) => {
      const locked = getLockedOutcome(matchup.matchupId);
      return {
        ...matchup,
        lockedWinner: locked,
        team1Locked: locked === 'team1',
        team2Locked: locked === 'team2',
        isLocked: locked !== null,
      };
    },
    [getLockedOutcome],
  );

  return {
    // State
    lockedOutcomes,
    isSimulating,
    hasLockedOutcomes,
    lockedCount,
    state,

    // Actions
    lockOutcome,
    toggleOutcome,
    resetAllOutcomes,
    setIsSimulating,

    // Getters
    getLockedOutcome,
    getSimulationLockedOutcomes,
    getMatchupDisplay,
  };
};

/**
 * Get label for locked outcome
 */
export const getOutcomeLabel = (
  matchup: Week14Matchup,
  locked: 'team1' | 'team2' | null,
): string => {
  if (locked === null) return 'Simulate';
  if (locked === 'team1') return `${matchup.team1Name} wins`;
  return `${matchup.team2Name} wins`;
};

/**
 * Get button variant for outcome selector
 */
export const getOutcomeButtonVariant = (
  isSelected: boolean,
): 'default' | 'outline' | 'secondary' => {
  return isSelected ? 'default' : 'outline';
};
