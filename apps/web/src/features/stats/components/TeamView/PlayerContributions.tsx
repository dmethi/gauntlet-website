import { memo, useMemo } from 'react';
import { PlayerBreakdownRow } from '@/components/stats/PlayerBreakdown';
import type { PlayerContributionGroup } from './utils';
import type { TrackedPosition } from '@/shared/utils/stats';

interface PlayerContributionsProps {
  position: TrackedPosition;
  contributions: PlayerContributionGroup[];
}

export const PlayerContributions = memo(({ position, contributions }: PlayerContributionsProps) => {
  const groupedByWeek = useMemo(() => {
    const grouped = new Map<number, PlayerContributionGroup['players']>();

    for (const group of contributions) {
      const existing = grouped.get(group.week) || [];
      grouped.set(group.week, existing.concat(group.players));
    }

    return Array.from(grouped.entries()).sort(([a], [b]) => a - b);
  }, [contributions]);

  if (groupedByWeek.length === 0) {
    return (
      <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
        No player contributions logged for this position.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groupedByWeek.map(([week, players]) => (
        <div key={week} className="rounded-md border">
          <div className="border-b bg-muted/40 px-3 py-2 text-sm font-semibold">
            Week {week} · Player Contributions
          </div>
          <PlayerBreakdownRow players={players} position={position} />
        </div>
      ))}
    </div>
  );
});

PlayerContributions.displayName = 'PlayerContributions';
