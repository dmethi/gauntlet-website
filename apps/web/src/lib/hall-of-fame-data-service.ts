/**
 * DEPRECATED: This file has been moved to features/hall-of-fame/hooks/useHallOfFameData.ts
 * This file is kept for backward compatibility and will be removed in a future update.
 * Please update your imports to use the new location.
 */

export * from '@/features/hall-of-fame/hooks/useHallOfFameData';
export type { EnhancedMatchup } from '@/features/hall-of-fame/utils/aggregations';

// Re-export the singleton instance for backward compatibility
import { hallOfFameDataService } from '@/features/hall-of-fame/hooks/useHallOfFameData';
export { hallOfFameDataService };
