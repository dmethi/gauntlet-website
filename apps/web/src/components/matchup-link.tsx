'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface MatchupLinkProps {
  matchupId: number;
  week: number;
  teamA?: {
    name: string;
    score?: number;
  };
  teamB?: {
    name: string;
    score?: number;
  };
  className?: string;
  variant?: 'compact' | 'detailed' | 'badge-only';
}

export function MatchupLink({
  matchupId,
  week,
  teamA,
  teamB,
  className = '',
  variant = 'compact',
}: MatchupLinkProps) {
  const href = `/matchup/${matchupId}?week=${week}`;

  if (variant === 'badge-only') {
    return (
      <Link href={href} className={className}>
        <Badge variant='outline' className='hover:bg-muted/50 cursor-pointer'>
          Week {week} Matchup {matchupId}
        </Badge>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className={`inline-flex items-center space-x-2 text-sm hover:text-primary hover:underline ${className}`}
      >
        <span>Week {week}</span>
        {teamA && teamB && (
          <span className='text-muted-foreground'>
            ({teamA.name} vs {teamB.name})
          </span>
        )}
      </Link>
    );
  }

  // Detailed variant
  return (
    <Link
      href={href}
      className={`block p-3 border rounded-lg hover:border-primary/50 hover:bg-muted/20 transition-colors ${className}`}
    >
      <div className='flex items-center justify-between'>
        <div>
          <h4 className='font-semibold text-sm'>
            Week {week}, Matchup {matchupId}
          </h4>
          {teamA && teamB && (
            <p className='text-xs text-muted-foreground mt-1'>
              {teamA.name} vs {teamB.name}
            </p>
          )}
        </div>
        {teamA?.score !== undefined && teamB?.score !== undefined && (
          <div className='text-right'>
            <p className='text-sm font-medium'>
              {teamA.score} - {teamB.score}
            </p>
            <p className='text-xs text-muted-foreground'>Final</p>
          </div>
        )}
      </div>
    </Link>
  );
}

interface MatchupData {
  matchupId: number;
  teams?: Array<{
    rosterId: number;
    owner?: {
      displayName?: string;
    };
    points: number;
  }>;
}

// Utility function to create matchup link props from matchup data
export function createMatchupLinkProps(matchup: MatchupData, week: number) {
  const [teamA, teamB] = matchup.teams || [];

  return {
    matchupId: matchup.matchupId,
    week,
    teamA: teamA
      ? {
          name: teamA.owner?.displayName || `Team ${teamA.rosterId}`,
          score: teamA.points,
        }
      : undefined,
    teamB: teamB
      ? {
          name: teamB.owner?.displayName || `Team ${teamB.rosterId}`,
          score: teamB.points,
        }
      : undefined,
  };
}
