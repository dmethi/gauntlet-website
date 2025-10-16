'use client';

import { memo } from 'react';
import type { MatchupOddsPreviewProps } from '../../types';
import { useMatchupOdds } from '../../hooks/useMatchupOdds';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { OddsHeader } from './OddsHeader';
import { WinProbabilitiesDisplay } from './WinProbabilitiesDisplay';
import { BettingLinesDisplay } from './BettingLinesDisplay';

/**
 * Matchup odds preview component showing win probabilities and betting lines
 *
 * Displays real-time simulation data including:
 * - Win probabilities for both teams
 * - Implied moneyline odds
 * - Point spread
 * - Over/under total
 *
 * @example
 * ```tsx
 * <MatchupOddsPreview
 *   leagueId="12345"
 *   week={5}
 *   matchupId={1}
 *   teamAName="Chiefs"
 *   teamBName="Bills"
 * />
 * ```
 */
export const MatchupOddsPreview = memo<MatchupOddsPreviewProps>(props => {
  const { leagueId, week, matchupId, teamAName, teamBName, className = '' } = props;

  const { oddsData, loading, error } = useMatchupOdds({
    leagueId,
    week,
    matchupId,
  });

  if (loading) {
    return <LoadingState className={className} />;
  }

  if (error || !oddsData) {
    return <ErrorState className={className} />;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <OddsHeader />

      <WinProbabilitiesDisplay
        team1Name={teamAName}
        team1WinPct={oddsData.team1WinPct}
        team1MoneyLine={oddsData.impliedOdds.team1MoneyLine}
        team2Name={teamBName}
        team2WinPct={oddsData.team2WinPct}
        team2MoneyLine={oddsData.impliedOdds.team2MoneyLine}
      />

      <BettingLinesDisplay
        spread={oddsData.impliedOdds.spread}
        total={oddsData.impliedOdds.total}
        team1Name={teamAName}
        team2Name={teamBName}
      />
    </div>
  );
});

MatchupOddsPreview.displayName = 'MatchupOddsPreview';
