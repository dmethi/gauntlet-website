export const colors = {
  // Primary brand colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main brand blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49'
  },

  // Secondary colors - Fantasy football themed
  secondary: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15', // Gold/Yellow for accents
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006'
  },

  // Success colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Win green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16'
  },

  // Danger/Error colors
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Loss red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  },

  // Warning colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Warning orange
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  },

  // Neutral grays
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a'
  },

  // Fantasy position colors
  positions: {
    QB: '#8b5cf6', // Purple
    RB: '#06b6d4', // Cyan
    WR: '#10b981', // Green
    TE: '#f59e0b', // Orange
    K: '#ef4444',  // Red
    DEF: '#6b7280' // Gray
  },

  // Status colors
  status: {
    active: '#22c55e',
    injured: '#ef4444',
    questionable: '#f59e0b',
    out: '#6b7280',
    bye: '#a855f7'
  },

  // Chart colors for analytics
  charts: [
    '#0ea5e9', // Primary blue
    '#22c55e', // Success green
    '#f59e0b', // Warning orange
    '#ef4444', // Danger red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316'  // Orange
  ]
} as const;

// Semantic color mappings
export const semanticColors = {
  background: colors.neutral[50],
  foreground: colors.neutral[900],
  muted: colors.neutral[100],
  mutedForeground: colors.neutral[500],
  border: colors.neutral[200],
  input: colors.neutral[50],
  
  // Interactive states
  hover: colors.neutral[100],
  pressed: colors.neutral[200],
  focus: colors.primary[500],
  
  // Feedback
  destructive: colors.danger[500],
  constructive: colors.success[500],
  
  // Branding
  brand: colors.primary[500],
  accent: colors.secondary[400]
} as const;

export type Color = keyof typeof colors;
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950; 