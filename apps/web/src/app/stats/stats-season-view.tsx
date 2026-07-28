'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WarRoomLoader } from '@gauntlet/ui';
import { GauntletLogo } from '@/components/gauntlet-logo';
import { StatsContent } from '@/app/stats/stats-content';
import { type PlainStatsDataset } from '@/shared/utils/stats';
import { getLeaguesForSeason, type SeasonId } from '@/config/leagues';

interface StatsSeasonViewProps {
  season: SeasonId;
  searchParams: {
    team?: string;
    view?:
      | 'team'
      | 'league'
      | 'schedule'
      | 'trends'
      | 'scatter'
      | 'transactions'
      | 'start-sit'
      | 'waiver-analysis';
    week?: string;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  data: PlainStatsDataset;
  timestamp: number;
}

const fetchStatsData = async (
  season: SeasonId,
): Promise<PlainStatsDataset & { startSitEfficiency?: any }> => {
  const cacheKey = `stats-data-cache-${season}`;

  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp }: CachedData = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log('[Stats] Using cached data');
        return data;
      }
    }
  } catch (error) {
    console.warn('[Stats] Cache read error:', error);
  }

  console.log('[Stats] Fetching fresh data');
  const response = await fetch(`/api/stats?season=${season}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stats data');
  }

  const data = await response.json();

  try {
    const cacheData: CachedData = {
      data,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('[Stats] Cache write error:', error);
  }

  return data;
};

// Separate component for search params to avoid SSR issues
const StatsSeasonViewContent = ({ season, searchParams }: StatsSeasonViewProps) => {
  const [dataset, setDataset] = useState<PlainStatsDataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const urlSearchParams = useSearchParams();
  const clientSearchParams = {
    team: urlSearchParams.get('team') || searchParams.team,
    view:
      (urlSearchParams.get('view') as
        | 'team'
        | 'league'
        | 'schedule'
        | 'trends'
        | 'scatter'
        | 'transactions'
        | 'start-sit') || searchParams.view,
    week: urlSearchParams.get('week') || searchParams.week,
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchStatsData(season);

        if (isMounted) {
          setDataset(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading stats data:', err);
        if (isMounted) {
          setError('Failed to load stats data. Please try again.');
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [season]);

  return (
    <div className="flex-1 overflow-y-auto">
      <WarRoomLoader show={isLoading} logo={<GauntletLogo size="lg" />} />

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Stats Hub</h1>
          <p className="text-muted-foreground mt-2">
            Individual team analysis and weekly performance breakdowns
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
            <div className="flex items-center gap-2">
              <div className="text-destructive font-semibold">Error loading stats</div>
            </div>
            <p className="text-destructive/80 mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && dataset && (
          <StatsContent
            dataset={dataset}
            searchParams={clientSearchParams}
            leagues={getLeaguesForSeason(season)}
          />
        )}
      </div>
    </div>
  );
};

export const StatsSeasonView = ({ season, searchParams }: StatsSeasonViewProps) => (
  <Suspense fallback={<WarRoomLoader show logo={<GauntletLogo size="lg" />} />}>
    <StatsSeasonViewContent season={season} searchParams={searchParams} />
  </Suspense>
);
