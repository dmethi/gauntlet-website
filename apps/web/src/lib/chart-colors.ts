'use client';

import { useTheme } from 'next-themes';
import { useMemo } from 'react';

/**
 * Theme-aware chart colors hook
 * Provides consistent, accessible colors that adapt to light/dark mode
 */
export function useChartColors() {
  const { theme } = useTheme();

  return useMemo(() => {
    const isDark = theme === 'dark';

    return {
      // Primary data series (uses theme-aware chart variables)
      primary: 'hsl(var(--chart-1))',
      secondary: 'hsl(var(--chart-2))',
      tertiary: 'hsl(var(--chart-3))',
      quaternary: 'hsl(var(--chart-4))',
      quinary: 'hsl(var(--chart-5))',

      // Common chart elements
      opponent: isDark ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))',
      leagueAverage: isDark ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))',

      // Chart infrastructure
      grid: isDark ? 'hsl(var(--border))' : 'hsl(var(--border))',
      axis: isDark ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))',

      // Status colors (consistent across themes)
      success: 'hsl(142 76% 36%)', // Green
      warning: 'hsl(32 95% 44%)', // Orange
      error: 'hsl(var(--destructive))',

      // Luck/performance indicators
      luck: 'hsl(var(--chart-2))', // Teal/green from chart palette
      performance: 'hsl(var(--chart-1))', // Primary chart color

      // Team vs opponent comparisons
      team: 'hsl(var(--primary))', // Brand crimson
      opponentBar: isDark ? 'hsl(var(--muted))' : 'hsl(var(--foreground))',
      leagueAverageBar: isDark ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted))',
    };
  }, [theme]);
}

/**
 * Static chart colors for cases where hooks can't be used
 * Fallback to CSS variables that work in both themes
 */
export const staticChartColors = {
  primary: 'hsl(var(--chart-1))',
  secondary: 'hsl(var(--chart-2))',
  tertiary: 'hsl(var(--chart-3))',
  opponent: 'hsl(var(--muted-foreground))',
  leagueAverage: 'hsl(var(--muted-foreground))',
  grid: 'hsl(var(--border))',
  team: 'hsl(var(--primary))',
} as const;

/**
 * Chart color getter for non-React contexts
 */
export function getChartColor(colorKey: keyof typeof staticChartColors): string {
  return staticChartColors[colorKey];
}
