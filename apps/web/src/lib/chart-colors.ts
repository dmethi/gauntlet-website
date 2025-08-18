'use client';

import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import { colors } from './colors';
import teamColorData from '../../data/team-colors.json';

/**
 * Enhanced theme-aware chart colors hook
 * Provides consistent, accessible colors that adapt to light/dark mode
 * Integrates brand colors and optimized for fantasy football contexts
 */
export function useChartColors() {
  const { theme } = useTheme();

  return useMemo(() => {
    const isDark = theme === 'dark';

    return {
      // 🎨 Primary data series - optimized for readability first, brand second
      primary: isDark ? '#ef4444' : '#dc2626', // High-contrast red for main data
      secondary: isDark ? '#3b82f6' : '#2563eb', // High-contrast blue for secondary
      tertiary: isDark ? '#10b981' : '#059669', // High-contrast emerald
      quaternary: isDark ? '#f59e0b' : '#d97706', // High-contrast amber
      quinary: isDark ? '#8b5cf6' : '#7c3aed', // High-contrast purple

      // 🏈 Fantasy Football Specific Colors (brand for context, not comparison)
      userTeam: colors.core.crimsonRed, // User's team gets brand color for identification
      opponent: isDark ? '#64748b' : '#475569', // Dark slate for opponent
      leagueAverage: isDark ? '#9ca3af' : '#6b7280', // Light gray for league average (neutral but distinct)

      // 🎯 Performance & Analytics Colors
      performance: {
        excellent: isDark ? colors.teamCategorical[4] : '#10b981', // Emerald for great performance
        good: isDark ? colors.teamCategorical[3] : '#22c55e', // Green for good performance
        average: isDark ? colors.teamCategorical[2] : '#f59e0b', // Amber for average
        poor: isDark ? colors.teamCategorical[1] : '#f97316', // Orange for poor
        terrible: isDark ? colors.core.battleRed : colors.core.crimsonRed, // Red for terrible
      },

      // 🍀 Luck & Variance Indicators
      luck: {
        lucky: isDark ? '#22c55e' : '#16a34a', // Green for positive luck
        unlucky: isDark ? '#ef4444' : colors.core.battleRed, // Red for negative luck
        neutral: isDark ? '#6b7280' : '#9ca3af', // Gray for neutral luck
      },

      // 🔢 Neutral Chart Elements (not part of team palette)
      luckRating: isDark ? '#94a3b8' : '#64748b', // Neutral slate for luck rating line

      // 🎨 Brand UI Elements (not for data, for chart infrastructure)
      brandPrimary: colors.core.crimsonRed, // Use for tooltips, highlights, accent elements
      brandSecondary: colors.core.regalGold, // Use for secondary UI elements

      // 📊 Chart Infrastructure (brand-integrated UI)
      grid: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)', // Subtle grid
      axis: isDark ? '#94a3b8' : '#64748b', // Readable axis text
      axisLabel: isDark ? '#cbd5e1' : '#475569', // Axis labels
      tooltip: {
        background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(248, 250, 252, 0.95)',
        border: colors.core.crimsonRed, // Brand color for tooltip borders
        text: isDark ? '#cbd5e1' : '#475569',
      },

      // 🏆 Status & Feedback Colors (accessibility optimized)
      success: isDark ? '#22c55e' : '#16a34a', // WCAG AA compliant green
      warning: isDark ? '#f59e0b' : '#d97706', // WCAG AA compliant amber
      error: isDark ? '#ef4444' : colors.core.battleRed, // WCAG AA compliant red
      info: isDark ? '#3b82f6' : '#2563eb', // WCAG AA compliant blue

      // 🎭 Team Comparison Colors (optimized for maximum differentiation)
      teamComparison: isDark
        ? [
            '#ef4444', // Bright red
            '#3b82f6', // Bright blue
            '#10b981', // Emerald green
            '#f59e0b', // Amber
            '#8b5cf6', // Purple
            '#06b6d4', // Cyan
            '#ec4899', // Pink
            '#f97316', // Orange
            '#22c55e', // Light green
            '#6366f1', // Indigo
            '#d946ef', // Fuchsia
            '#f43f5e', // Rose
          ]
        : [
            '#dc2626', // Dark red
            '#2563eb', // Dark blue
            '#059669', // Dark emerald
            '#d97706', // Dark amber
            '#7c3aed', // Dark purple
            '#0891b2', // Dark cyan
            '#be185d', // Dark pink
            '#ea580c', // Dark orange
            '#16a34a', // Dark green
            '#4f46e5', // Dark indigo
            '#c026d3', // Dark fuchsia
            '#e11d48', // Dark rose
          ],

      // 📈 Sequential Scales for Data Ranges
      sequential: {
        performance: isDark
          ? ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c']
          : colors.sequential.reds.slice(1), // Skip lightest shade for better contrast

        intensity: isDark
          ? ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9']
          : colors.sequential.neutrals.slice(1, -1), // Skip extremes
      },

      // 🔄 Diverging Scale (bad ← neutral → good)
      diverging: {
        negative: isDark ? '#ef4444' : colors.core.crimsonRed,
        neutral: isDark ? '#64748b' : '#e5e7eb',
        positive: isDark ? '#22c55e' : colors.diverging.positive,
      },

      // 🏟️ Position-specific colors for fantasy football
      positions: {
        qb: isDark ? '#8b5cf6' : '#7c3aed', // Purple for QB
        rb: isDark ? '#10b981' : '#059669', // Green for RB
        wr: isDark ? '#3b82f6' : '#2563eb', // Blue for WR
        te: isDark ? '#f59e0b' : '#d97706', // Amber for TE
        def: isDark ? '#ef4444' : colors.core.battleRed, // Red for DEF
        k: isDark ? '#6b7280' : '#4b5563', // Gray for K
      },

      // 🎪 Special Chart Types
      heatmap: {
        low: isDark ? '#1e293b' : '#f8fafc',
        medium: isDark ? colors.core.regalGold : colors.core.warmGold,
        high: isDark ? colors.core.battleRed : colors.core.crimsonRed,
      },

      // 📊 Background & Surface Colors
      background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)',
      surface: isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)',
    };
  }, [theme]);
}

/**
 * Static chart colors for cases where hooks can't be used
 * Uses CSS variables that work in both themes with brand integration
 */
export const staticChartColors = {
  // Primary data series
  primary: 'hsl(var(--chart-1))',
  secondary: 'hsl(var(--chart-2))',
  tertiary: 'hsl(var(--chart-3))',
  quaternary: 'hsl(var(--chart-4))',
  quinary: 'hsl(var(--chart-5))',

  // Core semantic colors
  team: 'hsl(var(--primary))', // Brand crimson
  opponent: 'hsl(var(--muted-foreground))',
  leagueAverage: 'hsl(var(--muted-foreground))',

  // Infrastructure
  grid: 'hsl(var(--border))',
  axis: 'hsl(var(--muted-foreground))',
  background: 'hsl(var(--background))',

  // Status colors
  success: 'hsl(142 76% 36%)',
  warning: 'hsl(32 95% 44%)',
  error: 'hsl(var(--destructive))',
} as const;

/**
 * Chart color getter for non-React contexts
 */
export function getChartColor(colorKey: keyof typeof staticChartColors): string {
  return staticChartColors[colorKey];
}

/**
 * Generate performance color based on value and context
 */
export function getPerformanceColor(
  value: number,
  context: 'points' | 'luck' | 'percentage' = 'points',
  theme: 'light' | 'dark' = 'light'
): string {
  const isDark = theme === 'dark';

  switch (context) {
    case 'points':
      if (value >= 130) return isDark ? '#22c55e' : '#16a34a'; // Excellent
      if (value >= 110) return isDark ? '#22c55e' : '#22c55e'; // Good
      if (value >= 90) return isDark ? '#f59e0b' : '#f59e0b'; // Average
      if (value >= 70) return isDark ? '#f97316' : '#f97316'; // Poor
      return isDark ? colors.core.battleRed : colors.core.crimsonRed; // Terrible

    case 'luck':
      if (value > 0.2) return isDark ? '#22c55e' : '#16a34a'; // Lucky
      if (value < -0.2) return isDark ? '#ef4444' : colors.core.battleRed; // Unlucky
      return isDark ? '#6b7280' : '#9ca3af'; // Neutral

    case 'percentage':
      if (value >= 0.8) return isDark ? '#22c55e' : '#16a34a'; // Excellent
      if (value >= 0.6) return isDark ? '#22c55e' : '#22c55e'; // Good
      if (value >= 0.4) return isDark ? '#f59e0b' : '#f59e0b'; // Average
      if (value >= 0.2) return isDark ? '#f97316' : '#f97316'; // Poor
      return isDark ? colors.core.battleRed : colors.core.crimsonRed; // Terrible

    default:
      return isDark ? '#6b7280' : '#9ca3af';
  }
}

/**
 * Get position-specific color for fantasy football positions
 */
export function getPositionColor(position: string, theme: 'light' | 'dark' = 'light'): string {
  const isDark = theme === 'dark';
  const pos = position.toLowerCase();

  switch (pos) {
    case 'qb':
      return isDark ? '#8b5cf6' : '#7c3aed'; // Purple
    case 'rb':
      return isDark ? '#10b981' : '#059669'; // Green
    case 'wr':
      return isDark ? '#3b82f6' : '#2563eb'; // Blue
    case 'te':
      return isDark ? '#f59e0b' : '#d97706'; // Amber
    case 'def':
    case 'dst':
      return isDark ? '#ef4444' : colors.core.battleRed; // Red
    case 'k':
      return isDark ? '#6b7280' : '#4b5563'; // Gray
    default:
      return isDark ? '#6b7280' : '#9ca3af'; // Default gray
  }
}

/**
 * Team color assignment system - uses explicit JSON mapping for guaranteed unique colors
 */
export function assignTeamColor(teamId: string): number {
  // Try to get from explicit mapping first
  const assignedColor =
    teamColorData.teamColorAssignments[teamId as keyof typeof teamColorData.teamColorAssignments];

  if (assignedColor !== undefined) {
    return assignedColor;
  }

  // Fallback: simple hash for teams not in mapping (new teams, etc.)
  let hash = 0;
  for (let i = 0; i < teamId.length; i++) {
    const char = teamId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 14;
}

export function getTeamColor(teamId: string, theme: 'light' | 'dark' = 'light'): string {
  const isDark = theme === 'dark';
  const colorIndex = assignTeamColor(teamId);

  // Use colors from the JSON data for consistency
  const colorData = teamColorData.colorPalette.colors[colorIndex];
  return isDark ? colorData.dark : colorData.light;
}

// Team colors are now managed via static JSON mapping, no clearing needed

/**
 * Generate team comparison palette (optimized for high contrast differentiation)
 */
export function getTeamComparisonPalette(theme: 'light' | 'dark' = 'light'): string[] {
  // Use the same 14 colors from JSON data for consistency
  return Array.from({ length: 14 }, (_, i) => {
    const colorData = teamColorData.colorPalette.colors[i];
    return theme === 'dark' ? colorData.dark : colorData.light;
  });
}

/**
 * Chart color documentation and usage guidelines
 */
export const chartColorGuidelines = {
  usage: {
    primary: 'Use for single data series, non-comparative charts',
    secondary: 'Use for secondary data in non-comparative contexts',
    teamComparison:
      'Use getTeamColor() for team vs team comparisons - ensures consistent assignment',
    brandPrimary: 'Use for UI elements: tooltip borders, highlights, accents',
    brandSecondary: 'Use for secondary UI elements, labels, decorative accents',
    userTeam: 'Use only for user team identification (not comparisons)',
    performance: 'Use for performance metrics, scoring data, efficiency ratings',
    luck: 'Use for luck-based metrics, variance indicators, randomness',
    positions: 'Use for fantasy position-specific data and breakdowns',
  },

  bestPractices: {
    teamComparisons: 'Always use getTeamColor() for consistency across charts',
    dataVsUI: 'Use high-contrast colors for data, brand colors for UI elements',
    accessibility: 'All colors meet WCAG AA standards (4.5:1 ratio minimum)',
    patterns: 'Use patterns/shapes in addition to color for critical distinctions',
  },

  examples: {
    'Single metric line': 'primary or secondary',
    'Team vs team comparison': 'getTeamColor(teamId, theme) for each team',
    'Performance heatmap': 'performance.excellent → performance.terrible',
    'Tooltip styling': 'brandPrimary for borders, tooltip.background for fill',
    'User team highlight': 'userTeam (brand crimson for recognition)',
    'Position breakdown pie': 'positions.qb, positions.rb, etc.',
  },

  antiPatterns: {
    'Brand colors for data comparison': 'Crimson vs gold is hard to distinguish',
    'Hardcoded team colors': 'Use getTeamColor() instead for consistency',
    'Too many brand accents': 'Limit brand colors to UI elements, not all data',
  },
} as const;
