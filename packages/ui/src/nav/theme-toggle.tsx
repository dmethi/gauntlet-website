'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

type Props = {
  isDark: boolean;
  onToggle: () => void;
  /** Fixed-position circular button, for use over full-bleed layouts. */
  floating?: boolean;
  className?: string;
};

/**
 * Controlled, not wired to next-themes directly: this package and the host
 * app can resolve to physically distinct copies of `next-themes` in a pnpm
 * workspace, which breaks React Context identity across that boundary (the
 * app's ThemeProvider and this component's useTheme() would silently talk to
 * two different contexts). The host app owns the theme hook and passes state
 * down as props instead.
 */
export function CompactThemeToggle({ isDark, onToggle, floating, className = '' }: Props) {
  const base = floating
    ? 'fixed top-4 right-4 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-card/95 backdrop-blur-md border border-border shadow-xl text-muted-foreground hover:text-card-foreground transition-colors'
    : 'flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-card-foreground hover:bg-muted/60 transition-colors';

  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`${base} ${className}`}
    >
      {isDark ? <Sun className='w-4 h-4' /> : <Moon className='w-4 h-4' />}
    </button>
  );
}
