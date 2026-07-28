'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { AppNav, type NavItem } from '@gauntlet/ui';
import { Archive, BarChart3, ClipboardList, Home, Scroll, Star, Swords } from 'lucide-react';
import { GauntletLogo } from '@/components/gauntlet-logo';

const NAV_ITEMS: NavItem[] = [
  { label: 'Competition', href: '/competition', icon: Home, match: 'prefix' },
  { label: 'Stats Hub', href: '/stats', icon: BarChart3, match: 'prefix' },
  { label: 'Matchups', href: '/matchups', icon: Swords, match: 'prefix' },
  { label: 'Hall of Fame', href: '/hall-of-fame-enhanced', icon: Star },
  { label: 'Draft Analysis', href: '/draft/analysis', icon: ClipboardList },
  { label: 'Year in Review', href: '/year-in-review', icon: Scroll },
  { label: 'Archive', href: '/archive/2025', icon: Archive, match: 'prefix' },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  // `useTheme()` reads localStorage/system preference synchronously on the
  // client's very first render (for no-flash correctness), so it can already
  // disagree with the server's render before hydration even starts. Gating on
  // `mounted` keeps the first client paint identical to the server (both
  // render the light/moon icon) and only swaps to the real theme after
  // hydration completes, avoiding a hydration-mismatch on the toggle icon.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === 'dark';

  // Full-bleed prototype/standalone pages render their own chrome — skip the real shell.
  const bypassesShell =
    pathname.startsWith('/year-in-review') || pathname.startsWith('/playground');

  if (bypassesShell) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav
        items={NAV_ITEMS}
        logo={<GauntletLogo size="sm" />}
        isDark={isDark}
        onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
      />
      <main className="min-w-0 w-full">
        {/* Extra top padding on mobile clears the floating nav trigger. */}
        <div className="pt-20 px-4 pb-4 md:pt-6 md:px-6 md:pb-6 min-w-0 w-full">{children}</div>
      </main>
    </div>
  );
}
