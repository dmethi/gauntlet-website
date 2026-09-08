'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { AppNav } from '@gauntlet/ui';
import { GauntletLogo } from '@/components/gauntlet-logo';
import { AccountControls } from '@/components/account-controls';
import { NAV_ITEMS } from '@/components/site-navigation';

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
        account={<AccountControls />}
      />
      <main className="min-w-0 w-full">
        {/* Extra top padding on mobile clears the floating nav trigger. */}
        <div className="pt-20 px-4 pb-4 md:pt-6 md:px-6 md:pb-6 min-w-0 w-full">{children}</div>
      </main>
    </div>
  );
}
