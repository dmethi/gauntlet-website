import type { ComponentType } from 'react';

export type NavIcon = ComponentType<{ className?: string; strokeWidth?: string | number }>;

export type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
  /** 'prefix' matches any route under href (e.g. /archive/2025/*); default 'exact'. */
  match?: 'exact' | 'prefix';
};

export const isNavItemActive = (item: NavItem, pathname: string): boolean =>
  item.match === 'prefix' ? pathname.startsWith(item.href) : pathname === item.href;
