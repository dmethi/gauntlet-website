'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className='flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors font-avenir min-h-[44px] text-left text-muted-foreground hover:text-card-foreground hover:bg-muted'
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <>
          <Sun className='h-4 w-4 flex-shrink-0' />
          <span className='flex-1'>Switch to Light Mode</span>
        </>
      ) : (
        <>
          <Moon className='h-4 w-4 flex-shrink-0' />
          <span className='flex-1'>Switch to Dark Mode</span>
        </>
      )}
    </button>
  );
}
