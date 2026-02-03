/**
 * useScenarioSummary Hook
 *
 * Loads pre-generated AI summaries from static JSON file.
 * Summaries are generated once via scripts/generate-scenario-summaries.ts
 * and embedded in the build, not fetched dynamically.
 */

import { useQuery } from '@tanstack/react-query';
import type { LeagueSeedingResults } from '../types';

/**
 * Output type for scenario summaries
 */
export interface ScenarioSummaryOutput {
  readonly teamName?: string;
  readonly overallSummary: string;
  readonly seedSummaries: Record<number, string>;
  readonly generatedAt?: string;
}

/**
 * Static summaries file structure
 */
interface StaticSummariesFile {
  generatedAt: string;
  throughWeek: number;
  afc: {
    leagueId: string;
    leagueName: string;
    teams: Record<string, ScenarioSummaryOutput>;
  };
  nfc: {
    leagueId: string;
    leagueName: string;
    teams: Record<string, ScenarioSummaryOutput>;
  };
}

/**
 * Cache for loaded summaries
 */
let cachedSummaries: StaticSummariesFile | null = null;

/**
 * Load static summaries from JSON file
 */
const loadStaticSummaries = async (): Promise<StaticSummariesFile | null> => {
  if (cachedSummaries) {
    return cachedSummaries;
  }

  try {
    // Try to import the static JSON file
    const data = await import('@/data/scenario-summaries.json');
    cachedSummaries = data.default || data;
    return cachedSummaries;
  } catch {
    // File doesn't exist yet - that's okay
    console.warn(
      'Scenario summaries file not found. Run: npx tsx scripts/generate-scenario-summaries.ts',
    );
    return null;
  }
};

/**
 * Get summary for a specific team from static data
 */
const getTeamSummary = async (
  rosterId: number,
  leagueName: 'AFC' | 'NFC',
): Promise<ScenarioSummaryOutput | null> => {
  const summaries = await loadStaticSummaries();
  if (!summaries) return null;

  const leagueData = leagueName === 'AFC' ? summaries.afc : summaries.nfc;
  const teamSummary = leagueData?.teams?.[rosterId.toString()];

  return teamSummary || null;
};

/**
 * Hook to load pre-generated AI summary for a team
 * Uses static JSON data, not dynamic API calls
 */
export const useScenarioSummary = (
  rosterId: number | null,
  leagueName: 'AFC' | 'NFC' | null,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ['static-scenario-summary', rosterId, leagueName],
    queryFn: async () => {
      if (rosterId === null || !leagueName) {
        return null;
      }
      return getTeamSummary(rosterId, leagueName);
    },
    enabled: enabled && rosterId !== null && !!leagueName,
    staleTime: Infinity, // Static data never goes stale
    gcTime: Infinity,
  });
};

/**
 * Hook to load all summaries for a league
 */
export const useLeagueSummaries = (results: LeagueSeedingResults | null) => {
  return useQuery({
    queryKey: ['static-league-summaries', results?.leagueId],
    queryFn: async () => {
      if (!results) return null;

      const summaries = await loadStaticSummaries();
      if (!summaries) return null;

      const leagueData = results.leagueName === 'AFC' ? summaries.afc : summaries.nfc;
      return leagueData?.teams || null;
    },
    enabled: !!results,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

/**
 * Type for cached summaries
 */
export type CachedSummaries = Map<number, ScenarioSummaryOutput>;
