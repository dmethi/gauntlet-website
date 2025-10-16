'use client';

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { BracketTeam as BracketTeamType } from '@/features/playoffs/types';

interface BracketTeamProps {
  team: BracketTeamType;
  score?: number;
  isWinner?: boolean;
  isEliminated?: boolean;
  isToiletBowl?: boolean;
  statusBadge?: { variant: 'default' | 'outline' | 'secondary' | 'destructive'; label: string };
}

const baseClasses =
  'flex items-center justify-between p-3 rounded-md border transition-colors bg-background';

const winnerClasses = 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
const loserClasses = 'bg-muted/50 border-muted';
const toiletAdvanceClasses = 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';

export const BracketTeam = memo(
  ({
    team,
    score,
    isWinner = false,
    isEliminated = false,
    isToiletBowl = false,
    statusBadge,
  }: BracketTeamProps) => {
    const backgroundClass = isWinner
      ? isToiletBowl
        ? toiletAdvanceClasses
        : winnerClasses
      : isEliminated
        ? loserClasses
        : 'border-muted hover:border-muted-foreground/30';

    return (
      <div className={`${baseClasses} ${backgroundClass}`}>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs font-medium">
            #{team.seed}
          </Badge>
          <span className="font-medium text-sm">{team.name}</span>
          {statusBadge && (
            <Badge variant={statusBadge.variant} className="text-xs">
              {statusBadge.label}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {score !== undefined && (
            <span className="font-mono text-sm font-medium">{score.toFixed(1)}</span>
          )}
          {team.record && (
            <span className="text-xs text-muted-foreground font-mono">{team.record}</span>
          )}
        </div>
      </div>
    );
  },
);

BracketTeam.displayName = 'BracketTeam';
