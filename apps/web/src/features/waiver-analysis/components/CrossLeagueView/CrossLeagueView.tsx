/**
 * Cross-League View
 *
 * Main container for AFC vs NFC waiver spending comparisons
 */

'use client';

import { memo } from 'react';
import type { WaiverAnalysisData } from '../../types';
import { CentralWaiverTable } from './CentralWaiverTable';
import { PositionalSpendComparisonView } from './PositionalSpendComparison';
import { WeeklySpendChart } from './WeeklySpendChart';

interface CrossLeagueViewProps {
  readonly data: WaiverAnalysisData;
}

export const CrossLeagueView = memo<CrossLeagueViewProps>(props => {
  const { data } = props;

  return (
    <div className="space-y-6">
      {/* Central comprehensive table - main view */}
      <CentralWaiverTable data={data} />

      {/* Supporting aggregate views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PositionalSpendComparisonView comparisons={data.positionComparisons} />
        <WeeklySpendChart comparisons={data.weeklyComparisons} />
      </div>
    </div>
  );
});

CrossLeagueView.displayName = 'CrossLeagueView';
