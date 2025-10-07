import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { generateManagerAnalytics } from '@/lib/manager-analytics';
import type { ManagerAnalytics } from '../types';
import type { MockDraft } from '@/lib/mock-draft-data';

export interface DraftAnalyticsOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export type DraftAnalyticsResult = UseQueryResult<ManagerAnalytics, Error> & {
  analytics: ManagerAnalytics | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Custom hook for fetching and processing draft analytics data
 *
 * @param draft1 - First draft (AFC League)
 * @param draft2 - Second draft (NFC League)
 * @param options - React Query options (enabled, staleTime, gcTime)
 * @returns Draft analytics with loading/error states
 *
 * @example
 * ```typescript
 * const { analytics, isLoading, isError, error } = useDraftAnalytics(afcDraft, nfcDraft);
 *
 * if (isLoading) return <LoadingSkeleton />;
 * if (isError) return <ErrorMessage error={error} />;
 * if (!analytics) return null;
 *
 * return <ManagerAnalysis analytics={analytics} />;
 * ```
 */
export const useDraftAnalytics = (
  draft1: MockDraft | undefined,
  draft2: MockDraft | undefined,
  options: DraftAnalyticsOptions = {},
): DraftAnalyticsResult => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes (draft data changes infrequently)
    gcTime = 30 * 60 * 1000, // 30 minutes
  } = options;

  const queryResult = useQuery<ManagerAnalytics, Error>({
    queryKey: ['draftAnalytics', draft1?.name, draft2?.name],
    queryFn: (): ManagerAnalytics => {
      if (!draft1 || !draft2) {
        throw new Error('Both drafts are required for analytics generation');
      }
      return generateManagerAnalytics(draft1, draft2);
    },
    enabled: enabled && !!draft1 && !!draft2,
    staleTime,
    gcTime,
    refetchOnWindowFocus: false, // Draft data doesn't change when window regains focus
    retry: 1, // Retry once on failure (calculation errors are usually not transient)
  });

  return {
    ...queryResult,
    analytics: queryResult.data,
  } as DraftAnalyticsResult;
};
