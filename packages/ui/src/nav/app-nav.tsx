'use client';

import * as React from 'react';
import { TopNav } from './top-nav';
import { MobileNav } from './mobile-nav';
import type { NavItem } from './types';

type Props = {
  items: NavItem[];
  logo: React.ReactNode;
  isDark: boolean;
  onToggleTheme: () => void;
};

/** Renders the desktop sticky top nav and the mobile floating drawer nav together. */
export function AppNav({ items, logo, isDark, onToggleTheme }: Props) {
  return (
    <>
      <TopNav items={items} logo={logo} isDark={isDark} onToggleTheme={onToggleTheme} />
      <MobileNav items={items} logo={logo} isDark={isDark} onToggleTheme={onToggleTheme} />
    </>
  );
}
