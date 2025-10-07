'use client';

import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import type { PlayerOverlap } from '@/features/draft-analysis/types';

interface PlayerOverlapByCountProps {
  overlaps: PlayerOverlap[];
}

export const PlayerOverlapByCount = memo<PlayerOverlapByCountProps>(({ overlaps }) => {
  const overlapsByCount = useMemo(() => {
    const grouped: { [count: number]: PlayerOverlap[] } = {};

    overlaps.forEach(overlap => {
      const sharedCount = overlap.shared_players.length;
      if (sharedCount >= 2) {
        if (!grouped[sharedCount]) {
          grouped[sharedCount] = [];
        }
        grouped[sharedCount].push(overlap);
      }
    });

    return grouped;
  }, [overlaps]);

  const sortedCounts = useMemo(() => {
    return Object.keys(overlapsByCount)
      .map(Number)
      .sort((a, b) => b - a);
  }, [overlapsByCount]);

  if (sortedCounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Player Overlap by Count
          </CardTitle>
          <CardDescription>
            Manager pairs grouped by exact number of shared players (cross-league only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No manager pairs with 2+ shared players found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Player Overlap by Count
        </CardTitle>
        <CardDescription>
          Manager pairs grouped by exact number of shared players (cross-league only)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedCounts.map(count => (
            <div key={count}>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Badge variant="secondary">{count} Players</Badge>
                <span className="text-sm text-muted-foreground">
                  ({overlapsByCount[count].length} pair
                  {overlapsByCount[count].length !== 1 ? 's' : ''})
                </span>
              </h4>
              <div className="grid gap-3">
                {overlapsByCount[count].map((overlap, idx) => (
                  <div key={`overlap-${count}-${idx}`} className="p-4 rounded border bg-muted/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{overlap.manager_a}</span>
                        <Badge variant="outline" className="text-xs">
                          AFC
                        </Badge>
                        <span className="text-muted-foreground">↔</span>
                        <span className="font-medium">{overlap.manager_b}</span>
                        <Badge variant="outline" className="text-xs">
                          NFC
                        </Badge>
                      </div>
                      <Badge variant="secondary">
                        {overlap.overlap_percentage.toFixed(1)}% total overlap
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Shared players:</strong> {overlap.shared_player_names.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

PlayerOverlapByCount.displayName = 'PlayerOverlapByCount';
