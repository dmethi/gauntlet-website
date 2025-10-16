'use client';

import { memo } from 'react';
import type { BracketTeam, MatchupProps } from '@/features/playoffs/types';
import { Badge } from '@/components/ui/badge';
import { BracketTeam as BracketTeamCard } from './BracketTeam';

type InternalTeam = BracketTeam | undefined;

interface BracketMatchupProps extends MatchupProps {
  highlightPending?: boolean;
}

const renderByeCard = (team: InternalTeam, matchupLabel: string) => {
  if (!team) {
    return null;
  }

  const isForced = matchupLabel.toLowerCase().includes('forced');
  const badgeVariant = isForced ? 'destructive' : 'outline';
  const badgeLabel = isForced ? 'FORCED IN' : 'BYE WEEK';

  return (
    <div className="flex flex-col items-center space-y-3 p-4 border-2 border-dashed rounded-lg min-w-[220px] bg-muted/20">
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">
        {matchupLabel}
      </div>
      <BracketTeamCard
        team={team}
        statusBadge={{ variant: badgeVariant, label: badgeLabel }}
        isWinner={false}
        isEliminated={false}
      />
    </div>
  );
};

const resolveStatus = ({
  team,
  opponent,
  score,
  opponentScore,
  winnerId,
  isComplete,
  isToiletBowl,
}: {
  team: InternalTeam;
  opponent: InternalTeam;
  score?: number;
  opponentScore?: number;
  winnerId?: string;
  isComplete?: boolean;
  isToiletBowl?: boolean;
}) => {
  if (!team || !opponent || !isComplete || !winnerId) {
    return {
      statusBadge: undefined,
      isWinner: false,
      isEliminated: false,
    };
  }

  const isWinner = winnerId === team.id;
  const isLoser = winnerId === opponent.id;

  if (isToiletBowl) {
    // Toilet bowl: losers advance
    return {
      statusBadge: isLoser ? { variant: 'destructive' as const, label: 'ADVANCES' } : undefined,
      isWinner: isLoser,
      isEliminated: !isLoser,
    };
  }

  return {
    statusBadge: isWinner ? { variant: 'default' as const, label: 'W' } : undefined,
    isWinner,
    isEliminated: isWinner ? false : isLoser,
  };
};

export const BracketMatchup = memo<BracketMatchupProps>(
  ({
    team1,
    team2,
    matchupLabel,
    isBye = false,
    result,
    isToiletBowl = false,
    highlightPending,
  }) => {
    if (isBye) {
      const byeTeam = team1 ?? team2;
      return renderByeCard(byeTeam, matchupLabel);
    }

    const {
      statusBadge: team1Badge,
      isWinner: team1Winner,
      isEliminated: team1Eliminated,
    } = resolveStatus({
      team: team1,
      opponent: team2,
      score: result?.team1Score,
      opponentScore: result?.team2Score,
      winnerId: result?.winnerId,
      isComplete: result?.isComplete,
      isToiletBowl,
    });

    const {
      statusBadge: team2Badge,
      isWinner: team2Winner,
      isEliminated: team2Eliminated,
    } = resolveStatus({
      team: team2,
      opponent: team1,
      score: result?.team2Score,
      opponentScore: result?.team1Score,
      winnerId: result?.winnerId,
      isComplete: result?.isComplete,
      isToiletBowl,
    });

    const pendingLabel =
      highlightPending && !result?.isComplete
        ? result?.team1Score === undefined && result?.team2Score === undefined
          ? 'Game Data Missing'
          : 'Scores Pending'
        : null;

    return (
      <div className="flex flex-col items-center space-y-3 p-4 border rounded-lg bg-card min-w-[220px] shadow-sm">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">
          {matchupLabel}
          {pendingLabel && (
            <>
              <br />
              <span className="text-yellow-600 dark:text-yellow-400">{pendingLabel}</span>
            </>
          )}
        </div>
        <div className="space-y-2 w-full">
          {team1 && (
            <BracketTeamCard
              team={team1}
              score={result?.team1Score}
              isWinner={team1Winner}
              isEliminated={team1Eliminated}
              isToiletBowl={isToiletBowl}
              statusBadge={team1Badge}
            />
          )}

          {team2 && (
            <BracketTeamCard
              team={team2}
              score={result?.team2Score}
              isWinner={team2Winner}
              isEliminated={team2Eliminated}
              isToiletBowl={isToiletBowl}
              statusBadge={team2Badge}
            />
          )}

          {!team1 && !team2 && (
            <div className="px-3 py-2 text-xs text-muted-foreground text-center border rounded-md">
              Matchup TBD
            </div>
          )}
        </div>
      </div>
    );
  },
);

BracketMatchup.displayName = 'BracketMatchup';
