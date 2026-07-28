'use client';

import { useEffect, useState } from 'react';
import { StartSitEfficiency } from '@/features/start-sit/components/StartSitEfficiency';
import { Card, CardContent } from '@/components/ui/card';
import { WarRoomLoader } from '@gauntlet/ui';
import { GauntletLogo } from '@/components/gauntlet-logo';
import type { StartSitData } from '@/features/start-sit/types';

const ErrorMessage = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <Card className="max-w-2xl mx-auto mt-8">
    <CardContent className="pt-6 text-center">
      <div className="text-destructive mb-4">
        <h3 className="text-lg font-semibold">Analysis Failed</h3>
        <p className="text-sm mt-2">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
      >
        Retry Analysis
      </button>
    </CardContent>
  </Card>
);

const LoadingContent = () => (
  <div className="space-y-6">
    <WarRoomLoader show logo={<GauntletLogo size="lg" />} />
    <Card className="max-w-md mx-auto text-xs text-muted-foreground">
      <CardContent className="pt-6">
        <strong>What we're analyzing:</strong>
        <br />
        • Your start/sit decisions across all positions
        <br />
        • Available alternatives (bench + waiver wire)
        <br />
        • Position-weighted skill assessment
        <br />• Points gained/lost vs league median
      </CardContent>
    </Card>
  </div>
);

export default function StartSitEfficiencyTab({
  prefetchedData,
  season,
}: {
  prefetchedData?: StartSitData | null;
  /** Non-default season (e.g. "2025" in the dev-only stats preview) to scope the analysis to. */
  season?: string;
}) {
  const [data, setData] = useState<StartSitData | null>(prefetchedData || null);
  const [loading, setLoading] = useState(!prefetchedData);
  const [error, setError] = useState<string | null>(null);

  const fetchUrl = season
    ? `/api/start-sit-efficiency?season=${season}`
    : '/api/start-sit-efficiency';

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch start/sit data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Force refresh data (for manual refresh button)
  const forceRefresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(fetchUrl, {
        method: 'POST', // POST forces fresh analysis
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      console.error('Failed to refresh start/sit data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have prefetched data
    if (!prefetchedData) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefetchedData, season]);

  if (loading) {
    return <LoadingContent />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchData} />;
  }

  if (!data) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">No Data Available</h2>
        <p className="text-muted-foreground mt-2">Unable to load start/sit efficiency data</p>
        <button
          onClick={fetchData}
          className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Start/Sit Efficiency Analysis</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Skill-weighted decision making analysis across {data.leagueStats.totalDecisions}{' '}
            decisions
            {data.timestamp && (
              <span className="text-xs text-muted-foreground/70 ml-2">
                • Updated {new Date(data.timestamp).toLocaleString()}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={forceRefresh}
          className="bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm hover:bg-primary/90 transition-colors"
          disabled={loading}
        >
          {loading ? '⟳' : '↻'} Refresh
        </button>
      </div>

      <StartSitEfficiency data={data} />
    </div>
  );
}
