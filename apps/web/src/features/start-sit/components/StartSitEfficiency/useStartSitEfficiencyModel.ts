import { useMemo, useState } from 'react';
import { usePlayers } from '@/lib/hooks';
import type { StartSitData } from '@/features/start-sit/types';
import { buildManagerOptions, calculateSummaryMetrics, collectPlayerIds } from './utils';

export const useStartSitEfficiencyModel = (data: StartSitData) => {
  const [selectedManagerId, setSelectedManagerId] = useState<string>(
    data.managerEfficiencies[0]?.managerId || '',
  );

  const playerIds = useMemo(() => collectPlayerIds(data), [data]);
  const { data: playersData, isLoading: playersLoading } = usePlayers(playerIds);
  const players = playersData?.players ?? {};

  const managerOptions = useMemo(
    () => buildManagerOptions(data.managerEfficiencies),
    [data.managerEfficiencies],
  );

  const summaryMetrics = useMemo(
    () => calculateSummaryMetrics(data.managerEfficiencies, data.leagueStats.totalDecisions),
    [data.managerEfficiencies, data.leagueStats.totalDecisions],
  );

  const selectedManager = useMemo(
    () => data.managerEfficiencies.find(mgr => mgr.managerId === selectedManagerId) ?? null,
    [data.managerEfficiencies, selectedManagerId],
  );

  return {
    selectedManagerId,
    setSelectedManagerId,
    managerOptions,
    players,
    playersLoading,
    summaryMetrics,
    selectedManager,
  };
};
