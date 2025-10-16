'use client';

import { useEffect, useState } from 'react';
import { StartSitEfficiency } from '@/features/start-sit/components/StartSitEfficiency';
import { Card, CardContent } from '@/components/ui/card';
import type { StartSitData } from '@/features/start-sit/types';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    <span>Analyzing start/sit decisions...</span>
  </div>
);

const ErrorMessage = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <Card className="max-w-2xl mx-auto mt-8">
    <CardContent className="pt-6 text-center">
      <div className="text-red-600 mb-4">
        <h3 className="text-lg font-semibold">Analysis Failed</h3>
        <p className="text-sm mt-2">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Retry Analysis
      </button>
    </CardContent>
  </Card>
);

const LoadingContent = () => (
  <div className="space-y-6">
    <div className="text-center space-y-4">
      <LoadingSpinner />

      <div className="text-sm text-gray-600 space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <span>Fetching roster and matchup data...</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse animation-delay-200"></div>
          <span>Calculating projections vs actual performance...</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse animation-delay-400"></div>
          <span>Analyzing alternative player options...</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse animation-delay-600"></div>
          <span>Computing weighted efficiency scores...</span>
        </div>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded max-w-md mx-auto">
        <strong>What we're analyzing:</strong>
        <br />
        • Your start/sit decisions across all positions
        <br />
        • Available alternatives (bench + waiver wire)
        <br />
        • Position-weighted skill assessment
        <br />• Points gained/lost vs league median
      </div>

      <p className="text-sm text-gray-500">This usually takes 15-30 seconds...</p>
    </div>
  </div>
);

export default function StartSitEfficiencyTab({
  prefetchedData,
}: {
  prefetchedData?: StartSitData | null;
}) {
  const [data, setData] = useState<StartSitData | null>(prefetchedData || null);
  const [loading, setLoading] = useState(!prefetchedData);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/start-sit-efficiency', {
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
      const response = await fetch('/api/start-sit-efficiency', {
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
  }, [prefetchedData]);

  if (loading) {
    return <LoadingContent />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchData} />;
  }

  if (!data) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">No Data Available</h2>
        <p className="text-gray-600 mt-2">Unable to load start/sit efficiency data</p>
        <button
          onClick={fetchData}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
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
          <p className="text-sm text-gray-600 mt-1">
            Skill-weighted decision making analysis across {data.leagueStats.totalDecisions}{' '}
            decisions
            {data.timestamp && (
              <span className="text-xs text-gray-500 ml-2">
                • Updated {new Date(data.timestamp).toLocaleString()}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={forceRefresh}
          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? '⟳' : '↻'} Refresh
        </button>
      </div>

      <StartSitEfficiency data={data} />
    </div>
  );
}
