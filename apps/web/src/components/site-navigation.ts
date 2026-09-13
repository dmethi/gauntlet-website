import type { NavItem } from '@gauntlet/ui';
import { Archive, BarChart3, FileText, Home, Scroll, Star, Swords, Users } from 'lucide-react';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Competition', href: '/competition', icon: Home, match: 'prefix' },
  { label: 'Stats Hub', href: '/stats', icon: BarChart3, match: 'prefix' },
  { label: 'Matchups', href: '/matchups', icon: Swords, match: 'prefix' },
  { label: 'Hall of Fame', href: '/hall-of-fame-enhanced', icon: Star },
  { label: 'Managers', href: '/managers', icon: Users, match: 'prefix' },
  { label: 'Reports', href: '/competition/reports', icon: FileText, match: 'prefix' },
  { label: 'Year in Review', href: '/year-in-review', icon: Scroll },
  { label: 'Archive', href: '/archive/2025', icon: Archive, match: 'prefix' },
];
