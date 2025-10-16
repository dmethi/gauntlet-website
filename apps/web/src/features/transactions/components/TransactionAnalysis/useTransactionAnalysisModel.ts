/**
 * Transaction Analysis Data Model Hook
 *
 * Custom hook that manages data loading, grading, and filtering for transaction analysis.
 */

import { useEffect, useState } from 'react';
import type { GradeTxn, TeamInfo } from '@/features/transactions/types';
import { CURRENT_LEAGUES } from '@/config/leagues';
import { buildFacts } from '@/features/transactions/utils';
import { computeTransactionGradesForStatsHub } from '@/app/stats/utils/computeTransactionGradesForStatsHub';
import { assignLetterGrades } from './utils';

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
          }
        } catch (error) {
          console.error('Failed to load team data:', error);
        }

        setTeamsMap(teamsData);
        setTeamsLoaded(true);
        const allTransactions: GradeTxn[] = [];

        // Process each league
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

            // Grade transactions
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
