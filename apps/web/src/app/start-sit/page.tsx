'use client';

import { useEffect, useState } from 'react';
import { StartSitEfficiency } from '@/features/start-sit/components/StartSitEfficiency';
import { Card, CardContent } from '@/components/ui/card';
import { GauntletLogo } from '@/components/gauntlet-logo';
import { PageHeaderHero, WarRoomLoader } from '@gauntlet/ui';
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
        className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90 transition-opacity"
      >
        Retry Analysis
      </button>
    </CardContent>
  </Card>
);

const LoadingScreen = () => (
  <div className="max-w-7xl mx-auto">
    <PageHeaderHero title="Start/Sit Efficiency" crestSrc="/gauntlet_logo.svg" />
    <WarRoomLoader show logo={<GauntletLogo size="lg" />} />

    <div className="px-6 py-8 max-w-md mx-auto text-center space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4 text-sm text-muted-foreground">
          <p>Analyzing start/sit decisions...</p>
          <div className="text-xs bg-muted/40 p-3 rounded text-left">
            <strong className="text-foreground">What we&apos;re analyzing:</strong>
            <br />
            • Your start/sit decisions across all positions
            <br />
            • Available alternatives (bench + waiver wire)
            <br />
            • Position-weighted skill assessment
            <br />• Points gained/lost vs league median
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">This usually takes 15-30 seconds...</p>
    </div>
  </div>
);

export default function StartSitPage() {
  const [data, setData] = useState<StartSitData | null>(null);
  const [loading, setLoading] = useState(true);
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
    fetchData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage error={error} onRetry={fetchData} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Data Available</h2>
          <p className="text-muted-foreground mt-2">Unable to load start/sit efficiency data</p>
          <button
            onClick={fetchData}
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={forceRefresh}
          className="bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm hover:opacity-90 transition-opacity shadow-lg"
          disabled={loading}
        >
          {loading ? '⟳' : '↻'} Refresh
        </button>
      </div>

      <StartSitEfficiency data={data} />
    </div>
  );
}
