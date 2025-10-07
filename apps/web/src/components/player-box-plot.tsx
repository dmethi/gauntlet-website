'use client';

import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PlayerDistribution {
  p10: number;
  p25?: number; // Optional since simulation doesn't always provide it
  median: number;
  p75?: number; // Optional since simulation doesn't always provide it
  p90: number;
  mean: number;
  sampleSize: number;
  dataSource: 'player' | 'position' | 'synthetic';
}

interface PlayerBoxPlotProps {
  playerId: string;
  position: string;
  projection: number;
  className?: string;
  width?: number;
  height?: number;
  maxProjection?: number; // Max projection across all players in matchup for scaling
  distribution?: PlayerDistribution; // Optional: pass distribution data directly
}

export function PlayerBoxPlot({
  playerId,
  position,
  projection,
  className = '',
  width = 140,
  height = 32,
  maxProjection = 30, // Default fallback, should be passed from parent
  distribution: providedDistribution,
}: PlayerBoxPlotProps) {
  const [distribution, setDistribution] = useState<PlayerDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If distribution is provided as prop, use it directly
    if (providedDistribution) {
      setDistribution(providedDistribution);
      setLoading(false);
      setError(null);
      return;
    }

    // Otherwise, try to fetch it (fallback for backward compatibility)
    async function fetchPlayerDistribution() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/player/${playerId}/distribution?position=${position}&projection=${projection}`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch player distribution');
        }

        const data = await response.json();
        setDistribution(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load distribution');
        console.error('Player distribution error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayerDistribution();
  }, [playerId, position, projection, providedDistribution]);

  if (loading) {
    return <Skeleton className={`${className}`} style={{ width, height }} />;
  }

  if (error || !distribution) {
    return (
      <div
        className={`${className} flex items-center justify-center text-xs text-muted-foreground`}
        style={{ width, height }}
      >
        No data
      </div>
    );
  }

  // New scaling system: 0 points at 30%, maxProjection at 100%
  const zeroPosition = 30; // 30% from left
  const scale = (100 - zeroPosition) / maxProjection; // Scale remaining 70% to maxProjection

  // Helper function to convert value to percentage position
  const valueToPercent = (value: number) => {
    if (value <= 0) return zeroPosition;
    return Math.min(zeroPosition + value * scale, 100);
  };

  // Calculate positions as percentages with safety checks
  const p10Percent = valueToPercent(distribution.p10 ?? 0);
  const p25Percent = valueToPercent(
    distribution.p25 ??
      (distribution.p10 && distribution.median ? (distribution.p10 + distribution.median) / 2 : 0),
  );
  const medianPercent = valueToPercent(distribution.median ?? 0);
  const p75Percent = valueToPercent(
    distribution.p75 ??
      (distribution.median && distribution.p90 ? (distribution.median + distribution.p90) / 2 : 0),
  );
  const p90Percent = valueToPercent(distribution.p90 ?? 0);
  const meanPercent = valueToPercent(distribution.mean ?? 0);
  const projectionPercent = valueToPercent(projection);

  // Enhanced data source colors
  const getDataSourceColor = (source: string) => {
    switch (source) {
      case 'player':
        return 'rgb(16, 185, 129)'; // Emerald - real player data
      case 'position':
        return 'rgb(99, 102, 241)'; // Indigo - position data
      case 'synthetic':
        return 'rgb(107, 114, 128)'; // Gray - synthetic data
      default:
        return 'rgb(107, 114, 128)';
    }
  };

  const sourceColor = getDataSourceColor(distribution.dataSource);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`${className} cursor-help relative`} style={{ width, height }}>
            {/* Background container - flattened and centered */}
            <div className="w-full h-full bg-muted/20 rounded-md relative overflow-hidden flex items-center">
              {/* Container for the actual plot, centered vertically */}
              <div className="relative w-full h-4">
                {/* Zero line (at 30%) */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-muted-foreground/30"
                  style={{ left: `${zeroPosition}%` }}
                />

                {/* Whisker line (P10-P90) */}
                <div
                  className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded"
                  style={{
                    left: `${p10Percent}%`,
                    width: `${p90Percent - p10Percent}%`,
                    backgroundColor: sourceColor,
                    opacity: 0.7,
                  }}
                />

                {/* Left whisker cap (P10) */}
                <div
                  className="absolute top-1/2 w-0.5 h-3 -translate-y-1/2 rounded"
                  style={{
                    left: `${p10Percent}%`,
                    backgroundColor: sourceColor,
                  }}
                />

                {/* Right whisker cap (P90) */}
                <div
                  className="absolute top-1/2 w-0.5 h-3 -translate-y-1/2 rounded"
                  style={{
                    left: `${p90Percent}%`,
                    backgroundColor: sourceColor,
                  }}
                />

                {/* IQR Box (P25-P75) */}
                <div
                  className="absolute top-1/2 h-4 -translate-y-1/2 rounded border-2"
                  style={{
                    left: `${p25Percent}%`,
                    width: `${p75Percent - p25Percent}%`,
                    backgroundColor: sourceColor,
                    opacity: 0.25,
                    borderColor: sourceColor,
                  }}
                />

                {/* Median line */}
                <div
                  className="absolute top-1/2 w-1 h-4 -translate-y-1/2 rounded"
                  style={{
                    left: `${medianPercent}%`,
                    backgroundColor: sourceColor,
                  }}
                />

                {/* Projection marker */}
                <div
                  className="absolute top-1/2 w-1.5 h-1.5 -translate-y-1/2 -translate-x-1/2 rounded-full border border-white"
                  style={{
                    left: `${projectionPercent}%`,
                    backgroundColor: 'rgb(239, 68, 68)',
                  }}
                />
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1 text-xs">
            <div className="font-medium">
              {distribution.dataSource === 'player'
                ? 'Player-Specific Data'
                : distribution.dataSource === 'position'
                  ? 'Position Average'
                  : 'Estimated Range'}
            </div>
            <div className="text-foreground/70 text-xs mb-2">
              📊 Scaled: 0 pts at 30%, max {maxProjection.toFixed(0)} pts at 100%
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div>P10: {distribution.p10?.toFixed(1) ?? 'N/A'} pts</div>
              <div>P90: {distribution.p90?.toFixed(1) ?? 'N/A'} pts</div>
              <div>
                Q1:{' '}
                {(
                  distribution.p25 ??
                  (distribution.p10 && distribution.median
                    ? (distribution.p10 + distribution.median) / 2
                    : null)
                )?.toFixed(1) ?? 'N/A'}{' '}
                pts
              </div>
              <div>
                Q3:{' '}
                {(
                  distribution.p75 ??
                  (distribution.median && distribution.p90
                    ? (distribution.median + distribution.p90) / 2
                    : null)
                )?.toFixed(1) ?? 'N/A'}{' '}
                pts
              </div>
              <div>Median: {distribution.median?.toFixed(1) ?? 'N/A'} pts</div>
              <div>Mean: {distribution.mean?.toFixed(1) ?? 'N/A'} pts</div>
            </div>
            <div className="pt-1 border-t border-muted">
              <div>🎯 This week: {projection.toFixed(1)} pts</div>
              <div className="text-foreground/70">📊 Based on: {distribution.sampleSize} games</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
