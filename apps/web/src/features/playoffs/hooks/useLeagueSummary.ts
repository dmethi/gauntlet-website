/**
 * useLeagueSummary Hook
 *
 * Loads pre-generated league-level summaries from static JSON.
 * Summaries include playoff race, seeding battles, and toilet bowl info.
 */

import { useQuery } from '@tanstack/react-query';

export interface LeagueSummary {
  readonly leagueName: string;
  readonly generatedAt: string;
  readonly overallSummary: string;
  readonly playoffRace: string;
  readonly seedingBattles: string;
  readonly toiletBowl: string;
  readonly keyMatchups: string[];
}

export interface TeamPathData {
  readonly teamName: string;
  readonly rosterId: number;
  readonly record: string;
  readonly points: number;
  readonly division: number;
  readonly bestSeed: number;
  readonly worstSeed: number;
  readonly seedProbabilities: Record<number, number>;
  readonly playoffOdds: number;
  readonly opponent: string;
}

interface LeagueSummaryFile {
  generatedAt: string;
  throughWeek: number;
  afc: {
    summary: LeagueSummary;
    teams: Record<string, TeamPathData>;
  };
  nfc: {
    summary: LeagueSummary;
    teams: Record<string, TeamPathData>;
  };
}

let cachedData: LeagueSummaryFile | null = null;

const loadLeagueSummaries = async (): Promise<LeagueSummaryFile | null> => {
  if (cachedData) return cachedData;

  try {
    const data = await import('@/data/league-summaries.json');
    cachedData = data.default || data;
    return cachedData;
  } catch {
    console.warn(
      'League summaries file not found. Run: npx tsx scripts/generate-league-summaries.ts',
    );
    return null;
  }
};

/**
 * Hook to load league summary and team path data
 */
export const useLeagueSummary = (leagueName: string | null) => {
  return useQuery({
    queryKey: ['league-summary', leagueName],
    queryFn: async () => {
      if (!leagueName) return null;

      const data = await loadLeagueSummaries();
      if (!data) return null;

      // `league-summaries.json` (generate-league-summaries.ts) is shaped
      // {afc, nfc} — a 3rd league resolves to `data.nfc` here, which is wrong,
      // not just untyped. Flagged for the Phase 2 N-league migration.
      const leagueData = leagueName === 'AFC' ? data.afc : data.nfc;
      return {
        summary: leagueData.summary,
        teams: leagueData.teams,
        generatedAt: data.generatedAt,
        throughWeek: data.throughWeek,
      };
    },
    enabled: !!leagueName,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
