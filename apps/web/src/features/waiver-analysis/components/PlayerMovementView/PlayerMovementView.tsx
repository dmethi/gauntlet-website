/**
 * Player Movement View
 *
 * Analysis of player transaction volumes and ownership changes
 */

'use client';

import { memo } from 'react';
import type { WaiverAnalysisData } from '../../types';
import { TopMoversTable } from './TopMoversTable';

interface PlayerMovementViewProps {
  readonly data: WaiverAnalysisData;
}

export const PlayerMovementView = memo<PlayerMovementViewProps>(props => {
  const { data } = props;

  return (
    <div className="space-y-6">
      <TopMoversTable
        topMovers={data.topMovers}
        leagueMovers={data.leagueTrends.map(league => ({
          leagueId: league.leagueId,
          leagueName: league.leagueName,
          players: data.topMoversByLeague[league.leagueId] ?? [],
        }))}
      />
    </div>
  );
});

PlayerMovementView.displayName = 'PlayerMovementView';
