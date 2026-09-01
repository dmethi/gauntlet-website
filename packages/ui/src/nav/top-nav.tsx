'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CompactThemeToggle } from './theme-toggle';
import { isNavItemActive, type NavItem } from './types';

type Props = {
  items: NavItem[];
  /** Logomark-only — no wordmark on the desktop bar. */
  logo: React.ReactNode;
  isDark: boolean;
  onToggleTheme: () => void;
  account?: React.ReactNode;
};

/** Desktop sticky top nav: icon+label tabs, crimson active-state underline. Hidden below md. */
export function TopNav({ items, logo, isDark, onToggleTheme, account }: Props) {
  const pathname = usePathname();

  return (
    <div className='hidden md:flex sticky top-0 z-40 items-center justify-between px-6 py-3 border-b border-border bg-card/90 backdrop-blur-md'>
      <div className='flex items-center gap-8'>
        {logo}
        <nav className='flex items-center gap-6'>
          {items.map(item => {
            const active = isNavItemActive(item, pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest pb-1 border-b-2 transition-colors ${
                  active
                    ? 'text-foreground border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                <Icon className='w-3.5 h-3.5' strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className='flex items-center gap-3'>
        {account}
        <CompactThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>
    </div>
  );
}
