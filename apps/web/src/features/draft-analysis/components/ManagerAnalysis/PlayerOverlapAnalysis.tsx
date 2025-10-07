'use client';

import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitMerge } from 'lucide-react';
import type { ManagerAnalytics } from '@/features/draft-analysis/types';

interface PlayerOverlapAnalysisProps {
  analytics: ManagerAnalytics;
}

export const PlayerOverlapAnalysis = memo<PlayerOverlapAnalysisProps>(({ analytics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitMerge className="h-5 w-5" />
          Player Overlap Analysis
        </CardTitle>
        <CardDescription>
          Cross-league player selection patterns and manager similarity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Copycat Pairs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.player_overlap_analytics.copycat_pairs.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Manager pairs with 40%+ shared players
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Overlap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.player_overlap_analytics.avg_overlap_percentage.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Mean player overlap between leagues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Maverick Managers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.player_overlap_analytics.maverick_managers.length}
              </div>
              <p className="text-xs text-muted-foreground">Managers with &lt;20% player overlap</p>
            </CardContent>
          </Card>
        </div>

        {/* Copycat Pairs */}
        {analytics.player_overlap_analytics.copycat_pairs.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-3">High Overlap Pairs (40%+ shared players)</h4>
            <div className="grid gap-2">
              {analytics.player_overlap_analytics.copycat_pairs.slice(0, 5).map((pair, idx) => (
                <div
                  key={`pair-${pair.manager_a || 'A'}-${pair.manager_b || 'B'}-${idx}`}
                  className="flex justify-between items-center p-3 rounded border"
                >
                  <div>
                    <span className="font-medium">{pair.manager_a}</span>
                    <span className="mx-2 text-muted-foreground">↔</span>
                    <span className="font-medium">{pair.manager_b}</span>
                  </div>
                  <Badge variant="secondary">{pair.overlap_percentage.toFixed(1)}% overlap</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maverick Managers */}
        {analytics.player_overlap_analytics.maverick_managers.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Maverick Managers (&lt;20% overlap)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {analytics.player_overlap_analytics.maverick_managers.map((manager, idx) => (
                <div
                  key={`maverick-${manager.manager || 'mgr'}-${idx}`}
                  className="p-3 rounded border text-center"
                >
                  <div className="font-medium">{manager.manager}</div>
                  <div className="text-sm text-muted-foreground">{manager.league}</div>
                  <Badge variant="outline" className="mt-1">
                    {manager.avg_overlap_with_others.toFixed(1)}% avg
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

PlayerOverlapAnalysis.displayName = 'PlayerOverlapAnalysis';
