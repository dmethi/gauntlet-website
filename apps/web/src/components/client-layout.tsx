'use client';

import { Sidebar } from '@/components/sidebar';
import { useState } from 'react';
import { SidebarTeam } from '@gauntlet/types';
import { MainContent } from '@/components/main-content';
import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    data: teams,
    isLoading,
    isError,
  } = useQuery<SidebarTeam[]>({
    // Keep the query so Team pages can use it later if needed,
    // but it's not used in Sidebar list anymore
    queryKey: ['teams'],
    enabled: !pathname.startsWith('/year-in-review'),
    queryFn: async () => {
      const res = await fetch('/api/league/teams');
      if (!res.ok) {
        throw new Error('Failed to fetch teams');
      }
      return res.json();
    },
  });

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Full-bleed prototype pages render their own chrome — skip the real shell.
  const bypassesShell =
    pathname.startsWith('/year-in-review') ||
    pathname.startsWith('/playground/identity') ||
    pathname.startsWith('/playground/war-room');

  if (bypassesShell) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        teams={teams}
        isMobileOpen={isMobileMenuOpen}
        onMobileToggle={handleMobileMenuToggle}
        isLoading={isLoading}
        isError={isError}
      />
      <MainContent onMobileMenuToggle={handleMobileMenuToggle}>{children}</MainContent>
    </div>
  );
}
