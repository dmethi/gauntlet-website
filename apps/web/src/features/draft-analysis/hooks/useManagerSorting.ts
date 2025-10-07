import { useState, useMemo } from 'react';
import type { ManagerProfile } from '../types';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface ManagerSortingResult {
  sortConfig: SortConfig | null;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  handleSort: (key: string) => void;
  sortedProfiles: ManagerProfile[];
}

/**
 * Custom hook for sorting manager profiles
 *
 * Supports sorting by manager name, league, and various concentration metrics.
 * Default sort is by Gini coefficient (concentration) in descending order.
 *
 * @param profiles - Array of manager profiles to sort
 * @param defaultSortKey - Initial sort key (defaults to 'concentration')
 * @returns Sorted profiles and sort state management
 *
 * @example
 * ```tsx
 * const { sortConfig, handleSort, sortedProfiles } = useManagerSorting(
 *   filteredProfiles,
 *   'concentration'
 * );
 *
 * // In your component:
 * <button onClick={() => handleSort('gini')}>Sort by Gini</button>
 * ```
 */
export const useManagerSorting = (
  profiles: ManagerProfile[],
  defaultSortKey: string = 'concentration',
): ManagerSortingResult => {
  const [sortBy, setSortBy] = useState<string>(defaultSortKey);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const handleSort = (key: string): void => {
    let direction: SortDirection = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProfiles = useMemo(() => {
    const sorted = [...profiles];

    if (sortConfig) {
      sorted.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortConfig.key) {
          case 'manager':
            aValue = a.manager || 'Unknown Manager';
            bValue = b.manager || 'Unknown Manager';
            break;
          case 'league':
            aValue = a.league || '';
            bValue = b.league || '';
            break;
          case 'gini':
            aValue = a.concentration.giniSpend;
            bValue = b.concentration.giniSpend;
            break;
          case 'top1':
            aValue = a.concentration.top1_share;
            bValue = b.concentration.top1_share;
            break;
          case 'top2':
            aValue = a.concentration.top2_share;
            bValue = b.concentration.top2_share;
            break;
          case 'top3':
            aValue = a.concentration.top3_share;
            bValue = b.concentration.top3_share;
            break;
          case 'top4':
            aValue = a.concentration.top4_share;
            bValue = b.concentration.top4_share;
            break;
          case 'top5':
            aValue = a.concentration.top5_share;
            bValue = b.concentration.top5_share;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return sortConfig.direction === 'asc'
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
        }
      });
    } else {
      // Default sort by concentration (Gini) descending
      sorted.sort((a, b) => b.concentration.giniSpend - a.concentration.giniSpend);
    }

    return sorted;
  }, [profiles, sortConfig]);

  return {
    sortConfig,
    sortBy,
    setSortBy,
    handleSort,
    sortedProfiles,
  };
};
