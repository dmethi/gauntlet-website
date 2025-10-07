'use client';

import React from 'react';
import { ManagerAnalysisProps } from '@/features/draft-analysis/types';
import { useManagerFiltering, useManagerSorting } from '@/features/draft-analysis/hooks';
import { ConcentrationMetricsTable } from './ConcentrationMetricsTable';
import { PlayerOverlapAnalysis } from './PlayerOverlapAnalysis';
import { PlayerOverlapByCount } from './PlayerOverlapByCount';
import { CrossLeaguePriceDiff } from './CrossLeaguePriceDiff';
import { PositionalAllocationHeatmap } from './PositionalAllocationHeatmap';
import { DetailedPerformanceMetrics } from './DetailedPerformanceMetrics';

export const ManagerAnalysis: React.FC<ManagerAnalysisProps> = ({ analytics }) => {
  // Use custom hooks for filtering and sorting
  const { filteredProfiles } = useManagerFiltering(analytics.profiles);

  const { sortConfig, sortBy, setSortBy, handleSort, sortedProfiles } = useManagerSorting(
    filteredProfiles,
    'concentration',
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Manager Behavior Profiles</h2>
        <p className="text-muted-foreground">
          Comprehensive analysis of draft strategies, spending patterns, and roster construction
        </p>
      </div>

      {/* Concentration Metrics */}
      <ConcentrationMetricsTable
        profiles={sortedProfiles}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

      {/* Player Overlap Analysis */}
      <PlayerOverlapAnalysis analytics={analytics} />

      {/* Player Overlap by Count */}
      <PlayerOverlapByCount overlaps={analytics.player_overlap_analytics.top_overlaps} />

      {/* Cross-League Price Differences */}
      <CrossLeaguePriceDiff analytics={analytics} sortConfig={sortConfig} onSort={handleSort} />

      {/* Positional Allocation Heatmap */}
      <PositionalAllocationHeatmap
        profiles={sortedProfiles}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Detailed Performance Metrics */}
      <DetailedPerformanceMetrics profiles={sortedProfiles} />
    </div>
  );
};
