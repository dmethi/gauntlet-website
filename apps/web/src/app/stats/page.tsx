'use client';

import { Suspense, useEffect, useState } from 'react';
import { StatsContent } from './stats-content';
import { type PlainStatsDataset } from '@/lib/stats/compose';
import { CURRENT_LEAGUES } from '@/config/leagues';
import { useSearchParams } from 'next/navigation';

interface StatsPageProps {
  searchParams: {
    team?: string;
    view?: 'team' | 'league' | 'schedule' | 'trends' | 'scatter' | 'transactions' | 'start-sit';
    week?: string;
  };
}

const CACHE_KEY = 'stats-data-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  data: PlainStatsDataset;
  timestamp: number;
}

async function fetchStatsData(): Promise<PlainStatsDataset & { startSitEfficiency?: any }> {
  // Check cache first
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
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
  const response = await fetch('/api/stats', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stats data');
  }

  const data = await response.json();

  // Cache the data
  try {
    const cacheData: CachedData = {
      data,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('[Stats] Cache write error:', error);
  }

  return data;
}

// Separate component for search params to avoid SSR issues
function StatsPageContent({ searchParams }: StatsPageProps) {
  const [dataset, setDataset] = useState<PlainStatsDataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Convert searchParams to an object for client-side use
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
    let progressInterval: NodeJS.Timeout;

    async function loadData() {
      try {
        setIsLoading(true);
        setLoadingProgress(0);
        setError(null);

        // Start progress animation
        progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev < 90) {
              return prev + Math.random() * 15;
            }
            return prev;
          });
        }, 200);

        const data = await fetchStatsData();

        if (isMounted) {
          setLoadingProgress(100);
          // Small delay to show completion
          setTimeout(() => {
            if (isMounted) {
              setDataset(data);
              setIsLoading(false);
            }
          }, 300);
        }
      } catch (err) {
        console.error('Error loading stats data:', err);
        if (isMounted) {
          setError('Failed to load stats data. Please try again.');
          setIsLoading(false);
        }
      } finally {
        if (progressInterval) {
          clearInterval(progressInterval);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, []);

  return (
    <div className='flex-1 overflow-y-auto'>
      <div className='container mx-auto p-6'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold tracking-tight'>Stats Hub</h1>
          <p className='text-muted-foreground mt-2'>
            Individual team analysis and weekly performance breakdowns
          </p>
        </div>

        {isLoading && <StatsPageSkeleton loadingProgress={loadingProgress} />}

        {error && (
          <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-6'>
            <div className='flex items-center gap-2'>
              <div className='text-destructive font-semibold'>Error loading stats</div>
            </div>
            <p className='text-destructive/80 mt-2'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors'
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && dataset && (
          <StatsContent
            dataset={dataset}
            searchParams={clientSearchParams}
            leagues={CURRENT_LEAGUES}
          />
        )}
      </div>
    </div>
  );
}

export default function StatsPage({ searchParams }: StatsPageProps) {
  return (
    <Suspense fallback={<StatsPageSkeleton loadingProgress={0} />}>
      <StatsPageContent searchParams={searchParams} />
    </Suspense>
  );
}

function StatsPageSkeleton({ loadingProgress }: { loadingProgress: number }) {
  return (
    <div className='space-y-6'>
      {/* Loading progress bar */}
      <div className='w-full bg-muted rounded-full h-2 mb-4'>
        <div
          className='bg-gradient-to-r from-gauntlet-crimson to-gauntlet-gold h-2 rounded-full transition-all duration-300 ease-out'
          style={{ width: `${loadingProgress}%` }}
        />
      </div>

      {/* Loading text */}
      <div className='text-center text-sm text-muted-foreground mb-6'>
        Loading stats data... {Math.round(loadingProgress)}%
      </div>
      {/* Tabs skeleton */}
      <div className='flex space-x-1 rounded-md bg-muted p-1'>
        <div className='h-9 w-24 bg-muted-foreground/20 animate-pulse rounded-sm' />
        <div className='h-9 w-24 bg-muted-foreground/20 animate-pulse rounded-sm' />
        <div className='h-9 w-32 bg-muted-foreground/20 animate-pulse rounded-sm' />
        <div className='h-9 w-28 bg-muted-foreground/20 animate-pulse rounded-sm' />
        <div className='h-9 w-28 bg-muted-foreground/20 animate-pulse rounded-sm' />
      </div>

      {/* Main content card */}
      <div className='rounded-lg border bg-card'>
        <div className='p-6'>
          {/* Card header */}
          <div className='space-y-2 mb-6'>
            <div className='h-6 w-32 bg-muted animate-pulse rounded' />
            <div className='h-4 w-80 bg-muted animate-pulse rounded' />
          </div>

          {/* Team selector */}
          <div className='flex items-center gap-3 mb-6'>
            <div className='h-4 w-20 bg-muted animate-pulse rounded' />
            <div className='h-10 w-80 bg-muted animate-pulse rounded' />
          </div>

          {/* Tables skeleton */}
          <div className='space-y-6'>
            {/* Season Summary table */}
            <div className='space-y-3'>
              <div className='h-5 w-40 bg-muted animate-pulse rounded' />
              <div className='rounded-md border'>
                <div className='h-12 bg-muted/50 animate-pulse rounded-t-md' />
                <div className='space-y-px'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className='h-12 bg-muted/20 animate-pulse' />
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Breakdown table */}
            <div className='space-y-3'>
              <div className='h-5 w-36 bg-muted animate-pulse rounded' />
              <div className='rounded-md border'>
                <div className='h-12 bg-muted/50 animate-pulse rounded-t-md' />
                <div className='space-y-px'>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className='h-12 bg-muted/20 animate-pulse' />
                  ))}
                </div>
              </div>
            </div>

            {/* Positional Advantages table */}
            <div className='space-y-3'>
              <div className='h-5 w-56 bg-muted animate-pulse rounded' />
              <div className='rounded-md border'>
                <div className='h-12 bg-muted/50 animate-pulse rounded-t-md' />
                <div className='space-y-px'>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className='h-12 bg-muted/20 animate-pulse' />
                  ))}
                </div>
              </div>
            </div>

            {/* Position breakdowns */}
            <div className='space-y-4'>
              <div className='h-5 w-44 bg-muted animate-pulse rounded' />
              <div className='space-y-4'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className='rounded-md border'>
                    <div className='h-12 bg-muted/50 animate-pulse' />
                    <div className='p-4 space-y-4'>
                      <div className='rounded-md border'>
                        <div className='h-8 bg-muted/30 animate-pulse rounded-t-md' />
                        <div className='space-y-px'>
                          {Array.from({ length: 3 }).map((_, j) => (
                            <div key={j} className='h-8 bg-muted/10 animate-pulse' />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
