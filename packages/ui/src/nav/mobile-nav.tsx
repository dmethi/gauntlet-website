'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CompactThemeToggle } from './theme-toggle';
import { isNavItemActive, type NavItem } from './types';

type Props = {
  items: NavItem[];
  /** Logomark-only trigger button content. */
  logo: React.ReactNode;
  isDark: boolean;
  onToggleTheme: () => void;
  account?: React.ReactNode;
};

/**
 * Mobile floating logomark trigger opening a tap-toggled drawer over a
 * backdrop. Never hover (doesn't exist on touch), never reserves layout
 * space — the trigger and drawer are both `fixed`.
 */
export function MobileNav({ items, logo, isDark, onToggleTheme, account }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className='md:hidden'>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        className='fixed top-4 left-4 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-card/95 backdrop-blur-md border border-border shadow-xl'
      >
        {logo}
      </button>
      <CompactThemeToggle floating isDark={isDark} onToggle={onToggleTheme} />

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
              className='fixed inset-0 z-40 bg-background/60 backdrop-blur-sm'
            />
            <motion.nav
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.215, 0.61, 0.355, 1] }}
              className='fixed top-4 left-4 z-50 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-card border border-border shadow-2xl overflow-hidden'
            >
              <div className='flex flex-col gap-1 p-2'>
                {items.map(item => {
                  const active = isNavItemActive(item, pathname);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors ${
                        active
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/60'
                      }`}
                    >
                      <Icon className='w-4 h-4 shrink-0' strokeWidth={1.75} />
                      <span>{item.label}</span>
                      {active && <span className='ml-auto w-1.5 h-1.5 rounded-full bg-primary' />}
                    </Link>
                  );
                })}
              </div>
              {account && <div className='border-t border-border p-3'>{account}</div>}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
