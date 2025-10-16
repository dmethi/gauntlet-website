import { useEffect, useState } from 'react';
import type { MatchupOddsData } from '../types';

export interface UseMatchupOddsOptions {
  readonly leagueId: string;
  readonly week: number;
  readonly matchupId: number;
}

export interface UseMatchupOddsResult {
  readonly oddsData: MatchupOddsData | null;
  readonly loading: boolean;
  readonly error: string | null;
}

/**
 * Hook to fetch and manage matchup odds data
 *
 * @param options - Options containing leagueId, week, and matchupId
 * @returns Object containing oddsData, loading state, and error state
 *
 * @example
 * ```tsx
 * const { oddsData, loading, error } = useMatchupOdds({
 *   leagueId: '12345',
 *   week: 5,
 *   matchupId: 1
 * });
 * ```
 */
export const useMatchupOdds = (options: UseMatchupOddsOptions): UseMatchupOddsResult => {
  const { leagueId, week, matchupId } = options;
  const [oddsData, setOddsData] = useState<MatchupOddsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOdds = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/matchups/${leagueId}/${week}/${matchupId}/simulate`);

        if (!response.ok) {
          if (response.status === 404) {
            // No stored simulation yet for this matchup/week; show unavailable without error
            setOddsData(null);
            return;
          }
          throw new Error(`Failed to fetch odds`);
        }

        const data = await response.json();

        if (!data.success) {
          // Gracefully handle absence of simulation data
          setOddsData(null);
          return;
        }

        setOddsData(data.simulation);
      } catch (err) {
        setError('Failed to load odds');
        console.error('Odds preview error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOdds();
  }, [leagueId, week, matchupId]);

  return { oddsData, loading, error };
};
