/**
 * Manager View
 *
 * Manager-level waiver spending analysis and efficiency metrics
 */

'use client';

import { memo } from 'react';
import type { WaiverAnalysisData } from '../../types';
import { ManagerWaiverTable } from './ManagerWaiverTable';

interface ManagerViewProps {
  readonly data: WaiverAnalysisData;
}

export const ManagerView = memo<ManagerViewProps>(props => {
  const { data } = props;

  // Combine managers from both leagues
  const allManagers = [...data.afcTrends.managers, ...data.nfcTrends.managers];

  return (
    <div className="space-y-6">
      <ManagerWaiverTable managers={allManagers} allTransactions={data.allTransactions} />
    </div>
  );
});

ManagerView.displayName = 'ManagerView';
