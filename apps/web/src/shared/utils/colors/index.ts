/**
 * Color utilities barrel export
 * Provides comprehensive color utilities for charts, visualization, and UI
 */

// Chart colors and theming
export {
  useChartColors,
  staticChartColors,
  getChartColor,
  getPerformanceColor,
  getPositionColor,
  assignTeamColor,
  getTeamColor,
  getTeamComparisonPalette,
  chartColorGuidelines,
} from './chart-colors';

// Diverging color scales
export { getDivergingBg } from './diverging';

// Color helpers (hex/RGB conversion, mixing)
export { hexToRgb, mixHex } from './helpers';

// Performance colors
export { getPerformanceColor as getPerformanceColorSimple } from './performance';

// Rank-based colors
export { getRankColor } from './rank-colors';

// Text color utilities
export { getTextColor, getTextColorForBg } from './text-colors';
