'use client';

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';

export const BracketLegend = memo(() => {
  return (
    <div className="grid gap-4 rounded-lg border bg-card p-4 text-xs text-muted-foreground md:grid-cols-2">
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground">Legend</h4>
        <div className="flex items-center space-x-2">
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            W
          </Badge>
          <span>Winner advances (Championship bracket)</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="destructive">ADVANCES</Badge>
          <span>Loser advances (Toilet Bowl bracket)</span>
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground">Reading Scores</h4>
        <p>
          Scores are displayed when available. Pending matchups show <strong>TBD</strong>; missing
          data displays <strong>--</strong>.
        </p>
      </div>
    </div>
  );
});

BracketLegend.displayName = 'BracketLegend';
