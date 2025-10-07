import { useState, useMemo } from 'react';
import type { ManagerProfile } from '../types';

export interface ManagerFilterOptions {
  cluster?: string;
}

export interface ManagerFilteringResult {
  selectedCluster: string;
  setSelectedCluster: (cluster: string) => void;
  filteredProfiles: ManagerProfile[];
}

/**
 * Custom hook for filtering manager profiles by cluster
 *
 * @param profiles - Array of manager profiles to filter
 * @param options - Filter options with optional default cluster
 * @returns Filtered profiles and filter state management
 *
 * @example
 * ```tsx
 * const { selectedCluster, setSelectedCluster, filteredProfiles } = useManagerFiltering(
 *   analytics.profiles,
 *   { cluster: 'all' }
 * );
 * ```
 */
export const useManagerFiltering = (
  profiles: ManagerProfile[],
  options: ManagerFilterOptions = {},
): ManagerFilteringResult => {
  const [selectedCluster, setSelectedCluster] = useState<string>(options.cluster || 'all');

  const filteredProfiles = useMemo(() => {
    if (selectedCluster === 'all') return profiles;
    return profiles.filter(p => p.cluster.cluster_label === selectedCluster);
  }, [profiles, selectedCluster]);

  return {
    selectedCluster,
    setSelectedCluster,
    filteredProfiles,
  };
};
