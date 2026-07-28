/**
 * Transaction Analysis Data Model Hook
 *
 * Custom hook that manages data loading, grading, and filtering for transaction analysis.
 */

import { useEffect, useState } from 'react';
import type { GradeTxn, TeamInfo } from '@/features/transactions/types';
import { getLeaguesForSeason } from '@/config/leagues';
import { buildFacts } from '@/features/transactions/utils';
import { computeTransactionGradesForStatsHub } from '@/app/stats/utils/computeTransactionGradesForStatsHub';
import { assignLetterGrades } from './utils';
import { debugLog } from '@/lib/debug-log';

/**
 * Transaction analysis model state
 */
export interface TransactionAnalysisModel {
  allData: GradeTxn[];
  loading: boolean;
  loadingStep: string;
  teamsMap: Map<string, TeamInfo>;
  teamsLoaded: boolean;
  transactionsProcessed: boolean;
}

/**
 * Load and process transaction data with VORP calculations
 *
 * @param currentNflWeek - Current NFL week from stats dataset
 * @returns Transaction analysis model state
 *
 * @example
 * const model = useTransactionAnalysisModel(dataset.currentWeek);
 * if (model.loading) return <LoadingSpinner />;
 * return <TransactionTable data={model.allData} />;
 */
export const useTransactionAnalysisModel = (currentNflWeek: number): TransactionAnalysisModel => {
  const [allData, setAllData] = useState<GradeTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Initializing...');
  const [teamsMap, setTeamsMap] = useState<Map<string, TeamInfo>>(new Map());
  const [teamsLoaded, setTeamsLoaded] = useState(false);
  const [transactionsProcessed, setTransactionsProcessed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadTransactionData = async (): Promise<void> => {
      try {
        setLoading(true);
        setLoadingStep('Loading team information from both leagues...');

        // Load team information
        const teamsData = new Map<string, TeamInfo>();
        try {
          // Matches the hardcoded 2025 leagues this model fetches transactions from below.
          const teamsRes = await fetch('/api/league/teams?season=2025');
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

            debugLog(`[Team Loading] Loaded ${teams.length} teams total`);
          }
        } catch (error) {
          console.error('Failed to load team data:', error);
        }

        setTeamsMap(teamsData);
        setTeamsLoaded(true);

        // Only reachable via the 2025 archive stats page today — pin
        // explicitly rather than reading whatever CURRENT_LEAGUES becomes.
        const leagues = getLeaguesForSeason('2025');
        setLoadingStep(
          `Processing ${leagues.map(l => l.name).join(' & ')} transactions and calculating VORP...`,
        );

        // Each league's transactions/facts/grades are independent - process them
        // concurrently instead of one after another (this was the other half of
        // the tab's slow load, alongside the per-week fetch loop in buildFacts).
        const perLeagueResults = await Promise.all(
          leagues.map(async league => {
            try {
              // Fetch transactions
              const txnRes = await fetch(`/api/league/${league.id}/transactions`);
              if (!txnRes.ok) return [];
              const txnData = await txnRes.json();
              const transactions = txnData.data || [];

              // Build facts - dynamically use weeks 1 through current week
              const weeksToAnalyze = Array.from({ length: currentNflWeek }, (_, i) => i + 1);
              debugLog(`[Transaction Analysis] Analyzing weeks: ${weeksToAnalyze.join(', ')}`);
              const facts = await buildFacts(league.id, weeksToAnalyze);

              // Grade transactions
              return await computeTransactionGradesForStatsHub(
                transactions,
                facts,
                league.id,
                league.name,
                teamsData,
                currentNflWeek,
              );
            } catch (error) {
              console.error(`Failed to process ${league.name}:`, error);
              return [];
            }
          }),
        );

        if (cancelled) return;

        const allTransactions: GradeTxn[] = perLeagueResults.flat();

        // Assign letter grades
        setLoadingStep('Calculating final transaction grades...');
        const gradedWithLetters = assignLetterGrades(allTransactions);

        // Sort by score descending
        setLoadingStep('Finalizing transaction rankings...');
        gradedWithLetters.sort((a, b) => b.score - a.score);
        setAllData(gradedWithLetters);
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
  }, [currentNflWeek]);

  return {
    allData,
    loading,
    loadingStep,
    teamsMap,
    teamsLoaded,
    transactionsProcessed,
  };
};
